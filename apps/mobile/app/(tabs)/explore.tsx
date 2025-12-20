import { View, Text, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EventCard } from '@/components/ui/EventCard';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useState } from 'react';
import { Link } from 'expo-router';

const FILTERS = ['All', 'Today', 'This Week', 'Free', 'Paid'];
const TAGS = ['#hackathon', '#workshop', '#music', '#sports', '#food', '#networking'];

const EVENTS = [
  {
    id: '1',
    title: 'Design Thinking Workshop',
    subtitle: 'Learn UX fundamentals',
    date: 'Dec 26',
    time: '2:00 PM',
    location: 'Design Lab',
    category: 'Workshop',
    categoryColor: '#EC4899',
    points: 40,
    capacity: { current: 25, max: 30 },
    status: 'available' as const,
  },
  {
    id: '2',
    title: 'Startup Pitch Day',
    subtitle: 'Present your ideas to investors',
    date: 'Dec 30',
    time: '10:00 AM',
    location: 'Incubation Center',
    category: 'Entrepreneurship',
    categoryColor: '#F59E0B',
    points: 80,
    capacity: { current: 12, max: 20 },
    status: 'available' as const,
  },
  {
    id: '3',
    title: 'Photography Walk',
    subtitle: 'Campus photo tour',
    date: 'Jan 2',
    time: '5:00 PM',
    location: 'Main Gate',
    category: 'Art',
    categoryColor: '#10B981',
    points: 25,
    capacity: { current: 18, max: 25 },
    status: 'almostFull' as const,
  },
];

export default function ExploreScreen() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <View className="flex-1 bg-gray-50">
      <SafeAreaView className="flex-1">
        {/* Header */}
        <View className="px-5 pt-4 pb-2">
          <Text className="text-gray-900 text-2xl font-bold">Explore</Text>
          <Text className="text-gray-500 text-sm">Find events that match your interests</Text>
        </View>

        {/* Search */}
        <View className="px-5 py-3">
          <View className="flex-row items-center bg-white rounded-xl px-4 py-3 border border-gray-200 shadow-sm">
            <FontAwesome name="search" size={16} color="#9CA3AF" />
            <TextInput
              placeholder="Search events, clubs, categories..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
              className="flex-1 ml-3 text-gray-900 text-base"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <FontAwesome name="times-circle" size={16} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Filters */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-5 py-2">
            {FILTERS.map((filter) => (
              <TouchableOpacity
                key={filter}
                onPress={() => setActiveFilter(filter)}
                className={`mr-2 px-4 py-2 rounded-full ${activeFilter === filter
                    ? 'bg-primary-500'
                    : 'bg-white border border-gray-200'
                  }`}
              >
                <Text className={activeFilter === filter ? 'text-white font-medium' : 'text-gray-600'}>
                  {filter}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Trending Tags */}
          <View className="px-5 py-3">
            <Text className="text-gray-900 font-semibold mb-2">Trending</Text>
            <View className="flex-row flex-wrap gap-2">
              {TAGS.map((tag) => (
                <TouchableOpacity key={tag} className="bg-primary-50 px-3 py-1.5 rounded-full">
                  <Text className="text-primary-500 text-sm font-medium">{tag}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Results */}
          <View className="px-5 py-4">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-gray-900 text-lg font-bold">Recommended</Text>
              <View className="flex-row items-center">
                <FontAwesome name="sort-amount-desc" size={14} color="#6B7280" />
                <Text className="text-gray-500 text-sm ml-2">Sort</Text>
              </View>
            </View>

            <View className="gap-4 pb-24">
              {EVENTS.map((event) => (
                <Link key={event.id} href={{ pathname: '/event/[id]', params: { id: event.id } }} asChild>
                  <TouchableOpacity>
                    <EventCard {...event} />
                  </TouchableOpacity>
                </Link>
              ))}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
