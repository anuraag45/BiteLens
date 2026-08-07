package handlers_test

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"backend/internal/models"
)

// TestScanEndpoint_RateLimiting15Requests tests sending 15 rapid requests to POST /api/v1/scan
// with a valid auth JWT token. Verifies that requests 1-10 succeed (HTTP 200) with full scan response,
// and requests 11-15 are rejected with HTTP 429 Too Many Requests.
func TestScanEndpoint_RateLimiting15Requests(t *testing.T) {
	router, testDB, _, _ := setupTestRouter(t)

	// Seed an additive
	additive := models.Additive{
		INSCode:     "INS-621",
		Name:        "Monosodium Glutamate",
		RiskLevel:   "MEDIUM",
		Description: "Common flavor enhancer",
	}
	testDB.Create(&additive)

	// Register user and get token
	regPayload := map[string]string{
		"email":         "ratelimit_scanner@example.com",
		"password":      "password123",
		"name":          "Rate Limit Scanner",
		"date_of_birth": "1992-02-02",
	}
	jsonBytes, _ := json.Marshal(regPayload)

	wReg := httptest.NewRecorder()
	reqReg, _ := http.NewRequest("POST", "/api/v1/auth/register", bytes.NewBuffer(jsonBytes))
	reqReg.Header.Set("Content-Type", "application/json")
	router.ServeHTTP(wReg, reqReg)

	if wReg.Code != http.StatusCreated {
		t.Fatalf("Failed to register user: %s", wReg.Body.String())
	}

	var regResp map[string]interface{}
	json.Unmarshal(wReg.Body.Bytes(), &regResp)
	token := regResp["token"].(string)

	scanPayload := map[string]string{
		"barcode":     "8901234567890",
		"raw_text":    "Ingredients: Salt, INS 621, Wheat Flour",
		"weight_goal": "weight_loss",
		"muscle_goal": "muscle_gain",
		"name":        "Noodle Bowl",
		"brand":       "BrandX",
	}
	scanBytes, _ := json.Marshal(scanPayload)

	var successCount, rateLimitedCount int

	for i := 1; i <= 15; i++ {
		wScan := httptest.NewRecorder()
		reqScan, _ := http.NewRequest("POST", "/api/v1/scan", bytes.NewBuffer(scanBytes))
		reqScan.Header.Set("Content-Type", "application/json")
		reqScan.Header.Set("Authorization", "Bearer "+token)

		router.ServeHTTP(wScan, reqScan)

		if i <= 10 {
			if wScan.Code != http.StatusOK {
				t.Errorf("Request %d/15 expected HTTP 200 OK, got HTTP %d: %s", i, wScan.Code, wScan.Body.String())
			} else {
				successCount++
				var resp map[string]interface{}
				json.Unmarshal(wScan.Body.Bytes(), &resp)

				if resp["traceability_hash"] == nil || resp["traceability_hash"].(string) == "" {
					t.Errorf("Request %d missing traceability_hash", i)
				}
				if resp["nova_group"] == nil {
					t.Errorf("Request %d missing nova_group", i)
				}
				if resp["goal_score"] == nil {
					t.Errorf("Request %d missing goal_score", i)
				}
			}
		} else {
			if wScan.Code != http.StatusTooManyRequests {
				t.Errorf("Request %d/15 expected HTTP 429 Too Many Requests, got HTTP %d: %s", i, wScan.Code, wScan.Body.String())
			} else {
				rateLimitedCount++
				var errResp map[string]interface{}
				json.Unmarshal(wScan.Body.Bytes(), &errResp)
				if errResp["error"] != "rate limit exceeded" {
					t.Errorf("Request %d expected error 'rate limit exceeded', got %v", i, errResp["error"])
				}
			}
		}
	}

	t.Logf("Scan API Rate Limiting Test Summary: 15 Requests sent. Success (200): %d, Rate Limited (429): %d", successCount, rateLimitedCount)

	if successCount != 10 {
		t.Errorf("Expected exactly 10 successful requests, got %d", successCount)
	}
	if rateLimitedCount != 5 {
		t.Errorf("Expected exactly 5 rate-limited requests, got %d", rateLimitedCount)
	}
}
