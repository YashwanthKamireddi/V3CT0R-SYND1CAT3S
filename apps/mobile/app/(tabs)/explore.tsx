/**
 * Explore Screen - CampusPulse Design System
 * Search, filter, and discover events with unified typography
 * Connected to real Supabase backend
 */

import React, { useState, useRef, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Pressable,
  Image,
  StyleSheet,
  Modal,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { tokens, layout } from '@/lib/styles/unified';
import { useEvents } from '@/lib/hooks/useEvents';
import { EventWithClub } from '@/lib/supabase/database.types';

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
  points?: number;
  organizer?: string;
  organizerLogo?: string;
}

interface Category {
  id: EventCategory;
  name: string;
  icon: keyof typeof Feather.glyphMap;
}

// Categories - Campus Club focused
const CATEGORIES: Category[] = [
  { id: 'all', name: 'All Events', icon: 'grid' },
  { id: 'workshop', name: 'Workshops', icon: 'tool' },
  { id: 'seminar', name: 'Seminars', icon: 'book-open' },
  { id: 'cultural', name: 'Cultural', icon: 'music' },
  { id: 'tech', name: 'Technical', icon: 'cpu' },
  { id: 'sports', name: 'Sports', icon: 'activity' },
  { id: 'competition', name: 'Competitions', icon: 'award' },
  { id: 'social', name: 'Social', icon: 'heart' },
];

// Format event from database to display format
const formatEventForDisplay = (event: EventWithClub): Event => {
  const eventDate = event.start_time ? new Date(event.start_time) : null;
  return {
    id: event.id,
    title: event.title,
    date: eventDate ? eventDate.toLocaleDateString('en-US', {
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
    price: 'Free',
    category: event.category || 'event',
    attendees: event.current_registrations || 0,
    points: event.points_reward || 0,
    organizer: event.clubs?.name || 'CampusPulse',
  };
};

// Event Card Component
function EventCard({ event, index }: { event: Event; index: number }) {
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
      entering={FadeInDown.delay(index * 60).duration(400)}
      style={styles.eventCard}
    >
      <Animated.View style={animatedStyle}>
        <Pressable
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={handlePress}
          style={styles.eventCardInner}
        >
        <Image
          source={{ uri: event.image }}
          style={styles.eventImage}
          resizeMode="cover"
        />

        <View style={styles.eventContent}>
          <View style={styles.eventHeader}>
            <Text style={styles.eventTitle} numberOfLines={2}>
              {event.title}
            </Text>
            <View style={styles.priceBadge}>
              <Text style={styles.priceText}>
                {typeof event.price === 'number' ? `$${event.price}` : event.price}
              </Text>
            </View>
          </View>

          <View style={styles.eventMeta}>
            <View style={styles.metaItem}>
              <Feather name="calendar" size={12} color={tokens.colors.primary} />
              <Text style={styles.metaText}>{event.date} - {event.time}</Text>
            </View>
            {event.organizer && (
              <View style={styles.metaItem}>
                <Feather name="users" size={12} color={tokens.colors.primary} />
                <Text style={styles.metaTextOrganizer} numberOfLines={1}>{event.organizer}</Text>
              </View>
            )}
            <View style={styles.metaItem}>
              <Feather name="map-pin" size={12} color={tokens.colors.text.tertiary} />
              <Text style={styles.metaTextLight} numberOfLines={1}>{event.location}</Text>
            </View>
          </View>

          <View style={styles.eventFooter}>
            <View style={styles.attendeesInfo}>
              <View style={styles.attendeesPill}>
                <Feather name="users" size={11} color={tokens.colors.primary} />
                <Text style={styles.attendeesText}>{event.attendees} going</Text>
              </View>
              {event.points && (
                <View style={styles.pointsBadge}>
                  <Feather name="award" size={10} color="#F59E0B" />
                  <Text style={styles.pointsText}>+{event.points}</Text>
                </View>
              )}
            </View>
            <View style={styles.registerBadge}>
              <Text style={styles.registerText}>Register</Text>
            </View>
          </View>
        </View>
      </Pressable>
      </Animated.View>
    </Animated.View>
  );
}

// Filter Modal
function FilterModal({
  visible,
  onClose,
  selectedCategory,
  onSelectCategory,
}: {
  visible: boolean;
  onClose: () => void;
  selectedCategory: EventCategory;
  onSelectCategory: (id: EventCategory) => void;
}) {
  const dateOptions = ['Today', 'Tomorrow', 'This Week', 'This Month', 'Any Time'];
  const [selectedDate, setSelectedDate] = useState('Any Time');

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <Animated.View entering={FadeInUp.duration(400)} style={styles.filterModal}>
          <View style={styles.filterHeader}>
            <Text style={styles.filterTitle}>Filters</Text>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <Feather name="x" size={24} color={tokens.colors.text.primary} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Category</Text>
              <View style={styles.categoriesGrid}>
                {CATEGORIES.map((cat) => (
                  <Pressable
                    key={cat.id}
                    style={[styles.categoryItem, selectedCategory === cat.id && styles.categoryItemSelected]}
                    onPress={() => onSelectCategory(cat.id)}
                  >
                    <Feather name={cat.icon} size={18} color={selectedCategory === cat.id ? '#FFFFFF' : tokens.colors.text.secondary} />
                    <Text style={[styles.categoryItemText, selectedCategory === cat.id && styles.categoryItemTextSelected]}>
                      {cat.name}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Date</Text>
              <View style={styles.dateOptions}>
                {dateOptions.map((option) => (
                  <Pressable
                    key={option}
                    style={[styles.dateOption, selectedDate === option && styles.dateOptionSelected]}
                    onPress={() => setSelectedDate(option)}
                  >
                    <Text style={[styles.dateOptionText, selectedDate === option && styles.dateOptionTextSelected]}>
                      {option}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </ScrollView>

          <View style={styles.filterFooter}>
            <Pressable style={styles.resetButton} onPress={() => { onSelectCategory('all'); setSelectedDate('Any Time'); }}>
              <Text style={styles.resetButtonText}>Reset</Text>
            </Pressable>
            <Pressable style={styles.applyButton} onPress={onClose}>
              <Text style={styles.applyButtonText}>Apply Filters</Text>
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

// Category type from database schema
type EventCategory = 'tech' | 'cultural' | 'sports' | 'workshop' | 'seminar' | 'competition' | 'social' | 'all';

// Main Screen
export default function ExploreScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<EventCategory>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Real data hooks
  const { events, isLoading, error, refresh, loadMore, hasMore } = useEvents(
    selectedCategory === 'all' ? undefined : { category: selectedCategory }
  );

  // Format events for display
  const displayEvents = useMemo(() => events.map(formatEventForDisplay), [events]);

  // Filter by search query locally
  const filteredEvents = useMemo(() => {
    if (!searchQuery.trim()) return displayEvents;
    return displayEvents.filter((event) =>
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.organizer?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [displayEvents, searchQuery]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }, [refresh]);

  const handleCategoryChange = useCallback((categoryId: EventCategory) => {
    setSelectedCategory(categoryId);
    setSearchQuery('');
  }, []);

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Explore</Text>
        </View>

        {/* Search */}
        <View style={styles.searchSection}>
          <View style={[styles.searchBar, isSearchFocused && styles.searchBarFocused]}>
            <Feather name="search" size={20} color={tokens.colors.text.tertiary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search events, clubs, organizers..."
              placeholderTextColor={tokens.colors.text.tertiary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
            />
            {searchQuery.length > 0 && (
              <Pressable onPress={() => setSearchQuery('')}>
                <Feather name="x-circle" size={18} color={tokens.colors.text.tertiary} />
              </Pressable>
            )}
            <View style={styles.searchDivider} />
            <Pressable style={styles.filterIconButton} onPress={() => setShowFilters(true)}>
              <Feather name="sliders" size={18} color={tokens.colors.primary} />
            </Pressable>
          </View>
        </View>

        {/* Categories */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesScroll}
          style={styles.categoriesContainer}
        >
          {CATEGORIES.slice(0, 6).map((category) => (
            <Pressable
              key={category.id}
              style={[styles.categoryPill, selectedCategory === category.id && styles.categoryPillSelected]}
              onPress={() => handleCategoryChange(category.id)}
            >
              <Feather name={category.icon} size={14} color={selectedCategory === category.id ? '#FFFFFF' : tokens.colors.text.secondary} />
              <Text style={[styles.categoryPillText, selectedCategory === category.id && styles.categoryPillTextSelected]}>
                {category.name}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Main Scrollable Content */}
        <ScrollView
          style={styles.mainScroll}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.mainScrollContent, { paddingBottom: insets.bottom + 90 }]}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={tokens.colors.primary}
            />
          }
          onScroll={({ nativeEvent }) => {
            const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
            const isEndReached = layoutMeasurement.height + contentOffset.y >= contentSize.height - 200;
            if (isEndReached && hasMore && !isLoading) {
              loadMore();
            }
          }}
          scrollEventThrottle={400}
        >
          {/* Results Header */}
          <View style={styles.resultsHeader}>
            <Text style={styles.resultsCount}>{filteredEvents.length} Events Found</Text>
          </View>

          {/* Loading State */}
          {isLoading && filteredEvents.length === 0 ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={tokens.colors.primary} />
              <Text style={styles.loadingText}>Loading events...</Text>
            </View>
          ) : (
            /* Events List */
            <View style={styles.eventsList}>
              {filteredEvents.length > 0 ? (
                filteredEvents.map((event, index) => <EventCard key={event.id} event={event} index={index} />)
              ) : (
                <View style={styles.emptyState}>
                  <Feather name="search" size={48} color={tokens.colors.text.tertiary} />
                  <Text style={styles.emptyTitle}>No Events Found</Text>
                  <Text style={styles.emptyText}>Try adjusting your search or filters</Text>
                </View>
              )}
            </View>
          )}

          {/* Load More Indicator */}
          {isLoading && filteredEvents.length > 0 && (
            <View style={styles.loadMoreContainer}>
              <ActivityIndicator size="small" color={tokens.colors.primary} />
            </View>
          )}
        </ScrollView>
      </SafeAreaView>

      <FilterModal
        visible={showFilters}
        onClose={() => setShowFilters(false)}
        selectedCategory={selectedCategory}
        onSelectCategory={handleCategoryChange}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  safeArea: { flex: 1 },

  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12, backgroundColor: '#FFFFFF' },
  headerTitle: { fontSize: 32, fontWeight: '800', color: tokens.colors.text.primary, letterSpacing: -0.5 },

  searchSection: { paddingHorizontal: 20, paddingBottom: 12, backgroundColor: '#FFFFFF' },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F5F5', borderRadius: 14, paddingHorizontal: 16, height: 52, gap: 12, borderWidth: 2, borderColor: 'transparent' },
  searchBarFocused: { borderColor: tokens.colors.primary, backgroundColor: '#FFFFFF' },
  searchInput: { flex: 1, fontSize: 16, color: tokens.colors.text.primary },
  searchDivider: { width: 1, height: 24, backgroundColor: '#E0E0E0' },
  filterIconButton: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#FFF4F0', alignItems: 'center', justifyContent: 'center' },

  categoriesContainer: { backgroundColor: '#FFFFFF', maxHeight: 64 },
  categoriesScroll: { paddingHorizontal: 20, paddingVertical: 12, gap: 10 },
  categoryPill: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, height: 40, borderRadius: 20, backgroundColor: '#FFFFFF', borderWidth: 1.5, borderColor: '#E8E8E8' },
  categoryPillSelected: { backgroundColor: tokens.colors.primary, borderColor: tokens.colors.primary },
  categoryPillText: { fontSize: 13, fontWeight: '600', color: tokens.colors.text.secondary },
  categoryPillTextSelected: { color: '#FFFFFF' },

  mainScroll: { flex: 1 },
  mainScrollContent: {},

  resultsHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 },
  resultsCount: { fontSize: 17, fontWeight: '700', color: tokens.colors.text.primary },
  viewToggle: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderRadius: 10, padding: 4, borderWidth: 1, borderColor: '#E8E8E8' },
  viewButton: { padding: 8, borderRadius: 8 },
  viewButtonActive: { backgroundColor: '#F5F5F5' },

  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 80 },
  loadingText: { fontSize: 14, color: tokens.colors.text.tertiary, marginTop: 12 },
  loadMoreContainer: { paddingVertical: 20, alignItems: 'center' },

  eventsList: { paddingHorizontal: 20, gap: 12 },
  eventCard: { marginBottom: 4 },
  eventCardInner: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#F0F0F0', shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.08, shadowRadius: 10, elevation: 4, minHeight: 140 },
  eventImage: { width: 120, height: '100%', minHeight: 140 },
  eventContent: { flex: 1, padding: 14, justifyContent: 'space-between' },
  eventHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 },
  eventTitle: { flex: 1, fontSize: 16, fontWeight: '700', color: tokens.colors.text.primary, lineHeight: 20 },
  priceBadge: { backgroundColor: '#E8F5E9', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  priceText: { fontSize: 12, fontWeight: '700', color: '#2E7D32' },
  registerBadge: { backgroundColor: tokens.colors.primary, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, flexShrink: 0, marginLeft: 8 },
  registerText: { fontSize: 12, fontWeight: '700', color: '#FFFFFF' },
  eventMeta: { gap: 4, marginTop: 6 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { fontSize: 12, color: tokens.colors.text.secondary, fontWeight: '500' },
  metaTextOrganizer: { fontSize: 12, color: tokens.colors.primary, fontWeight: '600', flex: 1 },
  metaTextLight: { fontSize: 12, color: tokens.colors.text.tertiary, flex: 1 },
  eventFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8, gap: 8 },
  attendeesInfo: { flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1, flexWrap: 'wrap' },
  attendeesPill: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, backgroundColor: tokens.colors.primaryLight, borderRadius: 999 },
  attendeesText: { fontSize: 11, color: tokens.colors.primary, fontWeight: '600' },
  pointsBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: 'rgba(245, 158, 11, 0.15)', paddingHorizontal: 6, paddingVertical: 3, borderRadius: 6, marginLeft: 4 },
  pointsText: { fontSize: 11, fontWeight: '700', color: '#F59E0B' },

  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: tokens.colors.text.primary, marginTop: 16 },
  emptyText: { fontSize: 14, color: tokens.colors.text.tertiary, textAlign: 'center', marginTop: 8 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  filterModal: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '85%' },
  filterHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 20, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  filterTitle: { fontSize: 20, fontWeight: '700', color: tokens.colors.text.primary },
  closeButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F5F5F5', alignItems: 'center', justifyContent: 'center' },
  filterSection: { paddingHorizontal: 20, paddingVertical: 20 },
  filterSectionTitle: { fontSize: 16, fontWeight: '600', color: tokens.colors.text.primary, marginBottom: 16 },
  categoriesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  categoryItem: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, backgroundColor: '#F5F5F5' },
  categoryItemSelected: { backgroundColor: tokens.colors.primary },
  categoryItemText: { fontSize: 13, fontWeight: '500', color: tokens.colors.text.secondary },
  categoryItemTextSelected: { color: '#FFFFFF' },
  dateOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  dateOption: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, backgroundColor: '#F5F5F5' },
  dateOptionSelected: { backgroundColor: tokens.colors.primary },
  dateOptionText: { fontSize: 14, fontWeight: '500', color: tokens.colors.text.secondary },
  dateOptionTextSelected: { color: '#FFFFFF' },
  filterFooter: { flexDirection: 'row', gap: 12, padding: 20, borderTopWidth: 1, borderTopColor: '#F5F5F5' },
  resetButton: { flex: 1, height: 52, borderRadius: 12, backgroundColor: '#F5F5F5', alignItems: 'center', justifyContent: 'center' },
  resetButtonText: { fontSize: 16, fontWeight: '600', color: tokens.colors.text.secondary },
  applyButton: { flex: 2, height: 52, borderRadius: 12, backgroundColor: tokens.colors.primary, alignItems: 'center', justifyContent: 'center' },
  applyButtonText: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
});
