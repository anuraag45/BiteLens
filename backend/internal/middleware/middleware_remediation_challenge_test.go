package middleware_test

import (
	"net/http"
	"net/http/httptest"
	"sync"
	"testing"
	"time"

	"backend/internal/middleware"

	"github.com/gin-gonic/gin"
)

// ============================================================================
// 3. EMPIRICAL CHALLENGE: rateLimiterStore TTL Eviction
// ============================================================================

func TestRateLimiterStore_TTLEvictionEmpirical(t *testing.T) {
	gin.SetMode(gin.TestMode)

	// Create router with rate limiter middleware (5 requests per 10 seconds)
	router := gin.New()
	router.Use(middleware.RateLimiterMiddleware(5, 10*time.Second))
	router.GET("/api/test-ttl", func(c *gin.Context) {
		c.String(http.StatusOK, "ok")
	})

	clientIP := "192.168.10.50"

	// 1. Populate rate limiter store with 5 requests (exhausting bucket tokens)
	for i := 1; i <= 5; i++ {
		w := httptest.NewRecorder()
		req, _ := http.NewRequest("GET", "/api/test-ttl", nil)
		req.RemoteAddr = clientIP + ":12345"
		router.ServeHTTP(w, req)
		if w.Code != http.StatusOK {
			t.Fatalf("Setup request %d expected 200 OK, got %d", i, w.Code)
		}
	}

	// 6th request should fail with 429
	wBlock := httptest.NewRecorder()
	reqBlock, _ := http.NewRequest("GET", "/api/test-ttl", nil)
	reqBlock.RemoteAddr = clientIP + ":12345"
	router.ServeHTTP(wBlock, reqBlock)
	if wBlock.Code != http.StatusTooManyRequests {
		t.Fatalf("Expected 429 Too Many Requests before eviction, got %d", wBlock.Code)
	}

	// 2. Perform TTL Eviction using CleanupRateLimiterStaleEntries(0)
	// Sleep 1ms to ensure now.Sub(b.lastRefill) > 0 duration
	time.Sleep(1 * time.Millisecond)
	middleware.CleanupRateLimiterStaleEntries(0)

	// 3. Verify bucket was purged and fresh requests can succeed again
	wAfterEvict := httptest.NewRecorder()
	reqAfterEvict, _ := http.NewRequest("GET", "/api/test-ttl", nil)
	reqAfterEvict.RemoteAddr = clientIP + ":12345"
	router.ServeHTTP(wAfterEvict, reqAfterEvict)

	if wAfterEvict.Code != http.StatusOK {
		t.Errorf("Expected 200 OK after TTL eviction of stale rate limiter bucket, got %d", wAfterEvict.Code)
	}
}

func TestRateLimiterStore_TTLEvictionNonStalePreserved(t *testing.T) {
	gin.SetMode(gin.TestMode)

	router := gin.New()
	router.Use(middleware.RateLimiterMiddleware(2, 60*time.Second))
	router.GET("/api/test-preserve", func(c *gin.Context) {
		c.String(http.StatusOK, "ok")
	})

	clientIP := "192.168.10.51"

	// Request 1 and 2 succeed
	for i := 0; i < 2; i++ {
		w := httptest.NewRecorder()
		req, _ := http.NewRequest("GET", "/api/test-preserve", nil)
		req.RemoteAddr = clientIP + ":12345"
		router.ServeHTTP(w, req)
	}

	// Request 3 is blocked (429)
	w3 := httptest.NewRecorder()
	req3, _ := http.NewRequest("GET", "/api/test-preserve", nil)
	req3.RemoteAddr = clientIP + ":12345"
	router.ServeHTTP(w3, req3)
	if w3.Code != http.StatusTooManyRequests {
		t.Fatalf("Expected 429, got %d", w3.Code)
	}

	// Cleanup with TTL = 1 hour (since bucket was refilled seconds ago, it should NOT be purged)
	middleware.CleanupRateLimiterStaleEntries(1 * time.Hour)

	// Request 4 should STILL be blocked because TTL window has not expired
	w4 := httptest.NewRecorder()
	req4, _ := http.NewRequest("GET", "/api/test-preserve", nil)
	req4.RemoteAddr = clientIP + ":12345"
	router.ServeHTTP(w4, req4)

	if w4.Code != http.StatusTooManyRequests {
		t.Errorf("Expected request to remain rate limited (429) when TTL has not expired, got %d", w4.Code)
	}
}

func TestRateLimiterStore_ConcurrentCleanupAndAccess(t *testing.T) {
	gin.SetMode(gin.TestMode)

	router := gin.New()
	router.Use(middleware.RateLimiterMiddleware(100, time.Minute))
	router.GET("/api/test-concurrent-ttl", func(c *gin.Context) {
		c.String(http.StatusOK, "ok")
	})

	var wg sync.WaitGroup
	const numGoroutines = 20

	// Worker goroutines making requests
	for i := 0; i < numGoroutines; i++ {
		wg.Add(1)
		go func(id int) {
			defer wg.Done()
			for req := 0; req < 10; req++ {
				w := httptest.NewRecorder()
				r, _ := http.NewRequest("GET", "/api/test-concurrent-ttl", nil)
				r.RemoteAddr = "10.0.0.1:1234"
				router.ServeHTTP(w, r)
			}
		}(i)
	}

	// Cleaner goroutines purging stale entries concurrently
	for i := 0; i < 5; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			for k := 0; k < 5; k++ {
				middleware.CleanupRateLimiterStaleEntries(100 * time.Millisecond)
				time.Sleep(1 * time.Millisecond)
			}
		}()
	}

	wg.Wait()
	t.Log("Concurrent rate limiter access and TTL cleanup completed successfully without race conditions or crashes.")
}
