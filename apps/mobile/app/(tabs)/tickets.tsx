/**
 * My Events Screen - CampusPulse Design System
 * Shows registered campus events and attendance history
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Image,
  StyleSheet,
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

type TicketStatus = 'active' | 'upcoming' | 'past' | 'cancelled';

interface Ticket {
  id: string;
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

// Yashwanth's Event Registrations - 18 Events Attended
const TICKETS: Ticket[] = [
  {
    id: '1',
    eventTitle: 'CodeVerse Hackathon 2025',
    eventImage: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&q=80',
    date: 'Dec 22-23, 2025',
    time: '9:00 AM',
    location: 'Main Auditorium',
    ticketNumber: 'SRM-2025-4821',
    status: 'upcoming',
    price: 'Free',
    category: 'Hackathon',
    points: 100,
  },
  {
    id: '2',
    eventTitle: 'AI/ML Workshop Series',
    eventImage: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&q=80',
    date: 'Dec 21, 2025',
    time: '10:00 AM',
    location: 'Computer Lab 301',
    ticketNumber: 'SRM-2025-4756',
    status: 'active',
    price: 'Free',
    category: 'Workshop',
    points: 50,
  },
  {
    id: '3',
    eventTitle: 'Guest Lecture: Future of FinTech',
    eventImage: 'https://images.unsplash.com/photo-1560439514-4e9645039924?w=800&q=80',
    date: 'Dec 15, 2025',
    time: '2:00 PM',
    location: 'Seminar Hall A',
    ticketNumber: 'SRM-2025-4512',
    status: 'past',
    price: 'Free',
    category: 'Seminar',
    points: 30,
  },
  {
    id: '4',
    eventTitle: 'Web Dev Bootcamp - React',
    eventImage: 'https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?w=800&q=80',
    date: 'Dec 08, 2025',
    time: '10:00 AM',
    location: 'IT Lab 201',
    ticketNumber: 'SRM-2025-4234',
    status: 'past',
    price: 'Free',
    category: 'Workshop',
    points: 50,
  },
  {
    id: '5',
    eventTitle: 'Annual Cultural Fest - Rhythm',
    eventImage: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80',
    date: 'Nov 26-28, 2025',
    time: '5:00 PM',
    location: 'Open Air Theatre',
    ticketNumber: 'SRM-2025-3987',
    status: 'past',
    price: 'Free',
    category: 'Cultural',
    points: 75,
  },
  {
    id: '6',
    eventTitle: 'Data Science Symposium',
    eventImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80',
    date: 'Nov 20, 2025',
    time: '9:30 AM',
    location: 'Tech Park Auditorium',
    ticketNumber: 'SRM-2025-3756',
    status: 'past',
    price: 'Free',
    category: 'Technical',
    points: 40,
  },
  {
    id: '7',
    eventTitle: 'Entrepreneurship Summit',
    eventImage: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&q=80',
    date: 'Nov 12, 2025',
    time: '10:00 AM',
    location: 'Conference Hall',
    ticketNumber: 'SRM-2025-3512',
    status: 'past',
    price: 'Free',
    category: 'Seminar',
    points: 35,
  },
  {
    id: '8',
    eventTitle: 'Cloud Computing Workshop',
    eventImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80',
    date: 'Nov 05, 2025',
    time: '2:00 PM',
    location: 'Cloud Lab',
    ticketNumber: 'SRM-2025-3298',
    status: 'past',
    price: 'Free',
    category: 'Workshop',
    points: 45,
  },
  {
    id: '9',
    eventTitle: 'Photography Club Exhibition',
    eventImage: 'https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=800&q=80',
    date: 'Oct 28, 2025',
    time: '11:00 AM',
    location: 'Art Gallery',
    ticketNumber: 'SRM-2025-3045',
    status: 'past',
    price: 'Free',
    category: 'Club',
    points: 20,
  },
  {
    id: '10',
    eventTitle: 'Inter-College Basketball Tournament',
    eventImage: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&q=80',
    date: 'Oct 22, 2025',
    time: '9:00 AM',
    location: 'Sports Complex',
    ticketNumber: 'SRM-2025-2856',
    status: 'past',
    price: 'Free',
    category: 'Sports',
    points: 30,
  },
  {
    id: '11',
    eventTitle: 'Cybersecurity Awareness Workshop',
    eventImage: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=80',
    date: 'Oct 15, 2025',
    time: '3:00 PM',
    location: 'Seminar Hall B',
    ticketNumber: 'SRM-2025-2612',
    status: 'past',
    price: 'Free',
    category: 'Workshop',
    points: 40,
  },
  {
    id: '12',
    eventTitle: 'Open Source Contribution Day',
    eventImage: 'https://images.unsplash.com/photo-1556075798-4825dfaaf498?w=800&q=80',
    date: 'Oct 08, 2025',
    time: '10:00 AM',
    location: 'Innovation Hub',
    ticketNumber: 'SRM-2025-2389',
    status: 'past',
    price: 'Free',
    category: 'Technical',
    points: 60,
  },
  {
    id: '13',
    eventTitle: 'Freshers Orientation',
    eventImage: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800&q=80',
    date: 'Aug 15, 2023',
    time: '9:00 AM',
    location: 'Main Auditorium',
    ticketNumber: 'SRM-2023-0124',
    status: 'past',
    price: 'Free',
    category: 'Cultural',
    points: 25,
  },
];

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
            <View>
              <Text style={styles.ticketNumberLabel}>Ticket No.</Text>
              <Text style={styles.ticketNumber}>{ticket.ticketNumber}</Text>
            </View>
            {isActive ? (
              <View style={styles.ticketActions}>
                <Pressable
                  style={styles.qrButton}
                  onPress={handleShowQR}
                >
                  <Feather name="maximize" size={18} color={tokens.colors.primary} />
                </Pressable>
                <Pressable
                  style={styles.checkInButton}
                  onPress={handleCheckIn}
                >
                  <Feather name="camera" size={16} color="#FFFFFF" />
                  <Text style={styles.checkInButtonText}>Check-in</Text>
                </Pressable>
              </View>
            ) : (
              <View style={styles.statusBadge}>
                <Feather name="check-circle" size={14} color={tokens.colors.success} />
                <Text style={styles.statusBadgeText}>Attended</Text>
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

  const upcomingTickets = TICKETS.filter((t) => t.status === 'upcoming');
  const pastTickets = TICKETS.filter((t) => t.status === 'past');

  const currentTickets = activeTab === 'upcoming' ? upcomingTickets : pastTickets;

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

      {/* Tickets List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {currentTickets.length > 0 ? (
          currentTickets.map((ticket, index) => (
            <TicketCard
              key={ticket.id}
              ticket={ticket}
              index={index}
              onPress={() => router.push(`/event/${ticket.id}`)}
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
                  eventId: ticket.id,
                  ticketNumber: ticket.ticketNumber,
                }
              })}
            />
          ))
        ) : (
          <EmptyState type={activeTab} />
        )}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: tokens.colors.background.primary,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: tokens.colors.text.primary,
  },
  headerSubtitle: {
    fontSize: 14,
    color: tokens.colors.text.secondary,
    marginTop: 2,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: tokens.colors.background.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: tokens.colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.border.light,
    gap: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: tokens.colors.background.tertiary,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: tokens.colors.primary,
    shadowColor: tokens.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  tabInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
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
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  ticketImageContainer: {
    height: 140,
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
    padding: 16,
  },
  ticketTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: tokens.colors.text.primary,
    marginBottom: 12,
  },
  ticketDetails: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 8,
  },
  ticketDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ticketDetailText: {
    fontSize: 13,
    color: tokens.colors.text.secondary,
    flex: 1,
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
    padding: 16,
  },
  ticketNumberLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: tokens.colors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  ticketNumber: {
    fontSize: 15,
    fontWeight: '700',
    color: tokens.colors.text.primary,
    fontFamily: 'monospace',
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
    gap: 6,
    backgroundColor: tokens.colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  checkInButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: tokens.colors.successLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusBadgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: tokens.colors.success,
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
});
