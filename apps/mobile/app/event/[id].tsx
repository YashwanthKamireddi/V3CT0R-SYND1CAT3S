/**
 * Event Details Screen - CampusPulse Design System
 * Production-ready with unified typography and responsive layout
 */

import React, { useState, useCallback, useRef } from 'react';
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

const HEADER_HEIGHT = 320;

// Campus Event Data
const EVENTS_DATA: Record<string, any> = {
  '1': {
    id: '1',
    title: 'AI/ML Workshop Series',
    description: 'Dive deep into Artificial Intelligence and Machine Learning with hands-on projects. Learn from industry experts and build real-world applications using Python, TensorFlow, and PyTorch.\n\nTopics covered: Neural Networks, NLP, Computer Vision, and Model Deployment. Certificates will be provided upon completion.',
    date: 'Saturday, December 21, 2025',
    time: '10:00 AM - 5:00 PM',
    location: 'Computer Lab 301',
    address: 'Engineering Building, Block C, 3rd Floor',
    image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1200&q=80',
    price: 'Free',
    category: 'Workshop',
    attendees: 89,
    maxCapacity: 120,
    organizer: {
      name: 'Tech Club',
      avatar: 'https://i.pravatar.cc/100?img=50',
      followers: '2.3K',
      verified: true,
    },
    points: 50,
  },
  '2': {
    id: '2',
    title: 'CodeVerse Hackathon 2025',
    description: 'The flagship 24-hour hackathon is back! Build innovative solutions, compete with the best coders, and win exciting prizes. Open to all departments.\n\nPrize Pool: ₹1,00,000. Mentorship from industry professionals. Free food and swag for all participants.',
    date: 'December 22-23, 2025',
    time: '9:00 AM onwards',
    location: 'Main Auditorium',
    address: 'Central Campus, Ground Floor',
    image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&q=80',
    price: 'Free',
    category: 'Hackathon',
    attendees: 234,
    maxCapacity: 300,
    organizer: {
      name: 'Computer Science Dept.',
      avatar: 'https://i.pravatar.cc/100?img=51',
      followers: '5.1K',
      verified: true,
    },
    points: 100,
  },
  '3': {
    id: '3',
    title: 'Annual Cultural Fest - Rhythm',
    description: 'The most awaited event of the year! Three days of music, dance, drama, and art. Featuring performances from professional artists and student talent.\n\nEvents: Battle of Bands, Dance Competition, Fashion Show, Stand-up Comedy, and more.',
    date: 'December 26-28, 2025',
    time: '5:00 PM - 10:00 PM',
    location: 'Open Air Theatre',
    address: 'Main Campus Grounds',
    image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&q=80',
    price: 'Free',
    category: 'Cultural',
    attendees: 1200,
    maxCapacity: 2000,
    organizer: {
      name: 'Cultural Committee',
      avatar: 'https://i.pravatar.cc/100?img=52',
      followers: '8.7K',
      verified: true,
    },
    points: 30,
  },
  '4': {
    id: '4',
    title: 'Guest Lecture: Future of FinTech',
    description: 'Join us for an insightful session with Mr. Rajesh Sharma, CEO of PaySecure Technologies, as he discusses the evolving landscape of financial technology.\n\nTopics: Digital Payments, Blockchain in Banking, Regulatory Challenges, Career Opportunities in FinTech.',
    date: 'Monday, December 23, 2025',
    time: '2:00 PM - 4:00 PM',
    location: 'Seminar Hall A',
    address: 'Management Building, 2nd Floor',
    image: 'https://images.unsplash.com/photo-1560439514-4e9645039924?w=1200&q=80',
    price: 'Free',
    category: 'Seminar',
    attendees: 156,
    maxCapacity: 200,
    organizer: {
      name: 'Finance Club',
      avatar: 'https://i.pravatar.cc/100?img=53',
      followers: '1.8K',
      verified: true,
    },
    points: 25,
  },
  '5': {
    id: '5',
    title: 'Inter-College Basketball Tournament',
    description: 'Witness the best college basketball teams compete for the championship trophy! Cheer for our home team as they take on rivals from across the city.\n\n12 teams. 3 days. 1 champion. Refreshments available at the venue.',
    date: 'December 27, 2025',
    time: '9:00 AM - 6:00 PM',
    location: 'Sports Complex',
    address: 'Indoor Stadium, North Campus',
    image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=1200&q=80',
    price: 'Free',
    category: 'Sports',
    attendees: 320,
    maxCapacity: 500,
    organizer: {
      name: 'Sports Council',
      avatar: 'https://i.pravatar.cc/100?img=54',
      followers: '3.2K',
      verified: true,
    },
    points: 20,
  },
  '6': {
    id: '6',
    title: 'Photography Club Exhibition',
    description: 'Explore stunning visual stories captured by our talented photography club members. The exhibition showcases the best works from this semester.\n\nCategories: Nature, Street, Portrait, Abstract, and Campus Life.',
    date: 'December 28, 2025',
    time: '11:00 AM - 6:00 PM',
    location: 'Art Gallery',
    address: 'Fine Arts Building, Ground Floor',
    image: 'https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=1200&q=80',
    price: 'Free',
    category: 'Club Event',
    attendees: 78,
    maxCapacity: 150,
    organizer: {
      name: 'Photography Club',
      avatar: 'https://i.pravatar.cc/100?img=55',
      followers: '1.2K',
      verified: true,
    },
    points: 15,
  },
  '7': {
    id: '7',
    title: 'Cloud Computing Bootcamp',
    description: 'Get certified in cloud technologies! This intensive bootcamp covers AWS, Azure, and Google Cloud Platform fundamentals.\n\nHands-on labs, real-world projects, and exam preparation included. Limited seats available.',
    date: 'January 2, 2026',
    time: '10:00 AM - 4:00 PM',
    location: 'IT Lab 201',
    address: 'Technology Block, 2nd Floor',
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&q=80',
    price: 'Free',
    category: 'Technical',
    attendees: 67,
    maxCapacity: 80,
    organizer: {
      name: 'Cloud Computing Club',
      avatar: 'https://i.pravatar.cc/100?img=56',
      followers: '950',
      verified: true,
    },
    points: 40,
  },
  '8': {
    id: '8',
    title: 'Entrepreneurship Summit',
    description: 'Connect with successful entrepreneurs, investors, and mentors. Learn how to turn your ideas into successful startups.\n\nPitch competition with ₹50,000 seed funding for the winning idea. Networking lunch included.',
    date: 'January 5, 2026',
    time: '9:30 AM - 5:00 PM',
    location: 'Conference Hall',
    address: 'Admin Building, 1st Floor',
    image: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=1200&q=80',
    price: 'Free',
    category: 'Seminar',
    attendees: 245,
    maxCapacity: 300,
    organizer: {
      name: 'E-Cell',
      avatar: 'https://i.pravatar.cc/100?img=57',
      followers: '4.5K',
      verified: true,
    },
    points: 35,
  },
};

const DEFAULT_EVENT = {
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
};

// Sample Attendees Data for All Events
const SAMPLE_ATTENDEES = [
  { id: '1', name: 'Yashwanth Kamireddi', regNo: '2023002748', department: 'CSE', avatar: 'https://i.pravatar.cc/100?img=12', isYou: true },
  { id: '2', name: 'Priya Sharma', regNo: '2023003245', department: 'ECE', avatar: 'https://i.pravatar.cc/100?img=21' },
  { id: '3', name: 'Rahul Verma', regNo: '2023001567', department: 'ME', avatar: 'https://i.pravatar.cc/100?img=22' },
  { id: '4', name: 'Ananya Singh', regNo: '2023004521', department: 'CSE', avatar: 'https://i.pravatar.cc/100?img=23' },
  { id: '5', name: 'Karthik Reddy', regNo: '2023002156', department: 'IT', avatar: 'https://i.pravatar.cc/100?img=24' },
  { id: '6', name: 'Sneha Patil', regNo: '2023003897', department: 'CSE', avatar: 'https://i.pravatar.cc/100?img=25' },
  { id: '7', name: 'Arjun Mehta', regNo: '2023001234', department: 'ECE', avatar: 'https://i.pravatar.cc/100?img=26' },
  { id: '8', name: 'Divya Krishna', regNo: '2023005678', department: 'BT', avatar: 'https://i.pravatar.cc/100?img=27' },
  { id: '9', name: 'Vikram Patel', regNo: '2023002345', department: 'CSE', avatar: 'https://i.pravatar.cc/100?img=28' },
  { id: '10', name: 'Meera Nair', regNo: '2023004321', department: 'IT', avatar: 'https://i.pravatar.cc/100?img=29' },
  { id: '11', name: 'Sanjay Kumar', regNo: '2023001876', department: 'ME', avatar: 'https://i.pravatar.cc/100?img=30' },
  { id: '12', name: 'Aisha Khan', regNo: '2023003456', department: 'CSE', avatar: 'https://i.pravatar.cc/100?img=31' },
  { id: '13', name: 'Rohan Gupta', regNo: '2023002987', department: 'ECE', avatar: 'https://i.pravatar.cc/100?img=32' },
  { id: '14', name: 'Lakshmi Iyer', regNo: '2023004567', department: 'CSE', avatar: 'https://i.pravatar.cc/100?img=33' },
  { id: '15', name: 'Akash Joshi', regNo: '2023001543', department: 'IT', avatar: 'https://i.pravatar.cc/100?img=34' },
];

export default function EventDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [showAttendees, setShowAttendees] = useState(false);

  // Animation values
  const scrollY = useSharedValue(0);
  const likeScale = useSharedValue(1);
  const shareScale = useSharedValue(1);
  const isNavigatingRef = useRef(false);

  const event = EVENTS_DATA[id as string] || DEFAULT_EVENT;

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

  // Navigate to registration
  const handleRegister = useCallback(() => {
    if (isNavigatingRef.current) return;
    isNavigatingRef.current = true;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    router.push(`/event/register?id=${id}&title=${encodeURIComponent(event.title)}&date=${encodeURIComponent(event.date)}&location=${encodeURIComponent(event.location)}&points=${event.points || 0}`);

    setTimeout(() => {
      isNavigatingRef.current = false;
    }, 1000);
  }, [id, event, router]);

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
    opacity: interpolate(
      scrollY.value,
      [0, HEADER_HEIGHT - 100],
      [0, 1],
      Extrapolate.CLAMP
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
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
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
            <Pressable style={styles.followButton}>
              <Text style={styles.followButtonText}>Follow</Text>
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
        style={[styles.bottomBar, { paddingBottom: insets.bottom + tokens.spacing[4] }]}
      >
        <View>
          <Text style={styles.priceLabel}>Earn</Text>
          <Text style={styles.price}>
            {event.points ? `+${event.points} pts` : 'Free'}
          </Text>
        </View>
        <Pressable style={styles.bookButton} onPress={handleRegister}>
          <Text style={styles.bookButtonText}>Register Now</Text>
          <Feather name="arrow-right" size={20} color={tokens.colors.white} />
        </Pressable>
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
            data={SAMPLE_ATTENDEES}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.attendeesModalList}
            renderItem={({ item }) => (
              <View style={[styles.attendeeItem, item.isYou && styles.attendeeItemYou]}>
                <Image source={{ uri: item.avatar }} style={styles.attendeeModalAvatar} />
                <View style={styles.attendeeInfo}>
                  <View style={styles.attendeeNameRow}>
                    <Text style={styles.attendeeName}>{item.name}</Text>
                    {item.isYou && (
                      <View style={styles.youBadge}>
                        <Text style={styles.youBadgeText}>You</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.attendeeDept}>{item.regNo} • {item.department}</Text>
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
    width: tokens.spacing[12],
    height: tokens.spacing[12],
    borderRadius: tokens.radius.full,
    backgroundColor: tokens.colors.surface.scrim,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarRight: {
    flexDirection: 'row',
    gap: tokens.spacing[3],
  },
  iconButton: {
    width: tokens.spacing[12],
    height: tokens.spacing[12],
    borderRadius: tokens.radius.full,
    backgroundColor: tokens.colors.surface.scrim,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
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
  followButtonText: {
    fontSize: tokens.typography.size.sm,
    fontWeight: tokens.typography.weight.semibold,
    color: tokens.colors.white,
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
  bookButtonText: {
    fontSize: tokens.typography.size.md,
    fontWeight: tokens.typography.weight.bold,
    color: tokens.colors.white,
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
});
