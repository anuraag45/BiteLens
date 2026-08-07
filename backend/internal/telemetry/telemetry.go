package telemetry

import (
	"crypto/sha256"
	"encoding/json"
	"fmt"
	"math"
	"regexp"
	"strconv"
	"strings"
	"time"

	"backend/internal/models"

	"github.com/google/uuid"
)

var (
	// Regex for INS / E numbers
	insRegex  = regexp.MustCompile(`(?i)\b(?:INS|E)[-\s]?(\d{3,4}[a-z]?)\b`)
	numRegex  = regexp.MustCompile(`\b(\d{3,4}[a-z]?)\b`)

	// Common additive name aliases mapped to INS code numbers
	additiveAliases = map[string]string{
		"msg":                    "621",
		"monosodium glutamate":   "621",
		"tartrazine":             "102",
		"aspartame":              "951",
		"sucralose":              "955",
		"sodium benzoate":        "211",
		"citric acid":            "330",
		"xanthan gum":            "415",
		"lecithin":               "322",
		"caramel color":          "150a",
		"potassium sorbate":      "202",
		"titanium dioxide":       "171",
		"sunset yellow":          "110",
		"allura red":             "129",
	}
)

// NormalizeINSTokens parses raw text and extracts normalized INS and E-number additive codes.
func NormalizeINSTokens(text string) []string {
	if strings.TrimSpace(text) == "" {
		return []string{}
	}

	seen := make(map[string]bool)
	var tokens []string

	addToken := func(code string) {
		code = strings.ToUpper(strings.TrimSpace(code))
		if code == "" {
			return
		}

		// Produce standardized INS format "INS-xxx" and raw numeric format "xxx"
		var formattedINS string
		var rawNum string

		if strings.HasPrefix(code, "INS-") || strings.HasPrefix(code, "E-") {
			rawNum = code[4:]
			formattedINS = "INS-" + rawNum
		} else if strings.HasPrefix(code, "INS") || strings.HasPrefix(code, "E") {
			rawNum = strings.TrimPrefix(strings.TrimPrefix(code, "INS"), "E")
			rawNum = strings.TrimPrefix(rawNum, "-")
			rawNum = strings.TrimSpace(rawNum)
			formattedINS = "INS-" + rawNum
		} else {
			rawNum = code
			formattedINS = "INS-" + rawNum
		}

		if formattedINS != "INS-" && !seen[formattedINS] {
			seen[formattedINS] = true
			tokens = append(tokens, formattedINS)
		}
		if rawNum != "" && !seen[rawNum] {
			seen[rawNum] = true
			tokens = append(tokens, rawNum)
		}
	}

	// 1. Match explicit INS / E tokens (e.g. INS 621, E621, INS-621, ins621)
	matches := insRegex.FindAllStringSubmatch(text, -1)
	for _, m := range matches {
		if len(m) >= 2 {
			addToken("INS-" + m[1])
		}
	}

	// 2. Check for additive alias names (e.g. MSG, Aspartame)
	lowerText := strings.ToLower(text)
	for alias, code := range additiveAliases {
		if strings.Contains(lowerText, alias) {
			addToken(code)
		}
	}

	// 3. Match standalone 3-4 digit numbers regardless of prefix
	numMatches := numRegex.FindAllStringSubmatch(text, -1)
	for _, nm := range numMatches {
		if len(nm) >= 2 {
			addToken(nm[1])
		}
	}

	return tokens
}

// CalculateNOVAGroup calculates the NOVA food processing group (1-4) based on additive classifications.
func CalculateNOVAGroup(additives []models.Additive) int {
	if len(additives) == 0 {
		return 1
	}

	hasUltraProcessed := false
	hasMediumRisk := false
	hasCulinary := false

	for _, a := range additives {
		risk := strings.ToUpper(strings.TrimSpace(a.RiskLevel))
		if risk == "HIGH" {
			return 4
		}
		if risk == "MEDIUM" {
			hasMediumRisk = true
		}

		desc := strings.ToLower(a.Description + " " + a.Name)
		// Check for cosmetic / ultra-processed industrial additive markers
		if strings.Contains(desc, "flavor enhancer") ||
			strings.Contains(desc, "emulsifier") ||
			strings.Contains(desc, "sweetener") ||
			strings.Contains(desc, "color") ||
			strings.Contains(desc, "azo dye") ||
			strings.Contains(desc, "synthetic") ||
			strings.Contains(desc, "anti-foaming") {
			hasUltraProcessed = true
		}

		// Check for processed culinary ingredient markers (salt, sugar, oils, butter, fats, etc.)
		if risk == "CULINARY" ||
			strings.Contains(desc, "culinary") ||
			strings.Contains(desc, "salt") ||
			strings.Contains(desc, "sugar") ||
			strings.Contains(desc, "oil") ||
			strings.Contains(desc, "fat") ||
			strings.Contains(desc, "butter") ||
			strings.Contains(desc, "seasoning") ||
			strings.Contains(desc, "vinegar") ||
			strings.Contains(desc, "starch") {
			hasCulinary = true
		}
	}

	if hasMediumRisk || hasUltraProcessed || len(additives) >= 3 {
		return 4
	}

	if hasCulinary {
		return 2
	}

	return 3
}

// CalculateGoalScore calculates a dual-axis Goal Score alignment engine (weight_goal x muscle_goal) out of 100.
func CalculateGoalScore(product models.Product, weightGoal, muscleGoal string) float64 {
	score := 75.0 // Base score

	// Parse nutrients JSON if present
	var nutrients map[string]interface{}
	if len(product.UndeclaredNutrients) > 0 {
		_ = json.Unmarshal(product.UndeclaredNutrients, &nutrients)
	}

	getNutrientVal := func(key string) float64 {
		if nutrients == nil {
			return 0
		}
		val, exists := nutrients[key]
		if !exists {
			return 0
		}
		switch v := val.(type) {
		case float64:
			return v
		case string:
			// Strip non-numeric chars (e.g. "12g" -> 12.0)
			re := regexp.MustCompile(`[^\d\.]`)
			clean := re.ReplaceAllString(v, "")
			parsed, err := strconv.ParseFloat(clean, 64)
			if err == nil {
				return parsed
			}
		}
		return 0
	}

	sugar := getNutrientVal("sugar") + getNutrientVal("sugar_added") + getNutrientVal("sugars")
	protein := getNutrientVal("protein")
	transFat := getNutrientVal("trans_fat")
	satFat := getNutrientVal("saturated_fat")
	sodium := getNutrientVal("sodium")

	// 1. Weight Goal alignment
	wGoal := strings.ToLower(strings.TrimSpace(weightGoal))
	switch wGoal {
	case "weight_loss", "lose_weight", "cut":
		if sugar > 10 {
			score -= 15.0
		} else if sugar > 5 {
			score -= 8.0
		}
		if transFat > 0 {
			score -= 15.0
		}
		if satFat > 5 {
			score -= 10.0
		}
		if sodium > 500 {
			score -= 10.0
		}
	case "weight_gain", "bulk":
		if protein > 10 {
			score += 10.0
		}
		if transFat > 0 {
			score -= 10.0
		}
	case "maintenance":
		if sugar > 15 {
			score -= 10.0
		}
	}

	// 2. Muscle Goal alignment
	mGoal := strings.ToLower(strings.TrimSpace(muscleGoal))
	switch mGoal {
	case "muscle_gain", "build_muscle", "hypertrophy":
		if protein >= 20 {
			score += 20.0
		} else if protein >= 10 {
			score += 10.0
		} else if protein < 5 {
			score -= 10.0
		}
	case "endurance":
		if protein >= 10 {
			score += 10.0
		}
	case "maintenance":
		if protein >= 10 {
			score += 5.0
		}
	}

	// 3. Data Confidence adjustment
	conf := strings.ToUpper(strings.TrimSpace(product.DataConfidence))
	if conf == "HIGH" {
		score += 5.0
	} else if conf == "LOW" {
		score -= 5.0
	}

	// Clamp score between 0.0 and 100.0
	if score > 100.0 {
		score = 100.0
	}
	if score < 0.0 {
		score = 0.0
	}

	return math.Round(score*10) / 10
}

// GenerateTraceabilityHash calculates a SHA-256 cryptographic hash of the scan payload.
func GenerateTraceabilityHash(userID, productID uuid.UUID, rawText string, timestamp time.Time) string {
	payload := fmt.Sprintf("%s:%s:%s:%s", userID.String(), productID.String(), strings.TrimSpace(rawText), timestamp.UTC().Format(time.RFC3339))
	hash := sha256.Sum256([]byte(payload))
	return fmt.Sprintf("%x", hash)
}
