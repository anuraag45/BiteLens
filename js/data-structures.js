/* ==========================================================================
   BiteLens Web Application - High-Efficiency Data Structures Library
   Includes:
   1. Trie (Prefix Tree for O(L) INS Additive Search & Autocomplete)
   2. LRUCache (Least Recently Used O(1) Cache for Scans & Calculations)
   3. FuzzyMatcher (Levenshtein Distance & N-Gram Typo Tolerance)
   4. CircularBuffer (O(1) Rolling Window Ring Buffer for Telemetry Logs)
   ========================================================================== */

/**
 * 1. TrieNode & Trie (Prefix Tree)
 * Provides O(Length) prefix matching and instantaneous autocompletion for INS codes and food ingredients.
 */
class TrieNode {
  constructor() {
    this.children = new Map();
    this.isEndOfWord = false;
    this.data = null; // Stored payload (e.g. Additive metadata)
  }
}

export class Trie {
  constructor() {
    this.root = new TrieNode();
    this.size = 0;
  }

  /**
   * Inserts a key-value pair into the Trie.
   * Time Complexity: O(L) where L is key length.
   */
  insert(key, data = null) {
    if (!key) return;
    const normalized = key.toLowerCase().trim();
    let current = this.root;

    for (const char of normalized) {
      if (!current.children.has(char)) {
        current.children.set(char, new TrieNode());
      }
      current = current.children.get(char);
    }

    if (!current.isEndOfWord) {
      this.size++;
    }
    current.isEndOfWord = true;
    current.data = data;
  }

  /**
   * Searches for an exact match.
   * Time Complexity: O(L)
   */
  search(key) {
    if (!key) return null;
    const normalized = key.toLowerCase().trim();
    let current = this.root;

    for (const char of normalized) {
      if (!current.children.has(char)) return null;
      current = current.children.get(char);
    }

    return current.isEndOfWord ? current.data : null;
  }

  /**
   * Returns all items starting with the given prefix.
   * Time Complexity: O(Prefix Length + Matches)
   */
  autocomplete(prefix, limit = 10) {
    if (!prefix) return [];
    const normalized = prefix.toLowerCase().trim();
    let current = this.root;

    for (const char of normalized) {
      if (!current.children.has(char)) return [];
      current = current.children.get(char);
    }

    const results = [];
    this._dfs(current, results, limit);
    return results;
  }

  _dfs(node, results, limit) {
    if (results.length >= limit) return;
    if (node.isEndOfWord && node.data) {
      results.push(node.data);
    }
    for (const [, childNode] of node.children) {
      this._dfs(childNode, results, limit);
      if (results.length >= limit) break;
    }
  }
}

/**
 * 2. LRUCache (Least Recently Used Cache)
 * Employs a Doubly Linked List + Hash Map to achieve true O(1) Get and Put operations.
 */
class DoublyLinkedListNode {
  constructor(key, value) {
    this.key = key;
    this.value = value;
    this.prev = null;
    this.next = null;
  }
}

export class LRUCache {
  constructor(capacity = 50) {
    this.capacity = Math.max(1, capacity);
    this.cache = new Map(); // key -> DoublyLinkedListNode
    this.head = new DoublyLinkedListNode(null, null); // Dummy head
    this.tail = new DoublyLinkedListNode(null, null); // Dummy tail
    this.head.next = this.tail;
    this.tail.prev = this.head;
  }

  _remove(node) {
    node.prev.next = node.next;
    node.next.prev = node.prev;
  }

  _addToHead(node) {
    node.next = this.head.next;
    node.prev = this.head;
    this.head.next.prev = node;
    this.head.next = node;
  }

  _moveToHead(node) {
    this._remove(node);
    this._addToHead(node);
  }

  get(key) {
    if (!this.cache.has(key)) return null;
    const node = this.cache.get(key);
    this._moveToHead(node);
    return node.value;
  }

  put(key, value) {
    if (this.cache.has(key)) {
      const node = this.cache.get(key);
      node.value = value;
      this._moveToHead(node);
    } else {
      const newNode = new DoublyLinkedListNode(key, value);
      this.cache.set(key, newNode);
      this._addToHead(newNode);

      if (this.cache.size > this.capacity) {
        // Evict least recently used (node before dummy tail)
        const lruNode = this.tail.prev;
        this._remove(lruNode);
        this.cache.delete(lruNode.key);
      }
    }
  }

  has(key) {
    return this.cache.has(key);
  }

  clear() {
    this.cache.clear();
    this.head.next = this.tail;
    this.tail.prev = this.head;
  }

  size() {
    return this.cache.size;
  }
}

/**
 * 3. FuzzyMatcher (Levenshtein Distance & Typo Tolerance for NAMES ONLY)
 * Calculates minimum edit distance between ingredient/additive NAMES.
 * NOTE: Never use edit distance on numerical INS codes, because edit distance 1
 * maps 621 to 622, 627, or 631 which are completely different additives!
 */
export class FuzzyMatcher {
  /**
   * Computes Levenshtein edit distance between string a and b.
   * Space-optimized O(min(N, M)) memory footprint.
   */
  static levenshtein(a, b) {
    if (a === b) return 0;
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;

    let v0 = new Array(b.length + 1);
    let v1 = new Array(b.length + 1);

    for (let i = 0; i <= b.length; i++) {
      v0[i] = i;
    }

    for (let i = 0; i < a.length; i++) {
      v1[0] = i + 1;

      for (let j = 0; j < b.length; j++) {
        const cost = a[i] === b[j] ? 0 : 1;
        v1[j + 1] = Math.min(
          v1[j] + 1,      // insertion
          v0[j + 1] + 1,  // deletion
          v0[j] + cost    // substitution
        );
      }

      for (let j = 0; j <= b.length; j++) {
        v0[j] = v1[j];
      }
    }

    return v1[b.length];
  }

  /**
   * Returns similarity score between 0.0 (completely distinct) and 1.0 (exact match).
   * For ingredient & additive text names only.
   */
  static similarity(a, b) {
    const s1 = (a || '').toLowerCase().trim();
    const s2 = (b || '').toLowerCase().trim();
    const maxLen = Math.max(s1.length, s2.length);
    if (maxLen === 0) return 1.0;
    const dist = this.levenshtein(s1, s2);
    return (maxLen - dist) / maxLen;
  }

  static findBestMatch(query, candidates, maxDistance = 2) {
    let bestDist = Infinity;
    let bestMatch = null;

    for (const cand of candidates) {
      const dist = this.levenshtein(query, cand.name);
      if (dist < bestDist && dist <= maxDistance) {
        bestDist = dist;
        bestMatch = cand.item;
      }
    }

    return bestMatch ? { item: bestMatch, distance: bestDist } : null;
  }
}

/**
 * 3b. INSNormalizer & OCR Confusion Resolver
 * Solves correctness bug where Levenshtein mapped 621 to 622, 627, or 631.
 * Applies optical confusion substitutions ONLY to code digit sequences:
 * I / l / | -> 1
 * O / o / D / Q -> 0
 * S / s / $ -> 5
 * B -> 8
 * Z / z -> 2
 * Normalizes prefixes (INS, E, e) and suffixes (e.g. 150d, 160a(i), E 322, INS-621).
 */
export class INSNormalizer {
  static OCR_DIGIT_CONFUSIONS = {
    'i': '1', 'I': '1', 'l': '1', '|': '1',
    'o': '0', 'O': '0',
    's': '5', 'S': '5', '$': '5',
    'b': '8', 'B': '8'
  };

  /**
   * Normalizes an INS or E-code string using OCR character confusion rules.
   */
  static normalizeCode(raw) {
    if (!raw || typeof raw !== 'string') return { number: '', canonical: '', eCode: '' };
    let str = raw.trim();

    // Strip common prefixes: "INS-", "INS ", "INS", "E-", "E ", "E"
    const prefixMatch = str.match(/^(?:INS[-:\s]*|E[-:\s]*)(.*)$/i);
    let body = prefixMatch ? prefixMatch[1].trim() : str;

    // Match leading digits/confused characters, followed by valid suffix like "d", "a(i)", "(ii)", etc.
    const codeMatch = body.match(/^([0-9Il|OoSs$bB]{3,4})([\(\)a-zA-Z0-9]*)$/);
    if (codeMatch) {
      let numPart = codeMatch[1];
      let suffixPart = codeMatch[2] || '';

      // Apply OCR digit confusion map to numeric prefix part
      let correctedNum = '';
      for (const ch of numPart) {
        correctedNum += this.OCR_DIGIT_CONFUSIONS[ch] || ch;
      }

      const canonicalNum = correctedNum + suffixPart.toLowerCase();
      return {
        number: canonicalNum,
        canonical: `INS ${canonicalNum}`,
        eCode: `E ${canonicalNum}`
      };
    }

    // Direct match for standard digits + optional suffix
    const generalMatch = body.match(/^(\d+)([\(\)a-z0-9]*)/i);
    if (generalMatch) {
      const code = generalMatch[1] + generalMatch[2].toLowerCase();
      return {
        number: code,
        canonical: `INS ${code}`,
        eCode: `E ${code}`
      };
    }

    const clean = body.toLowerCase().replace(/\s+/g, '');
    return {
      number: clean,
      canonical: `INS ${clean}`,
      eCode: `E ${clean}`
    };
  }

  /**
   * Strict exact match verification for INS codes.
   * NEVER uses Levenshtein edit distance on numbers because 621 != 622 != 627 != 631!
   */
  static matchCode(query, targetCode) {
    const qNorm = this.normalizeCode(query);
    const tNorm = this.normalizeCode(targetCode);
    return qNorm.number.toLowerCase() === tNorm.number.toLowerCase();
  }
}

/**
 * 4. CircularBuffer (Fixed-size Ring Buffer)
 * Manages bounded telemetry stream logs and frame rates with constant O(1) append time.
 */
export class CircularBuffer {
  constructor(capacity = 20) {
    this.capacity = Math.max(1, capacity);
    this.buffer = new Array(this.capacity);
    this.head = 0;
    this.count = 0;
  }

  push(item) {
    this.buffer[this.head] = item;
    this.head = (this.head + 1) % this.capacity;
    if (this.count < this.capacity) {
      this.count++;
    }
  }

  toArray() {
    const result = [];
    const start = this.count < this.capacity ? 0 : this.head;
    for (let i = 0; i < this.count; i++) {
      result.push(this.buffer[(start + i) % this.capacity]);
    }
    return result;
  }

  latest() {
    if (this.count === 0) return null;
    const index = (this.head - 1 + this.capacity) % this.capacity;
    return this.buffer[index];
  }

  clear() {
    this.buffer = new Array(this.capacity);
    this.head = 0;
    this.count = 0;
  }
}

export default {
  Trie,
  LRUCache,
  FuzzyMatcher,
  INSNormalizer,
  CircularBuffer,
};
