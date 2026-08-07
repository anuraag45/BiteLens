package models

import (
	"encoding/json"
	"errors"
	"strings"
	"time"

	"github.com/google/uuid"
	"gorm.io/datatypes"
	"gorm.io/gorm"
)

// Product represents a scanned or cataloged product entity.
type Product struct {
	ID                  uuid.UUID      `gorm:"type:uuid;primaryKey" json:"id"`
	Name                string         `gorm:"not null" json:"name"`
	Barcode             string         `gorm:"uniqueIndex;not null" json:"barcode"`
	Brand               string         `json:"brand"`
	UndeclaredNutrients datatypes.JSON `json:"undeclared_nutrients"`
	Basis               string         `json:"basis"`
	DataConfidence      string         `json:"data_confidence"`
	CreatedAt           time.Time      `json:"created_at"`
	UpdatedAt           time.Time      `json:"updated_at"`
	DeletedAt           gorm.DeletedAt `gorm:"index" json:"-"`
}

// BeforeCreate is a GORM hook that generates a new UUID if one is not provided.
func (p *Product) BeforeCreate(tx *gorm.DB) (err error) {
	if p.ID == uuid.Nil {
		p.ID = uuid.New()
	}
	return nil
}

// BeforeSave is a GORM hook that validates UndeclaredNutrients JSON format and Notion dataset taxonomy fields (Basis, DataConfidence).
func (p *Product) BeforeSave(tx *gorm.DB) error {
	if len(p.UndeclaredNutrients) > 0 {
		if !json.Valid(p.UndeclaredNutrients) {
			return errors.New("invalid json format in undeclared_nutrients")
		}
	}

	if p.Basis == "" {
		p.Basis = "per 100g"
	} else {
		lowerBasis := strings.ToLower(strings.TrimSpace(p.Basis))
		if !strings.HasPrefix(lowerBasis, "per ") {
			return errors.New("invalid basis taxonomy: must specify basis (e.g., 'per 100g', 'per serving')")
		}
	}

	if p.DataConfidence == "" {
		p.DataConfidence = "LOW"
	} else {
		upperConf := strings.ToUpper(strings.TrimSpace(p.DataConfidence))
		if upperConf != "HIGH" && upperConf != "MEDIUM" && upperConf != "LOW" {
			return errors.New("invalid data_confidence taxonomy: must be HIGH, MEDIUM, or LOW")
		}
		p.DataConfidence = upperConf
	}

	return nil
}
