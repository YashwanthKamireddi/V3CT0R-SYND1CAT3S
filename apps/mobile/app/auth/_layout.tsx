// =============================================
// AUTH LAYOUT
// =============================================
// Stack navigator for authentication screens

import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="login" />
    </Stack>
  );
}
