import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '@/components/ui/Card';
import FontAwesome from '@expo/vector-icons/FontAwesome';

const LEADERS = [
    { rank: 1, name: 'Sarah Johnson', points: 2400, avatar: '👩‍🎤', badge: '🥇' },
    { rank: 2, name: 'Mike Thompson', points: 2150, avatar: '👨‍💻', badge: '🥈' },
    { rank: 3, name: 'Amy Roberts', points: 1900, avatar: '👩‍🎨', badge: '🥉' },
    { rank: 4, name: 'David Kim', points: 1750, avatar: '🧔' },
    { rank: 5, name: 'Lisa Martinez', points: 1600, avatar: '👱‍♀️' },
    { rank: 6, name: 'Tom Harris', points: 1450, avatar: '👨‍🦱' },
    { rank: 7, name: 'You', points: 850, avatar: '😎', isUser: true },
    { rank: 8, name: 'Jessie Chen', points: 800, avatar: '👩' },
    { rank: 9, name: 'Ryan Lee', points: 750, avatar: '👨' },
    { rank: 10, name: 'Kevin Wu', points: 700, avatar: '🧑' },
];

export default function LeaderboardScreen() {
    const router = useRouter();
    const top3 = LEADERS.slice(0, 3);
    const rest = LEADERS.slice(3);

    return (
        <View className="flex-1 bg-gray-50">
            <Stack.Screen options={{ headerShown: false }} />

            <SafeAreaView className="flex-1">
                {/* Header */}
                <View className="px-5 pt-4 pb-2 flex-row items-center">
                    <TouchableOpacity onPress={() => router.back()} className="mr-4">
                        <FontAwesome name="arrow-left" size={20} color="#111827" />
                    </TouchableOpacity>
                    <Text className="text-gray-900 text-xl font-bold">Leaderboard</Text>
                </View>

                <ScrollView showsVerticalScrollIndicator={false}>
                    {/* Podium */}
                    <View className="px-5 py-6">
                        <View className="flex-row justify-center items-end gap-4">
                            {/* 2nd Place */}
                            <View className="items-center">
                                <Text className="text-3xl mb-2">{top3[1].avatar}</Text>
                                <Text className="text-gray-900 font-semibold text-sm">{top3[1].name.split(' ')[0]}</Text>
                                <Text className="text-primary-500 font-bold">{top3[1].points}</Text>
                                <View className="bg-gray-200 w-20 h-20 rounded-t-xl mt-2 items-center justify-center">
                                    <Text className="text-3xl">{top3[1].badge}</Text>
                                </View>
                            </View>

                            {/* 1st Place */}
                            <View className="items-center">
                                <Text className="text-4xl mb-2">{top3[0].avatar}</Text>
                                <Text className="text-gray-900 font-bold">{top3[0].name.split(' ')[0]}</Text>
                                <Text className="text-primary-500 font-bold text-lg">{top3[0].points}</Text>
                                <View className="bg-primary-500 w-24 h-28 rounded-t-xl mt-2 items-center justify-center">
                                    <Text className="text-4xl">{top3[0].badge}</Text>
                                </View>
                            </View>

                            {/* 3rd Place */}
                            <View className="items-center">
                                <Text className="text-3xl mb-2">{top3[2].avatar}</Text>
                                <Text className="text-gray-900 font-semibold text-sm">{top3[2].name.split(' ')[0]}</Text>
                                <Text className="text-primary-500 font-bold">{top3[2].points}</Text>
                                <View className="bg-warning/20 w-20 h-16 rounded-t-xl mt-2 items-center justify-center">
                                    <Text className="text-3xl">{top3[2].badge}</Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Rankings List */}
                    <View className="px-5 pb-24">
                        <View className="gap-3">
                            {rest.map((user) => (
                                <Card
                                    key={user.rank}
                                    variant={user.isUser ? 'elevated' : 'outlined'}
                                    className={`flex-row items-center p-3 ${user.isUser ? 'border-2 border-primary-500' : ''}`}
                                >
                                    <Text className="w-8 text-gray-500 font-bold text-lg">{user.rank}</Text>
                                    <Text className="text-2xl mr-3">{user.avatar}</Text>
                                    <View className="flex-1">
                                        <Text className={`font-semibold ${user.isUser ? 'text-primary-500' : 'text-gray-900'}`}>
                                            {user.name}
                                        </Text>
                                        {user.isUser && <Text className="text-primary-500 text-xs">That's you!</Text>}
                                    </View>
                                    <View className="bg-primary-50 px-3 py-1 rounded-full">
                                        <Text className="text-primary-500 font-bold">{user.points}</Text>
                                    </View>
                                </Card>
                            ))}
                        </View>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}
