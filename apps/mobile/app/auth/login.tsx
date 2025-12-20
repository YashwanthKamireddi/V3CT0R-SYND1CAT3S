import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/Button';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useState } from 'react';

export default function LoginScreen() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = () => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            router.replace('/onboarding/interests');
        }, 1000);
    };

    return (
        <View className="flex-1 bg-white">
            <Stack.Screen options={{ headerShown: false }} />

            <SafeAreaView className="flex-1">
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 px-6 justify-center">
                    {/* Logo */}
                    <View className="items-center mb-8">
                        <View className="w-16 h-16 bg-primary-500 rounded-2xl items-center justify-center mb-4">
                            <Text className="text-white text-3xl">📍</Text>
                        </View>
                        <Text className="text-gray-900 text-3xl font-bold">CampusPulse</Text>
                        <Text className="text-gray-500 text-base mt-1">Your campus event companion</Text>
                    </View>

                    {/* Form */}
                    <View className="gap-4 mb-6">
                        <View>
                            <Text className="text-gray-700 font-medium mb-2">Email</Text>
                            <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                                <FontAwesome name="envelope-o" size={18} color="#9CA3AF" />
                                <TextInput
                                    placeholder="student@university.edu"
                                    placeholderTextColor="#9CA3AF"
                                    value={email}
                                    onChangeText={setEmail}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    className="flex-1 ml-3 text-gray-900 text-base"
                                />
                            </View>
                        </View>

                        <View>
                            <Text className="text-gray-700 font-medium mb-2">Password</Text>
                            <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                                <FontAwesome name="lock" size={18} color="#9CA3AF" />
                                <TextInput
                                    placeholder="••••••••"
                                    placeholderTextColor="#9CA3AF"
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry
                                    className="flex-1 ml-3 text-gray-900 text-base"
                                />
                            </View>
                        </View>

                        <TouchableOpacity className="self-end">
                            <Text className="text-primary-500 text-sm font-medium">Forgot Password?</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Buttons */}
                    <View className="gap-3">
                        <Button title="Sign In" size="lg" onPress={handleLogin} loading={loading} />

                        <View className="flex-row items-center my-4">
                            <View className="flex-1 h-px bg-gray-200" />
                            <Text className="text-gray-400 mx-4">or continue with</Text>
                            <View className="flex-1 h-px bg-gray-200" />
                        </View>

                        <TouchableOpacity className="flex-row items-center justify-center bg-gray-50 border border-gray-200 rounded-xl py-3">
                            <Text className="text-xl mr-2">🔑</Text>
                            <Text className="text-gray-900 font-medium">Sign in with Google</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Footer */}
                    <View className="flex-row justify-center mt-8">
                        <Text className="text-gray-500">Don't have an account? </Text>
                        <TouchableOpacity>
                            <Text className="text-primary-500 font-semibold">Sign Up</Text>
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </View>
    );
}
