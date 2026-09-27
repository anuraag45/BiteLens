# BiteLens: Software Group Project Teamwork Preview & Contribution Matrix
## Task Allocation, Architectural Ownership, and Individual Viva Voce Defense Guide

**Project:** BiteLens — AI & Telemetry-Powered Packaged Food Scanner & Nutrition Transparency Engine  
**Institution:** Institute of Technology and Engineering, Indus University  
**Department:** Computer Engineering  
**Academic Term:** Nov-Dec 2025 / 2026  

---

## 1. Team Roster & Engineering Personas

| Student Name | Enrollment No. | Primary Role | Secondary Focus |
|---|---|---|---|
| **Pinak Pipaliya** | `IU22CE001` | Lead Frontend Engineer & UI/UX Designer | Interactive Telemetry Labs & Visual Design System |
| **Anuraag Sharma** | `IU22CE002` | Lead Backend Architect & Systems Engineer | Go Gin REST API, PostgreSQL/GORM & Security |
| **Harshil Mehta** | `IU22CE003` | Computer Vision & Telemetry Algorithm Specialist | OCR Pipeline, INS Regex Normalizer & DPDP Compliance |
| **Vedant Kundaliya** | `IU22CE004` | Mobile Android Integration & QA Lead | Android APK Packaging, Automated Test Suites & Documentation |

---

## 2. Granular Codebase Ownership Matrix

The following matrix provides a verifiable breakdown of individual contributions across the BiteLens repository:

| Module / Component | Primary Owner | Secondary Contributor | Key Files & Artifacts Developed |
|---|---|---|---|
| **Core REST API & Routing** | Anuraag Sharma | Vedant Kundaliya | `backend/cmd/api/main.go`, `backend/internal/handlers/handlers.go` |
| **Database Schema & ORM** | Anuraag Sharma | Harshil Mehta | `backend/internal/models/*.go`, `backend/internal/db/db.go` |
| **Stateless Auth & JWT Engine** | Anuraag Sharma | Harshil Mehta | `backend/internal/auth/auth.go`, `backend/internal/middleware/middleware.go` |
| **Dynamic Minor Age Derivation** | Harshil Mehta | Anuraag Sharma | `models/user.go` (`CalculateAge`, `IsMinor`), `handlers/auth.go` |
| **INS Fuzzy Regex Tokenizer** | Harshil Mehta | Pinak Pipaliya | `handlers/scan.go` (`NormalizeINSTokens`), `models/additive.go` |
| **Dual-Scoring Telemetry Math** | Harshil Mehta | Anuraag Sharma | `internal/telemetry/telemetry.go`, `verify_math.js` |
| **Frontend Design System & UI** | Pinak Pipaliya | Vedant Kundaliya | `styles/*.css`, `index.html`, `features.html`, `how-it-works.html` |
| **Interactive Telemetry Lab HUD** | Pinak Pipaliya | Harshil Mehta | `additive-decoder.html`, `scanner-demo.html`, `compare.html` |
| **Nutritional Calculators** | Pinak Pipaliya | Harshil Mehta | `bmi-calculator.html`, `calorie-calculator.html`, `js/calculators.js` |
| **Android APK Container & Build** | Vedant Kundaliya | Pinak Pipaliya | `android/*`, `dist/downloads/bitelens.apk`, `download.html` |
| **Unit & Integration Test Suites** | Vedant Kundaliya | Anuraag Sharma | `backend/*/*_test.go` (28 test suites across all 7 packages) |
| **Academic SGP Report & Docs** | All Members | Vedant Kundaliya (Lead) | `SGP_PROJECT_REPORT.md`, `sgp_report.html`, `.docx` |

---

## 3. Academic SGP Report Authorship Matrix

Adhering to the official Indus University report format, individual chapter authorship and review responsibilities were divided as follows:

| Chapter / Section | Primary Author | Peer Reviewer | Core Technical Substance |
|---|---|---|---|
| **ABSTRACT & Keywords** | Pinak Pipaliya | Anuraag Sharma | Executive summary, clinical context, technical stack, cryptographic auditability. |
| **CHAPTER 1: Introduction** | Pinak Pipaliya | Harshil Mehta | 1.1 Overview & UPF public health need; 1.2 Problem statement; 1.5 Technology overview & Go justification. |
| **CHAPTER 2: Literature Review** | Harshil Mehta | Pinak Pipaliya | 2.1 NOVA classification framework, Nutri-Score, FSSAI draft FOPL, gap analysis against Yuka and Open Food Facts. |
| **CHAPTER 3: System Design & Modules** | Anuraag Sharma | Harshil Mehta | 3.1 3-tier architecture & data flow; 3.2 Module breakdown (Auth, INS, Telemetry, Calculators); 3.3 UI routes; 3.4 Verification snippets. |
| **CHAPTER 4: Limitations & Future Work** | Vedant Kundaliya | Anuraag Sharma | 4.1 Minor consent VPC gateway, packaging curvature OCR; 4.2 Edge AI, vernacular regional languages, crowdsourced APIs. |
| **CHAPTER 5: Conclusion & Bibliography**| Vedant Kundaliya | Pinak Pipaliya | 5.1 Project summary and societal impact; 10 formal academic & statutory citations. |

---

## 4. Collaborative Engineering Workflow & Quality Controls

### Git Branching Model & Commit Cadence
- **`main` Branch:** Protected production branch; requires passing CI test suites and minimum 1 peer code review approval before merging.
- **`feature/*` Branches:** Isolated topic branches for discrete modules (e.g. `feature/ins-regex-normalizer`, `feature/telemetry-stepper-ui`).
- **`bugfix/*` Branches:** Rapid hotfix branches for edge-case resolutions (e.g. `bugfix/utc-age-normalization`).

### Peer Review & Pair Programming Sessions
1. **Session 1 (Backend Systems):** Anuraag Sharma and Harshil Mehta paired to design the GORM schema supporting PostgreSQL JSONB arrays for `UndeclaredNutrients` without silent zero defaults.
2. **Session 2 (Telemetry Mathematics):** Harshil Mehta and Pinak Pipaliya collaborated to verify the Mifflin-St Jeor formula and Asian-specific BMI cutoffs in `js/calculators.js` and cross-validated with `verify_math.js`.
3. **Session 3 (Android Native Packaging):** Vedant Kundaliya and Pinak Pipaliya integrated the WebKit container with hardware camera triggers and bundled offline assets into `bitelens.apk`.

---

## 5. Individual Viva Voce Oral Defense Preparation Guide

During the final university oral examination, examiners evaluate each student's deep technical comprehension. Below is the tailored defense guide for each member:

### 1. Pinak Pipaliya (Frontend & UI/UX Lead)
- **Q1: "Why did you implement a custom vanilla CSS design system instead of using Tailwind CSS or Bootstrap?"**
  - *Model Answer:* "Frameworks like Tailwind or Bootstrap introduce hundreds of kilobytes of unused classes and impose generic aesthetics. By engineering a custom design system using CSS custom properties (`--primary: #1E3A8A`, `--bg-card: #FFFFFF`), we achieved an ultra-lightweight footprint, instant First Contentful Paint (<0.6s), and total layout control. This allowed us to emulate the soft, approachable design language of Apple Health and Cal AI without framework bloat."
- **Q2: "How does your interface prevent background click bleed-through in complex interactive modals?"**
  - *Model Answer:* "We implemented strict modal isolation using high `z-index` layering, CSS `backdrop-filter`, and explicit `e.stopPropagation()` handlers on card containers. This ensures touch events on interactive elements within modals or stepper labs never trigger unintended background scrolling or navigation clicks."

### 2. Anuraag Sharma (Backend Architecture Lead)
- **Q1: "Why choose Go (Golang) over Python or Node.js for the REST API backend?"**
  - *Model Answer:* "Go compiles to a single standalone machine binary with zero runtime dependency overhead. It offers superior concurrency through lightweight goroutines, allowing our API to handle concurrent OCR parsing requests with sub-50ms latency while consuming under 30MB of RAM. Furthermore, Go's strict static typing prevents silent runtime type coercion errors in our health scoring mathematics."
- **Q2: "How do you protect authentication sessions against Cross-Site Scripting (XSS) and CSRF attacks?"**
  - *Model Answer:* "We explicitly avoid `localStorage` for JWT tokens because any XSS vulnerability can exfiltrate local storage. Instead, our Gin backend issues stateless JWT tokens inside `HttpOnly`, `SameSite=Strict`, `Secure` browser cookies. This makes the session token completely inaccessible to client-side JavaScript while preventing CSRF exploitation across third-party domains."

### 3. Harshil Mehta (AI / Computer Vision & Telemetry Lead)
- **Q1: "How does the INS regex tokenizer handle distorted or imperfect OCR text from real packaging?"**
  - *Model Answer:* "Real packaging labels frequently suffer from OCR misreads—such as the lowercase letter 'l' or digit '1' being read instead of uppercase 'I' in 'INS 621'. Our `NormalizeINSTokens()` function applies regex substitutions that replace glyph variations (`[l1]NS` &rarr; `INS`), strips hyphens and whitespaces, and unifies European 'E' numbers into canonical FSSAI keys before querying the relational database."
- **Q2: "How does your dynamic minor age calculation prevent statutory compliance failures under the DPDP Act 2023?"**
  - *Model Answer:* "Persisting a static 'Age' integer in the database is an anti-pattern because users age every day, rendering the stored column stale. In `models/user.go`, we persist only `DateOfBirth` and dynamically calculate age at read-time against UTC: `years := ref.Year() - dob.Year()`, adjusting for month and day. If the calculated age is under 18, `IsMinor()` returns `true`, triggering mandatory parental consent under DPDP Act Rule 11."

### 4. Vedant Kundaliya (Mobile Integration & QA Lead)
- **Q1: "How did you package the BiteLens platform into a standalone Android APK?"**
  - *Model Answer:* "We created a native Android wrapper (`com.bitelens.app`) using Android SDK API 34. The application hosts a high-performance WebKit WebView container with hardware acceleration enabled. Camera hardware permissions (`android.permission.CAMERA`) are managed through the native WebChromeClient file-chooser bridge, enabling seamless camera photo capture. The compiled APK is only 1.36 MB, ensuring rapid downloads even over 3G/4G networks."
- **Q2: "What is your testing strategy and how did you guarantee zero regressions across the backend?"**
  - *Model Answer:* "We built an exhaustive automated unit test suite spanning all 7 Go packages: `cmd/api`, `internal/auth`, `internal/db`, `internal/handlers`, `internal/middleware`, `internal/models`, and `internal/telemetry`. We run `go test -count=1 ./...` to bypass cached results and verify real-time execution. In addition, we execute automated mathematical scripts (`verify_math.js`) to guarantee 100% precision for physiological calculations."
