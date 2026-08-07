package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// ScanHistory represents a product scan event by a user with DPDP compliance cascading deletes.
type ScanHistory struct {
	ID        uuid.UUID      `gorm:"type:uuid;primaryKey" json:"id"`
	UserID    uuid.UUID      `gorm:"type:uuid;not null;index" json:"user_id"`
	User      User           `gorm:"foreignKey:UserID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;" json:"user,omitempty"`
	ProductID uuid.UUID      `gorm:"type:uuid;not null;index" json:"product_id"`
	Product   Product        `gorm:"foreignKey:ProductID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;" json:"product,omitempty"`
	ScannedAt time.Time      `json:"scanned_at"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

// BeforeCreate is a GORM hook that generates a new UUID if one is not provided.
func (s *ScanHistory) BeforeCreate(tx *gorm.DB) (err error) {
	if s.ID == uuid.Nil {
		s.ID = uuid.New()
	}
	if s.ScannedAt.IsZero() {
		s.ScannedAt = time.Now()
	}
	return nil
}
