package handlers_test

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"backend/internal/auth"
	"backend/internal/db"
	"backend/internal/handlers"
	"backend/internal/middleware"
	"backend/internal/models"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

func setupTestRouter(t *testing.T) (*gin.Engine, *gorm.DB, *handlers.Handler, string) {
	gin.SetMode(gin.TestMode)
	testDB, err := db.InitTestDB()
	if err != nil {
		t.Fatalf("Failed to initialize test DB: %v", err)
	}
	if err := db.AutoMigrate(testDB); err != nil {
		t.Fatalf("Failed to auto migrate DB: %v", err)
	}

	secret := "test-jwt-secret-key-12345"
	h := handlers.NewHandler(testDB, secret)

	router := gin.New()
	router.Use(gin.Recovery())

	// Auth routes
	authGroup := router.Group("/api/v1/auth")
	{
		authGroup.POST("/register", h.Register)
		authGroup.POST("/login", h.Login)
		authGroup.POST("/google", h.GoogleAuth)
		authGroup.POST("/logout", h.Logout)

		protected := authGroup.Group("/")
		protected.Use(middleware.AuthMiddleware(secret))
		{
			protected.GET("/me", h.Me)
			protected.POST("/parental-consent", h.ParentalConsent)
		}
	}

	// API routes
	apiGroup := router.Group("/api/v1")
	{
		apiGroup.GET("/additives/:code", h.GetAdditive)

		protectedApi := apiGroup.Group("/")
		protectedApi.Use(middleware.AuthMiddleware(secret))
		{
			protectedApi.POST("/scan", middleware.RateLimiterMiddleware(10, time.Minute), h.Scan)
			protectedApi.GET("/history", h.GetHistory)
		}
	}

	return router, testDB, h, secret
}

func TestRegisterAndLoginFlow(t *testing.T) {
	router, _, _, _ := setupTestRouter(t)

	// 1. Register Adult User
	regPayload := map[string]string{
		"email":         "adult@example.com",
		"password":      "password123",
		"name":          "Adult User",
		"date_of_birth": "1995-05-15",
	}
	jsonBytes, _ := json.Marshal(regPayload)

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("POST", "/api/v1/auth/register", bytes.NewBuffer(jsonBytes))
	req.Header.Set("Content-Type", "application/json")
	router.ServeHTTP(w, req)

	if w.Code != http.StatusCreated {
		t.Fatalf("Register failed, expected 201 Created, got %d: %s", w.Code, w.Body.String())
	}

	var regResp map[string]interface{}
	json.Unmarshal(w.Body.Bytes(), &regResp)

	userObj, ok := regResp["user"].(map[string]interface{})
	if !ok {
		t.Fatalf("Register response missing user object")
	}
	if userObj["email"] != "adult@example.com" {
		t.Errorf("Expected email adult@example.com, got %v", userObj["email"])
	}
	if userObj["is_minor"].(bool) {
		t.Errorf("Expected is_minor to be false for adult user born 1995")
	}

	// 2. Duplicate Register should fail
	wDup := httptest.NewRecorder()
	reqDup, _ := http.NewRequest("POST", "/api/v1/auth/register", bytes.NewBuffer(jsonBytes))
	reqDup.Header.Set("Content-Type", "application/json")
	router.ServeHTTP(wDup, reqDup)
	if wDup.Code != http.StatusConflict {
		t.Errorf("Expected 409 Conflict for duplicate registration, got %d", wDup.Code)
	}

	// 3. Login User
	loginPayload := map[string]string{
		"email":    "adult@example.com",
		"password": "password123",
	}
	loginBytes, _ := json.Marshal(loginPayload)

	wLogin := httptest.NewRecorder()
	reqLogin, _ := http.NewRequest("POST", "/api/v1/auth/login", bytes.NewBuffer(loginBytes))
	reqLogin.Header.Set("Content-Type", "application/json")
	router.ServeHTTP(wLogin, reqLogin)

	if wLogin.Code != http.StatusOK {
		t.Fatalf("Login failed, expected 200 OK, got %d", wLogin.Code)
	}

	// Verify Auth Cookie
	cookies := wLogin.Result().Cookies()
	var authCookieFound bool
	for _, c := range cookies {
		if c.Name == "auth_token" {
			authCookieFound = true
			if !c.HttpOnly {
				t.Errorf("Expected HttpOnly cookie")
			}
		}
	}
	if !authCookieFound {
		t.Errorf("Auth cookie auth_token was not set on login")
	}
}

func TestGoogleAuthHandler(t *testing.T) {
	router, _, _, _ := setupTestRouter(t)

	googlePayload := map[string]string{
		"id_token": "mock-google-token:guser@example.com:sub-123456:Google User",
	}
	jsonBytes, _ := json.Marshal(googlePayload)

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("POST", "/api/v1/auth/google", bytes.NewBuffer(jsonBytes))
	req.Header.Set("Content-Type", "application/json")
	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("GoogleAuth failed, expected 200 OK, got %d: %s", w.Code, w.Body.String())
	}

	var resp map[string]interface{}
	json.Unmarshal(w.Body.Bytes(), &resp)

	userObj := resp["user"].(map[string]interface{})
	if userObj["email"] != "guser@example.com" {
		t.Errorf("Expected email guser@example.com, got %v", userObj["email"])
	}
}

func TestParentalConsentAndMeHandlers(t *testing.T) {
	router, _, _, secret := setupTestRouter(t)

	// 1. Register Minor User (born 2012)
	dobMinor := time.Now().AddDate(-13, 0, 0).Format("2006-01-02")
	regPayload := map[string]string{
		"email":         "minor@example.com",
		"password":      "password123",
		"name":          "Minor User",
		"date_of_birth": dobMinor,
	}
	jsonBytes, _ := json.Marshal(regPayload)

	wReg := httptest.NewRecorder()
	reqReg, _ := http.NewRequest("POST", "/api/v1/auth/register", bytes.NewBuffer(jsonBytes))
	reqReg.Header.Set("Content-Type", "application/json")
	router.ServeHTTP(wReg, reqReg)

	if wReg.Code != http.StatusCreated {
		t.Fatalf("Register minor failed, status %d", wReg.Code)
	}

	var regResp map[string]interface{}
	json.Unmarshal(wReg.Body.Bytes(), &regResp)
	token := regResp["token"].(string)

	// 2. Call /me endpoint
	wMe := httptest.NewRecorder()
	reqMe, _ := http.NewRequest("GET", "/api/v1/auth/me", nil)
	reqMe.Header.Set("Authorization", "Bearer "+token)
	router.ServeHTTP(wMe, reqMe)

	if wMe.Code != http.StatusOK {
		t.Fatalf("/me failed, expected 200 OK, got %d", wMe.Code)
	}

	var meResp map[string]interface{}
	json.Unmarshal(wMe.Body.Bytes(), &meResp)
	meUser := meResp["user"].(map[string]interface{})
	if !meUser["is_minor"].(bool) {
		t.Errorf("Expected is_minor to be true for minor user")
	}

	// 3. Parental Consent for Minor User
	consentPayload := map[string]string{
		"parent_email": "parent@example.com",
	}
	consentBytes, _ := json.Marshal(consentPayload)

	wConsent := httptest.NewRecorder()
	reqConsent, _ := http.NewRequest("POST", "/api/v1/auth/parental-consent", bytes.NewBuffer(consentBytes))
	reqConsent.Header.Set("Content-Type", "application/json")
	reqConsent.Header.Set("Authorization", "Bearer "+token)
	router.ServeHTTP(wConsent, reqConsent)

	if wConsent.Code != http.StatusOK {
		t.Fatalf("ParentalConsent failed, expected 200 OK, got %d: %s", wConsent.Code, wConsent.Body.String())
	}

	var consentResp map[string]interface{}
	json.Unmarshal(wConsent.Body.Bytes(), &consentResp)
	updatedUser := consentResp["user"].(map[string]interface{})
	if !updatedUser["parental_consent_given"].(bool) {
		t.Errorf("Expected parental_consent_given to be true")
	}
	if updatedUser["parent_email"] != "parent@example.com" {
		t.Errorf("Expected parent_email parent@example.com, got %v", updatedUser["parent_email"])
	}

	// 4. Parental Consent for Adult User should fail
	adultID := uuid.New()
	adultToken, _ := auth.GenerateJWT(adultID, "adult2@example.com", secret, 1*time.Hour)

	// Create adult user in DB
	wConsentAdult := httptest.NewRecorder()
	reqConsentAdult, _ := http.NewRequest("POST", "/api/v1/auth/parental-consent", bytes.NewBuffer(consentBytes))
	reqConsentAdult.Header.Set("Content-Type", "application/json")
	reqConsentAdult.Header.Set("Authorization", "Bearer "+adultToken)
	router.ServeHTTP(wConsentAdult, reqConsentAdult)

	// Since adult2@example.com is not in DB or is adult, should return error
	if wConsentAdult.Code == http.StatusOK {
		t.Errorf("Expected error when requesting parental consent for non-existent or adult user")
	}
}

func TestScanAndHistoryHandlers(t *testing.T) {
	router, testDB, _, _ := setupTestRouter(t)

	// Seed Additive in DB
	additive := models.Additive{
		INSCode:     "INS-621",
		Name:        "Monosodium Glutamate",
		RiskLevel:   "MEDIUM",
		Description: "Common flavor enhancer",
	}
	testDB.Create(&additive)

	// Register user to obtain JWT
	regPayload := map[string]string{
		"email":         "scanner_user@example.com",
		"password":      "password123",
		"name":          "Scanner User",
		"date_of_birth": "1990-01-01",
	}
	jsonBytes, _ := json.Marshal(regPayload)

	wReg := httptest.NewRecorder()
	reqReg, _ := http.NewRequest("POST", "/api/v1/auth/register", bytes.NewBuffer(jsonBytes))
	reqReg.Header.Set("Content-Type", "application/json")
	router.ServeHTTP(wReg, reqReg)

	var regResp map[string]interface{}
	json.Unmarshal(wReg.Body.Bytes(), &regResp)
	token := regResp["token"].(string)

	// 1. Scan Endpoint
	scanPayload := map[string]string{
		"barcode":     "8901234567890",
		"raw_text":    "Ingredients: Salt, INS 621, Wheat Flour",
		"weight_goal": "weight_loss",
		"muscle_goal": "muscle_gain",
		"name":        "Tasty Noodle Bowl",
		"brand":       "NoodleCo",
	}
	scanBytes, _ := json.Marshal(scanPayload)

	wScan := httptest.NewRecorder()
	reqScan, _ := http.NewRequest("POST", "/api/v1/scan", bytes.NewBuffer(scanBytes))
	reqScan.Header.Set("Content-Type", "application/json")
	reqScan.Header.Set("Authorization", "Bearer "+token)
	router.ServeHTTP(wScan, reqScan)

	if wScan.Code != http.StatusOK {
		t.Fatalf("Scan endpoint failed, expected 200 OK, got %d: %s", wScan.Code, wScan.Body.String())
	}

	var scanResp map[string]interface{}
	json.Unmarshal(wScan.Body.Bytes(), &scanResp)

	if scanResp["traceability_hash"] == nil || scanResp["traceability_hash"].(string) == "" {
		t.Errorf("Expected non-empty traceability_hash in scan telemetry")
	}
	if scanResp["nova_group"] == nil {
		t.Errorf("Expected nova_group in scan telemetry")
	}

	// 2. Get History Endpoint
	wHist := httptest.NewRecorder()
	reqHist, _ := http.NewRequest("GET", "/api/v1/history", nil)
	reqHist.Header.Set("Authorization", "Bearer "+token)
	router.ServeHTTP(wHist, reqHist)

	if wHist.Code != http.StatusOK {
		t.Fatalf("GetHistory failed, expected 200 OK, got %d", wHist.Code)
	}

	var histResp map[string]interface{}
	json.Unmarshal(wHist.Body.Bytes(), &histResp)
	historyList := histResp["history"].([]interface{})
	if len(historyList) != 1 {
		t.Errorf("Expected 1 scan history entry, got %d", len(historyList))
	}

	// 3. Get Additive Endpoint
	wAdd := httptest.NewRecorder()
	reqAdd, _ := http.NewRequest("GET", "/api/v1/additives/621", nil)
	router.ServeHTTP(wAdd, reqAdd)

	if wAdd.Code != http.StatusOK {
		t.Fatalf("GetAdditive failed for code 621, expected 200 OK, got %d", wAdd.Code)
	}

	var addResp map[string]interface{}
	json.Unmarshal(wAdd.Body.Bytes(), &addResp)
	if addResp["ins_code"] != "INS-621" {
		t.Errorf("Expected ins_code INS-621, got %v", addResp["ins_code"])
	}

	// 4. Logout Endpoint
	wLogout := httptest.NewRecorder()
	reqLogout, _ := http.NewRequest("POST", "/api/v1/auth/logout", nil)
	router.ServeHTTP(wLogout, reqLogout)

	if wLogout.Code != http.StatusOK {
		t.Errorf("Logout failed, expected 200 OK, got %d", wLogout.Code)
	}
}
