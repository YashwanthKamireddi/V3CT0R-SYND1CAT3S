/**
 * Organization/Club Profile Screen - CampusPulse Design System
 * Complete organization page with events, about, reviews, and member list
 */

import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  Share,
  Dimensions,
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

interface Review {
  id: string;
  user: {
    name: string;
    avatar: string;
    department: string;
  };
  rating: number;
  comment: string;
  date: string;
  helpful: number;
}

interface Member {
  id: string;
  name: string;
  avatar: string;
  role: 'president' | 'vice-president' | 'coordinator' | 'member';
  department: string;
  joinedDate: string;
}

// Organization Data
const ORGANIZATIONS: Record<string, any> = {
  '1': {
    id: '1',
    name: 'Google Developer Student Club',
    handle: '@gdsc_campus',
    description: 'Official Google Developer Student Club. We build innovative solutions using Google technologies and host workshops, hackathons, and study jams throughout the year. Join us to learn Mobile, Web, Cloud, and ML technologies from industry experts and peers.',
    avatar: '🚀',
    coverImage: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1200&q=80',
    color: '#4285F4',
    followers: 2340,
    rating: 4.9,
    reviewCount: 156,
    eventsHosted: 42,
    membersCount: 234,
    isFollowing: false,
    verified: true,
    founded: 'September 2020',
    website: 'gdsc.community.dev',
    email: 'gdsc@university.edu',
    instagram: '@gdsc_campus',
    achievements: [
      { icon: 'award', title: 'Top 10 GDSC India 2024' },
      { icon: 'users', title: '1000+ Students Trained' },
      { icon: 'code', title: '50+ Projects Built' },
    ],
  },
  '2': {
    id: '2',
    name: 'Robotics Club',
    handle: '@robotics_hub',
    description: 'Building the future with robots and automation. We design, build, and compete with robots at national and international competitions. From beginners to advanced, everyone is welcome to explore the world of robotics.',
    avatar: '🤖',
    coverImage: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1200&q=80',
    color: '#FF6B6B',
    followers: 1560,
    rating: 4.7,
    reviewCount: 89,
    eventsHosted: 28,
    membersCount: 156,
    isFollowing: true,
    verified: true,
    founded: 'January 2019',
    website: 'robotics.university.edu',
    email: 'robotics@university.edu',
    instagram: '@robotics_hub',
    achievements: [
      { icon: 'trophy', title: 'Robocon 2024 Finalists' },
      { icon: 'cpu', title: '20+ Robots Built' },
      { icon: 'award', title: 'Best Innovation Award' },
    ],
  },
};

const DEFAULT_ORG = {
  id: '0',
  name: 'Organization',
  handle: '@organization',
  description: 'Organization details will appear here.',
  avatar: '🎯',
  coverImage: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1200&q=80',
  color: tokens.colors.primary,
  followers: 0,
  rating: 0,
  reviewCount: 0,
  eventsHosted: 0,
  membersCount: 0,
  isFollowing: false,
  verified: false,
  founded: '',
  website: '',
  email: '',
  instagram: '',
  achievements: [],
};

// Sample Events
const EVENTS: Event[] = [
  {
    id: '1',
    title: 'Cloud Study Jam - GCP Fundamentals',
    date: 'Jan 20, 2026',
    time: '2:00 PM',
    location: 'Computer Lab 301',
    category: 'Workshop',
    categoryColor: '#3B82F6',
    attendees: 35,
    maxCapacity: 50,
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&q=80',
  },
  {
    id: '2',
    title: 'Flutter Development Bootcamp',
    date: 'Jan 25, 2026',
    time: '10:00 AM',
    location: 'Seminar Hall A',
    category: 'Bootcamp',
    categoryColor: '#8B5CF6',
    attendees: 48,
    maxCapacity: 50,
    image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=600&q=80',
  },
  {
    id: '3',
    title: 'DevFest 2026 - Annual Tech Fest',
    date: 'Feb 15, 2026',
    time: '9:00 AM',
    location: 'Main Auditorium',
    category: 'Conference',
    categoryColor: '#F59E0B',
    attendees: 320,
    maxCapacity: 500,
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&q=80',
  },
];

// Sample Reviews
const REVIEWS: Review[] = [
  {
    id: '1',
    user: {
      name: 'Priya Sharma',
      avatar: 'https://i.pravatar.cc/100?img=25',
      department: 'Computer Science',
    },
    rating: 5,
    comment: 'Amazing club! The workshops are super practical and the mentors are very helpful. I learned so much about cloud computing.',
    date: '2 days ago',
    helpful: 24,
  },
  {
    id: '2',
    user: {
      name: 'Rahul Verma',
      avatar: 'https://i.pravatar.cc/100?img=33',
      department: 'Information Technology',
    },
    rating: 5,
    comment: 'Best tech community on campus. The hackathons they organize are top-notch with great prizes and learning opportunities.',
    date: '1 week ago',
    helpful: 18,
  },
  {
    id: '3',
    user: {
      name: 'Ananya Patel',
      avatar: 'https://i.pravatar.cc/100?img=44',
      department: 'Electronics',
    },
    rating: 4,
    comment: 'Great events and friendly community. Would love to see more hardware-focused workshops.',
    date: '2 weeks ago',
    helpful: 12,
  },
];

// Sample Members
const MEMBERS: Member[] = [
  {
    id: '1',
    name: 'Arjun Mehta',
    avatar: 'https://i.pravatar.cc/100?img=11',
    role: 'president',
    department: 'Computer Science',
    joinedDate: 'Aug 2023',
  },
  {
    id: '2',
    name: 'Sneha Iyer',
    avatar: 'https://i.pravatar.cc/100?img=23',
    role: 'vice-president',
    department: 'IT',
    joinedDate: 'Sep 2023',
  },
  {
    id: '3',
    name: 'Vikram Singh',
    avatar: 'https://i.pravatar.cc/100?img=12',
    role: 'coordinator',
    department: 'CSE',
    joinedDate: 'Oct 2023',
  },
  {
    id: '4',
    name: 'Kavya Nair',
    avatar: 'https://i.pravatar.cc/100?img=32',
    role: 'coordinator',
    department: 'ECE',
    joinedDate: 'Nov 2023',
  },
  {
    id: '5',
    name: 'Rohan Kumar',
    avatar: 'https://i.pravatar.cc/100?img=15',
    role: 'member',
    department: 'CSE',
    joinedDate: 'Dec 2023',
  },
  {
    id: '6',
    name: 'Ishita Gupta',
    avatar: 'https://i.pravatar.cc/100?img=45',
    role: 'member',
    department: 'IT',
    joinedDate: 'Jan 2024',
  },
];

const roleColors = {
  president: { bg: '#FEF3C7', text: '#92400E', label: 'President' },
  'vice-president': { bg: '#E0E7FF', text: '#3730A3', label: 'Vice President' },
  coordinator: { bg: tokens.colors.primaryLight, text: tokens.colors.primary, label: 'Coordinator' },
  member: { bg: tokens.colors.background.secondary, text: tokens.colors.text.secondary, label: 'Member' },
};

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

// Review Card Component
const ReviewCard = ({ review, index }: { review: Review; index: number }) => {
  const [isHelpful, setIsHelpful] = useState(false);

  return (
    <Animated.View
      entering={FadeInDown.delay(100 + index * 100).duration(400)}
      style={styles.reviewCard}
    >
      <View style={styles.reviewHeader}>
        <Image source={{ uri: review.user.avatar }} style={styles.reviewAvatar} />
        <View style={styles.reviewUserInfo}>
          <Text style={styles.reviewUserName}>{review.user.name}</Text>
          <Text style={styles.reviewUserDept}>{review.user.department}</Text>
        </View>
        <View style={styles.reviewRating}>
          {[1, 2, 3, 4, 5].map((star) => (
            <Feather
              key={star}
              name="star"
              size={14}
              color={star <= review.rating ? '#F59E0B' : '#E5E7EB'}
              style={{ marginLeft: star > 1 ? 2 : 0 }}
            />
          ))}
        </View>
      </View>
      <Text style={styles.reviewComment}>{review.comment}</Text>
      <View style={styles.reviewFooter}>
        <Text style={styles.reviewDate}>{review.date}</Text>
        <Pressable
          style={[styles.helpfulButton, isHelpful && styles.helpfulButtonActive]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
            setIsHelpful(!isHelpful);
          }}
        >
          <Feather name="thumbs-up" size={14} color={isHelpful ? tokens.colors.primary : tokens.colors.text.tertiary} />
          <Text style={[styles.helpfulText, isHelpful && styles.helpfulTextActive]}>
            Helpful ({isHelpful ? review.helpful + 1 : review.helpful})
          </Text>
        </Pressable>
      </View>
    </Animated.View>
  );
};

// Member Card Component
const MemberCard = ({ member, index }: { member: Member; index: number }) => {
  const roleStyle = roleColors[member.role];

  return (
    <Animated.View
      entering={FadeInDown.delay(100 + index * 80).duration(400)}
      style={styles.memberCard}
    >
      <Image source={{ uri: member.avatar }} style={styles.memberAvatar} />
      <View style={styles.memberInfo}>
        <Text style={styles.memberName}>{member.name}</Text>
        <Text style={styles.memberDept}>{member.department}</Text>
      </View>
      <View style={[styles.memberRoleBadge, { backgroundColor: roleStyle.bg }]}>
        <Text style={[styles.memberRoleText, { color: roleStyle.text }]}>
          {roleStyle.label}
        </Text>
      </View>
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

  const org = ORGANIZATIONS[id as string] || DEFAULT_ORG;

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
            {EVENTS.map((event, index) => (
              <EventCard key={event.id} event={event} index={index} />
            ))}
            {EVENTS.length === 0 && (
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
            <Animated.View entering={FadeInDown.duration(400)} style={styles.reviewsHeader}>
              <View style={styles.ratingOverview}>
                <Text style={styles.ratingBig}>{org.rating}</Text>
                <View style={styles.ratingStars}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Feather
                      key={star}
                      name="star"
                      size={16}
                      color={star <= Math.round(org.rating) ? '#F59E0B' : '#E5E7EB'}
                      style={{ marginRight: 2 }}
                    />
                  ))}
                </View>
                <Text style={styles.ratingCount}>{org.reviewCount} reviews</Text>
              </View>
              <Pressable style={styles.writeReviewButton}>
                <Feather name="edit-2" size={16} color={tokens.colors.primary} />
                <Text style={styles.writeReviewText}>Write Review</Text>
              </Pressable>
            </Animated.View>

            {REVIEWS.map((review, index) => (
              <ReviewCard key={review.id} review={review} index={index} />
            ))}
          </View>
        );

      case 'members':
        return (
          <View style={styles.tabContent}>
            <Animated.View entering={FadeInDown.duration(400)} style={styles.membersHeader}>
              <Text style={styles.membersTitle}>{org.membersCount} Members</Text>
              <View style={styles.memberStats}>
                <View style={styles.memberStatItem}>
                  <Text style={styles.memberStatValue}>
                    {MEMBERS.filter(m => m.role === 'coordinator' || m.role === 'president' || m.role === 'vice-president').length}
                  </Text>
                  <Text style={styles.memberStatLabel}>Core Team</Text>
                </View>
                <View style={styles.memberStatDivider} />
                <View style={styles.memberStatItem}>
                  <Text style={styles.memberStatValue}>{MEMBERS.filter(m => m.role === 'member').length}+</Text>
                  <Text style={styles.memberStatLabel}>Members</Text>
                </View>
              </View>
            </Animated.View>

            <Text style={styles.memberSectionTitle}>Core Team</Text>
            {MEMBERS.filter(m => m.role !== 'member').map((member, index) => (
              <MemberCard key={member.id} member={member} index={index} />
            ))}

            <Text style={[styles.memberSectionTitle, { marginTop: 24 }]}>Members</Text>
            {MEMBERS.filter(m => m.role === 'member').map((member, index) => (
              <MemberCard key={member.id} member={member} index={index + 4} />
            ))}
          </View>
        );

      default:
        return null;
    }
  };

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
              <Text style={styles.avatarEmoji}>{org.avatar}</Text>
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
