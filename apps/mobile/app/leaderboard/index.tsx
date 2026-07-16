/**
 * Leaderboard Screen - CampusPulse
 * Campus rankings and top performers
 */

import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import Animated, {
  FadeInDown,
  FadeInUp,
  FadeInLeft,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

import { tokens } from '@/lib/styles/unified';
import { useLeaderboard } from '@/lib/hooks/useLeaderboard';
import { useAuth } from '@/lib/context/AuthContext';
import { Avatar } from '@/components/ui/Avatar';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// User Interface
interface LeaderboardUser {
  id: string;
  name: string;
  avatar: string;
  department: string;
  year: string;
  points: number;
  eventsAttended: number;
  rank: number;
  change: 'up' | 'down' | 'same';
  changeValue?: number;
  isCurrentUser?: boolean;
}

// Time period filter
type TimePeriod = 'week' | 'month' | 'semester' | 'all';

// (formerly: 180-line LEADERBOARD_DATA mock array — removed; data now comes from useLeaderboard)
// Leaderboard data is fetched live via useLeaderboard hook.

const TIME_PERIODS: { id: TimePeriod; label: string }[] = [
  { id: 'week', label: 'This Week' },
  { id: 'month', label: 'This Month' },
  { id: 'semester', label: 'Semester' },
  { id: 'all', label: 'All Time' },
];

// Podium Component for Top 3
function Podium({ users }: { users: LeaderboardUser[] }) {
  const router = useRouter();
  const [first, second, third] = users;

  const podiumColors = {
    1: { bg: ['#FFD700', '#FFC107'] as const, border: '#FFD700', text: '#B8860B' },
    2: { bg: ['#E8E8E8', '#C0C0C0'] as const, border: '#C0C0C0', text: '#757575' },
    3: { bg: ['#CD7F32', '#B8860B'] as const, border: '#CD7F32', text: '#8B4513' },
  };

  const renderPodiumUser = (user: LeaderboardUser, position: 1 | 2 | 3) => {
    const colors = podiumColors[position];
    const sizes = {
      1: { avatar: 80, height: 100, crown: true },
      2: { avatar: 64, height: 80, crown: false },
      3: { avatar: 64, height: 60, crown: false },
    };
    const config = sizes[position];

    return (
      <Animated.View
        key={user.id}
        entering={FadeInUp.delay(200 + position * 100).duration(500)}
        style={[
          styles.podiumItem,
          position === 1 && styles.podiumFirst,
        ]}
      >
        {/* Crown for #1 */}
        {config.crown && (
          <View style={styles.crownContainer}>
            <Text style={styles.crownEmoji}>👑</Text>
          </View>
        )}

        {/* Avatar — container size = avatar + 2×(border 4) + 2×(padding 4) = avatar + 16 */}
        <View
          style={[
            styles.podiumAvatarContainer,
            {
              borderColor: colors.border,
              width: config.avatar + 16,
              height: config.avatar + 16,
              borderRadius: (config.avatar + 16) / 2,
            },
          ]}
        >
          <Avatar
            source={user.avatar || undefined}
            name={user.name}
            size={position === 1 ? '2xl' : 'xl'}
          />
        </View>

        {/* Name */}
        <Text style={styles.podiumName} numberOfLines={1}>{user.name.split(' ')[0]}</Text>

        {/* Points */}
        <View style={styles.podiumPointsBadge}>
          <Feather name="award" size={12} color="#F59E0B" />
          <Text style={styles.podiumPoints}>{user.points.toLocaleString()}</Text>
        </View>

        {/* Podium Stand */}
        <LinearGradient
          colors={colors.bg}
          style={[styles.podiumStand, { height: config.height }]}
        >
          <Text style={[styles.podiumRank, { color: colors.text }]}>#{position}</Text>
        </LinearGradient>
      </Animated.View>
    );
  };

  return (
    <View style={styles.podiumContainer}>
      {/* 2nd Place */}
      {second && renderPodiumUser(second, 2)}
      {/* 1st Place */}
      {first && renderPodiumUser(first, 1)}
      {/* 3rd Place */}
      {third && renderPodiumUser(third, 3)}
    </View>
  );
}

// Leaderboard Row Component
function LeaderboardRow({ user, index }: { user: LeaderboardUser; index: number }) {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const getRankChangeIcon = () => {
    if (user.change === 'up') {
      return { icon: 'arrow-up', color: '#10B981' };
    } else if (user.change === 'down') {
      return { icon: 'arrow-down', color: '#EF4444' };
    }
    return { icon: 'minus', color: '#9CA3AF' };
  };

  const { icon, color } = getRankChangeIcon();

  return (
    <Animated.View
      entering={FadeInLeft.delay(300 + index * 50).duration(400)}
    >
      <Pressable
        style={[
          styles.leaderboardRow,
          user.isCurrentUser && styles.currentUserRow,
        ]}
        onPress={handlePress}
      >
        {/* Rank */}
        <View style={styles.rankContainer}>
          <Text style={[styles.rankText, user.isCurrentUser && styles.currentUserRankText]}>
            {user.rank}
          </Text>
          <View style={[styles.changeIndicator, { backgroundColor: `${color}15` }]}>
            <Feather name={icon as any} size={10} color={color} />
            {user.changeValue && user.changeValue > 0 && (
              <Text style={[styles.changeValue, { color }]}>{user.changeValue}</Text>
            )}
          </View>
        </View>

        {/* User Info */}
        <View style={styles.userInfoContainer}>
          <Avatar source={user.avatar || undefined} name={user.name} size="md" />
          <View style={styles.userDetails}>
            <Text style={[styles.userName, user.isCurrentUser && styles.currentUserName]}>
              {user.name}
              {user.isCurrentUser && ' (You)'}
            </Text>
            <Text style={styles.userDepartment}>
              {user.department} • {user.year}
            </Text>
          </View>
        </View>

        {/* Points */}
        <View style={styles.pointsContainer}>
          <View style={styles.pointsRow}>
            <Feather name="award" size={14} color="#F59E0B" />
            <Text style={[styles.pointsText, user.isCurrentUser && styles.currentUserPoints]}>
              {user.points.toLocaleString()}
            </Text>
          </View>
          <Text style={styles.eventsText}>{user.eventsAttended} events</Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

export default function LeaderboardScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('month');
  const { profile } = useAuth();
  const { leaderboard, isLoading, error } = useLeaderboard(50);

  const allUsers: LeaderboardUser[] = useMemo(
    () =>
      leaderboard.map((row, idx) => ({
        id: row.id ?? `lb-${idx}`,
        name: row.full_name ?? 'Anonymous',
        avatar:
          row.avatar_url ??
          `https://api.dicebear.com/9.x/avataaars/svg?seed=${row.full_name ?? idx}`,
        department: row.branch ?? '',
        year: row.year != null ? `${row.year}` : '',
        points: row.total_points ?? 0,
        eventsAttended: row.events_attended ?? 0,
        rank: row.rank ?? idx + 1,
        change: 'same' as const,
        isCurrentUser: profile?.id === row.id,
      })),
    [leaderboard, profile?.id],
  );

  const topThree = allUsers.slice(0, 3);
  const restOfList = allUsers.slice(3);
  const currentUser = allUsers.find((u) => u.isCurrentUser);

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      {/* Header */}
      <LinearGradient
        colors={[tokens.colors.primary, '#E85A2C']}
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
          <Text style={styles.headerTitle}>Leaderboard</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Current User Stats */}
        {currentUser && (
          <Animated.View
            entering={FadeInDown.delay(100).duration(400)}
            style={styles.myRankCard}
          >
            <View style={styles.myRankInfo}>
              <Avatar
                source={currentUser.avatar || undefined}
                name={currentUser.name}
                size="xl"
                style={{
                  borderWidth: 3,
                  borderColor: 'rgba(255,255,255,0.6)',
                  backgroundColor: 'rgba(255,255,255,0.25)',
                }}
              />
              <View>
                <Text style={styles.myRankLabel}>Your Rank</Text>
                <Text style={styles.myRankValue}>#{currentUser.rank}</Text>
              </View>
            </View>
            <View style={styles.myRankDivider} />
            <View style={styles.myRankInfo}>
              <LinearGradient
                colors={['#FFE066', '#FFB300']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.myPointsIcon}
              >
                <Feather name="zap" size={22} color="#FFFFFF" />
              </LinearGradient>
              <View>
                <Text style={styles.myRankLabel}>Points</Text>
                <Text style={styles.myRankValue}>{currentUser.points.toLocaleString()}</Text>
              </View>
            </View>
          </Animated.View>
        )}
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Time Period Filter */}
        <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.filterWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterContainer}
          >
            {TIME_PERIODS.map((period) => (
              <Pressable
                key={period.id}
                style={[
                  styles.filterChip,
                  selectedPeriod === period.id && styles.filterChipActive
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setSelectedPeriod(period.id);
                }}
              >
                <Text style={[
                  styles.filterText,
                  selectedPeriod === period.id && styles.filterTextActive
                ]}>
                  {period.label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </Animated.View>

        {isLoading && allUsers.length === 0 ? (
          <View style={{ paddingVertical: 80, alignItems: 'center' }}>
            <ActivityIndicator size="large" color={tokens.colors.primary} />
            <Text style={{ marginTop: 12, color: tokens.colors.text.tertiary }}>
              Loading rankings...
            </Text>
          </View>
        ) : allUsers.length === 0 ? (
          <View style={{ paddingVertical: 80, alignItems: 'center', paddingHorizontal: 40 }}>
            <Feather name="users" size={48} color={tokens.colors.text.tertiary} />
            <Text style={{ marginTop: 16, fontSize: 18, fontWeight: '600', color: tokens.colors.text.primary }}>
              No rankings yet
            </Text>
            <Text style={{ marginTop: 8, fontSize: 14, color: tokens.colors.text.tertiary, textAlign: 'center' }}>
              {error ?? 'Be the first to attend events and earn points!'}
            </Text>
          </View>
        ) : (
          <>
            {/* Podium for Top 3 */}
            <View style={styles.podiumSection}>
              <Podium users={topThree} />
            </View>

            {/* Rest of the List */}
            <View style={styles.listSection}>
              <Text style={styles.listSectionTitle}>Rankings</Text>
              {restOfList.map((user, index) => (
                <LeaderboardRow key={user.id} user={user} index={index} />
              ))}
            </View>
          </>
        )}

        {/* How to Earn Points */}
        <Animated.View entering={FadeInUp.delay(800).duration(400)} style={styles.howToEarn}>
          <Text style={styles.howToEarnTitle}>🎯 Climb the Ranks</Text>
          <View style={styles.earnTip}>
            <View style={[styles.earnTipIcon, { backgroundColor: '#FEF3C7' }]}>
              <Feather name="calendar" size={16} color="#F59E0B" />
            </View>
            <Text style={styles.earnTipText}>Attend events to earn 50-100 points each</Text>
          </View>
          <View style={styles.earnTip}>
            <View style={[styles.earnTipIcon, { backgroundColor: '#DCFCE7' }]}>
              <Feather name="check-circle" size={16} color="#10B981" />
            </View>
            <Text style={styles.earnTipText}>Check-in early for +10 bonus points</Text>
          </View>
          <View style={styles.earnTip}>
            <View style={[styles.earnTipIcon, { backgroundColor: '#E0E7FF' }]}>
              <Feather name="award" size={16} color="#6366F1" />
            </View>
            <Text style={styles.earnTipText}>Earn badges to unlock special rewards</Text>
          </View>
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
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: tokens.colors.white,
    letterSpacing: -0.5,
  },
  headerSpacer: {
    width: 48,
  },
  myRankCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 16,
    padding: 16,
  },
  myRankInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  myRankAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  myPointsIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FFB300',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  myRankLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500',
  },
  myRankValue: {
    fontSize: 22,
    fontWeight: '700',
    color: tokens.colors.white,
    marginTop: 2,
  },
  myRankDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginHorizontal: 16,
  },
  scrollView: {
    flex: 1,
    backgroundColor: tokens.colors.background.secondary,
  },
  scrollContent: {
    paddingTop: 12,
    paddingBottom: 24,
  },
  filterWrapper: {
    backgroundColor: tokens.colors.background.secondary,
    paddingVertical: 8,
    zIndex: 10,
    marginBottom: 16,
  },
  filterContainer: {
    paddingHorizontal: 16,
    gap: 10,
  },
  filterChip: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: tokens.colors.background.primary,
    borderWidth: 1.5,
    borderColor: tokens.colors.border.light,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  filterChipActive: {
    backgroundColor: tokens.colors.primary,
    borderColor: tokens.colors.primary,
    shadowOpacity: 0.15,
    elevation: 3,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: tokens.colors.text.secondary,
  },
  filterTextActive: {
    color: tokens.colors.white,
  },
  podiumSection: {
    backgroundColor: tokens.colors.background.primary,
    marginHorizontal: 16,
    borderRadius: 20,
    paddingTop: 24,
    paddingBottom: 8,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  podiumContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingHorizontal: 16,
    height: 260,
  },
  podiumItem: {
    alignItems: 'center',
    width: (SCREEN_WIDTH - 80) / 3,
    marginHorizontal: 4,
    overflow: 'visible',
    paddingTop: 8,
  },
  podiumFirst: {
    marginBottom: 0,
  },
  crownContainer: {
    marginBottom: 4,
    alignItems: 'center',
    height: 36,
    justifyContent: 'flex-end',
  },
  crownEmoji: {
    fontSize: 30,
    textAlign: 'center',
    lineHeight: 34,
  },
  podiumAvatarContainer: {
    borderWidth: 4,
    borderRadius: 60,
    padding: 4,
    backgroundColor: tokens.colors.background.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  podiumAvatar: {
    borderRadius: 50,
  },
  podiumName: {
    fontSize: 15,
    fontWeight: '700',
    color: tokens.colors.text.primary,
    marginTop: 10,
    textAlign: 'center',
    maxWidth: 90,
  },
  podiumPointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    marginTop: 6,
  },
  podiumPoints: {
    fontSize: 13,
    fontWeight: '700',
    color: '#F59E0B',
  },
  podiumStand: {
    width: '90%',
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    marginTop: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  podiumRank: {
    fontSize: 26,
    fontWeight: '800',
  },
  listSection: {
    paddingHorizontal: 20,
    marginTop: 12,
  },
  listSectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: tokens.colors.text.primary,
    marginBottom: 20,
    marginLeft: 4,
  },
  leaderboardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: tokens.colors.background.primary,
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: tokens.colors.border.light,
  },
  currentUserRow: {
    backgroundColor: '#FFF7ED',
    borderWidth: 2,
    borderColor: tokens.colors.primary,
  },
  rankContainer: {
    width: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: {
    fontSize: 20,
    fontWeight: '800',
    color: tokens.colors.text.primary,
  },
  currentUserRankText: {
    color: tokens.colors.primary,
  },
  changeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    marginTop: 6,
    minWidth: 32,
  },
  changeValue: {
    fontSize: 11,
    fontWeight: '700',
  },
  userInfoContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginLeft: 12,
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: tokens.colors.border.light,
  },
  userDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: tokens.colors.text.primary,
    letterSpacing: -0.2,
  },
  currentUserName: {
    color: tokens.colors.primary,
  },
  userDepartment: {
    fontSize: 13,
    color: tokens.colors.text.tertiary,
    marginTop: 3,
    fontWeight: '500',
  },
  pointsContainer: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    minWidth: 80,
  },
  pointsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  pointsText: {
    fontSize: 17,
    fontWeight: '800',
    color: tokens.colors.text.primary,
  },
  currentUserPoints: {
    color: '#F59E0B',
  },
  eventsText: {
    fontSize: 12,
    color: tokens.colors.text.tertiary,
    marginTop: 3,
    fontWeight: '500',
  },
  howToEarn: {
    backgroundColor: tokens.colors.background.primary,
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: tokens.colors.border.light,
  },
  howToEarnTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: tokens.colors.text.primary,
    marginBottom: 20,
    letterSpacing: -0.3,
  },
  earnTip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 16,
  },
  earnTipIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  earnTipText: {
    fontSize: 15,
    color: tokens.colors.text.secondary,
    flex: 1,
    fontWeight: '500',
    lineHeight: 20,
  },
});
