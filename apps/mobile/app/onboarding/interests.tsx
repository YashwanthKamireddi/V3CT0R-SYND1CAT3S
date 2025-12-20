/**
 * Interests Selection Screen
 * Onboarding step to personalize user experience
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router, Stack } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import Animated, {
  FadeInDown,
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  ZoomIn,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { tokens, normalize, scale } from '../../lib/styles/unified';

// Interest Data
interface Interest {
  id: string;
  name: string;
  icon: string;
  color: string;
}

const INTERESTS: Interest[] = [
  { id: '1', name: 'Technology', icon: '💻', color: '#3B82F6' },
  { id: '2', name: 'Music', icon: '🎵', color: '#8B5CF6' },
  { id: '3', name: 'Sports', icon: '⚽', color: '#10B981' },
  { id: '4', name: 'Art & Design', icon: '🎨', color: '#F59E0B' },
  { id: '5', name: 'Food & Drinks', icon: '🍔', color: '#EF4444' },
  { id: '6', name: 'Photography', icon: '📸', color: '#EC4899' },
  { id: '7', name: 'Gaming', icon: '🎮', color: '#6366F1' },
  { id: '8', name: 'Dance', icon: '💃', color: '#F43F5E' },
  { id: '9', name: 'Theater', icon: '🎭', color: '#A855F7' },
  { id: '10', name: 'Literature', icon: '📚', color: '#14B8A6' },
  { id: '11', name: 'Entrepreneurship', icon: '🚀', color: '#FF6B35' },
  { id: '12', name: 'AI/ML', icon: '🤖', color: '#0EA5E9' },
  { id: '13', name: 'Fitness', icon: '💪', color: '#22C55E' },
  { id: '14', name: 'Travel', icon: '✈️', color: '#06B6D4' },
  { id: '15', name: 'Science', icon: '🔬', color: '#84CC16' },
  { id: '16', name: 'Fashion', icon: '👗', color: '#D946EF' },
];

// Interest Chip Component
function InterestChip({
  interest,
  isSelected,
  onPress,
  index,
}: {
  interest: Interest;
  isSelected: boolean;
  onPress: () => void;
  index: number;
}) {
  const chipScale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: chipScale.value }],
  }));

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    chipScale.value = withSpring(0.9, {}, () => {
      chipScale.value = withSpring(1);
    });
    onPress();
  };

  return (
    <Animated.View
      entering={FadeInDown.delay(50 + index * 30).duration(400)}
    >
      <Pressable onPress={handlePress}>
        <Animated.View
          style={[
            styles.interestChip,
            isSelected && {
              backgroundColor: `${interest.color}15`,
              borderColor: interest.color,
            },
            animatedStyle,
          ]}
        >
          <Text style={styles.interestIcon}>{interest.icon}</Text>
          <Text
            style={[
              styles.interestName,
              isSelected && { color: interest.color, fontWeight: '700' },
            ]}
          >
            {interest.name}
          </Text>
          {isSelected && (
            <Animated.View
              entering={ZoomIn.duration(200)}
              style={[styles.checkBadge, { backgroundColor: interest.color }]}
            >
              <Feather name="check" size={12} color={tokens.colors.white} />
            </Animated.View>
          )}
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

export default function InterestsScreen() {
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState<string[]>([]);

  const buttonScale = useSharedValue(1);

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const toggleSelection = (id: string) => {
    if (selected.includes(id)) {
      setSelected(selected.filter((i) => i !== id));
    } else {
      setSelected([...selected, id]);
    }
  };

  const handleContinue = () => {
    if (selected.length >= 3) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace('/(tabs)');
    }
  };

  const canContinue = selected.length >= 3;

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + scale(16) }]}>
        {/* Progress Steps */}
        <Animated.View
          entering={FadeInDown.delay(100).duration(400)}
          style={styles.progressContainer}
        >
          {[1, 2, 3].map((step, index) => (
            <View key={step} style={styles.progressStep}>
              <View
                style={[
                  styles.progressDot,
                  step <= 2 && styles.progressDotActive,
                  step === 2 && styles.progressDotCurrent,
                ]}
              >
                {step < 2 ? (
                  <Feather name="check" size={14} color={tokens.colors.white} />
                ) : (
                  <Text
                    style={[
                      styles.progressNumber,
                      step <= 2 && styles.progressNumberActive,
                    ]}
                  >
                    {step}
                  </Text>
                )}
              </View>
              {index < 2 && (
                <View
                  style={[
                    styles.progressLine,
                    step < 2 && styles.progressLineActive,
                  ]}
                />
              )}
            </View>
          ))}
        </Animated.View>

        {/* Title */}
        <Animated.View
          entering={FadeInDown.delay(200).duration(400)}
          style={styles.titleContainer}
        >
          <Text style={styles.title}>What interests you?</Text>
          <Text style={styles.subtitle}>
            Select at least 3 topics to personalize your campus experience
          </Text>
        </Animated.View>
      </View>

      {/* Interests Grid */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + scale(120) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.interestsGrid}>
          {INTERESTS.map((interest, index) => (
            <InterestChip
              key={interest.id}
              interest={interest}
              isSelected={selected.includes(interest.id)}
              onPress={() => toggleSelection(interest.id)}
              index={index}
            />
          ))}
        </View>
      </ScrollView>

      {/* Bottom CTA */}
      <LinearGradient
        colors={['transparent', tokens.colors.white, tokens.colors.white]}
        style={[styles.bottomContainer, { paddingBottom: insets.bottom + scale(16) }]}
      >
        {/* Selection Counter */}
        <View style={styles.counterContainer}>
          <View style={styles.counterLeft}>
            <View style={styles.counterBadge}>
              <Text style={styles.counterNumber}>{selected.length}</Text>
            </View>
            <Text style={styles.counterText}>selected</Text>
          </View>
          <Text style={styles.counterHint}>
            {selected.length < 3 ? `${3 - selected.length} more needed` : 'Ready to continue!'}
          </Text>
        </View>

        {/* Continue Button */}
        <Pressable
          onPressIn={() => {
            buttonScale.value = withTiming(0.95, { duration: 100 });
          }}
          onPressOut={() => {
            buttonScale.value = withTiming(1, { duration: 150 });
          }}
          onPress={handleContinue}
          disabled={!canContinue}
        >
          <Animated.View
            style={[
              styles.continueButton,
              buttonAnimatedStyle,
              !canContinue && styles.continueButtonDisabled,
            ]}
          >
            <Text style={styles.continueButtonText}>Continue</Text>
            <Feather name="arrow-right" size={20} color={tokens.colors.white} />
          </Animated.View>
        </Pressable>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.colors.white,
  },
  header: {
    paddingHorizontal: scale(24),
    paddingBottom: scale(16),
    backgroundColor: tokens.colors.white,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: scale(24),
  },
  progressStep: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressDot: {
    width: scale(32),
    height: scale(32),
    borderRadius: scale(16),
    backgroundColor: tokens.colors.border.light,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressDotActive: {
    backgroundColor: tokens.colors.primary,
  },
  progressDotCurrent: {
    backgroundColor: tokens.colors.primary,
    shadowColor: tokens.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  progressNumber: {
    fontSize: normalize(14),
    fontWeight: '700',
    color: tokens.colors.text.tertiary,
  },
  progressNumberActive: {
    color: tokens.colors.white,
  },
  progressLine: {
    width: scale(40),
    height: scale(3),
    backgroundColor: tokens.colors.border.light,
    marginHorizontal: scale(8),
    borderRadius: scale(1.5),
  },
  progressLineActive: {
    backgroundColor: tokens.colors.primary,
  },
  titleContainer: {
    marginTop: scale(8),
  },
  title: {
    fontSize: normalize(28),
    fontWeight: '800',
    color: tokens.colors.text.primary,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: normalize(15),
    color: tokens.colors.text.secondary,
    marginTop: scale(8),
    lineHeight: normalize(22),
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: scale(24),
    paddingTop: scale(8),
  },
  interestsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: scale(12),
  },
  interestChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(16),
    paddingVertical: scale(12),
    backgroundColor: tokens.colors.background.tertiary,
    borderRadius: scale(14),
    borderWidth: 2,
    borderColor: 'transparent',
  },
  interestIcon: {
    fontSize: normalize(18),
    marginRight: scale(8),
  },
  interestName: {
    fontSize: normalize(14),
    fontWeight: '600',
    color: tokens.colors.text.primary,
    letterSpacing: -0.2,
  },
  checkBadge: {
    width: scale(20),
    height: scale(20),
    borderRadius: scale(10),
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: scale(8),
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: scale(24),
    paddingTop: scale(32),
  },
  counterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: scale(16),
  },
  counterLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(8),
  },
  counterBadge: {
    backgroundColor: tokens.colors.primaryLight,
    paddingHorizontal: scale(12),
    paddingVertical: scale(4),
    borderRadius: scale(12),
  },
  counterNumber: {
    fontSize: normalize(16),
    fontWeight: '700',
    color: tokens.colors.primary,
  },
  counterText: {
    fontSize: normalize(14),
    color: tokens.colors.text.secondary,
  },
  counterHint: {
    fontSize: normalize(13),
    color: tokens.colors.text.tertiary,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: tokens.colors.primary,
    paddingVertical: scale(16),
    borderRadius: scale(14),
    gap: scale(8),
    shadowColor: tokens.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  continueButtonDisabled: {
    backgroundColor: tokens.colors.text.disabled,
    shadowOpacity: 0,
  },
  continueButtonText: {
    fontSize: normalize(16),
    fontWeight: '700',
    color: tokens.colors.white,
    letterSpacing: -0.2,
  },
});
