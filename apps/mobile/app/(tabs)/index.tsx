/**
 * Home Screen - CampusPulse Design System
 * Production-ready home screen with unified typography and layout
 * Connected to real Supabase backend
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  Pressable,
  Image,
  StyleSheet,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Animated, {
  FadeInDown,
  FadeInRight,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  interpolate,
  Easing,
} from 'react-native-reanimated';

import { tokens, typography, layout } from '@/lib/styles/unified';
import { useAuth } from '@/lib/context/AuthContext';
import { Avatar } from '@/components/ui/Avatar';
import { useFeaturedEvents, useEvents } from '@/lib/hooks/useEvents';
import { useUserStats, useUserRank } from '@/lib/hooks/useProfile';
import { useReminders } from '@/lib/hooks/useReminders';
import { EventWithClub } from '@/lib/supabase/database.types';

const CARD_WIDTH = 300;
const REMINDER_CARD_WIDTH = layout.screenWidth * 0.75;

// Types
interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  image: string;
  price: string | number;
  category: string;
  attendees: number;
  isFavorite?: boolean;
  points?: number;
}

interface Reminder {
  id: string;
  eventId: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  location: string;
  timeUntil: string;
  color: string;
  icon: keyof typeof Feather.glyphMap;
}

// Default fallback data when not authenticated
const DEFAULT_USER = {
  name: 'Guest',
  avatar: '',
  location: 'GITAM University',
  regNo: '',
};

// Format event from database to display format
const formatEventForDisplay = (event: EventWithClub): Event => {
  const eventDate = event.start_time ? new Date(event.start_time) : null;
  return {
    id: event.id,
    title: event.title,
    date: eventDate ? eventDate.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    }) : 'TBD',
    time: eventDate ? eventDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }) : 'TBD',
    location: event.venue || 'TBD',
    image: event.image_url || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&q=80',
    price: 'Free', // Events are free in our schema
    category: event.category || 'event',
    attendees: event.current_registrations || 0,
    isFavorite: false,
    points: event.points_reward || 0,
  };
};

// Home Reminder Card Component - Clean Professional Design
function HomeReminderCard({ reminder, index }: { reminder: Reminder; index: number }) {
  const router = useRouter();
  const scale = useSharedValue(1);
  const pulseOpacity = useSharedValue(0.6);

  // Smooth pulse animation for the live indicator
  useEffect(() => {
    pulseOpacity.value = withRepeat(
      withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: pulseOpacity.value,
  }));

  const handlePressIn = () => {
    scale.value = withTiming(0.97, { duration: 100 });
  };

  const handlePressOut = () => {
    scale.value = withTiming(1, { duration: 150 });
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/event/${reminder.eventId}`);
  };

  return (
    <Animated.View
      entering={FadeInRight.delay(index * 80).duration(400)}
      style={{ width: REMINDER_CARD_WIDTH, maxWidth: 290 }}
    >
      <Animated.View style={animatedStyle}>
        <Pressable
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={handlePress}
          style={styles.reminderCard}
        >
        <LinearGradient
          colors={[reminder.color, `${reminder.color}DD`]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.reminderGradient}
        >
          {/* Header */}
          <View style={styles.reminderHeader}>
            <View style={styles.reminderIconBg}>
              <Feather name={reminder.icon} size={18} color="#FFFFFF" />
            </View>
            <View style={styles.reminderTimeBadge}>
              <Animated.View style={[styles.reminderLiveIndicator, pulseStyle]} />
              <Text style={styles.reminderTimeText}>{reminder.timeUntil}</Text>
            </View>
          </View>

          {/* Title */}
          <Text style={styles.reminderTitle} numberOfLines={2}>
            {reminder.eventTitle}
          </Text>

          {/* Meta Info */}
          <View style={styles.reminderMeta}>
            <View style={styles.reminderMetaRow}>
              <Feather name="calendar" size={12} color="rgba(255,255,255,0.8)" />
              <Text style={styles.reminderMetaText}>
                {reminder.eventDate} • {reminder.eventTime}
              </Text>
            </View>
            <View style={styles.reminderMetaRow}>
              <Feather name="map-pin" size={12} color="rgba(255,255,255,0.8)" />
              <Text style={styles.reminderMetaText} numberOfLines={1}>
                {reminder.location}
              </Text>
            </View>
          </View>

          {/* Bottom Row */}
          <View style={styles.reminderBottom}>
            <View style={styles.reminderBellIndicator}>
              <Feather name="bell" size={12} color={reminder.color} />
              <Text style={[styles.reminderBellText, { color: reminder.color }]}>Active</Text>
            </View>
            <View style={styles.reminderViewButton}>
              <Text style={styles.reminderViewText}>View Event</Text>
              <Feather name="arrow-right" size={14} color="#FFFFFF" />
            </View>
          </View>
        </LinearGradient>
      </Pressable>
      </Animated.View>
    </Animated.View>
  );
}

// Featured Event Card Component
function FeaturedEventCard({ event, index }: { event: Event; index: number }) {
  const router = useRouter();
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
    router.push(`/event/${event.id}`);
  };

  const handleFavorite = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <Animated.View
      entering={FadeInRight.delay(100 + index * 80).duration(400)}
      style={{ width: CARD_WIDTH }}
    >
      <Animated.View style={animatedStyle}>
        <Pressable
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={handlePress}
          style={styles.featuredCard}
        >
        {/* Event Image */}
        <Image
          source={{ uri: event.image }}
          style={styles.featuredImage}
          resizeMode="cover"
        />

        {/* Gradient Overlay */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)']}
          style={styles.featuredGradient}
        />

        {/* Price Badge */}
        <View style={styles.priceBadge}>
          <Text style={styles.priceBadgeText}>
            {typeof event.price === 'number' ? `$${event.price}` : event.price}
          </Text>
        </View>

        {/* Points Badge */}
        {event.points && (
          <View style={styles.pointsBadge}>
            <Feather name="award" size={12} color="#F59E0B" />
            <Text style={styles.pointsBadgeText}>+{event.points} pts</Text>
          </View>
        )}

        {/* Favorite Button */}
        <Pressable style={styles.favoriteButton} onPress={handleFavorite}>
          <Feather
            name="heart"
            size={18}
            color={event.isFavorite ? '#F44336' : '#9E9E9E'}
            style={event.isFavorite ? { opacity: 1 } : { opacity: 0.7 }}
          />
        </Pressable>

        {/* Event Info */}
        <View style={styles.featuredContent}>
          <Text style={styles.featuredTitle} numberOfLines={2}>
            {event.title}
          </Text>

          <View style={styles.featuredMeta}>
            <View style={styles.metaRow}>
              <Feather name="calendar" size={14} color={tokens.colors.primary} />
              <Text style={styles.metaText}>
                {event.date} - {event.time}
              </Text>
            </View>

            <View style={styles.metaRow}>
              <Feather name="map-pin" size={14} color={tokens.colors.primary} />
              <Text style={styles.metaText} numberOfLines={1}>
                {event.location}
              </Text>
            </View>
          </View>

          {/* Attendees */}
          <View style={styles.attendeesRow}>
            <View style={styles.attendeesPill}>
              <Feather name="users" size={12} color={tokens.colors.primary} />
              <Text style={styles.attendeesText}>
                {event.attendees} going
              </Text>
            </View>
          </View>
        </View>
      </Pressable>
      </Animated.View>
    </Animated.View>
  );
}

// Upcoming Event Card Component
function UpcomingEventCard({ event, index }: { event: Event; index: number }) {
  const router = useRouter();
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
    router.push(`/event/${event.id}`);
  };

  return (
    <Animated.View
      entering={FadeInDown.delay(200 + index * 60).duration(400)}
    >
      <Animated.View style={animatedStyle}>
        <Pressable
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={handlePress}
          style={styles.upcomingCard}
        >
        {/* Event Image */}
        <Image
          source={{ uri: event.image }}
          style={styles.upcomingImage}
          resizeMode="cover"
        />

        {/* Event Info */}
        <View style={styles.upcomingContent}>
          <Text style={styles.upcomingTitle} numberOfLines={2}>
            {event.title}
          </Text>

          <View style={styles.upcomingMeta}>
            <Feather name="calendar" size={12} color={tokens.colors.primary} />
            <Text style={styles.upcomingDate}>
              {event.date} - {event.time}
            </Text>
          </View>

          <View style={styles.upcomingMeta}>
            <Feather name="map-pin" size={12} color={tokens.colors.text.tertiary} />
            <Text style={styles.upcomingLocation} numberOfLines={1}>
              {event.location}
            </Text>
          </View>
        </View>

        {/* Price */}
        <View style={styles.upcomingPrice}>
          <Text style={styles.upcomingPriceText}>
            {typeof event.price === 'number' ? `$${event.price}` : event.price}
          </Text>
          {event.points && (
            <View style={styles.upcomingPointsBadge}>
              <Feather name="award" size={10} color="#F59E0B" />
              <Text style={styles.upcomingPointsText}>+{event.points}</Text>
            </View>
          )}
        </View>
      </Pressable>
      </Animated.View>
    </Animated.View>
  );
}

// Main Home Screen
export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);

  // Real data hooks
  const { user, profile, isAuthenticated } = useAuth();
  const { events: featuredEvents, isLoading: loadingFeatured, refresh: refreshFeatured } = useFeaturedEvents(5);
  const { events: upcomingEvents, isLoading: loadingUpcoming, refresh: refreshUpcoming } = useEvents();
  const { stats, isLoading: loadingStats, refresh: refreshStats } = useUserStats();
  const { rank, isLoading: loadingRank, refresh: refreshRank } = useUserRank();
  const { reminders, isLoading: loadingReminders, refresh: refreshReminders } = useReminders();

  // Prepare user data
  const userData = {
    name: profile?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || DEFAULT_USER.name,
    fullName: profile?.full_name || user?.email?.split('@')[0] || DEFAULT_USER.name,
    avatar: profile?.avatar_url || '',
    location: 'GITAM University',
    regNo: profile?.student_id || DEFAULT_USER.regNo,
  };

  // Prepare quick stats with real data
  const quickStats = [
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
  ];

  // Format events for display
  const displayFeaturedEvents: Event[] = featuredEvents.map(formatEventForDisplay);
  const displayUpcomingEvents: Event[] = upcomingEvents.slice(0, 6).map(formatEventForDisplay);

  // Format reminders for display
  const displayReminders: Reminder[] = reminders.map(r => ({
    id: r.id,
    eventId: r.eventId,
    eventTitle: r.eventTitle,
    eventDate: r.eventDate,
    eventTime: r.eventTime,
    location: r.location,
    timeUntil: r.timeUntil,
    color: r.color,
    icon: r.icon as keyof typeof Feather.glyphMap,
  }));

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      refreshFeatured(),
      refreshUpcoming(),
      refreshStats(),
      refreshRank(),
      refreshReminders(),
    ]);
    setRefreshing(false);
  }, [refreshFeatured, refreshUpcoming, refreshStats, refreshRank, refreshReminders]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const isLoading = loadingFeatured || loadingUpcoming;

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 90 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={tokens.colors.primary}
              colors={[tokens.colors.primary]}
            />
          }
        >
          {/* Header Section */}
          <Animated.View
            entering={FadeInDown.delay(100).springify()}
            style={styles.header}
          >
            <View style={styles.headerTop}>
              {/* User Profile */}
              <Pressable
                style={styles.userSection}
                onPress={() => router.push('/(tabs)/profile')}
              >
                <View style={styles.avatarContainer}>
                  <Avatar
                    source={userData.avatar || undefined}
                    name={userData.fullName}
                    size="lg"
                  />
                </View>

                <View style={styles.greetingContainer}>
                  <Text style={styles.greetingText}>
                    {getGreeting()}
                  </Text>
                  <Text style={styles.userName}>
                    {userData.name}
                  </Text>
                </View>
              </Pressable>
            </View>

            {/* Location */}
            <Pressable style={styles.locationRow}>
              <Feather name="map-pin" size={14} color={tokens.colors.primary} />
              <Text style={styles.locationText}>{userData.location}</Text>
              <Feather name="chevron-down" size={14} color={tokens.colors.text.tertiary} />
            </Pressable>
          </Animated.View>

          {/* Search Bar */}
          <Animated.View
            entering={FadeInDown.delay(150).springify()}
            style={styles.searchSection}
          >
            <Pressable
              style={styles.searchBar}
              onPress={() => router.push('/(tabs)/explore')}
            >
              <Feather name="search" size={20} color={tokens.colors.text.tertiary} />
              <Text style={styles.searchPlaceholder}>
                Search events, clubs, workshops...
              </Text>
              <View style={styles.filterButton}>
                <Feather name="sliders" size={16} color={tokens.colors.primary} />
              </View>
            </Pressable>
          </Animated.View>

          {/* Quick Stats Section - What Matters */}
          <Animated.View
            entering={FadeInDown.delay(210).springify()}
            style={styles.quickStatsSection}
          >
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Your Activity</Text>
              <Pressable
                style={styles.seeAllButton}
                onPress={() => router.push('/(tabs)/profile')}
              >
                <Text style={styles.seeAllText}>View Profile</Text>
                <Feather name="arrow-right" size={16} color={tokens.colors.primary} />
              </Pressable>
            </View>

            <View style={styles.quickStatsGrid}>
              {quickStats.map((stat, index) => (
                <Pressable
                  key={stat.id}
                  style={styles.quickStatCard}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    router.push(stat.route as any);
                  }}
                >
                  <View style={[styles.quickStatIcon, { backgroundColor: `${stat.color}15` }]}>
                    <Feather name={stat.icon} size={20} color={stat.color} />
                  </View>
                  <Text style={styles.quickStatValue}>{stat.value}</Text>
                  <Text style={styles.quickStatLabel}>{stat.label}</Text>
                </Pressable>
              ))}
            </View>
          </Animated.View>

          {/* My Reminders Section */}
          {displayReminders.length > 0 && (
            <Animated.View
              entering={FadeInDown.delay(220).springify()}
              style={styles.section}
            >
              <View style={styles.sectionHeader}>
                <View style={styles.reminderSectionTitle}>
                  <Feather name="bell" size={18} color={tokens.colors.primary} />
                  <Text style={styles.sectionTitle}>My Reminders</Text>
                </View>
                <Pressable
                  style={styles.seeAllButton}
                  onPress={() => router.push('/notifications')}
                >
                  <Text style={styles.seeAllText}>See All</Text>
                  <Feather name="arrow-right" size={16} color={tokens.colors.primary} />
                </Pressable>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.remindersScroll}
              >
                {displayReminders.map((reminder, index) => (
                  <HomeReminderCard key={reminder.id} reminder={reminder} index={index} />
                ))}
              </ScrollView>
            </Animated.View>
          )}

          {/* Featured Events Section */}
          <Animated.View
            entering={FadeInDown.delay(250).springify()}
            style={styles.section}
          >
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Featured Events</Text>
              <Pressable
                style={styles.seeAllButton}
                onPress={() => router.push('/(tabs)/explore')}
              >
                <Text style={styles.seeAllText}>See All</Text>
                <Feather name="arrow-right" size={16} color={tokens.colors.primary} />
              </Pressable>
            </View>

            {loadingFeatured ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={tokens.colors.primary} />
              </View>
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.featuredScroll}
                snapToInterval={CARD_WIDTH + 16}
                decelerationRate="fast"
              >
                {displayFeaturedEvents.map((event, index) => (
                  <FeaturedEventCard key={event.id} event={event} index={index} />
                ))}
              </ScrollView>
            )}
          </Animated.View>

          {/* Upcoming Events Section */}
          <Animated.View
            entering={FadeInDown.delay(300).springify()}
            style={styles.section}
          >
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Upcoming Events</Text>
              <Pressable
                style={styles.seeAllButton}
                onPress={() => router.push('/(tabs)/explore')}
              >
                <Text style={styles.seeAllText}>See All</Text>
                <Feather name="arrow-right" size={16} color={tokens.colors.primary} />
              </Pressable>
            </View>

            {loadingUpcoming ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={tokens.colors.primary} />
              </View>
            ) : (
              <View style={styles.upcomingList}>
                {displayUpcomingEvents.map((event, index) => (
                  <UpcomingEventCard key={event.id} event={event} index={index} />
                ))}
              </View>
            )}
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  safeArea: {
    flex: 1,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Header
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: tokens.colors.primary,
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  greetingContainer: {
    gap: 2,
  },
  greetingText: {
    fontSize: 14,
    color: tokens.colors.text.tertiary,
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    color: tokens.colors.text.primary,
    letterSpacing: -0.3,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 12,
  },
  locationText: {
    fontSize: 14,
    color: tokens.colors.text.secondary,
  },

  // Search
  searchSection: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
    gap: 12,
  },
  searchPlaceholder: {
    flex: 1,
    fontSize: 15,
    color: tokens.colors.text.tertiary,
  },
  filterButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#FFF4F0',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Categories
  categoriesSection: {
    marginBottom: 8,
  },
  categoriesScroll: {
    paddingHorizontal: 20,
    gap: 10,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E5E5E5',
  },
  categoryChipSelected: {
    backgroundColor: tokens.colors.primary,
    borderColor: tokens.colors.primary,
    shadowColor: tokens.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: tokens.colors.text.secondary,
  },
  categoryChipTextSelected: {
    color: '#FFFFFF',
  },

  // Section
  section: {
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: tokens.colors.text.primary,
    letterSpacing: -0.5,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: tokens.colors.primaryLight,
    borderRadius: 20,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '700',
    color: tokens.colors.primary,
  },

  // Reminders Section - Clean Professional Design
  reminderSectionTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  remindersScroll: {
    paddingHorizontal: 20,
    gap: 12,
  },
  reminderCard: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  reminderGradient: {
    padding: 16,
  },
  reminderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  reminderIconBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reminderTimeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  reminderLiveIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
  reminderTimeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  reminderTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 10,
    lineHeight: 22,
  },
  reminderMeta: {
    gap: 8,
    marginBottom: 14,
  },
  reminderMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  reminderMetaText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    flex: 1,
    fontWeight: '500',
  },
  reminderBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  reminderBellIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  reminderBellText: {
    fontSize: 11,
    fontWeight: '600',
  },
  reminderViewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  reminderViewText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // Featured Events
  featuredScroll: {
    paddingHorizontal: 20,
    gap: 16,
  },
  featuredCard: {
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 6,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
    height: 380,
  },
  featuredImage: {
    width: '100%',
    height: 160,
  },
  featuredGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 160,
  },
  priceBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  priceBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: tokens.colors.primary,
  },
  pointsBadge: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    backgroundColor: 'rgba(245, 158, 11, 0.95)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  pointsBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  favoriteButton: {
    position: 'absolute',
    top: 12,
    left: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  featuredContent: {
    padding: 14,
    flex: 1,
    justifyContent: 'space-between',
  },
  featuredTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: tokens.colors.text.primary,
    marginBottom: 8,
    letterSpacing: -0.2,
    lineHeight: 22,
  },
  featuredMeta: {
    gap: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaText: {
    fontSize: 13,
    color: tokens.colors.text.secondary,
    fontWeight: '500',
  },
  attendeesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: tokens.colors.border.light,
  },
  attendeesPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: tokens.colors.primaryLight,
    borderRadius: 999,
  },
  attendeesText: {
    fontSize: 13,
    color: tokens.colors.primary,
    fontWeight: '600',
  },

  // Upcoming Events
  upcomingList: {
    paddingHorizontal: 20,
    gap: 12,
  },
  upcomingCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 5,
    borderWidth: 1,
    borderColor: tokens.colors.border.light,
  },
  upcomingImage: {
    width: 90,
    height: 90,
    borderRadius: 16,
  },
  upcomingContent: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  upcomingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: tokens.colors.text.primary,
    marginBottom: 6,
  },
  upcomingMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  upcomingDate: {
    fontSize: 13,
    color: tokens.colors.text.secondary,
    fontWeight: '500',
  },
  upcomingLocation: {
    fontSize: 13,
    color: tokens.colors.text.tertiary,
    flex: 1,
  },
  upcomingPrice: {
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingLeft: 8,
  },
  upcomingPriceText: {
    fontSize: 15,
    fontWeight: '700',
    color: tokens.colors.primary,
  },
  upcomingPointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 6,
  },
  upcomingPointsText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#F59E0B',
  },

  // Quick Stats Section
  quickStatsSection: {
    paddingTop: 8,
    paddingBottom: 8,
    paddingHorizontal: 20,
  },
  quickStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 12,
  },
  quickStatCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: tokens.colors.border.light,
  },
  quickStatIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  quickStatValue: {
    fontSize: 24,
    fontWeight: '800',
    color: tokens.colors.text.primary,
    letterSpacing: -0.4,
  },
  quickStatLabel: {
    fontSize: 13,
    color: tokens.colors.text.tertiary,
    marginTop: 4,
    textAlign: 'center',
    fontWeight: '500',
  },
});
