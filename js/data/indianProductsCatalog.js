/* ==========================================================================
   BiteLens Mobile Catalog - Comprehensive Indian Packaged Foods Database
   Includes authentic EAN-13 barcodes, FSSAI additive decoding, NOVA tiers,
   macronutrients per serving, and Blinkit-style clean swaps.
   ========================================================================== */

export const INDIAN_PRODUCTS_CATALOG = [
  {
    barcode: "8901030383178",
    name: "Maggi 2-Minute Masala Instant Noodles",
    brand: "Nestlé India",
    category: "Instant",
    categoryLabel: "🍜 Instant & Ready Meals",
    image: "🍜",
    size: "70g Pack",
    price: 14,
    novaGroup: 4,
    novaLabel: "Group 4 (Ultra-Processed)",
    novaBg: "#FEE2E2",
    novaColor: "#DC2626",
    healthScore: 32,
    goalFit: "Low Fit (High Sodium & Refined Flour)",
    goalColor: "#DC2626",
    servingSize: "70g",
    calories: 345,
    protein: 7.0,
    carbs: 48.0,
    sugars: 3.8,
    fat: 14.5,
    saturatedFat: 6.8,
    sodium: 980, // FSSAI warning > 600mg
    dietaryFiber: 1.2,
    allergens: ["Wheat (Gluten)", "Soy"],
    additives: [
      {
        code: "INS 621",
        name: "Monosodium Glutamate (MSG)",
        purpose: "Flavor Enhancer",
        note: "Synthetic savory umami enhancer. Excessive consumption flagged by health authorities.",
        status: "Watchlist"
      },
      {
        code: "INS 451(i)",
        name: "Pentasodium Triphosphate",
        purpose: "Emulsifying Salts & Stabilizer",
        note: "Retains moisture in extruded refined dough. Characteristic marker of ultra-processed food.",
        status: "Ultra-Processed"
      },
      {
        code: "INS 412",
        name: "Guar Gum",
        purpose: "Thickening Agent",
        note: "Vegetable gum used for noodle texture and elasticity.",
        status: "Permitted"
      }
    ],
    summary: "Refined wheat flour noodle cake fried in palm oil. Contains 49% of maximum recommended daily sodium in a single snack pack.",
    swaps: {
      recommendedBarcode: "8901725134821",
      recommendedName: "Roasted Masala Makhana",
      reason: "78% less sodium, 0g synthetic MSG, whole foxnut seed base."
    }
  },
  {
    barcode: "8901063004071",
    name: "Parle-G Original Gluco Biscuits",
    brand: "Parle Products",
    category: "Snacks",
    categoryLabel: "🫘 Biscuits & Snacks",
    image: "🍪",
    size: "65g Pack",
    price: 5,
    novaGroup: 4,
    novaLabel: "Group 4 (Ultra-Processed)",
    novaBg: "#FEE2E2",
    novaColor: "#DC2626",
    healthScore: 38,
    goalFit: "Low Fit (High Refined Sugar & Palm Oil)",
    goalColor: "#DC2626",
    servingSize: "30g",
    calories: 135,
    protein: 2.1,
    carbs: 23.5,
    sugars: 8.4,
    fat: 3.9,
    saturatedFat: 1.9,
    sodium: 95,
    dietaryFiber: 0.6,
    allergens: ["Wheat (Gluten)", "Milk Solids", "Invert Sugar"],
    additives: [
      {
        code: "INS 500(ii)",
        name: "Sodium Hydrogen Carbonate",
        purpose: "Raising Agent",
        note: "Baking soda used for aerated crispy texture.",
        status: "Permitted"
      },
      {
        code: "INS 503(ii)",
        name: "Ammonium Hydrogen Carbonate",
        purpose: "Leavening Agent",
        note: "Volatile leavener used in commercial biscuits.",
        status: "Permitted"
      }
    ],
    summary: "Traditional glucose tea biscuit made with refined wheat flour (Maida), invert sugar syrup, and palmolein oil.",
    swaps: {
      recommendedBarcode: "8901058863294",
      recommendedName: "Multigrain Oats Crisp",
      reason: "60% less refined sugar, 4x higher dietary fiber."
    }
  },
  {
    barcode: "8901262010016",
    name: "Amul Pasteurized Salted Butter",
    brand: "Amul (GCMMF)",
    category: "Dairy",
    categoryLabel: "🍓 Dairy & Butter",
    image: "🧈",
    size: "100g Pack",
    price: 58,
    novaGroup: 2,
    novaLabel: "Group 2 (Processed Culinary Ingredient)",
    novaBg: "#E0F2FE",
    novaColor: "#0284C7",
    healthScore: 68,
    goalFit: "Moderate Fit (Natural Fat, High Saturated)",
    goalColor: "#0284C7",
    servingSize: "10g",
    calories: 72,
    protein: 0.1,
    carbs: 0.0,
    sugars: 0.0,
    fat: 8.0,
    saturatedFat: 5.2,
    sodium: 83,
    dietaryFiber: 0.0,
    allergens: ["Milk (Dairy)"],
    additives: [
      {
        code: "INS 160a(i)",
        name: "Beta-Carotene",
        purpose: "Natural Plant Colorant",
        note: "Pro-vitamin A plant pigment giving butter its uniform golden hue.",
        status: "Clean"
      }
    ],
    summary: "Natural churned butterfat from cow & buffalo milk with common salt and natural beta-carotene color. Pure culinary fat.",
    swaps: null
  },
  {
    barcode: "8901058852391",
    name: "Lay's India's Magic Masala Potato Chips",
    brand: "PepsiCo India",
    category: "Snacks",
    categoryLabel: "🫘 Crisps & Chips",
    image: "🥔",
    size: "50g Pack",
    price: 20,
    novaGroup: 4,
    novaLabel: "Group 4 (Ultra-Processed)",
    novaBg: "#FEE2E2",
    novaColor: "#DC2626",
    healthScore: 26,
    goalFit: "Poor Fit (High Sodium & Palm Fat)",
    goalColor: "#DC2626",
    servingSize: "30g",
    calories: 165,
    protein: 2.1,
    carbs: 16.5,
    sugars: 1.5,
    fat: 10.2,
    saturatedFat: 4.8,
    sodium: 295,
    dietaryFiber: 1.0,
    allergens: ["Milk Solids"],
    additives: [
      {
        code: "INS 627",
        name: "Disodium Guanylate",
        purpose: "Flavor Enhancer",
        note: "Umami salt booster used to intensify savory sensation.",
        status: "Ultra-Processed"
      },
      {
        code: "INS 631",
        name: "Disodium Inosinate",
        purpose: "Flavor Enhancer",
        note: "Synthetic flavor potentiator.",
        status: "Watchlist"
      },
      {
        code: "INS 330",
        name: "Citric Acid",
        purpose: "Acidity Regulator",
        note: "Natural citrus acid for tart masala flavor.",
        status: "Clean"
      }
    ],
    summary: "Thin sliced potatoes deep-fried in palmolein oil, dusted with synthetic flavor enhancers INS 627 and 631.",
    swaps: {
      recommendedBarcode: "8901725134821",
      recommendedName: "Roasted Masala Makhana",
      reason: "Roasted (zero deep-frying), 75% lower saturated fat, zero synthetic flavor enhancers."
    }
  },
  {
    barcode: "8901491102931",
    name: "Kurkure Masala Munch",
    brand: "PepsiCo India",
    category: "Snacks",
    categoryLabel: "🫘 Healthy Snacks",
    image: "🥨",
    size: "75g Pack",
    price: 20,
    novaGroup: 4,
    novaLabel: "Group 4 (Ultra-Processed)",
    novaBg: "#FEE2E2",
    novaColor: "#DC2626",
    healthScore: 28,
    goalFit: "Poor Fit (High Trans/Saturated Fats)",
    goalColor: "#DC2626",
    servingSize: "30g",
    calories: 168,
    protein: 1.8,
    carbs: 17.1,
    sugars: 0.6,
    fat: 10.5,
    saturatedFat: 4.9,
    sodium: 270,
    dietaryFiber: 0.9,
    allergens: ["Milk Solids", "Wheat Derivatives"],
    additives: [
      {
        code: "INS 627",
        name: "Disodium Guanylate",
        purpose: "Flavor Enhancer",
        note: "Synergistic flavor enhancer frequently paired with MSG. Characteristic of ultra-processed snacks.",
        status: "Ultra-Processed"
      },
      {
        code: "INS 631",
        name: "Disodium Inosinate",
        purpose: "Flavor Enhancer",
        note: "Prepared from starch or meat extract. Intensifies salt perception.",
        status: "Watchlist"
      }
    ],
    summary: "Extruded corn meal and rice flour fried in palmolein with high sodium density and industrial flavor enhancers.",
    swaps: {
      recommendedBarcode: "8901725134821",
      recommendedName: "Roasted Masala Makhana",
      reason: "Roasted (not deep fried in palm oil) with 90% less saturated fat."
    }
  },
  {
    barcode: "8901725134821",
    name: "Roasted Masala Makhana",
    brand: "FarmClean India",
    category: "Snacks",
    categoryLabel: "🫘 Healthy Snacks",
    image: "🫘",
    size: "60g Pack",
    price: 75,
    novaGroup: 2,
    novaLabel: "Group 2 (Minimally Processed)",
    novaBg: "#E8F5E9",
    novaColor: "#2E7D32",
    healthScore: 92,
    goalFit: "High Fit (Low Fat, High Fiber)",
    goalColor: "#2E7D32",
    servingSize: "30g",
    calories: 120,
    protein: 3.6,
    carbs: 22.0,
    sugars: 0.4,
    fat: 1.8,
    saturatedFat: 0.3,
    sodium: 135,
    dietaryFiber: 4.1,
    allergens: ["None declared"],
    additives: [
      {
        code: "Natural Spices",
        name: "Whole Cumin, Turmeric, Black Salt",
        purpose: "Natural Flavoring",
        note: "Zero synthetic chemicals, zero artificial food colors.",
        status: "Clean"
      }
    ],
    summary: "Whole puffed foxnut seeds roasted in cold-pressed olive oil. Excellent low-glycemic, heart-healthy snack.",
    swaps: null
  },
  {
    barcode: "8901058863294",
    name: "Multigrain Oats Crisp",
    brand: "GrainPro Vitality",
    category: "Breakfast",
    categoryLabel: "🥣 Oats & Cereals",
    image: "🥣",
    size: "400g Box",
    price: 185,
    novaGroup: 3,
    novaLabel: "Group 3 (Processed)",
    novaBg: "#E0F2FE",
    novaColor: "#0284C7",
    healthScore: 74,
    goalFit: "Good Fit (Sustained Energy & Beta-Glucan)",
    goalColor: "#0284C7",
    servingSize: "45g",
    calories: 175,
    protein: 5.2,
    carbs: 30.5,
    sugars: 3.1,
    fat: 3.2,
    saturatedFat: 0.6,
    sodium: 155,
    dietaryFiber: 4.8,
    allergens: ["Oats (Gluten)", "Soy"],
    additives: [
      {
        code: "INS 500(ii)",
        name: "Sodium Hydrogen Carbonate",
        purpose: "Acidity Regulator & Leavening",
        note: "Common baking soda for crispness. Permitted under FSSAI Table 1.",
        status: "Permitted"
      },
      {
        code: "INS 322",
        name: "Soy Lecithin",
        purpose: "Emulsifier",
        note: "Plant-derived phospholipid preventing fat separation.",
        status: "Permitted"
      }
    ],
    summary: "Rolled wholegrain oats enriched with wheat bran and barley. Modest natural sugars with rich soluble fiber.",
    swaps: null
  },
  {
    barcode: "8902080345129",
    name: "Berry Greek Yogurt",
    brand: "DairyLuxe",
    category: "Dairy",
    categoryLabel: "🍓 Dairy & Yogurts",
    image: "🍓",
    size: "120g Cup",
    price: 55,
    novaGroup: 4,
    novaLabel: "Group 4 (Ultra-Processed)",
    novaBg: "#FEF3C7",
    novaColor: "#D97706",
    healthScore: 56,
    goalFit: "Moderate Fit (Added Sugar Alert)",
    goalColor: "#D97706",
    servingSize: "120g",
    calories: 140,
    protein: 8.5,
    carbs: 19.0,
    sugars: 14.5, // High added sugar warning
    fat: 3.0,
    saturatedFat: 1.8,
    sodium: 65,
    dietaryFiber: 0.8,
    allergens: ["Milk / Lactose", "Carmine (Insect Derived)"],
    additives: [
      {
        code: "INS 120",
        name: "Carmine / Cochineal Extract",
        purpose: "Natural Colorant (Red)",
        note: "Red pigment derived from crushed dried insects. Non-vegetarian origin.",
        status: "Allergen Alert"
      },
      {
        code: "INS 440",
        name: "Pectin",
        purpose: "Gelling Agent & Stabilizer",
        note: "Extracted from citrus peels. Natural thickening fiber.",
        status: "Clean"
      }
    ],
    summary: "Real Greek yogurt strained for protein, but blended with 14.5g added glucose-fructose syrup and non-vegetarian INS 120 red color.",
    swaps: {
      recommendedBarcode: "8901058863294",
      recommendedName: "Plain Greek Yogurt with Multigrain Oats",
      reason: "Avoids 14g added refined syrup and non-veg carmine dye."
    }
  },
  {
    barcode: "8901262984102",
    name: "Dark Cocoa Whey Protein Bar",
    brand: "ProNutra Active",
    category: "Fitness",
    categoryLabel: "🍫 Protein & Nutrition Bars",
    image: "🍫",
    size: "60g Bar",
    price: 110,
    novaGroup: 3,
    novaLabel: "Group 3 (Processed)",
    novaBg: "#E0F2FE",
    novaColor: "#0284C7",
    healthScore: 84,
    goalFit: "Peak Fit (20g Protein / Clean Fiber)",
    goalColor: "#2E7D32",
    servingSize: "60g",
    calories: 215,
    protein: 20.0,
    carbs: 18.0,
    sugars: 2.2,
    fat: 6.5,
    saturatedFat: 2.5,
    sodium: 110,
    dietaryFiber: 7.5,
    allergens: ["Milk (Whey)", "Soy", "Tree Nuts"],
    additives: [
      {
        code: "INS 965",
        name: "Maltitol Syrup",
        purpose: "Polyol Sweetener",
        note: "Sugar alcohol with 50% fewer calories than table sugar. Minimal blood sugar spike.",
        status: "Permitted"
      },
      {
        code: "INS 322",
        name: "Sunflower Lecithin",
        purpose: "Emulsifier",
        note: "Non-GMO plant lecithin for chocolate gloss and consistency.",
        status: "Clean"
      }
    ],
    summary: "Cross-flow microfiltered whey isolate bar with unsweetened Dutch cocoa and zero added refined cane sugar.",
    swaps: null
  },
  {
    barcode: "7622201824103",
    name: "Cadbury Dairy Milk Chocolate",
    brand: "Mondelez India",
    category: "Snacks",
    categoryLabel: "🍫 Chocolates & Confectionery",
    image: "🍫",
    size: "50g Bar",
    price: 45,
    novaGroup: 4,
    novaLabel: "Group 4 (Ultra-Processed)",
    novaBg: "#FEE2E2",
    novaColor: "#DC2626",
    healthScore: 30,
    goalFit: "Poor Fit (High Refined Sugar 57%)",
    goalColor: "#DC2626",
    servingSize: "20g",
    calories: 106,
    protein: 1.5,
    carbs: 11.8,
    sugars: 11.4, // Over 55% sugar by weight
    fat: 6.1,
    saturatedFat: 3.8,
    sodium: 30,
    dietaryFiber: 0.4,
    allergens: ["Milk Solids", "Soy"],
    additives: [
      {
        code: "INS 442",
        name: "Ammonium Phosphatides",
        purpose: "Emulsifier",
        note: "Synthetic emulsifier used to regulate viscosity of chocolate.",
        status: "Permitted"
      },
      {
        code: "INS 476",
        name: "Polyglycerol Polyricinoleate (PGPR)",
        purpose: "Emulsifier",
        note: "Synthesized from castor beans and glycerol. Reduces cocoa butter requirements.",
        status: "Watchlist"
      }
    ],
    summary: "Milk chocolate containing over 57g added refined cane sugar per 100g, blended with PGPR (INS 476) and cocoa butter equivalents.",
    swaps: {
      recommendedBarcode: "8901262984102",
      recommendedName: "Dark Cocoa Whey Protein Bar",
      reason: "80% less sugar, 4x more protein, unsweetened Dutch cocoa."
    }
  },
  {
    barcode: "8901063141127",
    name: "Haldiram's Aloo Bhujia",
    brand: "Haldiram's",
    category: "Snacks",
    categoryLabel: "🫘 Traditional Indian Namkeen",
    image: "🍟",
    size: "150g Pack",
    price: 45,
    novaGroup: 4,
    novaLabel: "Group 4 (Ultra-Processed)",
    novaBg: "#FEE2E2",
    novaColor: "#DC2626",
    healthScore: 24,
    goalFit: "Poor Fit (High Saturated Fat & Sodium)",
    goalColor: "#DC2626",
    servingSize: "30g",
    calories: 178,
    protein: 2.8,
    carbs: 13.5,
    sugars: 0.9,
    fat: 12.6,
    saturatedFat: 5.8,
    sodium: 310,
    dietaryFiber: 1.2,
    allergens: ["Gram Flour (Besan)", "Peanut Oil traces"],
    additives: [
      {
        code: "INS 330",
        name: "Citric Acid",
        purpose: "Acidity Regulator",
        note: "Provides authentic Indian chatpata tanginess.",
        status: "Clean"
      }
    ],
    summary: "Potato flakes and chickpea flour fried in refined cottonseed/palmolein oil with intense spicy seasoning.",
    swaps: {
      recommendedBarcode: "8901725134821",
      recommendedName: "Roasted Masala Makhana",
      reason: "85% less fat, zero palmolein oil, clean roasted foxnuts."
    }
  },
  {
    barcode: "8901764012210",
    name: "Real Fruit Power Mixed Fruit Juice",
    brand: "Dabur India",
    category: "Beverages",
    categoryLabel: "🥤 Beverages & Juices",
    image: "🧃",
    size: "1000ml Pack",
    price: 130,
    novaGroup: 4,
    novaLabel: "Group 4 (Ultra-Processed)",
    novaBg: "#FEE2E2",
    novaColor: "#DC2626",
    healthScore: 36,
    goalFit: "Low Fit (High Free Sugars, Zero Fiber)",
    goalColor: "#DC2626",
    servingSize: "200ml",
    calories: 112,
    protein: 0.4,
    carbs: 27.6,
    sugars: 26.0, // High added liquid sugar
    fat: 0.0,
    saturatedFat: 0.0,
    sodium: 40,
    dietaryFiber: 0.0,
    allergens: ["None declared"],
    additives: [
      {
        code: "INS 330",
        name: "Citric Acid",
        purpose: "Acidity Regulator",
        note: "Fruit acidity buffer.",
        status: "Clean"
      },
      {
        code: "INS 440",
        name: "Pectin",
        purpose: "Thickener & Stabilizer",
        note: "Citrus peel fruit pectin.",
        status: "Clean"
      },
      {
        code: "INS 300",
        name: "Ascorbic Acid (Vitamin C)",
        purpose: "Antioxidant",
        note: "Synthetic Vitamin C added to prevent oxidation and browning.",
        status: "Clean"
      }
    ],
    summary: "Reconstituted fruit concentrate with 13g added industrial sugar per 100ml. Stripped of all natural fruit pulp dietary fiber.",
    swaps: {
      recommendedBarcode: "8902080345129",
      recommendedName: "Berry Greek Yogurt",
      reason: "Provides whole protein and active probiotic cultures instead of liquid sugar."
    }
  }
];
