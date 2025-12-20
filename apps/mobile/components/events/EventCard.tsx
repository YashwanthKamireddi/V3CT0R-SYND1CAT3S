import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { theme } from '@/lib/constants/theme';
import type { Event } from '@/lib/types';
import { getCategoryIcon, getCategoryColor } from '@/lib/constants/categories';
import { format } from 'date-fns';
import Button from '../ui/Button';

interface EventCardProps {
  event: Event;
  variant?: 'default' | 'compact' | 'featured';
  onPress?: () => void;
  onRegister?: () => void;
}

export default function EventCard({
  event,
  variant = 'default',
  onPress,
  onRegister,
}: EventCardProps) {
  if (variant === 'compact') {
    return <CompactCard event={event} onPress={onPress} />;
  }

  if (variant === 'featured') {
    return <FeaturedCard event={event} onPress={onPress} onRegister={onRegister} />;
  }

  return <DefaultCard event={event} onPress={onPress} onRegister={onRegister} />;
}

function DefaultCard({ event, onPress, onRegister }: EventCardProps) {
  const categoryColor = getCategoryColor(event.category);
  const categoryIcon = getCategoryIcon(event.category);

  const spotsLeft = event.capacity - event.registered;
  const isAlmostFull = spotsLeft <= 10 && spotsLeft > 0;
  const isFull = spotsLeft <= 0;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.9}
    >
      {/* Image */}
      <Image
        source={{ uri: event.image }}
        style={styles.image}
        resizeMode="cover"
      />

      {/* Content */}
      <View style={styles.content}>
        {/* Category & Points */}
        <View style={styles.row}>
          <View style={[styles.categoryBadge, { backgroundColor: `${categoryColor}15` }]}>
            <Text style={styles.categoryIcon}>{categoryIcon}</Text>
            <Text style={[styles.categoryText, { color: categoryColor }]}>
              {event.category}
            </Text>
          </View>
          <Text style={styles.points}>⭐ {event.points} pts</Text>
        </View>

        {/* Title */}
        <Text style={styles.title} numberOfLines={2}>
          {event.title}
        </Text>

        {/* Subtitle */}
        {event.subtitle && (
          <Text style={styles.subtitle} numberOfLines={1}>
            {event.subtitle}
          </Text>
        )}

        {/* Date, Time, Location */}
        <View style={styles.details}>
          <Text style={styles.detailText}>
            📅 {format(new Date(event.startDate), 'MMM dd • h:mm a')}
          </Text>
          <Text style={styles.detailText}>
            📍 {event.venue}
          </Text>
          <Text style={[
            styles.detailText,
            isFull && styles.fullText,
            isAlmostFull && styles.almostFullText
          ]}>
            👥 {event.registered}/{event.capacity}
            {isAlmostFull && ' - Almost Full!'}
            {isFull && ' - Full'}
          </Text>
        </View>

        {/* Register Button */}
        {onRegister && (
          <Button
            onPress={onRegister}
            fullWidth
            disabled={isFull}
            variant={isFull ? 'secondary' : 'primary'}
            size="md"
          >
            {isFull ? 'Full - Join Waitlist' : 'Register'}
          </Button>
        )}
      </View>
    </TouchableOpacity>
  );
}

function CompactCard({ event, onPress }: Partial<EventCardProps>) {
  const categoryIcon = getCategoryIcon(event!.category);

  return (
    <TouchableOpacity style={styles.compactCard} onPress={onPress} activeOpacity={0.9}>
      <Image source={{ uri: event!.image }} style={styles.compactImage} />
      <View style={styles.compactContent}>
        <Text style={styles.compactTitle} numberOfLines={1}>
          {categoryIcon} {event!.title}
        </Text>
        <Text style={styles.compactDate}>
          {format(new Date(event!.startDate), 'MMM dd, h:mm a')}
        </Text>
        <Text style={styles.compactLocation} numberOfLines={1}>
          📍 {event!.venue}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

function FeaturedCard({ event, onPress, onRegister }: EventCardProps) {
  const categoryIcon = getCategoryIcon(event.category);

  return (
    <TouchableOpacity style={styles.featuredCard} onPress={onPress} activeOpacity={0.9}>
      <Image source={{ uri: event.image }} style={styles.featuredImage} />
      <View style={styles.featuredOverlay}>
        <Text style={styles.featuredBadge}>✨ Featured Event</Text>
        <Text style={styles.featuredTitle}>{event.title}</Text>
        <Text style={styles.featuredSubtitle}>{event.subtitle}</Text>
        <View style={styles.featuredInfo}>
          <Text style={styles.featuredDate}>
            📅 {format(new Date(event.startDate), 'MMMM dd • h:mm a')}
          </Text>
          <Text style={styles.featuredLocation}>
            📍 {event.venue}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  // Default Card
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    marginBottom: theme.spacing['2xl'],
    ...theme.shadows.md,
  },
  image: {
    width: '100%',
    height: 180,
    backgroundColor: theme.colors.neutral[100],
  },
  content: {
    padding: theme.spacing.lg,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
  },
  categoryIcon: {
    fontSize: 14,
    marginRight: theme.spacing.xs,
  },
  categoryText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  points: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.semantic.warning,
  },
  title: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: '700',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.md,
  },
  details: {
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.lg,
  },
  detailText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  fullText: {
    color: theme.colors.semantic.error,
    fontWeight: '600',
  },
  almostFullText: {
    color: theme.colors.semantic.warning,
    fontWeight: '600',
  },

  // Compact Card
  compactCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
  },
  compactImage: {
    width: 80,
    height: 80,
    borderRadius: theme.borderRadius.sm,
    marginRight: theme.spacing.md,
  },
  compactContent: {
    flex: 1,
    justifyContent: 'center',
  },
  compactTitle: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  compactDate: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginBottom: 2,
  },
  compactLocation: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.tertiary,
  },

  // Featured Card
  featuredCard: {
    height: 280,
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
    marginBottom: theme.spacing['2xl'],
    ...theme.shadows.lg,
  },
  featuredImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  featuredOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
    padding: theme.spacing['2xl'],
  },
  featuredBadge: {
    color: '#FFFFFF',
    fontSize: theme.typography.fontSize.sm,
    fontWeight: '600',
    marginBottom: theme.spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  featuredTitle: {
    color: '#FFFFFF',
    fontSize: theme.typography.fontSize['3xl'],
    fontWeight: '700',
    marginBottom: theme.spacing.xs,
  },
  featuredSubtitle: {
    color: '#FFFFFF',
    fontSize: theme.typography.fontSize.base,
    opacity: 0.9,
    marginBottom: theme.spacing.md,
  },
  featuredInfo: {
    gap: theme.spacing.xs,
  },
  featuredDate: {
    color: '#FFFFFF',
    fontSize: theme.typography.fontSize.sm,
    opacity: 0.9,
  },
  featuredLocation: {
    color: '#FFFFFF',
    fontSize: theme.typography.fontSize.sm,
    opacity: 0.9,
  },
});
