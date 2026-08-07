package handlers

import (
	"time"

	"backend/internal/models"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// Handler contains dependencies for HTTP handlers.
type Handler struct {
	DB        *gorm.DB
	JWTSecret string
}

// NewHandler creates a new Handler instance.
func NewHandler(db *gorm.DB, jwtSecret string) *Handler {
	return &Handler{
		DB:        db,
		JWTSecret: jwtSecret,
	}
}

// UserResponse represents user profile data returned in API responses.
type UserResponse struct {
	ID                   uuid.UUID `json:"id"`
	Email                string    `json:"email"`
	Name                 string    `json:"name"`
	DateOfBirth          time.Time `json:"date_of_birth"`
	ParentalConsentGiven bool      `json:"parental_consent_given"`
	ParentEmail          string    `json:"parent_email"`
	Age                  int       `json:"age"`
	IsMinor              bool      `json:"is_minor"`
	CreatedAt            time.Time `json:"created_at"`
	UpdatedAt            time.Time `json:"updated_at"`
}

// BuildUserResponse builds a UserResponse from a models.User entity calculating Age and IsMinor.
func BuildUserResponse(u models.User) UserResponse {
	now := time.Now()
	return UserResponse{
		ID:                   u.ID,
		Email:                u.Email,
		Name:                 u.Name,
		DateOfBirth:          u.DateOfBirth,
		ParentalConsentGiven: u.ParentalConsentGiven,
		ParentEmail:          u.ParentEmail,
		Age:                  u.CalculateAge(now),
		IsMinor:              u.IsMinor(now),
		CreatedAt:            u.CreatedAt,
		UpdatedAt:            u.UpdatedAt,
	}
}
