package models_test

import (
	"encoding/json"
	"fmt"
	"sync"
	"testing"
	"time"

	"backend/internal/db"
	"backend/internal/models"

	"github.com/google/uuid"
	"gorm.io/datatypes"
)

// TestCalculateAgeAndIsMinor_EdgeCases stress tests leap years, birthday today, Feb 29, future dates, negative ages, and timezones.
func TestCalculateAgeAndIsMinor_EdgeCases(t *testing.T) {
	tests := []struct {
		name          string
		dob           time.Time
		atDate        time.Time
		expectedAge   int
		expectedMinor bool
	}{
		// --- Feb 29 / Leap Year Edge Cases ---
		{
			name:          "Feb 29 2000 born - evaluated Feb 28 2001 (non-leap year day before)",
			dob:           time.Date(2000, 2, 29, 0, 0, 0, 0, time.UTC),
			atDate:        time.Date(2001, 2, 28, 0, 0, 0, 0, time.UTC),
			expectedAge:   0,
			expectedMinor: true,
		},
		{
			name:          "Feb 29 2000 born - evaluated Mar 1 2001 (non-leap year day after)",
			dob:           time.Date(2000, 2, 29, 0, 0, 0, 0, time.UTC),
			atDate:        time.Date(2001, 3, 1, 0, 0, 0, 0, time.UTC),
			expectedAge:   1,
			expectedMinor: true,
		},
		{
			name:          "Feb 29 2000 born - evaluated Feb 28 2004 (leap year day before)",
			dob:           time.Date(2000, 2, 29, 0, 0, 0, 0, time.UTC),
			atDate:        time.Date(2004, 2, 28, 0, 0, 0, 0, time.UTC),
			expectedAge:   3,
			expectedMinor: true,
		},
		{
			name:          "Feb 29 2000 born - evaluated Feb 29 2004 (exact 4th birthday)",
			dob:           time.Date(2000, 2, 29, 0, 0, 0, 0, time.UTC),
			atDate:        time.Date(2004, 2, 29, 0, 0, 0, 0, time.UTC),
			expectedAge:   4,
			expectedMinor: true,
		},
		{
			name:          "Feb 29 2000 born - evaluated Feb 28 2018 (day before 18th birthday year)",
			dob:           time.Date(2000, 2, 29, 0, 0, 0, 0, time.UTC),
			atDate:        time.Date(2018, 2, 28, 0, 0, 0, 0, time.UTC),
			expectedAge:   17,
			expectedMinor: true,
		},
		{
			name:          "Feb 29 2000 born - evaluated Mar 1 2018 (day after 18th birthday year)",
			dob:           time.Date(2000, 2, 29, 0, 0, 0, 0, time.UTC),
			atDate:        time.Date(2018, 3, 1, 0, 0, 0, 0, time.UTC),
			expectedAge:   18,
			expectedMinor: false,
		},

		// --- Birthday Today Edge Cases ---
		{
			name:          "Exact 18th birthday today",
			dob:           time.Date(2008, 8, 7, 0, 0, 0, 0, time.UTC),
			atDate:        time.Date(2026, 8, 7, 0, 0, 0, 0, time.UTC),
			expectedAge:   18,
			expectedMinor: false,
		},
		{
			name:          "Birthday today but earlier time of day (DOB 18:00, atDate 09:00)",
			dob:           time.Date(2008, 8, 7, 18, 0, 0, 0, time.UTC),
			atDate:        time.Date(2026, 8, 7, 9, 0, 0, 0, time.UTC),
			expectedAge:   18,
			expectedMinor: false,
		},

		// --- Pre-Epoch / Historic Dates ---
		{
			name:          "Born pre-1970 epoch (1940-05-10) evaluated in 2026",
			dob:           time.Date(1940, 5, 10, 0, 0, 0, 0, time.UTC),
			atDate:        time.Date(2026, 8, 7, 0, 0, 0, 0, time.UTC),
			expectedAge:   86,
			expectedMinor: false,
		},
		{
			name:          "Born pre-1970 epoch evaluated before 18th birthday",
			dob:           time.Date(1940, 5, 10, 0, 0, 0, 0, time.UTC),
			atDate:        time.Date(1958, 5, 9, 0, 0, 0, 0, time.UTC),
			expectedAge:   17,
			expectedMinor: true,
		},

		// --- Future Dates & Negative Relative Ages ---
		{
			name:          "DOB in future relative to atDate (DOB 2030, atDate 2026)",
			dob:           time.Date(2030, 1, 1, 0, 0, 0, 0, time.UTC),
			atDate:        time.Date(2026, 8, 7, 0, 0, 0, 0, time.UTC),
			expectedAge:   0,
			expectedMinor: true,
		},
		{
			name:          "DOB 1 second after atDate",
			dob:           time.Date(2026, 8, 7, 12, 0, 1, 0, time.UTC),
			atDate:        time.Date(2026, 8, 7, 12, 0, 0, 0, time.UTC),
			expectedAge:   0,
			expectedMinor: true,
		},
		{
			name:          "DOB equal to atDate",
			dob:           time.Date(2026, 8, 7, 12, 0, 0, 0, time.UTC),
			atDate:        time.Date(2026, 8, 7, 12, 0, 0, 0, time.UTC),
			expectedAge:   0,
			expectedMinor: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			u := models.User{DateOfBirth: tt.dob}
			age := u.CalculateAge(tt.atDate)
			if age != tt.expectedAge {
				t.Errorf("CalculateAge() = %d, expected %d", age, tt.expectedAge)
			}
			isMinor := u.IsMinor(tt.atDate)
			if isMinor != tt.expectedMinor {
				t.Errorf("IsMinor() = %v, expected %v", isMinor, tt.expectedMinor)
			}
		})
	}
}

// TestCalculateAge_TimezoneEdgeCases investigates timezone behavior.
func TestCalculateAge_TimezoneEdgeCases(t *testing.T) {
	locNY, err := time.LoadLocation("America/New_York")
	if err != nil {
		t.Skip("Skipping timezone test: America/New_York not available")
	}
	locTokyo, err := time.LoadLocation("Asia/Tokyo")
	if err != nil {
		t.Skip("Skipping timezone test: Asia/Tokyo not available")
	}

	// Case 1: User born 2000-01-01 23:30 UTC.
	// atDate is 2018-01-01 01:30 Tokyo (+09:00), which corresponds to 2017-12-31 16:30 UTC.
	dob := time.Date(2000, 1, 1, 23, 30, 0, 0, time.UTC)
	atDateTokyo := time.Date(2018, 1, 1, 1, 30, 0, 0, locTokyo) // Absolute: 2017-12-31 16:30 UTC

	u := models.User{DateOfBirth: dob}
	age := u.CalculateAge(atDateTokyo)

	t.Logf("[Timezone Check 1] DOB (UTC): %s | atDate (Tokyo): %s (UTC equiv: %s) -> CalculateAge: %d",
		dob.Format(time.RFC3339), atDateTokyo.Format(time.RFC3339), atDateTokyo.UTC().Format(time.RFC3339), age)

	// Case 2: User born 2000-01-01 01:00 UTC.
	// atDate is 2017-12-31 21:00 NY (-05:00), which corresponds to 2018-01-01 02:00 UTC (18 years + 1 hr after DOB in UTC!).
	dob2 := time.Date(2000, 1, 1, 1, 0, 0, 0, time.UTC)
	atDateNY := time.Date(2017, 12, 31, 21, 0, 0, 0, locNY) // Absolute: 2018-01-01 02:00 UTC

	u2 := models.User{DateOfBirth: dob2}
	age2 := u2.CalculateAge(atDateNY)

	t.Logf("[Timezone Check 2] DOB (UTC): %s | atDate (NY): %s (UTC equiv: %s) -> CalculateAge: %d",
		dob2.Format(time.RFC3339), atDateNY.Format(time.RFC3339), atDateNY.UTC().Format(time.RFC3339), age2)

	if age2 != 18 {
		t.Logf("DISCOVERY: CalculateAge returns %d instead of 18 when atDate is in NY timezone (Dec 31 2017 EST = Jan 1 2018 UTC). Location mismatch between DateOfBirth and atDate causing inaccurate age calculation.", age2)
	}
}

// TestDatatypesJSON_StressTest tests complex nested JSON, empty maps, invalid JSON, and DB persistence.
func TestDatatypesJSON_StressTest(t *testing.T) {
	testDB, err := db.InitTestDB()
	if err != nil {
		t.Fatalf("Failed to init test DB: %v", err)
	}
	if err := db.AutoMigrate(testDB); err != nil {
		t.Fatalf("Failed to auto migrate: %v", err)
	}

	// 1. Complex Nested Nutrient Map
	complexJSONStr := `{
		"macros": {
			"protein": {"value": 15.5, "unit": "g", "percentage_dv": 31},
			"fat": {
				"total": {"value": 20.0, "unit": "g"},
				"saturated": {"value": 5.2, "unit": "g"},
				"trans": {"value": 0.0, "unit": "g"}
			},
			"carbohydrates": {
				"total": {"value": 45.0, "unit": "g"},
				"fiber": {"value": 8.0, "unit": "g"},
				"sugars": {"added": 12.0, "natural": 4.0}
			}
		},
		"micro_nutrients": {
			"vitamins": ["A", "C", "D", "B12"],
			"minerals": {"iron_mg": 4.2, "calcium_mg": 200}
		},
		"allergens": ["peanuts", "tree_nuts", "soy"],
		"is_organic": true,
		"servings": 2.5
	}`

	p1 := models.Product{
		Name:                "Super Organic Granola",
		Barcode:             "8901234567890",
		Brand:               "NutriChoice",
		UndeclaredNutrients: datatypes.JSON([]byte(complexJSONStr)),
		Basis:               "per serving (40g)",
		DataConfidence:      "HIGH",
	}

	if err := testDB.Create(&p1).Error; err != nil {
		t.Fatalf("Failed to create product with complex JSON: %v", err)
	}

	var fetchedP1 models.Product
	if err := testDB.First(&fetchedP1, "id = ?", p1.ID).Error; err != nil {
		t.Fatalf("Failed to fetch product with complex JSON: %v", err)
	}

	var parsedMap map[string]interface{}
	if err := json.Unmarshal(fetchedP1.UndeclaredNutrients, &parsedMap); err != nil {
		t.Fatalf("Failed to unmarshal fetched complex JSON: %v", err)
	}

	macros, ok := parsedMap["macros"].(map[string]interface{})
	if !ok {
		t.Fatalf("Expected 'macros' object in parsed JSON")
	}
	protein, ok := macros["protein"].(map[string]interface{})
	if !ok || protein["value"] != 15.5 {
		t.Errorf("Unexpected protein value in nested JSON: %v", protein)
	}

	// 2. Empty Map `{}`
	pEmptyMap := models.Product{
		Name:                "Pure Water",
		Barcode:             "8901234567891",
		UndeclaredNutrients: datatypes.JSON([]byte("{}")),
	}
	if err := testDB.Create(&pEmptyMap).Error; err != nil {
		t.Fatalf("Failed to create product with empty map JSON: %v", err)
	}
	var fetchedEmpty models.Product
	testDB.First(&fetchedEmpty, "id = ?", pEmptyMap.ID)
	if string(fetchedEmpty.UndeclaredNutrients) != "{}" {
		t.Errorf("Expected '{}', got '%s'", string(fetchedEmpty.UndeclaredNutrients))
	}

	// 3. Nil / Null JSON
	pNilJSON := models.Product{
		Name:                "Raw Sugar",
		Barcode:             "8901234567892",
		UndeclaredNutrients: datatypes.JSON(nil),
	}
	if err := testDB.Create(&pNilJSON).Error; err != nil {
		t.Fatalf("Failed to create product with nil JSON: %v", err)
	}

	// 4. Invalid JSON handling check
	invalidJSONs := [][]byte{
		[]byte(`{invalid_json:`),
		[]byte(`{"key": }`),
		[]byte(`[1, 2,`),
		[]byte(`"unclosed string`),
	}

	for i, badJSON := range invalidJSONs {
		pBad := models.Product{
			Name:                fmt.Sprintf("Bad Product %d", i),
			Barcode:             fmt.Sprintf("890123456780%d", i),
			UndeclaredNutrients: datatypes.JSON(badJSON),
		}

		// Check unmarshaling error directly
		var dummy map[string]interface{}
		err := json.Unmarshal(pBad.UndeclaredNutrients, &dummy)
		if err == nil {
			t.Errorf("Expected unmarshal error for invalid JSON #%d, but got nil", i)
		}

		// Store in DB to check DB driver behavior with malformed raw JSON
		errDB := testDB.Create(&pBad).Error
		t.Logf("Storing invalid JSON #%d ('%s') in SQLite result: err=%v", i, string(badJSON), errDB)
	}
}

// TestUUID_HighConcurrencyUniqueness stress tests UUID uniqueness under high concurrency.
func TestUUID_HighConcurrencyUniqueness(t *testing.T) {
	const totalGoroutines = 100
	const uuidsPerGoroutine = 500
	const totalUUIDs = totalGoroutines * uuidsPerGoroutine

	var generatedUUIDs sync.Map
	var wg sync.WaitGroup
	var collisionCount int64
	var collisionMutex sync.Mutex

	startTime := time.Now()

	for i := 0; i < totalGoroutines; i++ {
		wg.Add(1)
		go func(gID int) {
			defer wg.Done()
			for j := 0; j < uuidsPerGoroutine; j++ {
				// Call model BeforeCreate hooks directly and via uuid.New()
				u := models.User{}
				_ = u.BeforeCreate(nil)

				if u.ID == uuid.Nil {
					t.Errorf("Goroutine %d: Generated nil UUID!", gID)
					return
				}

				if _, loaded := generatedUUIDs.LoadOrStore(u.ID.String(), true); loaded {
					collisionMutex.Lock()
					collisionCount++
					collisionMutex.Unlock()
					t.Errorf("Goroutine %d: COLLISION DETECTED for UUID: %s", gID, u.ID)
				}

				p := models.Product{}
				_ = p.BeforeCreate(nil)
				if _, loaded := generatedUUIDs.LoadOrStore(p.ID.String(), true); loaded {
					collisionMutex.Lock()
					collisionCount++
					collisionMutex.Unlock()
					t.Errorf("Goroutine %d: COLLISION DETECTED for Product UUID: %s", gID, p.ID)
				}

				a := models.Additive{}
				_ = a.BeforeCreate(nil)
				if _, loaded := generatedUUIDs.LoadOrStore(a.ID.String(), true); loaded {
					collisionMutex.Lock()
					collisionCount++
					collisionMutex.Unlock()
					t.Errorf("Goroutine %d: COLLISION DETECTED for Additive UUID: %s", gID, a.ID)
				}

				s := models.ScanHistory{}
				_ = s.BeforeCreate(nil)
				if _, loaded := generatedUUIDs.LoadOrStore(s.ID.String(), true); loaded {
					collisionMutex.Lock()
					collisionCount++
					collisionMutex.Unlock()
					t.Errorf("Goroutine %d: COLLISION DETECTED for ScanHistory UUID: %s", gID, s.ID)
				}
			}
		}(i)
	}

	wg.Wait()
	duration := time.Since(startTime)

	t.Logf("Generated %d total UUIDs across %d concurrent goroutines in %v. Total collisions: %d",
		totalUUIDs*4, totalGoroutines, duration, collisionCount)

	if collisionCount > 0 {
		t.Fatalf("FAILED: Detected %d UUID collisions under high concurrency!", collisionCount)
	}
}

// TestUUID_DBConcurrentInsertions tests concurrent insertions directly into GORM database.
func TestUUID_DBConcurrentInsertions(t *testing.T) {
	testDB, err := db.InitTestDB()
	if err != nil {
		t.Fatalf("Failed to init test DB: %v", err)
	}
	if err := db.AutoMigrate(testDB); err != nil {
		t.Fatalf("Failed to auto migrate: %v", err)
	}

	const concurrentUsers = 50
	var wg sync.WaitGroup
	errChan := make(chan error, concurrentUsers)
	runPrefix := fmt.Sprintf("stress_%d", time.Now().UnixNano())

	for i := 0; i < concurrentUsers; i++ {
		wg.Add(1)
		go func(idx int) {
			defer wg.Done()
			user := models.User{
				Email:    fmt.Sprintf("%s_user_%d@test.com", runPrefix, idx),
				Password: "password123",
				Name:     fmt.Sprintf("User %d", idx),
			}
			if err := testDB.Create(&user).Error; err != nil {
				errChan <- err
				return
			}
			if user.ID == uuid.Nil {
				errChan <- fmt.Errorf("user %d created with nil UUID", idx)
			}
		}(i)
	}

	wg.Wait()
	close(errChan)

	for err := range errChan {
		t.Errorf("Concurrent DB insertion error: %v", err)
	}

	var createdUsersCount int64
	testDB.Model(&models.User{}).Where("email LIKE ?", runPrefix+"%").Count(&createdUsersCount)
	if createdUsersCount != int64(concurrentUsers) {
		t.Errorf("Expected %d users with prefix %s in DB, got %d", concurrentUsers, runPrefix, createdUsersCount)
	}
}
