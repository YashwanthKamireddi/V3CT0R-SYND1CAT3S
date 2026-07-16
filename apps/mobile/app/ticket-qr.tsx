/**
 * Ticket QR Code Display - CampusPulse
 * Shows the QR code for a specific ticket/registration
 * Connected to real Supabase backend
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Dimensions,
  Share,
  Platform,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import QRCode from 'react-native-qrcode-svg';

import { tokens } from '@/lib/styles/unified';
import { supabase } from '@/lib/supabase/client';
import { RegistrationWithEvent } from '@/lib/supabase/database.types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const QR_SIZE = SCREEN_WIDTH * 0.65;

type TicketStatus = 'active' | 'upcoming' | 'past' | 'cancelled';

interface FormattedTicket {
  qrToken: string;
  ticketNumber: string;
  eventTitle: string;
  date: string;
  time: string;
  location: string;
  status: TicketStatus;
}

const formatRegistration = (reg: RegistrationWithEvent): FormattedTicket => {
  const event = reg.events;
  const eventDate = event?.date ? new Date(event.date) : new Date();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let status: TicketStatus = 'upcoming';
  if (reg.status === 'cancelled') {
    status = 'cancelled';
  } else if (reg.checked_in) {
    status = 'past';
  } else if (eventDate < today) {
    status = 'past';
  } else if (eventDate.toDateString() === today.toDateString()) {
    status = 'active';
  }

  const qrToken = reg.qr_token || `GITAM-${reg.id.slice(0, 8).toUpperCase()}`;

  return {
    qrToken,
    ticketNumber: qrToken,
    eventTitle: event?.title || 'Unknown Event',
    date: eventDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }),
    time: eventDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }),
    location: event?.venue || event?.location || 'TBD',
    status,
  };
};

export default function TicketQRScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    registrationId?: string;
    ticketNumber?: string;
  }>();

  const [ticket, setTicket] = useState<FormattedTicket | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Animation for the glow effect
  const glowOpacity = useSharedValue(0.5);

  useEffect(() => {
    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1500 }),
        withTiming(0.5, { duration: 1500 })
      ),
      -1
    );
  }, []);

  // Fetch registration data from Supabase
  useEffect(() => {
    let isCancelled = false;

    const fetchTicket = async () => {
      const registrationId = params.registrationId;
      const qrToken = params.ticketNumber;

      if (!registrationId && !qrToken) {
        if (!isCancelled) {
          setError('No ticket reference provided');
          setIsLoading(false);
        }
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        let query = supabase
          .from('registrations')
          .select(
            `
            *,
            events (
              *,
              clubs (*)
            )
          `
          );

        if (registrationId) {
          query = query.eq('id', registrationId);
        } else if (qrToken) {
          query = query.eq('qr_token', qrToken);
        }

        const { data, error: fetchError } = await query.maybeSingle();

        if (isCancelled) return;

        if (fetchError) {
          setError(fetchError.message || 'Failed to load ticket');
          setTicket(null);
        } else if (!data) {
          setError('Ticket not found');
          setTicket(null);
        } else {
          setTicket(formatRegistration(data as unknown as RegistrationWithEvent));
        }
      } catch (err: any) {
        if (!isCancelled) {
          setError(err?.message || 'Failed to load ticket');
          setTicket(null);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchTicket();

    return () => {
      isCancelled = true;
    };
  }, [params.registrationId, params.ticketNumber]);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const handleShare = async () => {
    if (!ticket) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await Share.share({
        message: `My ticket for ${ticket.eventTitle}\n\nTicket #: ${ticket.ticketNumber}\nDate: ${ticket.date}\nTime: ${ticket.time}\nLocation: ${ticket.location}\n\nGenerated by CampusPulse`,
        title: 'My Event Ticket',
      });
    } catch (shareError) {
      console.log('Share error:', shareError);
    }
  };

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  // Loading state
  if (isLoading) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <LinearGradient
          colors={[tokens.colors.primary, '#1a1a2e', '#000000']}
          style={StyleSheet.absoluteFill}
        />
        <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
          <Pressable style={styles.closeButton} onPress={handleClose}>
            <Feather name="x" size={24} color="#FFFFFF" />
          </Pressable>
          <Text style={styles.headerTitle}>Event Pass</Text>
          <View style={styles.shareButton} />
        </View>
        <View style={styles.centeredContent}>
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text style={styles.loadingText}>Loading your ticket...</Text>
        </View>
      </View>
    );
  }

  // Error state
  if (error || !ticket) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <LinearGradient
          colors={[tokens.colors.primary, '#1a1a2e', '#000000']}
          style={StyleSheet.absoluteFill}
        />
        <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
          <Pressable style={styles.closeButton} onPress={handleClose}>
            <Feather name="x" size={24} color="#FFFFFF" />
          </Pressable>
          <Text style={styles.headerTitle}>Event Pass</Text>
          <View style={styles.shareButton} />
        </View>
        <View style={styles.centeredContent}>
          <View style={styles.errorIconCircle}>
            <Feather name="alert-circle" size={40} color="#FFFFFF" />
          </View>
          <Text style={styles.errorTitle}>Ticket Not Found</Text>
          <Text style={styles.errorMessage}>
            {error || "We couldn't find this ticket. It may have been removed or the link is invalid."}
          </Text>
          <Pressable style={styles.errorButton} onPress={() => router.replace('/(tabs)/tickets')}>
            <Feather name="arrow-left" size={18} color={tokens.colors.primary} />
            <Text style={styles.errorButtonText}>Back to tickets</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const isActive = ticket.status === 'active' || ticket.status === 'upcoming';

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Background Gradient */}
      <LinearGradient
        colors={[tokens.colors.primary, '#1a1a2e', '#000000']}
        style={StyleSheet.absoluteFill}
      />

      {/* Header */}
      <Animated.View
        entering={FadeInDown.duration(400)}
        style={[styles.header, { paddingTop: insets.top + 16 }]}
      >
        <Pressable style={styles.closeButton} onPress={handleClose}>
          <Feather name="x" size={24} color="#FFFFFF" />
        </Pressable>
        <Text style={styles.headerTitle}>Event Pass</Text>
        <Pressable style={styles.shareButton} onPress={handleShare}>
          <Feather name="share" size={20} color="#FFFFFF" />
        </Pressable>
      </Animated.View>

      {/* Main Content (scrollable so the QR + details + instructions never get clipped) */}
      <ScrollView
        style={styles.contentScroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* QR Code Card */}
        <Animated.View
          entering={FadeIn.delay(200).duration(500)}
          style={styles.qrCard}
        >
          {/* Animated Glow */}
          <Animated.View style={[styles.qrGlow, glowStyle]} />

          {/* Real QR Code */}
          <View style={styles.qrWrapper}>
            <QRCode
              value={ticket.qrToken}
              size={QR_SIZE}
              color="#000000"
              backgroundColor="#FFFFFF"
            />
          </View>

          {/* Ticket Number */}
          <View style={styles.ticketNumberContainer}>
            <Text style={styles.ticketLabel}>Ticket Number</Text>
            <Text style={styles.ticketNumber} numberOfLines={1}>
              {ticket.ticketNumber}
            </Text>
          </View>

          {/* Status Badge */}
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor: isActive
                  ? tokens.colors.successLight
                  : tokens.colors.background.secondary,
              },
            ]}
          >
            <View
              style={[
                styles.statusDot,
                {
                  backgroundColor: isActive
                    ? tokens.colors.success
                    : tokens.colors.text.tertiary,
                },
              ]}
            />
            <Text
              style={[
                styles.statusText,
                {
                  color: isActive
                    ? tokens.colors.success
                    : tokens.colors.text.tertiary,
                },
              ]}
            >
              {ticket.status === 'active'
                ? 'Active'
                : ticket.status === 'upcoming'
                ? 'Upcoming'
                : ticket.status === 'cancelled'
                ? 'Cancelled'
                : 'Used'}
            </Text>
          </View>
        </Animated.View>

        {/* Event Details */}
        <Animated.View
          entering={FadeInUp.delay(400).duration(400)}
          style={styles.eventDetails}
        >
          <Text style={styles.eventTitle}>{ticket.eventTitle}</Text>

          <View style={styles.detailsRow}>
            <View style={styles.detailItem}>
              <Feather name="calendar" size={16} color="rgba(255,255,255,0.6)" />
              <Text style={styles.detailText}>{ticket.date}</Text>
            </View>
            <View style={styles.detailItem}>
              <Feather name="clock" size={16} color="rgba(255,255,255,0.6)" />
              <Text style={styles.detailText}>{ticket.time}</Text>
            </View>
          </View>

          <View style={styles.detailItem}>
            <Feather name="map-pin" size={16} color="rgba(255,255,255,0.6)" />
            <Text style={styles.detailText}>{ticket.location}</Text>
          </View>
        </Animated.View>

        {/* Instructions */}
        <Animated.View
          entering={FadeInUp.delay(600).duration(400)}
          style={styles.instructions}
        >
          <Feather name="info" size={16} color="rgba(255,255,255,0.4)" />
          <Text style={styles.instructionsText}>
            Show this QR code at the venue for check-in. Keep your screen brightness high for easy scanning.
          </Text>
        </Animated.View>
      </ScrollView>

      {/* Bottom Actions — absolute footer so it overlays scroll content; ScrollView paddingBottom keeps text clear */}
      <Animated.View
        entering={FadeInUp.delay(800).duration(400)}
        style={[styles.bottomSection, { paddingBottom: insets.bottom + 16 }]}
      >
        <Pressable style={styles.addToWalletButton}>
          <Feather name="credit-card" size={20} color={tokens.colors.primary} />
          <Text style={styles.addToWalletText}>Add to Wallet</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  shareButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentScroll: {
    flex: 1,
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 140, // clear the absolute "Add to Wallet" footer
  },
  centeredContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  loadingText: {
    color: 'rgba(255,255,255,0.7)',
    marginTop: 16,
    fontSize: 14,
    fontWeight: '500',
  },
  errorIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.65)',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 28,
  },
  errorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 14,
  },
  errorButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: tokens.colors.primary,
  },
  qrCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 24,
    alignItems: 'center',
    width: '100%',
    maxWidth: 340,
    position: 'relative',
    overflow: 'hidden',
  },
  qrGlow: {
    position: 'absolute',
    top: -50,
    left: -50,
    right: -50,
    bottom: -50,
    backgroundColor: tokens.colors.primary,
    opacity: 0.1,
  },
  qrWrapper: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ticketNumberContainer: {
    alignItems: 'center',
    marginBottom: 16,
    maxWidth: '100%',
  },
  ticketLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: tokens.colors.text.tertiary,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  ticketNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: tokens.colors.text.primary,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    paddingHorizontal: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  eventDetails: {
    alignItems: 'center',
    marginTop: 32,
    paddingHorizontal: 20,
  },
  eventTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
  },
  detailsRow: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  instructions: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginTop: 40,
    paddingHorizontal: 20,
  },
  instructionsText: {
    flex: 1,
    fontSize: 13,
    color: 'rgba(255,255,255,0.4)',
    lineHeight: 18,
  },
  bottomSection: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: 'rgba(0,0,0,0.65)',
  },
  addToWalletButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    borderRadius: 16,
  },
  addToWalletText: {
    fontSize: 16,
    fontWeight: '700',
    color: tokens.colors.primary,
  },
});
