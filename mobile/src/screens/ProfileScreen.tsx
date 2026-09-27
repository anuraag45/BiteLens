import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Alert
} from 'react-native';
import { Colors } from '../theme/colors';
import { DietaryRules, ScanHistoryItem, UserProfile } from '../types';
import { apiClient } from '../api/client';

interface ProfileScreenProps {
  dietaryRules: DietaryRules;
  onUpdateDietaryRules: (rules: DietaryRules) => void;
  scanHistory: ScanHistoryItem[];
  favorites: string[];
  onToggleFavorite: (barcode: string) => void;
  onSelectProductBarcode: (barcode: string) => void;
  onClearHistory: () => void;
  onClose: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  dietaryRules,
  onUpdateDietaryRules,
  scanHistory,
  favorites,
  onToggleFavorite,
  onSelectProductBarcode,
  onClearHistory,
  onClose
}) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [authMode, setAuthMode] = useState<'view' | 'login' | 'signup'>('view');

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [birthDate, setBirthDate] = useState('2000-01-01');
  const [parentEmail, setParentEmail] = useState('');
  const [consentToken, setConsentToken] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Required Fields', 'Please enter both email and password.');
      return;
    }
    setIsSubmitting(true);
    const res = await apiClient.login({ email, password });
    setIsSubmitting(false);

    if (res.success && res.data) {
      setCurrentUser(res.data);
      setAuthMode('view');
      Alert.alert('Login Successful', `Welcome back, ${res.data.name}!`);
    } else {
      Alert.alert('Login Failed', res.error || 'Check your credentials.');
    }
  };

  const handleSignup = async () => {
    if (!name || !email || !password || !birthDate) {
      Alert.alert('Required Fields', 'Please fill in all signup fields.');
      return;
    }
    setIsSubmitting(true);
    const res = await apiClient.signup({ name, email, password, birth_date: birthDate });
    setIsSubmitting(false);

    if (res.success && res.data) {
      setCurrentUser(res.data);
      setAuthMode('view');
      Alert.alert('Account Created', `Welcome to BiteLens, ${res.data.name}!`);
    } else {
      Alert.alert('Signup Failed', res.error || 'Could not create account.');
    }
  };

  const handleParentalConsent = async () => {
    if (!parentEmail || !consentToken) {
      Alert.alert('Required Fields', 'Please provide parent email and consent token.');
      return;
    }
    setIsSubmitting(true);
    const res = await apiClient.submitParentalConsent({
      parent_email: parentEmail,
      consent_token: consentToken
    });
    setIsSubmitting(false);

    if (res.success) {
      Alert.alert('Parental Consent Verified', 'Parental consent recorded successfully.');
      if (currentUser) {
        setCurrentUser({ ...currentUser, parentalConsentGiven: true });
      }
    } else {
      Alert.alert('Consent Verification Failed', res.error || 'Invalid token.');
    }
  };

  const toggleRule = (ruleKey: keyof DietaryRules) => {
    const updated = {
      ...dietaryRules,
      [ruleKey]: !dietaryRules[ruleKey]
    };
    onUpdateDietaryRules(updated);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <Text style={styles.headerEmoji}>👤</Text>
          <View>
            <Text style={styles.headerTitle}>User & Family Health</Text>
            <Text style={styles.headerSubtitle}>Account, Dietary Shields & Scan Ledger</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.closeCircle} onPress={onClose}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.contentArea} showsVerticalScrollIndicator={false}>
        {/* Account Status Card */}
        <View style={styles.card}>
          <View style={styles.accountHeaderRow}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarEmoji}>{currentUser ? '👨‍💻' : '⚡'}</Text>
            </View>
            <View style={styles.accountInfo}>
              <Text style={styles.accountName}>
                {currentUser ? currentUser.name : 'Guest User'}
              </Text>
              <Text style={styles.accountStatus}>
                {currentUser ? `Synced: ${currentUser.email}` : 'Local Mode • Instant Access'}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.authToggleBtn}
              onPress={() => setAuthMode(authMode === 'view' ? 'login' : 'view')}
            >
              <Text style={styles.authToggleText}>
                {currentUser ? 'Sign Out' : authMode === 'view' ? 'Sign In' : 'Cancel'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Minor Status & Parental Consent Badge */}
          {currentUser?.isMinor && (
            <View style={styles.minorBanner}>
              <Text style={styles.minorEmoji}>🛡️</Text>
              <View style={styles.minorTextContainer}>
                <Text style={styles.minorTitle}>Minor Protection Active (Age {currentUser.age})</Text>
                <Text style={styles.minorSubtitle}>
                  {currentUser.parentalConsentGiven
                    ? '✅ Parental Consent Verified (DPDP Act 2023 Compliant)'
                    : '⚠️ Parental consent required to unlock high-caffeine alerts'}
                </Text>
              </View>
            </View>
          )}

          {/* Auth Forms */}
          {authMode === 'login' && !currentUser && (
            <View style={styles.formContainer}>
              <Text style={styles.formTitle}>Sign In with BiteLens Account</Text>
              <TextInput
                style={styles.input}
                placeholder="Email address"
                placeholderTextColor={Colors.textLight}
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor={Colors.textLight}
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity
                style={styles.submitBtn}
                onPress={handleLogin}
                disabled={isSubmitting}
              >
                <Text style={styles.submitBtnText}>
                  {isSubmitting ? 'Signing in...' : 'Sign In'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setAuthMode('signup')}>
                <Text style={styles.switchAuthText}>New user? Create an account ➔</Text>
              </TouchableOpacity>
            </View>
          )}

          {authMode === 'signup' && !currentUser && (
            <View style={styles.formContainer}>
              <Text style={styles.formTitle}>Create BiteLens Account</Text>
              <TextInput
                style={styles.input}
                placeholder="Full Name"
                placeholderTextColor={Colors.textLight}
                value={name}
                onChangeText={setName}
              />
              <TextInput
                style={styles.input}
                placeholder="Email address"
                placeholderTextColor={Colors.textLight}
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor={Colors.textLight}
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
              <TextInput
                style={styles.input}
                placeholder="Birth Date (YYYY-MM-DD)"
                placeholderTextColor={Colors.textLight}
                value={birthDate}
                onChangeText={setBirthDate}
              />
              <TouchableOpacity
                style={styles.submitBtn}
                onPress={handleSignup}
                disabled={isSubmitting}
              >
                <Text style={styles.submitBtnText}>
                  {isSubmitting ? 'Creating account...' : 'Sign Up'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setAuthMode('login')}>
                <Text style={styles.switchAuthText}>Already have an account? Sign in ➔</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Parental Consent Submission Modal (if minor and not verified) */}
          {currentUser?.isMinor && !currentUser.parentalConsentGiven && (
            <View style={styles.consentForm}>
              <Text style={styles.formTitle}>Submit Parental Consent Token</Text>
              <TextInput
                style={styles.input}
                placeholder="Parent Email"
                placeholderTextColor={Colors.textLight}
                value={parentEmail}
                onChangeText={setParentEmail}
              />
              <TextInput
                style={styles.input}
                placeholder="Consent Token / Code"
                placeholderTextColor={Colors.textLight}
                value={consentToken}
                onChangeText={setConsentToken}
              />
              <TouchableOpacity
                style={styles.submitBtn}
                onPress={handleParentalConsent}
                disabled={isSubmitting}
              >
                <Text style={styles.submitBtnText}>Verify Consent</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Dietary Guardrails Card */}
        <View style={styles.card}>
          <Text style={styles.sectionHeader}>Personal Dietary Guardrails</Text>
          <Text style={styles.sectionDesc}>
            Applied automatically whenever a packaging barcode is scanned.
          </Text>

          {[
            { key: 'vegetarian' as const, emoji: '🥦', title: 'Strict Vegetarian & Vegan', desc: 'Flags Carmine (INS 120), Gelatin & Shellac' },
            { key: 'diabetic' as const, emoji: '🩸', title: 'Diabetic & Low Glycemic Shield', desc: 'Flags Sugars > 5g/100g, Maltodextrin & Syrups' },
            { key: 'lowSodium' as const, emoji: '🧂', title: 'Low Sodium Heart Radar', desc: 'Flags Sodium > 400mg/100g' },
            { key: 'glutenFree' as const, emoji: '🌾', title: 'Gluten-Free Shield', desc: 'Flags Wheat, Maida, Barley & Malt' },
            { key: 'lactoseFree' as const, emoji: '🥛', title: 'Lactose & Dairy-Free', desc: 'Flags Milk solids, Whey & Butterfat' }
          ].map(rule => {
            const isEnabled = dietaryRules[rule.key];
            return (
              <TouchableOpacity
                key={rule.key}
                style={[styles.ruleRow, isEnabled && styles.ruleRowActive]}
                onPress={() => toggleRule(rule.key)}
              >
                <Text style={styles.ruleEmoji}>{rule.emoji}</Text>
                <View style={styles.ruleInfo}>
                  <Text style={styles.ruleTitle}>{rule.title}</Text>
                  <Text style={styles.ruleDesc}>{rule.desc}</Text>
                </View>
                <View style={[styles.toggleCheckbox, isEnabled && styles.toggleCheckboxActive]}>
                  {isEnabled && <Text style={styles.checkMark}>✓</Text>}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Recent Scan History & Favorites */}
        <View style={styles.card}>
          <View style={styles.historyHeaderRow}>
            <Text style={styles.sectionHeader}>Scan History & Ledger</Text>
            {scanHistory.length > 0 && (
              <TouchableOpacity onPress={onClearHistory}>
                <Text style={styles.clearText}>Clear</Text>
              </TouchableOpacity>
            )}
          </View>

          {scanHistory.length === 0 ? (
            <View style={styles.emptyHistory}>
              <Text style={styles.emptyEmoji}>🕒</Text>
              <Text style={styles.emptyTitle}>No Scans Recorded Yet</Text>
              <Text style={styles.emptySubtitle}>
                Your scanned packaged food items will appear here for fast re-inspection.
              </Text>
            </View>
          ) : (
            scanHistory.map((item, idx) => {
              const isFav = favorites.includes(item.barcode);
              return (
                <TouchableOpacity
                  key={idx}
                  style={styles.historyItem}
                  onPress={() => onSelectProductBarcode(item.barcode)}
                >
                  <View style={styles.historyEmojiBox}>
                    <Text style={styles.historyEmoji}>{item.image || '📦'}</Text>
                  </View>
                  <View style={styles.historyInfo}>
                    <Text style={styles.historyBrand}>{item.brand}</Text>
                    <Text style={styles.historyName} numberOfLines={1}>{item.name}</Text>
                    <Text style={styles.historyScore}>
                      NOVA {item.novaGroup} • {item.healthScore}/100 Score
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.favStarButton}
                    onPress={() => onToggleFavorite(item.barcode)}
                  >
                    <Text style={styles.favStarEmoji}>{isFav ? '⭐' : '☆'}</Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              );
            })
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
  accountHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center'
  },
  avatarEmoji: {
    fontSize: 22
  },
  accountInfo: {
    flex: 1
  },
  accountName: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textMain
  },
  accountStatus: {
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 1
  },
  authToggleBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: Colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: Colors.border
  },
  authToggleText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primaryDark
  },
  minorBanner: {
    marginTop: 12,
    backgroundColor: '#FEF3C7',
    borderRadius: 10,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#FDE68A'
  },
  minorEmoji: {
    fontSize: 20
  },
  minorTextContainer: {
    flex: 1
  },
  minorTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#92400E'
  },
  minorSubtitle: {
    fontSize: 9,
    color: '#B45309',
    marginTop: 1
  },
  formContainer: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight
  },
  consentForm: {
    marginTop: 12,
    padding: 10,
    backgroundColor: Colors.surfaceSubtle,
    borderRadius: 10
  },
  formTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.textMain,
    marginBottom: 8
  },
  input: {
    backgroundColor: Colors.surfaceSubtle,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 12,
    color: Colors.textMain,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border
  },
  submitBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 4
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700'
  },
  switchAuthText: {
    fontSize: 11,
    color: Colors.primaryDark,
    textAlign: 'center',
    marginTop: 8,
    fontWeight: '600'
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.textMain,
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  sectionDesc: {
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 2,
    marginBottom: 8
  },
  ruleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: Colors.surfaceSubtle,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: Colors.border
  },
  ruleRowActive: {
    backgroundColor: Colors.primaryLight,
    borderColor: '#C8E6C9'
  },
  ruleEmoji: {
    fontSize: 18,
    marginRight: 10
  },
  ruleInfo: {
    flex: 1
  },
  ruleTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textMain
  },
  ruleDesc: {
    fontSize: 9,
    color: Colors.textMuted,
    marginTop: 1
  },
  toggleCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center'
  },
  toggleCheckboxActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary
  },
  checkMark: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900'
  },
  historyHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  clearText: {
    fontSize: 10,
    color: Colors.danger,
    fontWeight: '700'
  },
  emptyHistory: {
    alignItems: 'center',
    paddingVertical: 16
  },
  emptyEmoji: {
    fontSize: 28,
    marginBottom: 4
  },
  emptyTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textMain
  },
  emptySubtitle: {
    fontSize: 9,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 1
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight
  },
  historyEmojiBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: Colors.surfaceSubtle,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8
  },
  historyEmoji: {
    fontSize: 20
  },
  historyInfo: {
    flex: 1
  },
  historyBrand: {
    fontSize: 8,
    fontWeight: '700',
    color: Colors.textLight,
    textTransform: 'uppercase'
  },
  historyName: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textMain
  },
  historyScore: {
    fontSize: 9,
    color: Colors.primaryDark,
    fontWeight: '600',
    marginTop: 1
  },
  favStarButton: {
    padding: 6
  },
  favStarEmoji: {
    fontSize: 16
  }
});
