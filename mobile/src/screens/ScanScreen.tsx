import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  SafeAreaView,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Colors } from '../theme/colors';
import { CURATED_PRODUCTS, lookupProductByBarcode } from '../data/curated-products';
import { Product, UserPreferences } from '../types';
import { ReticleOverlay } from '../components/ReticleOverlay';
import { ProductCard } from '../components/ProductCard';
import { HeaderHUD } from '../components/HeaderHUD';
import { addScanRecord, getUserPreferences } from '../services/storage';
import { checkBackendHealth, scanBarcodeOrOCR } from '../services/api';

export const ScanScreen: React.FC = () => {
  const [permission, requestPermission] = useCameraPermissions();
  const [torchOn, setTorchOn] = useState(false);
  const [facing, setFacing] = useState<'back' | 'front'>('back');
  const [scannedProduct, setScannedProduct] = useState<Product | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [userPrefs, setUserPrefs] = useState<UserPreferences | null>(null);
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    loadUserContext();
    checkHealth();
  }, []);

  async function loadUserContext() {
    const prefs = await getUserPreferences();
    setUserPrefs(prefs);
  }

  async function checkHealth() {
    const health = await checkBackendHealth();
    setIsOnline(health.online);
  }

  async function handleProductDetected(barcode: string, fallbackProduct?: Product) {
    if (isProcessing) return;
    setIsProcessing(true);

    try {
      let product: Product | null = null;
      if (fallbackProduct) {
        product = fallbackProduct;
      } else {
        const result = await scanBarcodeOrOCR(
          barcode,
          '',
          userPrefs?.weightGoal || 'maintain',
          userPrefs?.muscleGoal || 'maintain'
        );
        product = result.product;
      }

      if (product) {
        setScannedProduct(product);
        setModalVisible(true);

        // Record scan history locally
        await addScanRecord({
          productId: product.id,
          productName: product.name,
          brand: product.brand,
          barcode: product.barcode,
          novaGroup: product.novaGroup,
          healthScore: product.healthScore,
          goalFitScore: product.goalFit.weightLossScore,
          syncedWithCloud: isOnline,
        });
      }
    } catch (err) {
      console.error('Scan processing error:', err);
    } finally {
      setIsProcessing(false);
    }
  }

  function handleBarcodeScanned({ data }: { data: string }) {
    if (modalVisible || isProcessing) return;
    handleProductDetected(data);
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <HeaderHUD
        title="BiteLens HUD"
        isOnline={isOnline}
        activeGoal={userPrefs?.weightGoal || 'Maintain'}
      />

      <View style={styles.container}>
        {/* Camera Viewfinder */}
        <View style={styles.cameraContainer}>
          {permission?.granted ? (
            <CameraView
              style={StyleSheet.absoluteFillObject}
              facing={facing}
              enableTorch={torchOn}
              onBarcodeScanned={handleBarcodeScanned}
              barcodeScannerSettings={{
                barcodeTypes: ['ean13', 'upc_a', 'ean8', 'qr'],
              }}
            />
          ) : (
            <View style={styles.permissionFallback}>
              <Text style={styles.fallbackIcon}>📷</Text>
              <Text style={styles.fallbackTitle}>Optical Label Scanner</Text>
              <Text style={styles.fallbackDesc}>
                Point camera at Indian packaged food barcodes or ingredients. Tap below to enable camera or test with curated samples.
              </Text>
              <TouchableOpacity
                style={styles.permissionBtn}
                onPress={requestPermission}
                activeOpacity={0.8}
              >
                <Text style={styles.permissionBtnText}>Enable Camera Viewfinder</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Bounding Reticle & Animated Scan Beam */}
          <ReticleOverlay
            isScanning={!modalVisible && !isProcessing}
            statusText={
              isProcessing
                ? 'Decoding FSSAI Ingredients...'
                : 'Center Barcode or Ingredients in Frame'
            }
          />

          {/* Camera Controls Floating Overlay */}
          <View style={styles.cameraControls}>
            <TouchableOpacity
              style={[styles.controlBtn, torchOn && styles.controlBtnActive]}
              onPress={() => setTorchOn(!torchOn)}
              activeOpacity={0.8}
            >
              <Text style={styles.controlIcon}>{torchOn ? '🔦' : '💡'}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.controlBtn}
              onPress={() => setFacing(facing === 'back' ? 'front' : 'back')}
              activeOpacity={0.8}
            >
              <Text style={styles.controlIcon}>🔄</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Food Sample Presets Bar */}
        <View style={styles.presetsSection}>
          <Text style={styles.presetSectionTitle}>Instant Test Presets</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.presetsList}
          >
            {CURATED_PRODUCTS.map(item => (
              <TouchableOpacity
                key={item.id}
                style={styles.presetChip}
                onPress={() => handleProductDetected(item.barcode, item)}
                activeOpacity={0.8}
              >
                <Text style={styles.presetChipName} numberOfLines={1}>
                  {item.name.split(' ')[0]} {item.name.split(' ')[1] || ''}
                </Text>
                <View
                  style={[
                    styles.presetNovaBadge,
                    {
                      backgroundColor:
                        item.novaGroup === 1 || item.novaGroup === 2
                          ? Colors.nova1Bg
                          : item.novaGroup === 3
                          ? Colors.nova3Bg
                          : Colors.nova4Bg,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.presetNovaText,
                      {
                        color:
                          item.novaGroup === 1 || item.novaGroup === 2
                            ? Colors.nova1
                            : item.novaGroup === 3
                            ? Colors.nova3
                            : Colors.nova4,
                      },
                    ]}
                  >
                    NOVA {item.novaGroup}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>

      {/* Scanned Product Telemetry Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalVisible(false)}
      >
        <SafeAreaView style={styles.modalSafeArea}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalHeaderTitle}>Decoded Telemetry Report</Text>
            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>
          </View>

          {scannedProduct && (
            <ScrollView contentContainerStyle={styles.modalContent}>
              <ProductCard
                product={scannedProduct}
                userPreferences={userPrefs || undefined}
              />

              {/* Goal Fit Explanation */}
              <View style={styles.modalSectionCard}>
                <Text style={styles.modalSectionTitle}>Goal Alignment Telemetry</Text>
                <Text style={styles.modalSectionBody}>
                  {scannedProduct.goalFit.summary}
                </Text>
              </View>

              {/* Detected Additives List */}
              <View style={styles.modalSectionCard}>
                <Text style={styles.modalSectionTitle}>
                  Decoded Additives & E-Numbers ({scannedProduct.detectedAdditives.length})
                </Text>
                {scannedProduct.detectedAdditives.length === 0 ? (
                  <Text style={styles.emptyAdditivesText}>
                    Zero synthetic chemical additives detected in this product. Clean natural whole food formulation.
                  </Text>
                ) : (
                  scannedProduct.detectedAdditives.map(ins => (
                    <View key={ins.insCode} style={styles.additiveItem}>
                      <View style={styles.additiveItemHeader}>
                        <Text style={styles.additiveInsCode}>{ins.insCode}</Text>
                        <Text style={styles.additiveName}>{ins.name}</Text>
                      </View>
                      <Text style={styles.additiveCategory}>
                        {ins.category} • Origin: {ins.origin}
                      </Text>
                      <Text style={styles.additivePlainEnglish}>
                        {ins.plainEnglish}
                      </Text>
                    </View>
                  ))
                )}
              </View>

              {/* Raw Ingredients Disclosed */}
              <View style={styles.modalSectionCard}>
                <Text style={styles.modalSectionTitle}>Disclosed Back-of-Pack Ingredients</Text>
                <Text style={styles.rawIngredientsText}>
                  {scannedProduct.ingredientsRaw}
                </Text>
                {scannedProduct.fssaiLicense && (
                  <Text style={styles.fssaiTag}>
                    FSSAI License: {scannedProduct.fssaiLicense}
                  </Text>
                )}
              </View>
            </ScrollView>
          )}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: Colors.hudDark,
    overflow: 'hidden',
    position: 'relative',
  },
  permissionFallback: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.hudDark,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  fallbackIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  fallbackTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  fallbackDesc: {
    fontSize: 13,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  permissionBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 12,
  },
  permissionBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  cameraControls: {
    position: 'absolute',
    top: 16,
    right: 16,
    gap: 12,
  },
  controlBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  controlBtnActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.hudNeonGreen,
  },
  controlIcon: {
    fontSize: 18,
  },
  presetsSection: {
    backgroundColor: Colors.surface,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  presetSectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 10,
  },
  presetsList: {
    gap: 8,
    paddingRight: 16,
  },
  presetChip: {
    backgroundColor: Colors.surfaceAlt,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    gap: 4,
  },
  presetChipName: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  presetNovaBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  presetNovaText: {
    fontSize: 10,
    fontWeight: '800',
  },
  modalSafeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  modalHeaderTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  modalContent: {
    padding: 16,
    gap: 12,
  },
  modalSectionCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modalSectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  modalSectionBody: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  emptyAdditivesText: {
    fontSize: 13,
    color: Colors.success,
    fontWeight: '600',
    lineHeight: 18,
  },
  additiveItem: {
    backgroundColor: Colors.surfaceAlt,
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
  },
  additiveItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  additiveInsCode: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.primary,
    fontFamily: 'monospace',
  },
  additiveName: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
    flex: 1,
  },
  additiveCategory: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '600',
    marginBottom: 4,
  },
  additivePlainEnglish: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
  rawIngredientsText: {
    fontSize: 12,
    color: Colors.textMuted,
    lineHeight: 17,
  },
  fssaiTag: {
    marginTop: 8,
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },
});
