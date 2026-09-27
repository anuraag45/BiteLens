import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView
} from 'react-native';
import { Colors } from '../theme/colors';
import { SnackBudget } from '../types';

interface SnackBudgetScreenProps {
  budget: SnackBudget;
  onClearBudget: () => void;
  onClose: () => void;
}

export const SnackBudgetScreen: React.FC<SnackBudgetScreenProps> = ({
  budget,
  onClearBudget,
  onClose
}) => {
  const totalCalories = budget.loggedSnacks.reduce((acc, s) => acc + s.calories, 0);
  const totalSodium = budget.loggedSnacks.reduce((acc, s) => acc + s.sodium, 0);
  const totalSugars = budget.loggedSnacks.reduce((acc, s) => acc + s.sugars, 0);

  const calPct = Math.min(100, Math.round((totalCalories / budget.targetCalories) * 100));
  const sodiumPct = Math.min(100, Math.round((totalSodium / budget.targetSodium) * 100));
  const sugarPct = Math.min(100, Math.round((totalSugars / budget.targetSugars) * 100));

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <Text style={styles.headerEmoji}>🎯</Text>
          <View>
            <Text style={styles.headerTitle}>Daily Snack Budget</Text>
            <Text style={styles.headerSubtitle}>Real-Time Calorie, Sodium & Sugar Meter</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.closeCircle} onPress={onClose}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.contentArea} showsVerticalScrollIndicator={false}>
        {/* Budget Progress Gauges Card */}
        <View style={styles.card}>
          <Text style={styles.cardSectionHeader}>Today's Allowance Progress</Text>

          {/* Calories Meter */}
          <View style={styles.meterContainer}>
            <View style={styles.meterLabelRow}>
              <Text style={styles.meterName}>🔥 Calories</Text>
              <Text style={styles.meterValue}>
                {totalCalories} / {budget.targetCalories} kcal ({calPct}%)
              </Text>
            </View>
            <View style={styles.progressBarBg}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${calPct}%` },
                  calPct > 85 ? styles.barDanger : styles.barPrimary
                ]}
              />
            </View>
          </View>

          {/* Sodium Meter */}
          <View style={styles.meterContainer}>
            <View style={styles.meterLabelRow}>
              <Text style={styles.meterName}>🧂 Sodium</Text>
              <Text style={styles.meterValue}>
                {totalSodium} / {budget.targetSodium} mg ({sodiumPct}%)
              </Text>
            </View>
            <View style={styles.progressBarBg}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${sodiumPct}%` },
                  sodiumPct > 85 ? styles.barDanger : styles.barWarning
                ]}
              />
            </View>
          </View>

          {/* Sugars Meter */}
          <View style={styles.meterContainer}>
            <View style={styles.meterLabelRow}>
              <Text style={styles.meterName}>🍬 Sugars</Text>
              <Text style={styles.meterValue}>
                {totalSugars.toFixed(1)} / {budget.targetSugars} g ({sugarPct}%)
              </Text>
            </View>
            <View style={styles.progressBarBg}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${sugarPct}%` },
                  sugarPct > 85 ? styles.barDanger : styles.barAccent
                ]}
              />
            </View>
          </View>
        </View>

        {/* Logged Snacks List */}
        <View style={styles.card}>
          <View style={styles.loggedHeaderRow}>
            <Text style={styles.cardSectionHeader}>
              Logged Items ({budget.loggedSnacks.length})
            </Text>
            {budget.loggedSnacks.length > 0 && (
              <TouchableOpacity onPress={onClearBudget}>
                <Text style={styles.resetButtonText}>Reset Daily Log</Text>
              </TouchableOpacity>
            )}
          </View>

          {budget.loggedSnacks.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>🍪</Text>
              <Text style={styles.emptyTitle}>No Snacks Logged Today</Text>
              <Text style={styles.emptySubtitle}>
                Scan any food package and tap "+ Log to Daily Snack Budget" to track your real-time intake.
              </Text>
            </View>
          ) : (
            budget.loggedSnacks.map((s, idx) => (
              <View key={s.id || idx} style={styles.snackRow}>
                <View style={styles.snackInfo}>
                  <Text style={styles.snackBrand}>{s.brand}</Text>
                  <Text style={styles.snackName}>{s.name}</Text>
                </View>
                <View style={styles.snackMacros}>
                  <Text style={styles.snackCal}>{s.calories} kcal</Text>
                  <Text style={styles.snackSub}>
                    {s.sodium}mg Na • {s.sugars}g Sugar
                  </Text>
                </View>
              </View>
            ))
          )}
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
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border
  },
  cardSectionHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.textMain,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12
  },
  meterContainer: {
    marginBottom: 12
  },
  meterLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4
  },
  meterName: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textMain
  },
  meterValue: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textMuted
  },
  progressBarBg: {
    height: 8,
    backgroundColor: Colors.surfaceSubtle,
    borderRadius: 99,
    overflow: 'hidden'
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 99
  },
  barPrimary: {
    backgroundColor: Colors.primary
  },
  barWarning: {
    backgroundColor: Colors.warning
  },
  barAccent: {
    backgroundColor: Colors.accent
  },
  barDanger: {
    backgroundColor: Colors.danger
  },
  loggedHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  resetButtonText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.danger
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 20
  },
  emptyEmoji: {
    fontSize: 32,
    marginBottom: 6
  },
  emptyTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textMain
  },
  emptySubtitle: {
    fontSize: 10,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 2,
    lineHeight: 14,
    maxWidth: 240
  },
  snackRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight
  },
  snackInfo: {
    flex: 1
  },
  snackBrand: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.textLight,
    textTransform: 'uppercase'
  },
  snackName: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textMain
  },
  snackMacros: {
    alignItems: 'flex-end'
  },
  snackCal: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.primaryDark
  },
  snackSub: {
    fontSize: 9,
    color: Colors.textMuted
  }
});
