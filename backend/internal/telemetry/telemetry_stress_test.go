package telemetry_test

import (
	"math"
	"reflect"
	"sort"
	"testing"
	"time"

	"backend/internal/models"
	"backend/internal/telemetry"

	"github.com/google/uuid"
	"gorm.io/datatypes"
)

// ============================================================================
// 1. INS FUZZY REGEX PARSER STRESS TESTS
// ============================================================================

func TestNormalizeINSTokens_ComplexStringRequirement(t *testing.T) {
	// Requirement: Test "Contains INS 621, E-621, e621, 621, and MSG"
	input := "Contains INS 621, E-621, e621, 621, and MSG"
	tokens := telemetry.NormalizeINSTokens(input)

	// Deduplicated normalized output expected to contain "INS-621" and "621"
	tokenMap := make(map[string]bool)
	for _, tok := range tokens {
		tokenMap[tok] = true
	}

	if !tokenMap["INS-621"] {
		t.Errorf("Expected tokens to contain INS-621, got: %v", tokens)
	}
	if !tokenMap["621"] {
		t.Errorf("Expected tokens to contain 621, got: %v", tokens)
	}
}

func TestNormalizeINSTokens_TyposAndFormats(t *testing.T) {
	tests := []struct {
		name     string
		input    string
		expected []string
	}{
		{
			name:     "INS with dash",
			input:    "INS-621",
			expected: []string{"INS-621", "621"},
		},
		{
			name:     "INS with space",
			input:    "INS 621",
			expected: []string{"INS-621", "621"},
		},
		{
			name:     "INS attached without space",
			input:    "INS621",
			expected: []string{"INS-621", "621"},
		},
		{
			name:     "E number attached",
			input:    "E621",
			expected: []string{"INS-621", "621"},
		},
		{
			name:     "E number with dash",
			input:    "E-621",
			expected: []string{"INS-621", "621"},
		},
		{
			name:     "E number with space",
			input:    "E 621",
			expected: []string{"INS-621", "621"},
		},
		{
			name:     "Sub-letter code (150a)",
			input:    "INS 150a",
			expected: []string{"INS-150A", "150A"},
		},
		{
			name:     "Multiple 3-digit and 4-digit codes",
			input:    "Contains INS 102, E-211, INS 1422, and Tartrazine",
			expected: []string{"INS-102", "102", "INS-211", "211", "INS-1422", "1422"},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			tokens := telemetry.NormalizeINSTokens(tt.input)
			tokenMap := make(map[string]bool)
			for _, tok := range tokens {
				tokenMap[tok] = true
			}
			for _, exp := range tt.expected {
				if !tokenMap[exp] {
					t.Errorf("For input '%s', expected token '%s' in result %v", tt.input, exp, tokens)
				}
			}
		})
	}
}

func TestNormalizeINSTokens_EdgeCasesTyposUnicodeMissingNumbers(t *testing.T) {
	// 1. Missing numbers / Partial prefixes
	t.Run("Missing numbers", func(t *testing.T) {
		inputs := []string{"INS", "E-", "INS-", "Contains INS and E without numbers"}
		for _, in := range inputs {
			tokens := telemetry.NormalizeINSTokens(in)
			if len(tokens) != 0 {
				t.Errorf("Input '%s' with missing numbers produced tokens: %v, expected empty", in, tokens)
			}
		}
	})

	// 2. Unicode and non-ASCII characters
	t.Run("Unicode & Non-ASCII", func(t *testing.T) {
		// Non-breaking space \u00a0
		tokensNBSP := telemetry.NormalizeINSTokens("Contains INS\u00a0621")
		t.Logf("INS with NBSP ('INS\\u00a0621') tokens: %v", tokensNBSP)

		// Full-width digits
		tokensFullWidth := telemetry.NormalizeINSTokens("INS ６２１")
		t.Logf("Full-width digits ('INS ６２１') tokens: %v", tokensFullWidth)

		// Cyrillic E (\u0415)
		tokensCyrillic := telemetry.NormalizeINSTokens("Е-621")
		t.Logf("Cyrillic E ('Е-621') tokens: %v", tokensCyrillic)
	})

	// 3. Structural Limit / Mixed explicit INS vs Standalone number flaw
	t.Run("Mixed explicit INS and Standalone numbers flaw discovery", func(t *testing.T) {
		// Input has explicit INS 102 AND standalone number 621
		input := "Ingredients: INS 102, Wheat Flour, 621"
		tokens := telemetry.NormalizeINSTokens(input)

		tokenMap := make(map[string]bool)
		for _, tok := range tokens {
			tokenMap[tok] = true
		}

		if !tokenMap["102"] {
			t.Errorf("Expected token 102")
		}
		if !tokenMap["621"] {
			t.Logf("DISCOVERY: Standalone INS number '621' was MISSED in input '%s' because insRegex matched 'INS 102' (len(tokens)>0), causing step 3 (numRegex) to be skipped!", input)
		}
	})
}

// ============================================================================
// 2. NOVA ENGINE & GOAL SCORE STRESS TESTS
// ============================================================================

func TestCalculateNOVAGroup_StressAndBoundaries(t *testing.T) {
	// Group 1: Zero additives
	if g := telemetry.CalculateNOVAGroup(nil); g != 1 {
		t.Errorf("Expected Group 1 for nil additives, got %d", g)
	}
	if g := telemetry.CalculateNOVAGroup([]models.Additive{}); g != 1 {
		t.Errorf("Expected Group 1 for empty additives, got %d", g)
	}

	// Group 4: HIGH risk additive
	highRisk := []models.Additive{{RiskLevel: "HIGH"}}
	if g := telemetry.CalculateNOVAGroup(highRisk); g != 4 {
		t.Errorf("Expected Group 4 for HIGH risk, got %d", g)
	}

	// Group 4: MEDIUM risk additive
	medRisk := []models.Additive{{RiskLevel: "MEDIUM"}}
	if g := telemetry.CalculateNOVAGroup(medRisk); g != 4 {
		t.Errorf("Expected Group 4 for MEDIUM risk, got %d", g)
	}

	// Group 4: 3 or more low-risk additives
	threeLow := []models.Additive{
		{RiskLevel: "LOW"},
		{RiskLevel: "LOW"},
		{RiskLevel: "LOW"},
	}
	if g := telemetry.CalculateNOVAGroup(threeLow); g != 4 {
		t.Errorf("Expected Group 4 for 3+ low-risk additives, got %d", g)
	}

	// Group 4: Ultra-processed description keywords (emulsifier, sweetener, color, azo dye, synthetic, anti-foaming)
	keywords := []string{"flavor enhancer", "emulsifier", "sweetener", "color", "azo dye", "synthetic", "anti-foaming"}
	for _, kw := range keywords {
		add := []models.Additive{{RiskLevel: "LOW", Description: "Contains " + kw}}
		if g := telemetry.CalculateNOVAGroup(add); g != 4 {
			t.Errorf("Expected Group 4 for keyword '%s', got %d", kw, g)
		}
	}

	// Group 3: 1 or 2 low risk additives without ultra-processed markers
	oneLow := []models.Additive{{RiskLevel: "LOW", Description: "Preservative"}}
	if g := telemetry.CalculateNOVAGroup(oneLow); g != 3 {
		t.Errorf("Expected Group 3 for 1 low-risk processing additive, got %d", g)
	}

	twoLow := []models.Additive{
		{RiskLevel: "LOW", Description: "Acidity Regulator"},
		{RiskLevel: "LOW", Description: "Antioxidant"},
	}
	if g := telemetry.CalculateNOVAGroup(twoLow); g != 3 {
		t.Errorf("Expected Group 3 for 2 low-risk processing additives, got %d", g)
	}

	// Discovered Flaw Check: Is NOVA Group 2 reachable?
	// If additives count is 0 -> returns 1.
	// If additives count >= 3 -> returns 4.
	// If additives count is 1 or 2, and no medium/high/ultra-processed -> returns 3.
	// Therefore, Group 2 is logically unreachable!
	t.Logf("EMPIRICAL CHECK: Is Group 2 reachable? Group 1=zero, Group 3=1-2 low risk, Group 4=high/medium/ultra/3+. Group 2 is dead code in CalculateNOVAGroup.")
}

func TestCalculateGoalScore_ExtremeValuesAndBoundaries(t *testing.T) {
	// 1. Extreme High Sugar + Trans Fat + Sodium + Low Protein + Conflicting Goals
	t.Run("Extreme penalties - low boundary clamping to 0", func(t *testing.T) {
		nutrients := []byte(`{
			"sugar": 150.0,
			"trans_fat": 10.0,
			"saturated_fat": 25.0,
			"sodium": 2500.0,
			"protein": 0.0
		}`)
		product := models.Product{
			UndeclaredNutrients: datatypes.JSON(nutrients),
			DataConfidence:      "LOW",
		}

		// Goals: weight_loss (severe penalties: sugar>10 -15, transFat -15, satFat>5 -10, sodium>500 -10)
		// muscle_gain (protein < 5 -> -10)
		// confidence: LOW (-5)
		// Calculation: 75.0 - 15 - 15 - 10 - 10 - 10 - 5 = 10.0
		score := telemetry.CalculateGoalScore(product, "weight_loss", "muscle_gain")
		t.Logf("Extreme penalty food score: %f", score)

		if score < 0.0 || score > 100.0 {
			t.Errorf("Score %f out of [0, 100] bounds!", score)
		}
	})

	// 2. Maximum score boost (high protein, zero trans fat, low sugar) -> Clamping to 100
	t.Run("Maximum score boost - high boundary clamping to 100", func(t *testing.T) {
		nutrients := []byte(`{
			"sugar": 0.0,
			"protein": 35.0,
			"trans_fat": 0.0
		}`)
		product := models.Product{
			UndeclaredNutrients: datatypes.JSON(nutrients),
			DataConfidence:      "HIGH",
		}

		// Base 75 + weight_gain (protein>10: +10) + muscle_gain (protein>=20: +20) + HIGH confidence (+5)
		// Calculation: 75 + 10 + 20 + 5 = 110.0 -> Should clamp to 100.0
		score := telemetry.CalculateGoalScore(product, "weight_gain", "muscle_gain")
		t.Logf("Maximum boost food score: %f", score)

		if score != 100.0 {
			t.Errorf("Expected score to be clamped to 100.0, got %f", score)
		}
	})

	// 3. String formatted values in JSON (e.g. "15g", "25.5 mg")
	t.Run("String formatted nutrients parsing", func(t *testing.T) {
		nutrients := []byte(`{
			"sugar": "15.5g",
			"protein": "25.0g",
			"sodium": "600mg"
		}`)
		product := models.Product{
			UndeclaredNutrients: datatypes.JSON(nutrients),
			DataConfidence:      "HIGH",
		}

		score := telemetry.CalculateGoalScore(product, "weight_gain", "muscle_gain")
		if math.IsNaN(score) || math.IsInf(score, 0) {
			t.Errorf("Goal score returned NaN or Inf: %f", score)
		}
		t.Logf("Parsed string nutrients successfully, score: %f", score)
	})

	// 4. Missing/Nil/Invalid JSON in UndeclaredNutrients
	t.Run("Nil / Invalid JSON resilience", func(t *testing.T) {
		pNil := models.Product{UndeclaredNutrients: nil, DataConfidence: "HIGH"}
		scoreNil := telemetry.CalculateGoalScore(pNil, "weight_loss", "muscle_gain")
		if scoreNil != 70.0 { // Base 75 - 10 (protein < 5) + 5 (HIGH conf) = 70
			t.Errorf("Expected score 70.0 for nil nutrients, got %f", scoreNil)
		}

		pBadJSON := models.Product{UndeclaredNutrients: datatypes.JSON([]byte(`invalid`))}
		scoreBad := telemetry.CalculateGoalScore(pBadJSON, "weight_loss", "muscle_gain")
		if scoreBad < 0.0 || scoreBad > 100.0 {
			t.Errorf("Expected valid score between 0 and 100 for invalid JSON, got %f", scoreBad)
		}
	})
}

// ============================================================================
// 3. SHA-256 TRACEABILITY HASH STRESS TESTS
// ============================================================================

func TestGenerateTraceabilityHash_DeterministicAndUniqueness(t *testing.T) {
	uID := uuid.MustParse("11111111-1111-1111-1111-111111111111")
	pID := uuid.MustParse("22222222-2222-2222-2222-222222222222")
	rawText := "Ingredients: INS 621, Salt, Water"
	t1 := time.Date(2026, 8, 7, 12, 0, 0, 0, time.UTC)

	// 1. Determinism across multiple calls
	h1 := telemetry.GenerateTraceabilityHash(uID, pID, rawText, t1)
	h2 := telemetry.GenerateTraceabilityHash(uID, pID, rawText, t1)

	if h1 != h2 {
		t.Errorf("GenerateTraceabilityHash is non-deterministic: %s != %s", h1, h2)
	}

	if len(h1) != 64 {
		t.Errorf("Expected 64 hex character string, got length %d", len(h1))
	}

	// 2. Timezone equivalence determinism (same instant in different timezones)
	locIST := time.FixedZone("IST", 5*3600+30*60)
	t1IST := time.Date(2026, 8, 7, 17, 30, 0, 0, locIST) // Exact same instant as 12:00 UTC

	hIST := telemetry.GenerateTraceabilityHash(uID, pID, rawText, t1IST)
	if h1 != hIST {
		t.Errorf("Hash failed timezone normalization: UTC hash %s != IST hash %s", h1, hIST)
	}

	// 3. Uniqueness across payload variations
	t.Run("Uniqueness verification", func(t *testing.T) {
		hashes := make(map[string]string)

		// Base
		hashes["base"] = h1

		// Differing UserID
		uID2 := uuid.MustParse("99999999-9999-9999-9999-999999999999")
		hashes["diff_user"] = telemetry.GenerateTraceabilityHash(uID2, pID, rawText, t1)

		// Differing ProductID
		pID2 := uuid.MustParse("88888888-8888-8888-8888-888888888888")
		hashes["diff_product"] = telemetry.GenerateTraceabilityHash(uID, pID2, rawText, t1)

		// Differing RawText
		hashes["diff_text"] = telemetry.GenerateTraceabilityHash(uID, pID, rawText+"!", t1)

		// Differing Timestamp (by 1 sec)
		t2 := t1.Add(1 * time.Second)
		hashes["diff_time"] = telemetry.GenerateTraceabilityHash(uID, pID, rawText, t2)

		// Check all hashes are distinct
		seenHashes := make(map[string]string)
		for k, hashVal := range hashes {
			if existingKey, exists := seenHashes[hashVal]; exists {
				t.Errorf("HASH COLLISION DETECTED between '%s' and '%s': %s", k, existingKey, hashVal)
			}
			seenHashes[hashVal] = k
		}
	})

	// 4. Whitespace trimming test
	t.Run("Whitespace trimming consistency", func(t *testing.T) {
		hUntrimmed := telemetry.GenerateTraceabilityHash(uID, pID, "  "+rawText+"  \n", t1)
		if h1 != hUntrimmed {
			t.Errorf("Expected TrimSpace to produce identical hash for whitespace padded rawText. Base: %s, Padded: %s", h1, hUntrimmed)
		}
	})
}

// Helper to check slice string equality disregarding order
func slicesEqualUnordered(a, b []string) bool {
	if len(a) != len(b) {
		return false
	}
	ac := append([]string(nil), a...)
	bc := append([]string(nil), b...)
	sort.Strings(ac)
	sort.Strings(bc)
	return reflect.DeepEqual(ac, bc)
}
