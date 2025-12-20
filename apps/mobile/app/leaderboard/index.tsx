/**
 * Leaderboard Screen
 * Campus points rankings with podium display
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router, Stack } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import Animated, {
  FadeInDown,
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  ZoomIn,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { tokens, normalize, scale } from '../../lib/styles/unified';

// Leaderboard Data
interface LeaderboardUser {
  id: string;
  rank: number;
  name: string;
  points: number;
  avatar: string;
  department: string;
  isCurrentUser?: boolean;
  change?: 'up' | 'down' | 'same';
}

const LEADERBOARD_DATA: LeaderboardUser[] = [
  {
    id: '1',
    rank: 1,
    name: 'Sarah Johnson',
    points: 2400,
    avatar: '👩‍🎤',
    department: 'Computer Science',
    change: 'same',
  },
  {
    id: '2',
    rank: 2,
    name: 'Mike Thompson',
    points: 2150,
    avatar: '👨‍💻',
    department: 'Engineering',
    change: 'up',
  },
  {
    id: '3',
    rank: 3,
    name: 'Amy Roberts',
    points: 1900,
    avatar: '👩‍🎨',
    department: 'Design',
    change: 'down',
  },
  {
    id: '4',
    rank: 4,
    name: 'David Kim',
    points: 1750,
    avatar: '🧔',
    department: 'Business',
    change: 'up',
  },
  {
    id: '5',
    rank: 5,
    name: 'Lisa Martinez',
    points: 1600,
    avatar: '👱‍♀️',
    department: 'Marketing',
    change: 'same',
  },
  {
    id: '6',
    rank: 6,
    name: 'Tom Harris',
    points: 1450,
    avatar: '👨‍🦱',
    department: 'Finance',
    change: 'down',
  },
  {
    id: '7',
    rank: 7,
    name: 'Emma Wilson',
    points: 1200,
    avatar: '👩‍🦰',
    department: 'Psychology',
    change: 'up',
  },
  {
    id: '8',
    rank: 8,
    name: 'James Brown',
    points: 1100,
    avatar: '👨‍🦲',
    department: 'Physics',
    change: 'same',
  },
  {
    id: '9',
    rank: 9,
    name: 'Sophia Lee',
    points: 1000,
    avatar: '👩‍🎓',
    department: 'Chemistry',
    change: 'up',
  },
  {
    id: '10',
    rank: 10,
    name: 'William Davis',
    points: 950,
    avatar: '🧑‍🎓',
    department: 'Biology',
    change: 'down',
  },
  {
    id: '11',
    rank: 11,
    name: 'Olivia Garcia',
    points: 900,
    avatar: '👧',
    department: 'Art',
    change: 'same',
  },
  {
    id: '12',
    rank: 12,
    name: 'You',
    points: 850,
    avatar: '😎',
    department: 'Computer Science',
    isCurrentUser: true,
    change: 'up',
  },
];

// Time Period Tabs
type TimePeriod = 'week' | 'month' | 'all';

// Podium Place Component
function PodiumPlace({
  user,
  place,
}: {
  user: LeaderboardUser;
  place: 1 | 2 | 3;
}) {
  const podiumColors = {
    1: ['#FFD700', '#FFA500'] as const,
    2: ['#C0C0C0', '#A8A8A8'] as const,
    3: ['#CD7F32', '#B87333'] as const,
  };

  const podiumHeights = {
    1: scale(100),
    2: scale(80),
    3: scale(60),
  };

  const avatarSizes = {
    1: scale(72),
    2: scale(60),
    3: scale(56),
  };

  const medals = {
    1: '🥇',
    2: '🥈',
    3: '🥉',
  };

  return (
    <Animated.View
      entering={FadeInUp.delay(place === 1 ? 300 : place === 2 ? 200 : 400).duration(600)}
      style={[styles.podiumContainer, place === 1 && styles.podiumFirst]}
    >
      {/* Avatar */}
      <Animated.View
        entering={ZoomIn.delay(place === 1 ? 500 : place === 2 ? 400 : 600).duration(400)}
        style={[
          styles.podiumAvatar,
          {
            width: avatarSizes[place],
            height: avatarSizes[place],
            borderRadius: avatarSizes[place] / 2,
          },
          place === 1 && styles.podiumAvatarFirst,
        ]}
      >
        <Text style={[styles.podiumAvatarEmoji, { fontSize: avatarSizes[place] * 0.55 }]}>
          {user.avatar}
        </Text>
      </Animated.View>

      {/* Medal Badge */}
      <View style={styles.medalBadge}>
        <Text style={styles.medalEmoji}>{medals[place]}</Text>
      </View>

      {/* Name & Points */}
      <Text
        style={[styles.podiumName, place === 1 && styles.podiumNameFirst]}
        numberOfLines={1}
      >
        {user.name.split(' ')[0]}
      </Text>
      <Text style={styles.podiumPoints}>{user.points.toLocaleString()}</Text>

      {/* Podium Stand */}
      <LinearGradient
        colors={podiumColors[place]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={[styles.podiumStand, { height: podiumHeights[place] }]}
      >
        <Text style={styles.podiumRank}>{place}</Text>
      </LinearGradient>
    </Animated.View>
  );
}

// Leaderboard Row Component
function LeaderboardRow({
  user,
  index,
}: {
  user: LeaderboardUser;
  index: number;
}) {
  const rowScale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: rowScale.value }],
  }));

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    rowScale.value = withSpring(0.98, {}, () => {
      rowScale.value = withSpring(1);
    });
  };

  const changeIcon = user.change === 'up' ? 'arrow-up' : user.change === 'down' ? 'arrow-down' : 'minus';
  const changeColor = user.change === 'up' ? tokens.colors.success : user.change === 'down' ? tokens.colors.error : tokens.colors.text.tertiary;

  return (
    <Animated.View entering={FadeInDown.delay(100 + index * 40).duration(400)}>
      <Pressable onPress={handlePress}>
        <Animated.View
          style={[
            styles.leaderboardRow,
            user.isCurrentUser && styles.leaderboardRowCurrent,
            animatedStyle,
          ]}
        >
          {/* Rank */}
          <View style={styles.rankContainer}>
            <Text
              style={[
                styles.rankText,
                user.isCurrentUser && styles.rankTextCurrent,
              ]}
            >
              {user.rank}
            </Text>
            <Feather name={changeIcon} size={12} color={changeColor} />
          </View>

          {/* Avatar */}
          <View style={styles.rowAvatar}>
            <Text style={styles.rowAvatarEmoji}>{user.avatar}</Text>
          </View>

          {/* User Info */}
          <View style={styles.userInfo}>
            <Text
              style={[
                styles.userName,
                user.isCurrentUser && styles.userNameCurrent,
              ]}
            >
              {user.name}
              {user.isCurrentUser && ' (You)'}
            </Text>
            <Text style={styles.userDepartment}>{user.department}</Text>
          </View>

          {/* Points */}
          <View
            style={[
              styles.pointsBadge,
              user.isCurrentUser && styles.pointsBadgeCurrent,
            ]}
          >
            <Text
              style={[
                styles.pointsText,
                user.isCurrentUser && styles.pointsTextCurrent,
              ]}
            >
              {user.points.toLocaleString()}
            </Text>
          </View>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

export default function LeaderboardScreen() {
  const insets = useSafeAreaInsets();
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('week');

  const top3 = LEADERBOARD_DATA.slice(0, 3);
  const currentUser = LEADERBOARD_DATA.find((u) => u.isCurrentUser);
  const restOfLeaderboard = LEADERBOARD_DATA.slice(3);

  const tabs: { id: TimePeriod; label: string }[] = [
    { id: 'week', label: 'This Week' },
    { id: 'month', label: 'This Month' },
    { id: 'all', label: 'All Time' },
  ];

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

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
          <Text style={styles.headerTitle}>Leaderboard</Text>
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
            style={styles.infoButton}
          >
            <Feather name="info" size={20} color={tokens.colors.white} />
          </Pressable>
        </View>

        {/* Time Period Tabs */}
        <View style={styles.tabsContainer}>
          {tabs.map((tab) => (
            <Pressable
              key={tab.id}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setTimePeriod(tab.id);
              }}
              style={[
                styles.tab,
                timePeriod === tab.id && styles.tabActive,
              ]}
            >
              <Text
                style={[
                  styles.tabText,
                  timePeriod === tab.id && styles.tabTextActive,
                ]}
              >
                {tab.label}
              </Text>
            </Pressable>
          ))}
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
        {/* Your Position Summary */}
        {currentUser && (
          <Animated.View
            entering={FadeInDown.delay(100).duration(400)}
            style={styles.yourPositionCard}
          >
            <View style={styles.yourPositionContent}>
              <View style={styles.yourPositionInfo}>
                <Text style={styles.yourPositionLabel}>Your Position</Text>
                <View style={styles.yourPositionRank}>
                  <Text style={styles.yourPositionRankNumber}>#{currentUser.rank}</Text>
                  <View style={styles.yourPositionChange}>
                    <Feather name="arrow-up" size={14} color={tokens.colors.success} />
                    <Text style={styles.yourPositionChangeText}>+3</Text>
                  </View>
                </View>
              </View>
              <View style={styles.yourPositionPoints}>
                <Text style={styles.yourPositionPointsLabel}>Points</Text>
                <Text style={styles.yourPositionPointsValue}>
                  {currentUser.points.toLocaleString()}
                </Text>
              </View>
            </View>
            <View style={styles.yourPositionProgress}>
              <View style={styles.progressBarBackground}>
                <View style={[styles.progressBarFill, { width: '70%' }]} />
              </View>
              <Text style={styles.progressText}>150 points to rank #11</Text>
            </View>
          </Animated.View>
        )}

        {/* Podium */}
        <Animated.View
          entering={FadeInDown.delay(200).duration(400)}
          style={styles.podiumSection}
        >
          <View style={styles.podiumRow}>
            <PodiumPlace user={top3[1]} place={2} />
            <PodiumPlace user={top3[0]} place={1} />
            <PodiumPlace user={top3[2]} place={3} />
          </View>
        </Animated.View>

        {/* Rest of Leaderboard */}
        <View style={styles.leaderboardSection}>
          <Text style={styles.sectionTitle}>Rankings</Text>
          {restOfLeaderboard.map((user, index) => (
            <LeaderboardRow key={user.id} user={user} index={index} />
          ))}
        </View>
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
    paddingBottom: scale(16),
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
  infoButton: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabsContainer: {
    flexDirection: 'row',
    marginHorizontal: scale(16),
    marginTop: scale(16),
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: scale(12),
    padding: scale(4),
  },
  tab: {
    flex: 1,
    paddingVertical: scale(10),
    alignItems: 'center',
    borderRadius: scale(10),
  },
  tabActive: {
    backgroundColor: tokens.colors.white,
  },
  tabText: {
    fontSize: normalize(13),
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  tabTextActive: {
    color: tokens.colors.primary,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: scale(16),
  },
  yourPositionCard: {
    backgroundColor: tokens.colors.surface.primary,
    borderRadius: scale(16),
    padding: scale(16),
    marginBottom: scale(20),
    borderWidth: 2,
    borderColor: tokens.colors.primary,
    shadowColor: tokens.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  yourPositionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  yourPositionInfo: {},
  yourPositionLabel: {
    fontSize: normalize(12),
    color: tokens.colors.text.tertiary,
    fontWeight: '500',
  },
  yourPositionRank: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(8),
    marginTop: scale(4),
  },
  yourPositionRankNumber: {
    fontSize: normalize(28),
    fontWeight: '800',
    color: tokens.colors.primary,
    letterSpacing: -0.5,
  },
  yourPositionChange: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: tokens.colors.successLight,
    paddingHorizontal: scale(8),
    paddingVertical: scale(4),
    borderRadius: scale(8),
    gap: scale(2),
  },
  yourPositionChangeText: {
    fontSize: normalize(12),
    fontWeight: '600',
    color: tokens.colors.success,
  },
  yourPositionPoints: {
    alignItems: 'flex-end',
  },
  yourPositionPointsLabel: {
    fontSize: normalize(12),
    color: tokens.colors.text.tertiary,
    fontWeight: '500',
  },
  yourPositionPointsValue: {
    fontSize: normalize(24),
    fontWeight: '700',
    color: tokens.colors.text.primary,
    letterSpacing: -0.5,
    marginTop: scale(4),
  },
  yourPositionProgress: {
    marginTop: scale(16),
  },
  progressBarBackground: {
    height: scale(6),
    backgroundColor: tokens.colors.border.light,
    borderRadius: scale(3),
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: tokens.colors.primary,
    borderRadius: scale(3),
  },
  progressText: {
    fontSize: normalize(11),
    color: tokens.colors.text.tertiary,
    marginTop: scale(6),
    textAlign: 'right',
  },
  podiumSection: {
    marginBottom: scale(24),
  },
  podiumRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingTop: scale(20),
  },
  podiumContainer: {
    alignItems: 'center',
    marginHorizontal: scale(6),
  },
  podiumFirst: {
    marginBottom: scale(10),
  },
  podiumAvatar: {
    backgroundColor: tokens.colors.surface.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: tokens.colors.border.light,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  podiumAvatarFirst: {
    borderColor: '#FFD700',
    borderWidth: 4,
  },
  podiumAvatarEmoji: {
    textAlign: 'center',
  },
  medalBadge: {
    marginTop: scale(-12),
    marginBottom: scale(4),
  },
  medalEmoji: {
    fontSize: normalize(24),
  },
  podiumName: {
    fontSize: normalize(13),
    fontWeight: '600',
    color: tokens.colors.text.primary,
    marginBottom: scale(2),
    maxWidth: scale(70),
    textAlign: 'center',
  },
  podiumNameFirst: {
    fontSize: normalize(14),
    fontWeight: '700',
  },
  podiumPoints: {
    fontSize: normalize(14),
    fontWeight: '700',
    color: tokens.colors.primary,
    marginBottom: scale(8),
  },
  podiumStand: {
    width: scale(80),
    borderTopLeftRadius: scale(12),
    borderTopRightRadius: scale(12),
    alignItems: 'center',
    justifyContent: 'center',
  },
  podiumRank: {
    fontSize: normalize(28),
    fontWeight: '800',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  leaderboardSection: {
    marginTop: scale(8),
  },
  sectionTitle: {
    fontSize: normalize(13),
    fontWeight: '600',
    color: tokens.colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: scale(12),
    marginLeft: scale(4),
  },
  leaderboardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: tokens.colors.surface.primary,
    padding: scale(14),
    borderRadius: scale(14),
    marginBottom: scale(8),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  leaderboardRowCurrent: {
    backgroundColor: tokens.colors.primaryLight,
    borderWidth: 2,
    borderColor: tokens.colors.primary,
  },
  rankContainer: {
    width: scale(36),
    alignItems: 'center',
    marginRight: scale(10),
  },
  rankText: {
    fontSize: normalize(16),
    fontWeight: '700',
    color: tokens.colors.text.secondary,
    marginBottom: scale(2),
  },
  rankTextCurrent: {
    color: tokens.colors.primary,
  },
  rowAvatar: {
    width: scale(44),
    height: scale(44),
    borderRadius: scale(22),
    backgroundColor: tokens.colors.background.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: scale(12),
  },
  rowAvatarEmoji: {
    fontSize: normalize(24),
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: normalize(15),
    fontWeight: '600',
    color: tokens.colors.text.primary,
    letterSpacing: -0.2,
  },
  userNameCurrent: {
    color: tokens.colors.primary,
    fontWeight: '700',
  },
  userDepartment: {
    fontSize: normalize(12),
    color: tokens.colors.text.tertiary,
    marginTop: scale(2),
  },
  pointsBadge: {
    backgroundColor: tokens.colors.primaryLight,
    paddingHorizontal: scale(12),
    paddingVertical: scale(6),
    borderRadius: scale(12),
  },
  pointsBadgeCurrent: {
    backgroundColor: tokens.colors.primary,
  },
  pointsText: {
    fontSize: normalize(14),
    fontWeight: '700',
    color: tokens.colors.primary,
  },
  pointsTextCurrent: {
    color: tokens.colors.white,
  },
});
