/**
 * Home Screen - Evenro Design System
 * Main dashboard with events, categories, and user stats
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  Pressable,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Link, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';

import { theme } from '@/lib/constants/theme';
import { EVENT_CATEGORIES, getCategoryById } from '@/lib/constants/categories';
import { EventCard } from '@/components/ui/EventCard';
import { Button, IconButton } from '@/components/ui/Button';
import { SearchInput } from '@/components/ui/Input';
import { Chip, CategoryChip } from '@/components/ui/Chip';
import { Avatar, AvatarStack } from '@/components/ui/Avatar';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Mock data
const USER = {
  name: 'Yash',
  avatar: 'https://i.pravatar.cc/150?img=3',
  location: 'Mumbai, India',
};

const FEATURED_EVENTS = [
  {
    id: '1',
    title: 'Tech Summit 2025',
    subtitle: 'The biggest tech event of the year',
    date: 'Jan 15, 2025',
    time: '9:00 AM',
    location: 'Convention Center',
    category: 'tech',
    price: 49,
    imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
    attendeeCount: 234,
    attendeeImages: [
      'https://i.pravatar.cc/100?img=1',
      'https://i.pravatar.cc/100?img=2',
      'https://i.pravatar.cc/100?img=3',
    ],
    isFavorite: true,
  },
  {
    id: '2',
    title: 'Music Festival Night',
    subtitle: 'Live performances & DJ sets',
    date: 'Jan 20, 2025',
    time: '7:00 PM',
    location: 'Beach Arena',
    category: 'music',
    price: 'Free',
    imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800',
    attendeeCount: 1250,
    attendeeImages: [
      'https://i.pravatar.cc/100?img=4',
      'https://i.pravatar.cc/100?img=5',
      'https://i.pravatar.cc/100?img=6',
    ],
    isFavorite: false,
  },
];

const NEARBY_EVENTS = [
  {
    id: '3',
    title: 'Yoga in the Park',
    date: 'Tomorrow',
    time: '6:00 AM',
    location: 'Central Park',
    category: 'fitness',
    price: 'Free',
    imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400',
    attendeeCount: 45,
  },
  {
    id: '4',
    title: 'Startup Networking',
    date: 'Jan 12',
    time: '6:30 PM',
    location: 'WeWork Hub',
    category: 'networking',
    price: 15,
    imageUrl: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=400',
    attendeeCount: 89,
  },
  {
    id: '5',
    title: 'Art Exhibition',
    date: 'Jan 14',
    time: '11:00 AM',
    location: 'Modern Art Gallery',
    category: 'art',
    price: 10,
    imageUrl: 'https://images.unsplash.com/photo-1531243269054-5ebf6f34081e?w=400',
    attendeeCount: 156,
  },
];

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

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
    <View style={{ flex: 1, backgroundColor: theme.colors.background.secondary }}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.colors.primary[500]}
              colors={[theme.colors.primary[500]]}
            />
          }
        >
          {/* Header */}
          <Animated.View
            entering={FadeInDown.delay(100).springify()}
            style={{
              paddingHorizontal: theme.spacing.xl,
              paddingTop: theme.spacing.md,
              paddingBottom: theme.spacing.lg,
              backgroundColor: theme.colors.background.primary,
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              {/* Profile Section */}
              <Pressable
                style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md }}
                onPress={() => router.push('/profile')}
              >
                <Avatar source={USER.avatar} name={USER.name} size="lg" />
                <View>
                  <Text
                    style={{
                      fontSize: theme.typography.fontSize.sm,
                      color: theme.colors.text.tertiary,
                    }}
                  >
                    {getGreeting()} 👋
                  </Text>
                  <Text
                    style={{
                      fontSize: theme.typography.fontSize.xl,
                      fontWeight: theme.typography.fontWeight.bold as any,
                      color: theme.colors.text.primary,
                    }}
                  >
                    {USER.name}
                  </Text>
                </View>
              </Pressable>

              {/* Action Buttons */}
              <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
                <IconButton
                  icon="bell"
                  onPress={() => router.push('/notifications')}
                />
              </View>
            </View>

            {/* Location */}
            <Pressable
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: theme.spacing.xs,
                marginTop: theme.spacing.md,
              }}
            >
              <Feather name="map-pin" size={14} color={theme.colors.primary[500]} />
              <Text
                style={{
                  fontSize: theme.typography.fontSize.sm,
                  color: theme.colors.text.secondary,
                }}
              >
                {USER.location}
              </Text>
              <Feather name="chevron-down" size={14} color={theme.colors.text.tertiary} />
            </Pressable>
          </Animated.View>

          {/* Search Bar */}
          <Animated.View
            entering={FadeInDown.delay(200).springify()}
            style={{
              paddingHorizontal: theme.spacing.xl,
              paddingBottom: theme.spacing.lg,
              backgroundColor: theme.colors.background.primary,
            }}
          >
            <Pressable
              onPress={() => router.push('/explore')}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: theme.colors.background.tertiary,
                borderRadius: theme.borderRadius.lg,
                paddingHorizontal: theme.spacing.lg,
                paddingVertical: theme.spacing.md,
                gap: theme.spacing.md,
              }}
            >
              <Feather name="search" size={20} color={theme.colors.text.tertiary} />
              <Text
                style={{
                  flex: 1,
                  fontSize: theme.typography.fontSize.base,
                  color: theme.colors.text.tertiary,
                }}
              >
                Search events, venues...
              </Text>
              <View
                style={{
                  width: 1,
                  height: 24,
                  backgroundColor: theme.colors.border.default,
                }}
              />
              <Feather name="sliders" size={18} color={theme.colors.text.secondary} />
            </Pressable>
          </Animated.View>

          {/* Categories */}
          <Animated.View entering={FadeInDown.delay(300).springify()}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{
                paddingHorizontal: theme.spacing.xl,
                gap: theme.spacing.sm,
                paddingBottom: theme.spacing.lg,
              }}
            >
              <Chip
                label="All"
                selected={selectedCategory === null}
                onPress={() => setSelectedCategory(null)}
                color={theme.colors.primary[500]}
              />
              {EVENT_CATEGORIES.slice(0, 8).map((category) => (
                <CategoryChip
                  key={category.id}
                  id={category.id}
                  name={category.name}
                  emoji={category.emoji}
                  color={category.color}
                  selected={selectedCategory === category.id}
                  onPress={() =>
                    setSelectedCategory(
                      selectedCategory === category.id ? null : category.id
                    )
                  }
                />
              ))}
            </ScrollView>
          </Animated.View>

          {/* Featured Events */}
          <Animated.View
            entering={FadeInDown.delay(400).springify()}
            style={{ marginTop: theme.spacing.sm }}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingHorizontal: theme.spacing.xl,
                marginBottom: theme.spacing.md,
              }}
            >
              <Text
                style={{
                  fontSize: theme.typography.fontSize.lg,
                  fontWeight: theme.typography.fontWeight.bold as any,
                  color: theme.colors.text.primary,
                }}
              >
                Featured Events
              </Text>
              <Pressable
                style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
                onPress={() => router.push('/explore')}
              >
                <Text
                  style={{
                    fontSize: theme.typography.fontSize.sm,
                    fontWeight: theme.typography.fontWeight.medium as any,
                    color: theme.colors.primary[500],
                  }}
                >
                  See All
                </Text>
                <Feather name="chevron-right" size={16} color={theme.colors.primary[500]} />
              </Pressable>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{
                paddingHorizontal: theme.spacing.xl,
                gap: theme.spacing.lg,
              }}
              snapToInterval={SCREEN_WIDTH - 40 + theme.spacing.lg}
              decelerationRate="fast"
            >
              {FEATURED_EVENTS.map((event, index) => (
                <Animated.View
                  key={event.id}
                  entering={FadeInRight.delay(400 + index * 100).springify()}
                >
                  <Link href={{ pathname: '/event/[id]', params: { id: event.id } }} asChild>
                    <Pressable>
                      <EventCard
                        {...event}
                        variant="featured"
                        image={event.imageUrl}
                        onFavoritePress={() => console.log('Toggle favorite', event.id)}
                      />
                    </Pressable>
                  </Link>
                </Animated.View>
              ))}
            </ScrollView>
          </Animated.View>

          {/* Nearby Events */}
          <Animated.View
            entering={FadeInDown.delay(500).springify()}
            style={{ marginTop: theme.spacing['2xl'], paddingHorizontal: theme.spacing.xl }}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: theme.spacing.md,
              }}
            >
              <Text
                style={{
                  fontSize: theme.typography.fontSize.lg,
                  fontWeight: theme.typography.fontWeight.bold as any,
                  color: theme.colors.text.primary,
                }}
              >
                Nearby Events
              </Text>
              <Pressable
                style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
                onPress={() => router.push('/explore')}
              >
                <Text
                  style={{
                    fontSize: theme.typography.fontSize.sm,
                    fontWeight: theme.typography.fontWeight.medium as any,
                    color: theme.colors.primary[500],
                  }}
                >
                  See All
                </Text>
                <Feather name="chevron-right" size={16} color={theme.colors.primary[500]} />
              </Pressable>
            </View>

            <View style={{ gap: theme.spacing.md }}>
              {NEARBY_EVENTS.map((event, index) => (
                <Animated.View
                  key={event.id}
                  entering={FadeInDown.delay(600 + index * 100).springify()}
                >
                  <Link href={{ pathname: '/event/[id]', params: { id: event.id } }} asChild>
                    <Pressable>
                      <EventCard
                        {...event}
                        variant="compact"
                        image={event.imageUrl}
                        onFavoritePress={() => console.log('Toggle favorite', event.id)}
                      />
                    </Pressable>
                  </Link>
                </Animated.View>
              ))}
            </View>
          </Animated.View>

          {/* Quick Stats Card */}
          <Animated.View
            entering={FadeInDown.delay(700).springify()}
            style={{
              marginTop: theme.spacing['2xl'],
              marginHorizontal: theme.spacing.xl,
              marginBottom: insets.bottom + theme.spacing['4xl'],
            }}
          >
            <LinearGradient
              colors={[theme.colors.primary[500], theme.colors.primary[700]]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                borderRadius: theme.borderRadius.xl,
                padding: theme.spacing.xl,
                ...theme.shadows.lg,
              }}
            >
              <Text
                style={{
                  fontSize: theme.typography.fontSize.lg,
                  fontWeight: theme.typography.fontWeight.bold as any,
                  color: theme.colors.text.inverse,
                  marginBottom: theme.spacing.lg,
                }}
              >
                Your Activity
              </Text>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <View style={{ alignItems: 'center' }}>
                  <Text
                    style={{
                      fontSize: theme.typography.fontSize['3xl'],
                      fontWeight: theme.typography.fontWeight.bold as any,
                      color: theme.colors.text.inverse,
                    }}
                  >
                    12
                  </Text>
                  <Text
                    style={{
                      fontSize: theme.typography.fontSize.sm,
                      color: 'rgba(255,255,255,0.8)',
                    }}
                  >
                    Events Attended
                  </Text>
                </View>
                <View
                  style={{
                    width: 1,
                    backgroundColor: 'rgba(255,255,255,0.2)',
                  }}
                />
                <View style={{ alignItems: 'center' }}>
                  <Text
                    style={{
                      fontSize: theme.typography.fontSize['3xl'],
                      fontWeight: theme.typography.fontWeight.bold as any,
                      color: theme.colors.text.inverse,
                    }}
                  >
                    3
                  </Text>
                  <Text
                    style={{
                      fontSize: theme.typography.fontSize.sm,
                      color: 'rgba(255,255,255,0.8)',
                    }}
                  >
                    Upcoming
                  </Text>
                </View>
                <View
                  style={{
                    width: 1,
                    backgroundColor: 'rgba(255,255,255,0.2)',
                  }}
                />
                <View style={{ alignItems: 'center' }}>
                  <Text
                    style={{
                      fontSize: theme.typography.fontSize['3xl'],
                      fontWeight: theme.typography.fontWeight.bold as any,
                      color: theme.colors.text.inverse,
                    }}
                  >
                    45
                  </Text>
                  <Text
                    style={{
                      fontSize: theme.typography.fontSize.sm,
                      color: 'rgba(255,255,255,0.8)',
                    }}
                  >
                    Connections
                  </Text>
                </View>
              </View>
            </LinearGradient>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
