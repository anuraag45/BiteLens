package handlers

import (
	"net/http"
	"strings"
	"time"

	"backend/internal/models"
	"backend/internal/telemetry"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type ScanRequest struct {
	Barcode    string `json:"barcode"`
	RawText    string `json:"raw_text"`
	WeightGoal string `json:"weight_goal"`
	MuscleGoal string `json:"muscle_goal"`
	Brand      string `json:"brand"`
	Name       string `json:"name"`
}

// Scan processes OCR/barcode scan payload, extracts INS tokens, calculates NOVA group & goal score,
// generates SHA-256 traceability hash, and records ScanHistory with DPDP CASCADE foreign key.
func (h *Handler) Scan(c *gin.Context) {
	uIDVal, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	userID, ok := uIDVal.(uuid.UUID)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid user context"})
		return
	}

	var req ScanRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request payload"})
		return
	}

	barcode := strings.TrimSpace(req.Barcode)
	if barcode == "" {
		// Default synthetic barcode if raw_text provided without barcode
		barcode = "SCAN-" + uuid.New().String()[:12]
	}

	var product models.Product
	err := h.DB.Where("barcode = ?", barcode).First(&product).Error
	if err != nil {
		prodName := req.Name
		if prodName == "" {
			prodName = "Scanned Food Product"
		}
		prodBrand := req.Brand
		if prodBrand == "" {
			prodBrand = "Generic"
		}

		product = models.Product{
			Name:           prodName,
			Barcode:        barcode,
			Brand:          prodBrand,
			Basis:          "per 100g",
			DataConfidence: "MEDIUM",
		}

		if err := h.DB.Create(&product).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to record scanned product"})
			return
		}
	}

	// Extract INS tokens
	insTokens := telemetry.NormalizeINSTokens(req.RawText)

	// Fetch additives from database matching extracted INS tokens
	var additives []models.Additive
	if len(insTokens) > 0 {
		h.DB.Where("ins_code IN ?", insTokens).Find(&additives)
	}

	// Calculate NOVA Group & Goal Score
	novaGroup := telemetry.CalculateNOVAGroup(additives)
	goalScore := telemetry.CalculateGoalScore(product, req.WeightGoal, req.MuscleGoal)

	scannedAt := time.Now()
	traceabilityHash := telemetry.GenerateTraceabilityHash(userID, product.ID, req.RawText, scannedAt)

	// Save ScanHistory with DPDP OnDelete:CASCADE FK constraint
	scanHistory := models.ScanHistory{
		UserID:    userID,
		ProductID: product.ID,
		ScannedAt: scannedAt,
	}

	if err := h.DB.Create(&scanHistory).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to save scan history"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"scan_id":           scanHistory.ID,
		"user_id":           userID,
		"product":           product,
		"ins_tokens":        insTokens,
		"additives":         additives,
		"nova_group":        novaGroup,
		"goal_score":        goalScore,
		"traceability_hash": traceabilityHash,
		"scanned_at":        scannedAt,
	})
}

// GetAdditive retrieves food additive safety details by INS code.
func (h *Handler) GetAdditive(c *gin.Context) {
	code := strings.TrimSpace(c.Param("code"))
	if code == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "additive INS code parameter is required"})
		return
	}

	altCode := code
	if strings.HasPrefix(strings.ToUpper(code), "INS-") {
		altCode = strings.TrimPrefix(strings.ToUpper(code), "INS-")
	} else {
		altCode = "INS-" + strings.ToUpper(code)
	}

	var additive models.Additive
	err := h.DB.Where("ins_code = ? OR ins_code = ?", code, altCode).First(&additive).Error
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "additive not found for code: " + code})
		return
	}

	c.JSON(http.StatusOK, additive)
}

// GetHistory returns the authenticated user's scan history with preloaded product information.
func (h *Handler) GetHistory(c *gin.Context) {
	uIDVal, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	userID, ok := uIDVal.(uuid.UUID)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid user context"})
		return
	}

	var history []models.ScanHistory
	if err := h.DB.Preload("Product").Where("user_id = ?", userID).Order("scanned_at desc").Find(&history).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to retrieve scan history"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"history": history,
	})
}
