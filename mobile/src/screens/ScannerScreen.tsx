import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  Platform,
  Alert
} from 'react-native';
import { Colors } from '../theme/colors';
import { audioHaptics } from '../services/audioHaptics';

interface ScannerScreenProps {
  onClose: () => void;
  onBarcodeScanned: (barcode: string) => void;
}

export const ScannerScreen: React.FC<ScannerScreenProps> = ({ onClose, onBarcodeScanned }) => {
  const [torchOn, setTorchOn] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [manualCode, setManualCode] = useState('');
  const [isMuted, setIsMuted] = useState(audioHaptics.getMuted());

  const handleScanAction = (code: string) => {
    audioHaptics.triggerSuccessFeedback();
    onBarcodeScanned(code);
  };

  const handleManualSubmit = () => {
    if (!manualCode.trim()) {
      Alert.alert('Invalid Input', 'Please enter a barcode number.');
      return;
    }
    handleScanAction(manualCode.trim());
    setManualCode('');
  };

  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    audioHaptics.setMuted(next);
  };

  const sampleBarcodes = [
    { label: 'Maggi', code: '8901030383178', emoji: '🍜', tag: 'NOVA 4' },
    { label: 'Parle-G', code: '8901063004071', emoji: '🍪', tag: 'NOVA 4' },
    { label: 'Makhana', code: '8901725134821', emoji: '🫘', tag: 'NOVA 2' },
    { label: 'Amul Butter', code: '8901262010016', emoji: '🧈', tag: 'NOVA 2' },
    { label: 'Lay\'s', code: '8901058852391', emoji: '🥔', tag: 'NOVA 4' },
    { label: 'Dairy Milk', code: '7622201824103', emoji: '🍫', tag: 'NOVA 4' }
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header */}
      <View style={styles.topHeader}>
        <TouchableOpacity style={styles.circleButton} onPress={onClose}>
          <Text style={styles.headerButtonText}>✕</Text>
        </TouchableOpacity>

        <View style={styles.titleContainer}>
          <Text style={styles.title}>Live Food Scanner</Text>
          <Text style={styles.subtitle}>Align packaging barcode in HUD</Text>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.circleButton} onPress={toggleMute}>
            <Text style={styles.headerEmoji}>{isMuted ? '🔇' : '🔊'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.circleButton, torchOn && styles.circleButtonActive]}
            onPress={() => setTorchOn(!torchOn)}
          >
            <Text style={styles.headerEmoji}>⚡</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Viewfinder Area */}
      <View style={styles.viewfinderContainer}>
        {/* Reticle Brackets */}
        <View style={styles.reticle}>
          <View style={[styles.corner, styles.cornerTL]} />
          <View style={[styles.corner, styles.cornerTR]} />
          <View style={[styles.corner, styles.cornerBL]} />
          <View style={[styles.corner, styles.cornerBR]} />

          {/* Laser Line */}
          <View style={styles.laserLine} />

          <Text style={styles.hudLabel}>EAN-13 / GS1 RADAR</Text>
        </View>

        {/* Zoom Controls */}
        <View style={styles.zoomBar}>
          <Text style={styles.zoomTitle}>ZOOM</Text>
          {[1, 2, 3].map(z => (
            <TouchableOpacity
              key={z}
              style={[styles.zoomPill, zoomLevel === z && styles.zoomPillActive]}
              onPress={() => setZoomLevel(z)}
            >
              <Text style={[styles.zoomText, zoomLevel === z && styles.zoomTextActive]}>
                {z}x
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Bottom Control Deck */}
      <View style={styles.controlDeck}>
        {/* Manual Barcode Input */}
        <View style={styles.manualInputRow}>
          <TextInput
            style={styles.manualInput}
            placeholder="Enter barcode digits (e.g. 8901030383178)"
            placeholderTextColor="#64748B"
            keyboardType="numeric"
            value={manualCode}
            onChangeText={setManualCode}
            onSubmitEditing={handleManualSubmit}
            returnKeyType="done"
          />
          <TouchableOpacity
            style={styles.decodeButton}
            onPress={handleManualSubmit}
            accessibilityRole="button"
            accessibilityLabel="Decode entered barcode"
          >
            <Text style={styles.decodeButtonText}>Decode</Text>
          </TouchableOpacity>
        </View>

        {/* 1-Tap Sample Barcodes */}
        <Text style={styles.samplesHeader}>Tap to test verified Indian grocery items:</Text>
        <View style={styles.samplesGrid}>
          {sampleBarcodes.map(item => (
            <TouchableOpacity
              key={item.code}
              style={styles.sampleButton}
              onPress={() => handleScanAction(item.code)}
            >
              <Text style={styles.sampleEmoji}>{item.emoji}</Text>
              <View style={styles.sampleTextContainer}>
                <Text style={styles.sampleLabel} numberOfLines={1}>{item.label}</Text>
                <Text style={styles.sampleTag}>{item.tag}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090D16'
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)'
  },
  circleButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  circleButtonActive: {
    backgroundColor: '#F59E0B'
  },
  headerButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700'
  },
  headerEmoji: {
    fontSize: 16
  },
  titleContainer: {
    alignItems: 'center'
  },
  title: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700'
  },
  subtitle: {
    color: '#34D399',
    fontSize: 10,
    fontWeight: '600'
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8
  },
  viewfinderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#020617'
  },
  reticle: {
    width: 260,
    height: 200,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative'
  },
  corner: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderColor: '#34D399'
  },
  cornerTL: { top: -2, left: -2, borderTopWidth: 4, borderLeftWidth: 4, borderTopLeftRadius: 8 },
  cornerTR: { top: -2, right: -2, borderTopWidth: 4, borderRightWidth: 4, borderTopRightRadius: 8 },
  cornerBL: { bottom: -2, left: -2, borderBottomWidth: 4, borderLeftWidth: 4, borderBottomLeftRadius: 8 },
  cornerBR: { bottom: -2, right: -2, borderBottomWidth: 4, borderRightWidth: 4, borderBottomRightRadius: 8 },
  laserLine: {
    width: '90%',
    height: 3,
    backgroundColor: '#00FF9D',
    shadowColor: '#00FF9D',
    shadowOpacity: 0.9,
    shadowRadius: 10,
    elevation: 8,
    borderRadius: 2
  },
  hudLabel: {
    position: 'absolute',
    bottom: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 10,
    fontWeight: '800',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    letterSpacing: 1
  },
  zoomBar: {
    position: 'absolute',
    bottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 99,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)'
  },
  zoomTitle: {
    color: '#94A3B8',
    fontSize: 9,
    fontWeight: '800',
    marginRight: 4
  },
  zoomPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 99,
    backgroundColor: 'rgba(255, 255, 255, 0.2)'
  },
  zoomPillActive: {
    backgroundColor: Colors.primary
  },
  zoomText: {
    color: '#CBD5E1',
    fontSize: 11,
    fontWeight: '700'
  },
  zoomTextActive: {
    color: '#FFFFFF'
  },
  controlDeck: {
    backgroundColor: '#0F172A',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)'
  },
  manualInputRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12
  },
  manualInput: {
    flex: 1,
    backgroundColor: '#1E293B',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace'
  },
  decodeButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center'
  },
  decodeButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700'
  },
  samplesHeader: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8
  },
  samplesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  sampleButton: {
    width: '31.5%',
    backgroundColor: '#1E293B',
    borderRadius: 10,
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  sampleEmoji: {
    fontSize: 18
  },
  sampleTextContainer: {
    flex: 1
  },
  sampleLabel: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700'
  },
  sampleTag: {
    color: '#34D399',
    fontSize: 8,
    fontWeight: '800'
  }
});
