import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Colors } from '../theme/colors';

import { ScanScreen } from '../screens/ScanScreen';
import { DecoderScreen } from '../screens/DecoderScreen';
import { ToolsScreen } from '../screens/ToolsScreen';
import { CalculatorsScreen } from '../screens/CalculatorsScreen';
import { ProfileScreen } from '../screens/ProfileScreen';

export type RootTabParamList = {
  Scan: undefined;
  Decoder: undefined;
  Tools: undefined;
  Calculators: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

export const RootNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      initialRouteName="Scan"
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      <Tab.Screen
        name="Scan"
        component={ScanScreen}
        options={{
          tabBarLabel: 'Scanner',
          tabBarIcon: ({ focused }) => (
            <View style={[styles.iconWrapper, focused && styles.iconWrapperActive]}>
              <Text style={styles.tabEmoji}>📷</Text>
            </View>
          ),
        }}
      />

      <Tab.Screen
        name="Decoder"
        component={DecoderScreen}
        options={{
          tabBarLabel: 'Decoder',
          tabBarIcon: ({ focused }) => (
            <View style={[styles.iconWrapper, focused && styles.iconWrapperActive]}>
              <Text style={styles.tabEmoji}>🧪</Text>
            </View>
          ),
        }}
      />

      <Tab.Screen
        name="Tools"
        component={ToolsScreen}
        options={{
          tabBarLabel: 'Tools',
          tabBarIcon: ({ focused }) => (
            <View style={[styles.iconWrapper, focused && styles.iconWrapperActive]}>
              <Text style={styles.tabEmoji}>⚖️</Text>
            </View>
          ),
        }}
      />

      <Tab.Screen
        name="Calculators"
        component={CalculatorsScreen}
        options={{
          tabBarLabel: 'Calculators',
          tabBarIcon: ({ focused }) => (
            <View style={[styles.iconWrapper, focused && styles.iconWrapperActive]}>
              <Text style={styles.tabEmoji}>📏</Text>
            </View>
          ),
        }}
      />

      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ focused }) => (
            <View style={[styles.iconWrapper, focused && styles.iconWrapperActive]}>
              <Text style={styles.tabEmoji}>👤</Text>
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    height: 64,
    paddingBottom: 8,
    paddingTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 8,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '700',
  },
  iconWrapper: {
    padding: 3,
    borderRadius: 8,
  },
  iconWrapperActive: {
    backgroundColor: Colors.primaryLight,
  },
  tabEmoji: {
    fontSize: 18,
  },
});
