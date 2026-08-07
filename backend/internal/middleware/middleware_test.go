package middleware_test

import (
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"backend/internal/auth"
	"backend/internal/middleware"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func TestAuthMiddleware(t *testing.T) {
	gin.SetMode(gin.TestMode)
	secret := "test-secret-key"

	userID := uuid.New()
	email := "test@example.com"
	validToken, err := auth.GenerateJWT(userID, email, secret, 1*time.Hour)
	if err != nil {
		t.Fatalf("Failed to generate JWT: %v", err)
	}

	router := gin.New()
	router.Use(middleware.AuthMiddleware(secret))
	router.GET("/protected", func(c *gin.Context) {
		valID, _ := c.Get("userID")
		valEmail, _ := c.Get("email")
		c.JSON(http.StatusOK, gin.H{
			"user_id": valID,
			"email":   valEmail,
		})
	})

	// 1. Missing token -> 401
	w1 := httptest.NewRecorder()
	req1, _ := http.NewRequest("GET", "/protected", nil)
	router.ServeHTTP(w1, req1)
	if w1.Code != http.StatusUnauthorized {
		t.Errorf("Expected 401 for missing token, got %d", w1.Code)
	}

	// 2. Valid cookie token -> 200
	w2 := httptest.NewRecorder()
	req2, _ := http.NewRequest("GET", "/protected", nil)
	req2.AddCookie(&http.Cookie{Name: "auth_token", Value: validToken})
	router.ServeHTTP(w2, req2)
	if w2.Code != http.StatusOK {
		t.Errorf("Expected 200 for valid cookie token, got %d", w2.Code)
	}

	// 3. Valid Bearer header token -> 200
	w3 := httptest.NewRecorder()
	req3, _ := http.NewRequest("GET", "/protected", nil)
	req3.Header.Set("Authorization", "Bearer "+validToken)
	router.ServeHTTP(w3, req3)
	if w3.Code != http.StatusOK {
		t.Errorf("Expected 200 for valid Bearer token, got %d", w3.Code)
	}

	// 4. Invalid token -> 401
	w4 := httptest.NewRecorder()
	req4, _ := http.NewRequest("GET", "/protected", nil)
	req4.Header.Set("Authorization", "Bearer invalid-token")
	router.ServeHTTP(w4, req4)
	if w4.Code != http.StatusUnauthorized {
		t.Errorf("Expected 401 for invalid token, got %d", w4.Code)
	}
}

func TestCORSMiddleware(t *testing.T) {
	gin.SetMode(gin.TestMode)
	allowedOrigins := []string{"http://localhost:3000", "https://app.bitelens.com"}

	router := gin.New()
	router.Use(middleware.CORSMiddleware(allowedOrigins))
	router.GET("/api/test", func(c *gin.Context) {
		c.String(http.StatusOK, "ok")
	})

	// 1. Matching Origin request
	w1 := httptest.NewRecorder()
	req1, _ := http.NewRequest("GET", "/api/test", nil)
	req1.Header.Set("Origin", "http://localhost:3000")
	router.ServeHTTP(w1, req1)

	if w1.Code != http.StatusOK {
		t.Errorf("Expected 200 OK, got %d", w1.Code)
	}
	if w1.Header().Get("Access-Control-Allow-Origin") != "http://localhost:3000" {
		t.Errorf("Expected Access-Control-Allow-Origin to be http://localhost:3000, got %s", w1.Header().Get("Access-Control-Allow-Origin"))
	}
	if w1.Header().Get("Access-Control-Allow-Credentials") != "true" {
		t.Errorf("Expected Access-Control-Allow-Credentials to be true")
	}

	// 2. Preflight OPTIONS request
	w2 := httptest.NewRecorder()
	req2, _ := http.NewRequest("OPTIONS", "/api/test", nil)
	req2.Header.Set("Origin", "https://app.bitelens.com")
	router.ServeHTTP(w2, req2)

	if w2.Code != http.StatusNoContent {
		t.Errorf("Expected 204 No Content for preflight OPTIONS, got %d", w2.Code)
	}
	if w2.Header().Get("Access-Control-Allow-Origin") != "https://app.bitelens.com" {
		t.Errorf("Expected Access-Control-Allow-Origin to be https://app.bitelens.com, got %s", w2.Header().Get("Access-Control-Allow-Origin"))
	}

	// 3. Disallowed origin
	w3 := httptest.NewRecorder()
	req3, _ := http.NewRequest("GET", "/api/test", nil)
	req3.Header.Set("Origin", "http://evil-site.com")
	router.ServeHTTP(w3, req3)

	if w3.Header().Get("Access-Control-Allow-Origin") != "" {
		t.Errorf("Expected empty Access-Control-Allow-Origin for disallowed origin")
	}
}

func TestRateLimiterMiddleware(t *testing.T) {
	gin.SetMode(gin.TestMode)

	// Rate limit: 3 requests per 10 seconds
	router := gin.New()
	router.Use(middleware.RateLimiterMiddleware(3, 10*time.Second))
	router.GET("/api/scan-test", func(c *gin.Context) {
		c.String(http.StatusOK, "ok")
	})

	clientIP := "192.168.1.100"

	// First 3 requests should pass
	for i := 0; i < 3; i++ {
		w := httptest.NewRecorder()
		req, _ := http.NewRequest("GET", "/api/scan-test", nil)
		req.RemoteAddr = clientIP + ":12345"
		router.ServeHTTP(w, req)
		if w.Code != http.StatusOK {
			t.Errorf("Request %d expected 200 OK, got %d", i+1, w.Code)
		}
	}

	// 4th request should be rate limited (429)
	w4 := httptest.NewRecorder()
	req4, _ := http.NewRequest("GET", "/api/scan-test", nil)
	req4.RemoteAddr = clientIP + ":12345"
	router.ServeHTTP(w4, req4)
	if w4.Code != http.StatusTooManyRequests {
		t.Errorf("Expected 429 Too Many Requests on 4th request, got %d", w4.Code)
	}

	// Test CleanupRateLimiterStaleEntries
	middleware.CleanupRateLimiterStaleEntries(0)
}

func TestStrictCORSWildcardAndEmptyOrigins(t *testing.T) {
	gin.SetMode(gin.TestMode)

	// 1. Empty allowedOrigins -> no origins allowed
	r1 := gin.New()
	r1.Use(middleware.CORSMiddleware([]string{}))
	r1.GET("/test", func(c *gin.Context) { c.String(http.StatusOK, "ok") })

	w1 := httptest.NewRecorder()
	req1, _ := http.NewRequest("GET", "/test", nil)
	req1.Header.Set("Origin", "http://example.com")
	r1.ServeHTTP(w1, req1)

	if w1.Header().Get("Access-Control-Allow-Origin") != "" {
		t.Errorf("Expected empty Access-Control-Allow-Origin for empty allowedOrigins, got %s", w1.Header().Get("Access-Control-Allow-Origin"))
	}
	if w1.Header().Get("Access-Control-Allow-Credentials") != "" {
		t.Errorf("Expected empty Access-Control-Allow-Credentials for empty allowedOrigins, got %s", w1.Header().Get("Access-Control-Allow-Credentials"))
	}

	// 2. Wildcard origin without explicit origin match -> Allow-Origin * without Credentials
	r2 := gin.New()
	r2.Use(middleware.CORSMiddleware([]string{"*"}))
	r2.GET("/test", func(c *gin.Context) { c.String(http.StatusOK, "ok") })

	w2 := httptest.NewRecorder()
	req2, _ := http.NewRequest("GET", "/test", nil)
	req2.Header.Set("Origin", "http://unknown-origin.com")
	r2.ServeHTTP(w2, req2)

	if w2.Header().Get("Access-Control-Allow-Origin") != "*" {
		t.Errorf("Expected Access-Control-Allow-Origin * for wildcard origins, got %s", w2.Header().Get("Access-Control-Allow-Origin"))
	}
	if w2.Header().Get("Access-Control-Allow-Credentials") != "" {
		t.Errorf("Expected empty Access-Control-Allow-Credentials for wildcard origin, got %s", w2.Header().Get("Access-Control-Allow-Credentials"))
	}
}
