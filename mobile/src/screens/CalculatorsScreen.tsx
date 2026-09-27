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

interface CalculatorsScreenProps {
  onClose: () => void;
  onSaveGoal?: (goal: 'maintenance' | 'fat_loss' | 'muscle_gain') => void;
}

export const CalculatorsScreen: React.FC<CalculatorsScreenProps> = ({ onClose, onSaveGoal }) => {
  const [activeTab, setActiveTab] = useState<'calorie' | 'bmi'>('calorie');

  // Calorie Calculator Inputs
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [age, setAge] = useState('25');
  const [weightKg, setWeightKg] = useState('70');
  const [heightCm, setHeightCm] = useState('175');
  const [activity, setActivity] = useState<number>(1.55); // Moderate default

  // Mathematical Calculations: Mifflin-St Jeor Formula
  const w = parseFloat(weightKg) || 70;
  const h = parseFloat(heightCm) || 175;
  const a = parseFloat(age) || 25;

  const bmr = gender === 'male'
    ? (10 * w) + (6.25 * h) - (5 * a) + 5
    : (10 * w) + (6.25 * h) - (5 * a) - 161;

  const tdee = Math.round(bmr * activity);

  // Asian BMI Calculations
  const heightM = h / 100;
  const bmi = heightM > 0 ? parseFloat((w / (heightM * heightM)).toFixed(1)) : 22.9;

  let bmiCategory = 'Normal';
  let bmiColor = Colors.success;
  if (bmi < 18.5) {
    bmiCategory = 'Underweight';
    bmiColor = Colors.warning;
  } else if (bmi <= 22.9) {
    bmiCategory = 'Normal (Asian WHO)';
    bmiColor = Colors.success;
  } else if (bmi <= 27.4) {
    bmiCategory = 'Overweight (Asian WHO)';
    bmiColor = Colors.warning;
  } else {
    bmiCategory = 'Obese Class I/II';
    bmiColor = Colors.danger;
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <Text style={styles.headerEmoji}>📊</Text>
          <View>
            <Text style={styles.headerTitle}>Metabolic Health Engine</Text>
            <Text style={styles.headerSubtitle}>Mifflin-St Jeor BMR, TDEE & Asian BMI</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.closeCircle} onPress={onClose}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'calorie' && styles.tabButtonActive]}
          onPress={() => setActiveTab('calorie')}
        >
          <Text style={[styles.tabText, activeTab === 'calorie' && styles.tabTextActive]}>
            🔥 BMR & TDEE Calorie
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'bmi' && styles.tabButtonActive]}
          onPress={() => setActiveTab('bmi')}
        >
          <Text style={[styles.tabText, activeTab === 'bmi' && styles.tabTextActive]}>
            ⚖️ Asian-Specific BMI
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.contentArea} showsVerticalScrollIndicator={false}>
        {/* User Stats Input Card */}
        <View style={styles.card}>
          <Text style={styles.sectionHeader}>Enter Physical Stats</Text>

          {/* Gender Selector */}
          <View style={styles.genderRow}>
            <TouchableOpacity
              style={[styles.genderButton, gender === 'male' && styles.genderButtonActive]}
              onPress={() => setGender('male')}
            >
              <Text style={[styles.genderText, gender === 'male' && styles.genderTextActive]}>
                👨 Male
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.genderButton, gender === 'female' && styles.genderButtonActive]}
              onPress={() => setGender('female')}
            >
              <Text style={[styles.genderText, gender === 'female' && styles.genderTextActive]}>
                👩 Female
              </Text>
            </TouchableOpacity>
          </View>

          {/* Stat Inputs Grid */}
          <View style={styles.inputGrid}>
            <View style={styles.inputBox}>
              <Text style={styles.inputLabel}>Age (Years)</Text>
              <TextInput
                style={styles.textInput}
                keyboardType="numeric"
                value={age}
                onChangeText={setAge}
              />
            </View>

            <View style={styles.inputBox}>
              <Text style={styles.inputLabel}>Weight (kg)</Text>
              <TextInput
                style={styles.textInput}
                keyboardType="numeric"
                value={weightKg}
                onChangeText={setWeightKg}
              />
            </View>

            <View style={styles.inputBox}>
              <Text style={styles.inputLabel}>Height (cm)</Text>
              <TextInput
                style={styles.textInput}
                keyboardType="numeric"
                value={heightCm}
                onChangeText={setHeightCm}
              />
            </View>
          </View>

          {/* Activity Multiplier Selector (for Calorie Tab) */}
          {activeTab === 'calorie' && (
            <View style={styles.activitySection}>
              <Text style={styles.inputLabel}>Daily Physical Activity Level</Text>
              <View style={styles.activityRow}>
                {[
                  { label: 'Sedentary', val: 1.2 },
                  { label: 'Light', val: 1.375 },
                  { label: 'Moderate', val: 1.55 },
                  { label: 'Active', val: 1.725 }
                ].map(act => (
                  <TouchableOpacity
                    key={act.label}
                    style={[styles.activityPill, activity === act.val && styles.activityPillActive]}
                    onPress={() => setActivity(act.val)}
                  >
                    <Text style={[styles.activityText, activity === act.val && styles.activityTextActive]}>
                      {act.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* Results Card */}
        {activeTab === 'calorie' ? (
          <View style={styles.resultCard}>
            <Text style={styles.resultSectionTitle}>Metabolic Calculations</Text>
            
            <View style={styles.resultRow}>
              <View style={styles.resultColumn}>
                <Text style={styles.resultLabel}>Basal Metabolic Rate</Text>
                <Text style={styles.resultBigValue}>{bmr.toFixed(1)}</Text>
                <Text style={styles.resultUnit}>kcal / day (At rest)</Text>
              </View>

              <View style={styles.resultColumn}>
                <Text style={styles.resultLabel}>Total Daily Energy (TDEE)</Text>
                <Text style={[styles.resultBigValue, { color: Colors.primaryDark }]}>{tdee}</Text>
                <Text style={styles.resultUnit}>kcal / day (Maintenance)</Text>
              </View>
            </View>

            {/* Target Options */}
            <View style={styles.targetsContainer}>
              <TouchableOpacity
                style={styles.targetOption}
                onPress={() => onSaveGoal?.('fat_loss')}
              >
                <Text style={styles.targetTitle}>Fat Loss Target (-500 kcal)</Text>
                <Text style={styles.targetValue}>{Math.max(1200, tdee - 500)} kcal</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.targetOption}
                onPress={() => onSaveGoal?.('maintenance')}
              >
                <Text style={styles.targetTitle}>Maintenance Goal (0 kcal)</Text>
                <Text style={styles.targetValue}>{tdee} kcal</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.targetOption}
                onPress={() => onSaveGoal?.('muscle_gain')}
              >
                <Text style={styles.targetTitle}>Muscle Surplus (+300 kcal)</Text>
                <Text style={styles.targetValue}>{tdee + 300} kcal</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.resultCard}>
            <Text style={styles.resultSectionTitle}>Asian-Specific Body Composition</Text>

            <View style={styles.bmiGaugeContainer}>
              <Text style={[styles.bmiValue, { color: bmiColor }]}>{bmi}</Text>
              <Text style={styles.bmiUnit}>kg/m²</Text>
              <View style={[styles.bmiBadge, { backgroundColor: bmiColor + '20' }]}>
                <Text style={[styles.bmiBadgeText, { color: bmiColor }]}>{bmiCategory}</Text>
              </View>
            </View>

            <View style={styles.clinicalNote}>
              <Text style={styles.clinicalNoteText}>
                ⚠️ <Text style={{ fontWeight: '700' }}>Clinical Note: </Text>
                WHO Asian-Pacific guidelines use lowered BMI thresholds (Overweight $\ge 23$, Obese $\ge 27.5$) due to higher visceral adiposity and cardiovascular risk at lower body weights.
              </Text>
            </View>
          </View>
        )}
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
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent'
  },
  tabButtonActive: {
    borderBottomColor: Colors.primary
  },
  tabText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textMuted
  },
  tabTextActive: {
    color: Colors.primaryDark,
    fontWeight: '800'
  },
  contentArea: {
    padding: 14
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.textMain,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10
  },
  genderRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12
  },
  genderButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: Colors.surfaceSubtle,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border
  },
  genderButtonActive: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary
  },
  genderText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textMuted
  },
  genderTextActive: {
    color: Colors.primaryDark,
    fontWeight: '800'
  },
  inputGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10
  },
  inputBox: {
    flex: 1
  },
  inputLabel: {
    fontSize: 10,
    color: Colors.textLight,
    fontWeight: '600',
    marginBottom: 4
  },
  textInput: {
    backgroundColor: Colors.surfaceSubtle,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textMain,
    borderWidth: 1,
    borderColor: Colors.border
  },
  activitySection: {
    marginTop: 6
  },
  activityRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 4
  },
  activityPill: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: Colors.surfaceSubtle,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border
  },
  activityPillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary
  },
  activityText: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.textMuted
  },
  activityTextActive: {
    color: '#FFFFFF',
    fontWeight: '700'
  },
  resultCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border
  },
  resultSectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.textMain,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight
  },
  resultColumn: {
    flex: 1,
    alignItems: 'center'
  },
  resultLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    fontWeight: '600'
  },
  resultBigValue: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.textMain,
    marginTop: 2
  },
  resultUnit: {
    fontSize: 9,
    color: Colors.textLight
  },
  targetsContainer: {
    gap: 6
  },
  targetOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.surfaceSubtle,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10
  },
  targetTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textMain
  },
  targetValue: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.primaryDark
  },
  bmiGaugeContainer: {
    alignItems: 'center',
    paddingVertical: 14
  },
  bmiValue: {
    fontSize: 48,
    fontWeight: '800',
    letterSpacing: -1
  },
  bmiUnit: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: -4
  },
  bmiBadge: {
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 99
  },
  bmiBadgeText: {
    fontSize: 11,
    fontWeight: '800'
  },
  clinicalNote: {
    backgroundColor: Colors.warningBg,
    borderRadius: 10,
    padding: 10,
    marginTop: 10
  },
  clinicalNoteText: {
    fontSize: 10,
    color: '#92400E',
    lineHeight: 14
  }
});
