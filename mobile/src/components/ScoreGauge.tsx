import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../theme/colors';
import { NOVAGroup } from '../types';

interface ScoreGaugeProps {
  score: number;
  label?: string;
  size?: 'small' | 'medium' | 'large';
  novaGroup?: NOVAGroup;
}

export const ScoreGauge: React.FC<ScoreGaugeProps> = ({
  score,
  label = 'HEALTH SCORE',
  size = 'medium',
  novaGroup,
}) => {
  let scoreColor = Colors.success;
  if (score < 50) scoreColor = Colors.danger;
  else if (score < 75) scoreColor = Colors.warning;

  let novaColor = Colors.nova1;
  let novaBg = Colors.nova1Bg;
  let novaText = 'NOVA 1: Whole Food';

  if (novaGroup === 2) {
    novaColor = Colors.nova2;
    novaBg = Colors.nova2Bg;
    novaText = 'NOVA 2: Culinary';
  } else if (novaGroup === 3) {
    novaColor = Colors.nova3;
    novaBg = Colors.nova3Bg;
    novaText = 'NOVA 3: Processed';
  } else if (novaGroup === 4) {
    novaColor = Colors.nova4;
    novaBg = Colors.nova4Bg;
    novaText = 'NOVA 4: Ultra-Processed';
  }

  const isLarge = size === 'large';
  const isSmall = size === 'small';

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.gaugeBox,
          isLarge && styles.gaugeBoxLarge,
          isSmall && styles.gaugeBoxSmall,
          { borderColor: scoreColor },
        ]}
      >
        <Text style={[styles.labelText, isSmall && { fontSize: 9 }]}>{label}</Text>
        <Text style={[styles.scoreValue, { color: scoreColor }, isLarge && { fontSize: 32 }]}>
          {score}
          <Text style={styles.maxScore}>/100</Text>
        </Text>
        {novaGroup ? (
          <View style={[styles.novaBadge, { backgroundColor: novaBg }]}>
            <Text style={[styles.novaBadgeText, { color: novaColor }]}>{novaText}</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  gaugeBox: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1.5,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    minWidth: 130,
  },
  gaugeBoxLarge: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    minWidth: 160,
  },
  gaugeBoxSmall: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    minWidth: 95,
  },
  labelText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.textMuted,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  maxScore: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  novaBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 4,
  },
  novaBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
});
