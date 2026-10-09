package models_test

import (
	"os"
	"testing"

	"backend/internal/db"
	"backend/internal/models"
)

// TestEmpirical_DPDP_HardDelete_User_Cascades_ScanHistory tests hard deletion of User causing cascade delete of ScanHistory.
func TestEmpirical_DPDP_HardDelete_User_Cascades_ScanHistory(t *testing.T) {
	testDB, err := db.InitTestDB()
	if err != nil {
		t.Fatalf("Failed to init test DB: %v", err)
	}
	if err := db.AutoMigrate(testDB); err != nil {
		t.Fatalf("Failed to auto migrate: %v", err)
	}

	user := models.User{Email: "dpdp_user@example.com", Password: "securepassword"}
	prod := models.Product{Name: "DPDP Snack", Barcode: "1111111111111", Basis: "per 100g", DataConfidence: "HIGH"}
	testDB.Create(&user)
	testDB.Create(&prod)

	scan := models.ScanHistory{UserID: user.ID, ProductID: prod.ID}
	testDB.Create(&scan)

	var scanCount int64
	testDB.Model(&models.ScanHistory{}).Where("id = ?", scan.ID).Count(&scanCount)
	if scanCount != 1 {
		t.Fatalf("Setup failed: ScanHistory not created")
	}

	// Hard delete user to trigger database FK ON DELETE CASCADE
	if err := testDB.Unscoped().Delete(&user).Error; err != nil {
		t.Fatalf("Failed to hard delete user: %v", err)
	}

	// Verify ScanHistory was automatically deleted by CASCADE
	testDB.Unscoped().Model(&models.ScanHistory{}).Where("id = ?", scan.ID).Count(&scanCount)
	if scanCount != 0 {
		t.Errorf("FAIL: ScanHistory record persisted after user hard delete (count=%d)", scanCount)
	}
}

// TestEmpirical_DPDP_SoftDelete_User_Orphans_ScanHistory tests GORM soft delete behavior on User.
func TestEmpirical_DPDP_SoftDelete_User_Orphans_ScanHistory(t *testing.T) {
	testDB, err := db.InitTestDB()
	if err != nil {
		t.Fatalf("Failed to init test DB: %v", err)
	}
	if err := db.AutoMigrate(testDB); err != nil {
		t.Fatalf("Failed to auto migrate: %v", err)
	}

	user := models.User{Email: "soft_user@example.com", Password: "securepassword"}
	prod := models.Product{Name: "Soft Snack", Barcode: "2222222222222", Basis: "per 100g", DataConfidence: "HIGH"}
	testDB.Create(&user)
	testDB.Create(&prod)

	scan := models.ScanHistory{UserID: user.ID, ProductID: prod.ID}
	testDB.Create(&scan)

	// Soft delete user via GORM standard Delete()
	if err := testDB.Delete(&user).Error; err != nil {
		t.Fatalf("Failed to soft delete user: %v", err)
	}

	// Verify User is soft deleted
	var userCount int64
	testDB.Model(&models.User{}).Where("id = ?", user.ID).Count(&userCount)
	if userCount != 0 {
		t.Fatalf("Expected User to be hidden in standard query after soft delete")
	}

	// Check ScanHistory table: DB FK CASCADE was NOT triggered by soft delete!
	var scanCount int64
	testDB.Model(&models.ScanHistory{}).Where("id = ?", scan.ID).Count(&scanCount)
	if scanCount != 1 {
		t.Errorf("Observation: ScanHistory count after user soft delete is %d", scanCount)
	} else {
		t.Logf("FINDING: Soft-deleting a User leaves ScanHistory active (count=%d). DPDP right-to-erasure requires Unscoped hard delete or explicit scan history soft-delete cascade.", scanCount)
	}
}

// TestEmpirical_Product_HardDelete_Cascades_ScanHistory tests hard deletion of Product causing cascade delete of ScanHistory.
func TestEmpirical_Product_HardDelete_Cascades_ScanHistory(t *testing.T) {
	testDB, err := db.InitTestDB()
	if err != nil {
		t.Fatalf("Failed to init test DB: %v", err)
	}
	if err := db.AutoMigrate(testDB); err != nil {
		t.Fatalf("Failed to auto migrate: %v", err)
	}

	user := models.User{Email: "prod_user@example.com", Password: "securepassword"}
	prod := models.Product{Name: "Product To Delete", Barcode: "3333333333333", Basis: "per serving", DataConfidence: "MEDIUM"}
	testDB.Create(&user)
	testDB.Create(&prod)

	scan := models.ScanHistory{UserID: user.ID, ProductID: prod.ID}
	testDB.Create(&scan)

	// Hard delete product
	if err := testDB.Unscoped().Delete(&prod).Error; err != nil {
		t.Fatalf("Failed to hard delete product: %v", err)
	}

	// Verify ScanHistory was automatically deleted by CASCADE
	var scanCount int64
	testDB.Unscoped().Model(&models.ScanHistory{}).Where("id = ?", scan.ID).Count(&scanCount)
	if scanCount != 0 {
		t.Errorf("FAIL: ScanHistory record persisted after product hard delete (count=%d)", scanCount)
	}
}

// TestEmpirical_InitDB_SQLite_Missing_PRAGMA_Foreign_Keys demonstrates that InitDB does NOT enable PRAGMA foreign_keys for SQLite.
func TestEmpirical_InitDB_SQLite_Missing_PRAGMA_Foreign_Keys(t *testing.T) {
	tempDBFile := "test_fk_temp.db"

	// Initialize DB via InitDB
	dbHandle, err := db.InitDB(tempDBFile)
	if err != nil {
		t.Fatalf("InitDB failed: %v", err)
	}
	defer func() {
		if sqlDB, err := dbHandle.DB(); err == nil {
			sqlDB.Close()
		}
		os.Remove(tempDBFile)
	}()
	if err := db.AutoMigrate(dbHandle); err != nil {
		t.Fatalf("AutoMigrate failed: %v", err)
	}

	// Query PRAGMA foreign_keys
	var fkStatus int
	if err := dbHandle.Raw("PRAGMA foreign_keys;").Scan(&fkStatus).Error; err != nil {
		t.Fatalf("Querying PRAGMA foreign_keys failed: %v", err)
	}

	if fkStatus != 1 {
		t.Logf("FINDING & BUG: InitDB() SQLite connection has PRAGMA foreign_keys = %d (OFF). DB-level ON DELETE CASCADE will NOT execute on SQLite unless PRAGMA foreign_keys = ON; is set in InitDB()!", fkStatus)
	}

	// Perform actual hard delete test on this DB instance to verify FK CASCADE failure
	u := models.User{Email: "fk_off_user@example.com", Password: "pass"}
	p := models.Product{Name: "FK Off Product", Barcode: "4444444444444"}
	dbHandle.Create(&u)
	dbHandle.Create(&p)

	s := models.ScanHistory{UserID: u.ID, ProductID: p.ID}
	dbHandle.Create(&s)

	// Hard delete user
	dbHandle.Unscoped().Delete(&u)

	var scanCount int64
	dbHandle.Unscoped().Model(&models.ScanHistory{}).Where("id = ?", s.ID).Count(&scanCount)
	if scanCount == 1 {
		t.Logf("CONFIRMED BUG: With InitDB() default SQLite settings, hard deleting User fails to cascade-delete ScanHistory because foreign_keys=OFF in SQLite!")
	}
}

// TestEmpirical_NotionTaxonomy_Product_Validation tests Notion dataset taxonomy fields on Product.
func TestEmpirical_NotionTaxonomy_Product_Validation(t *testing.T) {
	testDB, err := db.InitTestDB()
	if err != nil {
		t.Fatalf("Failed to init test DB: %v", err)
	}
	if err := db.AutoMigrate(testDB); err != nil {
		t.Fatalf("Failed to auto migrate: %v", err)
	}

	// 1. Compliant Product creation
	validProd := models.Product{
		Name:           "Taxonomy Compliant Biscuit",
		Barcode:        "5555555555555",
		Brand:          "NutriBrand",
		Basis:          "per 100g",
		DataConfidence: "HIGH",
	}

	if err := testDB.Create(&validProd).Error; err != nil {
		t.Fatalf("Failed to create compliant product: %v", err)
	}

	if validProd.Basis != "per 100g" || validProd.DataConfidence != "HIGH" {
		t.Errorf("Taxonomy values mismatch: Basis=%s, DataConfidence=%s", validProd.Basis, validProd.DataConfidence)
	}

	// 2. Non-compliant / Unvalidated Product creation (Defect test)
	invalidProd := models.Product{
		Name:           "Invalid Taxonomy Snack",
		Barcode:        "6666666666666",
		Brand:          "UnknownBrand",
		Basis:          "INVALID_BASIS_STRING",
		DataConfidence: "SUPER_CONFIDENT_EXTREME",
	}

	err = testDB.Create(&invalidProd).Error
	if err == nil {
		t.Logf("FINDING: Product model accepts arbitrary/unvalidated strings for Notion taxonomy fields 'Basis' ('%s') and 'DataConfidence' ('%s'). No domain validation or ENUM constraints present.", invalidProd.Basis, invalidProd.DataConfidence)
	}

	emptyProd := models.Product{
		Name:    "Empty Taxonomy Snack",
		Barcode: "7777777777777",
	}

	err = testDB.Create(&emptyProd).Error
	if err == nil {
		t.Logf("FINDING: Product model allows empty/null Basis and DataConfidence values without defaulting or validation error.")
	}
}
