package db

import (
	"log"
	"strings"

	"backend/internal/models"

	"github.com/glebarez/sqlite"
	"github.com/google/uuid"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

// isPostgresDSN checks if a DSN matches valid PostgreSQL connection string formats.
func isPostgresDSN(dsn string) bool {
	return strings.HasPrefix(dsn, "postgres://") ||
		strings.HasPrefix(dsn, "postgresql://") ||
		strings.Contains(dsn, "host=")
}

// InitDB initializes a GORM database connection using Postgres if DSN is provided and valid,
// falling back gracefully to SQLite if Postgres connection fails or DSN is empty.
func InitDB(dsn string) (*gorm.DB, error) {
	var db *gorm.DB
	var err error

	if dsn != "" && isPostgresDSN(dsn) {
		db, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
		if err == nil {
			log.Println("Successfully connected to Postgres database.")
			return db, nil
		}
		log.Printf("Postgres connection failed (%v), falling back to SQLite...\n", err)
	}

	// Fallback or default to SQLite
	sqlitePath := "app.db"
	if dsn != "" && !isPostgresDSN(dsn) {
		sqlitePath = dsn
	}
	db, err = gorm.Open(sqlite.Open(sqlitePath), &gorm.Config{})
	if err != nil {
		return nil, err
	}

	if err := db.Exec("PRAGMA foreign_keys = ON;").Error; err != nil {
		return nil, err
	}

	log.Printf("Successfully initialized SQLite database at %s.\n", sqlitePath)
	return db, nil
}

// InitTestDB initializes an in-memory SQLite database for testing with foreign key constraints enabled.
func InitTestDB() (*gorm.DB, error) {
	db, err := gorm.Open(sqlite.Open("file::memory:?cache=shared"), &gorm.Config{})
	if err != nil {
		return nil, err
	}

	if err := db.Exec("PRAGMA foreign_keys = ON;").Error; err != nil {
		return nil, err
	}

	return db, nil
}

// AutoMigrate runs GORM auto-migrations for all application models and seeds default additives.
func AutoMigrate(db *gorm.DB) error {
	err := db.AutoMigrate(
		&models.User{},
		&models.Product{},
		&models.Additive{},
		&models.ScanHistory{},
	)
	if err != nil {
		return err
	}

	return SeedDefaultAdditives(db)
}

// SeedDefaultAdditives populates default INS Additive entries if database table is empty.
func SeedDefaultAdditives(db *gorm.DB) error {
	var count int64
	db.Model(&models.Additive{}).Count(&count)
	if count > 0 {
		return nil
	}

	defaultAdditives := []models.Additive{
		{
			INSCode:     "INS 621",
			Name:        "Monosodium Glutamate (MSG)",
			RiskLevel:   "high",
			Description: "Chemical flavor powder added to packaged noodles and chips to make them taste super savory.",
		},
		{
			INSCode:     "INS 322",
			Name:        "Lecithin (Soy / Sunflower)",
			RiskLevel:   "low",
			Description: "Natural plant ingredient that keeps chocolate smooth so cocoa oil does not separate.",
		},
		{
			INSCode:     "INS 500(ii)",
			Name:        "Sodium Hydrogen Carbonate (Baking Soda)",
			RiskLevel:   "low",
			Description: "Simple mineral powder used in baking to help dough rise soft and fluffy.",
		},
		{
			INSCode:     "INS 211",
			Name:        "Sodium Benzoate",
			RiskLevel:   "medium",
			Description: "Liquid preservative added to stop packaged fruit squashes and sodas from spoiling.",
		},
		{
			INSCode:     "INS 120",
			Name:        "Carmine / Cochineal Red",
			RiskLevel:   "medium",
			Description: "Natural red color used to give candies, ice creams, and yogurts a bright pink or red look.",
		},
		{
			INSCode:     "INS 440",
			Name:        "Pectin",
			RiskLevel:   "low",
			Description: "Natural plant-derived fruit gel extracted from apple and citrus peel.",
		},
		{
			INSCode:     "INS 955",
			Name:        "Sucralose",
			RiskLevel:   "medium",
			Description: "Super-sweet artificial powder used in diet sodas to replace sugar without calories.",
		},
		{
			INSCode:     "INS 330",
			Name:        "Citric Acid",
			RiskLevel:   "low",
			Description: "Natural lemon acid added to drinks and candies to give a sharp tart taste.",
		},
	}

	for _, additive := range defaultAdditives {
		if err := db.Create(&additive).Error; err != nil {
			log.Printf("Warning: Failed to seed additive %s: %v", additive.INSCode, err)
		}
	}

	log.Printf("Successfully seeded %d default INS Additives into database.", len(defaultAdditives))
	return nil
}

// PurgeUserData performs a DPDP right-to-erasure hard delete on a User entity using Unscoped().Delete,
// triggering database-level ON DELETE CASCADE to purge associated records (e.g. ScanHistory).
func PurgeUserData(db *gorm.DB, userID uuid.UUID) error {
	return db.Unscoped().Delete(&models.User{ID: userID}).Error
}
