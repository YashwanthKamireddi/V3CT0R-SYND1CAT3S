/**
 * Event Details Screen - CampusPulse Design System
 * Production-ready with unified typography and responsive layout
 * Connected to real Supabase backend
 */

import React, { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Image,
  StyleSheet,
  StatusBar,
  Platform,
  Share,
  Alert,
  Modal,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Animated, {
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  interpolate,
  useAnimatedScrollHandler,
  Extrapolate,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';

import { tokens, typography, layout } from '@/lib/styles/unified';
import { useEvent, useRegistration } from '@/lib/hooks';
import { useAuth } from '@/lib/context/AuthContext';
import { Avatar } from '@/components/ui/Avatar';
import { supabase } from '@/lib/supabase/client';

const HEADER_HEIGHT = 320;

// (removed: EVENTS_DATA + SAMPLE_ATTENDEES mock data — now using Supabase)


// Fallback mock data for when event is not found in database
const MOCK_EVENTS_DATA: Record<string, any> = {};

export default function EventDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [isFavorite, setIsFavorite] = useState(false);
  const [showAttendees, setShowAttendees] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [attendees, setAttendees] = useState<Array<{
    id: string;
    name: string;
    avatar: string | null;
    department: string;
    isYou: boolean;
  }>>([]);

  // Real data from Supabase
  const { user, isAuthenticated } = useAuth();
  const { event: supabaseEvent, isLoading, error } = useEvent(id as string);
  const {
    isRegistered,
    isRegistering,
    register,
    cancel: cancelRegistration,
    isCancelling,
    refresh: checkRegistration
  } = useRegistration(id as string);

  // Fetch attendees for this event from Supabase
  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from('registrations')
        .select('user_id, profiles:user_id (id, full_name, avatar_url, branch)')
        .eq('event_id', id as string)
        .eq('status', 'confirmed')
        .limit(50);
      if (cancelled) return;
      const list = (data ?? [])
        .map((r: any) => r.profiles)
        .filter(Boolean)
        .map((p: any) => ({
          id: p.id,
          name: p.full_name ?? 'Anonymous',
          avatar: p.avatar_url,
          department: p.branch ?? '',
          isYou: p.id === user?.id,
        }));
      setAttendees(list);
    })();
    return () => { cancelled = true; };
  }, [id, user?.id]);

  // Animation values
  const scrollY = useSharedValue(0);
  const likeScale = useSharedValue(1);
  const shareScale = useSharedValue(1);
  const isNavigatingRef = useRef(false);

  // Format event data for display (convert from Supabase format)
  const event = useMemo(() => {
    if (supabaseEvent) {
      const eventDate = new Date(supabaseEvent.start_time ?? supabaseEvent.date);
      const endDate = supabaseEvent.end_time ? new Date(supabaseEvent.end_time) : null;

      return {
        id: supabaseEvent.id,
        title: supabaseEvent.title,
        description: supabaseEvent.description || '',
        date: endDate && eventDate.toDateString() !== endDate.toDateString()
          ? `${eventDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}-${endDate.toLocaleDateString('en-US', { day: 'numeric', year: 'numeric' })}`
          : eventDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }),
        time: eventDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
        location: supabaseEvent.venue || 'TBD',
        address: supabaseEvent.venue_address || supabaseEvent.venue || '',
        image: supabaseEvent.image_url || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=1200&q=80',
        price: 'Free', // Events are free in our schema
        category: supabaseEvent.category || 'Event',
        attendees: supabaseEvent.current_registrations || 0,
        maxCapacity: supabaseEvent.capacity || 100,
        organizer: {
          name: supabaseEvent.clubs?.name || 'Campus Club',
          avatar: supabaseEvent.clubs?.logo_url || 'https://i.pravatar.cc/100?img=55',
          followers: supabaseEvent.clubs?.member_count ? `${(supabaseEvent.clubs.member_count / 1000).toFixed(1)}K` : '1K',
          verified: true,
        },
        points: supabaseEvent.points_reward || 0,
        rawDate: eventDate,
      };
    }

    // No mock fallback — event must come from Supabase. Render placeholder if not yet loaded.
    return {
      id: '0',
      title: 'Event Details',
      description: 'Event information will be displayed here when available.',
      date: 'Coming Soon',
      time: 'Time TBD',
      location: 'Location TBD',
      address: 'Address will be updated',
      image: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=1200&q=80',
      price: 'TBD',
      category: 'General',
      attendees: 0,
      maxCapacity: 100,
      organizer: {
        name: 'Event Organizer',
        avatar: 'https://i.pravatar.cc/100?img=55',
        followers: '1K',
        verified: false,
      },
      points: 0,
    };
  }, [supabaseEvent, id]);

  // Check if event is in the past
  const isPastEvent = useCallback(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (event.rawDate) {
      return event.rawDate < today;
    }

    // Fallback: Extract date from event.date string
    const dateStr = event.date;
    const match = dateStr.match(/(\w+)\s+(\d+)(?:[-,]\s*\d+)?,?\s*(\d{4})/);
    if (match) {
      const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      const monthIndex = monthNames.indexOf(match[1]);
      const day = parseInt(match[2]);
      const year = parseInt(match[3]);
      const eventDate = new Date(year, monthIndex, day);
      return eventDate < today;
    }
    return false;
  }, [event]);

  // Handle like with animation and haptics
  const handleLike = useCallback(async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}

    likeScale.value = withSequence(
      withTiming(1.25, { duration: 120, easing: Easing.out(Easing.back(2)) }),
      withTiming(1, { duration: 150, easing: Easing.out(Easing.cubic) })
    );
    setIsFavorite(!isFavorite);
  }, [isFavorite]);

  // Handle share with native share
  const handleShare = useCallback(async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}

    shareScale.value = withSequence(
      withTiming(0.9, { duration: 80 }),
      withTiming(1, { duration: 120 })
    );

    try {
      const result = await Share.share({
        title: event.title,
        message: `🎉 Check out this event!\n\n${event.title}\n📅 ${event.date}\n📍 ${event.location}\n\nJoin me at CampusPulse!`,
        url: `campuspulse://event/${id}`,
      });

      if (result.action === Share.sharedAction) {
        // Shared successfully
      }
    } catch (error) {
      console.log('Share error:', error);
    }
  }, [event, id]);

  // Handle registration
  const handleRegister = useCallback(async () => {
    if (isNavigatingRef.current) return;

    // Check if user is authenticated
    if (!isAuthenticated) {
      Alert.alert(
        'Sign In Required',
        'Please sign in to register for this event.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Sign In', onPress: () => router.push('/auth/login') }
        ]
      );
      return;
    }

    isNavigatingRef.current = true;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});

    try {
      const result = await register();

      if (result.success) {
        Alert.alert(
          '🎉 Registration Successful!',
          `You're registered for ${event.title}. You'll earn ${event.points} points for attending!`,
          [{ text: 'View Ticket', onPress: () => router.push('/(tabs)/tickets') }]
        );
      } else {
        Alert.alert(
          'Registration Failed',
          result.error || 'Unable to register for this event. Please try again.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert(
        'Error',
        'Something went wrong. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setTimeout(() => {
        isNavigatingRef.current = false;
      }, 500);
    }
  }, [isAuthenticated, register, event, router]);

  // Handle cancellation
  const handleCancelRegistration = useCallback(async () => {
    Alert.alert(
      'Cancel Registration',
      'Are you sure you want to cancel your registration for this event?',
      [
        { text: 'Keep Registration', style: 'cancel' },
        {
          text: 'Cancel Registration',
          style: 'destructive',
          onPress: async () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
            const result = await cancelRegistration();

            if (result.success) {
              Alert.alert('Registration Cancelled', 'Your registration has been cancelled.');
            } else {
              Alert.alert('Error', result.error || 'Failed to cancel registration.');
            }
          }
        }
      ]
    );
  }, [cancelRegistration]);

  // Animated styles
  const likeAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: likeScale.value }],
  }));

  const shareAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: shareScale.value }],
  }));

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (e) => {
      scrollY.value = e.contentOffset.y;
    },
  });

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    // Only solidify the colored header once the hero has scrolled out, so it
    // doesn't paint over date/time content that lives just below the hero.
    opacity: interpolate(
      scrollY.value,
      [HEADER_HEIGHT - 80, HEADER_HEIGHT],
      [0, 1],
      Extrapolate.CLAMP,
    ),
  }));

  const imageAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: interpolate(
          scrollY.value,
          [-100, 0],
          [1.5, 1],
          Extrapolate.CLAMP
        ),
      },
      {
        translateY: interpolate(
          scrollY.value,
          [0, HEADER_HEIGHT],
          [0, -HEADER_HEIGHT / 2],
          Extrapolate.CLAMP
        ),
      },
    ],
  }));

  const capacityPercent = (event.attendees / event.maxCapacity) * 100;

  // Loading state
  if (isLoading) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <StatusBar barStyle="light-content" />
        <View style={[styles.topBar, { top: insets.top + 8 }]}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Feather name="arrow-left" size={22} color="#FFFFFF" />
          </Pressable>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={tokens.colors.primary} />
          <Text style={styles.loadingText}>Loading event...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="light-content" />

      {/* Animated Header Background */}
      <Animated.View style={[styles.headerBackground, headerAnimatedStyle]}>
        <View style={[styles.headerContent, { paddingTop: insets.top }]}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {event.title}
          </Text>
        </View>
      </Animated.View>

      {/* Top Navigation Bar */}
      <View style={[styles.topBar, { top: insets.top + 8 }]}>
        <Pressable
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Feather name="arrow-left" size={22} color="#FFFFFF" />
        </Pressable>
        <View style={styles.topBarRight}>
          <Animated.View style={likeAnimatedStyle}>
            <Pressable
              style={[styles.iconButton, isFavorite && styles.iconButtonActive]}
              onPress={handleLike}
            >
              <Feather
                name={isFavorite ? 'heart' : 'heart'}
                size={20}
                color={isFavorite ? '#FFFFFF' : '#FFFFFF'}
              />
              {isFavorite && <View style={styles.iconButtonFill} />}
            </Pressable>
          </Animated.View>
          <Animated.View style={shareAnimatedStyle}>
            <Pressable style={styles.iconButton} onPress={handleShare}>
              <Feather name="share-2" size={20} color="#FFFFFF" />
            </Pressable>
          </Animated.View>
        </View>
      </View>

      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 140 }}
      >
        {/* Hero Image Section */}
        <Animated.View style={[styles.heroContainer, imageAnimatedStyle]}>
          <Image source={{ uri: event.image }} style={styles.heroImage} />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.7)']}
            style={styles.heroGradient}
          />
        </Animated.View>

        {/* Content Section */}
        <View style={styles.content}>
          {/* Category & Attendees Row */}
          <Animated.View
            entering={FadeInDown.delay(100).duration(400)}
            style={styles.categoryRow}
          >
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{event.category}</Text>
            </View>
            <View style={styles.attendeesBadge}>
              <Feather name="users" size={14} color={tokens.colors.primary} />
              <Text style={styles.attendeesText}>{event.attendees} going</Text>
            </View>
          </Animated.View>

          {/* Title */}
          <Animated.Text
            entering={FadeInDown.delay(150).duration(400)}
            style={styles.title}
          >
            {event.title}
          </Animated.Text>

          {/* Date & Time Card */}
          <Animated.View
            entering={FadeInDown.delay(200).duration(400)}
            style={styles.infoCard}
          >
            <View style={styles.infoIconContainer}>
              <Feather name="calendar" size={20} color={tokens.colors.primary} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Date & Time</Text>
              <Text style={styles.infoValue}>{event.date}</Text>
              <Text style={styles.infoSubvalue}>{event.time}</Text>
            </View>
          </Animated.View>

          {/* Location Card */}
          <Animated.View
            entering={FadeInDown.delay(250).duration(400)}
            style={styles.infoCard}
          >
            <View style={[styles.infoIconContainer, { backgroundColor: '#E3F2FD' }]}>
              <Feather name="map-pin" size={20} color="#2196F3" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Location</Text>
              <Text style={styles.infoValue}>{event.location}</Text>
              <Text style={styles.infoSubvalue}>{event.address}</Text>
            </View>
          </Animated.View>

          {/* Organizer Card */}
          <Animated.View
            entering={FadeInDown.delay(300).duration(400)}
            style={styles.organizerCard}
          >
            <Image
              source={{ uri: event.organizer.avatar }}
              style={styles.organizerAvatar}
            />
            <View style={styles.organizerInfo}>
              <View style={styles.organizerNameRow}>
                <Text style={styles.organizerName}>{event.organizer.name}</Text>
                {event.organizer.verified && (
                  <Feather name="check-circle" size={16} color={tokens.colors.primary} />
                )}
              </View>
              <Text style={styles.organizerFollowers}>
                {event.organizer.followers} Followers
              </Text>
            </View>
            <Pressable
              style={[styles.followButton, isFollowing && styles.followButtonActive]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setIsFollowing(!isFollowing);
              }}
            >
              <Text style={[styles.followButtonText, isFollowing && styles.followButtonTextActive]}>
                {isFollowing ? 'Following' : 'Follow'}
              </Text>
            </Pressable>
          </Animated.View>

          {/* About Section */}
          <Animated.View
            entering={FadeInDown.delay(350).duration(400)}
            style={styles.aboutSection}
          >
            <Text style={styles.sectionTitle}>About Event</Text>
            <Text style={styles.description}>{event.description}</Text>
          </Animated.View>

          {/* Attendees Section */}
          <Animated.View
            entering={FadeInDown.delay(400).duration(400)}
            style={styles.attendeesSection}
          >
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Attendees</Text>
              <Pressable onPress={() => setShowAttendees(true)}>
                <Text style={styles.seeAllText}>See All</Text>
              </Pressable>
            </View>
            <View style={styles.attendeesList}>
              <View style={styles.avatarStack}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <Image
                    key={i}
                    source={{ uri: `https://i.pravatar.cc/100?img=${i + 20}` }}
                    style={[
                      styles.attendeeAvatar,
                      { marginLeft: i > 1 ? -12 : 0 },
                    ]}
                  />
                ))}
              </View>
              <Text style={styles.attendeesCountText}>
                +{Math.max(0, event.attendees - 5)} others
              </Text>
            </View>
            <View style={styles.capacityBar}>
              <View
                style={[styles.capacityFill, { width: `${capacityPercent}%` }]}
              />
            </View>
            <Text style={styles.capacityText}>
              {event.attendees} / {event.maxCapacity} spots filled
            </Text>
          </Animated.View>
        </View>
      </Animated.ScrollView>

      {/* Bottom Registration Bar */}
      <Animated.View
        entering={FadeInUp.delay(500).duration(400)}
        style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 24) + 16 }]}
      >
        <View>
          <Text style={styles.priceLabel}>{isPastEvent() ? 'Event' : isRegistered ? 'Status' : 'Earn'}</Text>
          <View style={styles.priceRow}>
            {isPastEvent() ? (
              <Text style={styles.price}>Ended</Text>
            ) : isRegistered ? (
              <>
                <Feather name="check-circle" size={18} color="#10B981" style={{ marginRight: 4 }} />
                <Text style={[styles.price, { color: '#10B981' }]}>Registered</Text>
              </>
            ) : (
              <>
                <Feather name="award" size={18} color="#F59E0B" style={{ marginRight: 4 }} />
                <Text style={[styles.price, { color: '#F59E0B' }]}>+{event.points} pts</Text>
              </>
            )}
          </View>
        </View>
        {isPastEvent() ? (
          <View style={[styles.bookButton, styles.bookButtonDisabled]}>
            <Feather name="lock" size={20} color="#9CA3AF" />
            <Text style={styles.bookButtonTextDisabled}>Registration Closed</Text>
          </View>
        ) : isRegistered ? (
          <Pressable
            style={[styles.bookButton, styles.bookButtonCancel]}
            onPress={handleCancelRegistration}
            disabled={isCancelling}
          >
            {isCancelling ? (
              <ActivityIndicator size="small" color="#EF4444" />
            ) : (
              <>
                <Feather name="x-circle" size={20} color="#EF4444" />
                <Text style={[styles.bookButtonText, { color: '#EF4444' }]}>Cancel</Text>
              </>
            )}
          </Pressable>
        ) : (
          <Pressable
            style={styles.bookButton}
            onPress={handleRegister}
            disabled={isRegistering}
          >
            {isRegistering ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Text style={styles.bookButtonText}>Register Now</Text>
                <Feather name="arrow-right" size={20} color={tokens.colors.white} />
              </>
            )}
          </Pressable>
        )}
      </Animated.View>

      {/* Attendees Modal */}
      <Modal
        visible={showAttendees}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAttendees(false)}
      >
        <View style={styles.modalContainer}>
          {/* Modal Header */}
          <View style={[styles.modalHeader, { paddingTop: Platform.OS === 'ios' ? 20 : insets.top }]}>
            <View style={styles.modalHandle} />
            <View style={styles.modalTitleRow}>
              <Text style={styles.modalTitle}>All Attendees</Text>
              <Pressable
                style={styles.modalCloseButton}
                onPress={() => setShowAttendees(false)}
              >
                <Feather name="x" size={24} color={tokens.colors.text.primary} />
              </Pressable>
            </View>
            <Text style={styles.modalSubtitle}>{event.attendees} people registered</Text>
          </View>

          {/* Attendees List */}
          <FlatList
            data={attendees}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.attendeesModalList}
            ListEmptyComponent={
              <Text style={{ textAlign: 'center', padding: 24, color: tokens.colors.text.tertiary }}>
                No registrations yet — be the first!
              </Text>
            }
            renderItem={({ item }) => (
              <View style={[styles.attendeeItem, item.isYou && styles.attendeeItemYou]}>
                <Avatar source={item.avatar || undefined} name={item.name} size="md" />
                <View style={styles.attendeeInfo}>
                  <View style={styles.attendeeNameRow}>
                    <Text style={styles.attendeeName}>{item.name}</Text>
                    {item.isYou && (
                      <View style={styles.youBadge}>
                        <Text style={styles.youBadgeText}>You</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.attendeeDept}>{item.department || '—'}</Text>
                </View>
              </View>
            )}
            ItemSeparatorComponent={() => <View style={styles.attendeeSeparator} />}
          />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.colors.background.primary,
  },
  headerBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: tokens.colors.primary,
    zIndex: 10,
  },
  headerContent: {
    paddingHorizontal: 60,
    paddingBottom: tokens.spacing[4],
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: tokens.typography.size.lg,
    fontWeight: tokens.typography.weight.semibold,
    color: tokens.colors.white,
  },
  topBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: tokens.layout.screenPadding,
    zIndex: 20,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  topBarRight: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  iconButtonActive: {
    backgroundColor: '#EF4444',
  },
  iconButtonFill: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: '#EF4444',
    zIndex: -1,
  },
  heroContainer: {
    height: HEADER_HEIGHT,
    overflow: 'hidden',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 160,
  },
  content: {
    marginTop: -tokens.spacing[6],
    borderTopLeftRadius: tokens.radius['2xl'],
    borderTopRightRadius: tokens.radius['2xl'],
    backgroundColor: tokens.colors.background.primary,
    paddingHorizontal: tokens.layout.screenPadding,
    paddingTop: tokens.spacing[6],
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing[3],
    marginBottom: tokens.spacing[3],
  },
  categoryBadge: {
    backgroundColor: tokens.colors.primaryLight,
    paddingHorizontal: tokens.spacing[3],
    paddingVertical: tokens.spacing[2],
    borderRadius: tokens.radius.sm,
  },
  categoryText: {
    fontSize: tokens.typography.size.sm,
    fontWeight: tokens.typography.weight.semibold,
    color: tokens.colors.primary,
  },
  attendeesBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing[2],
  },
  attendeesText: {
    fontSize: tokens.typography.size.sm,
    fontWeight: tokens.typography.weight.medium,
    color: tokens.colors.text.secondary,
  },
  title: {
    fontSize: tokens.typography.size['2xl'],
    fontWeight: tokens.typography.weight.bold,
    color: tokens.colors.text.primary,
    marginBottom: tokens.spacing[5],
    lineHeight: tokens.typography.size['2xl'] * tokens.typography.lineHeight.snug,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: tokens.colors.background.secondary,
    borderRadius: tokens.radius.lg,
    padding: tokens.spacing[4],
    marginBottom: tokens.spacing[3],
  },
  infoIconContainer: {
    width: tokens.spacing[12],
    height: tokens.spacing[12],
    borderRadius: tokens.radius.md,
    backgroundColor: tokens.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoContent: {
    flex: 1,
    marginLeft: tokens.spacing[4],
  },
  infoLabel: {
    fontSize: tokens.typography.size.xs,
    fontWeight: tokens.typography.weight.medium,
    color: tokens.colors.text.tertiary,
    marginBottom: tokens.spacing[1],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: tokens.typography.size.base,
    fontWeight: tokens.typography.weight.semibold,
    color: tokens.colors.text.primary,
  },
  infoSubvalue: {
    fontSize: tokens.typography.size.sm,
    fontWeight: tokens.typography.weight.regular,
    color: tokens.colors.text.secondary,
    marginTop: tokens.spacing[1],
  },
  organizerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: tokens.colors.background.secondary,
    borderRadius: tokens.radius.lg,
    padding: tokens.spacing[4],
    marginBottom: tokens.spacing[6],
  },
  organizerAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  organizerInfo: {
    flex: 1,
    marginLeft: tokens.spacing[4],
  },
  organizerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing[2],
  },
  organizerName: {
    fontSize: tokens.typography.size.md,
    fontWeight: tokens.typography.weight.semibold,
    color: tokens.colors.text.primary,
  },
  organizerFollowers: {
    fontSize: tokens.typography.size.sm,
    fontWeight: tokens.typography.weight.regular,
    color: tokens.colors.text.tertiary,
    marginTop: tokens.spacing[1],
  },
  followButton: {
    paddingHorizontal: tokens.spacing[5],
    paddingVertical: tokens.spacing[3],
    borderRadius: tokens.radius.full,
    backgroundColor: tokens.colors.primary,
  },
  followButtonActive: {
    backgroundColor: tokens.colors.background.tertiary,
    borderWidth: 1,
    borderColor: tokens.colors.border.default,
  },
  followButtonText: {
    fontSize: tokens.typography.size.sm,
    fontWeight: tokens.typography.weight.semibold,
    color: tokens.colors.white,
  },
  followButtonTextActive: {
    color: tokens.colors.text.secondary,
  },
  aboutSection: {
    marginBottom: tokens.spacing[6],
  },
  sectionTitle: {
    fontSize: tokens.typography.size.lg,
    fontWeight: tokens.typography.weight.bold,
    color: tokens.colors.text.primary,
    marginBottom: tokens.spacing[3],
  },
  description: {
    fontSize: tokens.typography.size.base,
    fontWeight: tokens.typography.weight.regular,
    lineHeight: tokens.typography.size.base * tokens.typography.lineHeight.relaxed,
    color: tokens.colors.text.secondary,
  },
  attendeesSection: {
    marginBottom: tokens.spacing[6],
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: tokens.spacing[4],
  },
  seeAllText: {
    fontSize: tokens.typography.size.sm,
    fontWeight: tokens.typography.weight.semibold,
    color: tokens.colors.primary,
  },
  attendeesList: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing[3],
    marginBottom: tokens.spacing[4],
  },
  avatarStack: {
    flexDirection: 'row',
  },
  attendeeAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 3,
    borderColor: tokens.colors.white,
  },
  attendeesCountText: {
    fontSize: tokens.typography.size.sm,
    fontWeight: tokens.typography.weight.medium,
    color: tokens.colors.text.secondary,
  },
  capacityBar: {
    height: 6,
    backgroundColor: tokens.colors.border.light,
    borderRadius: tokens.radius.xs,
    overflow: 'hidden',
    marginBottom: tokens.spacing[2],
  },
  capacityFill: {
    height: '100%',
    backgroundColor: tokens.colors.primary,
    borderRadius: tokens.radius.xs,
  },
  capacityText: {
    fontSize: tokens.typography.size.sm,
    fontWeight: tokens.typography.weight.regular,
    color: tokens.colors.text.tertiary,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: tokens.layout.screenPadding,
    paddingTop: tokens.spacing[4],
    paddingBottom: 24,
    backgroundColor: tokens.colors.background.primary,
    borderTopWidth: 1,
    borderTopColor: tokens.colors.border.light,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  priceLabel: {
    fontSize: tokens.typography.size.xs,
    fontWeight: tokens.typography.weight.medium,
    color: tokens.colors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: tokens.spacing[1],
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  price: {
    fontSize: tokens.typography.size['2xl'],
    fontWeight: tokens.typography.weight.bold,
    color: tokens.colors.primary,
  },
  bookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing[2],
    backgroundColor: tokens.colors.primary,
    paddingHorizontal: tokens.spacing[8],
    paddingVertical: tokens.spacing[4],
    borderRadius: tokens.radius.lg,
    shadowColor: tokens.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  bookButtonDisabled: {
    backgroundColor: '#E5E7EB',
    shadowOpacity: 0,
    elevation: 0,
  },
  bookButtonText: {
    fontSize: tokens.typography.size.md,
    fontWeight: tokens.typography.weight.bold,
    color: tokens.colors.white,
  },
  bookButtonTextDisabled: {
    fontSize: tokens.typography.size.md,
    fontWeight: tokens.typography.weight.semibold,
    color: '#9CA3AF',
  },

  // Attendees Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: tokens.colors.background.primary,
  },
  modalHeader: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.border.light,
    backgroundColor: tokens.colors.background.primary,
  },
  modalHandle: {
    width: 36,
    height: 4,
    backgroundColor: tokens.colors.border.light,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: tokens.colors.text.primary,
  },
  modalCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: tokens.colors.background.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    color: tokens.colors.text.tertiary,
    marginTop: 4,
  },
  attendeesModalList: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  attendeeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  attendeeItemYou: {
    backgroundColor: `${tokens.colors.primary}10`,
    borderWidth: 1,
    borderColor: `${tokens.colors.primary}30`,
  },
  attendeeModalAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: tokens.colors.border.light,
  },
  attendeeInfo: {
    marginLeft: 14,
    flex: 1,
  },
  attendeeNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  attendeeName: {
    fontSize: 16,
    fontWeight: '600',
    color: tokens.colors.text.primary,
  },
  youBadge: {
    backgroundColor: tokens.colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  youBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },
  attendeeDept: {
    fontSize: 13,
    color: tokens.colors.text.tertiary,
    marginTop: 2,
  },
  attendeeSeparator: {
    height: 1,
    backgroundColor: tokens.colors.border.light,
    marginLeft: 78,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    backgroundColor: tokens.colors.background.secondary,
  },
  loadingText: {
    fontSize: 16,
    color: tokens.colors.text.secondary,
    fontWeight: '500',
  },
  bookButtonCancel: {
    backgroundColor: '#FEE2E2',
    borderWidth: 2,
    borderColor: '#EF4444',
  },
});
