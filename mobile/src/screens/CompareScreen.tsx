import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView
} from 'react-native';
import { Colors } from '../theme/colors';
import { Product } from '../types';
import { INDIAN_PRODUCTS_CATALOG } from '../data/catalog';

interface CompareScreenProps {
  initialProductA?: Product | null;
  initialProductB?: Product | null;
  onClose: () => void;
  onInspectProduct: (product: Product) => void;
}

export const CompareScreen: React.FC<CompareScreenProps> = ({
  initialProductA,
  initialProductB,
  onClose,
  onInspectProduct
}) => {
  const [productA, setProductA] = useState<Product>(
    initialProductA || INDIAN_PRODUCTS_CATALOG[0] // Maggi Noodles
  );
  const [productB, setProductB] = useState<Product>(
    initialProductB || INDIAN_PRODUCTS_CATALOG[2] // Roasted Makhana
  );

  const calDelta = productB.calories - productA.calories;
  const sugarDelta = productB.sugars - productA.sugars;
  const sugarPct = productA.sugars > 0
    ? Math.round(((productA.sugars - productB.sugars) / productA.sugars) * 100)
    : 0;

  const sodiumDelta = productB.sodium - productA.sodium;
  const sodiumPct = productA.sodium > 0
    ? Math.round(((productA.sodium - productB.sodium) / productA.sodium) * 100)
    : 0;

  const scoreDelta = productB.healthScore - productA.healthScore;
  const additivesEliminated = Math.max(0, productA.additives.length - productB.additives.length);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <Text style={styles.headerEmoji}>⚖️</Text>
          <View>
            <Text style={styles.headerTitle}>Food Compare Arena</Text>
            <Text style={styles.headerSubtitle}>Side-by-Side Nutrition & Additive Deltas</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.closeCircle} onPress={onClose}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.contentArea} showsVerticalScrollIndicator={false}>
        {/* Comparison Cards Grid */}
        <View style={styles.cardsGrid}>
          {/* Card A */}
          <View style={styles.compareCard}>
            <View style={styles.cardTagRow}>
              <Text style={styles.cardTagA}>Item A</Text>
              <Text style={styles.novaTag}>NOVA {productA.novaGroup}</Text>
            </View>
            <View style={styles.emojiBox}>
              <Text style={styles.cardEmoji}>{productA.image}</Text>
            </View>
            <Text style={styles.brandText}>{productA.brand}</Text>
            <Text style={styles.nameText} numberOfLines={2}>{productA.name}</Text>
            <Text style={styles.scoreText}>{productA.healthScore}/100 Score</Text>
          </View>

          {/* Card B */}
          <View style={[styles.compareCard, styles.cardB]}>
            <View style={styles.cardTagRow}>
              <Text style={styles.cardTagB}>Item B</Text>
              <Text style={styles.novaTag}>NOVA {productB.novaGroup}</Text>
            </View>
            <View style={styles.emojiBox}>
              <Text style={styles.cardEmoji}>{productB.image}</Text>
            </View>
            <Text style={styles.brandText}>{productB.brand}</Text>
            <Text style={styles.nameText} numberOfLines={2}>{productB.name}</Text>
            <Text style={[styles.scoreText, { color: Colors.primaryDark }]}>
              {productB.healthScore}/100 ({scoreDelta > 0 ? `+${scoreDelta}` : scoreDelta})
            </Text>
          </View>
        </View>

        {/* Nutritional Deltas Table */}
        <View style={styles.deltasCard}>
          <Text style={styles.deltasHeader}>Nutritional & Processing Deltas</Text>

          {/* Sugars Delta */}
          <View style={styles.deltaRow}>
            <Text style={styles.deltaLabel}>Sugars</Text>
            <View style={styles.deltaValues}>
              <Text style={styles.valA}>{productA.sugars}g</Text>
              <Text style={styles.arrow}>➔</Text>
              <Text style={styles.valB}>{productB.sugars}g</Text>
              {sugarPct > 0 && (
                <View style={styles.pctBadge}>
                  <Text style={styles.pctText}>−{sugarPct}%</Text>
                </View>
              )}
            </View>
          </View>

          {/* Sodium Delta */}
          <View style={styles.deltaRow}>
            <Text style={styles.deltaLabel}>Sodium</Text>
            <View style={styles.deltaValues}>
              <Text style={styles.valA}>{productA.sodium}mg</Text>
              <Text style={styles.arrow}>➔</Text>
              <Text style={styles.valB}>{productB.sodium}mg</Text>
              {sodiumPct > 0 && (
                <View style={styles.pctBadge}>
                  <Text style={styles.pctText}>−{sodiumPct}%</Text>
                </View>
              )}
            </View>
          </View>

          {/* Calories Delta */}
          <View style={styles.deltaRow}>
            <Text style={styles.deltaLabel}>Energy</Text>
            <View style={styles.deltaValues}>
              <Text style={styles.valA}>{productA.calories} kcal</Text>
              <Text style={styles.arrow}>➔</Text>
              <Text style={styles.valB}>{productB.calories} kcal</Text>
              <View style={styles.subtleBadge}>
                <Text style={styles.subtleBadgeText}>{calDelta > 0 ? `+${calDelta}` : calDelta} kcal</Text>
              </View>
            </View>
          </View>

          {/* Additives Delta */}
          <View style={styles.deltaRow}>
            <Text style={styles.deltaLabel}>FSSAI Chemicals</Text>
            <View style={styles.deltaValues}>
              <Text style={styles.valA}>{productA.additives.length}</Text>
              <Text style={styles.arrow}>➔</Text>
              <Text style={styles.valB}>{productB.additives.length}</Text>
              {additivesEliminated > 0 && (
                <View style={styles.pctBadge}>
                  <Text style={styles.pctText}>−{additivesEliminated} Removed</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Quick Item Selectors */}
        <View style={styles.selectorSection}>
          <Text style={styles.selectorTitle}>Select Comparison Item A:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.selectorScroll}>
            {INDIAN_PRODUCTS_CATALOG.map(p => (
              <TouchableOpacity
                key={'A_' + p.barcode}
                style={[styles.selectorChip, productA.barcode === p.barcode && styles.selectorChipActive]}
                onPress={() => setProductA(p)}
              >
                <Text style={styles.selectorChipText}>{p.image} {p.name.split(' ')[0]}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={[styles.selectorTitle, { marginTop: 12 }]}>Select Comparison Item B:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.selectorScroll}>
            {INDIAN_PRODUCTS_CATALOG.map(p => (
              <TouchableOpacity
                key={'B_' + p.barcode}
                style={[styles.selectorChip, productB.barcode === p.barcode && styles.selectorChipActive]}
                onPress={() => setProductB(p)}
              >
                <Text style={styles.selectorChipText}>{p.image} {p.name.split(' ')[0]}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  headerEmoji: {
    fontSize: 22
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textMain
  },
  headerSubtitle: {
    fontSize: 10,
    color: Colors.textMuted
  },
  closeCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.surfaceSubtle,
    justifyContent: 'center',
    alignItems: 'center'
  },
  closeText: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: '700'
  },
  contentArea: {
    padding: 14
  },
  cardsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12
  },
  compareCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border
  },
  cardB: {
    borderColor: Colors.primary,
    borderWidth: 2
  },
  cardTagRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6
  },
  cardTagA: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.textMuted,
    textTransform: 'uppercase'
  },
  cardTagB: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.primaryDark,
    textTransform: 'uppercase'
  },
  novaTag: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.textLight
  },
  emojiBox: {
    height: 54,
    backgroundColor: Colors.surfaceSubtle,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6
  },
  cardEmoji: {
    fontSize: 28
  },
  brandText: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.textLight,
    textTransform: 'uppercase'
  },
  nameText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textMain,
    height: 30
  },
  scoreText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.textMain,
    marginTop: 6
  },
  deltasCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border
  },
  deltasHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.textMain,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10
  },
  deltaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight
  },
  deltaLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textMuted
  },
  deltaValues: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  valA: {
    fontSize: 11,
    color: Colors.textLight,
    textDecorationLine: 'line-through'
  },
  arrow: {
    fontSize: 10,
    color: Colors.textLight
  },
  valB: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.textMain
  },
  pctBadge: {
    backgroundColor: Colors.successBg,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4
  },
  pctText: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.success
  },
  subtleBadge: {
    backgroundColor: Colors.surfaceSubtle,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4
  },
  subtleBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.textMuted
  },
  selectorSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.border
  },
  selectorTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textMain,
    marginBottom: 6
  },
  selectorScroll: {
    gap: 6
  },
  selectorChip: {
    backgroundColor: Colors.surfaceSubtle,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border
  },
  selectorChipActive: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary
  },
  selectorChipText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textMain
  }
});
