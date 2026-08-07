package middleware_test

import (
	"net/http"
	"net/http/httptest"
	"sync"
	"testing"
	"time"

	"backend/internal/middleware"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// TestRateLimiterMiddleware_15RapidRequests tests sending 15 rapid requests to a rate-limited endpoint (10 req/min limit).
// Verifies that requests 1-10 receive HTTP 200 OK and requests > 10 receive HTTP 429 Too Many Requests.
func TestRateLimiterMiddleware_15RapidRequests(t *testing.T) {
	gin.SetMode(gin.TestMode)

	router := gin.New()
	// Rate limit: 10 requests per minute
	router.Use(middleware.RateLimiterMiddleware(10, time.Minute))
	router.POST("/api/v1/scan", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "scanned"})
	})

	clientIP := "10.0.0.99"

	for i := 1; i <= 15; i++ {
		w := httptest.NewRecorder()
		req, _ := http.NewRequest("POST", "/api/v1/scan", nil)
		req.RemoteAddr = clientIP + ":54321"

		router.ServeHTTP(w, req)

		if i <= 10 {
			if w.Code != http.StatusOK {
				t.Errorf("Request %d/15 expected HTTP 200 OK, got HTTP %d. Response: %s", i, w.Code, w.Body.String())
			}
		} else {
			if w.Code != http.StatusTooManyRequests {
				t.Errorf("Request %d/15 expected HTTP 429 Too Many Requests, got HTTP %d. Response: %s", i, w.Code, w.Body.String())
			}
		}
	}
}

// TestRateLimiterMiddleware_UserIDBasedLimiting tests rate limiting per UserID attached in context.
func TestRateLimiterMiddleware_UserIDBasedLimiting(t *testing.T) {
	gin.SetMode(gin.TestMode)

	router := gin.New()
	user1ID := uuid.New()
	user2ID := uuid.New()

	// Rate limit: 10 requests per minute
	router.Use(func(c *gin.Context) {
		// Mock auth middleware setting user ID based on header
		uHeader := c.GetHeader("X-User-ID")
		if uHeader == "user1" {
			c.Set("userID", user1ID)
		} else if uHeader == "user2" {
			c.Set("userID", user2ID)
		}
		c.Next()
	})
	router.Use(middleware.RateLimiterMiddleware(10, time.Minute))
	router.POST("/api/v1/scan", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "scanned"})
	})

	// User 1 sends 10 requests -> all 10 succeed
	for i := 1; i <= 10; i++ {
		w := httptest.NewRecorder()
		req, _ := http.NewRequest("POST", "/api/v1/scan", nil)
		req.Header.Set("X-User-ID", "user1")
		router.ServeHTTP(w, req)

		if w.Code != http.StatusOK {
			t.Errorf("User1 request %d expected HTTP 200, got %d", i, w.Code)
		}
	}

	// User 1 request 11 fails (429)
	w11 := httptest.NewRecorder()
	req11, _ := http.NewRequest("POST", "/api/v1/scan", nil)
	req11.Header.Set("X-User-ID", "user1")
	router.ServeHTTP(w11, req11)

	if w11.Code != http.StatusTooManyRequests {
		t.Errorf("User1 request 11 expected HTTP 429, got %d", w11.Code)
	}

	// User 2 should NOT be affected by User 1's rate limit
	wUser2 := httptest.NewRecorder()
	reqUser2, _ := http.NewRequest("POST", "/api/v1/scan", nil)
	reqUser2.Header.Set("X-User-ID", "user2")
	router.ServeHTTP(wUser2, reqUser2)

	if wUser2.Code != http.StatusOK {
		t.Errorf("User2 request expected HTTP 200, got %d", wUser2.Code)
	}
}

// TestRateLimiterMiddleware_ConcurrencyStress stress tests rate limiting under concurrent goroutine access.
func TestRateLimiterMiddleware_ConcurrencyStress(t *testing.T) {
	gin.SetMode(gin.TestMode)

	router := gin.New()
	router.Use(middleware.RateLimiterMiddleware(10, time.Minute))
	router.POST("/api/v1/scan", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "scanned"})
	})

	clientIP := "10.0.0.88:1234"
	const totalRequests = 15
	var wg sync.WaitGroup
	statusCodeChan := make(chan int, totalRequests)

	for i := 0; i < totalRequests; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			w := httptest.NewRecorder()
			req, _ := http.NewRequest("POST", "/api/v1/scan", nil)
			req.RemoteAddr = clientIP
			router.ServeHTTP(w, req)
			statusCodeChan <- w.Code
		}()
	}

	wg.Wait()
	close(statusCodeChan)

	var count200, count429, countOther int
	for code := range statusCodeChan {
		switch code {
		case http.StatusOK:
			count200++
		case http.StatusTooManyRequests:
			count429++
		default:
			countOther++
		}
	}

	t.Logf("[RateLimiter Concurrency] Total: %d, HTTP 200: %d, HTTP 429: %d, Other: %d", totalRequests, count200, count429, countOther)

	if count200 != 10 {
		t.Errorf("Expected exactly 10 requests to pass (HTTP 200), got %d", count200)
	}
	if count429 != 5 {
		t.Errorf("Expected exactly 5 requests to be rate-limited (HTTP 429), got %d", count429)
	}
	if countOther > 0 {
		t.Errorf("Unexpected status codes encountered: %d", countOther)
	}
}
