/**
 * Achievements Page - CampusPulse
 * Display student badges, milestones, and accomplishments
 */

import React from 'react';
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

const STATS = {
  totalEarned: 4,
  totalAvailable: 8,
  eventsAttended: 18,
  certificates: 8,
};

const rarityColors = {
  common: { bg: '#E8F5E9', text: '#4CAF50' },
  rare: { bg: '#E3F2FD', text: '#2196F3' },
  epic: { bg: '#F3E5F5', text: '#9C27B0' },
  legendary: { bg: '#FFF8E1', text: '#FF8F00' },
};

export default function AchievementsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const earnedAchievements = ACHIEVEMENTS.filter(a => a.earned);
  const inProgressAchievements = ACHIEVEMENTS.filter(a => !a.earned);

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: 'Achievements',
          headerStyle: { backgroundColor: tokens.colors.background.primary },
          headerTitleStyle: { color: tokens.colors.text.primary, fontWeight: '600' },
          headerShadowVisible: false,
          headerLeft: () => (
            <Pressable onPress={() => router.back()} style={styles.backButton}>
              <Feather name="chevron-left" size={24} color={tokens.colors.text.primary} />
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
              <Text style={styles.statValue}>{STATS.eventsAttended}</Text>
              <Text style={styles.statLabel}>Events Attended</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{STATS.certificates}</Text>
              <Text style={styles.statLabel}>Certificates</Text>
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
    padding: 8,
    marginLeft: -8,
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
    fontSize: 20,
    fontWeight: '700',
    color: tokens.colors.text.primary,
    marginBottom: 16,
  },
  achievementsGrid: {
    gap: 12,
    marginBottom: 28,
  },
  achievementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
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
