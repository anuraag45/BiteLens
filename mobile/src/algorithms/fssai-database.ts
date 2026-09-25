/**
 * BiteLens Mobile - Curated FSSAI INS Additive Knowledgebase
 * Indexed via Prefix Search Trie for zero-latency on-device lookups
 */

import { Additive } from '../types';
import { Trie } from './data-structures';

export const FSSAI_ADDITIVES: Additive[] = [
  {
    insCode: 'INS 621',
    name: 'Monosodium Glutamate (MSG)',
    category: 'Flavor Enhancer',
    origin: 'Fermented carbohydrate / bacterial synthesis',
    riskLevel: 'high',
    description: 'Chemical salt of glutamic acid used to create intense savory umami taste.',
    plainEnglish: 'Savory flavor booster added to packaged noodles, soups, and chips to trigger cravings.',
  },
  {
    insCode: 'INS 322',
    name: 'Lecithin (Soy / Sunflower)',
    category: 'Emulsifier',
    origin: 'Natural soybean or sunflower seed extract',
    riskLevel: 'low',
    description: 'Phospholipid that stabilizes oil-in-water emulsions.',
    plainEnglish: 'Natural plant ingredient keeping chocolate smooth so cocoa butter and milk don’t separate.',
  },
  {
    insCode: 'INS 500(ii)',
    name: 'Sodium Hydrogen Carbonate (Baking Soda)',
    category: 'Raising Agent / Acidity Regulator',
    origin: 'Natural mineral deposit / Solvay chemical process',
    riskLevel: 'low',
    description: 'Leavening mineral salt releasing carbon dioxide bubbles.',
    plainEnglish: 'Standard kitchen baking soda used in cookies and wafers to help dough rise light and crisp.',
  },
  {
    insCode: 'INS 211',
    name: 'Sodium Benzoate',
    category: 'Preservative',
    origin: 'Synthetic chemical neutralization',
    riskLevel: 'medium',
    description: 'Bacteriostatic and fungistatic compound active in acidic pH environments.',
    plainEnglish: 'Liquid chemical preservative added to packaged fruit squashes, sauces, and carbonated sodas to stop mold.',
  },
  {
    insCode: 'INS 120',
    name: 'Carmine / Cochineal Red',
    category: 'Food Color',
    origin: 'Crushed dried female Cochineal scale insects (Dactylopius coccus)',
    riskLevel: 'medium',
    description: 'Natural anthraquinone red pigment derived from insect carminic acid.',
    plainEnglish: 'Natural bright red/pink dye extracted from insects. Important dietary warning for vegetarians and vegans!',
  },
  {
    insCode: 'INS 440',
    name: 'Pectin',
    category: 'Gelling Agent / Thickener',
    origin: 'Citrus peel and apple pomace',
    riskLevel: 'low',
    description: 'Structural heteropolysaccharide forming heat-reversible gel networks.',
    plainEnglish: 'Natural plant fruit fiber used to give fruit jams, jellies, and fruit yogurts a thick, spreadable texture.',
  },
  {
    insCode: 'INS 955',
    name: 'Sucralose',
    category: 'Artificial Sweetener',
    origin: 'Selective multi-step chlorination of sucrose',
    riskLevel: 'medium',
    description: 'Zero-calorie non-nutritive sweetener ~600x sweeter than table sugar.',
    plainEnglish: 'Super-sweet synthetic sugar substitute. Provides intense sweetness in diet beverages without calorie count.',
  },
  {
    insCode: 'INS 330',
    name: 'Citric Acid',
    category: 'Acidity Regulator / Antioxidant',
    origin: 'Microbial fermentation via Aspergillus niger on molasses',
    riskLevel: 'low',
    description: 'Organic tricarboxylic acid naturally found in citrus fruits.',
    plainEnglish: 'Natural lemon acid providing a clean sour tang in fruit beverages, candy gummies, and savory marinades.',
  },
  {
    insCode: 'INS 471',
    name: 'Mono- and Di-glycerides of Fatty Acids',
    category: 'Emulsifier',
    origin: 'Glycerolysis of vegetable oils or animal fats',
    riskLevel: 'medium',
    description: 'Surfactant extending softness and uniform oil dispersion in baked goods.',
    plainEnglish: 'Industrial fat emulsifier added to sandwich breads, cakes, and ice creams to prolong shelf-life softness.',
  },
  {
    insCode: 'INS 150d',
    name: 'Sulphite Ammonia Caramel (Caramel IV)',
    category: 'Food Color',
    origin: 'Controlled heat treatment of carbohydrates with sulfite and ammonium salts',
    riskLevel: 'high',
    description: 'Dark brown colloidal coloring agent with trace 4-methylimidazole (4-MEI) byproduct.',
    plainEnglish: 'Dark industrial brown food dye used in colas, chocolate biscuits, and commercial soy sauces.',
  },
  {
    insCode: 'INS 223',
    name: 'Sodium Metabisulphite',
    category: 'Preservative / Antioxidant',
    origin: 'Chemical gas reaction of sulfur dioxide with sodium hydroxide',
    riskLevel: 'high',
    description: 'Sulfite-releasing inorganic salt inhibiting bacterial enzymatic browning.',
    plainEnglish: 'Strong sulfite preservative preventing browning in dried fruits and fruit juices. Known asthma trigger.',
  },
  {
    insCode: 'INS 282',
    name: 'Calcium Propionate',
    category: 'Preservative',
    origin: 'Synthetic propionic acid neutralization with calcium hydroxide',
    riskLevel: 'medium',
    description: 'Antimicrobial salt preventing bread rope bacteria and mold development.',
    plainEnglish: 'Bakery preservative added to commercial white and brown sliced breads to keep them mold-free on grocery shelves.',
  },
  {
    insCode: 'INS 412',
    name: 'Guar Gum',
    category: 'Thickener / Stabilizer',
    origin: 'Milled endosperm of Indian cluster beans (Cyamopsis tetragonoloba)',
    riskLevel: 'low',
    description: 'High molecular weight galactomannan polysaccharide.',
    plainEnglish: 'Natural Indian legume seed powder that thickens gravies, dressings, and dairy desserts with soluble fiber.',
  },
  {
    insCode: 'INS 415',
    name: 'Xanthan Gum',
    category: 'Thickener / Stabilizer',
    origin: 'Bacterial fermentation of glucose via Xanthomonas campestris',
    riskLevel: 'low',
    description: 'Pseudoplastic microbial exopolysaccharide maintaining particle suspension.',
    plainEnglish: 'Natural bacterial gum preventing spices, herbs, and oils from settling at the bottom of salad bottles.',
  },
  {
    insCode: 'INS 452(i)',
    name: 'Sodium Polyphosphate',
    category: 'Emulsifying Salt / Sequestrant',
    origin: 'High-temperature thermal condensation of orthophosphates',
    riskLevel: 'high',
    description: 'Polyphosphate mineral salt increasing water-binding capacity in processed meats and processed cheese.',
    plainEnglish: 'Chemical salt binding water to processed cheese slices and sausages to make them melt smoothly without leaking grease.',
  },
  {
    insCode: 'INS 960',
    name: 'Steviol Glycosides (Stevia)',
    category: 'Natural High-Intensity Sweetener',
    origin: 'Aqueous water extraction of Stevia rebaudiana leaves',
    riskLevel: 'low',
    description: 'Purified glycoside sweetener 200–300x sweeter than sucrose.',
    plainEnglish: 'Natural plant leaf extract providing zero-calorie sweetness in organic and diabetic-friendly foods.',
  },
  {
    insCode: 'INS 950',
    name: 'Acesulfame Potassium (Ace-K)',
    category: 'Artificial Sweetener',
    origin: 'Chemical transformation of acetoacetic acid derivatives',
    riskLevel: 'medium',
    description: 'Heat-stable organic potassium salt sweetener ~200x sweeter than sugar.',
    plainEnglish: 'Synthetic zero-calorie sweetener blended with sucralose or aspartame to mask bitter aftertastes in diet sodas.',
  },
  {
    insCode: 'INS 102',
    name: 'Tartrazine (FD&C Yellow No. 5)',
    category: 'Synthetic Azo Food Color',
    origin: 'Coal tar / petroleum derivative',
    riskLevel: 'high',
    description: 'Water-soluble synthetic lemon yellow azo dye.',
    plainEnglish: 'Bright yellow artificial dye used in extruded cheese balls, candy, and instant drink powders. Requires FSSAI warning.',
  },
  {
    insCode: 'INS 110',
    name: 'Sunset Yellow FCF',
    category: 'Synthetic Azo Food Color',
    origin: 'Sulfonated petroleum derivative synthesis',
    riskLevel: 'high',
    description: 'Synthetic orange-red azo colorant.',
    plainEnglish: 'Vivid orange synthetic dye added to orange sodas, biscuits, and confectionery. Flagged in multiple global pediatric studies.',
  },
  {
    insCode: 'INS 627',
    name: 'Disodium 5\'-Guanylate',
    category: 'Flavor Enhancer',
    origin: 'Fermented yeast / fish tissue extraction',
    riskLevel: 'medium',
    description: 'Purine nucleotide acting synergistically with glutamate.',
    plainEnglish: 'Potent savory chemical salt added alongside MSG to multiply meat-like savoriness in instant ramen tastemaker packets.',
  },
  {
    insCode: 'INS 631',
    name: 'Disodium 5\'-Inosinate',
    category: 'Flavor Enhancer',
    origin: 'Fermented starch or meat/fish hydrolysis',
    riskLevel: 'medium',
    description: 'Ribonucleotide flavor potentiator.',
    plainEnglish: 'Savory nucleotide powder working with MSG to make low-cost snack powders taste rich and deeply spiced.',
  },
  {
    insCode: 'INS 407',
    name: 'Carrageenan',
    category: 'Thickener / Gelling Agent',
    origin: 'Red edible seaweed (Rhodophyta)',
    riskLevel: 'medium',
    description: 'Sulphated galactan polysaccharide forming firm dairy gels.',
    plainEnglish: 'Seaweed extract giving thick body to dairy-free almond/soy milks. Can trigger gastrointestinal irritation in sensitive guts.',
  },
];

// Initialize and populate Trie Search Tree
export const additiveTrie = new Trie<Additive>();

// Seed Trie with multiple lookup keys (e.g. "INS 621", "621", "MSG", "Monosodium Glutamate")
for (const add of FSSAI_ADDITIVES) {
  // 1. By INS code with space: "ins 621"
  additiveTrie.insert(add.insCode, add);
  // 2. By raw digits: "621"
  const digitsOnly = add.insCode.replace(/[^0-9a-zA-Z()]/g, '');
  if (digitsOnly) {
    additiveTrie.insert(digitsOnly, add);
  }
  // 3. By full chemical title: "monosodium glutamate"
  additiveTrie.insert(add.name, add);
  
  // 4. By short aliases
  if (add.name.includes('(')) {
    const alias = add.name.substring(add.name.indexOf('(') + 1, add.name.indexOf(')'));
    if (alias.trim()) {
      additiveTrie.insert(alias.trim(), add);
    }
  }
}
