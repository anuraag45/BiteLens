import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '../theme/colors';

interface HeaderHUDProps {
  title?: string;
  isOnline?: boolean;
  activeGoal?: string;
  onProfilePress?: () => void;
}

export const HeaderHUD: React.FC<HeaderHUDProps> = ({
  title = 'BiteLens',
  isOnline = false,
  activeGoal = 'Maintain',
  onProfilePress,
}) => {
  return (
    <View style={styles.headerContainer}>
      <View style={styles.topRow}>
        <View style={styles.brandRow}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoIcon}>👁️</Text>
          </View>
          <Text style={styles.brandTitle}>{title}</Text>
        </View>

        <TouchableOpacity
          style={styles.profileChip}
          onPress={onProfilePress}
          activeOpacity={0.8}
        >
          <View style={[styles.statusDot, { backgroundColor: isOnline ? Colors.success : Colors.secondary }]} />
          <Text style={styles.goalText}>
            {activeGoal}
          </Text>
          <Text style={styles.profileAvatar}>👤</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: Colors.surface,
    paddingTop: 48,
    paddingBottom: 14,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(59, 122, 87, 0.25)',
  },
  logoIcon: {
    fontSize: 16,
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },
  profileChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceAlt,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 20,
    gap: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  goalText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'capitalize',
  },
  profileAvatar: {
    fontSize: 12,
  },
});
