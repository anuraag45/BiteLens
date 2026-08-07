package auth_test

import (
	"net/http/httptest"
	"testing"
	"time"

	"backend/internal/auth"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func TestPasswordHashing(t *testing.T) {
	password := "mySecretPassword123!"
	hash, err := auth.HashPassword(password)
	if err != nil {
		t.Fatalf("HashPassword failed: %v", err)
	}

	if hash == password {
		t.Errorf("Expected hash to be different from plain password")
	}

	if !auth.CheckPasswordHash(password, hash) {
		t.Errorf("CheckPasswordHash failed for correct password")
	}

	if auth.CheckPasswordHash("wrongpassword", hash) {
		t.Errorf("CheckPasswordHash succeeded for wrong password")
	}
}

func TestJWTGenerationAndValidation(t *testing.T) {
	secret := "super-secret-jwt-key"
	userID := uuid.New()
	email := "user@example.com"
	duration := 1 * time.Hour

	tokenStr, err := auth.GenerateJWT(userID, email, secret, duration)
	if err != nil {
		t.Fatalf("GenerateJWT failed: %v", err)
	}

	claims, err := auth.ValidateJWT(tokenStr, secret)
	if err != nil {
		t.Fatalf("ValidateJWT failed: %v", err)
	}

	if claims.UserID != userID {
		t.Errorf("Expected UserID %s, got %s", userID, claims.UserID)
	}
	if claims.Email != email {
		t.Errorf("Expected Email %s, got %s", email, claims.Email)
	}

	// Test invalid secret
	_, err = auth.ValidateJWT(tokenStr, "wrong-secret")
	if err == nil {
		t.Errorf("Expected error when validating JWT with wrong secret")
	}

	// Test expired token
	expiredTokenStr, err := auth.GenerateJWT(userID, email, secret, -1*time.Minute)
	if err != nil {
		t.Fatalf("GenerateJWT for expired token failed: %v", err)
	}
	_, err = auth.ValidateJWT(expiredTokenStr, secret)
	if err == nil {
		t.Errorf("Expected error when validating expired JWT")
	}

	// Test empty secret
	_, err = auth.GenerateJWT(userID, email, "", duration)
	if err == nil {
		t.Errorf("Expected error when generating JWT with empty secret")
	}
}

func TestVerifyGoogleIDToken(t *testing.T) {
	// Test empty token
	_, err := auth.VerifyGoogleIDToken("")
	if err == nil {
		t.Errorf("Expected error for empty Google token")
	}

	// Test mock token
	mockToken := "mock-google-token:john@example.com:google-sub-999:John Doe"
	info, err := auth.VerifyGoogleIDToken(mockToken)
	if err != nil {
		t.Fatalf("VerifyGoogleIDToken failed for mock token: %v", err)
	}

	if info.Email != "john@example.com" {
		t.Errorf("Expected email john@example.com, got %s", info.Email)
	}
	if info.Sub != "google-sub-999" {
		t.Errorf("Expected sub google-sub-999, got %s", info.Sub)
	}
	if info.Name != "John Doe" {
		t.Errorf("Expected name John Doe, got %s", info.Name)
	}
	if !info.EmailVerified {
		t.Errorf("Expected EmailVerified to be true")
	}
}

func TestAuthCookieManagement(t *testing.T) {
	gin.SetMode(gin.TestMode)
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Request = httptest.NewRequest("GET", "/", nil)

	token := "sample-jwt-token-string"
	auth.SetAuthCookie(c, token)

	cookies := w.Result().Cookies()
	var authCookieFound bool
	for _, cookie := range cookies {
		if cookie.Name == "auth_token" {
			authCookieFound = true
			if cookie.Value != token {
				t.Errorf("Expected cookie value %s, got %s", token, cookie.Value)
			}
			if !cookie.HttpOnly {
				t.Errorf("Expected HttpOnly cookie")
			}
			if cookie.MaxAge != 86400 {
				t.Errorf("Expected MaxAge 86400, got %d", cookie.MaxAge)
			}
		}
	}
	if !authCookieFound {
		t.Errorf("auth_token cookie was not set")
	}

	// Test ClearAuthCookie
	wClear := httptest.NewRecorder()
	cClear, _ := gin.CreateTestContext(wClear)
	cClear.Request = httptest.NewRequest("GET", "/", nil)

	auth.ClearAuthCookie(cClear)
	clearCookies := wClear.Result().Cookies()
	var clearCookieFound bool
	for _, cookie := range clearCookies {
		if cookie.Name == "auth_token" {
			clearCookieFound = true
			if cookie.MaxAge >= 0 {
				t.Errorf("Expected negative MaxAge for cleared cookie, got %d", cookie.MaxAge)
			}
		}
	}
	if !clearCookieFound {
		t.Errorf("auth_token clear cookie was not set")
	}
}
