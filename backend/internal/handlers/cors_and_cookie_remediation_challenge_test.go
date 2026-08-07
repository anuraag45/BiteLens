package handlers_test

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"backend/internal/middleware"

	"github.com/gin-gonic/gin"
)

// TestEmpirical_CORS_StrictOriginsAndCredentials Challenge
func TestEmpirical_CORS_StrictOriginsAndCredentials(t *testing.T) {
	gin.SetMode(gin.TestMode)
	allowedOrigins := []string{"http://localhost:3000", "https://app.bitelens.com"}

	router := gin.New()
	router.Use(middleware.CORSMiddleware(allowedOrigins))
	router.GET("/api/v1/test", func(c *gin.Context) {
		c.String(http.StatusOK, "ok")
	})

	t.Run("Allowed Origin gets Allow-Origin and Allow-Credentials=true", func(t *testing.T) {
		w := httptest.NewRecorder()
		req, _ := http.NewRequest("GET", "/api/v1/test", nil)
		req.Header.Set("Origin", "http://localhost:3000")
		router.ServeHTTP(w, req)

		if w.Code != http.StatusOK {
			t.Errorf("Expected 200 OK, got %d", w.Code)
		}
		if got := w.Header().Get("Access-Control-Allow-Origin"); got != "http://localhost:3000" {
			t.Errorf("Expected Access-Control-Allow-Origin: http://localhost:3000, got %s", got)
		}
		if got := w.Header().Get("Access-Control-Allow-Credentials"); got != "true" {
			t.Errorf("Expected Access-Control-Allow-Credentials: true, got %s", got)
		}
	})

	t.Run("Untrusted/Unlisted Origin does NOT get Allow-Credentials or Allow-Origin", func(t *testing.T) {
		untrustedOrigins := []string{
			"http://evil.com",
			"https://attacker.org",
			"http://localhost:8080",
			"null",
		}

		for _, untrusted := range untrustedOrigins {
			w := httptest.NewRecorder()
			req, _ := http.NewRequest("GET", "/api/v1/test", nil)
			req.Header.Set("Origin", untrusted)
			router.ServeHTTP(w, req)

			if got := w.Header().Get("Access-Control-Allow-Credentials"); got != "" {
				t.Errorf("UNTRUSTED ORIGIN %s MUST NOT get Access-Control-Allow-Credentials, but got %s", untrusted, got)
			}
			if got := w.Header().Get("Access-Control-Allow-Origin"); got != "" {
				t.Errorf("UNTRUSTED ORIGIN %s MUST NOT get Access-Control-Allow-Origin, but got %s", untrusted, got)
			}
		}
	})

	t.Run("Case Insensitive Allowed Origin matching", func(t *testing.T) {
		w := httptest.NewRecorder()
		req, _ := http.NewRequest("GET", "/api/v1/test", nil)
		req.Header.Set("Origin", "HTTPS://APP.BITELENS.COM")
		router.ServeHTTP(w, req)

		if got := w.Header().Get("Access-Control-Allow-Credentials"); got != "true" {
			t.Errorf("Case insensitive match should return credentials=true, got %s", got)
		}
	})
}

// TestEmpirical_CookieSecurity_HttpOnly_SameSite_Secure Challenge
func TestEmpirical_CookieSecurity_HttpOnly_SameSite_Secure(t *testing.T) {
	router, _, _, _ := setupTestRouter(t)

	regPayload := map[string]string{
		"email":    "cookie_test@example.com",
		"password": "SecurePassword123!",
		"name":     "Cookie Tester",
	}
	jsonBytes, _ := json.Marshal(regPayload)

	t.Run("Register handler sets HttpOnly, SameSite=Lax cookie", func(t *testing.T) {
		w := httptest.NewRecorder()
		req, _ := http.NewRequest("POST", "/api/v1/auth/register", bytes.NewBuffer(jsonBytes))
		req.Header.Set("Content-Type", "application/json")
		router.ServeHTTP(w, req)

		if w.Code != http.StatusCreated {
			t.Fatalf("Register failed: %d %s", w.Code, w.Body.String())
		}

		cookieHeader := w.Header().Get("Set-Cookie")
		if cookieHeader == "" {
			t.Fatalf("Set-Cookie header missing in register response")
		}

		if !strings.Contains(cookieHeader, "auth_token=") {
			t.Errorf("Set-Cookie header does not contain auth_token: %s", cookieHeader)
		}
		if !strings.Contains(cookieHeader, "HttpOnly") {
			t.Errorf("Set-Cookie header missing HttpOnly attribute: %s", cookieHeader)
		}
		if !strings.Contains(cookieHeader, "SameSite=Lax") {
			t.Errorf("Set-Cookie header missing SameSite=Lax attribute: %s", cookieHeader)
		}
	})

	t.Run("Login handler sets HttpOnly, SameSite=Lax, and Secure cookie under HTTPS", func(t *testing.T) {
		loginPayload := map[string]string{
			"email":    "cookie_test@example.com",
			"password": "SecurePassword123!",
		}
		loginBytes, _ := json.Marshal(loginPayload)

		w := httptest.NewRecorder()
		req, _ := http.NewRequest("POST", "/api/v1/auth/login", bytes.NewBuffer(loginBytes))
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("X-Forwarded-Proto", "https")
		router.ServeHTTP(w, req)

		if w.Code != http.StatusOK {
			t.Fatalf("Login failed: %d %s", w.Code, w.Body.String())
		}

		cookieHeader := w.Header().Get("Set-Cookie")
		if !strings.Contains(cookieHeader, "HttpOnly") {
			t.Errorf("Set-Cookie header missing HttpOnly attribute: %s", cookieHeader)
		}
		if !strings.Contains(cookieHeader, "SameSite=Lax") {
			t.Errorf("Set-Cookie header missing SameSite=Lax attribute: %s", cookieHeader)
		}
		if !strings.Contains(cookieHeader, "Secure") {
			t.Errorf("Set-Cookie header missing Secure attribute under HTTPS request: %s", cookieHeader)
		}
	})

	t.Run("Logout handler clears cookie with past expiry / MaxAge=-1", func(t *testing.T) {
		w := httptest.NewRecorder()
		req, _ := http.NewRequest("POST", "/api/v1/auth/logout", nil)
		router.ServeHTTP(w, req)

		if w.Code != http.StatusOK {
			t.Fatalf("Logout failed: %d", w.Code)
		}

		cookieHeader := w.Header().Get("Set-Cookie")
		if !strings.Contains(cookieHeader, "auth_token=") {
			t.Errorf("Set-Cookie missing auth_token clear: %s", cookieHeader)
		}
		if !strings.Contains(cookieHeader, "Max-Age=0") && !strings.Contains(cookieHeader, "1970") && !strings.Contains(cookieHeader, "01-Jan-1970") {
			t.Errorf("Set-Cookie expected cookie deletion (Max-Age=0 or past date), got: %s", cookieHeader)
		}
	})
}
