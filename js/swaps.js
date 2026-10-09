/* ==========================================================================
   BiteLens Web Application - Unified Healthy Swaps Recommender Engine
   Consolidates swap engines from Compare, Snack Budget, and Catalog into one module.
   Calculates nutritional deltas (Sodium cut, Sugar cut, Processing drop)
   and pairs ultra-processed packaged items with clean Indian alternatives.
   ========================================================================== */

import productsData from './data/products.js';

export class SwapsEngine {
  constructor(products = productsData) {
    this.products = products;
    this.productMap = new Map(products.map(p => [p.id, p]));
  }

  /**
   * Finds recommended healthier swaps for a given product or product ID.
   */
  getSwapsForProduct(productIdOrObj) {
    const product = typeof productIdOrObj === 'string' 
      ? this.productMap.get(productIdOrObj) 
      : productIdOrObj;

    if (!product) return [];

    // 1. Explicit curated swaps defined on the product
    if (Array.isArray(product.swaps) && product.swaps.length > 0) {
      return product.swaps
        .map(id => this.productMap.get(id))
        .filter(Boolean)
        .map(alt => this.buildSwapComparison(product, alt));
    }

    // 2. Dynamic heuristic fallback: search for same or adjacent category with lower NOVA & higher score
    const candidates = this.products.filter(item => {
      if (item.id === product.id) return false;
      const isHealthier = (item.biteLensScore || 0) > (product.biteLensScore || 0);
      const isLowerNova = (item.novaGroup || 4) < (product.novaGroup || 4);
      return isHealthier && (isLowerNova || item.novaGroup <= 2);
    });

    // Sort by BiteLens Score descending
    candidates.sort((a, b) => (b.biteLensScore || 0) - (a.biteLensScore || 0));

    return candidates.slice(0, 2).map(alt => this.buildSwapComparison(product, alt));
  }

  /**
   * Computes concrete delta metrics between unhealthy target and healthy swap.
   */
  buildSwapComparison(original, swap) {
    const origMacros = original.macrosPer100g || {};
    const swapMacros = swap.macrosPer100g || {};

    const sodiumSavedMg = Math.max(0, (origMacros.sodium || 0) - (swapMacros.sodium || 0));
    const sugarSavedG = Math.max(0, (origMacros.sugar || 0) - (swapMacros.sugar || 0));
    const proteinGainG = Math.max(0, (swapMacros.protein || 0) - (origMacros.protein || 0));
    const calorieCutKcal = Math.max(0, (origMacros.calories || 0) - (swapMacros.calories || 0));

    const advantages = [];
    if (sodiumSavedMg >= 200) {
      advantages.push(`Cut sodium by ${sodiumSavedMg}mg (${Math.round((sodiumSavedMg / 2000) * 100)}% WHO daily budget)`);
    }
    if (sugarSavedG >= 5) {
      advantages.push(`Save ${sugarSavedG.toFixed(1)}g free sugars (${Math.round((sugarSavedG / 25) * 100)}% WHO guideline)`);
    }
    if (proteinGainG >= 3) {
      advantages.push(`Gain +${proteinGainG.toFixed(1)}g natural bioavailable protein`);
    }
    if (original.novaGroup === 4 && swap.novaGroup <= 2) {
      advantages.push(`Upgrade from NOVA 4 Ultra-Processed to NOVA ${swap.novaGroup} Whole Food`);
    }

    return {
      swapProduct: swap,
      scoreImprovement: (swap.biteLensScore || 85) - (original.biteLensScore || 40),
      advantages: advantages.length > 0 ? advantages : [`Cleaner ingredients with 0 synthetic additives`],
      headlineVerdict: `Swap to ${swap.name} for an instant score upgrade (+${(swap.biteLensScore || 85) - (original.biteLensScore || 40)} pts)`
    };
  }

  /**
   * Returns all available preset comparison pairs for the comparison page.
   */
  getPresetComparisons() {
    return [
      {
        id: "kurkure_vs_makhana",
        title: "Kurkure Masala Munch vs Roasted Makhana",
        category: "Savory Snack Matchup",
        prodA: this.productMap.get("roasted-masala-makhana"),
        prodB: this.productMap.get("kurkure-masala-munch")
      },
      {
        id: "noodles_vs_oats",
        title: "Masala Instant Noodles vs Multigrain Oats Crisp",
        category: "Convenience Grain Matchup",
        prodA: this.productMap.get("multigrain-oats-crisp"),
        prodB: this.productMap.get("masala-instant-noodles")
      },
      {
        id: "chips_vs_chana",
        title: "Potato Chips vs Spiced Roasted Chana",
        category: "Crunchy Pulse Matchup",
        prodA: this.productMap.get("roasted-chana-turmeric"),
        prodB: this.productMap.get("classic-salted-potato-chips")
      },
      {
        id: "dessert_yogurt_vs_plain",
        title: "Berry Dessert Yogurt vs Plain Greek Yogurt",
        category: "Dairy Dessert Matchup",
        prodA: this.productMap.get("plain-greek-yogurt"),
        prodB: this.productMap.get("berry-flavored-yogurt")
      }
    ].filter(item => item.prodA && item.prodB);
  }
}

export const defaultSwapsEngine = new SwapsEngine();
