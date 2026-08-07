package models_test

import (
	"encoding/json"
	"testing"
	"time"

	"backend/internal/db"
	"backend/internal/models"

	"github.com/google/uuid"
	"gorm.io/datatypes"
)

func TestUserCalculateAgeAndIsMinor(t *testing.T) {
	refDate := time.Date(2026, 8, 7, 0, 0, 0, 0, time.UTC)

	tests := []struct {
		name          string
		dob           time.Time
		expectedAge   int
		expectedMinor bool
	}{
		{
			name:          "Adult past birthday this year",
			dob:           time.Date(2000, 1, 15, 0, 0, 0, 0, time.UTC),
			expectedAge:   26,
			expectedMinor: false,
		},
		{
			name:          "Adult birthday today",
			dob:           time.Date(2008, 8, 7, 0, 0, 0, 0, time.UTC),
			expectedAge:   18,
			expectedMinor: false,
		},
		{
			name:          "Minor birthday tomorrow",
			dob:           time.Date(2008, 8, 8, 0, 0, 0, 0, time.UTC),
			expectedAge:   17,
			expectedMinor: true,
		},
		{
			name:          "Minor born 2012",
			dob:           time.Date(2012, 10, 20, 0, 0, 0, 0, time.UTC),
			expectedAge:   13,
			expectedMinor: true,
		},
		{
			name:          "Future DOB relative to refDate",
			dob:           time.Date(2027, 1, 1, 0, 0, 0, 0, time.UTC),
			expectedAge:   0,
			expectedMinor: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			u := models.User{DateOfBirth: tt.dob}
			age := u.CalculateAge(refDate)
			if age != tt.expectedAge {
				t.Errorf("CalculateAge() = %d, expected %d", age, tt.expectedAge)
			}
			isMinor := u.IsMinor(refDate)
			if isMinor != tt.expectedMinor {
				t.Errorf("IsMinor() = %v, expected %v", isMinor, tt.expectedMinor)
			}
		})
	}
}

func TestUserBeforeCreateHook(t *testing.T) {
	u := models.User{Email: "test@example.com"}
	if u.ID != uuid.Nil {
		t.Errorf("Expected nil UUID before hook, got %s", u.ID)
	}

	err := u.BeforeCreate(nil)
	if err != nil {
		t.Fatalf("BeforeCreate returned unexpected error: %v", err)
	}

	if u.ID == uuid.Nil {
		t.Errorf("Expected non-nil UUID after BeforeCreate hook")
	}

	// Preset UUID should be preserved
	presetID := uuid.New()
	uPreset := models.User{ID: presetID, Email: "preset@example.com"}
	_ = uPreset.BeforeCreate(nil)
	if uPreset.ID != presetID {
		t.Errorf("Expected preset ID %s to be preserved, got %s", presetID, uPreset.ID)
	}
}

func TestProductBeforeCreateAndJSON(t *testing.T) {
	nutrientJSON := []byte(`{"trans_fat":"0g","sugar_added":"12g"}`)
	p := models.Product{
		Name:                "Test Snack",
		Barcode:             "1234567890123",
		Brand:               "HealthCo",
		UndeclaredNutrients: datatypes.JSON(nutrientJSON),
		Basis:               "per 100g",
		DataConfidence:      "HIGH",
	}

	err := p.BeforeCreate(nil)
	if err != nil {
		t.Fatalf("BeforeCreate hook failed: %v", err)
	}
	if p.ID == uuid.Nil {
		t.Errorf("Expected product UUID to be generated")
	}

	// Verify JSON marshaling / unmarshaling
	var nutrients map[string]string
	if err := json.Unmarshal(p.UndeclaredNutrients, &nutrients); err != nil {
		t.Fatalf("Failed to unmarshal UndeclaredNutrients JSON: %v", err)
	}
	if nutrients["trans_fat"] != "0g" || nutrients["sugar_added"] != "12g" {
		t.Errorf("Unexpected nutrient values: %v", nutrients)
	}
	if p.Basis != "per 100g" || p.DataConfidence != "HIGH" {
		t.Errorf("Taxonomy fields mismatch: basis=%s, confidence=%s", p.Basis, p.DataConfidence)
	}
}

func TestAdditiveUniqueINSCode(t *testing.T) {
	testDB, err := db.InitTestDB()
	if err != nil {
		t.Fatalf("Failed to init test DB: %v", err)
	}
	if err := db.AutoMigrate(testDB); err != nil {
		t.Fatalf("Failed to auto migrate: %v", err)
	}

	a1 := models.Additive{
		INSCode:     "INS-102",
		Name:        "Tartrazine",
		RiskLevel:   "MEDIUM",
		Description: "Yellow synthetic azo dye",
	}

	if err := testDB.Create(&a1).Error; err != nil {
		t.Fatalf("Failed to create additive 1: %v", err)
	}
	if a1.ID == uuid.Nil {
		t.Errorf("Expected additive 1 ID to be set")
	}

	// Duplicate INSCode creation should fail due to unique index
	a2 := models.Additive{
		INSCode:     "INS-102",
		Name:        "Duplicate Tartrazine",
		RiskLevel:   "HIGH",
		Description: "Duplicate entry",
	}

	if err := testDB.Create(&a2).Error; err == nil {
		t.Errorf("Expected duplicate INSCode creation to fail, but it succeeded")
	}
}

func TestScanHistoryCascadingDeletes(t *testing.T) {
	testDB, err := db.InitTestDB()
	if err != nil {
		t.Fatalf("Failed to init test DB: %v", err)
	}
	if err := db.AutoMigrate(testDB); err != nil {
		t.Fatalf("Failed to auto migrate: %v", err)
	}

	// Create User and Product
	u := models.User{Email: "scanner@example.com", Password: "hashedpassword"}
	p := models.Product{Name: "Cereal Bar", Barcode: "9876543210987"}
	if err := testDB.Create(&u).Error; err != nil {
		t.Fatalf("Failed to create user: %v", err)
	}
	if err := testDB.Create(&p).Error; err != nil {
		t.Fatalf("Failed to create product: %v", err)
	}

	// Create ScanHistory
	scan := models.ScanHistory{
		UserID:    u.ID,
		ProductID: p.ID,
	}
	if err := testDB.Create(&scan).Error; err != nil {
		t.Fatalf("Failed to create scan history: %v", err)
	}
	if scan.ID == uuid.Nil {
		t.Errorf("Expected scan history UUID to be generated")
	}

	// Verify scan exists
	var count int64
	testDB.Model(&models.ScanHistory{}).Where("id = ?", scan.ID).Count(&count)
	if count != 1 {
		t.Fatalf("Expected scan history record to exist")
	}

	// Hard delete user (to trigger foreign key CASCADE in DB)
	if err := testDB.Unscoped().Delete(&u).Error; err != nil {
		t.Fatalf("Failed to delete user: %v", err)
	}

	// Verify scan history was deleted via CASCADE
	testDB.Model(&models.ScanHistory{}).Where("id = ?", scan.ID).Count(&count)
	if count != 0 {
		t.Errorf("Expected scan history record to be deleted via CASCADE when user is deleted, count: %d", count)
	}

	// Test product deletion cascade as well
	u2 := models.User{Email: "scanner2@example.com", Password: "hashedpassword"}
	p2 := models.Product{Name: "Juice Box", Barcode: "9876543210988"}
	testDB.Create(&u2)
	testDB.Create(&p2)

	scan2 := models.ScanHistory{UserID: u2.ID, ProductID: p2.ID}
	testDB.Create(&scan2)

	if err := testDB.Unscoped().Delete(&p2).Error; err != nil {
		t.Fatalf("Failed to delete product: %v", err)
	}

	testDB.Model(&models.ScanHistory{}).Where("id = ?", scan2.ID).Count(&count)
	if count != 0 {
		t.Errorf("Expected scan history record to be deleted via CASCADE when product is deleted, count: %d", count)
	}
}

func TestUserCalculateAge_TimezoneNormalization(t *testing.T) {
	locNY, err := time.LoadLocation("America/New_York")
	if err != nil {
		t.Skip("Skipping timezone test: America/New_York not available")
	}

	dob := time.Date(2000, 1, 1, 1, 0, 0, 0, time.UTC)
	atDateNY := time.Date(2017, 12, 31, 21, 0, 0, 0, locNY)

	u := models.User{DateOfBirth: dob}
	age := u.CalculateAge(atDateNY)
	if age != 18 {
		t.Errorf("Expected age 18 with timezone normalization, got %d", age)
	}
	if u.IsMinor(atDateNY) {
		t.Errorf("Expected IsMinor to be false with timezone normalization")
	}
}

func TestProductBeforeSave_ValidationHooks(t *testing.T) {
	// 1. Valid JSON and taxonomy
	validP := models.Product{
		Name:                "Valid Product",
		Barcode:             "111111111111",
		UndeclaredNutrients: datatypes.JSON([]byte(`{"sodium":"100mg"}`)),
		Basis:               "per 100g",
		DataConfidence:      "HIGH",
	}
	if err := validP.BeforeSave(nil); err != nil {
		t.Errorf("BeforeSave failed for valid product: %v", err)
	}

	// 2. Invalid JSON in UndeclaredNutrients
	invalidJSONP := models.Product{
		Name:                "Invalid JSON Product",
		Barcode:             "222222222222",
		UndeclaredNutrients: datatypes.JSON([]byte(`{invalid_json:`)),
		Basis:               "per 100g",
		DataConfidence:      "HIGH",
	}
	if err := invalidJSONP.BeforeSave(nil); err == nil {
		t.Errorf("Expected BeforeSave to fail for invalid JSON in undeclared_nutrients")
	}

	// 3. Invalid Basis taxonomy
	invalidBasisP := models.Product{
		Name:           "Invalid Basis Product",
		Barcode:        "333333333333",
		Basis:          "INVALID_BASIS_STRING",
		DataConfidence: "HIGH",
	}
	if err := invalidBasisP.BeforeSave(nil); err == nil {
		t.Errorf("Expected BeforeSave to fail for invalid Basis taxonomy")
	}

	// 4. Invalid DataConfidence taxonomy
	invalidConfP := models.Product{
		Name:           "Invalid Conf Product",
		Barcode:        "444444444444",
		Basis:          "per 100g",
		DataConfidence: "SUPER_CONFIDENT_EXTREME",
	}
	if err := invalidConfP.BeforeSave(nil); err == nil {
		t.Errorf("Expected BeforeSave to fail for invalid DataConfidence taxonomy")
	}

	// 5. Empty Basis and DataConfidence defaults
	emptyP := models.Product{
		Name:    "Empty Taxonomy Product",
		Barcode: "555555555555",
	}
	if err := emptyP.BeforeSave(nil); err != nil {
		t.Errorf("BeforeSave failed for empty product taxonomy: %v", err)
	}
	if emptyP.Basis != "per 100g" || emptyP.DataConfidence != "LOW" {
		t.Errorf("Expected defaults 'per 100g' and 'LOW', got Basis='%s', DataConfidence='%s'", emptyP.Basis, emptyP.DataConfidence)
	}
}
