import { View, Text, ScrollView, Image, TouchableOpacity, Dimensions } from 'react-native';
import { useLocalSearchParams, Stack, useRouter, Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import FontAwesome from '@expo/vector-icons/FontAwesome';

const { width } = Dimensions.get('window');

const EVENT = {
    title: 'Campus Hackathon 2025',
    subtitle: 'Build the future in 24 hours',
    description: 'Join us for the ultimate campus hackathon experience. 24 hours of coding, collaboration, and creativity. Build innovative solutions with 500+ developers from across the country.\n\nPrizes worth $10,000 up for grabs!\n\n• Free meals & snacks\n• Mentorship sessions\n• Networking opportunities\n• Swag & goodies',
    date: 'January 15, 2025',
    time: '9:00 AM - 9:00 PM',
    location: 'Main Auditorium, North Campus',
    category: 'Technology',
    categoryColor: '#7C3AED',
    points: 100,
    capacity: { current: 156, max: 200 },
    price: 'Free',
    organizer: {
        name: 'GDSC Campus',
        followers: '1.2k',
        avatar: '🚀',
    },
    imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
};

export default function EventDetails() {
    const { id } = useLocalSearchParams();
    const router = useRouter();

    const capacityPercentage = (EVENT.capacity.current / EVENT.capacity.max) * 100;

    return (
        <View className="flex-1 bg-gray-50">
            <Stack.Screen options={{ headerShown: false }} />

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Hero Image */}
                <View className="h-64 w-full bg-gray-200 relative">
                    <Image source={{ uri: EVENT.imageUrl }} className="w-full h-full" />

                    {/* Overlay */}
                    <View className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

                    {/* Top Bar */}
                    <SafeAreaView className="absolute top-0 left-0 right-0 px-5 pt-2">
                        <View className="flex-row justify-between">
                            <TouchableOpacity
                                onPress={() => router.back()}
                                className="w-10 h-10 bg-white/90 rounded-full items-center justify-center shadow-sm"
                            >
                                <FontAwesome name="arrow-left" size={18} color="#111827" />
                            </TouchableOpacity>
                            <View className="flex-row gap-2">
                                <TouchableOpacity className="w-10 h-10 bg-white/90 rounded-full items-center justify-center shadow-sm">
                                    <FontAwesome name="heart-o" size={18} color="#111827" />
                                </TouchableOpacity>
                                <TouchableOpacity className="w-10 h-10 bg-white/90 rounded-full items-center justify-center shadow-sm">
                                    <FontAwesome name="share-alt" size={18} color="#111827" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </SafeAreaView>
                </View>

                {/* Content */}
                <View className="px-5 py-5 -mt-6 bg-gray-50 rounded-t-3xl">
                    {/* Category & Points */}
                    <View className="flex-row items-center mb-3">
                        <View style={{ backgroundColor: EVENT.categoryColor + '20' }} className="px-3 py-1 rounded-full mr-2">
                            <Text style={{ color: EVENT.categoryColor }} className="text-sm font-medium">{EVENT.category}</Text>
                        </View>
                        <View className="flex-row items-center">
                            <FontAwesome name="star" size={14} color="#F59E0B" />
                            <Text className="text-warning text-sm font-medium ml-1">{EVENT.points} pts</Text>
                        </View>
                    </View>

                    {/* Title */}
                    <Text className="text-gray-900 text-2xl font-bold mb-2">{EVENT.title}</Text>
                    <Text className="text-gray-500 text-base mb-4">{EVENT.subtitle}</Text>

                    {/* Info Cards */}
                    <View className="gap-3 mb-4">
                        <Card variant="outlined" className="flex-row items-center p-3">
                            <View className="w-10 h-10 bg-primary-50 rounded-lg items-center justify-center mr-3">
                                <FontAwesome name="calendar" size={18} color="#7C3AED" />
                            </View>
                            <View>
                                <Text className="text-gray-900 font-medium">{EVENT.date}</Text>
                                <Text className="text-gray-500 text-sm">{EVENT.time}</Text>
                            </View>
                        </Card>

                        <Card variant="outlined" className="flex-row items-center p-3">
                            <View className="w-10 h-10 bg-error/10 rounded-lg items-center justify-center mr-3">
                                <FontAwesome name="map-marker" size={18} color="#EF4444" />
                            </View>
                            <View className="flex-1">
                                <Text className="text-gray-900 font-medium">{EVENT.location}</Text>
                                <Text className="text-primary-500 text-sm">View on map</Text>
                            </View>
                        </Card>

                        <Card variant="outlined" className="flex-row items-center p-3">
                            <View className="w-10 h-10 bg-success/10 rounded-lg items-center justify-center mr-3">
                                <FontAwesome name="users" size={18} color="#10B981" />
                            </View>
                            <View className="flex-1">
                                <Text className="text-gray-900 font-medium">{EVENT.capacity.current}/{EVENT.capacity.max} registered</Text>
                                <View className="h-1.5 bg-gray-200 rounded-full mt-1 overflow-hidden">
                                    <View
                                        style={{ width: `${capacityPercentage}%` }}
                                        className={`h-full rounded-full ${capacityPercentage > 80 ? 'bg-warning' : 'bg-success'}`}
                                    />
                                </View>
                            </View>
                        </Card>
                    </View>

                    {/* Organizer */}
                    <Link href={{ pathname: '/organization/[id]', params: { id: '1' } }} asChild>
                        <TouchableOpacity className="flex-row items-center justify-between py-4 border-t border-b border-gray-200 mb-4">
                            <View className="flex-row items-center">
                                <View className="w-12 h-12 bg-primary-100 rounded-full items-center justify-center mr-3">
                                    <Text className="text-2xl">{EVENT.organizer.avatar}</Text>
                                </View>
                                <View>
                                    <Text className="text-gray-900 font-semibold">{EVENT.organizer.name}</Text>
                                    <Text className="text-gray-500 text-sm">{EVENT.organizer.followers} followers</Text>
                                </View>
                            </View>
                            <FontAwesome name="chevron-right" size={14} color="#9CA3AF" />
                        </TouchableOpacity>
                    </Link>

                    {/* Description */}
                    <Text className="text-gray-900 font-semibold text-lg mb-2">About Event</Text>
                    <Text className="text-gray-600 leading-6 mb-24">{EVENT.description}</Text>
                </View>
            </ScrollView>

            {/* Bottom CTA */}
            <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-5 py-4 pb-8">
                <View className="flex-row items-center">
                    <View className="flex-1">
                        <Text className="text-gray-400 text-xs uppercase">Price</Text>
                        <Text className="text-gray-900 text-2xl font-bold">{EVENT.price}</Text>
                    </View>
                    <Button title="Register Now" size="lg" className="flex-[2]" />
                </View>
            </View>
        </View>
    );
}
