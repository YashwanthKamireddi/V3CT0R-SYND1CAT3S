/**
 * Home Screen - CampusPulse Design System
 * Production-ready home screen with unified typography and layout
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

const CARD_WIDTH = layout.screenWidth - tokens.spacing[10];
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

// User Data - Yashwanth Kamireddi
const USER = {
  name: 'Yashwanth',
  avatar: 'https://i.pravatar.cc/150?img=12',
  location: 'GITAM University',
  regNo: '2023002748',
};

// Quick Stats - What Matters for University Students
const QUICK_STATS = [
  { id: '1', label: 'Events Attended', value: '18', icon: 'calendar' as const, color: '#6366F1' },
  { id: '2', label: 'This Month', value: '4', icon: 'activity' as const, color: '#EC4899' },
];

// Featured Campus Events
const FEATURED_EVENTS: Event[] = [
  {
    id: '1',
    title: 'CodeVerse Hackathon 2025',
    date: 'Dec 22-23',
    time: '9:00 AM',
    location: 'Main Auditorium',
    image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&q=80',
    price: 'Free',
    category: 'hackathon',
    attendees: 234,
    isFavorite: true,
  },
  {
    id: '2',
    title: 'Annual Cultural Fest - Rhythm',
    date: 'Dec 26-28',
    time: '5:00 PM',
    location: 'Open Air Theatre',
    image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80',
    price: 'Free',
    category: 'cultural',
    attendees: 1200,
    isFavorite: false,
  },
  {
    id: '3',
    title: 'AI/ML Workshop Series',
    date: 'Sat, Dec 21',
    time: '10:00 AM',
    location: 'Computer Lab 301',
    image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&q=80',
    price: 'Free',
    category: 'workshop',
    attendees: 89,
    isFavorite: false,
  },
];

// Upcoming Campus Events
const UPCOMING_EVENTS: Event[] = [
  {
    id: '4',
    title: 'Guest Lecture: Future of FinTech',
    date: 'Mon, Dec 23',
    time: '2:00 PM',
    location: 'Seminar Hall A',
    image: 'https://images.unsplash.com/photo-1560439514-4e9645039924?w=800&q=80',
    price: 'Free',
    category: 'seminar',
    attendees: 156,
  },
  {
    id: '5',
    title: 'Inter-College Basketball Tournament',
    date: 'Dec 27',
    time: '9:00 AM',
    location: 'Sports Complex',
    image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&q=80',
    price: 'Free',
    category: 'sports',
    attendees: 320,
  },
  {
    id: '6',
    title: 'Photography Club Exhibition',
    date: 'Dec 28',
    time: '11:00 AM',
    location: 'Art Gallery',
    image: 'https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=800&q=80',
    price: 'Free',
    category: 'club',
    attendees: 78,
  },
  {
    id: '7',
    title: 'Entrepreneurship Summit',
    date: 'Jan 05',
    time: '9:30 AM',
    location: 'Conference Hall',
    image: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&q=80',
    price: 'Free',
    category: 'seminar',
    attendees: 245,
  },
];

// Active Reminders - events user has set reminders for
const ACTIVE_REMINDERS: Reminder[] = [
  {
    id: 'r1',
    eventId: '3',
    eventTitle: 'AI/ML Workshop Series',
    eventDate: 'Tomorrow',
    eventTime: '10:00 AM',
    location: 'Computer Lab 301',
    timeUntil: 'in 18 hours',
    color: '#FF6B35',
    icon: 'cpu',
  },
  {
    id: 'r2',
    eventId: '1',
    eventTitle: 'CodeVerse Hackathon 2025',
    eventDate: 'Dec 22',
    eventTime: '9:00 AM',
    location: 'Main Auditorium',
    timeUntil: 'in 2 days',
    color: '#7C3AED',
    icon: 'code',
  },
];

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
            <View style={styles.avatarStack}>
              {[1, 2, 3].map((i) => (
                <Image
                  key={i}
                  source={{ uri: `https://i.pravatar.cc/100?img=${i + 10}` }}
                  style={[styles.stackedAvatar, { marginLeft: i > 1 ? -8 : 0 }]}
                />
              ))}
            </View>
            <Text style={styles.attendeesText}>
              +{event.attendees} going
            </Text>
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

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}
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
                  <Image
                    source={{ uri: USER.avatar }}
                    style={styles.avatar}
                  />
                  <View style={styles.onlineBadge} />
                </View>

                <View style={styles.greetingContainer}>
                  <Text style={styles.greetingText}>
                    {getGreeting()}
                  </Text>
                  <Text style={styles.userName}>
                    {USER.name}
                  </Text>
                </View>
              </Pressable>
            </View>

            {/* Location */}
            <Pressable style={styles.locationRow}>
              <Feather name="map-pin" size={14} color={tokens.colors.primary} />
              <Text style={styles.locationText}>{USER.location}</Text>
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
              {QUICK_STATS.map((stat, index) => (
                <Pressable
                  key={stat.id}
                  style={styles.quickStatCard}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    if (stat.label === 'Events Attended') {
                      router.push('/(tabs)/tickets');
                    } else {
                      router.push('/(tabs)/profile');
                    }
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
          {ACTIVE_REMINDERS.length > 0 && (
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
                {ACTIVE_REMINDERS.map((reminder, index) => (
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

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.featuredScroll}
              snapToInterval={CARD_WIDTH + 16}
              decelerationRate="fast"
            >
              {FEATURED_EVENTS.map((event, index) => (
                <FeaturedEventCard key={event.id} event={event} index={index} />
              ))}
            </ScrollView>
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

            <View style={styles.upcomingList}>
              {UPCOMING_EVENTS.map((event, index) => (
                <UpcomingEventCard key={event.id} event={event} index={index} />
              ))}
            </View>
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
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: tokens.colors.text.primary,
    letterSpacing: -0.5,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '500',
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
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    overflow: 'hidden',
  },
  featuredImage: {
    width: '100%',
    height: 200,
  },
  featuredGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 200,
  },
  priceBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  priceBadgeText: {
    fontSize: 14,
    fontWeight: '700',
    color: tokens.colors.primary,
  },
  favoriteButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
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
    padding: 16,
  },
  featuredTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: tokens.colors.text.primary,
    marginBottom: 8,
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
    fontSize: 14,
    color: tokens.colors.text.secondary,
  },
  attendeesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
  },
  avatarStack: {
    flexDirection: 'row',
  },
  stackedAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  attendeesText: {
    fontSize: 13,
    color: tokens.colors.text.secondary,
    fontWeight: '500',
  },

  // Upcoming Events
  upcomingList: {
    paddingHorizontal: 20,
    gap: 12,
  },
  upcomingCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  upcomingImage: {
    width: 85,
    height: 85,
    borderRadius: 14,
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
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  quickStatIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  quickStatValue: {
    fontSize: 22,
    fontWeight: '700',
    color: tokens.colors.text.primary,
    letterSpacing: -0.3,
  },
  quickStatLabel: {
    fontSize: 12,
    color: tokens.colors.text.tertiary,
    marginTop: 2,
    textAlign: 'center',
  },
});
