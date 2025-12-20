import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Link, useRouter } from 'expo-router';

const USER = {
    name: 'Yash Sharma',
    email: 'yash@university.edu',
    department: 'Computer Science',
    year: 'Year 3',
    avatar: '👨‍🎓',
};

const STATS = [
    { label: 'Events', value: '12', icon: '🎫', color: '#7C3AED' },
    { label: 'Points', value: '850', icon: '⭐', color: '#F59E0B' },
    { label: 'Rank', value: '#7', icon: '🏆', color: '#10B981' },
];

const BADGES = [
    { id: '1', name: 'Early Adopter', icon: '🚀', rarity: 'Rare', color: '#3B82F6' },
    { id: '2', name: 'Hackathon Winner', icon: '💻', rarity: 'Epic', color: '#A855F7' },
    { id: '3', name: 'Social Butterfly', icon: '🦋', rarity: 'Uncommon', color: '#10B981' },
];

const MENU_ITEMS = [
    { id: '1', title: 'My Events', icon: 'calendar', route: '/(tabs)/tickets' },
    { id: '2', title: 'Achievements', icon: 'trophy', route: '/leaderboard/index' },
    { id: '3', title: 'Settings', icon: 'cog', route: '/auth/login' },
    { id: '4', title: 'Help & Support', icon: 'question-circle', route: null },
];

export default function ProfileScreen() {
    const router = useRouter();

    return (
        <View className="flex-1 bg-gray-50">
            <SafeAreaView className="flex-1">
                <ScrollView showsVerticalScrollIndicator={false}>
                    {/* Header */}
                    <View className="px-5 pt-4 pb-2 flex-row justify-between items-center">
                        <Text className="text-gray-900 text-2xl font-bold">Profile</Text>
                        <TouchableOpacity
                            onPress={() => router.push('/auth/login')}
                            className="w-10 h-10 bg-white rounded-full items-center justify-center shadow-sm border border-gray-100"
                        >
                            <FontAwesome name="cog" size={18} color="#6B7280" />
                        </TouchableOpacity>
                    </View>

                    {/* Profile Card */}
                    <View className="px-5 py-4">
                        <Card variant="elevated" className="items-center py-6">
                            <View className="w-20 h-20 bg-primary-100 rounded-full items-center justify-center mb-3 border-2 border-primary-500">
                                <Text className="text-4xl">{USER.avatar}</Text>
                            </View>
                            <Text className="text-gray-900 text-xl font-bold">{USER.name}</Text>
                            <Text className="text-gray-500 text-sm">{USER.department} • {USER.year}</Text>
                            <Text className="text-primary-500 text-sm mt-1">{USER.email}</Text>

                            <View className="flex-row mt-4 gap-3">
                                <Button title="Edit Profile" variant="outline" size="sm" />
                                <Button title="Share" variant="ghost" size="sm" />
                            </View>
                        </Card>
                    </View>

                    {/* Stats */}
                    <View className="px-5 py-2">
                        <View className="flex-row gap-3">
                            {STATS.map((stat) => (
                                <Card key={stat.label} variant="outlined" className="flex-1 items-center py-4">
                                    <Text className="text-2xl mb-1">{stat.icon}</Text>
                                    <Text style={{ color: stat.color }} className="font-bold text-xl">{stat.value}</Text>
                                    <Text className="text-gray-500 text-xs">{stat.label}</Text>
                                </Card>
                            ))}
                        </View>
                    </View>

                    {/* Badges */}
                    <View className="px-5 py-4">
                        <View className="flex-row justify-between items-center mb-3">
                            <Text className="text-gray-900 font-semibold">Badges</Text>
                            <Link href="/leaderboard/index" asChild>
                                <TouchableOpacity>
                                    <Text className="text-primary-500 text-sm">View all</Text>
                                </TouchableOpacity>
                            </Link>
                        </View>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            {BADGES.map((badge) => (
                                <View key={badge.id} className="mr-3 items-center">
                                    <View
                                        style={{ borderColor: badge.color }}
                                        className="w-16 h-16 bg-white rounded-2xl items-center justify-center border-2 shadow-sm mb-2"
                                    >
                                        <Text className="text-2xl">{badge.icon}</Text>
                                    </View>
                                    <Text className="text-gray-900 text-xs font-medium text-center" numberOfLines={1}>
                                        {badge.name}
                                    </Text>
                                    <Text style={{ color: badge.color }} className="text-[10px] font-bold">{badge.rarity}</Text>
                                </View>
                            ))}
                        </ScrollView>
                    </View>

                    {/* Menu */}
                    <View className="px-5 py-4 pb-24">
                        <Text className="text-gray-900 font-semibold mb-3">Quick Actions</Text>
                        <Card variant="outlined" className="p-0 overflow-hidden">
                            {MENU_ITEMS.map((item, index) => (
                                <TouchableOpacity
                                    key={item.id}
                                    onPress={() => item.route && router.push(item.route as any)}
                                    className={`flex-row items-center px-4 py-4 ${index < MENU_ITEMS.length - 1 ? 'border-b border-gray-100' : ''
                                        }`}
                                >
                                    <View className="w-10 h-10 bg-gray-100 rounded-lg items-center justify-center mr-3">
                                        <FontAwesome name={item.icon as any} size={18} color="#6B7280" />
                                    </View>
                                    <Text className="flex-1 text-gray-900 font-medium">{item.title}</Text>
                                    <FontAwesome name="chevron-right" size={14} color="#9CA3AF" />
                                </TouchableOpacity>
                            ))}
                        </Card>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}
