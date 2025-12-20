/**
 * Explore Screen - CampusPulse Design System
 * Search, filter, and discover events with unified typography
 */

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Pressable,
  Image,
  StyleSheet,
  Modal,
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
}

interface Category {
  id: string;
  name: string;
  icon: keyof typeof Feather.glyphMap;
}

// Categories - Campus-focused
const CATEGORIES: Category[] = [
  { id: 'all', name: 'All Events', icon: 'grid' },
  { id: 'workshop', name: 'Workshops', icon: 'tool' },
  { id: 'seminar', name: 'Seminars', icon: 'book-open' },
  { id: 'cultural', name: 'Cultural', icon: 'music' },
  { id: 'technical', name: 'Technical', icon: 'cpu' },
  { id: 'sports', name: 'Sports', icon: 'activity' },
  { id: 'club', name: 'Club Events', icon: 'users' },
  { id: 'hackathon', name: 'Hackathons', icon: 'code' },
];

// Campus Events Data
const ALL_EVENTS: Event[] = [
  {
    id: '1',
    title: 'AI/ML Workshop Series',
    date: 'Sat, Dec 21',
    time: '10:00 AM',
    location: 'Computer Lab 301',
    image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&q=80',
    price: 'Free',
    category: 'workshop',
    attendees: 89,
  },
  {
    id: '2',
    title: 'CodeVerse Hackathon 2025',
    date: 'Dec 22-23',
    time: '9:00 AM',
    location: 'Main Auditorium',
    image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&q=80',
    price: 'Free',
    category: 'hackathon',
    attendees: 234,
  },
  {
    id: '3',
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
    id: '4',
    title: 'Annual Cultural Fest - Rhythm',
    date: 'Dec 26-28',
    time: '5:00 PM',
    location: 'Open Air Theatre',
    image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80',
    price: 'Free',
    category: 'cultural',
    attendees: 1200,
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
    title: 'Cloud Computing Bootcamp',
    date: 'Jan 02',
    time: '10:00 AM',
    location: 'IT Lab 201',
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80',
    price: 'Free',
    category: 'technical',
    attendees: 67,
  },
  {
    id: '8',
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
        <Image source={{ uri: event.image }} style={styles.eventImage} />

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
            <View style={styles.metaItem}>
              <Feather name="map-pin" size={12} color={tokens.colors.text.tertiary} />
              <Text style={styles.metaTextLight} numberOfLines={1}>{event.location}</Text>
            </View>
          </View>

          <View style={styles.eventFooter}>
            <View style={styles.attendeesInfo}>
              <View style={styles.avatarStack}>
                {[1, 2, 3].map((i) => (
                  <Image
                    key={i}
                    source={{ uri: `https://i.pravatar.cc/50?img=${i + event.attendees}` }}
                    style={[styles.miniAvatar, { marginLeft: i > 1 ? -6 : 0 }]}
                  />
                ))}
              </View>
              <Text style={styles.attendeesText}>+{event.attendees} going</Text>
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
  selectedCategory: string;
  onSelectCategory: (id: string) => void;
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

// Main Screen
export default function ExploreScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  const filteredEvents = ALL_EVENTS.filter((event) => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || event.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Explore</Text>
          <Pressable style={styles.mapButton}>
            <Feather name="map" size={20} color={tokens.colors.text.primary} />
          </Pressable>
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
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesScroll}>
          {CATEGORIES.slice(0, 6).map((category) => (
            <Pressable
              key={category.id}
              style={[styles.categoryPill, selectedCategory === category.id && styles.categoryPillSelected]}
              onPress={() => setSelectedCategory(category.id)}
            >
              <Feather name={category.icon} size={14} color={selectedCategory === category.id ? '#FFFFFF' : tokens.colors.text.secondary} />
              <Text style={[styles.categoryPillText, selectedCategory === category.id && styles.categoryPillTextSelected]}>
                {category.name}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Results Header */}
        <View style={styles.resultsHeader}>
          <Text style={styles.resultsCount}>{filteredEvents.length} Events Found</Text>
          <View style={styles.viewToggle}>
            <Pressable style={[styles.viewButton, viewMode === 'list' && styles.viewButtonActive]} onPress={() => setViewMode('list')}>
              <Feather name="list" size={18} color={viewMode === 'list' ? tokens.colors.primary : tokens.colors.text.tertiary} />
            </Pressable>
            <Pressable style={[styles.viewButton, viewMode === 'grid' && styles.viewButtonActive]} onPress={() => setViewMode('grid')}>
              <Feather name="grid" size={18} color={viewMode === 'grid' ? tokens.colors.primary : tokens.colors.text.tertiary} />
            </Pressable>
          </View>
        </View>

        {/* Events */}
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.eventsList, { paddingBottom: insets.bottom + 100 }]}>
          {filteredEvents.length > 0 ? (
            filteredEvents.map((event, index) => <EventCard key={event.id} event={event} index={index} />)
          ) : (
            <View style={styles.emptyState}>
              <Feather name="search" size={48} color={tokens.colors.text.tertiary} />
              <Text style={styles.emptyTitle}>No Events Found</Text>
              <Text style={styles.emptyText}>Try adjusting your search or filters</Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>

      <FilterModal
        visible={showFilters}
        onClose={() => setShowFilters(false)}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  safeArea: { flex: 1 },

  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16 },
  headerTitle: { fontSize: 32, fontWeight: '700', color: tokens.colors.text.primary, letterSpacing: -0.5 },
  mapButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: tokens.colors.background.tertiary, alignItems: 'center', justifyContent: 'center' },

  searchSection: { paddingHorizontal: 20, paddingBottom: 16 },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F5F5', borderRadius: 12, paddingHorizontal: 16, height: 52, gap: 12, borderWidth: 2, borderColor: 'transparent' },
  searchBarFocused: { borderColor: tokens.colors.primary, backgroundColor: '#FFFFFF' },
  searchInput: { flex: 1, fontSize: 16, color: tokens.colors.text.primary },
  searchDivider: { width: 1, height: 24, backgroundColor: '#E0E0E0' },
  filterIconButton: { width: 36, height: 36, borderRadius: 8, backgroundColor: '#FFF4F0', alignItems: 'center', justifyContent: 'center' },

  categoriesScroll: { paddingHorizontal: 20, paddingBottom: 16, gap: 10 },
  categoryPill: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, height: 36, borderRadius: 18, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E0E0E0' },
  categoryPillSelected: { backgroundColor: tokens.colors.primary, borderColor: tokens.colors.primary },
  categoryPillText: { fontSize: 13, fontWeight: '500', color: tokens.colors.text.secondary },
  categoryPillTextSelected: { color: '#FFFFFF' },

  resultsHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 12 },
  resultsCount: { fontSize: 16, fontWeight: '600', color: tokens.colors.text.primary },
  viewToggle: { flexDirection: 'row', backgroundColor: '#F5F5F5', borderRadius: 8, padding: 4 },
  viewButton: { padding: 8, borderRadius: 6 },
  viewButtonActive: { backgroundColor: '#FFFFFF' },

  eventsList: { paddingHorizontal: 20 },
  eventCard: { marginBottom: 14 },
  eventCardInner: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#EFEFEF', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 4 },
  eventImage: { width: 110, height: 130, borderTopLeftRadius: 16, borderBottomLeftRadius: 16 },
  eventContent: { flex: 1, padding: 12, justifyContent: 'space-between' },
  eventHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  eventTitle: { flex: 1, fontSize: 15, fontWeight: '600', color: tokens.colors.text.primary, marginRight: 8 },
  priceBadge: { backgroundColor: '#E8F5E9', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  priceText: { fontSize: 11, fontWeight: '600', color: '#2E7D32' },
  registerBadge: { backgroundColor: tokens.colors.primary, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, marginLeft: 8 },
  registerText: { fontSize: 12, fontWeight: '700', color: '#FFFFFF' },
  eventMeta: { gap: 4, marginTop: 6 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { fontSize: 12, color: tokens.colors.text.secondary, fontWeight: '500' },
  metaTextLight: { fontSize: 12, color: tokens.colors.text.tertiary, flex: 1 },
  eventFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
  attendeesInfo: { flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 },
  avatarStack: { flexDirection: 'row' },
  miniAvatar: { width: 20, height: 20, borderRadius: 10, borderWidth: 1.5, borderColor: '#FFFFFF' },
  attendeesText: { fontSize: 11, color: tokens.colors.text.tertiary, fontWeight: '500' },

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
