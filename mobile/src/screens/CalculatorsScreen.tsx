import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Switch,
} from 'react-native';
import { Colors } from '../theme/colors';
import {
  calculateBMI,
  getBMICategory,
  computeFullMetabolicProfile,
} from '../algorithms/calculators';
import { BMICategoryInfo, CalorieResult, WeightGoal } from '../types';
import { HeaderHUD } from '../components/HeaderHUD';

type CalcTab = 'bmi' | 'calorie';

export const CalculatorsScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<CalcTab>('bmi');

  // --- BMI Form State ---
  const [bmiWeight, setBmiWeight] = useState('70');
  const [bmiHeightCm, setBmiHeightCm] = useState('175');
  const [isAsianCutoff, setIsAsianCutoff] = useState(true);
  const [bmiWeightUnit, setBmiWeightUnit] = useState<'kg' | 'lb'>('kg');
  const [bmiHeightUnit, setBmiHeightUnit] = useState<'cm' | 'ftin'>('cm');
  const [bmiHeightFt, setBmiHeightFt] = useState('5');
  const [bmiHeightIn, setBmiHeightIn] = useState('9');

  // --- Calorie Form State ---
  const [sex, setSex] = useState<'male' | 'female'>('male');
  const [calAge, setCalAge] = useState('30');
  const [calWeight, setCalWeight] = useState('70');
  const [calHeightCm, setCalHeightCm] = useState('175');
  const [activity, setActivity] = useState<
    'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extra_active'
  >('moderately_active');
  const [goal, setGoal] = useState<WeightGoal>('maintain');

  // Compute BMI live
  let bmiResult: number | null = null;
  let bmiCategory: BMICategoryInfo | null = null;
  try {
    let wKg = parseFloat(bmiWeight);
    if (bmiWeightUnit === 'lb') wKg = wKg * 0.453592;

    let hM = 0;
    if (bmiHeightUnit === 'cm') {
      hM = parseFloat(bmiHeightCm) / 100;
    } else {
      const ft = parseFloat(bmiHeightFt) || 0;
      const inch = parseFloat(bmiHeightIn) || 0;
      hM = ((ft * 12) + inch) * 0.0254;
    }

    if (wKg > 0 && hM > 0) {
      bmiResult = calculateBMI(wKg, hM);
      bmiCategory = getBMICategory(bmiResult, isAsianCutoff);
    }
  } catch (err) {
    // Graceful fallback for empty inputs
  }

  // Compute Calorie / TDEE live
  let calorieResult: CalorieResult | null = null;
  try {
    const age = parseInt(calAge, 10);
    const w = parseFloat(calWeight);
    const h = parseFloat(calHeightCm);
    if (age > 0 && w > 0 && h > 0) {
      calorieResult = computeFullMetabolicProfile(sex, age, w, h, activity, goal);
    }
  } catch (err) {
    // Graceful fallback
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <HeaderHUD title="Health Calculators" />

      {/* Segmented Control */}
      <View style={styles.segmentedContainer}>
        <TouchableOpacity
          style={[styles.segmentBtn, activeTab === 'bmi' && styles.segmentBtnActive]}
          onPress={() => setActiveTab('bmi')}
          activeOpacity={0.8}
        >
          <Text style={[styles.segmentBtnText, activeTab === 'bmi' && styles.segmentBtnTextActive]}>
            📏 BMI Calculator
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.segmentBtn, activeTab === 'calorie' && styles.segmentBtnActive]}
          onPress={() => setActiveTab('calorie')}
          activeOpacity={0.8}
        >
          <Text style={[styles.segmentBtnText, activeTab === 'calorie' && styles.segmentBtnTextActive]}>
            🔥 Calorie & TDEE
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {activeTab === 'bmi' ? (
          /* ======================================================== */
          /* 1. BMI CALCULATOR (WITH ASIAN SPECIFIC CUTOFFS)           */
          /* ======================================================== */
          <View style={styles.calcCard}>
            <Text style={styles.cardTitle}>Body Mass Index (BMI)</Text>
            <Text style={styles.cardDesc}>
              Calculate population health risk using standard WHO criteria or adjusted South Asian action points.
            </Text>

            {/* Units Toggles */}
            <View style={styles.unitRow}>
              <View style={styles.unitCol}>
                <Text style={styles.unitLabel}>Weight Unit</Text>
                <View style={styles.toggleGroup}>
                  <TouchableOpacity
                    style={[styles.toggleBtn, bmiWeightUnit === 'kg' && styles.toggleBtnActive]}
                    onPress={() => setBmiWeightUnit('kg')}
                  >
                    <Text style={[styles.toggleBtnText, bmiWeightUnit === 'kg' && styles.toggleBtnTextActive]}>
                      KG
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.toggleBtn, bmiWeightUnit === 'lb' && styles.toggleBtnActive]}
                    onPress={() => setBmiWeightUnit('lb')}
                  >
                    <Text style={[styles.toggleBtnText, bmiWeightUnit === 'lb' && styles.toggleBtnTextActive]}>
                      LB
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.unitCol}>
                <Text style={styles.unitLabel}>Height Unit</Text>
                <View style={styles.toggleGroup}>
                  <TouchableOpacity
                    style={[styles.toggleBtn, bmiHeightUnit === 'cm' && styles.toggleBtnActive]}
                    onPress={() => setBmiHeightUnit('cm')}
                  >
                    <Text style={[styles.toggleBtnText, bmiHeightUnit === 'cm' && styles.toggleBtnTextActive]}>
                      CM
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.toggleBtn, bmiHeightUnit === 'ftin' && styles.toggleBtnActive]}
                    onPress={() => setBmiHeightUnit('ftin')}
                  >
                    <Text style={[styles.toggleBtnText, bmiHeightUnit === 'ftin' && styles.toggleBtnTextActive]}>
                      FT/IN
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Weight Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Weight ({bmiWeightUnit.toUpperCase()})</Text>
              <TextInput
                style={styles.textInput}
                keyboardType="numeric"
                value={bmiWeight}
                onChangeText={setBmiWeight}
                placeholder="70"
                placeholderTextColor={Colors.textLight}
              />
            </View>

            {/* Height Input */}
            {bmiHeightUnit === 'cm' ? (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Height (Centimeters)</Text>
                <TextInput
                  style={styles.textInput}
                  keyboardType="numeric"
                  value={bmiHeightCm}
                  onChangeText={setBmiHeightCm}
                  placeholder="175"
                  placeholderTextColor={Colors.textLight}
                />
              </View>
            ) : (
              <View style={styles.ftInRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Feet</Text>
                  <TextInput
                    style={styles.textInput}
                    keyboardType="numeric"
                    value={bmiHeightFt}
                    onChangeText={setBmiHeightFt}
                    placeholder="5"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Inches</Text>
                  <TextInput
                    style={styles.textInput}
                    keyboardType="numeric"
                    value={bmiHeightIn}
                    onChangeText={setBmiHeightIn}
                    placeholder="9"
                  />
                </View>
              </View>
            )}

            {/* Asian Cutoffs Switch */}
            <View style={styles.switchRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.switchTitle}>Asian-Specific Cutoffs</Text>
                <Text style={styles.switchSub}>
                  WHO recommends lower thresholds for South Asian bodies (Overweight starts at 23.0).
                </Text>
              </View>
              <Switch
                value={isAsianCutoff}
                onValueChange={setIsAsianCutoff}
                trackColor={{ false: Colors.border, true: Colors.primary }}
              />
            </View>

            {/* Live Result Output */}
            {bmiResult && bmiCategory && (
              <View style={styles.resultBox}>
                <Text style={styles.resultLabel}>CALCULATED BMI SCORE</Text>
                <Text style={styles.resultVal}>{bmiResult}</Text>
                <View style={[styles.catBadge, { backgroundColor: bmiCategory.color }]}>
                  <Text style={styles.catBadgeText}>{bmiCategory.category}</Text>
                </View>
                <Text style={styles.resultExplanation}>{bmiCategory.text}</Text>
              </View>
            )}
          </View>
        ) : (
          /* ======================================================== */
          /* 2. CALORIE & TDEE (MIFFLIN-ST JEOR FORMULA)               */
          /* ======================================================== */
          <View style={styles.calcCard}>
            <Text style={styles.cardTitle}>Mifflin-St Jeor Calorie Engine</Text>
            <Text style={styles.cardDesc}>
              Scientifically calculate your resting metabolic expenditure (BMR) and daily activity maintenance calories (TDEE).
            </Text>

            {/* Sex Toggle */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Biological Sex</Text>
              <View style={styles.toggleGroup}>
                <TouchableOpacity
                  style={[styles.toggleBtn, sex === 'male' && styles.toggleBtnActive]}
                  onPress={() => setSex('male')}
                >
                  <Text style={[styles.toggleBtnText, sex === 'male' && styles.toggleBtnTextActive]}>
                    👨 Male (+5)
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.toggleBtn, sex === 'female' && styles.toggleBtnActive]}
                  onPress={() => setSex('female')}
                >
                  <Text style={[styles.toggleBtnText, sex === 'female' && styles.toggleBtnTextActive]}>
                    👩 Female (-161)
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Age, Weight, Height Grid */}
            <View style={styles.tripleGrid}>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>Age (Yrs)</Text>
                <TextInput
                  style={styles.textInput}
                  keyboardType="numeric"
                  value={calAge}
                  onChangeText={setCalAge}
                  placeholder="30"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>Weight (kg)</Text>
                <TextInput
                  style={styles.textInput}
                  keyboardType="numeric"
                  value={calWeight}
                  onChangeText={setCalWeight}
                  placeholder="70"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>Height (cm)</Text>
                <TextInput
                  style={styles.textInput}
                  keyboardType="numeric"
                  value={calHeightCm}
                  onChangeText={setCalHeightCm}
                  placeholder="175"
                />
              </View>
            </View>

            {/* Activity Level Selector */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Activity Level Multiplier</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
                {[
                  { id: 'sedentary', label: 'Sedentary (1.2x)' },
                  { id: 'lightly_active', label: 'Light 1-3d (1.375x)' },
                  { id: 'moderately_active', label: 'Moderate 3-5d (1.55x)' },
                  { id: 'very_active', label: 'Hard 6-7d (1.725x)' },
                ].map(act => (
                  <TouchableOpacity
                    key={act.id}
                    style={[styles.pillSelect, activity === act.id && styles.pillSelectActive]}
                    onPress={() => setActivity(act.id as any)}
                  >
                    <Text style={[styles.pillSelectText, activity === act.id && styles.pillSelectTextActive]}>
                      {act.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Fitness Goal Selector */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Target Fitness Goal</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
                {[
                  { id: 'maintain', label: 'Maintain Current' },
                  { id: 'deficit', label: 'Fat Loss (-500 kcal)' },
                  { id: 'mild_deficit', label: 'Mild Loss (-250 kcal)' },
                  { id: 'surplus', label: 'Muscle Gain (+500 kcal)' },
                ].map(g => (
                  <TouchableOpacity
                    key={g.id}
                    style={[styles.pillSelect, goal === g.id && styles.pillSelectActive]}
                    onPress={() => setGoal(g.id as any)}
                  >
                    <Text style={[styles.pillSelectText, goal === g.id && styles.pillSelectTextActive]}>
                      {g.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Metabolic Result Output */}
            {calorieResult && (
              <View style={styles.calorieResultCard}>
                <View style={styles.bmrTdeeRow}>
                  <View style={styles.statBox}>
                    <Text style={styles.statLabel}>BMR (RESTING)</Text>
                    <Text style={styles.statVal}>{calorieResult.bmr}</Text>
                    <Text style={styles.statUnit}>kcal / day</Text>
                  </View>
                  <View style={styles.statBox}>
                    <Text style={styles.statLabel}>MAINTENANCE TDEE</Text>
                    <Text style={styles.statVal}>{calorieResult.tdee}</Text>
                    <Text style={styles.statUnit}>kcal / day</Text>
                  </View>
                </View>

                {/* Target Intake Goal */}
                <View style={styles.targetIntakeBox}>
                  <Text style={styles.targetIntakeLabel}>RECOMMENDED DAILY TARGET INTAKE</Text>
                  <Text style={styles.targetIntakeVal}>{calorieResult.targetCalories} kcal</Text>
                </View>

                {/* Macro Gram Breakdown */}
                <View style={styles.macrosRow}>
                  <View style={styles.macroPill}>
                    <Text style={styles.macroVal}>{calorieResult.macros.proteinGrams}g</Text>
                    <Text style={styles.macroLbl}>Protein (25%)</Text>
                  </View>
                  <View style={styles.macroPill}>
                    <Text style={styles.macroVal}>{calorieResult.macros.fatGrams}g</Text>
                    <Text style={styles.macroLbl}>Fats (25%)</Text>
                  </View>
                  <View style={styles.macroPill}>
                    <Text style={styles.macroVal}>{calorieResult.macros.carbGrams}g</Text>
                    <Text style={styles.macroLbl}>Carbs (50%)</Text>
                  </View>
                </View>
              </View>
            )}
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
  calcCard: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 14,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  cardDesc: {
    fontSize: 12,
    color: Colors.textMuted,
    lineHeight: 17,
  },
  unitRow: {
    flexDirection: 'row',
    gap: 12,
  },
  unitCol: {
    flex: 1,
  },
  unitLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textMuted,
    marginBottom: 6,
  },
  toggleGroup: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceAlt,
    borderRadius: 10,
    padding: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    borderRadius: 8,
  },
  toggleBtnActive: {
    backgroundColor: Colors.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  toggleBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textMuted,
  },
  toggleBtnTextActive: {
    color: Colors.primary,
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  textInput: {
    backgroundColor: Colors.surfaceAlt,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 14,
    height: 46,
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  ftInRow: {
    flexDirection: 'row',
    gap: 12,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceAlt,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 10,
  },
  switchTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  switchSub: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
    lineHeight: 15,
  },
  resultBox: {
    backgroundColor: Colors.surfaceAlt,
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.primary,
    marginTop: 4,
  },
  resultLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.textMuted,
    letterSpacing: 0.8,
  },
  resultVal: {
    fontSize: 38,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginVertical: 4,
  },
  catBadge: {
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 12,
    marginBottom: 8,
  },
  catBadgeText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  resultExplanation: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    fontWeight: '500',
  },
  tripleGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  pillSelect: {
    backgroundColor: Colors.surfaceAlt,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  pillSelectActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  pillSelectText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  pillSelectTextActive: {
    color: '#FFFFFF',
  },
  calorieResultCard: {
    backgroundColor: Colors.surfaceAlt,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 12,
  },
  bmrTdeeRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statBox: {
    flex: 1,
    backgroundColor: Colors.surface,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.textMuted,
    letterSpacing: 0.5,
  },
  statVal: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.primary,
    marginVertical: 2,
  },
  statUnit: {
    fontSize: 10,
    color: Colors.textMuted,
  },
  targetIntakeBox: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.secondary,
  },
  targetIntakeLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.secondary,
    letterSpacing: 0.5,
  },
  targetIntakeVal: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.secondary,
    marginTop: 2,
  },
  macrosRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  macroPill: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  macroVal: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  macroLbl: {
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 2,
  },
});
