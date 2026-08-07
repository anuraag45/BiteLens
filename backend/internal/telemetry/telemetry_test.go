package telemetry_test

import (
	"testing"
	"time"

	"backend/internal/models"
	"backend/internal/telemetry"

	"github.com/google/uuid"
	"gorm.io/datatypes"
)

func TestNormalizeINSTokens(t *testing.T) {
	tests := []struct {
		name     string
		input    string
		contains []string
	}{
		{
			name:     "INS with space",
			input:    "Contains INS 621 and salt",
			contains: []string{"INS-621", "621"},
		},
		{
			name:     "E number without dash",
			input:    "Contains E621 and water",
			contains: []string{"INS-621", "621"},
		},
		{
			name:     "E number with dash",
			input:    "E-621 in list",
			contains: []string{"INS-621", "621"},
		},
		{
			name:     "Lowercase ins",
			input:    "ins621 added",
			contains: []string{"INS-621", "621"},
		},
		{
			name:     "MSG alias",
			input:    "Contains MSG for flavor",
			contains: []string{"INS-621", "621"},
		},
		{
			name:     "Multiple additives",
			input:    "Ingredients: INS 102, E-621, and Aspartame",
			contains: []string{"INS-102", "INS-621", "INS-951"},
		},
		{
			name:     "Standalone 3-4 digit numbers regardless of prefix",
			input:    "Contains 621, 330, 102, and 1422",
			contains: []string{"INS-621", "621", "INS-330", "330", "INS-102", "102", "INS-1422", "1422"},
		},
		{
			name:     "Mixed explicit and standalone numbers",
			input:    "Contains INS 621 and standalone 330",
			contains: []string{"INS-621", "621", "INS-330", "330"},
		},
		{
			name:     "Empty text",
			input:    "",
			contains: []string{},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			tokens := telemetry.NormalizeINSTokens(tt.input)
			if len(tt.contains) == 0 && len(tokens) != 0 {
				t.Errorf("Expected empty tokens, got %v", tokens)
			}
			tokenMap := make(map[string]bool)
			for _, tok := range tokens {
				tokenMap[tok] = true
			}
			for _, expected := range tt.contains {
				if !tokenMap[expected] {
					t.Errorf("Expected tokens to contain %s, got %v", expected, tokens)
				}
			}
		})
	}
}

func TestCalculateNOVAGroup(t *testing.T) {
	// Group 1: No additives
	if group := telemetry.CalculateNOVAGroup([]models.Additive{}); group != 1 {
		t.Errorf("Expected NOVA Group 1 for zero additives, got %d", group)
	}

	// Group 2: Processed culinary ingredients
	culinary := []models.Additive{
		{INSCode: "INS-500", Name: "Salt", RiskLevel: "LOW", Description: "Processed culinary ingredient"},
	}
	if group := telemetry.CalculateNOVAGroup(culinary); group != 2 {
		t.Errorf("Expected NOVA Group 2 for culinary ingredient, got %d", group)
	}

	// Group 4: High risk additive
	highRisk := []models.Additive{
		{INSCode: "INS-102", Name: "Tartrazine", RiskLevel: "HIGH"},
	}
	if group := telemetry.CalculateNOVAGroup(highRisk); group != 4 {
		t.Errorf("Expected NOVA Group 4 for HIGH risk additive, got %d", group)
	}

	// Group 4: Ultra-processed description marker (flavor enhancer)
	ultraProcessed := []models.Additive{
		{INSCode: "INS-621", Name: "Monosodium Glutamate", RiskLevel: "LOW", Description: "Common flavor enhancer"},
	}
	if group := telemetry.CalculateNOVAGroup(ultraProcessed); group != 4 {
		t.Errorf("Expected NOVA Group 4 for flavor enhancer description, got %d", group)
	}

	// Group 3: 1 low-risk preservative
	lowRisk := []models.Additive{
		{INSCode: "INS-330", Name: "Citric Acid", RiskLevel: "LOW", Description: "Acidity regulator"},
	}
	if group := telemetry.CalculateNOVAGroup(lowRisk); group != 3 {
		t.Errorf("Expected NOVA Group 3 for 1 low-risk processing additive, got %d", group)
	}
}

func TestCalculateGoalScore(t *testing.T) {
	nutrientsJSON := []byte(`{"sugar":"15g","protein":"25g","trans_fat":"0g"}`)
	p := models.Product{
		Name:                "Protein Bar",
		UndeclaredNutrients: datatypes.JSON(nutrientsJSON),
		DataConfidence:      "HIGH",
	}

	// Muscle gain + Weight gain -> high protein should boost score
	score := telemetry.CalculateGoalScore(p, "weight_gain", "muscle_gain")
	if score < 80.0 {
		t.Errorf("Expected high score (>80) for high protein bar in muscle/weight gain goal, got %f", score)
	}

	// Weight loss with high sugar -> should deduct points for sugar
	scoreLoss := telemetry.CalculateGoalScore(p, "weight_loss", "muscle_gain")
	if scoreLoss >= score {
		t.Errorf("Expected lower score for weight loss with 15g sugar compared to weight gain, loss score: %f, gain score: %f", scoreLoss, score)
	}
}

func TestGenerateTraceabilityHash(t *testing.T) {
	userID := uuid.New()
	productID := uuid.New()
	rawText := "Ingredients: INS 621, Salt, Water"
	timestamp := time.Date(2026, 8, 7, 12, 0, 0, 0, time.UTC)

	hash1 := telemetry.GenerateTraceabilityHash(userID, productID, rawText, timestamp)
	hash2 := telemetry.GenerateTraceabilityHash(userID, productID, rawText, timestamp)

	if hash1 != hash2 {
		t.Errorf("Expected deterministic hash generation, got %s and %s", hash1, hash2)
	}

	if len(hash1) != 64 {
		t.Errorf("Expected 64-character SHA-256 hex string, got length %d", len(hash1))
	}
}
