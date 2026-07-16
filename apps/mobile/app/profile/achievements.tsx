/**
 * Achievements Page - CampusPulse
 * Display student badges, milestones, and accomplishments
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Dimensions,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import Animated, {
  FadeInDown,
  FadeInUp,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

import { tokens } from '@/lib/styles/unified';
import { useAuth } from '@/lib/context/AuthContext';
import { supabase } from '@/lib/supabase/client';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Achievement types
interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof Feather.glyphMap;
  color: string;
  earned: boolean;
  earnedDate?: string;
  progress?: number;
  maxProgress?: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

// Sample achievements data
const ACHIEVEMENTS: Achievement[] = [
  {
    id: '1',
    title: 'First Steps',
    description: 'Attended your first campus event',
    icon: 'flag',
    color: '#4CAF50',
    earned: true,
    earnedDate: 'Oct 15, 2024',
    rarity: 'common',
  },
  {
    id: '2',
    title: 'Hackathon Hero',
    description: 'Participated in 3 hackathons',
    icon: 'code',
    color: '#2196F3',
    earned: true,
    earnedDate: 'Nov 20, 2024',
    progress: 3,
    maxProgress: 3,
    rarity: 'rare',
  },
  {
    id: '3',
    title: 'Social Butterfly',
    description: 'Attended 10 different club events',
    icon: 'users',
    color: '#9C27B0',
    earned: true,
    earnedDate: 'Dec 1, 2024',
    progress: 10,
    maxProgress: 10,
    rarity: 'rare',
  },
  {
    id: '4',
    title: 'Early Bird',
    description: 'Registered for 5 events within first hour',
    icon: 'sunrise',
    color: '#FF9800',
    earned: true,
    earnedDate: 'Dec 10, 2024',
    progress: 5,
    maxProgress: 5,
    rarity: 'epic',
  },
  {
    id: '5',
    title: 'Tech Enthusiast',
    description: 'Attend 20 tech events',
    icon: 'cpu',
    color: '#00BCD4',
    earned: false,
    progress: 12,
    maxProgress: 20,
    rarity: 'epic',
  },
  {
    id: '6',
    title: 'Campus Legend',
    description: 'Earn 1000 participation points',
    icon: 'award',
    color: '#FFD700',
    earned: false,
    progress: 850,
    maxProgress: 1000,
    rarity: 'legendary',
  },
  {
    id: '7',
    title: 'Workshop Warrior',
    description: 'Complete 5 skill workshops',
    icon: 'tool',
    color: '#E91E63',
    earned: false,
    progress: 3,
    maxProgress: 5,
    rarity: 'rare',
  },
  {
    id: '8',
    title: 'Network Ninja',
    description: 'Connect with 50 attendees at events',
    icon: 'link',
    color: '#607D8B',
    earned: false,
    progress: 28,
    maxProgress: 50,
    rarity: 'epic',
  },
];

const rarityColors = {
  common: { bg: '#E8F5E9', text: '#4CAF50' },
  rare: { bg: '#E3F2FD', text: '#2196F3' },
  epic: { bg: '#F3E5F5', text: '#9C27B0' },
  legendary: { bg: '#FFF8E1', text: '#FF8F00' },
};

// Map requirement_value to a rarity bucket
function rarityFor(reqValue: number | null | undefined): Achievement['rarity'] {
  const v = reqValue ?? 0;
  if (v >= 1000) return 'legendary';
  if (v >= 100) return 'epic';
  if (v >= 10) return 'rare';
  return 'common';
}

export default function AchievementsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { profile } = useAuth();

  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [stats, setStats] = useState({
    totalEarned: 0,
    totalAvailable: 0,
    campusPoints: 0,
    campusRank: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      const { data: allBadges } = await supabase
        .from('badges')
        .select('id, name, description, icon, color, requirement_type, requirement_value, is_active')
        .eq('is_active', true);
      const userId = profile?.id;
      const { data: earned } = userId
        ? await supabase
            .from('user_badges')
            .select('badge_id, earned_at')
            .eq('user_id', userId)
        : { data: [] as Array<{ badge_id: string; earned_at: string | null }> };

      const earnedMap = new Map(
        (earned ?? []).map((e) => [e.badge_id, e.earned_at]),
      );

      const totalPoints = profile?.total_points ?? 0;
      const eventsAttended = profile?.events_attended ?? 0;

      const list: Achievement[] = (allBadges ?? []).map((b) => {
        const earnedAt = earnedMap.get(b.id);
        const isEarned = !!earnedAt;
        const reqValue = b.requirement_value ?? 0;
        const progress =
          b.requirement_type === 'events_attended'
            ? Math.min(eventsAttended, reqValue)
            : b.requirement_type === 'points_earned'
              ? Math.min(totalPoints, reqValue)
              : isEarned
                ? reqValue
                : 0;
        return {
          id: b.id,
          title: b.name,
          description: b.description ?? '',
          icon: ((b.icon as keyof typeof Feather.glyphMap) ?? 'award'),
          color: b.color ?? '#6366f1',
          earned: isEarned,
          earnedDate: earnedAt
            ? new Date(earnedAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })
            : undefined,
          progress: reqValue > 0 ? progress : undefined,
          maxProgress: reqValue > 0 ? reqValue : undefined,
          rarity: rarityFor(reqValue),
        };
      });

      // Get rank from leaderboard view
      let rank = 0;
      if (userId) {
        const { data: lb } = await supabase
          .from('leaderboard')
          .select('id, rank')
          .eq('id', userId)
          .single();
        rank = lb?.rank ?? 0;
      }

      setAchievements(list);
      setStats({
        totalEarned: list.filter((a) => a.earned).length,
        totalAvailable: list.length,
        campusPoints: totalPoints,
        campusRank: rank,
      });
    };
    fetchData();
  }, [profile?.id, profile?.total_points, profile?.events_attended]);

  const earnedAchievements = achievements.filter((a) => a.earned);
  const inProgressAchievements = achievements.filter((a) => !a.earned);
  const STATS = stats;

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: 'Achievements',
          headerStyle: { backgroundColor: tokens.colors.background.primary },
          headerTitleStyle: { color: tokens.colors.text.primary, fontWeight: '600' },
          headerShadowVisible: false,
          headerBackVisible: false,
          headerTintColor: tokens.colors.text.primary,
          headerLeft: () => (
            <Pressable
              onPress={() => router.back()}
              hitSlop={12}
              style={({ pressed }) => [styles.backButton, pressed && { opacity: 0.6 }]}
            >
              <Feather name="chevron-left" size={22} color={tokens.colors.text.primary} />
            </Pressable>
          ),
        }}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Stats Summary */}
        <Animated.View entering={FadeInDown.duration(400)} style={styles.statsCard}>
          <LinearGradient
            colors={[tokens.colors.primary, '#5B21B6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.statsContent}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{STATS.totalEarned}/{STATS.totalAvailable}</Text>
              <Text style={styles.statLabel}>Badges Earned</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{STATS.campusPoints}</Text>
              <Text style={styles.statLabel}>Campus Points</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>#{STATS.campusRank}</Text>
              <Text style={styles.statLabel}>Campus Rank</Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressSection}>
            <Text style={styles.progressLabel}>
              {Math.round((STATS.totalEarned / STATS.totalAvailable) * 100)}% Complete
            </Text>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${(STATS.totalEarned / STATS.totalAvailable) * 100}%` }
                ]}
              />
            </View>
          </View>
        </Animated.View>

        {/* Earned Section */}
        <Animated.View entering={FadeInUp.delay(200).duration(400)}>
          <Text style={styles.sectionTitle}>Earned Badges</Text>
          <View style={styles.achievementsGrid}>
            {earnedAchievements.map((achievement, index) => (
              <Animated.View
                key={achievement.id}
                entering={FadeInUp.delay(300 + index * 100).duration(400)}
                style={styles.achievementCard}
              >
                <View style={[styles.iconContainer, { backgroundColor: achievement.color + '20' }]}>
                  <Feather name={achievement.icon} size={28} color={achievement.color} />
                </View>
                <View style={styles.achievementInfo}>
                  <Text style={styles.achievementTitle}>{achievement.title}</Text>
                  <Text style={styles.achievementDesc}>{achievement.description}</Text>
                  <View style={styles.achievementMeta}>
                    <View style={[
                      styles.rarityBadge,
                      { backgroundColor: rarityColors[achievement.rarity].bg }
                    ]}>
                      <Text style={[
                        styles.rarityText,
                        { color: rarityColors[achievement.rarity].text }
                      ]}>
                        {achievement.rarity.charAt(0).toUpperCase() + achievement.rarity.slice(1)}
                      </Text>
                    </View>
                    {achievement.earnedDate && (
                      <Text style={styles.earnedDate}>{achievement.earnedDate}</Text>
                    )}
                  </View>
                </View>
                <Feather name="check-circle" size={20} color={tokens.colors.success} />
              </Animated.View>
            ))}
          </View>
        </Animated.View>

        {/* In Progress Section */}
        <Animated.View entering={FadeInUp.delay(600).duration(400)}>
          <Text style={styles.sectionTitle}>In Progress</Text>
          <View style={styles.achievementsGrid}>
            {inProgressAchievements.map((achievement, index) => (
              <Animated.View
                key={achievement.id}
                entering={FadeInUp.delay(700 + index * 100).duration(400)}
                style={[styles.achievementCard, styles.lockedCard]}
              >
                <View style={[styles.iconContainer, { backgroundColor: tokens.colors.background.secondary }]}>
                  <Feather name={achievement.icon} size={28} color={tokens.colors.text.tertiary} />
                </View>
                <View style={styles.achievementInfo}>
                  <Text style={[styles.achievementTitle, styles.lockedTitle]}>{achievement.title}</Text>
                  <Text style={styles.achievementDesc}>{achievement.description}</Text>

                  {/* Progress Bar */}
                  {achievement.progress !== undefined && achievement.maxProgress && (
                    <View style={styles.achievementProgress}>
                      <View style={styles.miniProgressBar}>
                        <View
                          style={[
                            styles.miniProgressFill,
                            { width: `${(achievement.progress / achievement.maxProgress) * 100}%` }
                          ]}
                        />
                      </View>
                      <Text style={styles.progressText}>
                        {achievement.progress}/{achievement.maxProgress}
                      </Text>
                    </View>
                  )}

                  <View style={[
                    styles.rarityBadge,
                    { backgroundColor: rarityColors[achievement.rarity].bg, marginTop: 8 }
                  ]}>
                    <Text style={[
                      styles.rarityText,
                      { color: rarityColors[achievement.rarity].text }
                    ]}>
                      {achievement.rarity.charAt(0).toUpperCase() + achievement.rarity.slice(1)}
                    </Text>
                  </View>
                </View>
                <Feather name="lock" size={18} color={tokens.colors.text.tertiary} />
              </Animated.View>
            ))}
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.colors.background.primary,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  statsCard: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 28,
  },
  statsContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  progressSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  progressLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 8,
    fontWeight: '500',
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: tokens.colors.text.primary,
    marginBottom: 20,
  },
  achievementsGrid: {
    gap: 14,
    marginBottom: 32,
  },
  achievementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  lockedCard: {
    backgroundColor: tokens.colors.background.secondary,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: tokens.colors.text.primary,
    marginBottom: 4,
  },
  lockedTitle: {
    color: tokens.colors.text.secondary,
  },
  achievementDesc: {
    fontSize: 13,
    color: tokens.colors.text.secondary,
    lineHeight: 18,
  },
  achievementMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
  },
  rarityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  rarityText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  earnedDate: {
    fontSize: 12,
    color: tokens.colors.text.tertiary,
  },
  achievementProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 10,
  },
  miniProgressBar: {
    flex: 1,
    height: 6,
    backgroundColor: tokens.colors.border.light,
    borderRadius: 3,
    overflow: 'hidden',
  },
  miniProgressFill: {
    height: '100%',
    backgroundColor: tokens.colors.primary,
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    color: tokens.colors.text.secondary,
    minWidth: 45,
    textAlign: 'right',
  },
});
