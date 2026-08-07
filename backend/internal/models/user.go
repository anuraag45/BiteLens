package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// User represents a user entity in the database.
type User struct {
	ID                   uuid.UUID      `gorm:"type:uuid;primaryKey" json:"id"`
	Email                string         `gorm:"uniqueIndex;not null" json:"email"`
	Password             string         `gorm:"not null" json:"-"`
	Name                 string         `json:"name"`
	DateOfBirth          time.Time      `json:"date_of_birth"`
	ParentalConsentGiven bool           `json:"parental_consent_given"`
	ParentEmail          string         `json:"parent_email"`
	CreatedAt            time.Time      `json:"created_at"`
	UpdatedAt            time.Time      `json:"updated_at"`
	DeletedAt            gorm.DeletedAt `gorm:"index" json:"-"`
}

// BeforeCreate is a GORM hook that generates a new UUID if one is not provided.
func (u *User) BeforeCreate(tx *gorm.DB) (err error) {
	if u.ID == uuid.Nil {
		u.ID = uuid.New()
	}
	return nil
}

// CalculateAge calculates the user's age in completed years at the specified date.
func (u *User) CalculateAge(atDate time.Time) int {
	dob := u.DateOfBirth.UTC()
	ref := atDate.UTC()
	if dob.After(ref) {
		return 0
	}
	years := ref.Year() - dob.Year()
	if ref.Month() < dob.Month() || (ref.Month() == dob.Month() && ref.Day() < dob.Day()) {
		years--
	}
	if years < 0 {
		return 0
	}
	return years
}

// IsMinor returns true if the user is under 18 years old at the specified date.
func (u *User) IsMinor(atDate time.Time) bool {
	return u.CalculateAge(atDate) < 18
}
