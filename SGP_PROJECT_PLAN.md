# BiteLens: Software Group Project Execution Plan (SGP 2025–2026)
## Engineering Roadmap, Work Breakdown Structure (WBS), and Sprint Milestones

**Project:** BiteLens — AI & Telemetry-Powered Packaged Food Scanner & Nutrition Transparency Engine  
**Institution:** Institute of Technology and Engineering, Indus University  
**Department:** Computer Engineering  
**Academic Term:** Nov-Dec 2025 / 2026  
**Team Members:**  
- Pinak Pipaliya (IU22CE001)  
- Anuraag Sharma (IU22CE002)  
- Harshil Mehta (IU22CE003)  
- Vedant Kundaliya (IU22CE004)  

---

## 1. Executive Summary & Project Mission

The BiteLens project plan outlines the systematic engineering lifecycle, architectural milestones, task allocations, quality gates, and risk mitigation strategies required to deliver a production-grade food transparency platform. 

The primary objective is to build a reliable, high-concurrency Go REST API, an Apple Health-inspired Vite web interface, and an Android APK package capable of extracting packaged food ingredient labels via Optical Character Recognition (OCR), mapping International Numbering System (INS) food additive codes to plain-English health risks, and generating decoupled NOVA Health Processing and personal Goal Fit scores with verifiable cryptographic traceability.

---

## 2. Work Breakdown Structure (WBS)

```
BiteLens Platform (WBS 1.0)
├── 1.1 Project Governance & Regulatory Research
│   ├── 1.1.1 FSSAI Labelling Regulations 2020 Review
│   ├── 1.1.2 Codex Alimentarius INS Additive Taxonomy Compilation
│   ├── 1.1.3 DPDP Act 2023 Minor Data Protection Guidelines
│   └── 1.1.4 Architecture Specification & Tech Stack Selection
├── 1.2 Backend Engineering & Data Persistence (Go / PostgreSQL)
│   ├── 1.2.1 Gin Router Setup, Middleware & Rate Limiting (10 req/min)
│   ├── 1.2.2 PostgreSQL Schema Design & GORM Migrations (JSONB support)
│   ├── 1.2.3 Stateless JWT Cookie Authentication & DPDP Minor Logic
│   └── 1.2.4 FSSAI Database Seeding & Indexed Additive Lookup Endpoints
├── 1.3 Computer Vision & OCR Processing Pipeline
│   ├── 1.3.1 OCR Text Extraction Integration (Cloud Vision / Tesseract)
│   ├── 1.3.2 Fuzzy Regex Normalization Engine (NormalizeINSTokens)
│   ├── 1.3.3 Label Parsing & Noise Filtering (Preservatives, Emulsifiers)
│   └── 1.3.4 Cylindrical & Glare Packaging Error Handlers
├── 1.4 Dual-Scoring Telemetry Engine
│   ├── 1.4.1 NOVA 4-Tier Processing Score Deduction Algorithm
│   ├── 1.4.2 Goal Fit Multi-Axis Target Matching (Weight × Muscle)
│   ├── 1.4.3 Dataset Hardening (Measurement Basis & Undeclared Nutrients)
│   └── 1.4.4 SHA-256 Cryptographic Audit Hash Generation
├── 1.5 Frontend Web Client Architecture (Vite / Vanilla JS / CSS)
│   ├── 1.5.1 Multi-Page Route Structure (14 distinct static pages)
│   ├── 1.5.2 Interactive Smartphone Scanner Mockup with Food Presets
│   ├── 1.5.3 4-Step Telemetry Laboratory Walkthrough Stepper
│   ├── 1.5.4 HUD Additive Decoder Studio & Instant Filter Workbench
│   └── 1.5.5 Verified BMR/TDEE & Asian BMI Calculators
├── 1.6 Android Mobile APK Packaging
│   ├── 1.6.1 Android Manifest & Hardware Camera Permissions Setup
│   ├── 1.6.2 WebKit WebView Container & JavaScript Bridge
│   ├── 1.6.3 Offline Asset Bundling & Caching Strategy
│   └── 1.6.4 APK Signing, Alignment & Distribution (`bitelens.apk`)
└── 1.7 Verification, Quality Assurance & Academic Defense
    ├── 1.7.1 Go Unit Test Suite Execution (100% Package Pass)
    ├── 1.7.2 Mathematical Benchmark Validation (Mifflin-St Jeor / Asian BMI)
    ├── 1.7.3 Performance Profiling & Sub-50ms Latency Benchmarking
    └── 1.7.4 Comprehensive SGP Documentation & Viva Defense Prep
```

---

## 3. Sprint Roadmap & Milestone Schedule (14 Weeks)

### Phase 1: Problem Definition, Regulatory Research & Architecture (Weeks 1–2)
- **Objectives:** Establish project governance, analyze FSSAI Labelling Regulations (2020), codify INS additives, and define system architecture.
- **Key Tasks:**
  - Map 100+ standard FSSAI INS codes with risk ratings, functional classes, and everyday translations.
  - Review DPDP Act 2023 for age consent requirements and design read-time dynamic age calculation.
  - Draft System Requirements Specification (SRS) and architecture diagrams.
- **Exit Gate 1:** Verified additive taxonomy JSON corpus; finalized database schema; approved architecture design document.

### Phase 2: Core Go Backend & Telemetry Math (Weeks 3–5)
- **Objectives:** Engineer the Go (Golang 1.22+) Gin REST backend, PostgreSQL relational schema, and telemetry scoring engine.
- **Key Tasks:**
  - Build `internal/models` with GORM UUID primary keys, GORM JSONB datatypes, and soft-delete capabilities.
  - Implement `internal/auth` with bcrypt password hashing and `HttpOnly` JWT cookie issuance.
  - Implement read-time dynamic age derivation `user.CalculateAge()` to eliminate stale database column bugs.
  - Implement `internal/telemetry` computing independent NOVA Health Processing Score (0–100) and Goal Fit Score (0–100).
  - Implement SHA-256 cryptographic audit signature generation.
- **Exit Gate 2:** All Go unit tests passing; seed script successfully inserts additive database; API response latency < 50ms.

### Phase 3: Computer Vision, OCR & Regex Tokenizer (Weeks 6–7)
- **Objectives:** Construct the optical packaging ingestion pipeline and noise-resilient regex tokenizer.
- **Key Tasks:**
  - Implement `NormalizeINSTokens()` to handle OCR misreads (e.g. `"lNS 621"`, `"1NS-621"`, `"E621"`).
  - Build ingredient text chunking and delimiter parsing logic in `internal/handlers/scan.go`.
  - Add stress tests for dirty, truncated, and multi-line ingredient strings.
- **Exit Gate 3:** OCR tokenization pipeline passes 100% of benchmark dirty-text test cases.

### Phase 4: Vite Frontend & Interactive Telemetry Labs (Weeks 8–10)
- **Objectives:** Design and build the 14-page responsive web client inspired by Apple Health and Cal AI.
- **Key Tasks:**
  - Construct custom CSS design system using CSS custom properties with pastel accents and rounded cards.
  - Build interactive smartphone scanner mockup on `index.html` with preset items (Oats Crisp, Yogurt, Makhana).
  - Build 4-step Telemetry Laboratory on `how-it-works.html` demonstrating OCR extraction, label decoding, NOVA grouping, and goal simulation.
  - Build HUD Additive Decoder Studio on `additive-decoder.html` with instant debounced search.
  - Implement Mifflin-St Jeor BMR/TDEE and Asian-specific BMI calculators with automated validation.
- **Exit Gate 4:** Lighthouse Accessibility and Performance scores > 90; zero background click bleed-through; all 14 pages fully navigable.

### Phase 5: Android APK Packaging & Mobile Integration (Weeks 11–12)
- **Objectives:** Package the web platform into an installable Android APK with hardware integration.
- **Key Tasks:**
  - Configure `android/app` with Android SDK (API level 34).
  - Implement WebKit WebView container with hardware acceleration and camera permission prompts.
  - Package static assets and bundle compiled APK (`dist/downloads/bitelens.apk`).
  - Verify APK installation on Android devices and validate touch response.
- **Exit Gate 5:** Functional signed APK (1.36 MB) tested and operational on physical Android devices.

### Phase 6: Verification, Hardening & Academic Defense (Weeks 13–14)
- **Objectives:** Execute end-to-end regression testing, security hardening, and prepare oral viva defense.
- **Key Tasks:**
  - Execute uncached Go unit tests across all 7 backend packages (`go test -count=1 ./...`).
  - Run mathematical verification scripts (`verify_math.js`) matching Section 8 worked examples.
  - Compile the complete academic SGP Project Report adhering to the Indus University docx format.
  - Conduct mock viva voce defense sessions for all four team members.
- **Exit Gate 6:** Final SGP Report generated in `.docx`, `.pdf`, and `.html`; 100% test pass rate; project ready for university evaluation.

---

## 4. Master Timeline & Gantt Schedule

| Work Package / Sprint | W1 | W2 | W3 | W4 | W5 | W6 | W7 | W8 | W9 | W10 | W11 | W12 | W13 | W14 |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **1.1 Regulatory & Taxonomy Corpus** | &#9608;&#9608; | &#9608;&#9608; | | | | | | | | | | | | |
| **1.2 Go Backend & Database Schema** | | | &#9608;&#9608; | &#9608;&#9608; | &#9608;&#9608; | | | | | | | | | |
| **1.3 OCR & Regex Tokenizer Engine** | | | | | | &#9608;&#9608; | &#9608;&#9608; | | | | | | | |
| **1.4 Dual-Scoring Telemetry Engine** | | | | &#9608;&#9608; | &#9608;&#9608; | &#9608;&#9608; | | | | | | | | |
| **1.5 Vite Frontend & Telemetry Labs** | | | | | | | | &#9608;&#9608; | &#9608;&#9608; | &#9608;&#9608; | | | | |
| **1.6 Android APK Container & Build** | | | | | | | | | | | &#9608;&#9608; | &#9608;&#9608; | | |
| **1.7 Automated Testing & Math Verif** | | | | | &#9608;&#9608; | | &#9608;&#9608; | | | &#9608;&#9608; | | &#9608;&#9608; | &#9608;&#9608; | &#9608;&#9608; |
| **1.8 Report Compilation & Viva Prep** | | | | | | | | | | | | | &#9608;&#9608; | &#9608;&#9608; |

---

## 5. Quality Gates & Deliverables Checklist

- [x] **Curated FSSAI Database:** Over 100+ Indian additive codes with hazard tiers and plain-English translations.
- [x] **Go REST Backend:** 7 tested packages with Gin routing, CORS, rate limiting, and GORM PostgreSQL/SQLite fallback.
- [x] **Dynamic Age Engine:** UTC-normalized read-time age derivation guaranteeing DPDP Act minor compliance.
- [x] **Dual-Scoring Engine:** Independent NOVA Health Score and Goal Fit Score with SHA-256 traceability.
- [x] **Vite Web Client:** 14 fully linked, responsive pages with zero background click bleed-through.
- [x] **Verified Calculators:** Mifflin-St Jeor BMR/TDEE and Asian BMI cutoffs validated against Section 8 worked examples.
- [x] **Android Distribution:** Standalone compiled and signed Android APK (`bitelens.apk`, 1.36 MB).
- [x] **Test Verification:** 100% passing backend unit tests (`go test -count=1 ./...`).
- [x] **Academic Documentation:** Complete SGP Project Report adhering strictly to Indus University's 2026 format.

---

## 6. Risk Management & Contingency Matrix

| Risk Event | Severity | Probability | Mitigation Strategy & Contingency Plan |
|---|:---:|:---:|---|
| **OCR Misinterpretation of INS Codes** | High | Medium | Implement fuzzy regex normalizer (`NormalizeINSTokens`) substituting common OCR glyph errors (`l` &rarr; `I`, `O` &rarr; `0`) and stripping punctuation. |
| **Silent Zero-Default Data Corruption** | High | Low | Enforce explicit `Basis` enumeration (`per_100g_100ml` vs `per_serving`) and store missing nutrients in a dedicated JSONB `UndeclaredNutrients` array. |
| **DPDP Act Minor Compliance Violations** | Critical | Low | Eliminate persistent integer age fields; compute age dynamically at read-time in UTC; block telemetry storage for minors lacking parental consent. |
| **Network Latency in Grocery Aisles** | Medium | High | Pre-bundle core INS additive dictionaries inside the client bundle and Android assets for instant offline lookup without server roundtrips. |
| **Mobile Hardware Compatibility** | Medium | Low | Package web client into a lightweight WebKit container targeting Android API 34 with backwards compatibility down to Android 8.0. |
