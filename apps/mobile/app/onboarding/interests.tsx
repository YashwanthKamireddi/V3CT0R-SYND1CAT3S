import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/Button';
import { useState } from 'react';

const INTERESTS = [
    { id: '1', name: 'Technology', icon: '💻' },
    { id: '2', name: 'Music', icon: '🎵' },
    { id: '3', name: 'Sports', icon: '⚽' },
    { id: '4', name: 'Art & Design', icon: '🎨' },
    { id: '5', name: 'Food & Drinks', icon: '🍔' },
    { id: '6', name: 'Photography', icon: '📸' },
    { id: '7', name: 'Gaming', icon: '🎮' },
    { id: '8', name: 'Dance', icon: '💃' },
    { id: '9', name: 'Theater', icon: '🎭' },
    { id: '10', name: 'Literature', icon: '📚' },
    { id: '11', name: 'Entrepreneurship', icon: '🚀' },
    { id: '12', name: 'AI/ML', icon: '🤖' },
];

export default function InterestsScreen() {
    const router = useRouter();
    const [selected, setSelected] = useState<string[]>([]);

    const toggleSelection = (id: string) => {
        if (selected.includes(id)) {
            setSelected(selected.filter(i => i !== id));
        } else {
            setSelected([...selected, id]);
        }
    };

    const handleContinue = () => {
        router.replace('/(tabs)');
    };

    return (
        <View className="flex-1 bg-white">
            <SafeAreaView className="flex-1">
                {/* Header */}
                <View className="px-6 pt-8 pb-4">
                    <View className="flex-row items-center mb-2">
                        {[1, 2].map((step) => (
                            <View key={step} className="flex-row items-center">
                                <View className={`w-8 h-8 rounded-full items-center justify-center ${step === 1 ? 'bg-primary-500' : 'bg-gray-200'}`}>
                                    <Text className={step === 1 ? 'text-white font-bold' : 'text-gray-500 font-bold'}>{step}</Text>
                                </View>
                                {step < 2 && <View className="w-8 h-0.5 bg-gray-200" />}
                            </View>
                        ))}
                    </View>
                    <Text className="text-gray-900 text-2xl font-bold mt-4">What interests you?</Text>
                    <Text className="text-gray-500 text-base mt-1">Select at least 3 topics to personalize your experience</Text>
                </View>

                {/* Interests Grid */}
                <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
                    <View className="flex-row flex-wrap gap-3 pb-24">
                        {INTERESTS.map((interest) => {
                            const isSelected = selected.includes(interest.id);
                            return (
                                <TouchableOpacity
                                    key={interest.id}
                                    onPress={() => toggleSelection(interest.id)}
                                    className={`px-4 py-3 rounded-xl flex-row items-center border-2 ${isSelected
                                            ? 'bg-primary-50 border-primary-500'
                                            : 'bg-gray-50 border-transparent'
                                        }`}
                                >
                                    <Text className="text-lg mr-2">{interest.icon}</Text>
                                    <Text className={isSelected ? 'text-primary-500 font-medium' : 'text-gray-700'}>
                                        {interest.name}
                                    </Text>
                                    {isSelected && (
                                        <View className="ml-2 w-5 h-5 bg-primary-500 rounded-full items-center justify-center">
                                            <Text className="text-white text-xs">✓</Text>
                                        </View>
                                    )}
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </ScrollView>

                {/* Bottom CTA */}
                <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-4 pb-8">
                    <View className="flex-row items-center justify-between mb-3">
                        <Text className="text-gray-500">{selected.length} selected</Text>
                        <Text className="text-gray-400 text-sm">Min. 3 required</Text>
                    </View>
                    <Button
                        title="Continue"
                        size="lg"
                        onPress={handleContinue}
                        disabled={selected.length < 1}
                    />
                </View>
            </SafeAreaView>
        </View>
    );
}
