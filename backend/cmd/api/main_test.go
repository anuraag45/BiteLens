package main

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"backend/internal/db"
	"backend/internal/handlers"
)

func TestSetupRouterHealthCheck(t *testing.T) {
	testDB, err := db.InitTestDB()
	if err != nil {
		t.Fatalf("Failed to init test DB: %v", err)
	}
	if err := db.AutoMigrate(testDB); err != nil {
		t.Fatalf("AutoMigrate failed: %v", err)
	}

	h := handlers.NewHandler(testDB, "test-secret")
	router := setupRouter(h, "test-secret", []string{"http://localhost:3000"})

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/healthz", nil)
	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("Expected 200 OK for /healthz, got %d", w.Code)
	}
}
