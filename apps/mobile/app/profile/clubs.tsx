/**
 * My Clubs Page - CampusPulse
 * Display clubs the student has joined and their activities
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
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

// Club interface
interface Club {
  id: string;
  name: string;
  shortName: string;
  description: string;
  color: string;
  memberCount: number;
  eventsHosted: number;
  role: 'member' | 'coordinator' | 'president';
  joinedDate: string;
  upcomingEvents: number;
  category: string;
}

// Sample clubs data
const MY_CLUBS: Club[] = [
  {
    id: '1',
    name: 'Google Developer Student Club',
    shortName: 'GDSC',
    description: 'A community of developers interested in Google technologies',
    color: '#4285F4',
    memberCount: 234,
    eventsHosted: 18,
    role: 'coordinator',
    joinedDate: 'Aug 2024',
    upcomingEvents: 3,
    category: 'Technology',
  },
  {
    id: '2',
    name: 'Robotics Club',
    shortName: 'RC',
    description: 'Building the future with robots and automation',
    color: '#FF6B6B',
    memberCount: 89,
    eventsHosted: 12,
    role: 'member',
    joinedDate: 'Sep 2024',
    upcomingEvents: 2,
    category: 'Engineering',
  },
  {
    id: '3',
    name: 'AI/ML Research Group',
    shortName: 'AIML',
    description: 'Exploring artificial intelligence and machine learning',
    color: '#9C27B0',
    memberCount: 156,
    eventsHosted: 8,
    role: 'member',
    joinedDate: 'Oct 2024',
    upcomingEvents: 1,
    category: 'Research',
  },
  {
    id: '4',
    name: 'Photography Club',
    shortName: 'PC',
    description: 'Capturing moments and creating visual stories',
    color: '#FF9800',
    memberCount: 67,
    eventsHosted: 15,
    role: 'member',
    joinedDate: 'Nov 2024',
    upcomingEvents: 4,
    category: 'Arts',
  },
];

const SUGGESTED_CLUBS = [
  {
    id: '5',
    name: 'Entrepreneurship Cell',
    shortName: 'E-Cell',
    memberCount: 312,
    color: '#00BCD4',
    category: 'Business',
  },
  {
    id: '6',
    name: 'Open Source Community',
    shortName: 'OSC',
    memberCount: 145,
    color: '#4CAF50',
    category: 'Technology',
  },
];

const roleColors = {
  member: { bg: tokens.colors.background.secondary, text: tokens.colors.text.secondary },
  coordinator: { bg: tokens.colors.primaryLight, text: tokens.colors.primary },
  president: { bg: '#FFF3E0', text: '#E65100' },
};

export default function ClubsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<'my' | 'discover'>('my');

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: 'My Clubs',
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

      {/* Tabs */}
      <Animated.View entering={FadeInDown.duration(300)} style={styles.tabsContainer}>
        <Pressable
          style={[styles.tab, activeTab === 'my' && styles.tabActive]}
          onPress={() => setActiveTab('my')}
        >
          <Text style={[styles.tabText, activeTab === 'my' && styles.tabTextActive]}>
            My Clubs ({MY_CLUBS.length})
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tab, activeTab === 'discover' && styles.tabActive]}
          onPress={() => setActiveTab('discover')}
        >
          <Text style={[styles.tabText, activeTab === 'discover' && styles.tabTextActive]}>
            Discover
          </Text>
        </Pressable>
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'my' ? (
          <>
            {/* Summary Stats */}
            <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.summaryCard}>
              <View style={styles.summaryItem}>
                <Feather name="users" size={20} color={tokens.colors.primary} />
                <Text style={styles.summaryValue}>{MY_CLUBS.length}</Text>
                <Text style={styles.summaryLabel}>Clubs Joined</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryItem}>
                <Feather name="calendar" size={20} color={tokens.colors.success} />
                <Text style={styles.summaryValue}>
                  {MY_CLUBS.reduce((acc, club) => acc + club.upcomingEvents, 0)}
                </Text>
                <Text style={styles.summaryLabel}>Upcoming Events</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryItem}>
                <Feather name="star" size={20} color="#FF9800" />
                <Text style={styles.summaryValue}>
                  {MY_CLUBS.filter(c => c.role !== 'member').length}
                </Text>
                <Text style={styles.summaryLabel}>Leadership Roles</Text>
              </View>
            </Animated.View>

            {/* Club Cards */}
            {MY_CLUBS.map((club, index) => (
              <Animated.View
                key={club.id}
                entering={FadeInUp.delay(200 + index * 100).duration(400)}
              >
                <Pressable style={styles.clubCard}>
                  {/* Club Header */}
                  <View style={styles.clubHeader}>
                    <View style={[styles.clubAvatar, { backgroundColor: club.color }]}>
                      <Text style={styles.clubAvatarText}>{club.shortName}</Text>
                    </View>
                    <View style={styles.clubInfo}>
                      <Text style={styles.clubName}>{club.name}</Text>
                      <Text style={styles.clubCategory}>{club.category}</Text>
                    </View>
                    <View style={[
                      styles.roleBadge,
                      { backgroundColor: roleColors[club.role].bg }
                    ]}>
                      <Text style={[
                        styles.roleText,
                        { color: roleColors[club.role].text }
                      ]}>
                        {club.role.charAt(0).toUpperCase() + club.role.slice(1)}
                      </Text>
                    </View>
                  </View>

                  {/* Club Description */}
                  <Text style={styles.clubDescription}>{club.description}</Text>

                  {/* Club Stats */}
                  <View style={styles.clubStats}>
                    <View style={styles.clubStatItem}>
                      <Feather name="users" size={14} color={tokens.colors.text.tertiary} />
                      <Text style={styles.clubStatText}>{club.memberCount} members</Text>
                    </View>
                    <View style={styles.clubStatItem}>
                      <Feather name="calendar" size={14} color={tokens.colors.text.tertiary} />
                      <Text style={styles.clubStatText}>{club.eventsHosted} events</Text>
                    </View>
                    <View style={styles.clubStatItem}>
                      <Feather name="clock" size={14} color={tokens.colors.text.tertiary} />
                      <Text style={styles.clubStatText}>Since {club.joinedDate}</Text>
                    </View>
                  </View>

                  {/* Upcoming Events Badge */}
                  {club.upcomingEvents > 0 && (
                    <View style={styles.upcomingBadge}>
                      <Feather name="bell" size={14} color={tokens.colors.primary} />
                      <Text style={styles.upcomingText}>
                        {club.upcomingEvents} upcoming event{club.upcomingEvents > 1 ? 's' : ''}
                      </Text>
                      <Feather name="chevron-right" size={16} color={tokens.colors.text.tertiary} />
                    </View>
                  )}
                </Pressable>
              </Animated.View>
            ))}
          </>
        ) : (
          <>
            {/* Discover Section */}
            <Animated.View entering={FadeInDown.duration(400)}>
              <Text style={styles.discoverTitle}>Recommended for You</Text>
              <Text style={styles.discoverSubtitle}>
                Based on your interests and activities
              </Text>
            </Animated.View>

            {SUGGESTED_CLUBS.map((club, index) => (
              <Animated.View
                key={club.id}
                entering={FadeInUp.delay(100 + index * 100).duration(400)}
              >
                <Pressable style={styles.suggestedCard}>
                  <View style={[styles.clubAvatar, { backgroundColor: club.color }]}>
                    <Text style={styles.clubAvatarText}>{club.shortName}</Text>
                  </View>
                  <View style={styles.suggestedInfo}>
                    <Text style={styles.clubName}>{club.name}</Text>
                    <View style={styles.suggestedMeta}>
                      <Text style={styles.suggestedCategory}>{club.category}</Text>
                      <Text style={styles.suggestedMembers}>
                        {club.memberCount} members
                      </Text>
                    </View>
                  </View>
                  <Pressable style={styles.joinButton}>
                    <Text style={styles.joinButtonText}>Join</Text>
                  </Pressable>
                </Pressable>
              </Animated.View>
            ))}

            {/* Browse All */}
            <Animated.View entering={FadeInUp.delay(400).duration(400)}>
              <Pressable style={styles.browseAllButton}>
                <Feather name="compass" size={20} color={tokens.colors.primary} />
                <Text style={styles.browseAllText}>Browse All Clubs</Text>
                <Feather name="chevron-right" size={20} color={tokens.colors.primary} />
              </Pressable>
            </Animated.View>
          </>
        )}
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
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: tokens.colors.background.secondary,
  },
  tabActive: {
    backgroundColor: tokens.colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: tokens.colors.text.secondary,
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 0,
  },
  summaryCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  summaryValue: {
    fontSize: 22,
    fontWeight: '700',
    color: tokens.colors.text.primary,
  },
  summaryLabel: {
    fontSize: 11,
    color: tokens.colors.text.tertiary,
    textAlign: 'center',
  },
  summaryDivider: {
    width: 1,
    backgroundColor: tokens.colors.border.light,
    marginVertical: 4,
  },
  clubCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  clubHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  clubAvatar: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clubAvatarText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  clubInfo: {
    flex: 1,
    marginLeft: 12,
  },
  clubName: {
    fontSize: 16,
    fontWeight: '600',
    color: tokens.colors.text.primary,
    marginBottom: 2,
  },
  clubCategory: {
    fontSize: 13,
    color: tokens.colors.text.tertiary,
  },
  roleBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '600',
  },
  clubDescription: {
    fontSize: 14,
    color: tokens.colors.text.secondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  clubStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 12,
  },
  clubStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  clubStatText: {
    fontSize: 13,
    color: tokens.colors.text.secondary,
  },
  upcomingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: tokens.colors.primaryLight,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 4,
  },
  upcomingText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
    color: tokens.colors.primary,
  },
  discoverTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: tokens.colors.text.primary,
    marginBottom: 4,
  },
  discoverSubtitle: {
    fontSize: 14,
    color: tokens.colors.text.secondary,
    marginBottom: 20,
  },
  suggestedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  suggestedInfo: {
    flex: 1,
    marginLeft: 12,
  },
  suggestedMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  suggestedCategory: {
    fontSize: 12,
    color: tokens.colors.text.tertiary,
    backgroundColor: tokens.colors.background.secondary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  suggestedMembers: {
    fontSize: 12,
    color: tokens.colors.text.tertiary,
  },
  joinButton: {
    backgroundColor: tokens.colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  joinButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  browseAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: tokens.colors.primaryLight,
    paddingVertical: 16,
    borderRadius: 14,
    marginTop: 8,
  },
  browseAllText: {
    fontSize: 15,
    fontWeight: '600',
    color: tokens.colors.primary,
  },
});
