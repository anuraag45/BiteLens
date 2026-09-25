import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Switch,
  Alert,
} from 'react-native';
import { Colors } from '../theme/colors';
import { UserPreferences, WeightGoal } from '../types';
import {
  getUserPreferences,
  saveUserPreferences,
  clearScanHistory,
} from '../services/storage';
import { checkBackendHealth } from '../services/api';
import { HeaderHUD } from '../components/HeaderHUD';

const ALLERGEN_OPTIONS = [
  { id: 'gluten', label: 'Gluten / Wheat', icon: '🌾' },
  { id: 'lactose', label: 'Dairy / Lactose', icon: '🥛' },
  { id: 'carmine', label: 'Carmine Red (INS 120 / Non-Veg)', icon: '🐞' },
  { id: 'soy', label: 'Soy / Soya Lecithin', icon: '🫘' },
  { id: 'peanut', label: 'Peanuts & Nuts', icon: '🥜' },
  { id: 'sulphites', label: 'Sulphites (INS 223)', icon: '🧪' },
];

export const ProfileScreen: React.FC = () => {
  const [prefs, setPrefs] = useState<UserPreferences | null>(null);
  const [backendStatus, setBackendStatus] = useState({ online: false, message: 'Checking...' });

  useEffect(() => {
    loadPrefs();
    checkHealth();
  }, []);

  async function loadPrefs() {
    const loaded = await getUserPreferences();
    setPrefs(loaded);
  }

  async function checkHealth() {
    const status = await checkBackendHealth();
    setBackendStatus(status);
  }

  async function updateGoal(goal: WeightGoal) {
    if (!prefs) return;
    const updated = await saveUserPreferences({ weightGoal: goal });
    setPrefs(updated);
  }

  async function toggleAllergen(id: string) {
    if (!prefs) return;
    const current = prefs.allergens || [];
    let updatedAllergens: string[];
    if (current.includes(id)) {
      updatedAllergens = current.filter(a => a !== id);
    } else {
      updatedAllergens = [...current, id];
    }
    const updated = await saveUserPreferences({ allergens: updatedAllergens });
    setPrefs(updated);
  }

  async function handleClearData() {
    Alert.alert(
      'Reset Local Data',
      'This will erase your local scan history and reset profile preferences in compliance with DPDP Right to Erasure.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm Erasure',
          style: 'destructive',
          onPress: async () => {
            await clearScanHistory();
            const reset = await saveUserPreferences({
              isGuest: true,
              fullName: 'Guest Explorer',
              allergens: [],
              weightGoal: 'maintain',
            });
            setPrefs(reset);
            Alert.alert('Data Erased', 'Local telemetry history has been wiped.');
          },
        },
      ]
    );
  }

  if (!prefs) return null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <HeaderHUD title="Member Profile" isOnline={backendStatus.online} activeGoal={prefs.weightGoal} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Identity Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarCircle}>
            <Text style={{ fontSize: 28 }}>👤</Text>
          </View>
          <View style={{ flex: 1 }}>
            <View style={styles.nameRow}>
              <Text style={styles.userName}>{prefs.fullName}</Text>
              <View style={[styles.guestBadge, { backgroundColor: prefs.isGuest ? Colors.secondaryLight : Colors.primaryLight }]}>
                <Text style={[styles.guestBadgeText, { color: prefs.isGuest ? Colors.secondary : Colors.primary }]}>
                  {prefs.isGuest ? 'GUEST MODE' : 'VERIFIED ACCOUNT'}
                </Text>
              </View>
            </View>
            <Text style={styles.userEmail}>
              {prefs.email || 'Local Offline Profile (No Cloud Account Required)'}
            </Text>
          </View>
        </View>

        {/* Fitness Goal Target Selection */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>🎯 Primary Health & Fitness Goal</Text>
          <Text style={styles.sectionDesc}>
            BiteLens scores food compatibility separately from processing levels based on your selection.
          </Text>

          <View style={styles.goalsGrid}>
            {[
              { id: 'deficit', title: 'Fat Loss (Deficit)', desc: '-500 kcal daily' },
              { id: 'maintain', title: 'Maintenance', desc: 'Balanced energy equilibrium' },
              { id: 'surplus', title: 'Muscle Gain (Surplus)', desc: '+500 kcal & protein focus' },
            ].map(g => (
              <TouchableOpacity
                key={g.id}
                style={[styles.goalChoice, prefs.weightGoal === g.id && styles.goalChoiceActive]}
                onPress={() => updateGoal(g.id as WeightGoal)}
                activeOpacity={0.8}
              >
                <View style={styles.goalRadio}>
                  {prefs.weightGoal === g.id && <View style={styles.goalRadioInner} />}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.goalChoiceTitle, prefs.weightGoal === g.id && { color: Colors.primary }]}>
                    {g.title}
                  </Text>
                  <Text style={styles.goalChoiceDesc}>{g.desc}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Allergen & Dietary Warning Filters */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>🚨 Active Allergen & Dietary Triggers</Text>
          <Text style={styles.sectionDesc}>
            When scanning products, BiteLens highlights instant warning banners if these ingredients are detected.
          </Text>

          <View style={styles.allergensList}>
            {ALLERGEN_OPTIONS.map(opt => {
              const isEnabled = (prefs.allergens || []).includes(opt.id);
              return (
                <TouchableOpacity
                  key={opt.id}
                  style={[styles.allergenItem, isEnabled && styles.allergenItemActive]}
                  onPress={() => toggleAllergen(opt.id)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.allergenIcon}>{opt.icon}</Text>
                  <Text style={[styles.allergenLabel, isEnabled && { fontWeight: '800', color: Colors.primary }]}>
                    {opt.label}
                  </Text>
                  <Switch
                    value={isEnabled}
                    onValueChange={() => toggleAllergen(opt.id)}
                    trackColor={{ false: Colors.border, true: Colors.primary }}
                  />
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Go REST Backend Health Telemetry */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>⚡ BiteLens Go Microservice Status</Text>
          <View style={styles.backendStatusRow}>
            <View style={[styles.backendStatusDot, { backgroundColor: backendStatus.online ? Colors.success : Colors.warning }]} />
            <View style={{ flex: 1 }}>
              <Text style={styles.backendStatusTitle}>
                {backendStatus.online ? 'Gin REST Backend Online' : 'Local Curated Engine (Offline Mode)'}
              </Text>
              <Text style={styles.backendStatusDesc}>
                {backendStatus.message}
              </Text>
            </View>
            <TouchableOpacity style={styles.refreshBtn} onPress={checkHealth}>
              <Text style={styles.refreshBtnText}>🔄 Ping</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* DPDP Compliance & Privacy */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>⚖️ DPDP Act 2023 & Data Privacy</Text>
          <Text style={styles.sectionDesc}>
            BiteLens operates under Indian Digital Personal Data Protection Act regulations. We do not sell scan history to advertisers.
          </Text>

          <TouchableOpacity style={styles.dangerBtn} onPress={handleClearData} activeOpacity={0.8}>
            <Text style={styles.dangerBtnText}>🗑️ Clear Local History (Right to Erasure)</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: 16,
    gap: 14,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 12,
  },
  avatarCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(59, 122, 87, 0.3)',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
    flexWrap: 'wrap',
  },
  userName: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  guestBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  guestBadgeText: {
    fontSize: 9,
    fontWeight: '800',
  },
  userEmail: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  sectionCard: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  sectionDesc: {
    fontSize: 12,
    color: Colors.textMuted,
    lineHeight: 16,
    marginBottom: 4,
  },
  goalsGrid: {
    gap: 8,
  },
  goalChoice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceAlt,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 12,
  },
  goalChoiceActive: {
    borderColor: Colors.primary,
    backgroundColor: 'rgba(59, 122, 87, 0.06)',
  },
  goalRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalRadioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
  },
  goalChoiceTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  goalChoiceDesc: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 1,
  },
  allergensList: {
    gap: 6,
  },
  allergenItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceAlt,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 10,
  },
  allergenItemActive: {
    borderColor: 'rgba(59, 122, 87, 0.4)',
    backgroundColor: 'rgba(59, 122, 87, 0.05)',
  },
  allergenIcon: {
    fontSize: 18,
  },
  allergenLabel: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  backendStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceAlt,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 10,
  },
  backendStatusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  backendStatusTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  backendStatusDesc: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 1,
  },
  refreshBtn: {
    backgroundColor: Colors.surface,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  refreshBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },
  dangerBtn: {
    backgroundColor: Colors.dangerLight,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(225, 29, 72, 0.25)',
    marginTop: 4,
  },
  dangerBtnText: {
    color: Colors.danger,
    fontSize: 13,
    fontWeight: '800',
  },
});
