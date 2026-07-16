/**
 * Profile Screen - CampusPulse Design System
 * Production-ready with unified typography and layout
 * Connected to real Supabase backend
 */

import React, { useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Image,
  StyleSheet,
  Switch,
  ActivityIndicator,
  RefreshControl,
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
import { Avatar } from '@/components/ui/Avatar';
import { useAuth } from '@/lib/context/AuthContext';
import { useProfile, useUserStats, useUserRank } from '@/lib/hooks/useProfile';

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
      { id: '1', icon: 'award', label: 'My Achievements', subtitle: 'Badges earned', route: '/profile/achievements' },
      { id: '2', icon: 'users', label: 'My Clubs', subtitle: 'Clubs joined', route: '/profile/clubs' },
      { id: '3', icon: 'gift', label: 'Rewards Store', subtitle: 'Redeem your points', route: '/profile/rewards' },
      { id: '4', icon: 'trending-up', label: 'Leaderboard', subtitle: 'Campus rankings', route: '/leaderboard' },
    ],
  },
  {
    title: 'Account',
    items: [
      { id: '5', icon: 'user', label: 'Edit Profile', subtitle: 'Update your information', route: '/profile/edit' },
      { id: '6', icon: 'bell', label: 'Notifications', hasSwitch: true, switchValue: true },
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

// Stat type definition
interface Stat {
  id: string;
  label: string;
  value: string;
  icon: keyof typeof Feather.glyphMap;
  color: string;
  route?: string;
}

// Stat Card Component
interface StatCardProps {
  stat: Stat;
  index: number;
  onPress: () => void;
}

function StatCard({ stat, index, onPress }: StatCardProps) {
  const scale = useSharedValue(1);
  const statColor = stat.color || tokens.colors.primary;

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
          <View style={[styles.statIconContainer, { backgroundColor: `${statColor}15` }]}>
            <Feather name={stat.icon} size={18} color={statColor} />
          </View>
          <Text style={styles.statValue}>{stat.value}</Text>
          <Text style={styles.statLabel} numberOfLines={1}>{stat.label}</Text>
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
  const [refreshing, setRefreshing] = React.useState(false);

  // Real data from Supabase
  const { user, profile, isAuthenticated, signOut } = useAuth();
  const { stats, isLoading: loadingStats, refresh: refreshStats } = useUserStats();
  const { rank, isLoading: loadingRank, refresh: refreshRank } = useUserRank();

  // Prepare user data
  const userData = useMemo(() => ({
    name: profile?.full_name || user?.email?.split('@')[0] || 'Guest',
    email: user?.email || '',
    avatar: profile?.avatar_url || '',
    memberSince: profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '',
    department: profile?.branch || 'Not Set',
    year: profile?.year || 'Not Set',
    regNo: profile?.student_id || '',
  }), [profile, user]);

  // Prepare stats with real data
  const displayStats = useMemo(() => [
    {
      id: '1',
      label: 'Campus Points',
      value: stats?.totalPoints?.toString() || '0',
      icon: 'award' as const,
      color: '#F59E0B',
      route: '/profile/rewards'
    },
    {
      id: '2',
      label: 'Events Attended',
      value: stats?.totalEvents?.toString() || '0',
      icon: 'calendar' as const,
      color: '#6366F1',
      route: '/(tabs)/tickets'
    },
    {
      id: '3',
      label: 'Campus Rank',
      value: rank ? `#${rank}` : '-',
      icon: 'trending-up' as const,
      color: '#10B981',
      route: '/leaderboard'
    },
  ], [stats, rank]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refreshStats(), refreshRank()]);
    setRefreshing(false);
  }, [refreshStats, refreshRank]);

  const handleLogout = async () => {
    await signOut();
    router.replace('/auth/login');
  };

  // Show login prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>
        <View style={styles.loginPrompt}>
          <Feather name="user" size={48} color={tokens.colors.text.tertiary} />
          <Text style={styles.loginPromptTitle}>Sign In Required</Text>
          <Text style={styles.loginPromptText}>Please sign in to view your profile</Text>
          <Pressable
            style={styles.loginButton}
            onPress={() => router.push('/auth/login')}
          >
            <Text style={styles.loginButtonText}>Sign In</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: insets.bottom + 90 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={tokens.colors.primary}
          />
        }
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
            <Avatar source={userData.avatar || undefined} name={userData.name} size="2xl" />
            <Pressable style={styles.editAvatarButton}>
              <Feather name="camera" size={16} color="#FFFFFF" />
            </Pressable>
          </View>
          <Text style={styles.userName}>{userData.name}</Text>
          <Text style={styles.userEmail}>{userData.email}</Text>

          {/* Registration Number Badge */}
          {userData.regNo && (
            <View style={styles.regNoBadge}>
              <Feather name="hash" size={12} color={tokens.colors.primary} />
              <Text style={styles.regNoText}>{userData.regNo}</Text>
            </View>
          )}

          {/* Department & Year */}
          <View style={styles.academicInfo}>
            <View style={styles.academicBadge}>
              <Feather name="book" size={12} color={tokens.colors.text.secondary} />
              <Text style={styles.academicText}>{userData.department}</Text>
            </View>
            <View style={styles.academicBadge}>
              <Feather name="calendar" size={12} color={tokens.colors.text.secondary} />
              <Text style={styles.academicText}>{userData.year}</Text>
            </View>
          </View>

          {userData.memberSince && (
            <View style={styles.memberSinceContainer}>
              <Feather name="award" size={14} color={tokens.colors.primary} />
              <Text style={styles.memberSinceText}>
                Member since {userData.memberSince}
              </Text>
            </View>
          )}
          <Pressable
            style={styles.editProfileButton}
            onPress={() => router.push('/profile/edit' as any)}
          >
            <Text style={styles.editProfileText}>Edit Profile</Text>
          </Pressable>
        </Animated.View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          {displayStats.map((stat, index) => (
            <StatCard
              key={stat.id}
              stat={stat}
              index={index}
              onPress={() => {
                if (stat.route) router.push(stat.route as any);
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
    paddingBottom: 20,
    backgroundColor: tokens.colors.background.primary,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: tokens.colors.text.primary,
    letterSpacing: -0.5,
  },
  settingsButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: tokens.colors.background.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: tokens.colors.border.light,
  },
  profileCard: {
    alignItems: 'center',
    backgroundColor: tokens.colors.background.primary,
    paddingVertical: 28,
    paddingHorizontal: 20,
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.border.light,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 4,
    borderColor: tokens.colors.primaryLight,
    shadowColor: tokens.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: tokens.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: tokens.colors.background.primary,
    shadowColor: tokens.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  userName: {
    fontSize: 24,
    fontWeight: '800',
    color: tokens.colors.text.primary,
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  userEmail: {
    fontSize: 15,
    color: tokens.colors.text.secondary,
    marginBottom: 10,
    fontWeight: '500',
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
    justifyContent: 'center',
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 20,
  },
  statCard: {
    width: 108,
    height: 110,
    backgroundColor: tokens.colors.background.primary,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: tokens.colors.border.light,
  },
  statIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: tokens.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: tokens.colors.text.primary,
    marginBottom: 2,
    letterSpacing: -0.3,
  },
  statLabel: {
    fontSize: 10,
    color: tokens.colors.text.secondary,
    fontWeight: '600',
    textAlign: 'center',
  },
  menuSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  menuSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: tokens.colors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 14,
    marginLeft: 4,
  },
  menuCard: {
    backgroundColor: tokens.colors.background.primary,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 4,
    borderWidth: 1,
    borderColor: tokens.colors.border.light,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.border.light,
  },
  menuIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: tokens.colors.background.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  menuContent: {
    flex: 1,
  },
  menuLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: tokens.colors.text.primary,
  },
  menuSubtitle: {
    fontSize: 13,
    color: tokens.colors.text.tertiary,
    marginTop: 3,
    fontWeight: '500',
  },
  logoutSection: {
    paddingHorizontal: 20,
    marginTop: 12,
    marginBottom: 24,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: tokens.colors.background.primary,
    paddingVertical: 18,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: tokens.colors.error,
    shadowColor: tokens.colors.error,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  logoutText: {
    fontSize: 17,
    fontWeight: '700',
    color: tokens.colors.error,
  },
  versionText: {
    textAlign: 'center',
    fontSize: 13,
    color: tokens.colors.text.tertiary,
    marginBottom: 28,
    fontWeight: '500',
  },
  loginPrompt: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    gap: 16,
  },
  loginPromptTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: tokens.colors.text.primary,
    marginTop: 8,
  },
  loginPromptText: {
    fontSize: 15,
    color: tokens.colors.text.secondary,
    textAlign: 'center',
  },
  loginButton: {
    backgroundColor: tokens.colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 16,
    marginTop: 8,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
