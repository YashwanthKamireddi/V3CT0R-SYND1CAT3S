/**
 * Badge System Configuration
 */

export const BADGES = [
  // Participation Badges
  {
    id: 'first_event',
    name: 'First Step',
    description: 'Attended your first event',
    icon: '🎯',
    color: '#7C3AED',
    requirement: { type: 'events_attended', count: 1 },
    points: 10,
    rarity: 'common',
  },
  {
    id: 'early_bird',
    name: 'Early Bird',
    description: 'Registered for 5 events',
    icon: '🐦',
    color: '#F59E0B',
    requirement: { type: 'events_registered', count: 5 },
    points: 25,
    rarity: 'common',
  },
  {
    id: 'active_participant',
    name: 'Active Participant',
    description: 'Attended 10 events',
    icon: '⚡',
    color: '#10B981',
    requirement: { type: 'events_attended', count: 10 },
    points: 50,
    rarity: 'uncommon',
  },
  {
    id: 'event_master',
    name: 'Event Master',
    description: 'Attended 25 events',
    icon: '🏆',
    color: '#EF4444',
    requirement: { type: 'events_attended', count: 25 },
    points: 100,
    rarity: 'rare',
  },
  {
    id: 'legend',
    name: 'Campus Legend',
    description: 'Attended 50 events',
    icon: '👑',
    color: '#EC4899',
    requirement: { type: 'events_attended', count: 50 },
    points: 250,
    rarity: 'legendary',
  },

  // Category-Specific Badges
  {
    id: 'tech_enthusiast',
    name: 'Tech Enthusiast',
    description: 'Attended 5 tech events',
    icon: '💻',
    color: '#3B82F6',
    requirement: { type: 'category_events', category: 'tech', count: 5 },
    points: 50,
    rarity: 'uncommon',
  },
  {
    id: 'music_lover',
    name: 'Music Lover',
    description: 'Attended 5 music events',
    icon: '🎵',
    color: '#EC4899',
    requirement: { type: 'category_events', category: 'music', count: 5 },
    points: 50,
    rarity: 'uncommon',
  },
  {
    id: 'sports_fan',
    name: 'Sports Fan',
    description: 'Attended 5 sports events',
    icon: '⚽',
    color: '#10B981',
    requirement: { type: 'category_events', category: 'sports', count: 5 },
    points: 50,
    rarity: 'uncommon',
  },
  {
    id: 'art_connoisseur',
    name: 'Art Connoisseur',
    description: 'Attended 5 art events',
    icon: '🎨',
    color: '#F59E0B',
    requirement: { type: 'category_events', category: 'art', count: 5 },
    points: 50,
    rarity: 'uncommon',
  },

  // Social Badges
  {
    id: 'social_butterfly',
    name: 'Social Butterfly',
    description: 'Invited 10 friends to events',
    icon: '🦋',
    color: '#A855F7',
    requirement: { type: 'friends_invited', count: 10 },
    points: 75,
    rarity: 'rare',
  },
  {
    id: 'influencer',
    name: 'Campus Influencer',
    description: '25 friends attended events you shared',
    icon: '🌟',
    color: '#EAB308',
    requirement: { type: 'friend_conversions', count: 25 },
    points: 150,
    rarity: 'epic',
  },

  // Streak Badges
  {
    id: 'week_warrior',
    name: 'Week Warrior',
    description: 'Attended events 7 days in a row',
    icon: '🔥',
    color: '#EF4444',
    requirement: { type: 'streak_days', count: 7 },
    points: 100,
    rarity: 'rare',
  },
  {
    id: 'month_master',
    name: 'Month Master',
    description: 'Attended at least one event every week for a month',
    icon: '📅',
    color: '#8B5CF6',
    requirement: { type: 'monthly_consistency', weeks: 4 },
    points: 200,
    rarity: 'epic',
  },

  // Special Badges
  {
    id: 'punctual',
    name: 'Always On Time',
    description: 'Checked in within 5 minutes for 10 events',
    icon: '⏰',
    color: '#06B6D4',
    requirement: { type: 'punctuality', count: 10 },
    points: 75,
    rarity: 'rare',
  },
  {
    id: 'explorer',
    name: 'Explorer',
    description: 'Attended events from 10 different organizations',
    icon: '🗺️',
    color: '#14B8A6',
    requirement: { type: 'unique_orgs', count: 10 },
    points: 100,
    rarity: 'rare',
  },
  {
    id: 'diverse',
    name: 'Diverse Interests',
    description: 'Attended events from all categories',
    icon: '🌈',
    color: '#F97316',
    requirement: { type: 'all_categories' },
    points: 150,
    rarity: 'epic',
  },

  // Organizer Badges
  {
    id: 'first_organizer',
    name: 'First Organizer',
    description: 'Organized your first event',
    icon: '🎪',
    color: '#7C3AED',
    requirement: { type: 'events_organized', count: 1 },
    points: 50,
    rarity: 'uncommon',
  },
  {
    id: 'event_creator',
    name: 'Event Creator',
    description: 'Organized 5 successful events',
    icon: '🎬',
    color: '#EC4899',
    requirement: { type: 'events_organized', count: 5 },
    points: 200,
    rarity: 'epic',
  },

  // Milestone Badges
  {
    id: 'top_10',
    name: 'Top 10',
    description: 'Reached top 10 on leaderboard',
    icon: '🥇',
    color: '#EAB308',
    requirement: { type: 'leaderboard_rank', rank: 10 },
    points: 300,
    rarity: 'legendary',
  },
  {
    id: 'point_collector',
    name: 'Point Collector',
    description: 'Earned 1000 points',
    icon: '💎',
    color: '#6366F1',
    requirement: { type: 'total_points', count: 1000 },
    points: 0,
    rarity: 'epic',
  },
] as const;

export type BadgeId = typeof BADGES[number]['id'];
export type BadgeRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export const RARITY_COLORS = {
  common: '#94A3B8',
  uncommon: '#10B981',
  rare: '#3B82F6',
  epic: '#A855F7',
  legendary: '#F59E0B',
} as const;

export const getBadgeById = (id: BadgeId) => {
  return BADGES.find(badge => badge.id === id);
};

export const getBadgesByRarity = (rarity: BadgeRarity) => {
  return BADGES.filter(badge => badge.rarity === rarity);
};

export const getRarityColor = (rarity: BadgeRarity) => {
  return RARITY_COLORS[rarity];
};

export default BADGES;
