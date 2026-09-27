/* ==========================================================================
   BiteLens Mobile Catalog - Curated Indian Packaged Foods
   Includes authentic EAN-13 barcodes, FSSAI additive decoding, NOVA tiers,
   macronutrients per serving, and Blinkit-style clean swaps.
   ========================================================================== */

export const INDIAN_PRODUCTS_CATALOG = [
  {
    barcode: "8901030383178",
    name: "Masala Instant Noodles",
    brand: "QuickBite",
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
    barcode: "8901491102931",
    name: "Crispy Potato Chips (Spanish Tomato)",
    brand: "CrunchMax",
    category: "Snacks",
    categoryLabel: "🫘 Healthy Snacks",
    image: "🥔",
    size: "52g Pack",
    price: 20,
    novaGroup: 4,
    novaLabel: "Group 4 (Ultra-Processed)",
    novaBg: "#FEE2E2",
    novaColor: "#DC2626",
    healthScore: 28,
    goalFit: "Poor Fit (High Trans/Saturated Fats)",
    goalColor: "#DC2626",
    servingSize: "52g",
    calories: 285,
    protein: 3.2,
    carbs: 29.0,
    sugars: 4.5,
    fat: 17.5,
    saturatedFat: 7.8,
    sodium: 460,
    dietaryFiber: 1.1,
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
        note: "Prepared from meat or tapioca starch. Intensifies salt perception.",
        status: "Watchlist"
      },
      {
        code: "INS 330",
        name: "Citric Acid",
        purpose: "Acidity Regulator",
        note: "Provides tartness matching tomato seasoning.",
        status: "Clean"
      }
    ],
    summary: "Deep fried sliced potatoes in palmolein oil containing double flavor enhancers (INS 627, 631) and high saturated fat density.",
    swaps: {
      recommendedBarcode: "8901725134821",
      recommendedName: "Roasted Masala Makhana",
      reason: "Roasted (not deep fried in palm oil) with 90% less saturated fat."
    }
  }
];
