package middleware

import (
	"net/http"
	"strings"
	"sync"
	"time"

	"backend/internal/auth"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type tokenBucket struct {
	tokens     float64
	maxTokens  float64
	refillRate float64 // tokens per second
	lastRefill time.Time
}

type rateLimiterStore struct {
	mu      sync.Mutex
	buckets map[string]*tokenBucket
}

var (
	limiterStore = &rateLimiterStore{
		buckets: make(map[string]*tokenBucket),
	}
	limiterCleanerOnce sync.Once
)

// CleanupStaleBuckets purges buckets that have not been refilled/updated within the given TTL window.
func (s *rateLimiterStore) CleanupStaleBuckets(ttl time.Duration) {
	s.mu.Lock()
	defer s.mu.Unlock()
	now := time.Now()
	for key, b := range s.buckets {
		if now.Sub(b.lastRefill) > ttl {
			delete(s.buckets, key)
		}
	}
}

// CleanupRateLimiterStaleEntries purges rate limiter entries inactive for longer than ttl.
func CleanupRateLimiterStaleEntries(ttl time.Duration) {
	limiterStore.CleanupStaleBuckets(ttl)
}

func startLimiterCleaner() {
	limiterCleanerOnce.Do(func() {
		go func() {
			ticker := time.NewTicker(2 * time.Minute)
			for range ticker.C {
				limiterStore.CleanupStaleBuckets(10 * time.Minute)
			}
		}()
	})
}

// RateLimiterMiddleware provides token-bucket IP/User rate limiting (e.g. 10 req/min for OCR scan).
func RateLimiterMiddleware(rateLimit int, window time.Duration) gin.HandlerFunc {
	startLimiterCleaner()
	refillRate := float64(rateLimit) / window.Seconds()
	maxTokens := float64(rateLimit)

	return func(c *gin.Context) {
		// Identify client by UserID if present in context, or by client IP
		key := c.ClientIP()
		if uID, exists := c.Get("userID"); exists {
			if uidUUID, ok := uID.(uuid.UUID); ok {
				key = uidUUID.String()
			} else if uidStr, ok := uID.(string); ok {
				key = uidStr
			}
		}

		limiterStore.mu.Lock()
		b, exists := limiterStore.buckets[key]
		now := time.Now()

		if exists && now.Sub(b.lastRefill) > 10*time.Minute {
			delete(limiterStore.buckets, key)
			exists = false
		}

		if !exists {
			b = &tokenBucket{
				tokens:     maxTokens - 1.0,
				maxTokens:  maxTokens,
				refillRate: refillRate,
				lastRefill: now,
			}
			limiterStore.buckets[key] = b
			limiterStore.mu.Unlock()
			c.Next()
			return
		}

		// Calculate refilled tokens
		elapsed := now.Sub(b.lastRefill).Seconds()
		b.tokens += elapsed * b.refillRate
		if b.tokens > b.maxTokens {
			b.tokens = b.maxTokens
		}
		b.lastRefill = now

		if b.tokens >= 1.0 {
			b.tokens -= 1.0
			limiterStore.mu.Unlock()
			c.Next()
			return
		}

		limiterStore.mu.Unlock()
		c.JSON(http.StatusTooManyRequests, gin.H{
			"error": "rate limit exceeded",
		})
		c.Abort()
	}
}

// CORSMiddleware provides strict origin CORS credentials validation.
func CORSMiddleware(allowedOrigins []string) gin.HandlerFunc {
	return func(c *gin.Context) {
		origin := c.Request.Header.Get("Origin")

		if origin != "" {
			allowed := false
			isWildcard := false
			for _, o := range allowedOrigins {
				if strings.EqualFold(o, origin) {
					allowed = true
					break
				}
				if o == "*" {
					isWildcard = true
				}
			}

			if allowed {
				c.Header("Access-Control-Allow-Origin", origin)
				c.Header("Access-Control-Allow-Credentials", "true")
				c.Header("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With, Cookie")
				c.Header("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE, PATCH")
			} else if isWildcard {
				c.Header("Access-Control-Allow-Origin", "*")
				c.Header("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With, Cookie")
				c.Header("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE, PATCH")
			}
		}

		if c.Request.Method == http.MethodOptions {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}

		c.Next()
	}
}

// AuthMiddleware validates auth_token HttpOnly cookie (or Bearer header) and attaches userID & email to Gin context.
func AuthMiddleware(jwtSecret string) gin.HandlerFunc {
	return func(c *gin.Context) {
		tokenStr, err := c.Cookie("auth_token")
		if err != nil || tokenStr == "" {
			// Fallback check for Authorization: Bearer <token>
			authHeader := c.GetHeader("Authorization")
			if strings.HasPrefix(authHeader, "Bearer ") {
				tokenStr = strings.TrimPrefix(authHeader, "Bearer ")
			}
		}

		if tokenStr == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized: missing authentication token"})
			c.Abort()
			return
		}

		claims, err := auth.ValidateJWT(tokenStr, jwtSecret)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized: invalid or expired token"})
			c.Abort()
			return
		}

		c.Set("userID", claims.UserID)
		c.Set("email", claims.Email)
		c.Set("user_id", claims.UserID)

		c.Next()
	}
}
