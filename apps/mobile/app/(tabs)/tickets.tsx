/**
 * My Events Screen - CampusPulse Design System
 * Shows registered campus events and attendance history
 * Connected to real Supabase backend
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Image,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Animated, {
  FadeInDown,
  FadeInRight,
  useAnimatedStyle,
  withTiming,
  useSharedValue,
} from 'react-native-reanimated';

import { tokens, layout } from '@/lib/styles/unified';
import { useTickets } from '@/lib/hooks/useTickets';
import { useAuth } from '@/lib/context/AuthContext';
import { RegistrationWithEvent } from '@/lib/supabase/database.types';

type TicketStatus = 'active' | 'upcoming' | 'past' | 'cancelled';

interface Ticket {
  id: string;
  eventId: string;
  eventTitle: string;
  eventImage: string;
  date: string;
  time: string;
  location: string;
  ticketNumber: string;
  status: TicketStatus;
  price: string;
  category: string;
  points?: number;
}

// Format registration to ticket display format
const formatRegistrationToTicket = (reg: RegistrationWithEvent): Ticket => {
  const event = reg.events;
  // Use 'date' field from the database schema
  const eventDate = event?.date ? new Date(event.date) : new Date();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let status: TicketStatus = 'upcoming';
  if (reg.status === 'cancelled') {
    status = 'cancelled';
  } else if (reg.checked_in) {
    // Use checked_in boolean instead of status === 'attended'
    status = 'past';
  } else if (eventDate < today) {
    status = 'past';
  } else if (eventDate.toDateString() === today.toDateString()) {
    status = 'active';
  }

  return {
    id: reg.id,
    eventId: reg.event_id ?? '',
    eventTitle: event?.title || 'Unknown Event',
    eventImage: event?.image_url || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&q=80',
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
    location: event?.venue || 'TBD',
    ticketNumber: reg.qr_token || `GITAM-${reg.id.slice(0, 8).toUpperCase()}`,
    status,
    price: 'Free',
    category: event?.category || 'Event',
    points: event?.points || 0,  // Use 'points' field from database schema
  };
};

// Tab Component
interface TabProps {
  label: string;
  active: boolean;
  count: number;
  onPress: () => void;
}

function Tab({ label, active, count, onPress }: TabProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withTiming(0.95, { duration: 100 });
  };

  const handlePressOut = () => {
    scale.value = withTiming(1, { duration: 150 });
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.tab, active && styles.tabActive]}
    >
      <Animated.View style={[styles.tabInner, animatedStyle]}>
        <Text style={[styles.tabText, active && styles.tabTextActive]}>
          {label}
        </Text>
        {count > 0 && (
          <View style={[styles.tabBadge, active && styles.tabBadgeActive]}>
            <Text style={[styles.tabBadgeText, active && styles.tabBadgeTextActive]}>
              {count}
            </Text>
          </View>
        )}
      </Animated.View>
    </Pressable>
  );
}

// Ticket Card Component
interface TicketCardProps {
  ticket: Ticket;
  index: number;
  onPress: () => void;
  onShowQR: () => void;
  onCheckIn: () => void;
}

function TicketCard({ ticket, index, onPress, onShowQR, onCheckIn }: TicketCardProps) {
  const isUpcoming = ticket.status === 'upcoming';
  const isActive = ticket.status === 'active' || ticket.status === 'upcoming';
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withTiming(0.98, { duration: 100 });
  };

  const handlePressOut = () => {
    scale.value = withTiming(1, { duration: 150 });
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const handleShowQR = (e: any) => {
    e.stopPropagation();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onShowQR();
  };

  const handleCheckIn = (e: any) => {
    e.stopPropagation();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onCheckIn();
  };

  return (
    <Animated.View entering={FadeInDown.delay(index * 100).duration(400)}>
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <Animated.View style={[styles.ticketCard, animatedStyle]}>
          {/* Ticket Image */}
          <View style={styles.ticketImageContainer}>
            <Image source={{ uri: ticket.eventImage }} style={styles.ticketImage} />
            {!isUpcoming && <View style={styles.ticketImageOverlay} />}
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText}>{ticket.category}</Text>
            </View>
          </View>

          {/* Ticket Info */}
          <View style={styles.ticketInfo}>
            <Text style={styles.ticketTitle} numberOfLines={1}>
              {ticket.eventTitle}
            </Text>

            <View style={styles.ticketDetails}>
              <View style={styles.ticketDetailRow}>
                <Feather name="calendar" size={14} color={tokens.colors.text.tertiary} />
                <Text style={styles.ticketDetailText}>{ticket.date}</Text>
              </View>
              <View style={styles.ticketDetailRow}>
                <Feather name="clock" size={14} color={tokens.colors.text.tertiary} />
                <Text style={styles.ticketDetailText}>{ticket.time}</Text>
              </View>
            </View>

            <View style={styles.ticketDetailRow}>
              <Feather name="map-pin" size={14} color={tokens.colors.text.tertiary} />
              <Text style={styles.ticketDetailText} numberOfLines={1}>
                {ticket.location}
              </Text>
            </View>
          </View>

          {/* Divider with circles */}
          <View style={styles.dividerContainer}>
            <View style={styles.dividerCircleLeft} />
            <View style={styles.dividerLine} />
            <View style={styles.dividerCircleRight} />
          </View>

          {/* Ticket Footer */}
          <View style={styles.ticketFooter}>
            <View style={styles.ticketNumberContainer}>
              <Text style={styles.ticketNumberLabel}>Ticket No.</Text>
              <Text style={styles.ticketNumber} numberOfLines={1}>{ticket.ticketNumber}</Text>
            </View>
            {isActive ? (
              <View style={styles.ticketActions}>
                <Pressable
                  style={styles.qrButton}
                  onPress={handleShowQR}
                >
                  <Feather name="maximize" size={16} color={tokens.colors.primary} />
                </Pressable>
                <Pressable
                  style={styles.checkInButton}
                  onPress={handleCheckIn}
                >
                  <Feather name="camera" size={14} color="#FFFFFF" />
                  <Text style={styles.checkInButtonText}>Check-in</Text>
                </Pressable>
              </View>
            ) : (
              <View style={styles.pastEventBadges}>
                {ticket.points && (
                  <View style={styles.pointsEarnedBadge}>
                    <Feather name="award" size={11} color="#F59E0B" />
                    <Text style={styles.pointsEarnedText}>+{ticket.points}</Text>
                  </View>
                )}
                <View style={styles.statusBadge}>
                  <Feather name="check-circle" size={12} color={tokens.colors.success} />
                  <Text style={styles.statusBadgeText}>Attended</Text>
                </View>
              </View>
            )}
          </View>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

// Empty State Component
function EmptyState({ type }: { type: 'upcoming' | 'past' }) {
  return (
    <Animated.View entering={FadeInDown.duration(400)} style={styles.emptyState}>
      <View style={styles.emptyIconContainer}>
        <Feather
          name={type === 'upcoming' ? 'calendar' : 'archive'}
          size={48}
          color={tokens.colors.text.tertiary}
        />
      </View>
      <Text style={styles.emptyTitle}>
        {type === 'upcoming' ? 'No Upcoming Events' : 'No Past Events'}
      </Text>
      <Text style={styles.emptyDescription}>
        {type === 'upcoming'
          ? 'Browse campus events and register now!'
          : 'Your attended events will appear here.'}
      </Text>
    </Animated.View>
  );
}

export default function TicketsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [refreshing, setRefreshing] = useState(false);

  // Real data from Supabase
  const { isAuthenticated } = useAuth();
  const { upcoming, past, isLoading, error, refresh } = useTickets();

  // Format tickets for display
  const upcomingTickets = useMemo(() => upcoming.map(formatRegistrationToTicket), [upcoming]);
  const pastTickets = useMemo(() => past.map(formatRegistrationToTicket), [past]);

  const currentTickets = activeTab === 'upcoming' ? upcomingTickets : pastTickets;

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }, [refresh]);

  // Show login prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
          <View>
            <Text style={styles.headerTitle}>My Events</Text>
            <Text style={styles.headerSubtitle}>Your registered events</Text>
          </View>
        </View>
        <View style={styles.loginPrompt}>
          <Feather name="lock" size={48} color={tokens.colors.text.tertiary} />
          <Text style={styles.loginPromptTitle}>Sign In Required</Text>
          <Text style={styles.loginPromptText}>Please sign in to view your registered events</Text>
          <Pressable
            style={styles.loginButton}
            onPress={() => router.push('/auth/login')}
          >
            <Text style={styles.loginButtonText}>Sign In</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <Animated.View
        entering={FadeInDown.duration(400)}
        style={[styles.header, { paddingTop: insets.top + 16 }]}
      >
        <View>
          <Text style={styles.headerTitle}>My Events</Text>
          <Text style={styles.headerSubtitle}>Your registered events</Text>
        </View>
        <Pressable style={styles.headerButton}>
          <Feather name="more-horizontal" size={24} color={tokens.colors.text.primary} />
        </Pressable>
      </Animated.View>

      {/* Tabs */}
      <Animated.View
        entering={FadeInDown.delay(100).duration(400)}
        style={styles.tabsContainer}
      >
        <Tab
          label="Upcoming"
          active={activeTab === 'upcoming'}
          count={upcomingTickets.length}
          onPress={() => setActiveTab('upcoming')}
        />
        <Tab
          label="Past"
          active={activeTab === 'past'}
          count={pastTickets.length}
          onPress={() => setActiveTab('past')}
        />
      </Animated.View>

      {/* Loading State */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={tokens.colors.primary} />
          <Text style={styles.loadingText}>Loading your events...</Text>
        </View>
      ) : (
        /* Tickets List */
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 90 },
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={tokens.colors.primary}
            />
          }
        >
          {currentTickets.length > 0 ? (
            currentTickets.map((ticket, index) => (
              <TicketCard
                key={ticket.id}
                ticket={ticket}
                index={index}
                onPress={() => router.push(`/event/${ticket.eventId}`)}
                onShowQR={() => router.push({
                  pathname: '/ticket-qr',
                  params: {
                    ticketNumber: ticket.ticketNumber,
                    eventTitle: ticket.eventTitle,
                    date: ticket.date,
                    time: ticket.time,
                    location: ticket.location,
                    status: ticket.status,
                  }
                })}
                onCheckIn={() => router.push({
                  pathname: '/qr-scanner',
                  params: {
                    eventId: ticket.eventId,
                    ticketNumber: ticket.ticketNumber,
                  }
                })}
              />
            ))
          ) : (
            <EmptyState type={activeTab} />
          )}
        </ScrollView>
      )}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: tokens.colors.background.primary,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: tokens.colors.text.primary,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: tokens.colors.text.secondary,
    marginTop: 4,
    fontWeight: '500',
  },
  headerButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: tokens.colors.background.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: tokens.colors.border.light,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: tokens.colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.border.light,
    gap: 14,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: tokens.colors.background.tertiary,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: tokens.colors.border.light,
  },
  tabActive: {
    backgroundColor: tokens.colors.primary,
    borderColor: tokens.colors.primary,
    shadowColor: tokens.colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 5,
  },
  tabInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '700',
    color: tokens.colors.text.secondary,
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  tabBadge: {
    backgroundColor: tokens.colors.border.light,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  tabBadgeActive: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  tabBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: tokens.colors.text.secondary,
  },
  tabBadgeTextActive: {
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    gap: 16,
  },
  ticketCard: {
    backgroundColor: tokens.colors.background.primary,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 5,
    borderWidth: 1,
    borderColor: tokens.colors.border.light,
  },
  ticketImageContainer: {
    height: 150,
    position: 'relative',
  },
  ticketImage: {
    width: '100%',
    height: '100%',
  },
  ticketImageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  categoryBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: tokens.colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  categoryBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  ticketInfo: {
    padding: 18,
  },
  ticketTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: tokens.colors.text.primary,
    marginBottom: 14,
    letterSpacing: -0.2,
  },
  ticketDetails: {
    flexDirection: 'row',
    gap: 18,
    marginBottom: 10,
  },
  ticketDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ticketDetailText: {
    fontSize: 14,
    color: tokens.colors.text.secondary,
    flex: 1,
    fontWeight: '500',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 0,
  },
  dividerCircleLeft: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: tokens.colors.background.secondary,
    marginLeft: -12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: tokens.colors.border.light,
  },
  dividerCircleRight: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: tokens.colors.background.secondary,
    marginRight: -12,
  },
  ticketFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  ticketNumberContainer: {
    flex: 1,
    marginRight: 12,
  },
  ticketNumberLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: tokens.colors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  ticketNumber: {
    fontSize: 12,
    fontWeight: '700',
    color: tokens.colors.text.primary,
    fontFamily: 'monospace',
    letterSpacing: 0.2,
  },
  qrButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: tokens.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ticketActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  checkInButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: tokens.colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    height: 40,
  },
  checkInButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: tokens.colors.successLight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: tokens.colors.success,
  },
  pastEventBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 1,
  },
  pointsEarnedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
  },
  pointsEarnedText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#F59E0B',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: tokens.colors.background.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: tokens.colors.text.primary,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: tokens.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  loadingText: {
    fontSize: 14,
    color: tokens.colors.text.tertiary,
    marginTop: 12,
  },
  loginPrompt: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  loginPromptTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: tokens.colors.text.primary,
    marginTop: 20,
    marginBottom: 8,
  },
  loginPromptText: {
    fontSize: 14,
    color: tokens.colors.text.secondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  loginButton: {
    backgroundColor: tokens.colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
