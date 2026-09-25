import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Product, UserPreferences } from '../types';
import { Colors } from '../theme/colors';
import { ScoreGauge } from './ScoreGauge';

interface ProductCardProps {
  product: Product;
  userPreferences?: UserPreferences;
  onPress?: () => void;
  compact?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  userPreferences,
  onPress,
  compact = false,
}) => {
  // Check if any product allergens match user preferences
  const activeAllergenWarnings = (product.allergens || []).filter(a =>
    (userPreferences?.allergens || []).includes(a)
  );

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.88}
      disabled={!onPress}
    >
      {/* Top Header: Brand, Title, Category */}
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.brandText}>{product.brand}</Text>
          <Text style={styles.titleText} numberOfLines={2}>
            {product.name}
          </Text>
          <Text style={styles.categoryText}>{product.category}</Text>
        </View>
        <Text style={styles.barcodeTag}>#{product.barcode.slice(-5)}</Text>
      </View>

      {/* Allergen Warning Banner if triggered */}
      {activeAllergenWarnings.length > 0 && (
        <View style={styles.allergenAlert}>
          <Text style={styles.allergenAlertIcon}>⚠️</Text>
          <Text style={styles.allergenAlertText}>
            Contains Allergen: {activeAllergenWarnings.join(', ').toUpperCase()}
          </Text>
        </View>
      )}

      {/* Dual Scores Row */}
      <View style={styles.scoresRow}>
        <ScoreGauge
          score={product.healthScore}
          label="Health Score"
          novaGroup={product.novaGroup}
          size={compact ? 'small' : 'medium'}
        />
        <ScoreGauge
          score={product.goalFit.weightLossScore}
          label="Goal Fit"
          size={compact ? 'small' : 'medium'}
        />
      </View>

      {/* Nutrients Strip */}
      <View style={styles.nutrientsGrid}>
        <View style={styles.nutrientItem}>
          <Text style={styles.nutrientVal}>{product.nutrients.calories}</Text>
          <Text style={styles.nutrientLbl}>Calories</Text>
        </View>
        <View style={styles.nutrientItem}>
          <Text style={styles.nutrientVal}>{product.nutrients.protein}g</Text>
          <Text style={styles.nutrientLbl}>Protein</Text>
        </View>
        <View style={styles.nutrientItem}>
          <Text style={styles.nutrientVal}>{product.nutrients.addedSugar}g</Text>
          <Text style={styles.nutrientLbl}>Added Sugar</Text>
        </View>
        <View style={styles.nutrientItem}>
          <Text style={styles.nutrientVal}>{product.nutrients.sodium}mg</Text>
          <Text style={styles.nutrientLbl}>Sodium</Text>
        </View>
      </View>

      {/* Additives Count Footer */}
      {!compact && (
        <View style={styles.footerRow}>
          <Text style={styles.additiveSummaryText}>
            {product.detectedAdditives.length === 0
              ? '🌿 Clean Label: Zero Synthetic INS Additives'
              : `🧪 ${product.detectedAdditives.length} FSSAI Additives Detected (${product.detectedAdditives.map(a => a.insCode).join(', ')})`}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  brandText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  titleText: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
    lineHeight: 20,
    marginBottom: 3,
  },
  categoryText: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  barcodeTag: {
    fontSize: 10,
    fontWeight: '700',
    backgroundColor: Colors.surfaceAlt,
    color: Colors.textMuted,
    paddingVertical: 3,
    paddingHorizontal: 7,
    borderRadius: 6,
    fontFamily: 'monospace',
  },
  allergenAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dangerLight,
    borderColor: 'rgba(225, 29, 72, 0.3)',
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginBottom: 12,
    gap: 6,
  },
  allergenAlertIcon: {
    fontSize: 13,
  },
  allergenAlertText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.danger,
    letterSpacing: 0.2,
  },
  scoresRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 14,
    gap: 10,
  },
  nutrientsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: Colors.surfaceAlt,
    borderRadius: 12,
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  nutrientItem: {
    alignItems: 'center',
  },
  nutrientVal: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  nutrientLbl: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.textMuted,
    marginTop: 1,
  },
  footerRow: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.borderSubtle,
  },
  additiveSummaryText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
});
