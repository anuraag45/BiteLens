package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// Additive represents a food additive entity with safety and risk classification.
type Additive struct {
	ID          uuid.UUID      `gorm:"type:uuid;primaryKey" json:"id"`
	INSCode     string         `gorm:"uniqueIndex;not null" json:"ins_code"`
	Name        string         `gorm:"not null" json:"name"`
	RiskLevel   string         `json:"risk_level"`
	Description string         `json:"description"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
}

// BeforeCreate is a GORM hook that generates a new UUID if one is not provided.
func (a *Additive) BeforeCreate(tx *gorm.DB) (err error) {
	if a.ID == uuid.Nil {
		a.ID = uuid.New()
	}
	return nil
}
