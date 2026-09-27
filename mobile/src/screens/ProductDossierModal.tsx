import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  SafeAreaView
} from 'react-native';
import { Colors } from '../theme/colors';
import { Product, DietaryComplianceResult } from '../types';

interface ProductDossierModalProps {
  visible: boolean;
  product: Product | null;
  dietaryCompliance: DietaryComplianceResult;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onClose: () => void;
  onLogToBudget: (product: Product) => void;
  onCompareCleanSwap: (product: Product) => void;
  onInspectSwap: (barcode: string) => void;
}

export const ProductDossierModal: React.FC<ProductDossierModalProps> = ({
  visible,
  product,
  dietaryCompliance,
  isFavorite,
  onToggleFavorite,
  onClose,
  onLogToBudget,
  onCompareCleanSwap,
  onInspectSwap
}) => {
  if (!product) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheetContainer}>
          {/* Top Drag Bar & Close */}
          <View style={styles.sheetHeader}>
            <View style={styles.dragPill} />
            <View style={styles.headerTitleRow}>
              <View style={styles.statusDot} />
              <Text style={styles.headerTitle}>Scanned Product Dossier</Text>
            </View>
            <TouchableOpacity style={styles.closeCircle} onPress={onClose}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
            {/* Identity Card */}
            <View style={styles.identityCard}>
              <View style={styles.productEmojiBox}>
                <Text style={styles.identityEmoji}>{product.image}</Text>
              </View>
              <View style={styles.identityTextContainer}>
                <Text style={styles.brandText}>{product.brand}</Text>
                <Text style={styles.nameText}>{product.name}</Text>
                <View style={styles.specsRow}>
                  <Text style={styles.sizeText}>{product.size}</Text>
                  <Text style={styles.dotSeparator}>•</Text>
                  <Text style={styles.eanText}>EAN {product.barcode}</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.favoriteButton} onPress={onToggleFavorite}>
                <Text style={styles.favoriteEmoji}>{isFavorite ? '⭐' : '☆'}</Text>
              </TouchableOpacity>
            </View>

            {/* Personalized Dietary Guardrails Alert */}
            {dietaryCompliance.activeRuleCount > 0 && (
              <View
                style={[
                  styles.dietaryBanner,
                  dietaryCompliance.status === 'VIOLATION' && styles.dietaryBannerViolation,
                  dietaryCompliance.status === 'WARNING' && styles.dietaryBannerWarning,
                  dietaryCompliance.status === 'PASS' && styles.dietaryBannerPass
                ]}
              >
                <View style={styles.dietaryHeader}>
                  <Text style={styles.dietaryEmoji}>
                    {dietaryCompliance.status === 'VIOLATION' ? '🚨' : dietaryCompliance.status === 'WARNING' ? '⚠️' : '🌿'}
                  </Text>
                  <Text style={styles.dietaryTitle}>
                    {dietaryCompliance.status === 'VIOLATION'
                      ? `Dietary Guardrail Alert (${dietaryCompliance.violations.length} Flagged)`
                      : dietaryCompliance.status === 'WARNING'
                      ? `Dietary Guardrail Warning (${dietaryCompliance.warnings.length} Note)`
                      : '100% Dietary Guardrail Compliant'}
                  </Text>
                </View>

                {dietaryCompliance.violations.map((v, i) => (
                  <View key={i} style={styles.violationItem}>
                    <Text style={styles.violationTitle}>⛔ {v.title}</Text>
                    <Text style={styles.violationDetail}>{v.detail}</Text>
                  </View>
                ))}

                {dietaryCompliance.warnings.map((w, i) => (
                  <View key={i} style={styles.warningItem}>
                    <Text style={styles.warningTitle}>⚠️ {w.title}</Text>
                    <Text style={styles.warningDetail}>{w.detail}</Text>
                  </View>
                ))}

                {dietaryCompliance.status === 'PASS' && (
                  <Text style={styles.passDetail}>
                    Passed verification for: {dietaryCompliance.passes.join(', ')}. Zero flagged additives.
                  </Text>
                )}
              </View>
            )}

            {/* NOVA & BiteLens Score Gauges */}
            <View style={styles.gaugesRow}>
              <View style={[styles.gaugeCard, { backgroundColor: product.novaBg }]}>
                <Text style={[styles.gaugeTag, { color: product.novaColor }]}>NOVA CLASSIFICATION</Text>
                <Text style={[styles.gaugeMain, { color: product.novaColor }]}>Tier {product.novaGroup}</Text>
                <Text style={[styles.gaugeSubtitle, { color: product.novaColor }]}>{product.novaLabel}</Text>
              </View>

              <View style={[styles.gaugeCard, styles.scoreCard]}>
                <Text style={styles.gaugeTagMuted}>BITELENS SCORE</Text>
                <Text style={styles.scoreMain}>
                  {product.healthScore}
                  <Text style={styles.scoreDenominator}>/100</Text>
                </Text>
                <Text style={styles.goalFitText}>{product.goalFit}</Text>
              </View>
            </View>

            {/* Summary */}
            <View style={styles.summaryCard}>
              <Text style={styles.summaryText}>
                <Text style={styles.summaryBold}>Food Summary: </Text>
                {product.summary}
              </Text>
            </View>

            {/* Macronutrients Telemetry Table */}
            <View style={styles.macroCard}>
              <Text style={styles.sectionTitle}>Macronutrients (per {product.servingSize})</Text>
              <View style={styles.macroGrid}>
                <View style={styles.macroCell}>
                  <Text style={styles.macroLabel}>Energy</Text>
                  <Text style={styles.macroValue}>{product.calories}</Text>
                  <Text style={styles.macroUnit}>kcal</Text>
                </View>
                <View style={styles.macroCell}>
                  <Text style={styles.macroLabel}>Protein</Text>
                  <Text style={[styles.macroValue, { color: Colors.primary }]}>{product.protein}g</Text>
                  <Text style={styles.macroUnit}>{Math.round(product.protein * 4)} kcal</Text>
                </View>
                <View style={styles.macroCell}>
                  <Text style={styles.macroLabel}>Sugars</Text>
                  <Text style={[styles.macroValue, product.sugars > 10 && styles.macroDanger]}>
                    {product.sugars}g
                  </Text>
                  <Text style={styles.macroUnit}>{product.sugars > 10 ? 'High' : 'Safe'}</Text>
                </View>
                <View style={styles.macroCell}>
                  <Text style={styles.macroLabel}>Sodium</Text>
                  <Text style={[styles.macroValue, product.sodium > 600 && styles.macroDanger]}>
                    {product.sodium}mg
                  </Text>
                  <Text style={styles.macroUnit}>{product.sodium > 600 ? 'High' : 'Safe'}</Text>
                </View>
              </View>
            </View>

            {/* FSSAI Additives Breakdown */}
            <View style={styles.additivesSection}>
              <View style={styles.additivesHeaderRow}>
                <Text style={styles.sectionTitle}>FSSAI Chemical Dossier</Text>
                <Text style={styles.additiveCountBadge}>{product.additives.length} Detected</Text>
              </View>

              {product.additives.map((a, i) => (
                <View key={i} style={styles.additiveCard}>
                  <View style={styles.additiveHeader}>
                    <Text style={styles.additiveCode}>{a.code}</Text>
                    <View
                      style={[
                        styles.statusPill,
                        a.status === 'Clean' && styles.statusClean,
                        a.status === 'Watchlist' && styles.statusWatchlist,
                        a.status === 'Ultra-Processed' && styles.statusUltra
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          a.status === 'Clean' && styles.statusTextClean,
                          a.status === 'Watchlist' && styles.statusTextWatchlist,
                          a.status === 'Ultra-Processed' && styles.statusTextUltra
                        ]}
                      >
                        {a.status}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.additiveName}>
                    {a.name} <Text style={styles.additivePurpose}>({a.purpose})</Text>
                  </Text>
                  <Text style={styles.additiveNote}>{a.note}</Text>
                </View>
              ))}
            </View>

            {/* Clean Swap Recommendation */}
            {product.swaps && (
              <View style={styles.swapCard}>
                <View style={styles.swapHeaderRow}>
                  <Text style={styles.swapHeaderTitle}>⚡ Clean Swap Recommendation</Text>
                  <View style={styles.recommendedBadge}>
                    <Text style={styles.recommendedBadgeText}>RECOMMENDED</Text>
                  </View>
                </View>
                <Text style={styles.swapReason}>{product.swaps.reason}</Text>

                <View style={styles.swapActionsRow}>
                  <TouchableOpacity
                    style={styles.swapCompareButton}
                    onPress={() => onCompareCleanSwap(product)}
                  >
                    <Text style={styles.swapCompareText}>Compare Side-by-Side ⚖️</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.swapInspectButton}
                    onPress={() => onInspectSwap(product.swaps!.recommendedBarcode)}
                  >
                    <Text style={styles.swapInspectText}>Inspect ➔</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </ScrollView>

          {/* Sticky Bottom Actions inside Dossier */}
          <SafeAreaView style={styles.footerDeck}>
            <TouchableOpacity style={styles.logButton} onPress={() => onLogToBudget(product)}>
              <Text style={styles.logButtonText}>+ Log to Daily Snack Budget</Text>
            </TouchableOpacity>
          </SafeAreaView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end'
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '90%',
    paddingBottom: 10
  },
  sheetHeader: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative'
  },
  dragPill: {
    position: 'absolute',
    top: 6,
    left: '50%',
    width: 36,
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 99,
    transform: [{ translateX: -18 }]
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.success
  },
  headerTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textMain
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
  scrollArea: {
    paddingHorizontal: 16,
    paddingVertical: 12
  },
  identityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },
  productEmojiBox: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: Colors.surfaceSubtle,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: Colors.borderLight
  },
  identityEmoji: {
    fontSize: 32
  },
  identityTextContainer: {
    flex: 1
  },
  brandText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textLight,
    textTransform: 'uppercase'
  },
  nameText: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textMain,
    lineHeight: 18
  },
  specsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2
  },
  sizeText: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '500'
  },
  dotSeparator: {
    color: Colors.border
  },
  eanText: {
    fontSize: 11,
    color: Colors.primaryDark,
    fontWeight: '700'
  },
  favoriteButton: {
    padding: 6
  },
  favoriteEmoji: {
    fontSize: 22
  },
  dietaryBanner: {
    borderRadius: 14,
    padding: 10,
    marginBottom: 12,
    borderWidth: 1
  },
  dietaryBannerViolation: {
    backgroundColor: Colors.dangerBg,
    borderColor: '#FECACA'
  },
  dietaryBannerWarning: {
    backgroundColor: Colors.warningBg,
    borderColor: '#FDE68A'
  },
  dietaryBannerPass: {
    backgroundColor: Colors.primaryLight,
    borderColor: '#C8E6C9'
  },
  dietaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4
  },
  dietaryEmoji: {
    fontSize: 14
  },
  dietaryTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.textMain
  },
  violationItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 6,
    marginTop: 4
  },
  violationTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.danger
  },
  violationDetail: {
    fontSize: 9,
    color: Colors.danger,
    marginTop: 1
  },
  warningItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 6,
    marginTop: 4
  },
  warningTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.warning
  },
  warningDetail: {
    fontSize: 9,
    color: Colors.warning,
    marginTop: 1
  },
  passDetail: {
    fontSize: 10,
    color: Colors.primaryDark,
    fontWeight: '500'
  },
  gaugesRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12
  },
  gaugeCard: {
    flex: 1,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.borderLight
  },
  scoreCard: {
    backgroundColor: Colors.surfaceSubtle,
    borderColor: Colors.border
  },
  gaugeTag: {
    fontSize: 9,
    fontWeight: '800',
    textTransform: 'uppercase'
  },
  gaugeTagMuted: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.textLight
  },
  gaugeMain: {
    fontSize: 18,
    fontWeight: '800',
    marginTop: 2
  },
  gaugeSubtitle: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 1
  },
  scoreMain: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.primaryDark,
    marginTop: 2
  },
  scoreDenominator: {
    fontSize: 12,
    fontWeight: '400',
    color: Colors.textMuted
  },
  goalFitText: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.primaryDark,
    marginTop: 1
  },
  summaryCard: {
    backgroundColor: Colors.primaryLight,
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#C8E6C9'
  },
  summaryText: {
    fontSize: 11,
    color: Colors.textMain,
    lineHeight: 16
  },
  summaryBold: {
    fontWeight: '800',
    color: Colors.primaryDark
  },
  macroCard: {
    backgroundColor: Colors.surfaceSubtle,
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.textMain,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8
  },
  macroGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6
  },
  macroCell: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.borderLight
  },
  macroLabel: {
    fontSize: 9,
    color: Colors.textLight,
    fontWeight: '600'
  },
  macroValue: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textMain,
    marginTop: 2
  },
  macroUnit: {
    fontSize: 8,
    color: Colors.textMuted
  },
  macroDanger: {
    color: Colors.danger
  },
  additivesSection: {
    marginBottom: 12
  },
  additivesHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6
  },
  additiveCountBadge: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.primary
  },
  additiveCard: {
    backgroundColor: Colors.surfaceSubtle,
    borderRadius: 12,
    padding: 10,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: Colors.border
  },
  additiveHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2
  },
  additiveCode: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.primaryDark
  },
  statusPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4
  },
  statusClean: { backgroundColor: Colors.successBg },
  statusWatchlist: { backgroundColor: Colors.warningBg },
  statusUltra: { backgroundColor: Colors.dangerBg },
  statusText: { fontSize: 8, fontWeight: '800' },
  statusTextClean: { color: Colors.success },
  statusTextWatchlist: { color: Colors.warning },
  statusTextUltra: { color: Colors.danger },
  additiveName: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textMain
  },
  additivePurpose: {
    fontSize: 10,
    fontWeight: '400',
    color: Colors.textMuted
  },
  additiveNote: {
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 2
  },
  swapCard: {
    backgroundColor: '#ECFDF5',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    marginBottom: 16
  },
  swapHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4
  },
  swapHeaderTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.primaryDark
  },
  recommendedBadge: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 99
  },
  recommendedBadgeText: {
    fontSize: 8,
    fontWeight: '800',
    color: Colors.primaryDark
  },
  swapReason: {
    fontSize: 10,
    color: Colors.textMain,
    lineHeight: 14,
    marginBottom: 8
  },
  swapActionsRow: {
    flexDirection: 'row',
    gap: 8
  },
  swapCompareButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: 'center'
  },
  swapCompareText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700'
  },
  swapInspectButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'center'
  },
  swapInspectText: {
    color: Colors.primary,
    fontSize: 11,
    fontWeight: '700'
  },
  footerDeck: {
    paddingHorizontal: 16,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    backgroundColor: '#FFFFFF'
  },
  logButton: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center'
  },
  logButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800'
  }
});
