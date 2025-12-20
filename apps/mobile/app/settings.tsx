/**
 * Settings Screen
 * User preferences and app configuration
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Switch,
  StyleSheet,
  Alert,
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router, Stack } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import Animated, {
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { tokens, normalize, scale } from '../lib/styles/unified';

// Settings Data
interface SettingItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: keyof typeof Feather.glyphMap;
  type: 'toggle' | 'link' | 'action';
  value?: boolean;
  route?: string;
  action?: () => void;
}

interface SettingSection {
  title: string;
  items: SettingItem[];
}

// Setting Row Component
interface SettingRowProps {
  item: SettingItem;
  isLast: boolean;
  onToggle?: (value: boolean) => void;
  toggleValue?: boolean;
}

function SettingRow({ item, isLast, onToggle, toggleValue }: SettingRowProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (item.type !== 'toggle') {
      scale.value = withTiming(0.98, { duration: 100 });
    }
  };

  const handlePressOut = () => {
    scale.value = withTiming(1, { duration: 150 });
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (item.type === 'link' && item.route) {
      router.push(item.route as any);
    } else if (item.type === 'action' && item.action) {
      item.action();
    }
  };

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={item.type !== 'toggle' ? handlePress : undefined}
      disabled={item.type === 'toggle'}
    >
      <Animated.View
        style={[
          styles.settingRow,
          !isLast && styles.settingRowBorder,
          animatedStyle,
        ]}
      >
        <View style={styles.settingIconContainer}>
          <Feather name={item.icon} size={20} color={tokens.colors.primary} />
        </View>

        <View style={styles.settingContent}>
          <Text style={styles.settingTitle}>{item.title}</Text>
          {item.subtitle && (
            <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
          )}
        </View>

        {item.type === 'toggle' && (
          <Switch
            value={toggleValue}
            onValueChange={(value) => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onToggle?.(value);
            }}
            trackColor={{
              false: tokens.colors.border.default,
              true: tokens.colors.primaryLight,
            }}
            thumbColor={toggleValue ? tokens.colors.primary : '#f4f3f4'}
          />
        )}

        {item.type === 'link' && (
          <Feather
            name="chevron-right"
            size={20}
            color={tokens.colors.text.tertiary}
          />
        )}

        {item.type === 'action' && (
          <Feather
            name="chevron-right"
            size={20}
            color={tokens.colors.text.tertiary}
          />
        )}
      </Animated.View>
    </Pressable>
  );
}

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();

  // Toggle states
  const [notifications, setNotifications] = useState(true);
  const [eventReminders, setEventReminders] = useState(true);
  const [pointsAlerts, setPointsAlerts] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [haptics, setHaptics] = useState(true);
  const [locationServices, setLocationServices] = useState(true);

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            router.replace('/auth/login');
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. All your data will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            // Handle account deletion
          },
        },
      ]
    );
  };

  const handleClearCache = () => {
    Alert.alert(
      'Clear Cache',
      'This will clear all cached data. You may need to reload some content.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert('Success', 'Cache cleared successfully');
          },
        },
      ]
    );
  };

  const SETTINGS_SECTIONS: SettingSection[] = [
    {
      title: 'Notifications',
      items: [
        {
          id: 'push',
          title: 'Push Notifications',
          subtitle: 'Receive updates about events',
          icon: 'bell',
          type: 'toggle',
          value: notifications,
        },
        {
          id: 'reminders',
          title: 'Event Reminders',
          subtitle: '24 hours before events',
          icon: 'clock',
          type: 'toggle',
          value: eventReminders,
        },
        {
          id: 'points',
          title: 'Points & Rewards',
          subtitle: 'Get notified about rewards',
          icon: 'gift',
          type: 'toggle',
          value: pointsAlerts,
        },
      ],
    },
    {
      title: 'Appearance',
      items: [
        {
          id: 'darkMode',
          title: 'Dark Mode',
          subtitle: 'Switch to dark theme',
          icon: 'moon',
          type: 'toggle',
          value: darkMode,
        },
        {
          id: 'haptics',
          title: 'Haptic Feedback',
          subtitle: 'Vibration on interactions',
          icon: 'smartphone',
          type: 'toggle',
          value: haptics,
        },
      ],
    },
    {
      title: 'Privacy',
      items: [
        {
          id: 'location',
          title: 'Location Services',
          subtitle: 'For nearby events',
          icon: 'map-pin',
          type: 'toggle',
          value: locationServices,
        },
        {
          id: 'privacy',
          title: 'Privacy Policy',
          icon: 'shield',
          type: 'link',
          route: '/privacy',
        },
      ],
    },
    {
      title: 'Support',
      items: [
        {
          id: 'help',
          title: 'Help Center',
          icon: 'help-circle',
          type: 'link',
          route: '/help',
        },
        {
          id: 'feedback',
          title: 'Send Feedback',
          icon: 'message-square',
          type: 'link',
          route: '/feedback',
        },
        {
          id: 'rate',
          title: 'Rate CampusPulse',
          icon: 'star',
          type: 'action',
          action: () => {
            Linking.openURL('https://apps.apple.com/app/campuspulse');
          },
        },
      ],
    },
    {
      title: 'Data',
      items: [
        {
          id: 'cache',
          title: 'Clear Cache',
          subtitle: 'Free up storage space',
          icon: 'trash-2',
          type: 'action',
          action: handleClearCache,
        },
        {
          id: 'export',
          title: 'Export My Data',
          icon: 'download',
          type: 'action',
          action: () => {
            Alert.alert('Export Data', 'Your data export will be sent to your email.');
          },
        },
      ],
    },
    {
      title: 'Account',
      items: [
        {
          id: 'logout',
          title: 'Log Out',
          icon: 'log-out',
          type: 'action',
          action: handleLogout,
        },
        {
          id: 'delete',
          title: 'Delete Account',
          icon: 'user-x',
          type: 'action',
          action: handleDeleteAccount,
        },
      ],
    },
  ];

  const getToggleValue = (id: string) => {
    switch (id) {
      case 'push': return notifications;
      case 'reminders': return eventReminders;
      case 'points': return pointsAlerts;
      case 'darkMode': return darkMode;
      case 'haptics': return haptics;
      case 'location': return locationServices;
      default: return false;
    }
  };

  const handleToggle = (id: string, value: boolean) => {
    switch (id) {
      case 'push': setNotifications(value); break;
      case 'reminders': setEventReminders(value); break;
      case 'points': setPointsAlerts(value); break;
      case 'darkMode': setDarkMode(value); break;
      case 'haptics': setHaptics(value); break;
      case 'location': setLocationServices(value); break;
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      {/* Header */}
      <LinearGradient
        colors={['#FF6B35', '#FF8F5C']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: insets.top }]}
      >
        <View style={styles.headerContent}>
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.back();
            }}
            style={styles.backButton}
          >
            <Feather name="arrow-left" size={24} color={tokens.colors.white} />
          </Pressable>
          <Text style={styles.headerTitle}>Settings</Text>
          <View style={styles.headerSpacer} />
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {SETTINGS_SECTIONS.map((section, sectionIndex) => (
          <Animated.View
            key={section.title}
            entering={FadeInDown.delay(100 + sectionIndex * 50).duration(400)}
            style={styles.section}
          >
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionCard}>
              {section.items.map((item, index) => (
                <SettingRow
                  key={item.id}
                  item={item}
                  isLast={index === section.items.length - 1}
                  toggleValue={getToggleValue(item.id)}
                  onToggle={(value) => handleToggle(item.id, value)}
                />
              ))}
            </View>
          </Animated.View>
        ))}

        {/* App Version */}
        <Animated.View
          entering={FadeInDown.delay(500).duration(400)}
          style={styles.versionContainer}
        >
          <Text style={styles.versionText}>CampusPulse v1.0.0</Text>
          <Text style={styles.versionSubtext}>Made with ❤️ for students</Text>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.colors.background.secondary,
  },
  header: {
    paddingBottom: scale(20),
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: scale(16),
    paddingTop: scale(16),
  },
  backButton: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: normalize(20),
    fontWeight: '700',
    color: tokens.colors.white,
    letterSpacing: -0.3,
  },
  headerSpacer: {
    width: scale(40),
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: scale(16),
  },
  section: {
    marginBottom: scale(24),
  },
  sectionTitle: {
    fontSize: normalize(13),
    fontWeight: '600',
    color: tokens.colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: scale(8),
    marginLeft: scale(4),
  },
  sectionCard: {
    backgroundColor: tokens.colors.surface.primary,
    borderRadius: scale(16),
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: scale(14),
    paddingHorizontal: scale(16),
  },
  settingRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.border.light,
  },
  settingIconContainer: {
    width: scale(36),
    height: scale(36),
    borderRadius: scale(10),
    backgroundColor: tokens.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: scale(12),
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: normalize(15),
    fontWeight: '600',
    color: tokens.colors.text.primary,
    letterSpacing: -0.2,
  },
  settingSubtitle: {
    fontSize: normalize(13),
    color: tokens.colors.text.tertiary,
    marginTop: scale(2),
  },
  versionContainer: {
    alignItems: 'center',
    paddingVertical: scale(32),
  },
  versionText: {
    fontSize: normalize(14),
    color: tokens.colors.text.tertiary,
    fontWeight: '500',
  },
  versionSubtext: {
    fontSize: normalize(12),
    color: tokens.colors.text.disabled,
    marginTop: scale(4),
  },
});
