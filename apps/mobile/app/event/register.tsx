/**
 * Event Registration Screen - CampusPulse
 * Complete registration flow with form, confirmation, and success state
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Alert } from 'react-native';
import { useAuth } from '@/lib/context/AuthContext';
import { registerForEvent } from '@/lib/services/registrationService';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  SlideInRight,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  ZoomIn,
  BounceIn,
} from 'react-native-reanimated';

import { tokens } from '@/lib/styles/unified';

type RegistrationStep = 'form' | 'confirmation' | 'success';

interface FormData {
  name: string;
  email: string;
  phone: string;
  department: string;
  year: string;
  rollNumber: string;
}

const YEAR_OPTIONS = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'PG'];

export default function EventRegistrationScreen() {
  const { id, eventId, title, date, location, points } = useLocalSearchParams();
  const resolvedEventId = (Array.isArray(eventId) ? eventId[0] : eventId) ||
    (Array.isArray(id) ? id[0] : id);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isNavigatingRef = useRef(false);
  const { user, profile } = useAuth();

  const [step, setStep] = useState<RegistrationStep>('form');
  const [isLoading, setIsLoading] = useState(false);
  const [registrationId, setRegistrationId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: profile?.full_name ?? '',
    email: profile?.email ?? '',
    phone: profile?.phone ?? '',
    department: profile?.branch ?? '',
    year: profile?.year ? `${profile.year}${
      profile.year === 1 ? 'st' : profile.year === 2 ? 'nd' :
      profile.year === 3 ? 'rd' : 'th'
    } Year` : '',
    rollNumber: profile?.student_id ?? '',
  });

  // Refresh form values when profile loads
  useEffect(() => {
    if (profile) {
      setFormData((prev) => ({
        name: prev.name || profile.full_name || '',
        email: prev.email || profile.email || '',
        phone: prev.phone || profile.phone || '',
        department: prev.department || profile.branch || '',
        year: prev.year || (profile.year ? `${profile.year} Year` : ''),
        rollNumber: prev.rollNumber || profile.student_id || '',
      }));
    }
  }, [profile]);

  const buttonScale = useSharedValue(1);
  const successScale = useSharedValue(0);

  const handleBack = useCallback(() => {
    if (isNavigatingRef.current) return;

    if (step === 'confirmation') {
      setStep('form');
    } else if (step === 'success') {
      isNavigatingRef.current = true;
      router.replace('/(tabs)');
    } else {
      router.back();
    }
  }, [step, router]);

  const handleContinue = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});

    buttonScale.value = withSequence(
      withTiming(0.96, { duration: 80 }),
      withTiming(1, { duration: 120 })
    );

    if (step === 'form') {
      setStep('confirmation');
    } else if (step === 'confirmation') {
      if (!user || !resolvedEventId) {
        Alert.alert('Cannot register', 'You must be logged in and have an event id.');
        return;
      }
      setIsLoading(true);
      const result = await registerForEvent(user.id, String(resolvedEventId));
      setIsLoading(false);
      if (result.success && result.data) {
        setRegistrationId(result.data.id);
        setStep('success');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      } else {
        Alert.alert('Registration failed', result.error ?? 'Please try again.');
      }
    }
  }, [step, user, resolvedEventId]);

  const handleGoToTickets = useCallback(() => {
    if (isNavigatingRef.current) return;
    isNavigatingRef.current = true;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    if (registrationId) {
      router.replace({ pathname: '/ticket-qr', params: { registrationId } });
    } else {
      router.replace('/(tabs)/tickets');
    }
  }, [router, registrationId]);

  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const updateField = useCallback((field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  // Form step
  const renderForm = () => (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* Event Summary Card */}
      <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.eventCard}>
        <LinearGradient
          colors={[tokens.colors.primary, tokens.colors.primaryDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.eventCardGradient}
        >
          <View style={styles.eventCardContent}>
            <Text style={styles.eventCardTitle} numberOfLines={2}>
              {title || 'Event Registration'}
            </Text>
            <View style={styles.eventCardDetails}>
              <View style={styles.eventCardDetail}>
                <Feather name="calendar" size={14} color="rgba(255,255,255,0.8)" />
                <Text style={styles.eventCardDetailText}>{date || 'Date TBD'}</Text>
              </View>
              <View style={styles.eventCardDetail}>
                <Feather name="map-pin" size={14} color="rgba(255,255,255,0.8)" />
                <Text style={styles.eventCardDetailText}>{location || 'Location TBD'}</Text>
              </View>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>

      {/* Personal Info Section */}
      <Animated.View entering={FadeInDown.delay(200).duration(400)}>
        <Text style={styles.sectionTitle}>Personal Information</Text>
        <View style={styles.formCard}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Full Name</Text>
            <View style={styles.inputContainer}>
              <Feather name="user" size={18} color={tokens.colors.text.tertiary} />
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(v) => updateField('name', v)}
                placeholder="Enter your name"
                placeholderTextColor={tokens.colors.text.tertiary}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email Address</Text>
            <View style={styles.inputContainer}>
              <Feather name="mail" size={18} color={tokens.colors.text.tertiary} />
              <TextInput
                style={styles.input}
                value={formData.email}
                onChangeText={(v) => updateField('email', v)}
                placeholder="your.email@university.edu"
                placeholderTextColor={tokens.colors.text.tertiary}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Phone Number</Text>
            <View style={styles.inputContainer}>
              <Feather name="phone" size={18} color={tokens.colors.text.tertiary} />
              <TextInput
                style={styles.input}
                value={formData.phone}
                onChangeText={(v) => updateField('phone', v)}
                placeholder="+91 98765 43210"
                placeholderTextColor={tokens.colors.text.tertiary}
                keyboardType="phone-pad"
              />
            </View>
          </View>
        </View>
      </Animated.View>

      {/* Academic Info Section */}
      <Animated.View entering={FadeInDown.delay(300).duration(400)}>
        <Text style={styles.sectionTitle}>Academic Details</Text>
        <View style={styles.formCard}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Department</Text>
            <View style={styles.inputContainer}>
              <Feather name="book" size={18} color={tokens.colors.text.tertiary} />
              <TextInput
                style={styles.input}
                value={formData.department}
                onChangeText={(v) => updateField('department', v)}
                placeholder="Computer Science"
                placeholderTextColor={tokens.colors.text.tertiary}
              />
            </View>
          </View>

          <View style={styles.inputRow}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.inputLabel}>Year</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  value={formData.year}
                  onChangeText={(v) => updateField('year', v)}
                  placeholder="3rd Year"
                  placeholderTextColor={tokens.colors.text.tertiary}
                />
              </View>
            </View>
            <View style={{ width: 12 }} />
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.inputLabel}>Roll Number</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  value={formData.rollNumber}
                  onChangeText={(v) => updateField('rollNumber', v)}
                  placeholder="CS2022001"
                  placeholderTextColor={tokens.colors.text.tertiary}
                />
              </View>
            </View>
          </View>
        </View>
      </Animated.View>

    </ScrollView>
  );

  // Confirmation step
  const renderConfirmation = () => (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.confirmCard}>
        <View style={styles.confirmHeader}>
          <View style={styles.confirmIconBg}>
            <Feather name="check-circle" size={28} color={tokens.colors.primary} />
          </View>
          <Text style={styles.confirmTitle}>Review Your Registration</Text>
          <Text style={styles.confirmSubtitle}>Please confirm your details before submitting</Text>
        </View>

        <View style={styles.confirmSection}>
          <Text style={styles.confirmSectionTitle}>Event</Text>
          <Text style={styles.confirmValue}>{title}</Text>
          <Text style={styles.confirmSubvalue}>{date} • {location}</Text>
        </View>

        <View style={styles.confirmDivider} />

        <View style={styles.confirmSection}>
          <Text style={styles.confirmSectionTitle}>Participant</Text>
          <Text style={styles.confirmValue}>{formData.name}</Text>
          <Text style={styles.confirmSubvalue}>{formData.email}</Text>
          <Text style={styles.confirmSubvalue}>{formData.phone}</Text>
        </View>

        <View style={styles.confirmDivider} />

        <View style={styles.confirmSection}>
          <Text style={styles.confirmSectionTitle}>Academic</Text>
          <Text style={styles.confirmValue}>{formData.department}</Text>
          <Text style={styles.confirmSubvalue}>{formData.year} • {formData.rollNumber}</Text>
        </View>
      </Animated.View>

      {/* Terms Notice */}
      <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.termsCard}>
        <Feather name="info" size={18} color={tokens.colors.info} />
        <Text style={styles.termsText}>
          By registering, you agree to our Terms of Service and Privacy Policy. You will receive event updates via email.
        </Text>
      </Animated.View>
    </ScrollView>
  );

  // Success step
  const renderSuccess = () => (
    <View style={styles.successContainer}>
      <Animated.View entering={ZoomIn.delay(200).duration(500)} style={styles.successIconContainer}>
        <LinearGradient
          colors={['#10B981', '#059669']}
          style={styles.successIconGradient}
        >
          <Feather name="check" size={48} color="#FFFFFF" />
        </LinearGradient>
      </Animated.View>

      <Animated.Text entering={FadeInDown.delay(400).duration(400)} style={styles.successTitle}>
        You're Registered! 🎉
      </Animated.Text>

      <Animated.Text entering={FadeInDown.delay(500).duration(400)} style={styles.successSubtitle}>
        Your spot has been confirmed for
      </Animated.Text>

      <Animated.View entering={FadeInDown.delay(600).duration(400)} style={styles.successEventCard}>
        <Text style={styles.successEventTitle}>{title}</Text>
        <View style={styles.successEventDetails}>
          <View style={styles.successEventDetail}>
            <Feather name="calendar" size={16} color={tokens.colors.text.secondary} />
            <Text style={styles.successEventDetailText}>{date}</Text>
          </View>
          <View style={styles.successEventDetail}>
            <Feather name="map-pin" size={16} color={tokens.colors.text.secondary} />
            <Text style={styles.successEventDetailText}>{location}</Text>
          </View>
        </View>
      </Animated.View>

      {points && Number(points) > 0 && (
        <Animated.View entering={BounceIn.delay(800).duration(600)} style={styles.pointsEarnedCard}>
          <Feather name="award" size={24} color="#FFD700" />
          <View style={styles.pointsEarnedContent}>
            <Text style={styles.pointsEarnedLabel}>Points to earn</Text>
            <Text style={styles.pointsEarnedValue}>+{points} pts</Text>
          </View>
        </Animated.View>
      )}

      <Animated.View entering={FadeInUp.delay(900).duration(400)} style={styles.successActions}>
        <Pressable style={styles.secondaryButton} onPress={handleGoToTickets}>
          <Feather name="bookmark" size={20} color={tokens.colors.primary} />
          <Text style={styles.secondaryButtonText}>View My Tickets</Text>
        </Pressable>

        <Pressable style={styles.primaryButton} onPress={handleBack}>
          <Text style={styles.primaryButtonText}>Back to Home</Text>
          <Feather name="arrow-right" size={20} color="#FFFFFF" />
        </Pressable>
      </Animated.View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        {/* Header */}
        {step !== 'success' && (
          <Animated.View
            entering={FadeIn.duration(300)}
            style={[styles.header, { paddingTop: insets.top + 8 }]}
          >
            <Pressable style={styles.backButton} onPress={handleBack}>
              <Feather name="arrow-left" size={22} color={tokens.colors.text.primary} />
            </Pressable>
            <View style={styles.headerCenter}>
              <Text style={styles.headerTitle}>
                {step === 'form' ? 'Registration' : 'Confirm Details'}
              </Text>
              <View style={styles.stepIndicator}>
                <View style={[styles.stepDot, styles.stepDotActive]} />
                <View style={[styles.stepLine, step !== 'form' && styles.stepLineActive]} />
                <View style={[styles.stepDot, step !== 'form' && styles.stepDotActive]} />
              </View>
            </View>
            <View style={{ width: 48 }} />
          </Animated.View>
        )}

        {/* Content */}
        {step === 'form' && renderForm()}
        {step === 'confirmation' && renderConfirmation()}
        {step === 'success' && renderSuccess()}

        {/* Bottom Button */}
        {step !== 'success' && (
          <Animated.View
            entering={FadeInUp.delay(300).duration(400)}
            style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 16) + 16 }]}
          >
            <Pressable
              style={[styles.continueButton, isLoading && styles.continueButtonLoading]}
              onPress={handleContinue}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <Text style={styles.continueButtonText}>
                    {step === 'form' ? 'Continue' : 'Confirm Registration'}
                  </Text>
                  <Feather name="arrow-right" size={22} color="#FFFFFF" />
                </>
              )}
            </Pressable>
          </Animated.View>
        )}
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.colors.background.secondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: tokens.colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.border.light,
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: tokens.colors.background.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: tokens.colors.text.primary,
    marginBottom: 10,
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: tokens.colors.border.default,
  },
  stepDotActive: {
    backgroundColor: tokens.colors.primary,
  },
  stepLine: {
    width: 48,
    height: 3,
    backgroundColor: tokens.colors.border.default,
    marginHorizontal: 6,
    borderRadius: 2,
  },
  stepLineActive: {
    backgroundColor: tokens.colors.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 120,
  },
  eventCard: {
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 28,
    shadowColor: tokens.colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 5,
  },
  eventCardGradient: {
    padding: 24,
  },
  eventCardContent: {},
  eventCardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  eventCardDetails: {
    gap: 8,
  },
  eventCardDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  eventCardDetailText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
  },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginTop: 12,
  },
  pointsText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: tokens.colors.text.primary,
    marginBottom: 14,
    letterSpacing: -0.2,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  inputGroup: {
    marginBottom: 18,
  },
  inputRow: {
    flexDirection: 'row',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: tokens.colors.text.secondary,
    marginBottom: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: tokens.colors.background.secondary,
    borderRadius: 14,
    paddingHorizontal: 16,
    gap: 12,
    borderWidth: 1.5,
    borderColor: tokens.colors.border.light,
  },
  input: {
    flex: 1,
    height: 52,
    fontSize: 16,
    color: tokens.colors.text.primary,
    fontWeight: '500',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 16,
    backgroundColor: tokens.colors.background.primary,
    borderTopWidth: 1,
    borderTopColor: tokens.colors.border.light,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 8,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: tokens.colors.primary,
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 16,
    minHeight: 56,
    shadowColor: tokens.colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  continueButtonLoading: {
    opacity: 0.85,
  },
  continueButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  // Confirmation styles
  confirmCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 28,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
  },
  confirmHeader: {
    alignItems: 'center',
    marginBottom: 28,
  },
  confirmIconBg: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: tokens.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  confirmTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: tokens.colors.text.primary,
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  confirmSubtitle: {
    fontSize: 15,
    color: tokens.colors.text.secondary,
  },
  confirmSection: {
    marginBottom: 20,
  },
  confirmSectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: tokens.colors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  confirmValue: {
    fontSize: 16,
    fontWeight: '600',
    color: tokens.colors.text.primary,
    marginBottom: 4,
  },
  confirmSubvalue: {
    fontSize: 14,
    color: tokens.colors.text.secondary,
  },
  confirmDivider: {
    height: 1,
    backgroundColor: tokens.colors.border.light,
    marginVertical: 16,
  },
  confirmRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  confirmLabel: {
    fontSize: 14,
    color: tokens.colors.text.secondary,
    marginRight: 8,
  },
  confirmRowValue: {
    fontSize: 14,
    fontWeight: '500',
    color: tokens.colors.text.primary,
  },
  termsCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    backgroundColor: tokens.colors.infoLight,
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
  },
  termsText: {
    flex: 1,
    fontSize: 14,
    color: tokens.colors.info,
    lineHeight: 20,
  },
  // Success styles
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  successIconContainer: {
    marginBottom: 24,
  },
  successIconGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: tokens.colors.text.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: 16,
    color: tokens.colors.text.secondary,
    marginBottom: 16,
    textAlign: 'center',
  },
  successEventCard: {
    backgroundColor: tokens.colors.background.secondary,
    borderRadius: 16,
    padding: 20,
    width: '100%',
    marginBottom: 20,
  },
  successEventTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: tokens.colors.text.primary,
    marginBottom: 12,
    textAlign: 'center',
  },
  successEventDetails: {
    gap: 8,
    alignItems: 'center',
  },
  successEventDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  successEventDetailText: {
    fontSize: 14,
    color: tokens.colors.text.secondary,
  },
  pointsEarnedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFBEB',
    borderRadius: 16,
    padding: 16,
    width: '100%',
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#FCD34D',
  },
  pointsEarnedContent: {
    flex: 1,
  },
  pointsEarnedLabel: {
    fontSize: 12,
    color: '#92400E',
  },
  pointsEarnedValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#92400E',
  },
  successActions: {
    width: '100%',
    gap: 12,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: tokens.colors.primaryLight,
    paddingVertical: 16,
    borderRadius: 14,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: tokens.colors.primary,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: tokens.colors.primary,
    paddingVertical: 16,
    borderRadius: 14,
    shadowColor: tokens.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
