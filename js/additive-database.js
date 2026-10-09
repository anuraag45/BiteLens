/* ==========================================================================
   BiteLens Web Application - FSSAI Additive Directory & Decoder Database
   Engineered with:
   - High-performance Trie indexing for O(L) code & name autocomplete
   - INSNormalizer with OCR character confusion map (I/l→1, O→0, S→5, B→8)
   - Strict separation of FSSAI Regulatory Status from Scientific Evidence Concerns
   - Additive × Food Category limits table (reflecting FSSAI Regulations 2011)
   - Contested evidence disclosures (e.g. Carrageenan, MSG symptom debunking)
   - Multi-language plain-language explanations (English, Hindi, Gujarati)
   - LRUCache memoization for instant sub-millisecond filtering
   - DOMPurify input sanitization
   ========================================================================== */

import { sanitizeInput, sanitizeSQL } from './security.js';
import { Trie, LRUCache, FuzzyMatcher, INSNormalizer } from './data-structures.js';

export const ADDITIVE_DATABASE = [
  {
    code: "INS 621",
    eCode: "E 621",
    name: "Monosodium Glutamate (MSG)",
    aliases: ["msg", "ajinomoto", "glutamate", "flavour enhancer 621", "ve-tsin"],
    category: "Flavor Enhancer",
    riskLevel: "moderate", // Evidence-based rating: not toxic, but marker for UPF
    penaltyWeight: 8,
    novaGroup: "NOVA Group 4 (Ultra-Processed)",
    fssaiStatus: "Permitted additive under Food Safety and Standards (Food Products Standards and Food Additives) Regulations, 2011. Permitted under Good Manufacturing Practice (GMP) in specified savory foods with mandatory label declaration: 'Contains Added Monosodium Glutamate; Not Recommended for Infants Below 12 Months'.",
    fssaiCategoryLimits: [
      { category: "Instant Noodles & Seasonings", limit: "GMP (Mandatory label declaration)" },
      { category: "Canned Soups & Broths", limit: "GMP" },
      { category: "Frozen Savory Snacks", limit: "GMP" },
      { category: "Infant Formulas & Baby Foods", limit: "STRICTLY PROHIBITED" }
    ],
    evidenceConcern: "Scientific consensus (EFSA 2017, JECFA) has debunked the 'Chinese Restaurant Syndrome' myth as unverified in double-blind placebo trials. However, MSG is an engineered umami potentiator used almost exclusively in hyper-palatable ultra-processed formulations to mask cheap refined starch and oil bases.",
    plainText: "Umami savory salt that triggers savory taste buds. Permitted by FSSAI within limits; serves as an indicator of ultra-processed packaged snacks.",
    commonFoods: "Instant noodles, potato chips, seasoned namkeen, packaged soups, frozen snacks.",
    translations: {
      en: "Umami savory enhancer. FSSAI-permitted with mandatory label. Marker for ultra-processed foods.",
      hi: "मोनोसोडियम ग्लूटामेट (MSG) — नमकीन स्वाद बढ़ाने वाला पदार्थ। FSSAI द्वारा नियमों के तहत स्वीकृत है, लेकिन यह अधिक प्रोसेस्ड खाने का संकेत देता है।",
      gu: "મોનોસોડિયમ ગ્લુટામેટ (MSG) — ઉમામી સ્વાદ વધારનાર પદાર્થ. FSSAI દ્વારા માન્ય છે, પરંતુ તે અલ્ટ્રા-પ્રોસેસ્ડ ખોરાકની ઓળખ છે."
    }
  },
  {
    code: "INS 627",
    eCode: "E 627",
    name: "Disodium 5'-Guanylate",
    aliases: ["guanylate", "disodium guanylate", "flavour enhancer 627"],
    category: "Flavor Enhancer",
    riskLevel: "moderate",
    penaltyWeight: 8,
    novaGroup: "NOVA Group 4 (Ultra-Processed)",
    fssaiStatus: "Permitted under FSSAI regulations in savory foods and spice blends.",
    fssaiCategoryLimits: [
      { category: "Extruded Snacks & Chips", limit: "500 mg/kg (singly or with INS 631)" },
      { category: "Soup Powders & Bouillons", limit: "GMP" }
    ],
    evidenceConcern: "Metabolized to purines in the body; individuals with gout or hyperuricemia are advised to moderate intake. Acts synergistically with MSG to amplify savory perception up to 8-fold.",
    plainText: "High-intensity savory flavor multiplier derived from yeast or tapioca starch, paired with MSG in chips and extruded snacks.",
    commonFoods: "Spiced potato wafers, instant noodle tastemakers, savory extruded puffs.",
    translations: {
      en: "Savory flavor multiplier synergized with MSG in packaged crisps.",
      hi: "डाइसोडियम ग्वानिलेट — नमकीन स्वाद को कई गुना बढ़ाने वाला घटक, चिप्स और नूडल्स में प्रयुक्त।",
      gu: "ડાયસોડિયમ ગ્વાનિલેટ — સ્વાદ વધારનાર ઘટક જે વેફર્સ અને મસાલામાં વપરાય છે."
    }
  },
  {
    code: "INS 631",
    eCode: "E 631",
    name: "Disodium 5'-Inosinate",
    aliases: ["inosinate", "disodium inosinate", "flavour enhancer 631"],
    category: "Flavor Enhancer",
    riskLevel: "moderate",
    penaltyWeight: 8,
    novaGroup: "NOVA Group 4 (Ultra-Processed)",
    fssaiStatus: "Permitted additive under FSSAI Regulations (Food Additives Schedule Table 1).",
    fssaiCategoryLimits: [
      { category: "Snack Foods (Chips, Puffs)", limit: "500 mg/kg" },
      { category: "Seasoning Mixes", limit: "GMP" }
    ],
    evidenceConcern: "Like guanylate, breaks down into uric acid precursors. Purely synthetic or fermented formulation with zero nutritional contribution, designed to encourage passive overconsumption.",
    plainText: "Potent savory compound paired with MSG to create addictive, hyper-palatable taste profiles.",
    commonFoods: "Masala potato chips, instant noodle seasonings, savory snack pellets.",
    translations: {
      en: "Savory potentiator paired with MSG to stimulate appetite.",
      hi: "डाइसोडियम इनॉसिनेट — MSG के साथ मिलकर स्वाद को गहरा और आकर्षक बनाने वाला पदार्थ।",
      gu: "ડાયસોડિયમ ઈનોસિનેટ — પેકેટબંધ નાસ્તામાં વપરાતો તીખો સ્વાદ વધારક."
    }
  },
  {
    code: "INS 322",
    eCode: "E 322",
    name: "Lecithin (Soy / Sunflower)",
    aliases: ["lecithin", "soy lecithin", "sunflower lecithin", "emulsifier 322"],
    category: "Emulsifier",
    riskLevel: "low",
    penaltyWeight: 2,
    novaGroup: "NOVA Group 3/4 (Processed / Ultra-Processed)",
    fssaiStatus: "Widely permitted as a standard natural food additive under GMP across dairy, bakery, and confectionery categories.",
    fssaiCategoryLimits: [
      { category: "Chocolates & Cocoa Products", limit: "GMP (Typically 0.3% – 0.5%)" },
      { category: "Bakery & Biscuits", limit: "GMP" },
      { category: "Infant Formulations", limit: "5,000 mg/kg" }
    ],
    evidenceConcern: "Generally recognized as safe (GRAS) by US FDA and EFSA. Extracted from soybean or sunflower seeds; high safety profile, though soy-allergic consumers must check allergen warnings.",
    plainText: "Natural plant phospholipid that keeps fat and water blended, preventing cocoa butter separation in chocolate.",
    commonFoods: "Chocolates, cream biscuits, protein bars, margarines, bakery items.",
    translations: {
      en: "Natural seed phospholipid keeping fats smoothly blended.",
      hi: "लेसिथिन — प्राकृतिक बीज घटक जो चॉकलेट और बिस्कुट में तेल को अलग होने से रोकता है।",
      gu: "લેસિથિન — કુદરતી સોયા કે સૂર્યમુખીમાંથી મેળવેલું ઘટક જે ચોકલેટને સ્મૂધ રાખે છે."
    }
  },
  {
    code: "INS 500(ii)",
    eCode: "E 500(ii)",
    name: "Sodium Hydrogen Carbonate (Baking Soda)",
    aliases: ["baking soda", "sodium bicarbonate", "meetha soda", "leavening agent"],
    category: "Acidity Regulator / Leavening Agent",
    riskLevel: "low",
    penaltyWeight: 0,
    novaGroup: "NOVA Group 2/3 (Culinary / Processed)",
    fssaiStatus: "Permitted under Good Manufacturing Practice (GMP) as a traditional leavening and alkalizing mineral.",
    fssaiCategoryLimits: [
      { category: "Bakery Products & Biscuits", limit: "GMP" },
      { category: "Carbonated Beverages", limit: "GMP" }
    ],
    evidenceConcern: "Extremely well tolerated mineral salt. Adds dietary sodium (~27% sodium by weight), which counts toward daily sodium budgets for hypertensive individuals.",
    plainText: "Simple culinary mineral powder that releases carbon dioxide when heated, creating airy texture in baked treats.",
    commonFoods: "Cookies, biscuits, cake mixes, soda water, dhokla mixes.",
    translations: {
      en: "Traditional culinary baking soda for leavening soft bakery goods.",
      hi: "बेकिंग सोडा — पारंपरिक पाक खनिज जो बिस्कुट और ढोकले को फूलाने में मदद करता है।",
      gu: "બેકિંગ સોડા (મીઠો સોડા) — બિસ્કિટ અને કેકને પોચા બનાવવા માટે વપરાતો ખનીજ."
    }
  },
  {
    code: "INS 211",
    eCode: "E 211",
    name: "Sodium Benzoate",
    aliases: ["sodium benzoate", "benzoate", "preservative 211"],
    category: "Preservative",
    riskLevel: "caution",
    penaltyWeight: 12,
    novaGroup: "NOVA Group 4 (Ultra-Processed)",
    fssaiStatus: "Permitted antimicrobial preservative strictly regulated with maximum numerical limits (ppm) in acidic foods.",
    fssaiCategoryLimits: [
      { category: "Carbonated Fruit Beverages", limit: "120 mg/kg" },
      { category: "Fruit Squashes & Crushes", limit: "600 mg/kg" },
      { category: "Pickles & Chutneys", limit: "250 mg/kg" },
      { category: "Tomato Ketchup & Sauces", limit: "750 mg/kg" }
    ],
    evidenceConcern: "When combined with Ascorbic Acid (Vitamin C, INS 300) in acidic drinks exposed to heat or UV light, benzene (a known carcinogen) can form in trace amounts (US FDA 2006 beverage survey). Strict limits prevent formation under normal storage.",
    plainText: "Chemical preservative that halts mold and bacterial growth in bottled squashes and fizzy beverages.",
    commonFoods: "Packaged fruit squashes, bottled pickles, sodas, commercial ketchup.",
    translations: {
      en: "Antimicrobial preservative. Strictly limited due to benzene risk with Vitamin C.",
      hi: "सोडियम बेंजोएट — फलों के शरबत और सॉस को खराब होने से बचाने वाला रासायनिक प्रिजर्वेटिव।",
      gu: "સોડિયમ બેન્ઝોએટ — શરબત અને અથાણાંને બગડતા અટકાવવા માટે વપરાતું પ્રિઝર્વેટિવ."
    }
  },
  {
    code: "INS 120",
    eCode: "E 120",
    name: "Carmine / Cochineal Extract",
    aliases: ["carmine", "cochineal", "natural red 4", "crimson lake"],
    category: "Food Colorant",
    riskLevel: "moderate",
    penaltyWeight: 10,
    novaGroup: "NOVA Group 4 (Ultra-Processed)",
    fssaiStatus: "Permitted natural red food colorant in specified confectionery, ice creams, and beverages. Requires mandatory non-vegetarian brown dot label in India.",
    fssaiCategoryLimits: [
      { category: "Hard Candies & Gums", limit: "200 mg/kg" },
      { category: "Ice Cream & Frozen Desserts", limit: "100 mg/kg" },
      { category: "Flavored Milks & Yogurts", limit: "50 mg/kg" }
    ],
    evidenceConcern: "Derived from crushed female cochineal insects (Dactylopius coccus). Well-documented risk of rare IgE-mediated allergic reactions and anaphylaxis in sensitive individuals (EFSA 2015). Non-vegetarian origin.",
    plainText: "Bright natural crimson dye extracted from insects. Non-vegetarian and carries allergen risk for sensitive individuals.",
    commonFoods: "Strawberry yogurts, red gummy candies, cherry ice creams, flavored milks.",
    translations: {
      en: "Insect-derived red dye. Non-vegetarian; potential allergen trigger.",
      hi: "कारमाइन लाल रंग — कीटों से तैयार लाल रंग। यह मांसाहारी स्रोत से है और एलर्जी पैदा कर सकता है।",
      gu: "કાર્માઇન લાલ રંગ — જીવજંતુમાંથી મળતો લાલ રંગ. માંસાહારી છે અને એલર્જી કરી શકે છે."
    }
  },
  {
    code: "INS 102",
    eCode: "E 102",
    name: "Tartrazine (Synthetic Yellow 5)",
    aliases: ["tartrazine", "yellow 5", "food yellow 4", "fd&c yellow 5"],
    category: "Food Colorant",
    riskLevel: "caution",
    penaltyWeight: 15,
    novaGroup: "NOVA Group 4 (Ultra-Processed)",
    fssaiStatus: "Permitted synthetic coal-tar food colorant under Table 2 of FSSAI Food Additives Regulations, capped at 100 mg/kg.",
    fssaiCategoryLimits: [
      { category: "Biscuits & Confectionery", limit: "100 mg/kg" },
      { category: "Carbonated Fruit Beverages", limit: "100 mg/kg" },
      { category: "Extruded Namkeen Snacks", limit: "100 mg/kg" }
    ],
    evidenceConcern: "Southampton study (McCann et al. 2007, The Lancet) established an association between synthetic azo dyes including Tartrazine and increased hyperactivity in children. The European Union mandates the warning label: 'May have an adverse effect on activity and attention in children.'",
    plainText: "Bright synthetic neon yellow dye linked to behavioral hyperactivity in sensitive children in clinical trials.",
    commonFoods: "Cheese balls, yellow jelly candies, lemon sodas, packaged turmeric-colored namkeen.",
    translations: {
      en: "Synthetic azo dye linked to hyperactivity in children (EU warning label required).",
      hi: "टार्ट्राज़िन (पीला 5) — कृत्रिम रासायनिक पीला रंग। बच्चों में चंचलता (हाइपरएक्टिविटी) बढ़ाने से जुड़ा है।",
      gu: "ટાર્ટ્રાઝીન પીળો રંગ — કૃત્રિમ કેમિકલ કલર. બાળકોમાં અતિ-ચંચળતા (હાયપરએક્ટિવિટી) સાથે જોડાયેલ છે."
    }
  },
  {
    code: "INS 150d",
    eCode: "E 150d",
    name: "Caramel IV (Sulphite Ammonia Caramel)",
    aliases: ["caramel iv", "sulfite ammonia caramel", "caramel color", "class iv caramel"],
    category: "Food Colorant",
    riskLevel: "caution",
    penaltyWeight: 12,
    novaGroup: "NOVA Group 4 (Ultra-Processed)",
    fssaiStatus: "Permitted in colas, dark beers, gravies, and seasonings under strict maximum limits.",
    fssaiCategoryLimits: [
      { category: "Carbonated Cola Beverages", limit: "1,000 mg/kg" },
      { category: "Barbecue & Soya Sauces", limit: "1,500 mg/kg" },
      { category: "Dark Bakery & Confectionery", limit: "500 mg/kg" }
    ],
    evidenceConcern: "Manufactured by heating carbohydrates with ammonium and sulfite compounds, generating the trace byproduct 4-methylimidazole (4-MEI). California Proposition 65 lists 4-MEI as a potential carcinogen; EFSA (2011) established an ADI of 300 mg/kg body weight and concluded exposure is safe within regulated limits.",
    plainText: "Deep dark brown colorant manufactured with ammonia, giving cola sodas and gravies their signature mahogany hue.",
    commonFoods: "Cola drinks, dark soya sauces, packaged barbecue gravies, chocolate cakes.",
    translations: {
      en: "Ammonia-treated dark brown color containing trace 4-MEI byproduct.",
      hi: "कैरेमल IV — अमोनिया प्रक्रिया से बना गहरा भूरा रंग, कोला और सोया सॉस में इस्तेमाल।",
      gu: "કેરેમલ IV — એમોનિયાથી બનાવેલો કાળો-કથ્થઈ રંગ જે કોલા ડ્રિંક્સમાં વપરાય છે."
    }
  },
  {
    code: "INS 160a(i)",
    eCode: "E 160a(i)",
    name: "Beta-Carotenes (Plant Derived)",
    aliases: ["beta carotene", "beta-carotene", "provitamin a", "plant carotene"],
    category: "Food Colorant / Nutrient",
    riskLevel: "low",
    penaltyWeight: 2,
    novaGroup: "NOVA Group 2/3 (Processed)",
    fssaiStatus: "Permitted natural orange-yellow colorant under GMP across milk, fats, and confectionery.",
    fssaiCategoryLimits: [
      { category: "Butter, Ghee & Margarine", limit: "GMP" },
      { category: "Processed Cheese & Yogurts", limit: "100 mg/kg" },
      { category: "Fruit Drinks & Nectars", limit: "GMP" }
    ],
    evidenceConcern: "Natural plant precursor to Vitamin A; excellent safety profile in food matrices.",
    plainText: "Natural carrot and plant pigment that provides warm yellow-orange color and beneficial Provitamin A.",
    commonFoods: "Butter, fortified margarines, orange fruit drinks, cheeses.",
    translations: {
      en: "Natural carrot-derived Provitamin A orange colorant.",
      hi: "बीटा-कैरोटीन — गाजर से मिलने वाला प्राकृतिक नारंगी रंग, जो विटामिन A का स्रोत है।",
      gu: "બીટા-કેરોટીન — ગાજરમાંથી મેળવેલો કુદરતી કેસરી રંગ, જે વિટામિન A વધારે છે."
    }
  },
  {
    code: "INS 407",
    eCode: "E 407",
    name: "Carrageenan",
    aliases: ["carrageenan", "irish moss extract", "chondrus crispus", "stabilizer 407"],
    category: "Thickener / Stabilizer",
    riskLevel: "moderate", // Correctly labeled as contested evidence
    penaltyWeight: 8,
    novaGroup: "NOVA Group 4 (Ultra-Processed)",
    fssaiStatus: "Permitted food stabilizer and gelling agent under Good Manufacturing Practice (GMP) in dairy and processed foods.",
    fssaiCategoryLimits: [
      { category: "Flavored Milks & Dairy Desserts", limit: "GMP" },
      { category: "Ice Cream & Frozen Desserts", limit: "GMP" },
      { category: "Processed Meat & Plant Milks", limit: "GMP" }
    ],
    evidenceConcern: "Contested scientific evidence: Degraded carrageenan (poligeenan) induces intestinal ulceration in rodent models; food-grade high-molecular carrageenan is permitted by FSSAI and JECFA, although preliminary in vitro and animal models suggest possible mucosal barrier disruption (Martino et al. 2017). Human clinical evidence remains limited, but cautious moderation is advised for inflammatory bowel disease (IBD) patients.",
    plainText: "Seaweed-derived gelling agent used to thicken almond milk and ice creams. Subject to contested gastrointestinal inflammation debates.",
    commonFoods: "Plant milks (almond, oat), chocolate milks, low-fat cottage cheese, ice creams.",
    translations: {
      en: "Seaweed gelling agent. Permitted by FSSAI; subject to contested gut health research.",
      hi: "कारागीनन — समुद्री घास से बना गाढ़ा करने वाला तत्व; आंतों के स्वास्थ्य पर बहस जारी है।",
      gu: "કેરાજીનન — દરિયાઈ શેવાળમાંથી બનાવેલું જેલ જે દૂધ અને આઈસ્ક્રીમને ઘટ્ટ બનાવે છે."
    }
  },
  {
    code: "INS 440",
    eCode: "E 440",
    name: "Pectin",
    aliases: ["pectin", "fruit pectin", "citrus pectin"],
    category: "Thickener / Gelling Agent",
    riskLevel: "low",
    penaltyWeight: 2,
    novaGroup: "NOVA Group 3 (Processed)",
    fssaiStatus: "Permitted gelling agent under Good Manufacturing Practice across fruit preserves and confectioneries.",
    fssaiCategoryLimits: [
      { category: "Jams, Jellies & Marmalades", limit: "GMP" },
      { category: "Fruit Juices & Fruit Purees", limit: "GMP" }
    ],
    evidenceConcern: "Extracted naturally from apple pomace and citrus peels. High safety profile, acts as soluble prebiotic dietary fiber.",
    plainText: "Wholesome natural fruit fiber that turns boiled fruit into set jam and jelly.",
    commonFoods: "Fruit jams, fruit spreads, gummy sweets, bakery fruit fillings.",
    translations: {
      en: "Natural fruit peel fiber used to set jams and jellies.",
      hi: "पेक्टिन — सेब और संतरे के छिलकों से बना प्राकृतिक फाइबर जो जैम को गाढ़ा करता है।",
      gu: "પેક્ટીન — ફળોની છાલમાંથી મેળવેલું કુદરતી ફાઈબર જે જામ બનાવવા વપરાય છે."
    }
  },
  {
    code: "INS 955",
    eCode: "E 955",
    name: "Sucralose",
    aliases: ["sucralose", "splenda", "artificial sweetener", "intense sweetener"],
    category: "Artificial Sweetener",
    riskLevel: "caution",
    penaltyWeight: 10,
    novaGroup: "NOVA Group 4 (Ultra-Processed)",
    fssaiStatus: "Permitted intense non-nutritive sweetener with mandatory warning: 'Contains Artificial Sweetener Sucralose; Not Recommended for Children'.",
    fssaiCategoryLimits: [
      { category: "Carbonated Diet Beverages", limit: "300 mg/kg" },
      { category: "Bakery Goods & Biscuits", limit: "750 mg/kg" },
      { category: "Dairy Desserts & Yogurts", limit: "400 mg/kg" }
    ],
    evidenceConcern: "Chlorinated sucrose derivative that is 600x sweeter than sugar without calories. Helps reduce sugar intake, but emerging microbiome research (Suez et al. 2014, Cell) notes potential alteration of gut flora composition.",
    plainText: "Zero-calorie chemical sweetener 600x sweeter than sugar, common in diet sodas and protein bars.",
    commonFoods: "Diet colas, zero-sugar energy drinks, sugar-free protein supplements.",
    translations: {
      en: "Zero-calorie chlorinated sweetener. FSSAI warning required for children.",
      hi: "सुक्रालोज़ — चीनी से 600 गुना मीठा शून्य-कैलोरी केमिकल स्वीटनर। बच्चों के लिए अनुशंसित नहीं।",
      gu: "સુક્રાલોઝ — શૂન્ય કેલરી ધરાવતું કેમિકલ ગળપણ, ડાયેટ સોડા અને પ્રોટીનમાં વપરાય છે."
    }
  },
  {
    code: "INS 330",
    eCode: "E 330",
    name: "Citric Acid",
    aliases: ["citric acid", "lemon salt", "nimbu sat"],
    category: "Acidity Regulator",
    riskLevel: "low",
    penaltyWeight: 0,
    novaGroup: "NOVA Group 2/3 (Processed)",
    fssaiStatus: "Permitted acidity regulator and antioxidant synergist under Good Manufacturing Practice.",
    fssaiCategoryLimits: [
      { category: "Fruit Juices, Sodas & Candies", limit: "GMP" },
      { category: "Canned Vegetables", limit: "GMP" }
    ],
    evidenceConcern: "Naturally occurring in citrus fruits; biological intermediate in human Krebs energy cycle. Safe and clean.",
    plainText: "Natural sour citrus acid that provides crisp tartness and acts as a natural preservative.",
    commonFoods: "Lemon drinks, candies, sodas, jams, canned tomatoes.",
    translations: {
      en: "Natural citrus acid giving sour tartness and pH balance.",
      hi: "साइट्रिक एसिड (नींबू का सत्त) — खट्टापन देने वाला प्राकृतिक अम्ल, पूरी तरह सुरक्षित।",
      gu: "સાઇટ્રિક એસિડ (લીંબુના ફૂલ) — ખાટાશ આપતો કુદરતી પદાર્થ, સંપૂર્ણ સલામત."
    }
  },
  {
    code: "INS 412",
    eCode: "E 412",
    name: "Guar Gum",
    aliases: ["guar gum", "guar", "cyamopsis tetragonoloba"],
    category: "Thickener / Stabilizer",
    riskLevel: "low",
    penaltyWeight: 2,
    novaGroup: "NOVA Group 3 (Processed)",
    fssaiStatus: "Permitted additive under GMP guidelines in dairy, noodles, and sauces.",
    fssaiCategoryLimits: [
      { category: "Instant Noodles (Noodle Cake)", limit: "5,000 mg/kg" },
      { category: "Ice Cream & Sauces", limit: "GMP" }
    ],
    evidenceConcern: "Natural galactomannan soluble fiber farmed traditionally from Indian guar beans (cluster beans). Enhances texture and gut microbiome diversity.",
    plainText: "Indigenous Indian bean fiber used to keep noodle dough elastic and ice cream creamy.",
    commonFoods: "Noodles, ice creams, salad dressings, packaged gravies.",
    translations: {
      en: "Indigenous Indian cluster bean fiber providing smooth thickness.",
      hi: "ग्वार गम — भारतीय ग्वार की फली से बना प्राकृतिक फाइबर, जो नूडल्स में लचीलापन लाता है।",
      gu: "ગુવાર ગમ — ગુવારની સીંગમાંથી બનાવેલું કુદરતી ફાઈબર, જે નૂડલ્સને મુલાયમ રાખે છે."
    }
  },
  {
    code: "INS 223",
    eCode: "E 223",
    name: "Sodium Metabisulphite",
    aliases: ["sodium metabisulphite", "metabisulfite", "sulfite"],
    category: "Preservative / Antioxidant",
    riskLevel: "caution",
    penaltyWeight: 12,
    novaGroup: "NOVA Group 4 (Ultra-Processed)",
    fssaiStatus: "Permitted with mandatory allergen declaration: 'Contains Sulfites' in bold.",
    fssaiCategoryLimits: [
      { category: "Dried Fruits & Raisins", limit: "2,000 mg/kg" },
      { category: "Biscuits & Crackers", limit: "50 mg/kg" },
      { category: "Dehydrated Potato Flakes", limit: "100 mg/kg" }
    ],
    evidenceConcern: "Sulfite preservative capable of triggering severe bronchospasm and asthmatic attacks in sensitive individuals (estimated 5-10% of asthmatics). Mandatory declaration required.",
    plainText: "Sulfite chemical used to bleach dough and stop dried potatoes from browning. Strong allergen trigger for asthma.",
    commonFoods: "Dried apricots, potato chips, commercial biscuits, wine.",
    translations: {
      en: "Sulfite preservative preventing browning; triggers asthma in sensitive individuals.",
      hi: "सोडियम मेटाबाईसल्फाइट — आलू और सूखे मेवों को काला पड़ने से रोकने वाला सल्फर घटक।",
      gu: "સોડિયમ મેટાબાયસલ્ફાઈટ — સૂકા ફળો અને બટાકાની વેફર્સને સફેદ રાખતું પ્રિઝર્વેટિવ."
    }
  },
  {
    code: "INS 471",
    eCode: "E 471",
    name: "Mono- and Diglycerides of Fatty Acids",
    aliases: ["mono and diglycerides", "glycerides", "emulsifier 471"],
    category: "Emulsifier",
    riskLevel: "moderate",
    penaltyWeight: 6,
    novaGroup: "NOVA Group 4 (Ultra-Processed)",
    fssaiStatus: "Permitted additive under Good Manufacturing Practice.",
    fssaiCategoryLimits: [
      { category: "Packaged Sliced Breads", limit: "GMP" },
      { category: "Ice Cream & Margarines", limit: "GMP" }
    ],
    evidenceConcern: "Industrial lipid emulsifier created by reacting glycerol with plant or animal fats. Hallmark biomarker of ultra-processed bakery goods that extends commercial shelf life for weeks.",
    plainText: "Industrial oil stabilizer that keeps supermarket bread soft for weeks and stops peanut butter oil from rising.",
    commonFoods: "Sliced white bread, commercial cakes, peanut butter, packaged croissants.",
    translations: {
      en: "Industrial oil stabilizer extending commercial bread softness.",
      hi: "मोनो और डाइग्लिसराइड्स — ब्रेड को हफ्तों तक मुलायम रखने वाला इंडस्ट्रियल फैट घटक।",
      gu: "મોનો-ડાયગ્લિસરાઈડ્સ — બ્રેડ અને કેકને લાંબો સમય નરમ રાખવા માટેનું ઓઈલ સ્ટેબિલાઈઝર."
    }
  }
];

// --- High-Performance Trie & LRU Cache Setup ---
const additiveTrie = new Trie();
const searchLRUCache = new LRUCache(100);

// Populate Trie with code, name, and all aliases for fast O(L) retrieval
ADDITIVE_DATABASE.forEach(item => {
  // 1. Primary code tokens
  additiveTrie.insert(item.code, item);
  additiveTrie.insert(item.eCode, item);
  additiveTrie.insert(item.code.replace(/\s+/g, ''), item); // e.g. "INS621"
  additiveTrie.insert(item.code.replace(/INS\s*/i, ''), item); // e.g. "621"
  
  // 2. Additive Name
  additiveTrie.insert(item.name, item);

  // 3. Aliases (e.g. "msg", "ajinomoto", "tartrazine", "baking soda")
  if (Array.isArray(item.aliases)) {
    item.aliases.forEach(alias => additiveTrie.insert(alias, item));
  }
});

let currentLanguage = 'en';

export function initAdditiveDecoder() {
  const container = document.getElementById('additive-decoder-container') || document.getElementById('additive-decoder-app');
  if (!container) return;

  renderDecoderHTML(container);
  bindDecoderEvents();
  handleUrlQueryParams();
}

function handleUrlQueryParams() {
  const params = new URLSearchParams(window.location.search);
  const codeParam = params.get('code');
  if (codeParam) {
    const searchInput = document.getElementById('ins-search-input');
    if (searchInput) {
      searchInput.value = codeParam;
      searchInput.dispatchEvent(new Event('input'));
      setTimeout(() => {
        const grid = document.getElementById('additive-results-grid');
        if (grid) grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
    }
  }
}

function renderDecoderHTML(container) {
  container.innerHTML = `
    <div class="hud-telemetry-workbench">
      <div class="hud-status-bar">
        <div style="display: flex; align-items: center; gap: 0.65rem;">
          <div class="hud-pulse-dot"></div>
          <span style="font-family: var(--font-family-display); font-weight: 800; font-size: 0.85rem; letter-spacing: 0.05em; color: var(--color-primary);">
            FSSAI ADDITIVE DIRECTORY & REGULATORY SEARCH
          </span>
        </div>
        <!-- Language Switcher Pills -->
        <div style="display: flex; gap: 0.35rem; align-items: center;">
          <span style="font-size: 0.75rem; color: var(--color-text-muted); margin-right: 0.3rem;">Language:</span>
          <button type="button" class="lang-pill-btn active" data-lang="en">EN</button>
          <button type="button" class="lang-pill-btn" data-lang="hi">हिंदी</button>
          <button type="button" class="lang-pill-btn" data-lang="gu">ગુજરાતી</button>
        </div>
      </div>

      <div class="hud-controls-grid">
        <div>
          <label for="ins-search-input" class="form-label" style="font-size: 0.85rem; text-transform: uppercase;">
            Search by INS Code, Name or Keyword
          </label>
          <input 
            type="text" 
            id="ins-search-input" 
            class="form-input hud-input" 
            placeholder="e.g. 621, MSG, Tartrazine, Baking Soda, Preservative..."
            autocomplete="off"
          >
        </div>

        <div>
          <label for="ins-category-filter" class="form-label" style="font-size: 0.85rem; text-transform: uppercase;">
            Filter by Functional Class
          </label>
          <select id="ins-category-filter" class="form-select hud-select">
            <option value="all">All Functional Classes</option>
            <option value="Flavor Enhancer">Flavor Enhancers</option>
            <option value="Emulsifier">Emulsifiers</option>
            <option value="Preservative">Preservatives</option>
            <option value="Colorant">Food Colorants</option>
            <option value="Sweetener">Artificial Sweeteners</option>
            <option value="Thickener">Thickeners / Stabilizers</option>
            <option value="Acidity Regulator">Acidity Regulators</option>
          </select>
        </div>
      </div>

      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem; font-size: 0.85rem; color: var(--color-text-muted);">
        <div>Displaying <strong id="ins-count-badge" style="color: var(--color-primary);">${ADDITIVE_DATABASE.length}</strong> validated food additives.</div>
        <div style="font-size: 0.78rem; font-family: monospace; color: var(--color-primary);">[ FSSAI REGULATORY LIMITS & CITATIONS ]</div>
      </div>

      <div class="grid-2" id="additive-results-grid"></div>
    </div>
  `;
  renderCards(ADDITIVE_DATABASE);
}

function renderCards(list) {
  const grid = document.getElementById('additive-results-grid');
  const countBadge = document.getElementById('ins-count-badge');
  if (!grid) return;

  if (countBadge) countBadge.textContent = list.length;

  if (list.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; background: #FFFFFF; border-radius: var(--radius-md); border: 1px solid var(--color-border);">
        <p style="font-size: 1.1rem; color: var(--color-text-muted);">No matching food additives found for your query.</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = list.map(item => {
    let riskBadgeColor = '#2D6A4F';
    let riskBadgeBg = '#E8F5E9';
    let riskLabel = 'Low Concern';

    if (item.riskLevel === 'caution') {
      riskBadgeColor = '#B91C1C';
      riskBadgeBg = '#FEE2E2';
      riskLabel = 'Caution Flag';
    } else if (item.riskLevel === 'moderate') {
      riskBadgeColor = '#B45309';
      riskBadgeBg = '#FEF3C7';
      riskLabel = 'Moderate Concern';
    }

    const explanationText = item.translations?.[currentLanguage] || item.plainText;

    // Render Category Limits mini-table
    const limitsHTML = item.fssaiCategoryLimits ? `
      <div style="margin-top: 0.75rem; border-top: 1px dashed var(--color-border); padding-top: 0.5rem;">
        <div style="font-size: 0.75rem; font-weight: 700; color: var(--color-text-main); margin-bottom: 0.3rem;">
          ⚖️ FSSAI Food Category Numerical Limits:
        </div>
        <div style="display: flex; flex-direction: column; gap: 0.25rem;">
          ${item.fssaiCategoryLimits.map(lim => `
            <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--color-text-muted); background: rgba(255,255,255,0.7); padding: 0.2rem 0.4rem; border-radius: 4px;">
              <span>${sanitizeInput(lim.category)}</span>
              <strong style="color: var(--color-text-main);">${sanitizeInput(lim.limit)}</strong>
            </div>
          `).join('')}
        </div>
      </div>
    ` : '';

    return `
      <div class="hud-additive-card">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.75rem;">
          <div>
            <div style="display: flex; align-items: center; gap: 0.45rem;">
              <span class="hud-code-tag">${sanitizeInput(item.code)}</span>
              <span style="font-size: 0.75rem; color: var(--color-text-muted); font-weight: 600;">(${sanitizeInput(item.eCode)})</span>
            </div>
            <h3 style="font-size: 1.15rem; margin-top: 0.3rem;">${sanitizeInput(item.name)}</h3>
          </div>
          <span style="font-size: 0.75rem; font-weight: 700; color: ${riskBadgeColor}; background: ${riskBadgeBg}; padding: 0.25rem 0.65rem; border-radius: 99px;">
            ${riskLabel}
          </span>
        </div>

        <p style="font-size: 0.88rem; color: var(--color-text-main); margin-bottom: 0.75rem; font-weight: 500; line-height: 1.45;">
          ${sanitizeInput(explanationText)}
        </p>

        <!-- Regulatory Fact (FSSAI) vs Evidence Concern (BiteLens Judgment) -->
        <div style="background: rgba(241, 245, 249, 0.85); padding: 0.65rem 0.85rem; border-radius: var(--radius-sm); font-size: 0.8rem; margin-bottom: 0.65rem; border: 1px solid var(--color-border);">
          <div style="margin-bottom: 0.4rem;">
            <strong style="color: var(--color-primary);">🏛️ FSSAI Regulatory Status:</strong>
            <span style="color: var(--color-text-main);">${sanitizeInput(item.fssaiStatus)}</span>
          </div>
          <div>
            <strong style="color: #9A3412;">🔬 Scientific Evidence & Citation:</strong>
            <span style="color: var(--color-text-muted);">${sanitizeInput(item.evidenceConcern)}</span>
          </div>
        </div>

        ${limitsHTML}

        <div style="margin-top: 0.65rem; font-size: 0.75rem; color: var(--color-text-muted);">
          <strong>Common Foods:</strong> ${sanitizeInput(item.commonFoods)}
        </div>
      </div>
    `;
  }).join('');
}

function bindDecoderEvents() {
  const searchInput = document.getElementById('ins-search-input');
  const categoryFilter = document.getElementById('ins-category-filter');
  const langBtns = document.querySelectorAll('.lang-pill-btn');

  langBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      langBtns.forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      currentLanguage = e.target.dataset.lang || 'en';
      filterList();
    });
  });

  function filterList() {
    const rawQuery = searchInput?.value || '';
    const cleanQuery = sanitizeInput(sanitizeSQL(rawQuery)).toLowerCase().trim();
    const cat = categoryFilter?.value || 'all';
    const cacheKey = `${cleanQuery}__${cat}__${currentLanguage}`;

    if (searchLRUCache.has(cacheKey)) {
      renderCards(searchLRUCache.get(cacheKey));
      return;
    }

    if (!cleanQuery && cat === 'all') {
      searchLRUCache.put(cacheKey, ADDITIVE_DATABASE);
      renderCards(ADDITIVE_DATABASE);
      return;
    }

    let matchedItems = [];
    const seenCodes = new Set();

    // 1. Check normalized INS code matching first (using INSNormalizer OCR confusion map)
    const norm = INSNormalizer.normalizeCode(cleanQuery);
    if (norm.number) {
      ADDITIVE_DATABASE.forEach(item => {
        if (INSNormalizer.matchCode(cleanQuery, item.code) || INSNormalizer.matchCode(cleanQuery, item.eCode)) {
          if (!seenCodes.has(item.code)) {
            seenCodes.add(item.code);
            matchedItems.push(item);
          }
        }
      });
    }

    // 2. Check Trie for prefix matches
    const trieMatches = additiveTrie.autocomplete(cleanQuery, 10);
    trieMatches.forEach(item => {
      if (!seenCodes.has(item.code)) {
        seenCodes.add(item.code);
        matchedItems.push(item);
      }
    });

    // 3. General Search (Text, Aliases, Levenshtein for names only)
    ADDITIVE_DATABASE.forEach(item => {
      if (seenCodes.has(item.code)) return;
      
      const inAliases = Array.isArray(item.aliases) && item.aliases.some(a => a.toLowerCase().includes(cleanQuery));
      const inName = item.name.toLowerCase().includes(cleanQuery);
      const inText = item.plainText.toLowerCase().includes(cleanQuery);
      const inCat = item.category.toLowerCase().includes(cleanQuery);
      
      // CRITICAL: Levenshtein distance for text names ONLY, never numeric codes
      const nameFuzzy = cleanQuery.length > 3 && isNaN(Number(cleanQuery)) && FuzzyMatcher.similarity(item.name, cleanQuery) > 0.65;

      if (inAliases || inName || inText || inCat || nameFuzzy) {
        seenCodes.add(item.code);
        matchedItems.push(item);
      }
    });

    if (cat !== 'all') {
      matchedItems = matchedItems.filter(item => item.category.toLowerCase().includes(cat.toLowerCase()));
    }

    searchLRUCache.put(cacheKey, matchedItems);
    renderCards(matchedItems);
  }

  if (searchInput) searchInput.addEventListener('input', filterList);
  if (categoryFilter) categoryFilter.addEventListener('change', filterList);
}

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', initAdditiveDecoder);
}
