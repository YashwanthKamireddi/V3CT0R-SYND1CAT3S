/**
 * Tab Layout - CampusPulse Design System
 * Custom tab bar with smooth animations and haptic feedback
 */

import React from 'react';
import { Feather } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { View, Platform, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { theme } from '@/lib/constants/theme';

type IconName = 'home' | 'search' | 'ticket' | 'user' | 'compass';

interface TabBarIconProps {
  name: IconName;
  color: string;
  focused: boolean;
}

function TabBarIcon({ name, color, focused }: TabBarIconProps) {
  const iconMap: Record<IconName, keyof typeof Feather.glyphMap> = {
    home: 'home',
    search: 'search',
    compass: 'compass',
    ticket: 'bookmark',
    user: 'user',
  };

  return (
    <View style={styles.iconContainer}>
      <Feather name={iconMap[name]} size={20} color={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 24,
    height: 24,
  },
});

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  const handleTabPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary[500],
        tabBarInactiveTintColor: theme.colors.neutral[400],
        tabBarStyle: {
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 56 + (insets.bottom > 0 ? insets.bottom : 10),
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E8E8E8',
          paddingTop: 6,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 10,
          paddingHorizontal: 8,
          ...Platform.select({
            ios: {
              shadowColor: '#000',
              shadowOffset: { width: 0, height: -2 },
              shadowOpacity: 0.06,
              shadowRadius: 8,
            },
            android: {
              elevation: 8,
            },
          }),
        },
        headerShown: false,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          marginTop: 0,
          marginBottom: 2,
        },
        tabBarItemStyle: {
          paddingVertical: 4,
        },
      }}
      screenListeners={{
        tabPress: handleTabPress,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name="home" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name="compass" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="tickets"
        options={{
          title: 'My Events',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name="ticket" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name="user" color={color} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}
