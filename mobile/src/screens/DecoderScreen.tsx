import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Modal,
} from 'react-native';
import { Colors } from '../theme/colors';
import { FSSAI_ADDITIVES, additiveTrie } from '../algorithms/fssai-database';
import { FuzzyMatcher } from '../algorithms/data-structures';
import { Additive } from '../types';
import { HeaderHUD } from '../components/HeaderHUD';

const CATEGORIES = ['All', 'Flavor', 'Preservative', 'Color', 'Sweetener', 'Emulsifier'];

export const DecoderScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedAdditive, setSelectedAdditive] = useState<Additive | null>(null);

  // Compute search results using Trie + Fuzzy Fallback
  function getFilteredAdditives(): Additive[] {
    let list = FSSAI_ADDITIVES;

    if (selectedCategory !== 'All') {
      list = list.filter(a =>
        a.category.toLowerCase().includes(selectedCategory.toLowerCase())
      );
    }

    if (!searchQuery.trim()) {
      return list;
    }

    // 1. Try exact/prefix Trie autocomplete search
    const trieMatches = additiveTrie.autocomplete(searchQuery.trim(), 20);
    if (trieMatches.length > 0) {
      // Filter by category if one is active
      if (selectedCategory !== 'All') {
        return trieMatches.filter(a =>
          a.category.toLowerCase().includes(selectedCategory.toLowerCase())
        );
      }
      return trieMatches;
    }

    // 2. Fallback to Fuzzy Matcher (Levenshtein distance <= 2 for OCR/user typos)
    const fuzzyCandidates = list.map(a => ({ name: a.name, item: a }));
    const fuzzyResult = FuzzyMatcher.findBestMatch(searchQuery.trim(), fuzzyCandidates, 2);
    if (fuzzyResult) {
      return [fuzzyResult.item];
    }

    // 3. Fallback to substring search
    const q = searchQuery.toLowerCase().trim();
    return list.filter(
      a =>
        a.name.toLowerCase().includes(q) ||
        a.insCode.toLowerCase().includes(q) ||
        a.plainEnglish.toLowerCase().includes(q)
    );
  }

  const results = getFilteredAdditives();

  return (
    <SafeAreaView style={styles.safeArea}>
      <HeaderHUD title="INS Decoder" />

      <View style={styles.container}>
        {/* Search Bar with Trie Acceleration Badge */}
        <View style={styles.searchSection}>
          <View style={styles.searchBar}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search INS 621, MSG, Lecithin, Sucralose..."
              placeholderTextColor={Colors.textLight}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearBtn}>
                <Text style={styles.clearBtnText}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.trieTagRow}>
            <Text style={styles.trieBadge}>⚡ O(L) TRIE ACCELERATED</Text>
            <Text style={styles.resultCountText}>{results.length} Additives</Text>
          </View>
        </View>

        {/* Category Pills Filter */}
        <View style={styles.categoryBar}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryList}
          >
            {CATEGORIES.map(cat => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryPill,
                  selectedCategory === cat && styles.categoryPillActive,
                ]}
                onPress={() => setSelectedCategory(cat)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.categoryPillText,
                    selectedCategory === cat && styles.categoryPillTextActive,
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Results List */}
        <ScrollView contentContainerStyle={styles.resultsList}>
          {results.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🧪</Text>
              <Text style={styles.emptyTitle}>No Matching INS Code Found</Text>
              <Text style={styles.emptyDesc}>
                Try searching by numerical digits (e.g. "621" or "322") or everyday chemical terms like "lecithin" or "preservative".
              </Text>
            </View>
          ) : (
            results.map(add => {
              let riskColor = Colors.success;
              let riskBg = Colors.successLight;
              if (add.riskLevel === 'high') {
                riskColor = Colors.danger;
                riskBg = Colors.dangerLight;
              } else if (add.riskLevel === 'medium') {
                riskColor = Colors.warning;
                riskBg = Colors.warningLight;
              }

              return (
                <TouchableOpacity
                  key={add.insCode}
                  style={styles.additiveCard}
                  onPress={() => setSelectedAdditive(add)}
                  activeOpacity={0.85}
                >
                  <View style={styles.cardHeader}>
                    <View style={styles.insTag}>
                      <Text style={styles.insTagText}>{add.insCode}</Text>
                    </View>
                    <View style={[styles.riskBadge, { backgroundColor: riskBg }]}>
                      <Text style={[styles.riskBadgeText, { color: riskColor }]}>
                        {add.riskLevel.toUpperCase()} RISK
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.additiveTitle}>{add.name}</Text>
                  <Text style={styles.additiveCategoryText}>{add.category}</Text>

                  <View style={styles.plainEnglishBox}>
                    <Text style={styles.plainEnglishLabel}>PLAIN-ENGLISH TRANSLATION:</Text>
                    <Text style={styles.plainEnglishContent} numberOfLines={2}>
                      {add.plainEnglish}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>
      </View>

      {/* Additive Detail Modal */}
      <Modal
        visible={selectedAdditive !== null}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSelectedAdditive(null)}
      >
        <SafeAreaView style={styles.modalSafeArea}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalHeaderTitle}>FSSAI Additive Dossier</Text>
            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => setSelectedAdditive(null)}
            >
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>
          </View>

          {selectedAdditive && (
            <ScrollView contentContainerStyle={styles.modalBody}>
              <View style={styles.modalHero}>
                <View style={styles.modalInsBadge}>
                  <Text style={styles.modalInsText}>{selectedAdditive.insCode}</Text>
                </View>
                <Text style={styles.modalName}>{selectedAdditive.name}</Text>
                <Text style={styles.modalCategory}>{selectedAdditive.category}</Text>
              </View>

              <View style={styles.detailCard}>
                <Text style={styles.detailCardTitle}>🌿 Plain Consumer Explanation</Text>
                <Text style={styles.detailCardBody}>
                  {selectedAdditive.plainEnglish}
                </Text>
              </View>

              <View style={styles.detailCard}>
                <Text style={styles.detailCardTitle}>🔬 Biochemical & Food Chemistry Origin</Text>
                <Text style={styles.detailCardBody}>
                  {selectedAdditive.description}
                </Text>
                <Text style={styles.originTag}>Source Origin: {selectedAdditive.origin}</Text>
              </View>

              <View style={styles.detailCard}>
                <Text style={styles.detailCardTitle}>⚖️ FSSAI & Codex Regulatory Context</Text>
                <Text style={styles.detailCardBody}>
                  Adopted by the Food Safety and Standards Authority of India (FSSAI) under Food Safety and Standards (Labelling and Display) Regulations. Evaluated independently under international Codex Alimentarius standards.
                </Text>
              </View>
            </ScrollView>
          )}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
  },
  searchSection: {
    backgroundColor: Colors.surface,
    paddingTop: 12,
    paddingHorizontal: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceAlt,
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 46,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  clearBtn: {
    padding: 6,
  },
  clearBtnText: {
    color: Colors.textMuted,
    fontSize: 14,
    fontWeight: '700',
  },
  trieTagRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 4,
  },
  trieBadge: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: 0.5,
  },
  resultCountText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textMuted,
  },
  categoryBar: {
    backgroundColor: Colors.surface,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  categoryList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryPill: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: Colors.surfaceAlt,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoryPillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  categoryPillTextActive: {
    color: '#FFFFFF',
  },
  resultsList: {
    padding: 16,
    gap: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyIcon: {
    fontSize: 44,
    marginBottom: 10,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  emptyDesc: {
    fontSize: 13,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
  additiveCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  insTag: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  insTagText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.primary,
    fontFamily: 'monospace',
  },
  riskBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  riskBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  additiveTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  additiveCategoryText: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: '600',
    marginBottom: 8,
  },
  plainEnglishBox: {
    backgroundColor: Colors.surfaceAlt,
    borderRadius: 8,
    padding: 9,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
  },
  plainEnglishLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  plainEnglishContent: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
  modalSafeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  modalHeaderTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  modalBody: {
    padding: 16,
    gap: 14,
  },
  modalHero: {
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modalInsBadge: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
    marginBottom: 8,
  },
  modalInsText: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.primary,
    fontFamily: 'monospace',
  },
  modalName: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 4,
  },
  modalCategory: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  detailCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  detailCardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  detailCardBody: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  originTag: {
    marginTop: 8,
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },
});
