/**
 * Organization/Club Profile Screen - CampusPulse Design System
 * Complete organization page with events, about, reviews, and member list
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  Share,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack, Link } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  FadeInRight,
  useSharedValue,
  useAnimatedStyle,
  useAnimatedScrollHandler,
  interpolate,
  Extrapolate,
  withTiming,
  withSequence,
} from 'react-native-reanimated';

import { tokens } from '@/lib/styles/unified';
import { supabase } from '@/lib/supabase/client';
import type { Club, Event as DbEvent } from '@/lib/supabase/database.types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HEADER_HEIGHT = 180;

type TabType = 'events' | 'about' | 'reviews' | 'members';

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  category: string;
  categoryColor: string;
  attendees: number;
  maxCapacity: number;
  image: string;
}

// Category → display color used for event badges and the avatar bg
const CATEGORY_COLORS: Record<string, string> = {
  workshop: '#3B82F6',
  bootcamp: '#8B5CF6',
  conference: '#F59E0B',
  seminar: '#10B981',
  competition: '#EF4444',
  cultural: '#EC4899',
  technical: '#6366F1',
  tech: '#6366F1',
  sports: '#F97316',
  social: '#06B6D4',
};
const colorForCategory = (cat: string | null | undefined): string =>
  CATEGORY_COLORS[(cat ?? '').toLowerCase()] || tokens.colors.primary;

const FALLBACK_COVER =
  'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1200&q=80';

// Display shape used by the render layer (kept as-is to preserve UI)
interface OrgDisplay {
  id: string;
  name: string;
  handle: string;
  description: string;
  logoUrl: string | null;
  coverImage: string;
  color: string;
  followers: number;
  rating: number;
  reviewCount: number;
  eventsHosted: number;
  membersCount: number;
  verified: boolean;
  founded: string;
  website: string;
  email: string;
  instagram: string;
  achievements: { icon: string; title: string }[];
}

const DEFAULT_ORG: OrgDisplay = {
  id: '0',
  name: 'Organization',
  handle: '@organization',
  description: 'Organization details will appear here.',
  logoUrl: null,
  coverImage: FALLBACK_COVER,
  color: tokens.colors.primary,
  followers: 0,
  rating: 0,
  reviewCount: 0,
  eventsHosted: 0,
  membersCount: 0,
  verified: false,
  founded: '',
  website: '',
  email: '',
  instagram: '',
  achievements: [],
};

// Map a Supabase clubs row + its events into the OrgDisplay shape
function clubToOrg(club: Club, eventsCount: number): OrgDisplay {
  const social =
    (club.social_links && typeof club.social_links === 'object'
      ? (club.social_links as Record<string, unknown>)
      : null) ?? null;
  const instagramFromSocial =
    social && typeof social.instagram === 'string'
      ? (social.instagram as string)
      : '';
  const founded = club.created_at
    ? new Date(club.created_at).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      })
    : '';
  return {
    id: club.id,
    name: club.name,
    handle: `@${club.slug ?? club.id.slice(0, 8)}`,
    description: club.description ?? '',
    logoUrl: club.logo_url ?? null,
    coverImage: club.banner_url ?? club.logo_url ?? FALLBACK_COVER,
    color: colorForCategory(club.category),
    followers: club.member_count ?? 0,
    rating: 0,
    reviewCount: 0,
    eventsHosted: eventsCount,
    membersCount: club.member_count ?? 0,
    verified: club.is_active ?? false,
    founded,
    website: club.website ?? '',
    email: club.email ?? '',
    instagram: instagramFromSocial,
    achievements: [],
  };
}

// Map a Supabase events row into the local Event display shape
function dbEventToEvent(e: DbEvent): Event {
  const d = new Date(e.date);
  const date = d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const time = d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
  const cat = e.category ?? 'event';
  return {
    id: e.id,
    title: e.title,
    date,
    time,
    location: e.location ?? e.venue ?? 'TBA',
    category: cat.charAt(0).toUpperCase() + cat.slice(1),
    categoryColor: colorForCategory(cat),
    attendees: e.current_attendees ?? 0,
    maxCapacity: e.max_attendees ?? 100,
    image:
      e.image_url ??
      'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&q=80',
  };
}

// Event Card Component
const EventCard = ({ event, index }: { event: Event; index: number }) => {
  const router = useRouter();
  const isNavigatingRef = useRef(false);
  const scale = useSharedValue(1);

  const handlePress = useCallback(() => {
    if (isNavigatingRef.current) return;
    isNavigatingRef.current = true;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    router.push(`/event/${event.id}`);

    setTimeout(() => {
      isNavigatingRef.current = false;
    }, 1000);
  }, [event.id, router]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const capacityPercent = (event.attendees / event.maxCapacity) * 100;
  const isAlmostFull = capacityPercent >= 80;

  return (
    <Animated.View
      entering={FadeInRight.delay(100 + index * 100).duration(400)}
    >
      <Animated.View style={animatedStyle}>
        <Pressable
          style={styles.eventCard}
          onPress={handlePress}
          onPressIn={() => { scale.value = withTiming(0.98, { duration: 100 }); }}
          onPressOut={() => { scale.value = withTiming(1, { duration: 150 }); }}
        >
        <Image source={{ uri: event.image }} style={styles.eventImage} />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)']}
          style={styles.eventGradient}
        />
        <View style={styles.eventContent}>
          <View style={[styles.eventCategoryBadge, { backgroundColor: event.categoryColor }]}>
            <Text style={styles.eventCategoryText}>{event.category}</Text>
          </View>
          <Text style={styles.eventTitle} numberOfLines={2}>{event.title}</Text>
          <View style={styles.eventMeta}>
            <View style={styles.eventMetaItem}>
              <Feather name="calendar" size={12} color="rgba(255,255,255,0.8)" />
              <Text style={styles.eventMetaText}>{event.date}</Text>
            </View>
            <View style={styles.eventMetaItem}>
              <Feather name="clock" size={12} color="rgba(255,255,255,0.8)" />
              <Text style={styles.eventMetaText}>{event.time}</Text>
            </View>
          </View>
          <View style={styles.eventCapacity}>
            <View style={styles.capacityBar}>
              <View style={[
                styles.capacityFill,
                { width: `${capacityPercent}%`, backgroundColor: isAlmostFull ? '#EF4444' : '#10B981' }
              ]} />
            </View>
            <Text style={[styles.capacityText, isAlmostFull && { color: '#FCA5A5' }]}>
              {isAlmostFull ? 'Almost Full!' : `${event.attendees}/${event.maxCapacity} spots`}
            </Text>
          </View>
        </View>
        </Pressable>
      </Animated.View>
    </Animated.View>
  );
};

export default function OrganizationProfileScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isNavigatingRef = useRef(false);

  const [activeTab, setActiveTab] = useState<TabType>('events');
  const [isFollowing, setIsFollowing] = useState(false);

  const scrollY = useSharedValue(0);
  const followScale = useSharedValue(1);

  const [org, setOrg] = useState<OrgDisplay>(DEFAULT_ORG);
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const idParam = Array.isArray(id) ? id[0] : id;

    async function load() {
      if (!idParam) {
        setIsLoading(false);
        setNotFound(true);
        return;
      }
      setIsLoading(true);
      setNotFound(false);

      const isUuid =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
          idParam,
        );

      const { data: club, error: clubErr } = isUuid
        ? await supabase.from('clubs').select('*').eq('id', idParam).maybeSingle()
        : await supabase.from('clubs').select('*').eq('slug', idParam).maybeSingle();

      if (cancelled) return;
      if (clubErr || !club) {
        setIsLoading(false);
        setNotFound(true);
        return;
      }

      const { data: clubEvents } = await supabase
        .from('events')
        .select('*')
        .eq('club_id', club.id)
        .order('date', { ascending: true });

      if (cancelled) return;
      const mappedEvents = (clubEvents ?? []).map(dbEventToEvent);
      setOrg(clubToOrg(club as Club, mappedEvents.length));
      setEvents(mappedEvents);
      setIsLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (e) => {
      scrollY.value = e.contentOffset.y;
    },
  });

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      scrollY.value,
      [0, HEADER_HEIGHT - 60],
      [0, 1],
      Extrapolate.CLAMP
    ),
  }));

  const coverAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: interpolate(
          scrollY.value,
          [-100, 0],
          [1.5, 1],
          Extrapolate.CLAMP
        ),
      },
    ],
  }));

  const handleBack = useCallback(() => {
    if (isNavigatingRef.current) return;
    isNavigatingRef.current = true;
    router.back();
    setTimeout(() => { isNavigatingRef.current = false; }, 1000);
  }, [router]);

  const handleFollow = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    followScale.value = withSequence(
      withTiming(0.92, { duration: 80 }),
      withTiming(1, { duration: 120 })
    );
    setIsFollowing(!isFollowing);
  }, [isFollowing]);

  const handleShare = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    try {
      await Share.share({
        title: org.name,
        message: `Check out ${org.name} on CampusPulse! ${org.description.substring(0, 100)}...`,
      });
    } catch {}
  }, [org]);

  const followAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: followScale.value }],
  }));

  const renderTabContent = () => {
    switch (activeTab) {
      case 'events':
        return (
          <View style={styles.tabContent}>
            <View style={styles.eventsHeader}>
              <Text style={styles.eventsTitle}>Upcoming Events</Text>
              <Pressable style={styles.seeAllButton}>
                <Text style={styles.seeAllText}>See All</Text>
                <Feather name="chevron-right" size={16} color={tokens.colors.primary} />
              </Pressable>
            </View>
            {events.map((event, index) => (
              <EventCard key={event.id} event={event} index={index} />
            ))}
            {events.length === 0 && (
              <View style={styles.emptyState}>
                <Feather name="calendar" size={48} color={tokens.colors.text.tertiary} />
                <Text style={styles.emptyStateTitle}>No Upcoming Events</Text>
                <Text style={styles.emptyStateText}>Check back later for new events</Text>
              </View>
            )}
          </View>
        );

      case 'about':
        return (
          <View style={styles.tabContent}>
            <Animated.View entering={FadeInDown.delay(100).duration(400)}>
              <Text style={styles.aboutTitle}>About</Text>
              <Text style={styles.aboutDescription}>{org.description}</Text>
            </Animated.View>

            {org.achievements && org.achievements.length > 0 && (
              <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.achievementsSection}>
                <Text style={styles.sectionTitle}>Achievements</Text>
                <View style={styles.achievementsList}>
                  {org.achievements.map((achievement: any, index: number) => (
                    <View key={index} style={styles.achievementItem}>
                      <View style={styles.achievementIcon}>
                        <Feather name={achievement.icon as any} size={20} color={tokens.colors.primary} />
                      </View>
                      <Text style={styles.achievementText}>{achievement.title}</Text>
                    </View>
                  ))}
                </View>
              </Animated.View>
            )}

            <Animated.View entering={FadeInDown.delay(300).duration(400)} style={styles.contactSection}>
              <Text style={styles.sectionTitle}>Contact Information</Text>
              <View style={styles.contactCard}>
                {org.email && (
                  <Pressable style={styles.contactItem}>
                    <View style={styles.contactIconBg}>
                      <Feather name="mail" size={18} color={tokens.colors.primary} />
                    </View>
                    <View style={styles.contactInfo}>
                      <Text style={styles.contactLabel}>Email</Text>
                      <Text style={styles.contactValue}>{org.email}</Text>
                    </View>
                    <Feather name="chevron-right" size={18} color={tokens.colors.text.tertiary} />
                  </Pressable>
                )}
                {org.website && (
                  <Pressable style={styles.contactItem}>
                    <View style={[styles.contactIconBg, { backgroundColor: '#E0E7FF' }]}>
                      <Feather name="globe" size={18} color="#4F46E5" />
                    </View>
                    <View style={styles.contactInfo}>
                      <Text style={styles.contactLabel}>Website</Text>
                      <Text style={styles.contactValue}>{org.website}</Text>
                    </View>
                    <Feather name="chevron-right" size={18} color={tokens.colors.text.tertiary} />
                  </Pressable>
                )}
                {org.instagram && (
                  <Pressable style={styles.contactItem}>
                    <View style={[styles.contactIconBg, { backgroundColor: '#FCE7F3' }]}>
                      <Feather name="instagram" size={18} color="#DB2777" />
                    </View>
                    <View style={styles.contactInfo}>
                      <Text style={styles.contactLabel}>Instagram</Text>
                      <Text style={styles.contactValue}>{org.instagram}</Text>
                    </View>
                    <Feather name="chevron-right" size={18} color={tokens.colors.text.tertiary} />
                  </Pressable>
                )}
              </View>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(400).duration(400)} style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Feather name="clock" size={18} color={tokens.colors.text.tertiary} />
                <Text style={styles.infoText}>Founded {org.founded}</Text>
              </View>
              <View style={styles.infoItem}>
                <Feather name="calendar" size={18} color={tokens.colors.text.tertiary} />
                <Text style={styles.infoText}>{org.eventsHosted} events hosted</Text>
              </View>
            </Animated.View>
          </View>
        );

      case 'reviews':
        return (
          <View style={styles.tabContent}>
            <View style={styles.emptyState}>
              <Feather name="message-circle" size={48} color={tokens.colors.text.tertiary} />
              <Text style={styles.emptyStateTitle}>Reviews Coming Soon</Text>
              <Text style={styles.emptyStateText}>
                Member reviews and ratings will be available once the community grows.
              </Text>
            </View>
          </View>
        );

      case 'members':
        return (
          <View style={styles.tabContent}>
            <Animated.View entering={FadeInDown.duration(400)} style={styles.membersHeader}>
              <Text style={styles.membersTitle}>{org.membersCount} Members</Text>
            </Animated.View>
            <View style={styles.emptyState}>
              <Feather name="users" size={48} color={tokens.colors.text.tertiary} />
              <Text style={styles.emptyStateTitle}>Member Directory Coming Soon</Text>
              <Text style={styles.emptyStateText}>
                Core team and member listings will appear here.
              </Text>
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={[styles.centerScreen, { paddingTop: insets.top }]}>
          <ActivityIndicator size="large" color={tokens.colors.primary} />
          <Text style={[styles.emptyStateText, { marginTop: 16 }]}>Loading club…</Text>
        </View>
      </View>
    );
  }

  if (notFound) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={[styles.centerScreen, { paddingTop: insets.top }]}>
          <Feather name="alert-circle" size={48} color={tokens.colors.text.tertiary} />
          <Text style={[styles.emptyStateTitle, { marginTop: 16 }]}>Club not found</Text>
          <Text style={[styles.emptyStateText, { textAlign: 'center', marginTop: 8 }]}>
            This club may have been removed or the link is invalid.
          </Text>
          <Pressable
            onPress={handleBack}
            style={[styles.followButton, { marginTop: 20 }]}
          >
            <Feather name="arrow-left" size={16} color="#FFFFFF" />
            <Text style={styles.followButtonText}>Go Back</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Animated Header */}
      <Animated.View style={[styles.headerBackground, headerAnimatedStyle]}>
        <View style={[styles.headerContent, { paddingTop: insets.top }]}>
          <Text style={styles.headerTitle} numberOfLines={1}>{org.name}</Text>
        </View>
      </Animated.View>

      {/* Top Navigation */}
      <View style={[styles.topBar, { top: insets.top + 8 }]}>
        <Pressable style={styles.backButton} onPress={handleBack}>
          <Feather name="arrow-left" size={22} color="#FFFFFF" />
        </Pressable>
        <View style={styles.topBarRight}>
          <Pressable style={styles.iconButton} onPress={handleShare}>
            <Feather name="share-2" size={20} color="#FFFFFF" />
          </Pressable>
          <Pressable style={styles.iconButton}>
            <Feather name="more-horizontal" size={20} color="#FFFFFF" />
          </Pressable>
        </View>
      </View>

      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
      >
        {/* Cover Image */}
        <Animated.View style={[styles.coverContainer, coverAnimatedStyle]}>
          <Image source={{ uri: org.coverImage }} style={styles.coverImage} />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.6)']}
            style={styles.coverGradient}
          />
        </Animated.View>

        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.profileHeader}>
            <View style={[styles.avatarContainer, { backgroundColor: org.color }]}>
              {org.logoUrl ? (
                <Image source={{ uri: org.logoUrl }} style={styles.avatarImage} />
              ) : (
                <Feather name="users" size={36} color="#FFFFFF" />
              )}
            </View>
            <Animated.View style={[followAnimatedStyle]}>
              <Pressable
                style={[styles.followButton, isFollowing && styles.followingButton]}
                onPress={handleFollow}
              >
                {isFollowing ? (
                  <>
                    <Feather name="check" size={16} color={tokens.colors.primary} />
                    <Text style={styles.followingButtonText}>Following</Text>
                  </>
                ) : (
                  <>
                    <Feather name="plus" size={16} color="#FFFFFF" />
                    <Text style={styles.followButtonText}>Follow</Text>
                  </>
                )}
              </Pressable>
            </Animated.View>
          </View>

          <View style={styles.profileInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.profileName}>{org.name}</Text>
              {org.verified && (
                <View style={styles.verifiedBadge}>
                  <Feather name="check" size={12} color="#FFFFFF" />
                </View>
              )}
            </View>
            <Text style={styles.profileHandle}>{org.handle}</Text>

            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{org.followers >= 1000 ? `${(org.followers / 1000).toFixed(1)}K` : org.followers}</Text>
                <Text style={styles.statLabel}>Followers</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <View style={styles.ratingInline}>
                  <Feather name="star" size={14} color="#F59E0B" />
                  <Text style={styles.statValue}>{org.rating}</Text>
                </View>
                <Text style={styles.statLabel}>Rating</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{org.eventsHosted}</Text>
                <Text style={styles.statLabel}>Events</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.tabs}>
              {(['events', 'about', 'reviews', 'members'] as TabType[]).map((tab) => (
                <Pressable
                  key={tab}
                  style={[styles.tab, activeTab === tab && styles.tabActive]}
                  onPress={() => setActiveTab(tab)}
                >
                  <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Tab Content */}
        {renderTabContent()}
      </Animated.ScrollView>
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
    paddingBottom: 16,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  topBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    zIndex: 20,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarRight: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverContainer: {
    height: HEADER_HEIGHT,
    overflow: 'hidden',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  coverGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 100,
  },
  profileSection: {
    marginTop: -40,
    paddingHorizontal: 20,
    backgroundColor: tokens.colors.background.primary,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 0,
  },
  profileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: -30,
    marginBottom: 16,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: tokens.colors.background.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarEmoji: {
    fontSize: 36,
  },
  avatarImage: {
    width: 72,
    height: 72,
    borderRadius: 16,
    resizeMode: 'cover',
  },
  centerScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  followButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: tokens.colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  followButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  followingButton: {
    backgroundColor: tokens.colors.primaryLight,
    borderWidth: 1,
    borderColor: tokens.colors.primary,
  },
  followingButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: tokens.colors.primary,
  },
  profileInfo: {
    marginBottom: 20,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  profileName: {
    fontSize: 22,
    fontWeight: '700',
    color: tokens.colors.text.primary,
  },
  verifiedBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileHandle: {
    fontSize: 14,
    color: tokens.colors.text.tertiary,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: tokens.colors.background.secondary,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: tokens.colors.text.primary,
  },
  statLabel: {
    fontSize: 12,
    color: tokens.colors.text.tertiary,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: tokens.colors.border.light,
  },
  ratingInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  tabsContainer: {
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.border.light,
    marginBottom: 16,
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
  },
  tab: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginRight: 8,
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: tokens.colors.primary,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '500',
    color: tokens.colors.text.tertiary,
  },
  tabTextActive: {
    color: tokens.colors.primary,
    fontWeight: '600',
  },
  tabContent: {
    paddingHorizontal: 20,
  },
  // Events Tab
  eventsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  eventsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: tokens.colors.text.primary,
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
  eventCard: {
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  eventImage: {
    width: '100%',
    height: '100%',
  },
  eventGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '70%',
  },
  eventContent: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 16,
  },
  eventCategoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 8,
  },
  eventCategoryText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  eventTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  eventMeta: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 10,
  },
  eventMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  eventMetaText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
  },
  eventCapacity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  capacityBar: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  capacityFill: {
    height: '100%',
    borderRadius: 2,
  },
  capacityText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: tokens.colors.text.primary,
    marginTop: 16,
    marginBottom: 4,
  },
  emptyStateText: {
    fontSize: 14,
    color: tokens.colors.text.tertiary,
  },
  // About Tab
  aboutTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: tokens.colors.text.primary,
    marginBottom: 12,
  },
  aboutDescription: {
    fontSize: 15,
    lineHeight: 24,
    color: tokens.colors.text.secondary,
    marginBottom: 24,
  },
  achievementsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: tokens.colors.text.primary,
    marginBottom: 12,
  },
  achievementsList: {
    gap: 12,
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: tokens.colors.background.secondary,
    padding: 14,
    borderRadius: 12,
  },
  achievementIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: tokens.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  achievementText: {
    fontSize: 14,
    fontWeight: '500',
    color: tokens.colors.text.primary,
  },
  contactSection: {
    marginBottom: 24,
  },
  contactCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.border.light,
  },
  contactIconBg: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: tokens.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  contactInfo: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 12,
    color: tokens.colors.text.tertiary,
    marginBottom: 2,
  },
  contactValue: {
    fontSize: 14,
    fontWeight: '500',
    color: tokens.colors.text.primary,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 24,
    marginTop: 8,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 13,
    color: tokens.colors.text.secondary,
  },
  // Reviews Tab
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: tokens.colors.background.secondary,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  ratingOverview: {
    alignItems: 'center',
  },
  ratingBig: {
    fontSize: 36,
    fontWeight: '700',
    color: tokens.colors.text.primary,
  },
  ratingStars: {
    flexDirection: 'row',
    marginVertical: 4,
  },
  ratingCount: {
    fontSize: 13,
    color: tokens.colors.text.tertiary,
  },
  writeReviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: tokens.colors.primaryLight,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  writeReviewText: {
    fontSize: 14,
    fontWeight: '600',
    color: tokens.colors.primary,
  },
  reviewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  reviewAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  reviewUserInfo: {
    flex: 1,
    marginLeft: 12,
  },
  reviewUserName: {
    fontSize: 14,
    fontWeight: '600',
    color: tokens.colors.text.primary,
  },
  reviewUserDept: {
    fontSize: 12,
    color: tokens.colors.text.tertiary,
  },
  reviewRating: {
    flexDirection: 'row',
  },
  reviewComment: {
    fontSize: 14,
    lineHeight: 22,
    color: tokens.colors.text.secondary,
    marginBottom: 12,
  },
  reviewFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reviewDate: {
    fontSize: 12,
    color: tokens.colors.text.tertiary,
  },
  helpfulButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: tokens.colors.background.secondary,
  },
  helpfulButtonActive: {
    backgroundColor: tokens.colors.primaryLight,
  },
  helpfulText: {
    fontSize: 12,
    color: tokens.colors.text.tertiary,
  },
  helpfulTextActive: {
    color: tokens.colors.primary,
    fontWeight: '500',
  },
  // Members Tab
  membersHeader: {
    backgroundColor: tokens.colors.background.secondary,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  membersTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: tokens.colors.text.primary,
    textAlign: 'center',
    marginBottom: 16,
  },
  memberStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberStatItem: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  memberStatValue: {
    fontSize: 24,
    fontWeight: '700',
    color: tokens.colors.primary,
  },
  memberStatLabel: {
    fontSize: 12,
    color: tokens.colors.text.tertiary,
    marginTop: 4,
  },
  memberStatDivider: {
    width: 1,
    height: 40,
    backgroundColor: tokens.colors.border.light,
  },
  memberSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: tokens.colors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  memberAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  memberInfo: {
    flex: 1,
    marginLeft: 12,
  },
  memberName: {
    fontSize: 15,
    fontWeight: '600',
    color: tokens.colors.text.primary,
  },
  memberDept: {
    fontSize: 13,
    color: tokens.colors.text.tertiary,
    marginTop: 2,
  },
  memberRoleBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  memberRoleText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
