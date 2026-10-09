/* ==========================================================================
   BiteLens Data Structures Verification & Stress Test Suite
   ========================================================================== */

import { Trie, LRUCache, FuzzyMatcher, CircularBuffer } from '../js/data-structures.js';

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
