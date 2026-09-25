/**
 * BiteLens Mobile - High-Performance Data Structures Engine
 * Ported to TypeScript for 100% type-safe on-device acceleration:
 * 1. Trie (Prefix Search Tree) for O(L) INS Additive Code & Chemical Lookup
 * 2. LRU Cache (Least Recently Used) with O(1) Doubly-Linked Map
 * 3. Fuzzy Matcher (Wagner-Fischer Dynamic Programming) for OCR Typo Tolerance
 * 4. Circular Buffer (Fixed Ring Buffer) for Bounded Telemetry Stream
 */

// ==========================================
// 1. TRIE DATA STRUCTURE
// ==========================================

export class TrieNode<T = any> {
  children: Map<string, TrieNode<T>>;
  isEndOfWord: boolean;
  data: T | null;

  constructor() {
    this.children = new Map();
    this.isEndOfWord = false;
    this.data = null;
  }
}

export class Trie<T = any> {
  root: TrieNode<T>;

  constructor() {
    this.root = new TrieNode<T>();
  }

  insert(word: string, data: T): void {
    if (!word) return;
    let node = this.root;
    const cleanWord = word.trim().toLowerCase();

    for (let i = 0; i < cleanWord.length; i++) {
      const char = cleanWord[i];
      if (!node.children.has(char)) {
        node.children.set(char, new TrieNode<T>());
      }
      node = node.children.get(char)!;
    }
    node.isEndOfWord = true;
    node.data = data;
  }

  search(word: string): T | null {
    if (!word) return null;
    let node = this.root;
    const cleanWord = word.trim().toLowerCase();

    for (let i = 0; i < cleanWord.length; i++) {
      const char = cleanWord[i];
      if (!node.children.has(char)) {
        return null;
      }
      node = node.children.get(char)!;
    }
    return node.isEndOfWord ? node.data : null;
  }

  autocomplete(prefix: string, maxResults: number = 8): T[] {
    if (!prefix) return [];
    let node = this.root;
    const cleanPrefix = prefix.trim().toLowerCase();

    for (let i = 0; i < cleanPrefix.length; i++) {
      const char = cleanPrefix[i];
      if (!node.children.has(char)) {
        return [];
      }
      node = node.children.get(char)!;
    }

    const results: T[] = [];
    const collect = (currNode: TrieNode<T>) => {
      if (results.length >= maxResults) return;
      if (currNode.isEndOfWord && currNode.data !== null) {
        results.push(currNode.data);
      }
      for (const child of currNode.children.values()) {
        collect(child);
        if (results.length >= maxResults) break;
      }
    };

    collect(node);
    return results;
  }
}

// ==========================================
// 2. LRU CACHE DATA STRUCTURE
// ==========================================

class DListNode<K, V> {
  key: K;
  value: V;
  prev: DListNode<K, V> | null;
  next: DListNode<K, V> | null;

  constructor(key: K, value: V) {
    this.key = key;
    this.value = value;
    this.prev = null;
    this.next = null;
  }
}

export class LRUCache<K, V> {
  private capacity: number;
  private map: Map<K, DListNode<K, V>>;
  private head: DListNode<K, V>;
  private tail: DListNode<K, V>;

  constructor(capacity: number = 100) {
    this.capacity = capacity;
    this.map = new Map();
    // Sentinel nodes
    this.head = new DListNode<K, V>(null as any, null as any);
    this.tail = new DListNode<K, V>(null as any, null as any);
    this.head.next = this.tail;
    this.tail.prev = this.head;
  }

  private removeNode(node: DListNode<K, V>): void {
    if (node.prev) node.prev.next = node.next;
    if (node.next) node.next.prev = node.prev;
  }

  private addToHead(node: DListNode<K, V>): void {
    node.next = this.head.next;
    node.prev = this.head;
    if (this.head.next) this.head.next.prev = node;
    this.head.next = node;
  }

  get(key: K): V | null {
    if (!this.map.has(key)) return null;
    const node = this.map.get(key)!;
    this.removeNode(node);
    this.addToHead(node);
    return node.value;
  }

  has(key: K): boolean {
    return this.map.has(key);
  }

  put(key: K, value: V): void {
    if (this.map.has(key)) {
      const node = this.map.get(key)!;
      node.value = value;
      this.removeNode(node);
      this.addToHead(node);
      return;
    }

    if (this.map.size >= this.capacity) {
      const lru = this.tail.prev;
      if (lru && lru !== this.head) {
        this.removeNode(lru);
        this.map.delete(lru.key);
      }
    }

    const newNode = new DListNode<K, V>(key, value);
    this.map.set(key, newNode);
    this.addToHead(newNode);
  }

  size(): number {
    return this.map.size;
  }

  clear(): void {
    this.map.clear();
    this.head.next = this.tail;
    this.tail.prev = this.head;
  }
}

// ==========================================
// 3. FUZZY MATCHER (WAGNER-FISCHER LEVENSHTEIN)
// ==========================================

export class FuzzyMatcher {
  static levenshteinDistance(a: string, b: string): number {
    const s1 = a.toLowerCase();
    const s2 = b.toLowerCase();
    const len1 = s1.length;
    const len2 = s2.length;

    const dp: number[][] = Array.from({ length: len1 + 1 }, () => Array(len2 + 1).fill(0));

    for (let i = 0; i <= len1; i++) dp[i][0] = i;
    for (let j = 0; j <= len2; j++) dp[0][j] = j;

    for (let i = 1; i <= len1; i++) {
      for (let j = 1; j <= len2; j++) {
        const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1,      // Deletion
          dp[i][j - 1] + 1,      // Insertion
          dp[i - 1][j - 1] + cost // Substitution
        );
      }
    }

    return dp[len1][len2];
  }

  static levenshtein(a: string, b: string): number {
    return this.levenshteinDistance(a, b);
  }

  static similarity(a: string, b: string): number {
    const s1 = (a || '').toLowerCase().trim();
    const s2 = (b || '').toLowerCase().trim();
    const maxLen = Math.max(s1.length, s2.length);
    if (maxLen === 0) return 1.0;
    const dist = this.levenshtein(s1, s2);
    return (maxLen - dist) / maxLen;
  }

  static findBestMatch<T>(
    query: string,
    candidates: { name: string; item: T }[],
    maxDistance: number = 2
  ): { item: T; distance: number } | null {
    let bestDist = Infinity;
    let bestMatch: T | null = null;

    for (const cand of candidates) {
      const dist = this.levenshteinDistance(query, cand.name);
      if (dist < bestDist && dist <= maxDistance) {
        bestDist = dist;
        bestMatch = cand.item;
      }
    }

    return bestMatch ? { item: bestMatch, distance: bestDist } : null;
  }
}

// ==========================================
// 4. CIRCULAR BUFFER
// ==========================================

export class CircularBuffer<T> {
  private buffer: (T | null)[];
  private capacity: number;
  private head: number;
  private count: number;

  constructor(capacity: number = 20) {
    this.capacity = capacity;
    this.buffer = new Array(capacity).fill(null);
    this.head = 0;
    this.count = 0;
  }

  push(item: T): void {
    this.buffer[this.head] = item;
    this.head = (this.head + 1) % this.capacity;
    if (this.count < this.capacity) {
      this.count++;
    }
  }

  toArray(): T[] {
    const result: T[] = [];
    for (let i = 0; i < this.count; i++) {
      const idx = (this.head - 1 - i + this.capacity) % this.capacity;
      const val = this.buffer[idx];
      if (val !== null) {
        result.push(val);
      }
    }
    return result;
  }

  size(): number {
    return this.count;
  }
}
