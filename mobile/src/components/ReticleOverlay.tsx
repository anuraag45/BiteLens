import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Colors } from '../theme/colors';

interface ReticleOverlayProps {
  isScanning?: boolean;
  statusText?: string;
}

export const ReticleOverlay: React.FC<ReticleOverlayProps> = ({
  isScanning = true,
  statusText = 'Align Barcode or Ingredients Inside Reticle',
}) => {
  const scanAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isScanning) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scanAnim, {
            toValue: 1,
            duration: 1800,
            useNativeDriver: true,
          }),
          Animated.timing(scanAnim, {
            toValue: 0,
            duration: 1800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [isScanning]);

  const translateY = scanAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [10, 190],
  });

  return (
    <View style={styles.container} pointerEvents="none">
      <View style={styles.reticleBox}>
        {/* Top Left Corner */}
        <View style={[styles.corner, styles.topLeft]} />
        {/* Top Right Corner */}
        <View style={[styles.corner, styles.topRight]} />
        {/* Bottom Left Corner */}
        <View style={[styles.corner, styles.bottomLeft]} />
        {/* Bottom Right Corner */}
        <View style={[styles.corner, styles.bottomRight]} />

        {/* Animated Laser Beam */}
        {isScanning && (
          <Animated.View
            style={[
              styles.laserBeam,
              {
                transform: [{ translateY }],
              },
            ]}
          />
        )}
      </View>

      <View style={styles.statusPill}>
        <Text style={styles.statusText}>{statusText}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reticleBox: {
    width: 250,
    height: 210,
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(59, 122, 87, 0.35)',
    borderRadius: 16,
    overflow: 'hidden',
  },
  corner: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderColor: Colors.hudNeonGreen,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 3.5,
    borderLeftWidth: 3.5,
    borderTopLeftRadius: 12,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 3.5,
    borderRightWidth: 3.5,
    borderTopRightRadius: 12,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 3.5,
    borderLeftWidth: 3.5,
    borderBottomLeftRadius: 12,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 3.5,
    borderRightWidth: 3.5,
    borderBottomRightRadius: 12,
  },
  laserBeam: {
    width: '100%',
    height: 2.5,
    backgroundColor: Colors.hudNeonGreen,
    shadowColor: Colors.hudNeonGreen,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 6,
    elevation: 4,
  },
  statusPill: {
    marginTop: 18,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingVertical: 7,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
});
