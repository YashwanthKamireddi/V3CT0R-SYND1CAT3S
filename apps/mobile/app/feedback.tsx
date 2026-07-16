/**
 * Feedback Screen
 * Send feedback, report bugs, and suggest features
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router, Stack } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import Animated, {
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { tokens, normalize, scale } from '../lib/styles/unified';

// Feedback Categories
interface FeedbackCategory {
  id: string;
  title: string;
  icon: keyof typeof Feather.glyphMap;
  description: string;
}

const CATEGORIES: FeedbackCategory[] = [
  {
    id: 'bug',
    title: 'Report a Bug',
    icon: 'alert-circle',
    description: 'Something not working?',
  },
  {
    id: 'feature',
    title: 'Feature Request',
    icon: 'star',
    description: 'Suggest new features',
  },
  {
    id: 'improvement',
    title: 'Improvement',
    icon: 'trending-up',
    description: 'Make something better',
  },
  {
    id: 'other',
    title: 'Other',
    icon: 'message-circle',
    description: 'General feedback',
  },
];

// Category Card Component
function CategoryCard({
  category,
  isSelected,
  onSelect,
  index,
}: {
  category: FeedbackCategory;
  isSelected: boolean;
  onSelect: () => void;
  index: number;
}) {
  const cardScale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }],
    borderColor: isSelected
      ? tokens.colors.primary
      : tokens.colors.border.light,
    backgroundColor: isSelected
      ? tokens.colors.primaryLight
      : tokens.colors.surface.primary,
  }));

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    cardScale.value = withSpring(0.95, {}, () => {
      cardScale.value = withSpring(1);
    });
    onSelect();
  };

  return (
    <Animated.View entering={FadeInDown.delay(100 + index * 50).duration(400)}>
      <Pressable onPress={handlePress}>
        <Animated.View style={[styles.categoryCard, animatedStyle]}>
          <View
            style={[
              styles.categoryIcon,
              isSelected && { backgroundColor: tokens.colors.primary },
            ]}
          >
            <Feather
              name={category.icon}
              size={20}
              color={isSelected ? tokens.colors.white : tokens.colors.primary}
            />
          </View>
          <Text
            style={[
              styles.categoryTitle,
              isSelected && { color: tokens.colors.primary },
            ]}
          >
            {category.title}
          </Text>
          <Text style={styles.categoryDescription}>{category.description}</Text>
          {isSelected && (
            <View style={styles.checkmark}>
              <Feather name="check" size={14} color={tokens.colors.white} />
            </View>
          )}
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

export default function FeedbackScreen() {
  const insets = useSafeAreaInsets();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const buttonScale = useSharedValue(1);

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const canSubmit = selectedCategory && subject.trim() && message.trim();

  const handleSubmit = async () => {
    if (!canSubmit) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    Alert.alert(
      'Thank You! 🎉',
      'Your feedback has been submitted. We really appreciate you taking the time to help us improve CampusPulse!',
      [
        {
          text: 'Done',
          onPress: () => router.back(),
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <LinearGradient
        colors={[tokens.colors.primary, tokens.colors.primaryDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: insets.top }]}
      >
        <View style={styles.headerContent}>
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.back();
            }}
            style={styles.backButton}
          >
            <Feather name="arrow-left" size={24} color={tokens.colors.white} />
          </Pressable>
          <Text style={styles.headerTitle}>Send Feedback</Text>
          <View style={styles.headerSpacer} />
        </View>
      </LinearGradient>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.content}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 100 },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Intro */}
          <Animated.View
            entering={FadeInDown.delay(50).duration(400)}
            style={styles.introCard}
          >
            <Text style={styles.introTitle}>We'd love to hear from you!</Text>
            <Text style={styles.introText}>
              Your feedback helps us make CampusPulse better for everyone. Tell
              us what's on your mind.
            </Text>
          </Animated.View>

          {/* Category Selection */}
          <Animated.View
            entering={FadeInDown.delay(100).duration(400)}
            style={styles.section}
          >
            <Text style={styles.sectionTitle}>What's this about?</Text>
            <View style={styles.categoriesGrid}>
              {CATEGORIES.map((category, index) => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  isSelected={selectedCategory === category.id}
                  onSelect={() => setSelectedCategory(category.id)}
                  index={index}
                />
              ))}
            </View>
          </Animated.View>

          {/* Form Fields */}
          <Animated.View
            entering={FadeInDown.delay(200).duration(400)}
            style={styles.section}
          >
            <Text style={styles.sectionTitle}>Details</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Subject *</Text>
              <TextInput
                style={styles.input}
                placeholder="Brief summary of your feedback"
                placeholderTextColor={tokens.colors.text.tertiary}
                value={subject}
                onChangeText={setSubject}
                maxLength={100}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Message *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Tell us more details..."
                placeholderTextColor={tokens.colors.text.tertiary}
                value={message}
                onChangeText={setMessage}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
                maxLength={1000}
              />
              <Text style={styles.charCount}>{message.length}/1000</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email (optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="For follow-up questions"
                placeholderTextColor={tokens.colors.text.tertiary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </Animated.View>

          {/* Tips */}
          <Animated.View
            entering={FadeInDown.delay(300).duration(400)}
            style={styles.tipsCard}
          >
            <Feather
              name="info"
              size={18}
              color={tokens.colors.info}
              style={styles.tipsIcon}
            />
            <View style={styles.tipsContent}>
              <Text style={styles.tipsTitle}>Tips for helpful feedback</Text>
              <Text style={styles.tipsText}>
                • Be specific about what you experienced{'\n'}
                • Include steps to reproduce bugs{'\n'}
                • Share ideas on how to improve
              </Text>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Submit Button */}
      <View style={[styles.submitContainer, { paddingBottom: insets.bottom + 16 }]}>
        <Pressable
          onPressIn={() => {
            buttonScale.value = withTiming(0.95, { duration: 100 });
          }}
          onPressOut={() => {
            buttonScale.value = withTiming(1, { duration: 150 });
          }}
          onPress={handleSubmit}
          disabled={!canSubmit || isSubmitting}
        >
          <Animated.View
            style={[
              styles.submitButton,
              buttonAnimatedStyle,
              (!canSubmit || isSubmitting) && styles.submitButtonDisabled,
            ]}
          >
            {isSubmitting ? (
              <Text style={styles.submitButtonText}>Sending...</Text>
            ) : (
              <>
                <Feather name="send" size={18} color={tokens.colors.white} />
                <Text style={styles.submitButtonText}>Submit Feedback</Text>
              </>
            )}
          </Animated.View>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.colors.background.secondary,
  },
  header: {
    paddingBottom: scale(20),
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: scale(16),
    paddingTop: scale(16),
  },
  backButton: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: normalize(20),
    fontWeight: '700',
    color: tokens.colors.white,
    letterSpacing: -0.3,
  },
  headerSpacer: {
    width: scale(40),
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: scale(16),
  },
  introCard: {
    backgroundColor: tokens.colors.surface.primary,
    padding: scale(20),
    borderRadius: scale(16),
    marginBottom: scale(24),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  introTitle: {
    fontSize: normalize(18),
    fontWeight: '700',
    color: tokens.colors.text.primary,
    letterSpacing: -0.3,
    marginBottom: scale(8),
  },
  introText: {
    fontSize: normalize(14),
    color: tokens.colors.text.secondary,
    lineHeight: normalize(20),
  },
  section: {
    marginBottom: scale(24),
  },
  sectionTitle: {
    fontSize: normalize(13),
    fontWeight: '600',
    color: tokens.colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: scale(12),
    marginLeft: scale(4),
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: scale(12),
  },
  categoryCard: {
    width: '47%',
    padding: scale(16),
    borderRadius: scale(12),
    borderWidth: 2,
    position: 'relative',
  },
  categoryIcon: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(10),
    backgroundColor: tokens.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: scale(10),
  },
  categoryTitle: {
    fontSize: normalize(15),
    fontWeight: '600',
    color: tokens.colors.text.primary,
    letterSpacing: -0.2,
    marginBottom: scale(4),
  },
  categoryDescription: {
    fontSize: normalize(12),
    color: tokens.colors.text.tertiary,
  },
  checkmark: {
    position: 'absolute',
    top: scale(8),
    right: scale(8),
    width: scale(22),
    height: scale(22),
    borderRadius: scale(11),
    backgroundColor: tokens.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputGroup: {
    marginBottom: scale(16),
  },
  inputLabel: {
    fontSize: normalize(14),
    fontWeight: '600',
    color: tokens.colors.text.primary,
    marginBottom: scale(8),
    marginLeft: scale(4),
  },
  input: {
    backgroundColor: tokens.colors.surface.primary,
    borderRadius: scale(12),
    paddingHorizontal: scale(16),
    paddingVertical: scale(14),
    fontSize: normalize(15),
    color: tokens.colors.text.primary,
    borderWidth: 1,
    borderColor: tokens.colors.border.light,
  },
  textArea: {
    height: scale(140),
    paddingTop: scale(14),
  },
  charCount: {
    fontSize: normalize(12),
    color: tokens.colors.text.tertiary,
    textAlign: 'right',
    marginTop: scale(6),
  },
  tipsCard: {
    flexDirection: 'row',
    backgroundColor: tokens.colors.infoLight,
    padding: scale(16),
    borderRadius: scale(12),
    marginBottom: scale(16),
  },
  tipsIcon: {
    marginRight: scale(12),
    marginTop: scale(2),
  },
  tipsContent: {
    flex: 1,
  },
  tipsTitle: {
    fontSize: normalize(14),
    fontWeight: '600',
    color: tokens.colors.info,
    marginBottom: scale(6),
  },
  tipsText: {
    fontSize: normalize(13),
    color: tokens.colors.text.secondary,
    lineHeight: normalize(20),
  },
  submitContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: scale(16),
    paddingTop: scale(16),
    backgroundColor: tokens.colors.background.secondary,
    borderTopWidth: 1,
    borderTopColor: tokens.colors.border.light,
  },
  submitButton: {
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
  submitButtonDisabled: {
    backgroundColor: tokens.colors.text.disabled,
    shadowOpacity: 0,
  },
  submitButtonText: {
    fontSize: normalize(16),
    fontWeight: '700',
    color: tokens.colors.white,
    letterSpacing: -0.2,
  },
});
