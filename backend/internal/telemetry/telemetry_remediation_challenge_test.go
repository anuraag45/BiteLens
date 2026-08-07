package telemetry_test

import (
	"testing"

	"backend/internal/models"
	"backend/internal/telemetry"
)

// ============================================================================
// 1. EMPIRICAL CHALLENGE: NormalizeINSTokens() Standalone 3-4 Digit Capture
// ============================================================================

func TestNormalizeINSTokens_StandaloneDigitsEmpirical(t *testing.T) {
	standaloneCases := []struct {
		input            string
		expectedTokens   []string
		description      string
	}{
		{
			input:          "621",
			expectedTokens: []string{"INS-621", "621"},
			description:    "Standalone 3-digit number 621",
		},
		{
			input:          "330",
			expectedTokens: []string{"INS-330", "330"},
			description:    "Standalone 3-digit number 330",
		},
		{
			input:          "102",
			expectedTokens: []string{"INS-102", "102"},
			description:    "Standalone 3-digit number 102",
		},
		{
			input:          "1422",
			expectedTokens: []string{"INS-1422", "1422"},
			description:    "Standalone 4-digit number 1422",
		},
		{
			input:          "Contains 621, 330, 102, and 1422 in text",
			expectedTokens: []string{"INS-621", "621", "INS-330", "330", "INS-102", "102", "INS-1422", "1422"},
			description:    "Multiple standalone 3-4 digit numbers in sentence",
		},
		{
			input:          "INS 621 and standalone 330",
			expectedTokens: []string{"INS-621", "621", "INS-330", "330"},
			description:    "Mixed explicit INS prefix and standalone number",
		},
		{
			input:          "Additives: 150a, 471b",
			expectedTokens: []string{"INS-150A", "150A", "INS-471B", "471B"},
			description:    "Standalone 3-digit with trailing letter code",
		},
	}

	for _, tc := range standaloneCases {
		t.Run(tc.description, func(t *testing.T) {
			tokens := telemetry.NormalizeINSTokens(tc.input)
			tokenMap := make(map[string]bool)
			for _, tok := range tokens {
				tokenMap[tok] = true
			}

			for _, expected := range tc.expectedTokens {
				if !tokenMap[expected] {
					t.Errorf("[%s] Expected token '%s' not found in result: %v", tc.description, expected, tokens)
				}
			}
		})
	}
}

func TestNormalizeINSTokens_StandaloneDigitsEdgeCases(t *testing.T) {
	// False positives / Boundary testing
	t.Run("Non-INS numbers filtering vs capture", func(t *testing.T) {
		// 2-digit numbers like "42" should NOT be matched as INS tokens
		tokens2Digit := telemetry.NormalizeINSTokens("Item 42 with salt")
		for _, tok := range tokens2Digit {
			if tok == "42" || tok == "INS-42" {
				t.Errorf("2-digit number '42' should not be normalized as INS token, got: %v", tokens2Digit)
			}
		}

		// 5-digit numbers like "90210" should NOT be matched as INS tokens
		tokens5Digit := telemetry.NormalizeINSTokens("Zipcode 90210")
		for _, tok := range tokens5Digit {
			if tok == "90210" || tok == "INS-90210" {
				t.Errorf("5-digit number '90210' should not be normalized as INS token, got: %v", tokens5Digit)
			}
		}
	})
}

// ============================================================================
// 2. EMPIRICAL CHALLENGE: CalculateNOVAGroup() Reachability for Group 2
// ============================================================================

func TestCalculateNOVAGroup_Group2ReachabilityEmpirical(t *testing.T) {
	culinaryInputs := []struct {
		name        string
		additives   []models.Additive
		expectedGroup int
	}{
		{
			name: "Salt alone",
			additives: []models.Additive{
				{INSCode: "SALT-01", Name: "Salt", RiskLevel: "LOW", Description: "Table salt / sodium chloride"},
			},
			expectedGroup: 2,
		},
		{
			name: "Sugar alone",
			additives: []models.Additive{
				{INSCode: "SUGAR-01", Name: "Sugar", RiskLevel: "LOW", Description: "Refined cane sugar"},
			},
			expectedGroup: 2,
		},
		{
			name: "Vegetable Oil alone",
			additives: []models.Additive{
				{INSCode: "OIL-01", Name: "Vegetable Oil", RiskLevel: "LOW", Description: "Pressed cooking oil"},
			},
			expectedGroup: 2,
		},
		{
			name: "Butter alone",
			additives: []models.Additive{
				{INSCode: "BUTTER-01", Name: "Butter", RiskLevel: "LOW", Description: "Dairy butter fat"},
			},
			expectedGroup: 2,
		},
		{
			name: "Vinegar alone",
			additives: []models.Additive{
				{INSCode: "VINEGAR-01", Name: "Vinegar", RiskLevel: "LOW", Description: "Fermented culinary vinegar"},
			},
			expectedGroup: 2,
		},
		{
			name: "Starch alone",
			additives: []models.Additive{
				{INSCode: "STARCH-01", Name: "Corn Starch", RiskLevel: "LOW", Description: "Culinary thickening starch"},
			},
			expectedGroup: 2,
		},
		{
			name: "Seasoning alone",
			additives: []models.Additive{
				{INSCode: "SEASONING-01", Name: "Seasoning Salt", RiskLevel: "LOW", Description: "Culinary seasoning mix"},
			},
			expectedGroup: 2,
		},
		{
			name: "Additive with RiskLevel = CULINARY explicitly",
			additives: []models.Additive{
				{INSCode: "CUL-01", Name: "Culinary Fat", RiskLevel: "CULINARY", Description: "Pure lard"},
			},
			expectedGroup: 2,
		},
		{
			name: "Two culinary ingredients (Salt + Sugar)",
			additives: []models.Additive{
				{INSCode: "SALT-01", Name: "Salt", RiskLevel: "LOW", Description: "Table salt"},
				{INSCode: "SUGAR-01", Name: "Sugar", RiskLevel: "LOW", Description: "Refined sugar"},
			},
			expectedGroup: 2,
		},
	}

	for _, tc := range culinaryInputs {
		t.Run(tc.name, func(t *testing.T) {
			group := telemetry.CalculateNOVAGroup(tc.additives)
			if group != tc.expectedGroup {
				t.Errorf("[%s] Expected NOVA Group %d, got %d", tc.name, tc.expectedGroup, group)
			}
		})
	}
}

func TestCalculateNOVAGroup_CulinaryEdgeCasesAndChallenges(t *testing.T) {
	// Challenge: What happens when 3 or more culinary ingredients are present?
	// E.g., Salt + Sugar + Olive Oil
	t.Run("Three culinary ingredients challenge", func(t *testing.T) {
		threeCulinary := []models.Additive{
			{INSCode: "SALT-01", Name: "Salt", RiskLevel: "LOW", Description: "Table salt"},
			{INSCode: "SUGAR-01", Name: "Sugar", RiskLevel: "LOW", Description: "Refined sugar"},
			{INSCode: "OIL-01", Name: "Olive Oil", RiskLevel: "LOW", Description: "Extra virgin olive oil"},
		}
		group := telemetry.CalculateNOVAGroup(threeCulinary)
		t.Logf("Three culinary ingredients (Salt, Sugar, Olive Oil) classified as NOVA Group %d", group)
		// Note: len(additives) >= 3 rule forces Group 4 in current implementation.
	})

	// Contrast test: 1 Non-culinary low-risk additive vs 1 Culinary ingredient
	t.Run("Group 3 vs Group 2 distinction", func(t *testing.T) {
		// Non-culinary preservative (Citric Acid) -> Group 3
		preservative := []models.Additive{
			{INSCode: "INS-330", Name: "Citric Acid", RiskLevel: "LOW", Description: "Acidity regulator"},
		}
		group3 := telemetry.CalculateNOVAGroup(preservative)
		if group3 != 3 {
			t.Errorf("Expected NOVA Group 3 for Citric Acid preservative, got %d", group3)
		}

		// Culinary ingredient (Salt) -> Group 2
		salt := []models.Additive{
			{INSCode: "SALT-01", Name: "Salt", RiskLevel: "LOW", Description: "Table salt"},
		}
		group2 := telemetry.CalculateNOVAGroup(salt)
		if group2 != 2 {
			t.Errorf("Expected NOVA Group 2 for Salt, got %d", group2)
		}
	})

	// Ultra-processed overrides culinary
	t.Run("Culinary + Ultra-processed marker -> Group 4", func(t *testing.T) {
		mixed := []models.Additive{
			{INSCode: "SALT-01", Name: "Salt with MSG", RiskLevel: "LOW", Description: "Table salt with flavor enhancer"},
		}
		group := telemetry.CalculateNOVAGroup(mixed)
		if group != 4 {
			t.Errorf("Expected NOVA Group 4 when ultra-processed marker 'flavor enhancer' is present, got %d", group)
		}
	})
}
