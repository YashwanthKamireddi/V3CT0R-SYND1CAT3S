/**
 * Notifications & Reminders Screen - CampusPulse
 * Beautiful notification center with event reminders and push notifications
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  SlideInRight,
  Layout,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

import { tokens } from '@/lib/styles/unified';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Types
interface Notification {
  id: string;
  title: string;
  message: string;
  icon: keyof typeof Feather.glyphMap;
  color: string;
  time: string;
  timestamp: Date;
  unread: boolean;
  type: 'reminder' | 'event' | 'badge' | 'alert' | 'social';
  eventId?: string;
  actionLabel?: string;
}

interface Reminder {
  id: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  location: string;
  timeUntil: string;
  color: string;
  icon: keyof typeof Feather.glyphMap;
  notifyBefore: '24h' | '2h' | '30m';
}

// Mock Notifications
const NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    title: 'Event Starting Soon!',
    message: 'AI Workshop starts in 30 minutes. Don\'t forget to check in!',
    icon: 'clock',
    color: '#F59E0B',
    time: '30m ago',
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    unread: true,
    type: 'reminder',
    eventId: '3',
    actionLabel: 'View Event',
  },
  {
    id: '2',
    title: 'Registration Confirmed',
    message: 'You\'re registered for CodeVerse Hackathon 2025. See you there!',
    icon: 'check-circle',
    color: '#10B981',
    time: '2h ago',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    unread: true,
    type: 'event',
    eventId: '1',
  },
  {
    id: '3',
    title: 'Certificate Ready! 🎉',
    message: 'Your certificate for Music Fest is ready to download.',
    icon: 'award',
    color: '#F59E0B',
    time: '1d ago',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
    unread: false,
    type: 'badge',
  },
  {
    id: '4',
    title: 'New Badge Unlocked!',
    message: 'You earned the "Event Explorer" badge for attending 5 events.',
    icon: 'award',
    color: '#7C3AED',
    time: '2d ago',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    unread: false,
    type: 'badge',
  },
  {
    id: '5',
    title: 'New Event Alert',
    message: 'GDSC just posted "Cloud Study Jam". Matches your interests!',
    icon: 'bell',
    color: '#3B82F6',
    time: '3d ago',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    unread: false,
    type: 'alert',
    eventId: '8',
    actionLabel: 'Check it out',
  },
  {
    id: '6',
    title: 'Someone\'s Going Too!',
    message: 'Your friend Arjun also registered for CodeVerse Hackathon.',
    icon: 'users',
    color: '#EC4899',
    time: '3d ago',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    unread: false,
    type: 'social',
    eventId: '1',
  },
];

// Mock Upcoming Reminders
const UPCOMING_REMINDERS: Reminder[] = [
  {
    id: 'r1',
    eventTitle: 'AI/ML Workshop Series',
    eventDate: 'Tomorrow',
    eventTime: '10:00 AM',
    location: 'Computer Lab 301',
    timeUntil: 'in 18 hours',
    color: '#FF6B35',
    icon: 'cpu',
    notifyBefore: '2h',
  },
  {
    id: 'r2',
    eventTitle: 'CodeVerse Hackathon 2025',
    eventDate: 'Dec 22',
    eventTime: '9:00 AM',
    location: 'Main Auditorium',
    timeUntil: 'in 2 days',
    color: '#7C3AED',
    icon: 'code',
    notifyBefore: '24h',
  },
];

// Notification Item Component with Animated Unread Dot
function NotificationItem({
  notification,
  index,
  onPress,
}: {
  notification: Notification;
  index: number;
  onPress: () => void;
}) {
  // Pulse animation for unread indicator
  const pulseAnim = useSharedValue(0);
  const glowAnim = useSharedValue(1);

  useEffect(() => {
    if (notification.unread) {
      pulseAnim.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 1000 }),
          withTiming(0, { duration: 1000 })
        ),
        -1,
        false
      );
      glowAnim.value = withRepeat(
        withSequence(
          withTiming(1.4, { duration: 800 }),
          withTiming(1, { duration: 800 })
        ),
        -1,
        false
      );
    }
  }, [notification.unread]);

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: interpolate(pulseAnim.value, [0, 0.5, 1], [0.4, 0.8, 0.4]),
    transform: [{ scale: glowAnim.value }],
  }));

  const dotStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(pulseAnim.value, [0, 1], [1, 1.1]) }],
  }));

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 50).springify()}
      layout={Layout.springify()}
    >
      <Pressable
        onPress={handlePress}
        style={({ pressed }) => [
          styles.notificationItem,
          notification.unread && styles.notificationItemUnread,
          pressed && styles.notificationItemPressed,
        ]}
      >
        {/* Icon */}
        <View style={[styles.notificationIcon, { backgroundColor: notification.color + '15' }]}>
          <Feather name={notification.icon} size={20} color={notification.color} />
        </View>

        {/* Content */}
        <View style={styles.notificationContent}>
          <View style={styles.notificationHeader}>
            <Text
              style={[
                styles.notificationTitle,
                notification.unread && styles.notificationTitleUnread,
              ]}
              numberOfLines={1}
            >
              {notification.title}
            </Text>
            <Text style={styles.notificationTime}>{notification.time}</Text>
          </View>
          <Text style={styles.notificationMessage} numberOfLines={2}>
            {notification.message}
          </Text>
          {notification.actionLabel && (
            <View style={styles.notificationAction}>
              <Text style={styles.notificationActionText}>{notification.actionLabel}</Text>
              <Feather name="chevron-right" size={14} color={tokens.colors.primary} />
            </View>
          )}
        </View>

        {/* Premium Unread Indicator with Glow */}
        {notification.unread && (
          <View style={styles.unreadContainer}>
            {/* Outer glow ring */}
            <Animated.View style={[styles.unreadGlow, pulseStyle]} />
            {/* Inner dot */}
            <Animated.View style={[styles.unreadDot, dotStyle]} />
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

// Premium Reminder Card Component
function ReminderCard({
  reminder,
  index,
  onPress,
}: {
  reminder: Reminder;
  index: number;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);
  const shimmerPosition = useSharedValue(0);

  useEffect(() => {
    shimmerPosition.value = withRepeat(
      withTiming(1, { duration: 3000 }),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: interpolate(shimmerPosition.value, [0, 1], [-200, 300]) }],
    opacity: interpolate(shimmerPosition.value, [0, 0.5, 1], [0, 0.3, 0]),
  }));

  const handlePressIn = () => {
    scale.value = withTiming(0.96, { duration: 100 });
  };

  const handlePressOut = () => {
    scale.value = withTiming(1, { duration: 150 });
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <Animated.View
      entering={SlideInRight.delay(index * 80).duration(400)}
    >
      <Animated.View style={animatedStyle}>
        <Pressable
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={handlePress}
          style={styles.reminderCard}
        >
        <LinearGradient
          colors={[reminder.color, reminder.color + 'E6', reminder.color + 'B3']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.reminderGradient}
        >
          {/* Shimmer Effect */}
          <Animated.View style={[styles.reminderShimmer, shimmerStyle]}>
            <LinearGradient
              colors={['transparent', 'rgba(255,255,255,0.15)', 'transparent']}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={StyleSheet.absoluteFill}
            />
          </Animated.View>

          {/* Glass overlay */}
          <View style={styles.reminderGlassOverlay} />

          {/* Header Row */}
          <View style={styles.reminderHeader}>
            <View style={styles.reminderIconContainer}>
              <LinearGradient
                colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.1)']}
                style={styles.reminderIconGradient}
              >
                <Feather name={reminder.icon} size={18} color="#FFFFFF" />
              </LinearGradient>
            </View>
            <View style={styles.reminderTimeBadge}>
              <View style={styles.reminderTimeDot} />
              <Feather name="clock" size={11} color="#FFFFFF" />
              <Text style={styles.reminderTimeText}>{reminder.timeUntil}</Text>
            </View>
          </View>

          {/* Event Title */}
          <Text style={styles.reminderTitle} numberOfLines={2}>
            {reminder.eventTitle}
          </Text>

          {/* Meta Info with better layout */}
          <View style={styles.reminderMeta}>
            <View style={styles.reminderMetaRow}>
              <View style={styles.reminderMetaIconBg}>
                <Feather name="calendar" size={10} color="#FFFFFF" />
              </View>
              <Text style={styles.reminderMetaText}>
                {reminder.eventDate} • {reminder.eventTime}
              </Text>
            </View>
            <View style={styles.reminderMetaRow}>
              <View style={styles.reminderMetaIconBg}>
                <Feather name="map-pin" size={10} color="#FFFFFF" />
              </View>
              <Text style={styles.reminderMetaText} numberOfLines={1}>
                {reminder.location}
              </Text>
            </View>
          </View>

          {/* Bottom Row */}
          <View style={styles.reminderBottom}>
            <View style={styles.reminderBellBadge}>
              <Feather name="bell" size={10} color={reminder.color} />
              <Text style={[styles.reminderBellText, { color: reminder.color }]}>
                {reminder.notifyBefore} before
              </Text>
            </View>
            <View style={styles.reminderViewButton}>
              <Text style={styles.reminderViewText}>View</Text>
              <Feather name="chevron-right" size={12} color="#FFFFFF" />
            </View>
          </View>
        </LinearGradient>
      </Pressable>
      </Animated.View>
    </Animated.View>
  );
}

// Filter Tab Component
function FilterTab({
  label,
  active,
  count,
  onPress,
}: {
  label: string;
  active: boolean;
  count?: number;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.filterTab, active && styles.filterTabActive]}
    >
      <Text style={[styles.filterTabText, active && styles.filterTabTextActive]}>
        {label}
      </Text>
      {count !== undefined && count > 0 && (
        <View style={[styles.filterTabBadge, active && styles.filterTabBadgeActive]}>
          <Text style={[styles.filterTabBadgeText, active && styles.filterTabBadgeTextActive]}>
            {count}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

// Main Component
export default function NotificationsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | 'reminders'>('all');
  const [notifications, setNotifications] = useState(NOTIFICATIONS);
  const isNavigatingRef = useRef(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  }, []);

  const unreadCount = notifications.filter((n) => n.unread).length;
  const reminderCount = notifications.filter((n) => n.type === 'reminder').length;

  const filteredNotifications = notifications.filter((n) => {
    if (activeFilter === 'unread') return n.unread;
    if (activeFilter === 'reminders') return n.type === 'reminder';
    return true;
  });

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const handleNotificationPress = (notification: Notification) => {
    // Prevent multiple navigations
    if (isNavigatingRef.current) return;

    // Mark as read
    setNotifications((prev) =>
      prev.map((n) => (n.id === notification.id ? { ...n, unread: false } : n))
    );

    // Navigate if there's an associated event
    if (notification.eventId) {
      isNavigatingRef.current = true;
      router.push(`/event/${notification.eventId}`);

      // Reset the flag after navigation completes
      setTimeout(() => {
        isNavigatingRef.current = false;
      }, 1000);
    }
  };

  const handleReminderPress = (reminder: Reminder) => {
    // Prevent multiple navigations
    if (isNavigatingRef.current) return;
    isNavigatingRef.current = true;

    // Navigate to corresponding event
    router.push(`/event/3`);

    setTimeout(() => {
      isNavigatingRef.current = false;
    }, 1000);
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <Animated.View
        entering={FadeIn.duration(300)}
        style={[styles.header, { paddingTop: insets.top + 8 }]}
      >
        <View style={styles.headerTop}>
          <Pressable
            onPress={handleBack}
            style={styles.backButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Feather name="arrow-left" size={24} color={tokens.colors.text.primary} />
          </Pressable>
          <Text style={styles.headerTitle}>Notifications</Text>
          <Pressable onPress={handleMarkAllRead} style={styles.markReadButton}>
            <Feather name="check-circle" size={18} color={tokens.colors.primary} />
            <Text style={styles.markReadText}>Mark all read</Text>
          </Pressable>
        </View>

        {/* Filter Tabs */}
        <View style={styles.filterTabs}>
          <FilterTab
            label="All"
            active={activeFilter === 'all'}
            onPress={() => setActiveFilter('all')}
          />
          <FilterTab
            label="Unread"
            active={activeFilter === 'unread'}
            count={unreadCount}
            onPress={() => setActiveFilter('unread')}
          />
          <FilterTab
            label="Reminders"
            active={activeFilter === 'reminders'}
            count={reminderCount}
            onPress={() => setActiveFilter('reminders')}
          />
        </View>
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 20 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={tokens.colors.primary}
            colors={[tokens.colors.primary]}
          />
        }
      >
        {/* Upcoming Reminders Section */}
        {activeFilter !== 'unread' && UPCOMING_REMINDERS.length > 0 && (
          <Animated.View entering={FadeInUp.delay(100).springify()}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <Feather name="bell" size={18} color={tokens.colors.primary} />
                <Text style={styles.sectionTitle}>Upcoming Reminders</Text>
              </View>
              <Pressable style={styles.settingsButton}>
                <Feather name="settings" size={18} color={tokens.colors.text.tertiary} />
              </Pressable>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.remindersScroll}
            >
              {UPCOMING_REMINDERS.map((reminder, index) => (
                <ReminderCard
                  key={reminder.id}
                  reminder={reminder}
                  index={index}
                  onPress={() => handleReminderPress(reminder)}
                />
              ))}
            </ScrollView>
          </Animated.View>
        )}

        {/* Notifications Section */}
        <Animated.View entering={FadeInUp.delay(200).springify()}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Feather name="inbox" size={18} color={tokens.colors.text.secondary} />
              <Text style={styles.sectionTitle}>
                {activeFilter === 'all'
                  ? 'All Notifications'
                  : activeFilter === 'unread'
                  ? 'Unread'
                  : 'Event Reminders'}
              </Text>
            </View>
            {filteredNotifications.length > 0 && (
              <Text style={styles.notificationCount}>
                {filteredNotifications.length} notification{filteredNotifications.length !== 1 ? 's' : ''}
              </Text>
            )}
          </View>

          {filteredNotifications.length > 0 ? (
            <View style={styles.notificationsList}>
              {filteredNotifications.map((notification, index) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  index={index}
                  onPress={() => handleNotificationPress(notification)}
                />
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <Feather name="bell-off" size={48} color={tokens.colors.text.tertiary} />
              </View>
              <Text style={styles.emptyTitle}>No notifications yet</Text>
              <Text style={styles.emptySubtitle}>
                {activeFilter === 'unread'
                  ? "You're all caught up! 🎉"
                  : activeFilter === 'reminders'
                  ? 'Set reminders for your events'
                  : 'Check back later for updates'}
              </Text>
            </View>
          )}
        </Animated.View>

        {/* Footer */}
        {filteredNotifications.length > 0 && (
          <Animated.View entering={FadeIn.delay(500)} style={styles.footer}>
            <Text style={styles.footerText}>You're all caught up! 🎉</Text>
          </Animated.View>
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

  // Header
  header: {
    backgroundColor: tokens.colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.border.light,
    paddingBottom: 12,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: tokens.colors.background.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    color: tokens.colors.text.primary,
    marginLeft: 12,
  },
  markReadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: tokens.colors.primaryLight,
    borderRadius: 20,
  },
  markReadText: {
    fontSize: 13,
    fontWeight: '600',
    color: tokens.colors.primary,
  },

  // Filter Tabs
  filterTabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: tokens.colors.background.secondary,
  },
  filterTabActive: {
    backgroundColor: tokens.colors.primary,
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '500',
    color: tokens.colors.text.secondary,
  },
  filterTabTextActive: {
    color: '#FFFFFF',
  },
  filterTabBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: tokens.colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  filterTabBadgeActive: {
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  filterTabBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: tokens.colors.primary,
  },
  filterTabBadgeTextActive: {
    color: '#FFFFFF',
  },

  // Scroll
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 20,
  },

  // Section
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: tokens.colors.text.primary,
  },
  settingsButton: {
    padding: 8,
  },
  notificationCount: {
    fontSize: 13,
    color: tokens.colors.text.tertiary,
  },

  // Reminders - Premium Design
  remindersScroll: {
    paddingHorizontal: 20,
    gap: 14,
    paddingBottom: 24,
  },
  reminderCard: {
    width: SCREEN_WIDTH * 0.75,
    maxWidth: 300,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  reminderGradient: {
    padding: 20,
    position: 'relative',
    overflow: 'hidden',
  },
  reminderShimmer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 200,
    left: 0,
  },
  reminderGlassOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 24,
  },
  reminderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    zIndex: 1,
  },
  reminderIconContainer: {
    width: 42,
    height: 42,
    borderRadius: 14,
    overflow: 'hidden',
  },
  reminderIconGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reminderTimeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  reminderTimeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4ADE80',
    shadowColor: '#4ADE80',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  reminderTimeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  reminderTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 14,
    letterSpacing: -0.3,
    lineHeight: 24,
    zIndex: 1,
  },
  reminderMeta: {
    gap: 8,
    marginBottom: 16,
    zIndex: 1,
  },
  reminderMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  reminderMetaIconBg: {
    width: 22,
    height: 22,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reminderMetaText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    flex: 1,
    fontWeight: '500',
  },
  reminderBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 1,
  },
  reminderBellBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  reminderBellText: {
    fontSize: 11,
    fontWeight: '700',
  },
  reminderViewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
  },
  reminderViewText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // Notifications
  notificationsList: {
    paddingHorizontal: 20,
    gap: 1,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: tokens.colors.background.primary,
    padding: 16,
    borderRadius: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: tokens.colors.border.light,
  },
  notificationItemUnread: {
    backgroundColor: tokens.colors.primaryLight + '30',
    borderColor: tokens.colors.primary + '20',
  },
  notificationItemPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.99 }],
  },
  notificationIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: tokens.colors.text.primary,
    flex: 1,
    marginRight: 8,
  },
  notificationTitleUnread: {
    fontWeight: '700',
  },
  notificationTime: {
    fontSize: 12,
    color: tokens.colors.text.tertiary,
  },
  notificationMessage: {
    fontSize: 14,
    color: tokens.colors.text.secondary,
    lineHeight: 20,
  },
  notificationAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 10,
  },
  notificationActionText: {
    fontSize: 13,
    fontWeight: '600',
    color: tokens.colors.primary,
  },
  // Premium Unread Indicator Styles
  unreadContainer: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadGlow: {
    position: 'absolute',
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: tokens.colors.primary + '40',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: tokens.colors.primary,
    shadowColor: tokens.colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
    elevation: 3,
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: tokens.colors.background.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: tokens.colors.text.primary,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: tokens.colors.text.tertiary,
    textAlign: 'center',
  },

  // Footer
  footer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  footerText: {
    fontSize: 14,
    color: tokens.colors.text.tertiary,
  },
});
