/**
 * Help Center Screen
 * FAQs and support information
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  TextInput,
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router, Stack } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import Animated, {
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { tokens, normalize, scale } from '../lib/styles/unified';

// FAQ Data
interface FAQ {
  id: string;
  question: string;
  answer: string;
}

const FAQS: FAQ[] = [
  {
    id: '1',
    question: 'How do I earn points?',
    answer: 'You earn points by attending events, participating in activities, engaging with the community, and completing challenges. Points are automatically added to your account after event check-in.',
  },
  {
    id: '2',
    question: 'How do I check into an event?',
    answer: 'Open the event details page and tap "Show QR Code". Present this QR code to the event organizer to scan. Your attendance will be recorded and points will be credited.',
  },
  {
    id: '3',
    question: 'How do I redeem my points?',
    answer: 'Go to Profile > Rewards to browse available rewards. Select a reward and tap "Redeem" to exchange your points. You\'ll receive a confirmation with redemption details.',
  },
  {
    id: '4',
    question: 'Can I cancel an event registration?',
    answer: 'Yes! Go to your Tickets tab, find the event, and tap "Cancel Registration". Note that some events may have cancellation deadlines.',
  },
  {
    id: '5',
    question: 'How do I join a club?',
    answer: 'Browse clubs in the Explore tab or visit a club\'s profile. Tap "Join Club" to become a member. Some clubs may require approval from administrators.',
  },
  {
    id: '6',
    question: 'Why didn\'t I receive points for an event?',
    answer: 'Points are awarded after successful check-in. If you attended but didn\'t check in via QR code, contact the event organizer. Points may take up to 24 hours to appear.',
  },
  {
    id: '7',
    question: 'How do I change my notification settings?',
    answer: 'Go to Profile > Settings > Notifications to customize which notifications you receive, including event reminders, points alerts, and announcements.',
  },
  {
    id: '8',
    question: 'How do I edit my profile?',
    answer: 'Go to Profile and tap "Edit Profile" to update your photo, name, bio, interests, and other details. Changes are saved automatically.',
  },
];

// FAQ Item Component
function FAQItem({ faq, index }: { faq: FAQ; index: number }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const rotation = useSharedValue(0);
  const height = useSharedValue(0);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const toggleExpand = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsExpanded(!isExpanded);
    rotation.value = withTiming(isExpanded ? 0 : 180, { duration: 200 });
  };

  return (
    <Animated.View
      entering={FadeInDown.delay(100 + index * 50).duration(400)}
      style={styles.faqCard}
    >
      <Pressable onPress={toggleExpand} style={styles.faqHeader}>
        <Text style={styles.faqQuestion}>{faq.question}</Text>
        <Animated.View style={iconStyle}>
          <Feather
            name="chevron-down"
            size={20}
            color={tokens.colors.text.secondary}
          />
        </Animated.View>
      </Pressable>

      {isExpanded && (
        <Animated.View
          entering={FadeInDown.duration(200)}
          style={styles.faqAnswer}
        >
          <Text style={styles.faqAnswerText}>{faq.answer}</Text>
        </Animated.View>
      )}
    </Animated.View>
  );
}

// Quick Action Component
function QuickAction({
  icon,
  title,
  subtitle,
  onPress,
  index,
}: {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  subtitle: string;
  onPress: () => void;
  index: number;
}) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View entering={FadeInDown.delay(50 + index * 50).duration(400)}>
      <Pressable
        onPressIn={() => {
          scale.value = withTiming(0.95, { duration: 100 });
        }}
        onPressOut={() => {
          scale.value = withTiming(1, { duration: 150 });
        }}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onPress();
        }}
      >
        <Animated.View style={[styles.quickAction, animatedStyle]}>
          <View style={styles.quickActionIcon}>
            <Feather name={icon} size={24} color={tokens.colors.primary} />
          </View>
          <View style={styles.quickActionContent}>
            <Text style={styles.quickActionTitle}>{title}</Text>
            <Text style={styles.quickActionSubtitle}>{subtitle}</Text>
          </View>
          <Feather
            name="chevron-right"
            size={20}
            color={tokens.colors.text.tertiary}
          />
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

export default function HelpScreen() {
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFAQs = FAQS.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <LinearGradient
        colors={['#FF6B35', '#FF8F5C']}
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
          <Text style={styles.headerTitle}>Help Center</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <Feather name="search" size={20} color={tokens.colors.text.tertiary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search help articles..."
            placeholderTextColor={tokens.colors.text.tertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <Pressable
              onPress={() => setSearchQuery('')}
              hitSlop={8}
            >
              <Feather name="x" size={18} color={tokens.colors.text.tertiary} />
            </Pressable>
          )}
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Quick Actions */}
        <Animated.View
          entering={FadeInDown.delay(50).duration(400)}
          style={styles.section}
        >
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <QuickAction
            icon="mail"
            title="Contact Support"
            subtitle="Get help from our team"
            onPress={() => Linking.openURL('mailto:support@campuspulse.com')}
            index={0}
          />
          <QuickAction
            icon="message-circle"
            title="Live Chat"
            subtitle="Chat with us in real-time"
            onPress={() => {}}
            index={1}
          />
          <QuickAction
            icon="phone"
            title="Call Us"
            subtitle="Mon-Fri, 9AM-5PM"
            onPress={() => Linking.openURL('tel:+1234567890')}
            index={2}
          />
        </Animated.View>

        {/* FAQs */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Frequently Asked Questions
          </Text>
          {filteredFAQs.length > 0 ? (
            filteredFAQs.map((faq, index) => (
              <FAQItem key={faq.id} faq={faq} index={index} />
            ))
          ) : (
            <Animated.View
              entering={FadeInDown.duration(300)}
              style={styles.emptyState}
            >
              <Feather
                name="search"
                size={48}
                color={tokens.colors.text.disabled}
              />
              <Text style={styles.emptyStateTitle}>No results found</Text>
              <Text style={styles.emptyStateSubtitle}>
                Try a different search term
              </Text>
            </Animated.View>
          )}
        </View>

        {/* Still Need Help */}
        <Animated.View
          entering={FadeInDown.delay(300).duration(400)}
          style={styles.helpCard}
        >
          <LinearGradient
            colors={['#FFF0EB', '#FFE4DB']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.helpCardGradient}
          >
            <Feather name="help-circle" size={32} color={tokens.colors.primary} />
            <Text style={styles.helpCardTitle}>Still need help?</Text>
            <Text style={styles.helpCardSubtitle}>
              Our support team is here to assist you with any questions or issues.
            </Text>
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                router.push('/feedback');
              }}
              style={styles.helpCardButton}
            >
              <Text style={styles.helpCardButtonText}>Send us a message</Text>
              <Feather name="arrow-right" size={18} color={tokens.colors.white} />
            </Pressable>
          </LinearGradient>
        </Animated.View>
      </ScrollView>
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: tokens.colors.white,
    marginHorizontal: scale(16),
    marginTop: scale(16),
    paddingHorizontal: scale(16),
    paddingVertical: scale(12),
    borderRadius: scale(12),
  },
  searchInput: {
    flex: 1,
    marginLeft: scale(12),
    fontSize: normalize(15),
    color: tokens.colors.text.primary,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: scale(16),
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
  quickAction: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: tokens.colors.surface.primary,
    padding: scale(16),
    borderRadius: scale(12),
    marginBottom: scale(8),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  quickActionIcon: {
    width: scale(48),
    height: scale(48),
    borderRadius: scale(12),
    backgroundColor: tokens.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: scale(12),
  },
  quickActionContent: {
    flex: 1,
  },
  quickActionTitle: {
    fontSize: normalize(16),
    fontWeight: '600',
    color: tokens.colors.text.primary,
    letterSpacing: -0.2,
  },
  quickActionSubtitle: {
    fontSize: normalize(13),
    color: tokens.colors.text.tertiary,
    marginTop: scale(2),
  },
  faqCard: {
    backgroundColor: tokens.colors.surface.primary,
    borderRadius: scale(12),
    marginBottom: scale(8),
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: scale(16),
  },
  faqQuestion: {
    flex: 1,
    fontSize: normalize(15),
    fontWeight: '600',
    color: tokens.colors.text.primary,
    letterSpacing: -0.2,
    marginRight: scale(12),
  },
  faqAnswer: {
    paddingHorizontal: scale(16),
    paddingBottom: scale(16),
  },
  faqAnswerText: {
    fontSize: normalize(14),
    color: tokens.colors.text.secondary,
    lineHeight: normalize(22),
  },
  emptyState: {
    alignItems: 'center',
    padding: scale(32),
    backgroundColor: tokens.colors.surface.primary,
    borderRadius: scale(12),
  },
  emptyStateTitle: {
    fontSize: normalize(17),
    fontWeight: '600',
    color: tokens.colors.text.primary,
    marginTop: scale(16),
  },
  emptyStateSubtitle: {
    fontSize: normalize(14),
    color: tokens.colors.text.tertiary,
    marginTop: scale(4),
  },
  helpCard: {
    marginTop: scale(8),
  },
  helpCardGradient: {
    padding: scale(24),
    borderRadius: scale(16),
    alignItems: 'center',
  },
  helpCardTitle: {
    fontSize: normalize(20),
    fontWeight: '700',
    color: tokens.colors.text.primary,
    marginTop: scale(12),
    letterSpacing: -0.3,
  },
  helpCardSubtitle: {
    fontSize: normalize(14),
    color: tokens.colors.text.secondary,
    textAlign: 'center',
    marginTop: scale(8),
    lineHeight: normalize(20),
  },
  helpCardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: tokens.colors.primary,
    paddingVertical: scale(12),
    paddingHorizontal: scale(24),
    borderRadius: scale(24),
    marginTop: scale(20),
    gap: scale(8),
  },
  helpCardButtonText: {
    fontSize: normalize(15),
    fontWeight: '600',
    color: tokens.colors.white,
  },
});
