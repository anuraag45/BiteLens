/* ==========================================================================
   BiteLens Web Application - Unified Optical & Nutritional Analysis Engine
   Single source of truth for:
   1. Real Tesseract.js Client-Side Optical Character Recognition with Bounding Boxes
   2. Open Food Facts Barcode API Lookup (with local catalog fallback)
   3. Documented BiteLens Score (100 - Published Weights) collapsing into 1 Headline Score
   4. Multi-tier Additive Risk Mapping & Goal Alignment
   ========================================================================== */

import { ADDITIVE_DATABASE } from './additive-database.js';
import { INSNormalizer, FuzzyMatcher } from './data-structures.js';
import productsData from './data/products.js';
import Tesseract from 'tesseract.js';

/**
 * Computes the unified Headline BiteLens Score (0–100) using published, transparent weights.
 * Base = 100. Deductions are itemized and verifiable.
 */
export function calculateBiteLensScore(options = {}) {
  const {
    novaGroup = 4,
    additives = [],
    macros = {},
    userGoal = 'maintenance' // 'fat_loss', 'muscle_gain', 'maintenance', 'low_sodium', 'clean_eating'
  } = options;

  let base = 100;
  const breakdown = [];

  // 1. Base NOVA Processing Penalty
  let novaPenalty = 0;
  if (novaGroup === 1) {
    novaPenalty = 0;
    breakdown.push({ factor: "NOVA Group 1 (Unprocessed / Whole Food)", penalty: 0, type: "nova" });
  } else if (novaGroup === 2) {
    novaPenalty = 5;
    breakdown.push({ factor: "NOVA Group 2 (Culinary Ingredient)", penalty: -5, type: "nova" });
  } else if (novaGroup === 3) {
    novaPenalty = 20;
    breakdown.push({ factor: "NOVA Group 3 (Processed Food)", penalty: -20, type: "nova" });
  } else {
    novaPenalty = 40;
    breakdown.push({ factor: "NOVA Group 4 (Ultra-Processed Formulation)", penalty: -40, type: "nova" });
  }
  base -= novaPenalty;

  // 2. Additive Deductions (Itemized based on scientific & regulatory risk)
  let additiveTotalPenalty = 0;
  additives.forEach(add => {
    const penalty = typeof add.penaltyWeight === 'number' ? add.penaltyWeight : 6;
    additiveTotalPenalty += penalty;
    breakdown.push({
      factor: `${add.code || 'Additive'} (${add.name || 'Synthetic Additive'})`,
      penalty: -penalty,
      type: "additive",
      riskLevel: add.riskLevel || 'moderate'
    });
  });
  base -= Math.min(35, additiveTotalPenalty); // Cap additive penalty at 35 to prevent negative sub-totals

  // 3. Nutritional Threshold Penalties (WHO & FSSAI benchmarks per 100g)
  const sodium = macros.sodium || 0; // mg
  const addedSugar = macros.addedSugar !== undefined ? macros.addedSugar : (macros.sugar || 0); // g
  const fat = macros.fat || 0; // g

  if (sodium >= 800) {
    base -= 12;
    breakdown.push({ factor: `High Sodium Density (${sodium}mg / 100g, >40% WHO limit)`, penalty: -12, type: "nutrition" });
  } else if (sodium >= 500) {
    base -= 6;
    breakdown.push({ factor: `Moderate Sodium (${sodium}mg / 100g)`, penalty: -6, type: "nutrition" });
  }

  if (addedSugar >= 15) {
    base -= 12;
    breakdown.push({ factor: `High Added Sugars (${addedSugar}g / 100g, >60% WHO guideline)`, penalty: -12, type: "nutrition" });
  } else if (addedSugar >= 8) {
    base -= 6;
    breakdown.push({ factor: `Moderate Added Sugars (${addedSugar}g / 100g)`, penalty: -6, type: "nutrition" });
  }

  if (fat >= 25) {
    base -= 6;
    breakdown.push({ factor: `High Fat / Palmolein Density (${fat}g / 100g)`, penalty: -6, type: "nutrition" });
  }

  // 4. Personal Goal Adjustment (+/- up to 8 points)
  let goalModifier = 0;
  if (userGoal === 'fat_loss') {
    if ((macros.calories || 0) > 450) {
      goalModifier = -6;
      breakdown.push({ factor: "Caloric Density Penalty for Fat Loss Goal", penalty: -6, type: "goal" });
    } else if ((macros.calories || 0) < 150) {
      goalModifier = +4;
      breakdown.push({ factor: "Low Calorie Density Bonus for Fat Loss Goal", penalty: +4, type: "goal" });
    }
  } else if (userGoal === 'muscle_gain') {
    if ((macros.protein || 0) >= 12) {
      goalModifier = +8;
      breakdown.push({ factor: "High Protein Density Bonus for Muscle Building", penalty: +8, type: "goal" });
    } else if ((macros.protein || 0) < 3) {
      goalModifier = -4;
      breakdown.push({ factor: "Low Protein Density for Muscle Goal", penalty: -4, type: "goal" });
    }
  } else if (userGoal === 'low_sodium') {
    if (sodium > 400) {
      goalModifier = -8;
      breakdown.push({ factor: "Elevated Sodium Penalty for Low-Sodium Profile", penalty: -8, type: "goal" });
    }
  }

  base += goalModifier;
  const finalScore = Math.max(5, Math.min(100, Math.round(base)));

  // Tier Classification
  let tier = 'Excellent';
  let tierColor = '#2D6A4F';
  let tierBg = '#E8F5E9';

  if (finalScore < 40) {
    tier = 'Avoid / Heavy UPF';
    tierColor = '#B91C1C';
    tierBg = '#FEE2E2';
  } else if (finalScore < 65) {
    tier = 'Caution / Ultra-Processed';
    tierColor = '#C2410C';
    tierBg = '#FFEDD5';
  } else if (finalScore < 80) {
    tier = 'Moderate / Processed';
    tierColor = '#B45309';
    tierBg = '#FEF3C7';
  }

  return {
    score: finalScore,
    tier,
    tierColor,
    tierBg,
    novaGroup,
    breakdown,
    userGoal
  };
}

/**
 * Extracts recognized INS codes, E-numbers, and additive names from raw ingredient OCR text.
 */
export function extractAdditivesFromText(rawText) {
  if (!rawText || typeof rawText !== 'string') return [];
  const text = rawText.replace(/\n+/g, ' ');

  const detected = [];
  const seenCodes = new Set();

  // 1. Regex matching for INS and E-numbers (e.g. "INS 621", "INS-621", "E 322", "INS 500(ii)", "150d", "160a(i)")
  const codeRegex = /\b(?:INS[-:\s]*|E[-:\s]*)?([0-9Il|OoDqQsS$bBzZ]{3,4}[a-zA-Z]?(?:\([a-zA-Z0-9]+\))?)/gi;
  let match;

  while ((match = codeRegex.exec(text)) !== null) {
    const rawToken = match[1];
    const norm = INSNormalizer.normalizeCode(rawToken);
    if (!norm.number) continue;

    // Find in database
    const entry = ADDITIVE_DATABASE.find(item => INSNormalizer.matchCode(norm.number, item.code) || INSNormalizer.matchCode(norm.number, item.eCode));
    if (entry && !seenCodes.has(entry.code)) {
      seenCodes.add(entry.code);
      detected.push({
        ...entry,
        rawMatched: match[0],
        startIndex: match.index,
        endIndex: match.index + match[0].length
      });
    }
  }

  // 2. Additive Name & Alias matching (e.g. "Monosodium Glutamate", "MSG", "Tartrazine", "Carrageenan")
  ADDITIVE_DATABASE.forEach(item => {
    if (seenCodes.has(item.code)) return;

    // Check exact name
    const nameRegex = new RegExp(`\\b${escapeRegExp(item.name)}\\b`, 'i');
    if (nameRegex.test(text)) {
      seenCodes.add(item.code);
      detected.push({
        ...item,
        rawMatched: item.name
      });
      return;
    }

    // Check aliases
    if (Array.isArray(item.aliases)) {
      for (const alias of item.aliases) {
        if (alias.length < 3) continue; // Avoid 1-2 char false positives
        const aliasRegex = new RegExp(`\\b${escapeRegExp(alias)}\\b`, 'i');
        if (aliasRegex.test(text)) {
          seenCodes.add(item.code);
          detected.push({
            ...item,
            rawMatched: alias
          });
          break;
        }
      }
    }
  });

  return detected;
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Executes REAL client-side Optical Character Recognition via Tesseract.js.
 * Returns extracted text along with word-level bounding boxes for visual annotation.
 */
export async function performOpticalOCR(imageFileOrUrl, onProgress = () => {}) {
  try {
    const result = await Tesseract.recognize(
      imageFileOrUrl,
      'eng',
      {
        logger: m => {
          if (m.status === 'recognizing text') {
            onProgress(Math.round((m.progress || 0) * 100));
          }
        }
      }
    );

    const fullText = result.data.text || '';
    const words = [];

    // Extract word bounding boxes
    if (result.data.words && Array.isArray(result.data.words)) {
      result.data.words.forEach(w => {
        if (w.text && w.bbox) {
          words.push({
            text: w.text,
            bbox: w.bbox, // { x0, y0, x1, y1 }
            confidence: w.confidence
          });
        }
      });
    }

    // Correlate detected additives with their bounding box positions
    const detectedAdditives = extractAdditivesFromText(fullText);
    const annotatedAdditives = correlateBoxesWithAdditives(words, detectedAdditives);

    return {
      success: true,
      rawText: fullText,
      words,
      additives: detectedAdditives,
      annotatedBoxes: annotatedAdditives
    };
  } catch (error) {
    console.error("OCR recognition error:", error);
    return {
      success: false,
      error: error.message || "Failed to process image OCR"
    };
  }
}

/**
 * Correlates detected additives with word bounding boxes to draw overlays on images.
 */
function correlateBoxesWithAdditives(words, additives) {
  const annotated = [];

  additives.forEach(add => {
    const codeNum = add.code.replace(/INS\s*/i, '').trim();
    // Search words for token matching
    const matchedWords = words.filter(w => {
      const cleanW = w.text.replace(/[^a-zA-Z0-9]/g, '');
      const norm = INSNormalizer.normalizeCode(cleanW);
      return norm.number === codeNum || cleanW.toLowerCase().includes(codeNum.toLowerCase());
    });

    if (matchedWords.length > 0) {
      // Merge bounding boxes
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      matchedWords.forEach(w => {
        minX = Math.min(minX, w.bbox.x0);
        minY = Math.min(minY, w.bbox.y0);
        maxX = Math.max(maxX, w.bbox.x1);
        maxY = Math.max(maxY, w.bbox.y1);
      });

      annotated.push({
        additive: add,
        bbox: { x0: minX, y0: minY, x1: maxX, y1: maxY },
        color: add.riskLevel === 'caution' ? '#DC2626' : (add.riskLevel === 'moderate' ? '#D97706' : '#16A34A')
      });
    }
  });

  return annotated;
}

/**
 * Universal Barcode Telemetry Resolver.
 * Queries local verified catalog first, then Open Food Facts API as fallback.
 */
export async function lookupBarcodeTelemetry(barcode) {
  if (!barcode) return null;
  const cleanCode = String(barcode).trim();

  // 1. Check local catalog
  const localMatch = productsData.find(p => p.barcode === cleanCode || p.id === cleanCode);
  if (localMatch) {
    const scoreData = calculateBiteLensScore({
      novaGroup: localMatch.novaGroup,
      additives: localMatch.detectedAdditives.map(code => ADDITIVE_DATABASE.find(a => a.code === code)).filter(Boolean),
      macros: localMatch.macrosPer100g
    });

    return {
      source: 'local_verified',
      product: localMatch,
      scoreData
    };
  }

  // 2. Query Live Open Food Facts Global API
  try {
    const response = await fetch(`https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(cleanCode)}.json`);
    if (response.ok) {
      const json = await response.json();
      if (json.status === 1 && json.product) {
        const prod = json.product;
        const ingText = prod.ingredients_text || prod.ingredients_text_en || '';
        const detected = extractAdditivesFromText(ingText);
        const nova = parseInt(prod.nova_group, 10) || (detected.length > 1 ? 4 : 3);
        
        const nutriments = prod.nutriments || {};
        const macros = {
          calories: nutriments['energy-kcal_100g'] || nutriments['energy-kcal'] || 0,
          protein: nutriments.proteins_100g || 0,
          carbs: nutriments.carbohydrates_100g || 0,
          sugar: nutriments.sugars_100g || 0,
          addedSugar: nutriments['added-sugars_100g'] || nutriments.sugars_100g || 0,
          fat: nutriments.fat_100g || 0,
          sodium: (nutriments.sodium_100g ? nutriments.sodium_100g * 1000 : (nutriments.salt_100g ? nutriments.salt_100g * 400 : 0))
        };

        const scoreData = calculateBiteLensScore({
          novaGroup: nova,
          additives: detected,
          macros
        });

        const formattedProduct = {
          id: `off-${cleanCode}`,
          name: prod.product_name || prod.product_name_en || 'Packaged Product',
          brand: prod.brands || 'Packaged Food',
          category: prod.categories ? prod.categories.split(',')[0].trim() : 'Packaged Goods',
          barcode: cleanCode,
          icon: '📦',
          ingredientsRaw: ingText || 'Ingredients not specified in public database',
          detectedAdditives: detected.map(a => a.code),
          novaGroup: nova,
          macrosPer100g: macros,
          biteLensScore: scoreData.score,
          fssaiVerified: {
            source: 'Open Food Facts Global Open Database',
            verifiedDate: new Date().toISOString().split('T')[0]
          },
          swaps: []
        };

        return {
          source: 'open_food_facts',
          product: formattedProduct,
          scoreData
        };
      }
    }
  } catch (err) {
    console.warn("Open Food Facts lookup failed:", err);
  }

  // 3. Fallback: synthesize graceful placeholder if unknown barcode
  return null;
}
