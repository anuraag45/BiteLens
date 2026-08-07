package handlers

import (
	"net/http"
	"strings"
	"time"

	"backend/internal/auth"
	"backend/internal/models"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type RegisterRequest struct {
	Email       string `json:"email" binding:"required"`
	Password    string `json:"password" binding:"required"`
	Name        string `json:"name"`
	DateOfBirth string `json:"date_of_birth"`
}

type LoginRequest struct {
	Email    string `json:"email" binding:"required"`
	Password string `json:"password" binding:"required"`
}

type GoogleAuthRequest struct {
	IDToken string `json:"id_token"`
	Token   string `json:"token"`
}

type ParentalConsentRequest struct {
	ParentEmail string `json:"parent_email" binding:"required"`
}

func parseDOB(dobStr string) (time.Time, error) {
	if dobStr == "" {
		return time.Time{}, nil
	}
	// Try RFC3339
	t, err := time.Parse(time.RFC3339, dobStr)
	if err == nil {
		return t, nil
	}
	// Try YYYY-MM-DD
	t, err = time.Parse("2006-01-02", dobStr)
	if err == nil {
		return t, nil
	}
	return time.Time{}, err
}

// Register creates a new user with hashed password and calculates age/minor status.
func (h *Handler) Register(c *gin.Context) {
	var req RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request body: email and password are required"})
		return
	}

	req.Email = strings.TrimSpace(strings.ToLower(req.Email))
	if req.Email == "" || req.Password == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "email and password cannot be empty"})
		return
	}

	// Check if user already exists
	var count int64
	h.DB.Model(&models.User{}).Where("email = ?", req.Email).Count(&count)
	if count > 0 {
		c.JSON(http.StatusConflict, gin.H{"error": "user with this email already exists"})
		return
	}

	dob, err := parseDOB(req.DateOfBirth)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid date_of_birth format, use YYYY-MM-DD or RFC3339"})
		return
	}

	hashedPassword, err := auth.HashPassword(req.Password)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to hash password"})
		return
	}

	user := models.User{
		Email:       req.Email,
		Password:    hashedPassword,
		Name:        req.Name,
		DateOfBirth: dob,
	}

	if err := h.DB.Create(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create user"})
		return
	}

	token, err := auth.GenerateJWT(user.ID, user.Email, h.JWTSecret, 24*time.Hour)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to generate authentication token"})
		return
	}

	auth.SetAuthCookie(c, token)

	c.JSON(http.StatusCreated, gin.H{
		"user":  BuildUserResponse(user),
		"token": token,
	})
}

// Login verifies password and sets HttpOnly JWT cookie.
func (h *Handler) Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request body"})
		return
	}

	req.Email = strings.TrimSpace(strings.ToLower(req.Email))
	var user models.User
	if err := h.DB.Where("email = ?", req.Email).First(&user).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid email or password"})
		return
	}

	if !auth.CheckPasswordHash(req.Password, user.Password) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid email or password"})
		return
	}

	token, err := auth.GenerateJWT(user.ID, user.Email, h.JWTSecret, 24*time.Hour)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to generate authentication token"})
		return
	}

	auth.SetAuthCookie(c, token)

	c.JSON(http.StatusOK, gin.H{
		"user":  BuildUserResponse(user),
		"token": token,
	})
}

// GoogleAuth verifies Google ID token, creates or logs in user, and sets HttpOnly JWT cookie.
func (h *Handler) GoogleAuth(c *gin.Context) {
	var req GoogleAuthRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request body"})
		return
	}

	tokenString := req.IDToken
	if tokenString == "" {
		tokenString = req.Token
	}

	if tokenString == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "id_token is required"})
		return
	}

	gInfo, err := auth.VerifyGoogleIDToken(tokenString)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "google authentication failed: " + err.Error()})
		return
	}

	email := strings.ToLower(strings.TrimSpace(gInfo.Email))
	var user models.User
	err = h.DB.Where("email = ?", email).First(&user).Error
	if err != nil {
		// User does not exist, create user
		dummyPassword, _ := auth.HashPassword(uuid.New().String())
		user = models.User{
			Email:    email,
			Password: dummyPassword,
			Name:     gInfo.Name,
		}
		if err := h.DB.Create(&user).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create user profile for Google OAuth"})
			return
		}
	}

	token, err := auth.GenerateJWT(user.ID, user.Email, h.JWTSecret, 24*time.Hour)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to generate authentication token"})
		return
	}

	auth.SetAuthCookie(c, token)

	c.JSON(http.StatusOK, gin.H{
		"user":  BuildUserResponse(user),
		"token": token,
	})
}

// ParentalConsent verifies minor status using user.IsMinor(time.Now()), sets ParentalConsentGiven = true and ParentEmail.
func (h *Handler) ParentalConsent(c *gin.Context) {
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

	var req ParentalConsentRequest
	if err := c.ShouldBindJSON(&req); err != nil || strings.TrimSpace(req.ParentEmail) == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "valid parent_email is required"})
		return
	}

	var user models.User
	if err := h.DB.Where("id = ?", userID).First(&user).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
		return
	}

	now := time.Now()
	if !user.IsMinor(now) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "parental consent is only applicable for minor users under 18 years old"})
		return
	}

	user.ParentalConsentGiven = true
	user.ParentEmail = strings.TrimSpace(strings.ToLower(req.ParentEmail))

	if err := h.DB.Save(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to record parental consent"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "parental consent successfully recorded",
		"user":    BuildUserResponse(user),
	})
}

// Me returns current user profile with calculated Age and IsMinor status.
func (h *Handler) Me(c *gin.Context) {
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

	var user models.User
	if err := h.DB.Where("id = ?", userID).First(&user).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "user profile not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"user": BuildUserResponse(user),
	})
}

// Logout clears the auth cookie.
func (h *Handler) Logout(c *gin.Context) {
	auth.ClearAuthCookie(c)
	c.JSON(http.StatusOK, gin.H{
		"message": "logged out successfully",
	})
}
