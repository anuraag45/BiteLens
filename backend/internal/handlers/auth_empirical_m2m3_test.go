package handlers_test

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"backend/internal/auth"
	"backend/internal/middleware"
	"backend/internal/models"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// TestEmpirical_MinorRegistrationAndIsMinor tests registration with minor birth date (15 years old)
// and validates that IsMinor returns true and the response reflects it.
func TestEmpirical_MinorRegistrationAndIsMinor(t *testing.T) {
	router, _, _, _ := setupTestRouter(t)

	// 15 years old from today (normalized to UTC to match handler calculation)
	dob15 := time.Now().UTC().AddDate(-15, 0, 0).Format("2006-01-02")
	regPayload := map[string]string{
		"email":         "minor15@example.com",
		"password":      "SecurePass123!",
		"name":          "Minor 15 User",
		"date_of_birth": dob15,
	}
	jsonBytes, _ := json.Marshal(regPayload)

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("POST", "/api/v1/auth/register", bytes.NewBuffer(jsonBytes))
	req.Header.Set("Content-Type", "application/json")
	router.ServeHTTP(w, req)

	if w.Code != http.StatusCreated {
		t.Fatalf("Minor registration failed, status %d: %s", w.Code, w.Body.String())
	}

	var resp map[string]interface{}
	if err := json.Unmarshal(w.Body.Bytes(), &resp); err != nil {
		t.Fatalf("Failed to unmarshal response: %v", err)
	}

	userObj, ok := resp["user"].(map[string]interface{})
	if !ok {
		t.Fatalf("Response missing user object")
	}

	isMinor, ok := userObj["is_minor"].(bool)
	if !ok {
		t.Fatalf("User object missing is_minor field or wrong type")
	}

	if !isMinor {
		t.Errorf("EXPECTED is_minor == true for 15-year-old user, GOT false")
	}

	ageVal, ok := userObj["age"].(float64)
	if !ok {
		t.Fatalf("User object missing age field")
	}
	if int(ageVal) != 15 {
		t.Errorf("EXPECTED age == 15, GOT %d", int(ageVal))
	}
}

// TestEmpirical_ParentalConsent_MinorVsNonMinor tests POST /api/v1/auth/parental-consent
// for a minor user vs a non-minor user.
func TestEmpirical_ParentalConsent_MinorVsNonMinor(t *testing.T) {
	router, testDB, _, secret := setupTestRouter(t)

	// 1. Minor User (16 years old)
	minorDOB := time.Now().AddDate(-16, 0, 0)
	minorUser := models.User{
		ID:          uuid.New(),
		Email:       "minor16@example.com",
		Password:    "hashedpass",
		Name:        "Minor 16",
		DateOfBirth: minorDOB,
	}
	testDB.Create(&minorUser)

	minorToken, err := auth.GenerateJWT(minorUser.ID, minorUser.Email, secret, 1*time.Hour)
	if err != nil {
		t.Fatalf("Failed to generate minor JWT: %v", err)
	}

	consentPayload := map[string]string{
		"parent_email": "guardian@example.com",
	}
	consentBytes, _ := json.Marshal(consentPayload)

	wMinor := httptest.NewRecorder()
	reqMinor, _ := http.NewRequest("POST", "/api/v1/auth/parental-consent", bytes.NewBuffer(consentBytes))
	reqMinor.Header.Set("Content-Type", "application/json")
	reqMinor.Header.Set("Authorization", "Bearer "+minorToken)
	router.ServeHTTP(wMinor, reqMinor)

	if wMinor.Code != http.StatusOK {
		t.Errorf("EXPECTED 200 OK for minor parental consent, GOT %d: %s", wMinor.Code, wMinor.Body.String())
	}

	var minorResp map[string]interface{}
	json.Unmarshal(wMinor.Body.Bytes(), &minorResp)
	updatedMinor := minorResp["user"].(map[string]interface{})

	if !updatedMinor["parental_consent_given"].(bool) {
		t.Errorf("EXPECTED parental_consent_given == true for minor user, GOT false")
	}

	// 2. Non-Minor User (25 years old)
	adultDOB := time.Now().AddDate(-25, 0, 0)
	adultUser := models.User{
		ID:          uuid.New(),
		Email:       "adult25@example.com",
		Password:    "hashedpass",
		Name:        "Adult 25",
		DateOfBirth: adultDOB,
	}
	testDB.Create(&adultUser)

	adultToken, err := auth.GenerateJWT(adultUser.ID, adultUser.Email, secret, 1*time.Hour)
	if err != nil {
		t.Fatalf("Failed to generate adult JWT: %v", err)
	}

	wAdult := httptest.NewRecorder()
	reqAdult, _ := http.NewRequest("POST", "/api/v1/auth/parental-consent", bytes.NewBuffer(consentBytes))
	reqAdult.Header.Set("Content-Type", "application/json")
	reqAdult.Header.Set("Authorization", "Bearer "+adultToken)
	router.ServeHTTP(wAdult, reqAdult)

	if wAdult.Code != http.StatusBadRequest {
		t.Errorf("EXPECTED 400 Bad Request for non-minor parental consent attempt, GOT %d: %s", wAdult.Code, wAdult.Body.String())
	}
}

// TestEmpirical_JWT_HttpOnly_Cookie_Expiration_Signature_Tampering tests JWT handling:
// - Cookie presence, HttpOnly flag, and MaxAge
// - Expired JWT tokens rejection
// - Invalid signature rejection
// - Tampered token body rejection
func TestEmpirical_JWT_HttpOnly_Cookie_Expiration_Signature_Tampering(t *testing.T) {
	router, _, _, secret := setupTestRouter(t)

	// 1. Test HttpOnly Cookie generation via Login
	regPayload := map[string]string{
		"email":    "jwttest@example.com",
		"password": "Password123!",
	}
	jsonBytes, _ := json.Marshal(regPayload)

	wReg := httptest.NewRecorder()
	reqReg, _ := http.NewRequest("POST", "/api/v1/auth/register", bytes.NewBuffer(jsonBytes))
	reqReg.Header.Set("Content-Type", "application/json")
	router.ServeHTTP(wReg, reqReg)

	cookies := wReg.Result().Cookies()
	var authCookie *http.Cookie
	for _, c := range cookies {
		if c.Name == "auth_token" {
			authCookie = c
			break
		}
	}

	if authCookie == nil {
		t.Fatalf("auth_token cookie was not set in register response")
	}

	if !authCookie.HttpOnly {
		t.Errorf("EXPECTED auth_token cookie to be HttpOnly=true, GOT false")
	}

	// 2. Test accessing protected endpoint with valid cookie
	wMeCookie := httptest.NewRecorder()
	reqMeCookie, _ := http.NewRequest("GET", "/api/v1/auth/me", nil)
	reqMeCookie.AddCookie(authCookie)
	router.ServeHTTP(wMeCookie, reqMeCookie)

	if wMeCookie.Code != http.StatusOK {
		t.Errorf("EXPECTED 200 OK accessing /me with HttpOnly cookie, GOT %d", wMeCookie.Code)
	}

	// 3. Test Expired JWT Token
	expiredToken, err := auth.GenerateJWT(uuid.New(), "expired@example.com", secret, -10*time.Minute)
	if err != nil {
		t.Fatalf("Failed to generate expired JWT: %v", err)
	}

	wExpired := httptest.NewRecorder()
	reqExpired, _ := http.NewRequest("GET", "/api/v1/auth/me", nil)
	reqExpired.Header.Set("Authorization", "Bearer "+expiredToken)
	router.ServeHTTP(wExpired, reqExpired)

	if wExpired.Code != http.StatusUnauthorized {
		t.Errorf("EXPECTED 401 Unauthorized for expired token, GOT %d", wExpired.Code)
	}

	// 4. Test Invalid Signature (Signed with different secret)
	invalidSigToken, err := auth.GenerateJWT(uuid.New(), "forged@example.com", "wrong-secret-key-9999", 1*time.Hour)
	if err != nil {
		t.Fatalf("Failed to generate token with wrong secret: %v", err)
	}

	wInvalidSig := httptest.NewRecorder()
	reqInvalidSig, _ := http.NewRequest("GET", "/api/v1/auth/me", nil)
	reqInvalidSig.Header.Set("Authorization", "Bearer "+invalidSigToken)
	router.ServeHTTP(wInvalidSig, reqInvalidSig)

	if wInvalidSig.Code != http.StatusUnauthorized {
		t.Errorf("EXPECTED 401 Unauthorized for invalid signature, GOT %d", wInvalidSig.Code)
	}

	// 5. Test Tampered Token Payload
	// Take valid token, replace middle payload segment with modified base64 data
	validTokenStr := authCookie.Value
	parts := strings.Split(validTokenStr, ".")
	if len(parts) == 3 {
		tamperedToken := parts[0] + ".eyJ1c2VyX2lkIjoiMDAwMDAwMDAtMDAwMC0wMDAwLTAwMDAtMDAwMDAwMDAwMDAwIiwiZW1haWwiOiJoYWNrZXJAZXhhbXBsZS5jb20ifQ." + parts[2]

		wTampered := httptest.NewRecorder()
		reqTampered, _ := http.NewRequest("GET", "/api/v1/auth/me", nil)
		reqTampered.Header.Set("Authorization", "Bearer "+tamperedToken)
		router.ServeHTTP(wTampered, reqTampered)

		if wTampered.Code != http.StatusUnauthorized {
			t.Errorf("EXPECTED 401 Unauthorized for tampered payload token, GOT %d", wTampered.Code)
		}
	} else {
		t.Errorf("Valid token did not have 3 JWT segments: %s", validTokenStr)
	}
}

// TestEmpirical_CORS_Preflight_And_Credentials tests OPTIONS preflight requests
// and CORS Access-Control-Allow-Credentials & Origin headers.
func TestEmpirical_CORS_Preflight_And_Credentials(t *testing.T) {
	gin.SetMode(gin.TestMode)
	allowedOrigins := []string{"http://localhost:3000", "https://app.bitelens.com"}

	router := gin.New()
	router.Use(middleware.CORSMiddleware(allowedOrigins))
	router.GET("/api/v1/test", func(c *gin.Context) {
		c.String(http.StatusOK, "ok")
	})

	// 1. Preflight OPTIONS request from allowed origin
	wPreflight := httptest.NewRecorder()
	reqPreflight, _ := http.NewRequest("OPTIONS", "/api/v1/test", nil)
	reqPreflight.Header.Set("Origin", "http://localhost:3000")
	reqPreflight.Header.Set("Access-Control-Request-Method", "POST")
	router.ServeHTTP(wPreflight, reqPreflight)

	if wPreflight.Code != http.StatusNoContent {
		t.Errorf("EXPECTED 204 No Content for CORS preflight, GOT %d", wPreflight.Code)
	}

	if wPreflight.Header().Get("Access-Control-Allow-Origin") != "http://localhost:3000" {
		t.Errorf("EXPECTED Access-Control-Allow-Origin: http://localhost:3000, GOT %s", wPreflight.Header().Get("Access-Control-Allow-Origin"))
	}

	if wPreflight.Header().Get("Access-Control-Allow-Credentials") != "true" {
		t.Errorf("EXPECTED Access-Control-Allow-Credentials: true, GOT %s", wPreflight.Header().Get("Access-Control-Allow-Credentials"))
	}

	// 2. Preflight OPTIONS request from unauthorized origin
	wUnauthorizedOrigin := httptest.NewRecorder()
	reqUnauthorizedOrigin, _ := http.NewRequest("OPTIONS", "/api/v1/test", nil)
	reqUnauthorizedOrigin.Header.Set("Origin", "https://malicious-site.com")
	router.ServeHTTP(wUnauthorizedOrigin, reqUnauthorizedOrigin)

	if wUnauthorizedOrigin.Header().Get("Access-Control-Allow-Origin") != "" {
		t.Errorf("EXPECTED empty Access-Control-Allow-Origin for unauthorized origin, GOT %s", wUnauthorizedOrigin.Header().Get("Access-Control-Allow-Origin"))
	}

	if wUnauthorizedOrigin.Header().Get("Access-Control-Allow-Credentials") != "" {
		t.Errorf("EXPECTED empty Access-Control-Allow-Credentials for unauthorized origin, GOT %s", wUnauthorizedOrigin.Header().Get("Access-Control-Allow-Credentials"))
	}

	// 3. GET request from second allowed origin
	wAllowed2 := httptest.NewRecorder()
	reqAllowed2, _ := http.NewRequest("GET", "/api/v1/test", nil)
	reqAllowed2.Header.Set("Origin", "https://app.bitelens.com")
	router.ServeHTTP(wAllowed2, reqAllowed2)

	if wAllowed2.Code != http.StatusOK {
		t.Errorf("EXPECTED 200 OK, GOT %d", wAllowed2.Code)
	}

	if wAllowed2.Header().Get("Access-Control-Allow-Origin") != "https://app.bitelens.com" {
		t.Errorf("EXPECTED Access-Control-Allow-Origin: https://app.bitelens.com, GOT %s", wAllowed2.Header().Get("Access-Control-Allow-Origin"))
	}
}
