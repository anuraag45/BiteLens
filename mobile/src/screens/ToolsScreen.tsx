import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { Colors } from '../theme/colors';
import { CURATED_PRODUCTS } from '../data/curated-products';
import { Product } from '../types';
import { ScoreGauge } from '../components/ScoreGauge';
import { HeaderHUD } from '../components/HeaderHUD';

type ToolTab = 'compare' | 'budget';

export const ToolsScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ToolTab>('compare');

  // --- Comparison Arena State ---
  const [prodAIndex, setProdAIndex] = useState(0); // Makhana (Default Healthy)
  const [prodBIndex, setProdBIndex] = useState(1); // Noodles (Default UPF)

  const prodA: Product = CURATED_PRODUCTS[prodAIndex] || CURATED_PRODUCTS[0];
  const prodB: Product = CURATED_PRODUCTS[prodBIndex] || CURATED_PRODUCTS[1];

  // --- Snack Budget State ---
  const [selectedSnackIds, setSelectedSnackIds] = useState<string[]>([
    'prod-noodles',
    'prod-chips',
  ]);

  function toggleSnack(id: string) {
    if (selectedSnackIds.includes(id)) {
      setSelectedSnackIds(selectedSnackIds.filter(s => s !== id));
    } else {
      setSelectedSnackIds([...selectedSnackIds, id]);
    }
  }

  // Calculate accumulated budget totals
  const consumedSnacks = CURATED_PRODUCTS.filter(p => selectedSnackIds.includes(p.id));
  const totalCalories = consumedSnacks.reduce((sum, p) => sum + p.nutrients.calories, 0);
  const totalSodium = consumedSnacks.reduce((sum, p) => sum + p.nutrients.sodium, 0);
  const totalAddedSugar = consumedSnacks.reduce((sum, p) => sum + p.nutrients.addedSugar, 0);

  const caloriePercent = Math.min(Math.round((totalCalories / 2000) * 100), 100);
  const sodiumPercent = Math.min(Math.round((totalSodium / 2000) * 100), 150);
  const sugarPercent = Math.min(Math.round((totalAddedSugar / 25) * 100), 200);

  return (
    <SafeAreaView style={styles.safeArea}>
      <HeaderHUD title="Nutritional Tools" />

      {/* Segmented Control Switch */}
      <View style={styles.segmentedContainer}>
        <TouchableOpacity
          style={[styles.segmentBtn, activeTab === 'compare' && styles.segmentBtnActive]}
          onPress={() => setActiveTab('compare')}
          activeOpacity={0.8}
        >
          <Text style={[styles.segmentBtnText, activeTab === 'compare' && styles.segmentBtnTextActive]}>
            ⚖️ Food Comparison
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.segmentBtn, activeTab === 'budget' && styles.segmentBtnActive]}
          onPress={() => setActiveTab('budget')}
          activeOpacity={0.8}
        >
          <Text style={[styles.segmentBtnText, activeTab === 'budget' && styles.segmentBtnTextActive]}>
            🍩 Snack Budget
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {activeTab === 'compare' ? (
          /* ======================================================== */
          /* 1. FOOD COMPARISON ARENA                                  */
          /* ======================================================== */
          <View style={styles.compareContainer}>
            <Text style={styles.sectionSubtitle}>
              Compare two Indian packaged foods side-by-side to expose hidden ultra-processed additives and goal alignment.
            </Text>

            {/* Presets Chips Selector */}
            <View style={styles.quickCompareBar}>
              <Text style={styles.quickCompareTitle}>Quick Compare Pairs:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                <TouchableOpacity
                  style={styles.pairChip}
                  onPress={() => {
                    setProdAIndex(0); // Makhana
                    setProdBIndex(1); // Maggi
                  }}
                >
                  <Text style={styles.pairChipText}>🫘 Makhana vs 🍜 Noodles</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.pairChip}
                  onPress={() => {
                    setProdAIndex(5); // Amul Milk
                    setProdBIndex(7); // Diet Cola
                  }}
                >
                  <Text style={styles.pairChipText}>🥛 Milk vs 🥤 Diet Cola</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.pairChip}
                  onPress={() => {
                    setProdAIndex(3); // Greek Yogurt
                    setProdBIndex(4); // Protein Bar
                  }}
                >
                  <Text style={styles.pairChipText}>🍓 Yogurt vs 🍫 Protein Bar</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>

            {/* Side-by-Side Cards Grid */}
            <View style={styles.arenaGrid}>
              {/* Product A */}
              <View style={[styles.arenaCard, { borderTopColor: Colors.primary }]}>
                <Text style={styles.arenaCardTag}>PRODUCT A</Text>
                <Text style={styles.arenaBrand}>{prodA.brand}</Text>
                <Text style={styles.arenaName} numberOfLines={2}>{prodA.name}</Text>
                <ScoreGauge score={prodA.healthScore} novaGroup={prodA.novaGroup} size="small" />

                <View style={styles.metricRow}>
                  <Text style={styles.metricLabel}>Calories</Text>
                  <Text style={styles.metricVal}>{prodA.nutrients.calories} kcal</Text>
                </View>
                <View style={styles.metricRow}>
                  <Text style={styles.metricLabel}>Added Sugar</Text>
                  <Text style={styles.metricVal}>{prodA.nutrients.addedSugar}g</Text>
                </View>
                <View style={styles.metricRow}>
                  <Text style={styles.metricLabel}>Sodium</Text>
                  <Text style={styles.metricVal}>{prodA.nutrients.sodium}mg</Text>
                </View>
                <View style={styles.metricRow}>
                  <Text style={styles.metricLabel}>Additives</Text>
                  <Text style={styles.metricVal}>{prodA.detectedAdditives.length} flagged</Text>
                </View>
              </View>

              {/* Product B */}
              <View style={[styles.arenaCard, { borderTopColor: Colors.danger }]}>
                <Text style={[styles.arenaCardTag, { color: Colors.danger }]}>PRODUCT B</Text>
                <Text style={styles.arenaBrand}>{prodB.brand}</Text>
                <Text style={styles.arenaName} numberOfLines={2}>{prodB.name}</Text>
                <ScoreGauge score={prodB.healthScore} novaGroup={prodB.novaGroup} size="small" />

                <View style={styles.metricRow}>
                  <Text style={styles.metricLabel}>Calories</Text>
                  <Text style={styles.metricVal}>{prodB.nutrients.calories} kcal</Text>
                </View>
                <View style={styles.metricRow}>
                  <Text style={styles.metricLabel}>Added Sugar</Text>
                  <Text style={styles.metricVal}>{prodB.nutrients.addedSugar}g</Text>
                </View>
                <View style={styles.metricRow}>
                  <Text style={styles.metricLabel}>Sodium</Text>
                  <Text style={styles.metricVal}>{prodB.nutrients.sodium}mg</Text>
                </View>
                <View style={styles.metricRow}>
                  <Text style={styles.metricLabel}>Additives</Text>
                  <Text style={styles.metricVal}>{prodB.detectedAdditives.length} flagged</Text>
                </View>
              </View>
            </View>

            {/* BiteLens Decision Recommendation */}
            <View style={styles.recommendationCard}>
              <Text style={styles.recommendationHeader}>💡 BiteLens Recommendation</Text>
              <Text style={styles.recommendationText}>
                {prodA.healthScore > prodB.healthScore
                  ? `Choose ${prodA.name} (${prodA.brand}). It has a significantly higher Health Score (${prodA.healthScore}/100 vs ${prodB.healthScore}/100) and lower industrial processing (NOVA ${prodA.novaGroup} vs NOVA ${prodB.novaGroup}).`
                  : `Choose ${prodB.name} (${prodB.brand}). It has lower synthetic processing and higher whole food nutrient density.`}
              </Text>
            </View>
          </View>
        ) : (
          /* ======================================================== */
          /* 2. PACKAGED SNACK BUDGET SIMULATOR                        */
          /* ======================================================== */
          <View style={styles.budgetContainer}>
            <Text style={styles.sectionSubtitle}>
              Track your daily cumulative intake of hidden ultra-processed snack calories, sodium (FSSAI 2000mg limit), and added sugars (WHO 25g limit).
            </Text>

            {/* Daily Nutrient Meters */}
            <View style={styles.meterCard}>
              {/* Calories */}
              <View style={styles.meterItem}>
                <View style={styles.meterHeader}>
                  <Text style={styles.meterName}>Daily Snack Calories</Text>
                  <Text style={styles.meterValues}>
                    {totalCalories} / 2,000 kcal ({caloriePercent}%)
                  </Text>
                </View>
                <View style={styles.progressBarBg}>
                  <View
                    style={[
                      styles.progressBarFill,
                      {
                        width: `${caloriePercent}%`,
                        backgroundColor: caloriePercent > 50 ? Colors.warning : Colors.primary,
                      },
                    ]}
                  />
                </View>
              </View>

              {/* Sodium (FSSAI Limit: 2,000mg) */}
              <View style={styles.meterItem}>
                <View style={styles.meterHeader}>
                  <Text style={styles.meterName}>Sodium (FSSAI Limit)</Text>
                  <Text
                    style={[
                      styles.meterValues,
                      totalSodium > 2000 && { color: Colors.danger, fontWeight: '800' },
                    ]}
                  >
                    {totalSodium} / 2,000 mg ({Math.round((totalSodium / 2000) * 100)}%)
                  </Text>
                </View>
                <View style={styles.progressBarBg}>
                  <View
                    style={[
                      styles.progressBarFill,
                      {
                        width: `${Math.min(sodiumPercent, 100)}%`,
                        backgroundColor: totalSodium > 1500 ? Colors.danger : Colors.warning,
                      },
                    ]}
                  />
                </View>
              </View>

              {/* Added Sugar (WHO Limit: 25g) */}
              <View style={styles.meterItem}>
                <View style={styles.meterHeader}>
                  <Text style={styles.meterName}>Added Free Sugar (WHO Limit)</Text>
                  <Text
                    style={[
                      styles.meterValues,
                      totalAddedSugar > 25 && { color: Colors.danger, fontWeight: '800' },
                    ]}
                  >
                    {totalAddedSugar.toFixed(1)} / 25.0 g ({Math.round((totalAddedSugar / 25) * 100)}%)
                  </Text>
                </View>
                <View style={styles.progressBarBg}>
                  <View
                    style={[
                      styles.progressBarFill,
                      {
                        width: `${Math.min(sugarPercent, 100)}%`,
                        backgroundColor: totalAddedSugar > 25 ? Colors.danger : Colors.secondary,
                      },
                    ]}
                  />
                </View>
              </View>
            </View>

            {/* Threshold Alerts */}
            {totalAddedSugar > 25 && (
              <View style={styles.budgetAlert}>
                <Text style={styles.budgetAlertText}>
                  ⚠️ WHO 25g daily added sugar threshold exceeded ({totalAddedSugar.toFixed(1)}g)!
                </Text>
              </View>
            )}

            {totalSodium > 1500 && (
              <View style={[styles.budgetAlert, { backgroundColor: Colors.warningLight, borderColor: Colors.warning }]}>
                <Text style={[styles.budgetAlertText, { color: Colors.warning }]}>
                  ⚠️ Approaching FSSAI 2,000mg sodium threshold ({totalSodium}mg logged)!
                </Text>
              </View>
            )}

            {/* Snack Selector List */}
            <Text style={styles.snackListTitle}>Select Snacks Consumed Today:</Text>
            <View style={styles.snackItemsList}>
              {CURATED_PRODUCTS.map(prod => {
                const isSelected = selectedSnackIds.includes(prod.id);
                return (
                  <TouchableOpacity
                    key={prod.id}
                    style={[styles.snackPickItem, isSelected && styles.snackPickItemSelected]}
                    onPress={() => toggleSnack(prod.id)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.snackPickCheckbox}>
                      <Text style={{ fontSize: 13, color: isSelected ? Colors.primary : Colors.textLight }}>
                        {isSelected ? '✓' : '○'}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.snackPickName}>{prod.name}</Text>
                      <Text style={styles.snackPickSub}>
                        {prod.nutrients.calories} kcal • {prod.nutrients.sodium}mg sodium • {prod.nutrients.addedSugar}g sugar
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  segmentedContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    padding: 8,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    borderRadius: 10,
  },
  segmentBtnActive: {
    backgroundColor: Colors.primary,
  },
  segmentBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  segmentBtnTextActive: {
    color: '#FFFFFF',
  },
  scrollContent: {
    padding: 16,
  },
  compareContainer: {
    gap: 14,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: Colors.textMuted,
    lineHeight: 18,
    marginBottom: 4,
  },
  quickCompareBar: {
    backgroundColor: Colors.surface,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  quickCompareTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  pairChip: {
    backgroundColor: Colors.surfaceAlt,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  pairChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  arenaGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  arenaCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    borderTopWidth: 4,
  },
  arenaCardTag: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  arenaBrand: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textMuted,
  },
  arenaName: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textPrimary,
    lineHeight: 16,
    marginBottom: 8,
    minHeight: 32,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderSubtle,
  },
  metricLabel: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  metricVal: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  recommendationCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(59, 122, 87, 0.3)',
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  recommendationHeader: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.primary,
    marginBottom: 4,
  },
  recommendationText: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  budgetContainer: {
    gap: 14,
  },
  meterCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 14,
  },
  meterItem: {
    gap: 6,
  },
  meterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  meterName: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  meterValues: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textMuted,
  },
  progressBarBg: {
    height: 9,
    backgroundColor: Colors.surfaceAlt,
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 5,
  },
  budgetAlert: {
    backgroundColor: Colors.dangerLight,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(225, 29, 72, 0.3)',
  },
  budgetAlertText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.danger,
    lineHeight: 16,
  },
  snackListTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginTop: 6,
  },
  snackItemsList: {
    gap: 8,
  },
  snackPickItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 10,
  },
  snackPickItemSelected: {
    borderColor: Colors.primary,
    backgroundColor: 'rgba(59, 122, 87, 0.05)',
  },
  snackPickCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  snackPickName: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  snackPickSub: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
});
