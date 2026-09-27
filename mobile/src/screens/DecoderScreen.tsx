import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView
} from 'react-native';
import { Colors } from '../theme/colors';
import { INS_ADDITIVES_DATABASE } from '../data/additives';
import { Additive } from '../types';

interface DecoderScreenProps {
  onClose: () => void;
}

export const DecoderScreen: React.FC<DecoderScreenProps> = ({ onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('All');
  const [selectedAdditive, setSelectedAdditive] = useState<Additive | null>(null);

  const categories = ['All', 'Flavor Enhancer', 'Emulsifier', 'Sweetener', 'Preservative', 'Colorant'];

  const filteredAdditives = INS_ADDITIVES_DATABASE.filter(a => {
    const matchesCategory = selectedFilter === 'All' || a.category === selectedFilter;
    const matchesSearch =
      searchQuery.trim() === '' ||
      a.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.purpose.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <Text style={styles.headerEmoji}>🧪</Text>
          <View>
            <Text style={styles.headerTitle}>INS Chemical Decoder</Text>
            <Text style={styles.headerSubtitle}>Codex Alimentarius & FSSAI Table of Additives</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.closeCircle} onPress={onClose}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>
      </View>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder='Search additive code (e.g. "INS 621", "Carmine", "Aspartame")...'
          placeholderTextColor={Colors.textLight}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Category Pills */}
      <View style={styles.filterSection}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {categories.map(cat => {
            const isActive = selectedFilter === cat;
            return (
              <TouchableOpacity
                key={cat}
                style={[styles.filterPill, isActive && styles.filterPillActive]}
                onPress={() => setSelectedFilter(cat)}
              >
                <Text style={[styles.filterText, isActive && styles.filterTextActive]}>{cat}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Additives List */}
      <ScrollView style={styles.listArea} showsVerticalScrollIndicator={false}>
        <View style={styles.countRow}>
          <Text style={styles.countText}>Showing {filteredAdditives.length} chemicals</Text>
          <Text style={styles.safetyLegend}>🟢 Clean • 🟡 Watchlist • 🔴 High Risk</Text>
        </View>

        {filteredAdditives.map((a, i) => (
          <TouchableOpacity
            key={i}
            style={styles.card}
            activeOpacity={0.8}
            onPress={() => setSelectedAdditive(selectedAdditive?.code === a.code ? null : a)}
          >
            <View style={styles.cardHeader}>
              <View style={styles.codeGroup}>
                <Text style={styles.codeText}>{a.code}</Text>
                <Text style={styles.categoryBadge}>{a.category || 'Additive'}</Text>
              </View>

              <View
                style={[
                  styles.statusBadge,
                  a.status === 'Clean' && styles.statusClean,
                  a.status === 'Watchlist' && styles.statusWatchlist,
                  a.status === 'Ultra-Processed' && styles.statusUltra
                ]}
              >
                <Text
                  style={[
                    styles.statusBadgeText,
                    a.status === 'Clean' && styles.statusTextClean,
                    a.status === 'Watchlist' && styles.statusTextWatchlist,
                    a.status === 'Ultra-Processed' && styles.statusTextUltra
                  ]}
                >
                  {a.status}
                </Text>
              </View>
            </View>

            <Text style={styles.nameText}>{a.name}</Text>
            <Text style={styles.purposeText}>{a.purpose}</Text>

            <View style={styles.noteBox}>
              <Text style={styles.noteText}>{a.note}</Text>
            </View>
          </TouchableOpacity>
        ))}
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
  searchContainer: {
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 6
  },
  searchInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 12,
    color: Colors.textMain,
    borderWidth: 1,
    borderColor: Colors.border
  },
  filterSection: {
    paddingLeft: 14,
    paddingVertical: 6
  },
  filterScroll: {
    paddingRight: 14,
    gap: 6
  },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 99,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: Colors.border
  },
  filterPillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary
  },
  filterText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textMuted
  },
  filterTextActive: {
    color: '#FFFFFF',
    fontWeight: '700'
  },
  listArea: {
    flex: 1,
    paddingHorizontal: 14,
    paddingTop: 4
  },
  countRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 6
  },
  countText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textLight,
    textTransform: 'uppercase'
  },
  safetyLegend: {
    fontSize: 9,
    color: Colors.textMuted
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4
  },
  codeGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  codeText: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.primaryDark
  },
  categoryBadge: {
    fontSize: 9,
    backgroundColor: Colors.surfaceSubtle,
    color: Colors.textMuted,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    fontWeight: '600'
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 99
  },
  statusClean: { backgroundColor: Colors.successBg },
  statusWatchlist: { backgroundColor: Colors.warningBg },
  statusUltra: { backgroundColor: Colors.dangerBg },
  statusBadgeText: { fontSize: 9, fontWeight: '800' },
  statusTextClean: { color: Colors.success },
  statusTextWatchlist: { color: Colors.warning },
  statusTextUltra: { color: Colors.danger },
  nameText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textMain
  },
  purposeText: {
    fontSize: 10,
    color: Colors.primaryDark,
    fontWeight: '600',
    marginTop: 1
  },
  noteBox: {
    backgroundColor: Colors.surfaceSubtle,
    borderRadius: 8,
    padding: 8,
    marginTop: 6
  },
  noteText: {
    fontSize: 10,
    color: Colors.textMuted,
    lineHeight: 14
  }
});
