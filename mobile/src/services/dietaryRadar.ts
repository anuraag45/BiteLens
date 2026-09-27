import { Product, DietaryRules, DietaryComplianceResult, DietaryViolation } from '../types';

export function evaluateDietaryCompliance(product: Product, rules: DietaryRules): DietaryComplianceResult {
  const violations: DietaryViolation[] = [];
  const warnings: DietaryViolation[] = [];
  const passes: string[] = [];
  let activeRuleCount = 0;

  if (!product) {
    return { status: 'PASS', activeRuleCount: 0, violations, warnings, passes };
  }

  const additives = Array.isArray(product.additives) ? product.additives : [];
  const allergens = Array.isArray(product.allergens)
    ? product.allergens.join(' ').toLowerCase()
    : String(product.allergens || '').toLowerCase();
  const summary = String(product.summary || '').toLowerCase();
  const name = String(product.name || '').toLowerCase();
  const combinedText = `${name} ${summary} ${allergens} ${additives.map(a => `${a.code} ${a.name} ${a.note}`).join(' ')}`.toLowerCase();

  // 1. Strict Vegetarian
  if (rules.vegetarian) {
    activeRuleCount++;
    const nonVegFound = additives.some(a => {
      const code = String(a.code || '').toUpperCase();
      const n = String(a.name || '').toLowerCase();
      return (
        code.includes('120') || n.includes('carmine') || n.includes('cochineal') ||
        code.includes('441') || n.includes('gelatin') ||
        code.includes('904') || n.includes('shellac') ||
        n.includes('bone char')
      );
    }) || combinedText.includes('gelatin') || combinedText.includes('carmine') || combinedText.includes('shellac');

    if (nonVegFound) {
      violations.push({
        rule: 'vegetarian',
        title: 'Non-Vegetarian Ingredient Flagged',
        detail: 'Contains insect or animal derived additive (INS 120 Carmine, Gelatin, or Shellac).'
      });
    } else {
      passes.push('Strict Vegetarian');
    }
  }

  // 2. Diabetic & Low Glycemic Shield
  if (rules.diabetic) {
    activeRuleCount++;
    const sugars = product.sugars || 0;
    const hasSyrup =
      combinedText.includes('maltodextrin') ||
      combinedText.includes('high fructose') ||
      combinedText.includes('invert sugar') ||
      combinedText.includes('corn syrup') ||
      combinedText.includes('glucose-fructose');

    if (sugars > 15 || (sugars > 8 && hasSyrup)) {
      violations.push({
        rule: 'diabetic',
        title: `High Glycemic Risk (${sugars}g Sugars)`,
        detail: `Sugars (${sugars}g/100g) or fast-absorbing syrups pose high spike risk for diabetics.`
      });
    } else if (sugars > 5) {
      warnings.push({
        rule: 'diabetic',
        title: `Moderate Sugar Level (${sugars}g)`,
        detail: `Sugars exceed recommended <5g per 100g serving limit.`
      });
    } else {
      passes.push('Diabetic Safe (<5g Sugar)');
    }
  }

  // 3. Low Sodium Heart Radar
  if (rules.lowSodium) {
    activeRuleCount++;
    const sodium = product.sodium || 0;
    if (sodium > 600) {
      violations.push({
        rule: 'lowSodium',
        title: `Excessive Sodium (${sodium}mg)`,
        detail: `Sodium level (${sodium}mg/100g) significantly exceeds heart-safe threshold (<400mg).`
      });
    } else if (sodium > 400) {
      warnings.push({
        rule: 'lowSodium',
        title: `Elevated Sodium (${sodium}mg)`,
        detail: `Above low-sodium benchmark (<400mg per 100g).`
      });
    } else {
      passes.push('Low Sodium (<400mg)');
    }
  }

  // 4. Gluten-Free Shield
  if (rules.glutenFree) {
    activeRuleCount++;
    const glutenKeywords = ['wheat', 'maida', 'atta', 'barley', 'rye', 'malt', 'gluten', 'semolina', 'sooji', 'rava'];
    const hasGluten = glutenKeywords.some(k => combinedText.includes(k));
    if (hasGluten) {
      violations.push({
        rule: 'glutenFree',
        title: 'Contains Gluten / Wheat Grains',
        detail: 'Packaged product contains wheat, maida, barley or malt gluten triggers.'
      });
    } else {
      passes.push('Gluten-Free');
    }
  }

  // 5. Lactose & Dairy-Free
  if (rules.lactoseFree) {
    activeRuleCount++;
    const dairyKeywords = ['milk', 'lactose', 'whey', 'casein', 'butter', 'cheese', 'dairy', 'cream', 'dahi', 'paneer', 'ghee'];
    const hasDairy = dairyKeywords.some(k => combinedText.includes(k));
    if (hasDairy) {
      violations.push({
        rule: 'lactoseFree',
        title: 'Contains Dairy / Lactose',
        detail: 'Product contains milk solids, whey, butterfat, or dairy derivatives.'
      });
    } else {
      passes.push('Lactose-Free');
    }
  }

  let status: 'PASS' | 'WARNING' | 'VIOLATION' = 'PASS';
  if (violations.length > 0) status = 'VIOLATION';
  else if (warnings.length > 0) status = 'WARNING';

  return { status, activeRuleCount, violations, warnings, passes };
}
