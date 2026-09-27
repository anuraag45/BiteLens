import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform
} from 'react-native';
import { Colors } from '../theme/colors';
import { Product } from '../types';
import { INDIAN_PRODUCTS_CATALOG } from '../data/catalog';

interface HomeScreenProps {
  onOpenScanner: () => void;
  onSelectProduct: (product: Product) => void;
  onOpenTool: (tool: 'decoder' | 'budget' | 'calculators' | 'compare' | 'profile' | 'dietary') => void;
  activeGuardrailCount: number;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onOpenScanner,
  onSelectProduct,
  onOpenTool,
  activeGuardrailCount
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', label: '✨ All Items' },
    { id: 'Snacks', label: '🫘 Healthy Snacks' },
    { id: 'Breakfast', label: '🥣 Oats & Cereals' },
    { id: 'Dairy', label: '🍓 Dairy & Yogurts' },
    { id: 'Instant', label: '🍜 Ready Meals' },
    { id: 'Fitness', label: '🍫 Protein Bars' },
    { id: 'Beverages', label: '🥤 Beverages' }
  ];

  const filteredProducts = INDIAN_PRODUCTS_CATALOG.filter(p => {
    const matchesCat = selectedCategory === 'all' || p.category === selectedCategory;
    const matchesSearch =
      searchQuery.trim() === '' ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.additives.some(a => a.code.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Top Blinkit-Style Brand & Speed Header */}
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <View>
            <View style={styles.brandRow}>
              <Text style={styles.brandTitle}>BiteLens</Text>
              <View style={styles.speedBadge}>
                <Text style={styles.speedBadgeText}>⚡ 10s SCAN</Text>
              </View>
            </View>
            <Text style={styles.brandSubtitle}>FSSAI Food Radar • Instant Telemetry</Text>
          </View>

          <TouchableOpacity style={styles.profileAvatar} onPress={() => onOpenTool('profile')}>
            <Text style={styles.avatarText}>BL</Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar with Embedded Scan Trigger */}
        <View style={styles.searchBarContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder='Search "Makhana", "Oats", "INS 621"...'
            placeholderTextColor={Colors.textLight}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity style={styles.searchScanButton} onPress={onOpenScanner}>
            <Text style={styles.searchScanText}>📷 Scan</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Guardrail & Tools Strip */}
        <View style={styles.quickAccessStrip}>
          <TouchableOpacity style={styles.guardrailPill} onPress={() => onOpenTool('dietary')}>
            <Text style={styles.pillEmoji}>🌿</Text>
            <Text style={styles.guardrailPillText}>
              {activeGuardrailCount > 0 ? `${activeGuardrailCount} Guardrails Active` : 'Dietary Guardrails'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.historyPill} onPress={() => onOpenTool('profile')}>
            <Text style={styles.pillEmoji}>🕒</Text>
            <Text style={styles.historyPillText}>Scan History</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
        {/* Blinkit Quick Commerce Hero Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroTextContainer}>
            <View style={styles.heroTag}>
              <Text style={styles.heroTagText}>INSTANT FOOD RADAR</Text>
            </View>
            <Text style={styles.heroTitle}>Point camera at any packaged food</Text>
            <Text style={styles.heroSubtitle}>
              Decode hidden chemicals, NOVA processing group & nutritional traps in seconds.
            </Text>
            <TouchableOpacity style={styles.heroButton} onPress={onOpenScanner}>
              <Text style={styles.heroButtonText}>Launch Live Scanner ➔</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.heroEmoji}>📦🔍</Text>
        </View>

        {/* Blinkit Action Hub Tool Cards Grid */}
        <View style={styles.toolsSection}>
          <Text style={styles.sectionHeader}>BiteLens Tools & Lab</Text>
          <View style={styles.toolsGrid}>
            <TouchableOpacity style={styles.toolCard} onPress={() => onOpenTool('decoder')}>
              <Text style={styles.toolCardEmoji}>🧪</Text>
              <Text style={styles.toolCardTitle}>INS Chemical Decoder</Text>
              <Text style={styles.toolCardDesc}>50+ Additives & Codex Ratings</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.toolCard} onPress={() => onOpenTool('budget')}>
              <Text style={styles.toolCardEmoji}>🎯</Text>
              <Text style={styles.toolCardTitle}>Snack Budget Tracker</Text>
              <Text style={styles.toolCardDesc}>Calories, Sodium & Sugar Meter</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.toolCard} onPress={() => onOpenTool('calculators')}>
              <Text style={styles.toolCardEmoji}>📊</Text>
              <Text style={styles.toolCardTitle}>Health Calculators</Text>
              <Text style={styles.toolCardDesc}>BMR, TDEE & Asian BMI Engine</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.toolCard} onPress={() => onOpenTool('compare')}>
              <Text style={styles.toolCardEmoji}>⚖️</Text>
              <Text style={styles.toolCardTitle}>Food Compare Arena</Text>
              <Text style={styles.toolCardDesc}>Head-to-Head Nutrition Deltas</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Category Filter Carousel */}
        <View style={styles.categorySection}>
          <Text style={styles.sectionHeader}>Categories</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
            {categories.map(cat => {
              const isActive = selectedCategory === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={[styles.categoryPill, isActive && styles.categoryPillActive]}
                  onPress={() => setSelectedCategory(cat.id)}
                >
                  <Text style={[styles.categoryText, isActive && styles.categoryTextActive]}>
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Verified Indian Packaged Grocery Items Grid */}
        <View style={styles.catalogSection}>
          <View style={styles.catalogHeaderRow}>
            <Text style={styles.sectionHeader}>Verified Grocery Catalog</Text>
            <Text style={styles.catalogCountText}>{filteredProducts.length} Items</Text>
          </View>

          <View style={styles.productGrid}>
            {filteredProducts.map(p => (
              <TouchableOpacity
                key={p.barcode}
                style={styles.productCard}
                onPress={() => onSelectProduct(p)}
                activeOpacity={0.8}
              >
                <View style={styles.productCardHeader}>
                  <View style={[styles.novaBadge, { backgroundColor: p.novaBg }]}>
                    <Text style={[styles.novaBadgeText, { color: p.novaColor }]}>
                      NOVA {p.novaGroup}
                    </Text>
                  </View>
                  <Text style={styles.barcodeSnippet}>EAN {p.barcode.slice(-4)}</Text>
                </View>

                <View style={styles.productImageContainer}>
                  <Text style={styles.productEmoji}>{p.image}</Text>
                </View>

                <Text style={styles.productBrand}>{p.brand}</Text>
                <Text style={styles.productName} numberOfLines={1}>
                  {p.name}
                </Text>
                <Text style={styles.productSize}>{p.size}</Text>

                <View style={styles.productFooter}>
                  <Text style={[styles.productScore, { color: p.goalColor }]}>
                    Score {p.healthScore}/100
                  </Text>
                  <Text style={styles.inspectArrow}>➔</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
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
    backgroundColor: Colors.surface,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textMain,
    letterSpacing: -0.5
  },
  speedBadge: {
    backgroundColor: Colors.blinkitGreen,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 99
  },
  speedBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800'
  },
  brandSubtitle: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '500',
    marginTop: 2
  },
  profileAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.primaryLight,
    borderWidth: 1,
    borderColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center'
  },
  avatarText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primaryDark
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceSubtle,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4
  },
  searchInput: {
    flex: 1,
    fontSize: 12,
    color: Colors.textMain,
    fontWeight: '500',
    paddingVertical: 8
  },
  searchScanButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8
  },
  searchScanText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700'
  },
  quickAccessStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight
  },
  guardrailPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: '#C8E6C9'
  },
  historyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceSubtle,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: Colors.border
  },
  pillEmoji: {
    fontSize: 12,
    marginRight: 4
  },
  guardrailPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primaryDark
  },
  historyPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textMuted
  },
  scrollArea: {
    flex: 1
  },
  heroCard: {
    margin: 14,
    backgroundColor: Colors.primaryDark,
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    overflow: 'hidden'
  },
  heroTextContainer: {
    maxWidth: '75%'
  },
  heroTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 99,
    alignSelf: 'flex-start',
    marginBottom: 6
  },
  heroTagText: {
    color: '#A7F3D0',
    fontSize: 9,
    fontWeight: '800'
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    lineHeight: 20
  },
  heroSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 11,
    marginTop: 4,
    lineHeight: 15
  },
  heroButton: {
    backgroundColor: '#FFFFFF',
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start'
  },
  heroButtonText: {
    color: Colors.primaryDark,
    fontSize: 11,
    fontWeight: '800'
  },
  heroEmoji: {
    fontSize: 44,
    opacity: 0.9
  },
  toolsSection: {
    paddingHorizontal: 14,
    marginBottom: 12
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.textMain,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8
  },
  toolsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8
  },
  toolCard: {
    width: '48.5%',
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border
  },
  toolCardEmoji: {
    fontSize: 20,
    marginBottom: 4
  },
  toolCardTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textMain
  },
  toolCardDesc: {
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 2
  },
  categorySection: {
    paddingLeft: 14,
    marginBottom: 12
  },
  categoryScroll: {
    paddingRight: 14,
    gap: 8
  },
  categoryPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 99,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border
  },
  categoryPillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textMuted
  },
  categoryTextActive: {
    color: '#FFFFFF',
    fontWeight: '700'
  },
  catalogSection: {
    paddingHorizontal: 14,
    paddingBottom: 24
  },
  catalogHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  catalogCountText: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '600'
  },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10
  },
  productCard: {
    width: '48.5%',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 10,
    borderWidth: 1,
    borderColor: Colors.border
  },
  productCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6
  },
  novaBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 99
  },
  novaBadgeText: {
    fontSize: 9,
    fontWeight: '800'
  },
  barcodeSnippet: {
    fontSize: 9,
    color: Colors.textLight,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace'
  },
  productImageContainer: {
    height: 70,
    backgroundColor: Colors.surfaceSubtle,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6
  },
  productEmoji: {
    fontSize: 34
  },
  productBrand: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.textLight,
    textTransform: 'uppercase'
  },
  productName: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textMain,
    marginTop: 2
  },
  productSize: {
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 1
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight
  },
  productScore: {
    fontSize: 10,
    fontWeight: '700'
  },
  inspectArrow: {
    fontSize: 11,
    color: Colors.primaryDark
  }
});
