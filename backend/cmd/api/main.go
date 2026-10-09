package main

import (
	"context"
	"errors"
	"log"
	"net/http"
	"os"
	"os/signal"
	"strings"
	"syscall"
	"time"

	"backend/internal/db"
	"backend/internal/handlers"
	"backend/internal/middleware"

	"github.com/gin-gonic/gin"
)

func setupRouter(h *handlers.Handler, jwtSecret string, allowedOrigins []string) *gin.Engine {
	router := gin.Default()

	// Apply CORS Middleware
	router.Use(middleware.CORSMiddleware(allowedOrigins))

	// Health check endpoints
	router.GET("/healthz", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status": "ok",
		})
	})

	router.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status":  "ok",
			"service": "BiteLens API",
		})
	})

	router.GET("/api/v1/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status":  "ok",
			"service": "BiteLens API",
		})
	})

	// Public Auth routes
	authRoutes := router.Group("/api/v1/auth")
	{
		authRoutes.POST("/register", h.Register)
		authRoutes.POST("/login", h.Login)
		authRoutes.POST("/google", h.GoogleAuth)
		authRoutes.POST("/logout", h.Logout)

		// Protected Auth routes
		protectedAuth := authRoutes.Group("/")
		protectedAuth.Use(middleware.AuthMiddleware(jwtSecret))
		{
			protectedAuth.GET("/me", h.Me)
			protectedAuth.POST("/parental-consent", h.ParentalConsent)
		}
	}

	// API v1 routes
	apiRoutes := router.Group("/api/v1")
	{
		apiRoutes.GET("/additives/:code", h.GetAdditive)

		// Protected API routes
		protectedAPI := apiRoutes.Group("/")
		protectedAPI.Use(middleware.AuthMiddleware(jwtSecret))
		{
			protectedAPI.POST("/scan", middleware.RateLimiterMiddleware(10, time.Minute), h.Scan)
			protectedAPI.GET("/history", h.GetHistory)
		}
	}

	return router
}

func main() {
	dsn := os.Getenv("DATABASE_URL")
	database, err := db.InitDB(dsn)
	if err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}

	if err := db.AutoMigrate(database); err != nil {
		log.Fatalf("Failed to auto-migrate database: %v", err)
	}

	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		jwtSecret = "default-bitelens-dev-secret-key-change-in-prod"
		log.Println("WARNING: JWT_SECRET not set, using default development secret.")
	}

	originsEnv := os.Getenv("ALLOWED_ORIGINS")
	var allowedOrigins []string
	if originsEnv != "" {
		origins := strings.Split(originsEnv, ",")
		for _, o := range origins {
			if trimmed := strings.TrimSpace(o); trimmed != "" {
				allowedOrigins = append(allowedOrigins, trimmed)
			}
		}
	} else {
		allowedOrigins = []string{"http://localhost:3000", "http://localhost:5173"}
	}

	h := handlers.NewHandler(database, jwtSecret)
	router := setupRouter(h, jwtSecret, allowedOrigins)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	server := &http.Server{
		Addr:    ":" + port,
		Handler: router,
	}

	// Start server in background goroutine
	go func() {
		log.Printf("Starting BiteLens API server on port %s...\n", port)
		if err := server.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			log.Fatalf("Server ListenAndServe error: %v\n", err)
		}
	}()

	// Graceful OS SIGTERM / SIGINT shutdown handler
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("Shutting down BiteLens API server gracefully...")

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := server.Shutdown(ctx); err != nil {
		log.Fatalf("Server forced shutdown: %v\n", err)
	}

	log.Println("Server shutdown complete.")
}
