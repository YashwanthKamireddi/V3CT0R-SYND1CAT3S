/**
 * Profile Screen - CampusPulse Design System
 * Production-ready with unified typography and layout
 */

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Image,
  StyleSheet,
  Switch,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Animated, {
  FadeInDown,
  FadeInRight,
  useAnimatedStyle,
  withTiming,
  useSharedValue,
} from 'react-native-reanimated';

import { tokens, layout } from '@/lib/styles/unified';

// Student Profile Data
const USER = {
  name: 'Yashwanth Kamireddi',
  email: 'yashwanth.k@gitam.in',
  avatar: 'https://i.pravatar.cc/200?img=12',
  phone: '+91 63026 83827',
  memberSince: 'Aug 2023',
  department: 'Computer Science & Engineering',
  year: '2nd Year',
  regNo: '2023002748',
};

// Campus Activity Stats - Meaningful University Metrics
const STATS = [
  { id: '1', label: 'Events Attended', value: '18', icon: 'calendar' as const },
  { id: '2', label: 'This Semester', value: '12', icon: 'book-open' as const },
  { id: '3', label: 'Certificates', value: '8', icon: 'award' as const },
];

// Menu Items
interface MenuItem {
  id: string;
  icon: keyof typeof Feather.glyphMap;
  label: string;
  subtitle?: string;
  route?: string;
  hasSwitch?: boolean;
  switchValue?: boolean;
  color?: string;
}

const MENU_SECTIONS: { title: string; items: MenuItem[] }[] = [
  {
    title: 'Campus Activity',
    items: [
      { id: '1', icon: 'award', label: 'My Achievements', subtitle: '12 badges earned', route: '/profile/achievements' },
      { id: '2', icon: 'users', label: 'My Clubs', subtitle: '4 clubs joined', route: '/profile/clubs' },
      { id: '3', icon: 'gift', label: 'Rewards Store', subtitle: 'Redeem your rewards', route: '/profile/rewards' },
    ],
  },
  {
    title: 'Account',
    items: [
      { id: '4', icon: 'user', label: 'Edit Profile', subtitle: 'Update your information', route: '/profile/edit' },
      { id: '5', icon: 'bell', label: 'Notifications', hasSwitch: true, switchValue: true },
    ],
  },
  {
    title: 'Support',
    items: [
      { id: '7', icon: 'help-circle', label: 'Help Center', route: '/help' },
      { id: '8', icon: 'message-circle', label: 'Feedback', route: '/feedback' },
      { id: '9', icon: 'shield', label: 'Privacy Policy', route: '/privacy' },
    ],
  },
];

// Stat Card Component
interface StatCardProps {
  stat: typeof STATS[0];
  index: number;
  onPress: () => void;
}

function StatCard({ stat, index, onPress }: StatCardProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withTiming(0.95, { duration: 100 });
  };

  const handlePressOut = () => {
    scale.value = withTiming(1, { duration: 150 });
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <Animated.View entering={FadeInDown.delay(100 + index * 80).duration(400)}>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
      >
        <Animated.View style={[styles.statCard, animatedStyle]}>
          <View style={styles.statIconContainer}>
            <Feather name={stat.icon} size={20} color={tokens.colors.primary} />
          </View>
          <Text style={styles.statValue}>{stat.value}</Text>
          <Text style={styles.statLabel}>{stat.label}</Text>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

// Menu Item Component
interface MenuItemProps {
  item: MenuItem;
  isLast: boolean;
  onPress: () => void;
}

function MenuItemRow({ item, isLast, onPress }: MenuItemProps) {
  const [switchValue, setSwitchValue] = React.useState(item.switchValue || false);
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withTiming(0.98, { duration: 100 });
  };

  const handlePressOut = () => {
    scale.value = withTiming(1, { duration: 150 });
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const handleSwitchChange = (value: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSwitchValue(value);
  };

  return (
    <Pressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={item.hasSwitch}
    >
      <Animated.View
        style={[
          styles.menuItem,
          !isLast && styles.menuItemBorder,
          animatedStyle,
        ]}
      >
        <View style={[styles.menuIconContainer, item.color && { backgroundColor: item.color }]}>
          <Feather
            name={item.icon}
            size={18}
            color={item.color ? '#FFFFFF' : tokens.colors.text.secondary}
          />
        </View>
        <View style={styles.menuContent}>
          <Text style={[styles.menuLabel, item.color && { color: item.color }]}>
            {item.label}
          </Text>
          {item.subtitle && (
            <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
          )}
        </View>
        {item.hasSwitch ? (
          <Switch
            value={switchValue}
            onValueChange={handleSwitchChange}
            trackColor={{ false: tokens.colors.border.light, true: tokens.colors.primaryLight }}
            thumbColor={switchValue ? tokens.colors.primary : '#FFFFFF'}
          />
        ) : (
          <Feather name="chevron-right" size={20} color={tokens.colors.text.tertiary} />
        )}
      </Animated.View>
    </Pressable>
  );
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const handleLogout = () => {
    router.replace('/auth/login');
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View
          entering={FadeInDown.duration(400)}
          style={[styles.header, { paddingTop: insets.top + 16 }]}
        >
          <Text style={styles.headerTitle}>Profile</Text>
          <Pressable
            style={styles.settingsButton}
            onPress={() => router.push('/settings' as any)}
          >
            <Feather name="settings" size={22} color={tokens.colors.text.primary} />
          </Pressable>
        </Animated.View>

        {/* Profile Card */}
        <Animated.View
          entering={FadeInDown.delay(100).duration(400)}
          style={styles.profileCard}
        >
          <View style={styles.avatarContainer}>
            <Image source={{ uri: USER.avatar }} style={styles.avatar} />
            <Pressable style={styles.editAvatarButton}>
              <Feather name="camera" size={16} color="#FFFFFF" />
            </Pressable>
          </View>
          <Text style={styles.userName}>{USER.name}</Text>
          <Text style={styles.userEmail}>{USER.email}</Text>

          {/* Registration Number Badge */}
          <View style={styles.regNoBadge}>
            <Feather name="hash" size={12} color={tokens.colors.primary} />
            <Text style={styles.regNoText}>{USER.regNo}</Text>
          </View>

          {/* Department & Year */}
          <View style={styles.academicInfo}>
            <View style={styles.academicBadge}>
              <Feather name="book" size={12} color={tokens.colors.text.secondary} />
              <Text style={styles.academicText}>{USER.department}</Text>
            </View>
            <View style={styles.academicBadge}>
              <Feather name="calendar" size={12} color={tokens.colors.text.secondary} />
              <Text style={styles.academicText}>{USER.year}</Text>
            </View>
          </View>

          <View style={styles.memberSinceContainer}>
            <Feather name="award" size={14} color={tokens.colors.primary} />
            <Text style={styles.memberSinceText}>
              Member since {USER.memberSince}
            </Text>
          </View>
          <Pressable
            style={styles.editProfileButton}
            onPress={() => router.push('/profile/edit' as any)}
          >
            <Text style={styles.editProfileText}>Edit Profile</Text>
          </Pressable>
        </Animated.View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          {STATS.map((stat, index) => (
            <StatCard
              key={stat.id}
              stat={stat}
              index={index}
              onPress={() => {
                if (stat.id === '1') router.push('/tickets');
                else if (stat.id === '2') router.push('/tickets');
                else if (stat.id === '3') router.push('/profile/achievements');
              }}
            />
          ))}
        </View>

        {/* Menu Sections */}
        {MENU_SECTIONS.map((section, sectionIndex) => (
          <Animated.View
            key={section.title}
            entering={FadeInDown.delay(400 + sectionIndex * 100).duration(400)}
            style={styles.menuSection}
          >
            <Text style={styles.menuSectionTitle}>{section.title}</Text>
            <View style={styles.menuCard}>
              {section.items.map((item, index) => (
                <MenuItemRow
                  key={item.id}
                  item={item}
                  isLast={index === section.items.length - 1}
                  onPress={() => item.route && router.push(item.route as any)}
                />
              ))}
            </View>
          </Animated.View>
        ))}

        {/* Logout Button */}
        <Animated.View
          entering={FadeInDown.delay(700).duration(400)}
          style={styles.logoutSection}
        >
          <Pressable style={styles.logoutButton} onPress={handleLogout}>
            <Feather name="log-out" size={20} color={tokens.colors.error} />
            <Text style={styles.logoutText}>Log Out</Text>
          </Pressable>
        </Animated.View>

        {/* App Version */}
        <Animated.Text
          entering={FadeInDown.delay(800).duration(400)}
          style={styles.versionText}
        >
          Version 1.0.0
        </Animated.Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.colors.background.secondary,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: tokens.colors.background.primary,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: tokens.colors.text.primary,
  },
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: tokens.colors.background.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileCard: {
    alignItems: 'center',
    backgroundColor: tokens.colors.background.primary,
    paddingVertical: 24,
    paddingHorizontal: 20,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.border.light,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: tokens.colors.primaryLight,
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: tokens.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: tokens.colors.background.primary,
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    color: tokens.colors.text.primary,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: tokens.colors.text.secondary,
    marginBottom: 8,
  },
  regNoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: tokens.colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 12,
  },
  regNoText: {
    fontSize: 13,
    fontWeight: '700',
    color: tokens.colors.primary,
    fontFamily: 'monospace',
    letterSpacing: 1,
  },
  academicInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  academicBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: tokens.colors.background.tertiary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  academicText: {
    fontSize: 12,
    color: tokens.colors.text.secondary,
    fontWeight: '500',
  },
  memberSinceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
  },
  memberSinceText: {
    fontSize: 13,
    color: tokens.colors.primary,
    fontWeight: '500',
  },
  editProfileButton: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: tokens.colors.primary,
  },
  editProfileText: {
    fontSize: 14,
    fontWeight: '600',
    color: tokens.colors.primary,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: tokens.colors.background.primary,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F5F5F5',
  },
  statIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: tokens.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    color: tokens.colors.text.primary,
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  statLabel: {
    fontSize: 12,
    color: tokens.colors.text.secondary,
    fontWeight: '500',
  },
  menuSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  menuSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: tokens.colors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
    marginLeft: 4,
  },
  menuCard: {
    backgroundColor: tokens.colors.background.primary,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F5F5F5',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.border.light,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: tokens.colors.background.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  menuContent: {
    flex: 1,
  },
  menuLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: tokens.colors.text.primary,
  },
  menuSubtitle: {
    fontSize: 13,
    color: tokens.colors.text.tertiary,
    marginTop: 2,
  },
  logoutSection: {
    paddingHorizontal: 20,
    marginTop: 8,
    marginBottom: 20,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: tokens.colors.background.primary,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: tokens.colors.error,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: tokens.colors.error,
  },
  versionText: {
    textAlign: 'center',
    fontSize: 12,
    color: tokens.colors.text.tertiary,
    marginBottom: 24,
  },
});
