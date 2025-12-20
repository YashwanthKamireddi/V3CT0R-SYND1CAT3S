import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '@/components/ui/Card';
import FontAwesome from '@expo/vector-icons/FontAwesome';

const NOTIFICATIONS = [
    { id: '1', title: 'Registration Confirmed', message: 'You are registered for Campus Hackathon 2025.', icon: 'check-circle', color: '#10B981', time: '2m ago', unread: true },
    { id: '2', title: 'Event Starting Soon', message: 'AI Workshop starts in 30 minutes!', icon: 'clock-o', color: '#F59E0B', time: '30m ago', unread: true },
    { id: '3', title: 'New Event Alert', message: 'GDSC just posted "Cloud Study Jam".', icon: 'bell', color: '#7C3AED', time: '2h ago', unread: false },
    { id: '4', title: 'Points Earned', message: '+50 points for attending Music Fest.', icon: 'star', color: '#F59E0B', time: '1d ago', unread: false },
    { id: '5', title: 'Badge Unlocked', message: 'You earned "Early Adopter" badge!', icon: 'trophy', color: '#3B82F6', time: '2d ago', unread: false },
];

export default function NotificationsScreen() {
    const router = useRouter();

    return (
        <View className="flex-1 bg-gray-50">
            <Stack.Screen options={{ headerShown: false }} />

            <SafeAreaView className="flex-1">
                {/* Header */}
                <View className="px-5 pt-4 pb-2 flex-row items-center justify-between border-b border-gray-100">
                    <View className="flex-row items-center">
                        <TouchableOpacity onPress={() => router.back()} className="mr-4">
                            <FontAwesome name="arrow-left" size={20} color="#111827" />
                        </TouchableOpacity>
                        <Text className="text-gray-900 text-xl font-bold">Notifications</Text>
                    </View>
                    <TouchableOpacity>
                        <Text className="text-primary-500 text-sm font-medium">Mark all read</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
                    <View className="px-5 py-4 gap-3">
                        {NOTIFICATIONS.map((item) => (
                            <Card
                                key={item.id}
                                variant={item.unread ? 'elevated' : 'outlined'}
                                className={`flex-row p-3 ${item.unread ? 'bg-primary-50/50' : ''}`}
                            >
                                <View
                                    style={{ backgroundColor: item.color + '15' }}
                                    className="w-10 h-10 rounded-full items-center justify-center mr-3"
                                >
                                    <FontAwesome name={item.icon as any} size={18} color={item.color} />
                                </View>
                                <View className="flex-1">
                                    <View className="flex-row justify-between items-start mb-1">
                                        <Text className="text-gray-900 font-semibold flex-1" numberOfLines={1}>{item.title}</Text>
                                        <Text className="text-gray-400 text-xs ml-2">{item.time}</Text>
                                    </View>
                                    <Text className="text-gray-500 text-sm" numberOfLines={2}>{item.message}</Text>
                                </View>
                                {item.unread && (
                                    <View className="absolute top-3 right-3 w-2 h-2 bg-primary-500 rounded-full" />
                                )}
                            </Card>
                        ))}
                    </View>

                    <View className="items-center py-8">
                        <Text className="text-gray-400 text-sm">You're all caught up! 🎉</Text>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}
