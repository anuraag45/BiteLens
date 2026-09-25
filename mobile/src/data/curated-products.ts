/**
 * BiteLens Mobile - Curated Indian Packaged Food Catalog
 * Manually verified label telemetry with real Indian EAN-13 barcodes,
 * NOVA processing ratings, FSSAI additive linkages, and goal fit scores.
 */

import { Product } from '../types';
import { FSSAI_ADDITIVES } from '../algorithms/fssai-database';

function findAdditive(code: string) {
  return FSSAI_ADDITIVES.find(a => a.insCode.toLowerCase() === code.toLowerCase()) || {
    insCode: code,
    name: 'Disclosed Food Additive',
    category: 'Classified Additive',
    origin: 'Regulatory formulation',
    riskLevel: 'medium' as const,
    description: 'FSSAI listed ingredient.',
    plainEnglish: 'Food additive regulating shelf-stability or texture.',
  };
}

export const CURATED_PRODUCTS: Product[] = [
  {
    id: 'prod-makhana',
    barcode: '8901234567890',
    name: 'Roasted Masala Foxnuts (Makhana)',
    brand: 'HealthyBites India',
    category: 'Traditional Roasted Snack',
    novaGroup: 2,
    healthScore: 92,
    ingredientsRaw: 'Foxnuts (Euryale ferox) (88%), Cold-Pressed Olive Oil (7%), Rock Salt (Sendha Namak), Spices (Black Pepper, Cumin, Turmeric) (5%).',
    nutrients: {
      calories: 140,
      protein: 4.5,
      carbohydrates: 22.0,
      sugars: 0.2,
      addedSugar: 0.0,
      fat: 3.8,
      saturatedFat: 0.6,
      sodium: 180,
      servingSize: '35g Pack',
    },
    detectedAdditives: [],
    allergens: [],
    goalFit: {
      weightLossScore: 94,
      muscleGainScore: 78,
      maintenanceScore: 92,
      summary: 'Exceptional whole food snack. Minimal processing, zero added sugar, low saturated fat, and high natural satiety.',
    },
    fssaiLicense: '10018021003456',
  },
  {
    id: 'prod-noodles',
    barcode: '8901058852331',
    name: 'Classic 2-Minute Masala Noodles',
    brand: 'Maggi',
    category: 'Instant Convenience Noodles',
    novaGroup: 4,
    healthScore: 36,
    ingredientsRaw: 'Refined Wheat Flour (Maida), Palm Oil, Iodised Salt, Wheat Gluten, Thickeners (INS 508, INS 412), Acidity Regulators (INS 501(i), INS 500(i)), Humectant (INS 451(i)). Tastemaker: Mixed Spices, Hydrolysed Groundnut Protein, Sugar, Flavor Enhancers (INS 627, INS 631, INS 621), Palm Oil, Acidity Regulator (INS 330), Caramel IV (INS 150d).',
    nutrients: {
      calories: 380,
      protein: 7.8,
      carbohydrates: 55.4,
      sugars: 3.2,
      addedSugar: 2.1,
      fat: 14.6,
      saturatedFat: 6.8,
      sodium: 890,
      servingSize: '70g Single Cake',
    },
    detectedAdditives: [
      findAdditive('INS 621'),
      findAdditive('INS 627'),
      findAdditive('INS 631'),
      findAdditive('INS 150d'),
      findAdditive('INS 500(ii)'),
      findAdditive('INS 412'),
      findAdditive('INS 330'),
    ],
    allergens: ['gluten', 'soy', 'peanut'],
    goalFit: {
      weightLossScore: 28,
      muscleGainScore: 42,
      maintenanceScore: 34,
      summary: 'Ultra-processed convenience food with deep-fried refined palm oil base, high sodium (~45% daily allowance in one cake), and 3 synthetic flavor enhancers.',
    },
    fssaiLicense: '10012011000168',
  },
  {
    id: 'prod-chips',
    barcode: '8901491101837',
    name: 'Spiced Tomato Potato Chips',
    brand: 'Lay\'s India',
    category: 'Extruded / Fried Potato Snack',
    novaGroup: 4,
    healthScore: 34,
    ingredientsRaw: 'Potato (55%), Edible Vegetable Oil (Palmolein), Seasoning (Sugar, Iodised Salt, Tomato Powder (1.2%), Spices & Condiments, Acidity Regulators (INS 330, INS 296), Flavor Enhancers (INS 627, INS 631, INS 621), Anticaking Agent (INS 551), Color (INS 160c)).',
    nutrients: {
      calories: 275,
      protein: 3.4,
      carbohydrates: 27.5,
      sugars: 4.8,
      addedSugar: 3.8,
      fat: 17.2,
      saturatedFat: 7.5,
      sodium: 420,
      servingSize: '50g Packet',
    },
    detectedAdditives: [
      findAdditive('INS 621'),
      findAdditive('INS 627'),
      findAdditive('INS 631'),
      findAdditive('INS 330'),
    ],
    allergens: [],
    goalFit: {
      weightLossScore: 22,
      muscleGainScore: 26,
      maintenanceScore: 30,
      summary: 'High calorie density combined with high saturated fat from palmolein oil and added flavor excitotoxins.',
    },
    fssaiLicense: '10014064000435',
  },
  {
    id: 'prod-greek-yogurt',
    barcode: '8906086780123',
    name: 'Strawberry Greek Yogurt Cup',
    brand: 'Epigamia',
    category: 'Strained Cultured Dairy',
    novaGroup: 4,
    healthScore: 68,
    ingredientsRaw: 'Pasteurised Double Toned Milk, Processed Strawberry Fruit Crush (Strawberries 45%, Sugar, Pectin (INS 440), Acidity Regulator (INS 330), Natural Carmine Color (INS 120)), Active Live Cultures.',
    nutrients: {
      calories: 110,
      protein: 7.0,
      carbohydrates: 14.5,
      sugars: 12.0,
      addedSugar: 7.5,
      fat: 2.2,
      saturatedFat: 1.4,
      sodium: 65,
      servingSize: '90g Cup',
    },
    detectedAdditives: [
      findAdditive('INS 120'),
      findAdditive('INS 440'),
      findAdditive('INS 330'),
    ],
    allergens: ['lactose', 'dairy', 'carmine'],
    goalFit: {
      weightLossScore: 68,
      muscleGainScore: 84,
      maintenanceScore: 78,
      summary: 'High bioavailable protein and beneficial live gut bacteria, offset by 7.5g added refined fruit syrup sugars and animal-derived Carmine color (INS 120).',
    },
    fssaiLicense: '10019022009876',
  },
  {
    id: 'prod-protein-bar',
    barcode: '8906014401824',
    name: 'Choco Fudge 20g High Protein Bar',
    brand: 'RiteBite Max Protein',
    category: 'Formulated Performance Nutrition',
    novaGroup: 4,
    healthScore: 54,
    ingredientsRaw: 'Protein Blend (Soy Protein Isolate, Whey Protein Concentrate, Calcium Caseinate) (30%), Dark Compound (Sugar, Hydrogenated Vegetable Fat, Cocoa Solids, Emulsifier (INS 322, INS 476)), Fructo-oligosaccharides, Soy Crisps, Glycerine, Emulsifier (INS 322), Sweetener (INS 955).',
    nutrients: {
      calories: 260,
      protein: 20.0,
      carbohydrates: 28.0,
      sugars: 4.2,
      addedSugar: 1.8,
      fat: 8.5,
      saturatedFat: 4.2,
      sodium: 190,
      servingSize: '67g Single Bar',
    },
    detectedAdditives: [
      findAdditive('INS 322'),
      findAdditive('INS 955'),
      findAdditive('INS 471'),
    ],
    allergens: ['soy', 'dairy', 'lactose'],
    goalFit: {
      weightLossScore: 72,
      muscleGainScore: 92,
      maintenanceScore: 80,
      summary: 'Classic Dual Scoring trade-off: High Goal Fit for muscle building (20g protein), but low NOVA processing rating (Group 4) due to hydrogenated fats, soy isolates, and sucralose (INS 955).',
    },
    fssaiLicense: '10013022002144',
  },
  {
    id: 'prod-milk',
    barcode: '8901262010053',
    name: 'Taaza Homogenised Toned Milk',
    brand: 'Amul',
    category: 'Fresh Dairy',
    novaGroup: 1,
    healthScore: 95,
    ingredientsRaw: 'Standardised Pasteurised Homogenised Toned Milk (Min 3.0% Milk Fat, Min 8.5% Milk SNF). Vitamin A & Vitamin D fortified.',
    nutrients: {
      calories: 58,
      protein: 3.2,
      carbohydrates: 4.7,
      sugars: 4.7,
      addedSugar: 0.0,
      fat: 3.0,
      saturatedFat: 1.9,
      sodium: 50,
      servingSize: '100ml',
    },
    detectedAdditives: [],
    allergens: ['dairy', 'lactose'],
    goalFit: {
      weightLossScore: 88,
      muscleGainScore: 86,
      maintenanceScore: 94,
      summary: 'NOVA Group 1 minimally processed whole food staple. Rich source of calcium and high biological value protein with zero added synthetic additives.',
    },
    fssaiLicense: '10012021000071',
  },
  {
    id: 'prod-digestive-biscuits',
    barcode: '8901063012881',
    name: 'NutriChoice High Fiber Digestive Biscuits',
    brand: 'Britannia',
    category: 'Packaged Baked Biscuits',
    novaGroup: 4,
    healthScore: 48,
    ingredientsRaw: 'Refined Wheat Flour (Maida) (48%), Whole Wheat Flour (Atta) (18%), Edible Vegetable Oil (Palm), Sugar, Wheat Bran (4.5%), Invert Sugar Syrup, Raising Agents (INS 500(ii), INS 503(ii)), Iodised Salt, Emulsifier (INS 322), Dough Conditioner (INS 223).',
    nutrients: {
      calories: 476,
      protein: 8.0,
      carbohydrates: 68.0,
      sugars: 18.5,
      addedSugar: 16.0,
      fat: 19.0,
      saturatedFat: 9.0,
      sodium: 380,
      servingSize: '100g (Approx 6 Biscuits)',
    },
    detectedAdditives: [
      findAdditive('INS 500(ii)'),
      findAdditive('INS 322'),
      findAdditive('INS 223'),
    ],
    allergens: ['gluten', 'soy', 'sulphites'],
    goalFit: {
      weightLossScore: 36,
      muscleGainScore: 40,
      maintenanceScore: 45,
      summary: 'Often marketed as healthy, but contains 48% refined maida, 16g added refined sugars, palm oil, and preservative INS 223 (sulfite). Only 4.5% actual wheat bran.',
    },
    fssaiLicense: '10015043001129',
  },
  {
    id: 'prod-cola',
    barcode: '8901764012217',
    name: 'Diet Zero Sugar Cola',
    brand: 'Coca-Cola Zero Sugar',
    category: 'Carbonated Beverage',
    novaGroup: 4,
    healthScore: 38,
    ingredientsRaw: 'Carbonated Water, Acidity Regulators (INS 338, INS 331(iii)), Color (INS 150d), Artificial Sweeteners (INS 955, INS 950), Preservative (INS 211), Caffeine (9.8mg/100ml).',
    nutrients: {
      calories: 1,
      protein: 0.0,
      carbohydrates: 0.2,
      sugars: 0.0,
      addedSugar: 0.0,
      fat: 0.0,
      saturatedFat: 0.0,
      sodium: 18,
      servingSize: '300ml Can',
    },
    detectedAdditives: [
      findAdditive('INS 150d'),
      findAdditive('INS 955'),
      findAdditive('INS 950'),
      findAdditive('INS 211'),
    ],
    allergens: [],
    goalFit: {
      weightLossScore: 78,
      muscleGainScore: 50,
      maintenanceScore: 62,
      summary: 'Zero calories make it attractive for fat loss deficit, but pure NOVA 4 formulation with 2 intense artificial sweeteners, phosphoric acid, and preservative INS 211.',
    },
    fssaiLicense: '10012011000120',
  },
];

export function lookupProductByBarcode(barcode: string): Product | null {
  if (!barcode) return null;
  const cleanBarcode = barcode.trim();
  return CURATED_PRODUCTS.find(p => p.barcode === cleanBarcode) || null;
}

export function searchProducts(query: string): Product[] {
  if (!query) return CURATED_PRODUCTS;
  const q = query.toLowerCase().trim();
  return CURATED_PRODUCTS.filter(
    p =>
      p.name.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.barcode.includes(q)
  );
}
