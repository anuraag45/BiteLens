package db_test

import (
	"os"
	"testing"

	"backend/internal/db"
	"backend/internal/models"
)

func TestInitTestDB(t *testing.T) {
	testDB, err := db.InitTestDB()
	if err != nil {
		t.Fatalf("InitTestDB failed: %v", err)
	}
	if testDB == nil {
		t.Fatalf("InitTestDB returned nil DB handle")
	}

	// Verify PRAGMA foreign_keys is ON
	var fkStatus int
	if err := testDB.Raw("PRAGMA foreign_keys;").Scan(&fkStatus).Error; err != nil {
		t.Fatalf("Failed to query PRAGMA foreign_keys: %v", err)
	}
	if fkStatus != 1 {
		t.Errorf("Expected PRAGMA foreign_keys = 1 (ON), got %d", fkStatus)
	}
}

func TestAutoMigrate(t *testing.T) {
	testDB, err := db.InitTestDB()
	if err != nil {
		t.Fatalf("InitTestDB failed: %v", err)
	}

	if err := db.AutoMigrate(testDB); err != nil {
		t.Fatalf("AutoMigrate failed: %v", err)
	}

	// Verify tables exist
	tables := []string{"users", "products", "additives", "scan_histories"}
	for _, table := range tables {
		if !testDB.Migrator().HasTable(table) {
			t.Errorf("Expected table %s to exist after AutoMigrate", table)
		}
	}
}

func TestInitDBFallback(t *testing.T) {
	// Test with invalid Postgres DSN -> should fall back gracefully to SQLite
	invalidPostgresDSN := "postgres://invalid:user@127.0.0.1:9999/nonexistent_db?sslmode=disable"
	fallbackDB, err := db.InitDB(invalidPostgresDSN)
	if err != nil {
		t.Fatalf("InitDB with invalid postgres DSN failed instead of falling back: %v", err)
	}
	if fallbackDB == nil {
		t.Fatalf("InitDB returned nil fallback DB")
	}

	// Test with empty DSN -> defaults to SQLite app.db
	defaultDB, err := db.InitDB("")
	if err != nil {
		t.Fatalf("InitDB with empty DSN failed: %v", err)
	}
	if defaultDB == nil {
		t.Fatalf("InitDB returned nil default DB")
	}

	// Migrate test models on fallback DB to confirm functionality
	if err := fallbackDB.AutoMigrate(&models.User{}); err != nil {
		t.Fatalf("Failed to AutoMigrate fallback DB: %v", err)
	}
}

func TestInitDBSQLitePragma(t *testing.T) {
	tempDBFile := "test_pragma_init.db"
	defer os.Remove(tempDBFile)

	dbHandle, err := db.InitDB(tempDBFile)
	if err != nil {
		t.Fatalf("InitDB failed: %v", err)
	}

	var fkStatus int
	if err := dbHandle.Raw("PRAGMA foreign_keys;").Scan(&fkStatus).Error; err != nil {
		t.Fatalf("Failed to query PRAGMA foreign_keys: %v", err)
	}

	if fkStatus != 1 {
		t.Errorf("Expected PRAGMA foreign_keys = 1 (ON) in InitDB SQLite connection, got %d", fkStatus)
	}
}

func TestPurgeUserDataCascade(t *testing.T) {
	testDB, err := db.InitTestDB()
	if err != nil {
		t.Fatalf("Failed to init test DB: %v", err)
	}
	if err := db.AutoMigrate(testDB); err != nil {
		t.Fatalf("Failed to auto migrate: %v", err)
	}

	u := models.User{Email: "purge_user@example.com", Password: "hashedpassword"}
	p := models.Product{Name: "Purge Snack", Barcode: "9999999999999"}
	if err := testDB.Create(&u).Error; err != nil {
		t.Fatalf("Failed to create user: %v", err)
	}
	if err := testDB.Create(&p).Error; err != nil {
		t.Fatalf("Failed to create product: %v", err)
	}

	scan := models.ScanHistory{UserID: u.ID, ProductID: p.ID}
	if err := testDB.Create(&scan).Error; err != nil {
		t.Fatalf("Failed to create scan history: %v", err)
	}

	// Verify scan exists
	var count int64
	testDB.Model(&models.ScanHistory{}).Where("id = ?", scan.ID).Count(&count)
	if count != 1 {
		t.Fatalf("Expected scan history record to exist before purge")
	}

	// Purge user data (hard delete)
	if err := db.PurgeUserData(testDB, u.ID); err != nil {
		t.Fatalf("PurgeUserData failed: %v", err)
	}

	// Verify user is deleted
	testDB.Unscoped().Model(&models.User{}).Where("id = ?", u.ID).Count(&count)
	if count != 0 {
		t.Errorf("Expected user to be hard deleted after PurgeUserData")
	}

	// Verify scan history was deleted via CASCADE
	testDB.Unscoped().Model(&models.ScanHistory{}).Where("id = ?", scan.ID).Count(&count)
	if count != 0 {
		t.Errorf("Expected scan history record to be purged via CASCADE after PurgeUserData, count: %d", count)
	}
}
