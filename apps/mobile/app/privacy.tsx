/**
 * Privacy Policy Screen
 * App privacy information and data handling
 */

import React from 'react';
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
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { tokens, normalize, scale } from '../lib/styles/unified';

// Privacy Sections
interface PrivacySection {
  title: string;
  icon: keyof typeof Feather.glyphMap;
  content: string;
}

const PRIVACY_SECTIONS: PrivacySection[] = [
  {
    title: 'Information We Collect',
    icon: 'database',
    content: `When you use CampusPulse, we collect information to provide you with the best experience:

• Account Information: Your name, email, profile photo, and university details when you create an account.

• Activity Data: Events you attend, points earned, clubs joined, and interactions within the app.

• Device Information: Device type, operating system, and app version for troubleshooting and optimization.

• Location Data: Only when you enable location services, used to show nearby events and for event check-ins.`,
  },
  {
    title: 'How We Use Your Information',
    icon: 'settings',
    content: `We use your information to:

• Personalize your event recommendations and content feed
• Process event registrations and manage your tickets
• Calculate and track your points and rewards
• Send notifications about events you're interested in
• Improve our services and develop new features
• Ensure the security and integrity of our platform`,
  },
  {
    title: 'Data Sharing',
    icon: 'share-2',
    content: `We value your privacy and limit data sharing:

• Event Organizers: When you register for an event, organizers receive your name and registration status for attendance purposes.

• Club Administrators: Club leaders can see member lists for their clubs.

• We never sell your personal data to third parties.

• We may share anonymized, aggregated data for analytics.`,
  },
  {
    title: 'Your Privacy Controls',
    icon: 'sliders',
    content: `You have control over your data:

• Profile Visibility: Choose who can see your profile information.

• Notification Settings: Customize which notifications you receive.

• Location Services: Enable or disable location features at any time.

• Data Export: Request a copy of all your data.

• Account Deletion: Delete your account and all associated data.`,
  },
  {
    title: 'Data Security',
    icon: 'shield',
    content: `We take data security seriously:

• All data is encrypted in transit using HTTPS/TLS.

• Sensitive data is encrypted at rest.

• We conduct regular security audits.

• Access to user data is strictly limited and logged.

• We follow industry best practices for data protection.`,
  },
  {
    title: 'Cookies & Tracking',
    icon: 'eye',
    content: `We use minimal tracking:

• Essential cookies for app functionality and authentication.

• Analytics to understand app usage patterns (anonymized).

• No third-party advertising trackers.

• You can manage cookie preferences in your device settings.`,
  },
  {
    title: 'Your Rights',
    icon: 'user-check',
    content: `Under applicable privacy laws, you may have the right to:

• Access the personal data we hold about you
• Correct inaccurate or incomplete data
• Request deletion of your data
• Object to or restrict certain processing
• Data portability (receive your data in a standard format)

To exercise these rights, contact us at privacy@campuspulse.com`,
  },
  {
    title: 'Contact Us',
    icon: 'mail',
    content: `If you have questions about this Privacy Policy or our data practices, please contact us:

Email: privacy@campuspulse.com
Address: 123 University Ave, Campus City, ST 12345

We typically respond within 48 hours.`,
  },
];

// Section Component
function PrivacySectionCard({
  section,
  index,
}: {
  section: PrivacySection;
  index: number;
}) {
  return (
    <Animated.View
      entering={FadeInDown.delay(100 + index * 50).duration(400)}
      style={styles.sectionCard}
    >
      <View style={styles.sectionHeader}>
        <View style={styles.sectionIconContainer}>
          <Feather name={section.icon} size={20} color={tokens.colors.primary} />
        </View>
        <Text style={styles.sectionTitle}>{section.title}</Text>
      </View>
      <Text style={styles.sectionContent}>{section.content}</Text>
    </Animated.View>
  );
}

export default function PrivacyScreen() {
  const insets = useSafeAreaInsets();

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
          <Text style={styles.headerTitle}>Privacy Policy</Text>
          <View style={styles.headerSpacer} />
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
        {/* Intro Card */}
        <Animated.View
          entering={FadeInDown.delay(50).duration(400)}
          style={styles.introCard}
        >
          <LinearGradient
            colors={['#FFF0EB', '#FFE4DB']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.introGradient}
          >
            <Feather name="lock" size={32} color={tokens.colors.primary} />
            <Text style={styles.introTitle}>Your Privacy Matters</Text>
            <Text style={styles.introText}>
              We're committed to protecting your personal information. This
              policy explains how we collect, use, and safeguard your data.
            </Text>
            <Text style={styles.lastUpdated}>Last updated: December 2024</Text>
          </LinearGradient>
        </Animated.View>

        {/* Quick Summary */}
        <Animated.View
          entering={FadeInDown.delay(75).duration(400)}
          style={styles.summaryCard}
        >
          <Text style={styles.summaryTitle}>📋 Quick Summary</Text>
          <View style={styles.summaryItem}>
            <Feather name="check" size={16} color={tokens.colors.success} />
            <Text style={styles.summaryText}>
              We collect only what's needed to provide our services
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Feather name="check" size={16} color={tokens.colors.success} />
            <Text style={styles.summaryText}>
              We never sell your personal data to third parties
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Feather name="check" size={16} color={tokens.colors.success} />
            <Text style={styles.summaryText}>
              You can request deletion of your data anytime
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Feather name="check" size={16} color={tokens.colors.success} />
            <Text style={styles.summaryText}>
              All data is encrypted and securely stored
            </Text>
          </View>
        </Animated.View>

        {/* Privacy Sections */}
        {PRIVACY_SECTIONS.map((section, index) => (
          <PrivacySectionCard key={section.title} section={section} index={index} />
        ))}

        {/* Footer */}
        <Animated.View
          entering={FadeInDown.delay(500).duration(400)}
          style={styles.footer}
        >
          <Text style={styles.footerText}>
            By using CampusPulse, you agree to this Privacy Policy. We may
            update this policy from time to time. We'll notify you of any
            significant changes.
          </Text>
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
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: scale(16),
  },
  introCard: {
    marginBottom: scale(16),
    borderRadius: scale(16),
    overflow: 'hidden',
  },
  introGradient: {
    padding: scale(24),
    alignItems: 'center',
  },
  introTitle: {
    fontSize: normalize(22),
    fontWeight: '700',
    color: tokens.colors.text.primary,
    marginTop: scale(12),
    letterSpacing: -0.3,
  },
  introText: {
    fontSize: normalize(14),
    color: tokens.colors.text.secondary,
    textAlign: 'center',
    marginTop: scale(8),
    lineHeight: normalize(20),
  },
  lastUpdated: {
    fontSize: normalize(12),
    color: tokens.colors.text.tertiary,
    marginTop: scale(12),
  },
  summaryCard: {
    backgroundColor: tokens.colors.surface.primary,
    padding: scale(20),
    borderRadius: scale(16),
    marginBottom: scale(16),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  summaryTitle: {
    fontSize: normalize(16),
    fontWeight: '700',
    color: tokens.colors.text.primary,
    marginBottom: scale(16),
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: scale(12),
    gap: scale(10),
  },
  summaryText: {
    flex: 1,
    fontSize: normalize(14),
    color: tokens.colors.text.secondary,
    lineHeight: normalize(20),
  },
  sectionCard: {
    backgroundColor: tokens.colors.surface.primary,
    padding: scale(20),
    borderRadius: scale(16),
    marginBottom: scale(12),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: scale(14),
  },
  sectionIconContainer: {
    width: scale(36),
    height: scale(36),
    borderRadius: scale(10),
    backgroundColor: tokens.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: scale(12),
  },
  sectionTitle: {
    fontSize: normalize(16),
    fontWeight: '700',
    color: tokens.colors.text.primary,
    letterSpacing: -0.2,
    flex: 1,
  },
  sectionContent: {
    fontSize: normalize(14),
    color: tokens.colors.text.secondary,
    lineHeight: normalize(22),
  },
  footer: {
    paddingVertical: scale(24),
    paddingHorizontal: scale(8),
  },
  footerText: {
    fontSize: normalize(12),
    color: tokens.colors.text.tertiary,
    textAlign: 'center',
    lineHeight: normalize(18),
  },
});
