# Build Prompt for Antigravity — "Pink" Marketing & Demo Website

## 0. Context and Purpose

Build a **multi-page marketing/demo website** for "Pink" (working name — not final; treat as a placeholder that should be easy to swap out via a single config/constant, not hardcoded across every file), an India-focused mobile app concept that scans packaged food (barcode or label photo), decodes ingredients and additive codes into plain language, and produces two separate scores: a **Health Score** (a heuristic based on processing level and nutrient thresholds) and a **Goal Fit Score** (based on the user's stated fitness goal).

This website is a **college demo/presentation deliverable**, not a production product site. Its sole purpose is to advertise the app concept and its planned features. It does **not** need real backend functionality for the app itself (no real scanning, no real user accounts, no real database of products) — except for two genuinely functional calculator tools specified in Section 5, which must work for real, with correct formulas.

**Do not invent or assume any information not provided in this prompt.** If a section of content is ambiguous, prefer clearly-labeled placeholder text (e.g., "[Team bio — replace with real content]") over fabricating specifics (no invented user counts, ratings, testimonials, press mentions, or partnership claims).

---

## 1. Technical Requirements

- Build a **true multi-page website** — separate routes/URLs per page (e.g. `/`, `/features`, `/how-it-works`, `/bmi-calculator`, `/calorie-calculator`, `/science`, `/about`, `/contact`). This is explicitly **not** a single-page scrolling application with anchor links standing in for pages.
- Use plain **HTML/CSS/JavaScript** (multi-page, one `.html` file per route) unless a framework is clearly better suited — if using a framework (e.g. React with a router, or Next.js), it must still produce distinct, shareable URLs per page, not a single route with conditionally rendered sections.
- Fully responsive: mobile, tablet, and desktop breakpoints. Test especially at 375px (mobile), 768px (tablet), 1440px (desktop).
- Shared header (navigation) and footer components across all pages — do not duplicate/diverge nav markup per page.
- No external backend required. The Contact page form may be non-functional (visual only) or use a `mailto:` action — do not attempt real form submission/storage.
- Reasonably fast, clean code — this will be shown to a professor, so code clarity matters, not just visual output.

---

## 2. Visual Design Direction

**Reference aesthetic:** MyFitnessPal and Cal AI — soft, calm, approachable wellness-app design. Explicitly **not** clinical, corporate, or medical-looking.

- **Color palette:** soft, muted pastels. Suggested base: soft sage green or soft blue as primary, warm off-white/cream as background (not stark white), a soft coral or peach as an accent for CTAs. Avoid saturated primary colors, avoid harsh red (reads as "warning/medical" rather than "friendly").
- **Typography:** a clean, rounded, friendly sans-serif (e.g., something in the style of Inter, Poppins, or similar geometric/rounded sans). Generous line height and spacing — should feel airy, not dense.
- **Shape language:** rounded corners throughout (cards, buttons, inputs — 12–20px radius range), soft drop shadows (subtle, not heavy), no sharp edges.
- **Imagery:** friendly, illustrative style over photographic where possible (icons, simple illustrations of food/scanning/phones) — avoid stock-photo-looking "AI slop" imagery. Use simple SVG icon sets for feature icons.
- **Whitespace:** generous padding/margins — do not cram content. Cal AI and MyFitnessPal both lean heavily on breathing room between sections.
- **Motion:** subtle only — gentle fade/slide-in on scroll for section reveals is fine; avoid aggressive or distracting animation.

---

## 3. Global Navigation & Footer

**Header nav (all pages):** Logo/wordmark ("Pink" placeholder) · Home · Features · How It Works · Calculators (dropdown or sub-links to BMI + Calorie) · Science · About · Contact · a CTA button ("See the App" or similar, can link to a placeholder/anchor since there's no real app yet)

**Footer (all pages):** Short tagline, nav link repeat, a clearly visible **disclaimer line** (see Section 7), a placeholder contact email, and a copyright line. No fake social media follower counts or fake app-store badges/ratings.

---

## 4. Page-by-Page Content Specification

### 4.1 Home (`/`)
- **Hero section:** Headline focused on the core value prop — decoding what's actually in Indian packaged food, in plain language. Subheadline mentioning both plain-language ingredient decoding *and* goal-based tracking. A primary CTA button (e.g., "Explore Features") and a secondary CTA (e.g., "Try the BMI Calculator").
- **Problem/why section:** Short section framing the gap — Indian nutrition labels are legally present but hard to interpret (additive codes, functional classes), and most tracking apps have thin Indian product coverage. Keep to 2–3 sentences, not a wall of text.
- **Three-feature highlight strip:** Icon + short text for (1) Scan & Decode, (2) Health Score, (3) Goal Fit Score — each linking through to the Features page for depth.
- **How it works teaser:** 3-step visual strip (Scan → Understand → Decide), linking to the full How It Works page.
- **Closing CTA section:** Simple banner reinforcing the value prop with a CTA.

### 4.2 Features (`/features`)
Detailed breakdown, each as its own section with icon + heading + 2–4 sentence description:
- **Barcode & Label Scanning** — scan a barcode or photograph a label for instant analysis.
- **Plain-Language Ingredient Decoding** — INS additive codes and functional classes translated into everyday language.
- **Health Score** — a heuristic score based on processing level (NOVA-informed) and nutrient thresholds (fat, sugar, salt) — explicitly describe this as a heuristic/informational score, not an official or medical rating (see Section 7).
- **Goal Fit Score** — a separate score reflecting how well a product fits the user's stated goal (gain, lose, or maintain weight/muscle) — explicitly note this is shown separately from the Health Score, never merged, so users see both even when they conflict (e.g., a food that fits a protein goal but is heavily processed).
- **Additive Flagging** — identity and regulatory status of additives present in a scanned product, always tied to a disclosed source.
- **Dashboard** — calories, protein, carbohydrates, fat, and an additive-flag summary in one place.

### 4.3 How It Works (`/how-it-works`)
A clear, visual step-by-step flow:
1. Scan a barcode or photograph the label
2. The app extracts ingredients and nutrition data
3. Pink decodes additives and calculates the Health Score and Goal Fit Score
4. You see a clear, plain-language breakdown and can make an informed decision

Use a numbered/step visual layout (cards or a vertical/horizontal stepper), not a plain paragraph.

### 4.4 BMI Calculator (`/bmi-calculator`) — FUNCTIONAL, see Section 5.1
### 4.5 Calorie Calculator (`/calorie-calculator`) — FUNCTIONAL, see Section 5.2

### 4.6 Science / Methodology (`/science`)
This page exists to build credibility with a technical/academic audience (your professor). Cover, in plain but precise language:
- The Health Score draws on the **NOVA food classification framework** (processing-level tiers) combined with **nutrient-threshold flags** (saturated fat, sugar, sodium).
- Explicitly state: **India does not currently have a finalized, mandatory front-of-pack nutrition rating standard.** Pink's Health Score is presented as an independent, transparent heuristic — not an official FSSAI rating, not a medical or diagnostic tool.
- Every score or additive flag is intended to trace back to a publicly disclosed source (the product's own label, FSSAI's published functional-class/limit information, or cited research) — never an unsourced claim.
- Include a short "Why not just use stars/an official rating?" explainer — honest, not defensive: because no finalized official system exists yet in India, and using an unfinalized draft as if authoritative would be misleading.

### 4.7 About (`/about`)
- Short vision/mission statement (translate ingredient lists and processing levels into plain language so people don't have to guess what they're eating).
- Team section: founder names and roles as **[Placeholder — insert real names/roles/photos]** rather than inventing bios. Structure the layout (4 cards) so real content can be dropped in.
- Optional: a short "why we're building this" narrative section, generic enough not to require unconfirmed specifics.

### 4.8 Contact (`/contact`)
- Simple, friendly contact section — headline, short supporting line, a form (Name / Email / Message) that is either visual-only or uses a `mailto:` action, plus a placeholder contact email displayed as text.

---

## 5. Functional Calculator Specifications (must work correctly — use exact formulas below)

### 5.1 BMI Calculator
- **Inputs:** Weight (kg or lb toggle), Height (cm or ft/in toggle), and an optional "Use Asian BMI cutoffs" toggle.
- **Formula (metric):** `BMI = weight (kg) / (height (m))²`
- **If imperial units entered, convert to metric first**, then apply the same formula: `weight (lb) × 0.453592` → kg; `height (in) × 0.0254` → m.
- **Standard WHO categories (default):**
  - Underweight: BMI < 18.5
  - Normal: 18.5–24.9
  - Overweight: 25–29.9
  - Obese: ≥ 30
- **Asian-specific cutoffs (when toggle is on)** — note in the UI that WHO's standard cutoffs are less accurate for South Asian body composition, and the WHO Expert Consultation has published Asian-specific action points:
  - Underweight: BMI < 18.5
  - Normal: 18.5–22.9
  - Overweight (at risk): 23–24.9
  - Obese I: 25–29.9
  - Obese II: ≥ 30
- **Output:** numeric BMI (1 decimal place), category label, and a short neutral explanatory sentence. Include a visible disclaimer that BMI is a screening measure, not a diagnostic tool, and does not account for muscle mass, age, or body composition directly.

### 5.2 Calorie Calculator (Mifflin-St Jeor Equation)
- **Inputs:** Sex (male/female — note in UI this is a biological-sex input for the formula, not a gender identity question), Age (years), Weight (kg or lb), Height (cm or ft/in), Activity Level (dropdown), Goal (maintain / mild deficit / deficit / mild surplus / surplus — optional, for a final adjusted number).
- **BMR formulas (Mifflin-St Jeor):**
  - Male: `BMR = 10 × weight(kg) + 6.25 × height(cm) − 5 × age(years) + 5`
  - Female: `BMR = 10 × weight(kg) + 6.25 × height(cm) − 5 × age(years) − 161`
- **Activity multipliers (TDEE = BMR × multiplier):**
  - Sedentary (little/no exercise): × 1.2
  - Lightly active (light exercise 1–3 days/week): × 1.375
  - Moderately active (moderate exercise 3–5 days/week): × 1.55
  - Very active (hard exercise 6–7 days/week): × 1.725
  - Extra active (very hard exercise, physical job): × 1.9
- **Goal adjustment (optional, applied to TDEE):**
  - Mild weight loss: TDEE − 250 kcal/day
  - Weight loss: TDEE − 500 kcal/day
  - Mild weight gain: TDEE + 250 kcal/day
  - Weight gain: TDEE + 500 kcal/day
  - Maintain: no adjustment
- **Output:** BMR, maintenance TDEE, and (if a goal is selected) the goal-adjusted calorie target — all clearly labeled, with a disclaimer that this is an estimate, not medical advice, and that individual needs vary.

Both calculators should validate inputs (positive numbers, realistic ranges) and show a friendly inline error rather than breaking or showing `NaN`.

---

## 6. What NOT to Include (explicit exclusions)

- No fake testimonials, reviews, or star ratings.
- No fake user/download counts ("Join 50,000+ users" or similar) — the app has not launched.
- No fake press logos ("As seen in...") or fake partner/brand logos.
- No claims that the Health Score is "FSSAI-certified," "government-approved," or an "official rating."
- No medical claims — nowhere should the site imply the app diagnoses, treats, or gives medical advice for any condition.
- No pricing page — the product has no finalized pricing model yet; do not invent one.
- No real user account creation, login, or data storage.
- No sound/video autoplay.

---

## 7. Required Disclaimer Language

Include a visible, honestly-worded disclaimer in the footer (short form) and a fuller version on the Science page:

> Pink's Health Score and Goal Fit Score are informational heuristics based on published nutrition science and food classification frameworks. They are not official government ratings, and not medical or diagnostic advice. Always consult a qualified professional for health or dietary decisions.

The BMI and Calorie calculators must each carry their own short disclaimer (see Section 5) noting they are estimates, not medical advice.

---

## 8. Deliverable Expectations

- All pages listed in Section 4, fully built, linked, and navigable via the shared header/footer.
- Both calculators fully functional per Section 5's exact formulas — test with at least one manual example to confirm correct output before considering the build complete. Worked example: a 70kg, 175cm, 30-year-old male, moderately active:
  `BMR = 10(70) + 6.25(175) − 5(30) + 5 = 700 + 1093.75 − 150 + 5 = 1,648.75 kcal`
  `TDEE = 1,648.75 × 1.55 (moderately active) = 2,555.6 kcal`
  Expect BMR ≈ 1,649 kcal and TDEE ≈ 2,556 kcal. If the built calculator produces different numbers for these exact inputs, the formula implementation has a bug.
- Fully responsive across mobile/tablet/desktop.
- Clean, organized file/folder structure suitable for a student project walkthrough (a professor may ask to see the code).
- Consistent design system (colors, type, spacing, components) applied uniformly across all pages — no page should look visually disconnected from the rest.