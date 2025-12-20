import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useLocalSearchParams, Stack, useRouter, Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { EventCard } from '@/components/ui/EventCard';
import FontAwesome from '@expo/vector-icons/FontAwesome';

const ORG = {
    name: 'GDSC Campus',
    handle: '@gdsc_campus',
    description: 'Official Google Developer Student Club. We build cool stuff and host hackathons. Join us to learn Mobile, Web, and Cloud technologies.',
    avatar: '🚀',
    followers: '1.2k',
    rating: 4.8,
    eventsCount: 15,
    isFollowing: false,
};

const EVENTS = [
    {
        id: '1',
        title: 'Cloud Study Jam',
        date: 'Jan 20',
        time: '2:00 PM',
        location: 'Lab 3',
        category: 'Workshop',
        categoryColor: '#3B82F6',
        capacity: { current: 30, max: 40 },
        status: 'available' as const,
    },
    {
        id: '2',
        title: 'Flutter Bootcamp',
        date: 'Jan 25',
        time: '10:00 AM',
        location: 'Seminar Hall',
        category: 'Workshop',
        categoryColor: '#3B82F6',
        capacity: { current: 45, max: 50 },
        status: 'almostFull' as const,
    },
];

export default function OrganizationProfile() {
    const { id } = useLocalSearchParams();
    const router = useRouter();

    return (
        <View className="flex-1 bg-gray-50">
            <Stack.Screen options={{ headerShown: false }} />

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header Image */}
                <View className="h-32 bg-primary-500 relative">
                    <SafeAreaView className="absolute top-0 left-0 right-0 px-5 pt-2">
                        <View className="flex-row justify-between">
                            <TouchableOpacity
                                onPress={() => router.back()}
                                className="w-10 h-10 bg-white/20 rounded-full items-center justify-center"
                            >
                                <FontAwesome name="arrow-left" size={18} color="white" />
                            </TouchableOpacity>
                            <TouchableOpacity className="w-10 h-10 bg-white/20 rounded-full items-center justify-center">
                                <FontAwesome name="ellipsis-h" size={18} color="white" />
                            </TouchableOpacity>
                        </View>
                    </SafeAreaView>
                </View>

                {/* Profile Info */}
                <View className="px-5 -mt-10">
                    <View className="flex-row justify-between items-end mb-4">
                        <View className="w-20 h-20 bg-white rounded-2xl items-center justify-center shadow-lg border-4 border-white">
                            <Text className="text-4xl">{ORG.avatar}</Text>
                        </View>
                        <Button title="Follow" variant="primary" size="sm" />
                    </View>

                    <Text className="text-gray-900 text-xl font-bold">{ORG.name}</Text>
                    <Text className="text-gray-500 text-sm mb-3">{ORG.handle}</Text>
                    <Text className="text-gray-600 leading-5 mb-4">{ORG.description}</Text>

                    {/* Stats */}
                    <View className="flex-row gap-4 mb-6">
                        <View className="flex-row items-center">
                            <FontAwesome name="users" size={14} color="#6B7280" />
                            <Text className="text-gray-600 ml-2">{ORG.followers} followers</Text>
                        </View>
                        <View className="flex-row items-center">
                            <FontAwesome name="star" size={14} color="#F59E0B" />
                            <Text className="text-gray-600 ml-2">{ORG.rating} rating</Text>
                        </View>
                        <View className="flex-row items-center">
                            <FontAwesome name="calendar" size={14} color="#6B7280" />
                            <Text className="text-gray-600 ml-2">{ORG.eventsCount} events</Text>
                        </View>
                    </View>
                </View>

                {/* Tabs */}
                <View className="flex-row border-b border-gray-200 px-5">
                    <TouchableOpacity className="py-3 mr-6 border-b-2 border-primary-500">
                        <Text className="text-primary-500 font-semibold">Events</Text>
                    </TouchableOpacity>
                    <TouchableOpacity className="py-3 mr-6">
                        <Text className="text-gray-500">About</Text>
                    </TouchableOpacity>
                    <TouchableOpacity className="py-3">
                        <Text className="text-gray-500">Reviews</Text>
                    </TouchableOpacity>
                </View>

                {/* Events */}
                <View className="px-5 py-4 pb-24">
                    <Text className="text-gray-900 font-semibold mb-3">Upcoming Events</Text>
                    <View className="gap-4">
                        {EVENTS.map((event) => (
                            <Link key={event.id} href={{ pathname: '/event/[id]', params: { id: event.id } }} asChild>
                                <TouchableOpacity>
                                    <EventCard {...event} variant="compact" />
                                </TouchableOpacity>
                            </Link>
                        ))}
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}
