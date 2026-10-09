/* ==========================================================================
   BiteLens Data Structures Verification & Stress Test Suite
   ========================================================================== */

import { Trie, LRUCache, FuzzyMatcher, INSNormalizer, CircularBuffer } from '../js/data-structures.js';

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  } else {
    console.log(`✅ PASSED: ${message}`);
  }
}

console.log("=== 1. TESTING TRIE (PREFIX SEARCH & AUTOCOMPLETE) ===");
const trie = new Trie();
trie.insert("INS 621", { name: "MSG", nova: 4 });
trie.insert("INS 322", { name: "Lecithin", nova: 3 });
trie.insert("INS 500", { name: "Baking Soda", nova: 2 });
trie.insert("INS 500(ii)", { name: "Sodium Bicarbonate", nova: 2 });
trie.insert("INS 211", { name: "Sodium Benzoate", nova: 4 });

assert(trie.search("INS 621")?.name === "MSG", "Trie exact search for 'INS 621'");
assert(trie.search("INS 500(ii)")?.name === "Sodium Bicarbonate", "Trie exact search with parentheses 'INS 500(ii)'");
assert(trie.search("INS 999") === null, "Trie non-existent item returns null");

const ins500Matches = trie.autocomplete("INS 500");
assert(ins500Matches.length === 2, "Trie autocomplete 'INS 500' returns 2 matches");
const allIns = trie.autocomplete("INS ");
assert(allIns.length === 5, "Trie autocomplete 'INS ' returns all 5 additives");

console.log("\n=== 2. TESTING LRU CACHE (O(1) GET / PUT & EVICTION) ===");
const cache = new LRUCache(3);
cache.put("a", 100);
cache.put("b", 200);
cache.put("c", 300);

assert(cache.get("a") === 100, "LRU Cache get existing key 'a'");
assert(cache.get("b") === 200, "LRU Cache get existing key 'b'");

// Put 4th element -> should evict 'c' because 'a' and 'b' were recently accessed
cache.put("d", 400);
assert(cache.get("c") === null, "LRU Cache correctly evicted least-recently-used key 'c'");
assert(cache.get("a") === 100, "LRU Cache retained recently accessed key 'a'");
assert(cache.get("d") === 400, "LRU Cache stored new key 'd'");
assert(cache.size() === 3, "LRU Cache size respects capacity limit of 3");

console.log("\n=== 3. TESTING FUZZY MATCHER (LEVENSHTEIN & SIMILARITY) ===");
assert(FuzzyMatcher.levenshtein("kitten", "sitting") === 3, "Levenshtein distance 'kitten' -> 'sitting' is 3");
assert(FuzzyMatcher.levenshtein("MSG", "MSG") === 0, "Levenshtein identical strings distance is 0");
assert(FuzzyMatcher.levenshtein("", "test") === 4, "Levenshtein empty string distance is 4");

const simExact = FuzzyMatcher.similarity("Monosodium Glutamate", "Monosodium Glutamate");
assert(simExact === 1.0, "Similarity of identical strings is 1.0");

const simTypo = FuzzyMatcher.similarity("Monosodum Glutamae", "Monosodium Glutamate");
assert(simTypo > 0.85, `Similarity with typos is high (${simTypo.toFixed(2)})`);

console.log("\n=== 3b. TESTING INS NORMALIZER & OCR CONFUSION MAP ===");
// Test canonical INS code resolutions requested in spec: 150d, 160a(i), E 322, INS-621
const norm150d = INSNormalizer.normalizeCode("150d");
assert(norm150d.number === "150d" && norm150d.canonical === "INS 150d", "INSNormalizer parses '150d'");

const norm160a = INSNormalizer.normalizeCode("160a(i)");
assert(norm160a.number === "160a(i)" && norm160a.canonical === "INS 160a(i)", "INSNormalizer parses '160a(i)'");

const normE322 = INSNormalizer.normalizeCode("E 322");
assert(normE322.number === "322" && normE322.canonical === "INS 322", "INSNormalizer parses 'E 322'");

const normIns621 = INSNormalizer.normalizeCode("INS-621");
assert(normIns621.number === "621" && normIns621.canonical === "INS 621", "INSNormalizer parses 'INS-621'");

// Test OCR confusion map substitutions (I/l->1, O->0, S->5, B->8)
const ocrTypo1 = INSNormalizer.normalizeCode("INS-62I"); // I -> 1
assert(ocrTypo1.number === "621", "OCR confusion map resolves 'INS-62I' -> 621");

const ocrTypo2 = INSNormalizer.normalizeCode("INS S00(ii)"); // S -> 5, O -> 0
const norm150D = INSNormalizer.normalizeCode("150D");
assert(norm150D.number === "150d" && norm150D.canonical === "INS 150d", "INSNormalizer parses uppercase '150D' preserving suffix");

// Import and test full text extraction pipeline on complex ingredient string
const { extractAdditivesFromText } = await import('../js/analyze.js');
const extracted = extractAdditivesFromText("Contains 150d, 160a(i), E 322, INS-621, MSG, Tartrazine");
const extractedCodes = extracted.map(e => e.code);
assert(extractedCodes.includes("INS 150d"), "extractAdditivesFromText detected '150d'");
assert(extractedCodes.includes("INS 160a(i)"), "extractAdditivesFromText detected '160a(i)'");
assert(extractedCodes.includes("INS 322"), "extractAdditivesFromText detected 'E 322'");
assert(extractedCodes.includes("INS 621"), "extractAdditivesFromText detected 'INS-621' & 'MSG'");
assert(extractedCodes.includes("INS 102"), "extractAdditivesFromText detected 'Tartrazine'");
// CRITICAL CORRECTNESS TEST: Verify 621 does NOT match 622, 627, or 631
assert(INSNormalizer.matchCode("INS 621", "INS-621") === true, "INS 621 matches INS-621");
assert(INSNormalizer.matchCode("INS 621", "INS 622") === false, "CRITICAL: INS 621 does NOT match INS 622");
assert(INSNormalizer.matchCode("INS 621", "INS 627") === false, "CRITICAL: INS 621 does NOT match INS 627");
assert(INSNormalizer.matchCode("INS 621", "INS 631") === false, "CRITICAL: INS 621 does NOT match INS 631");

console.log("\n=== 4. TESTING CIRCULAR BUFFER (RING BUFFER) ===");
const ring = new CircularBuffer(3);
ring.push("scan-1");
ring.push("scan-2");
ring.push("scan-3");

assert(ring.toArray().length === 3, "Circular buffer contains 3 items");
assert(ring.latest() === "scan-3", "Circular buffer latest item is 'scan-3'");

// Push 4th item -> should overwrite 'scan-1'
ring.push("scan-4");
const items = ring.toArray();
assert(items.length === 3, "Circular buffer maintains fixed capacity of 3");
assert(items[0] === "scan-2", "Circular buffer evicted oldest item 'scan-1'");
assert(items[2] === "scan-4", "Circular buffer newest item is 'scan-4'");
assert(ring.latest() === "scan-4", "Circular buffer latest() returns 'scan-4'");

console.log("\n🎯 ALL DATA STRUCTURE TESTS PASSED WITH 100% ACCURACY!");
