/**
 * Event Categories Configuration - Evenro Inspired
 * Modern category system with vibrant colors and Lucide icon names
 */

import { theme } from './theme';

export interface Category {
  id: string;
  name: string;
  icon: string; // Lucide icon name
  emoji: string; // Fallback emoji
  color: string;
  lightColor: string;
  gradient: [string, string];
  description: string;
}

export const EVENT_CATEGORIES: Category[] = [
  {
    id: 'music',
    name: 'Music',
    icon: 'music',
    emoji: '🎵',
    color: '#FF6B35',
    lightColor: '#FFF4F0',
    gradient: ['#FF6B35', '#E64A19'],
    description: 'Concerts, live performances, and music festivals',
  },
  {
    id: 'sports',
    name: 'Sports',
    icon: 'trophy',
    emoji: '⚽',
    color: '#00BFA5',
    lightColor: '#E0F7F4',
    gradient: ['#00BFA5', '#009985'],
    description: 'Games, tournaments, and athletic events',
  },
  {
    id: 'art',
    name: 'Art',
    icon: 'palette',
    emoji: '🎨',
    color: '#6C63FF',
    lightColor: '#F3F0FF',
    gradient: ['#6C63FF', '#4A42CC'],
    description: 'Exhibitions, galleries, and creative showcases',
  },
  {
    id: 'food',
    name: 'Food & Drink',
    icon: 'utensils',
    emoji: '🍔',
    color: '#F44336',
    lightColor: '#FFEBEE',
    gradient: ['#F44336', '#D32F2F'],
    description: 'Food festivals, tastings, and culinary events',
  },
  {
    id: 'tech',
    name: 'Technology',
    icon: 'laptop',
    emoji: '💻',
    color: '#2196F3',
    lightColor: '#E3F2FD',
    gradient: ['#2196F3', '#1565C0'],
    description: 'Tech talks, demos, and innovation showcases',
  },
  {
    id: 'party',
    name: 'Nightlife',
    icon: 'party-popper',
    emoji: '🎉',
    color: '#E91E63',
    lightColor: '#FCE4EC',
    gradient: ['#E91E63', '#C2185B'],
    description: 'Parties, clubs, and nightlife events',
  },
  {
    id: 'workshop',
    name: 'Workshop',
    icon: 'wrench',
    emoji: '🛠️',
    color: '#FF9800',
    lightColor: '#FFF3E0',
    gradient: ['#FF9800', '#EF6C00'],
    description: 'Hands-on learning and skill-building sessions',
  },
  {
    id: 'conference',
    name: 'Conference',
    icon: 'presentation',
    emoji: '📊',
    color: '#607D8B',
    lightColor: '#ECEFF1',
    gradient: ['#607D8B', '#455A64'],
    description: 'Professional conferences and summits',
  },
  {
    id: 'networking',
    name: 'Networking',
    icon: 'users',
    emoji: '🤝',
    color: '#9C27B0',
    lightColor: '#F3E5F5',
    gradient: ['#9C27B0', '#7B1FA2'],
    description: 'Professional meetups and social mixers',
  },
  {
    id: 'theater',
    name: 'Theater',
    icon: 'drama',
    emoji: '🎭',
    color: '#795548',
    lightColor: '#EFEBE9',
    gradient: ['#795548', '#5D4037'],
    description: 'Plays, musicals, and theatrical performances',
  },
  {
    id: 'fitness',
    name: 'Fitness',
    icon: 'dumbbell',
    emoji: '💪',
    color: '#4CAF50',
    lightColor: '#E8F5E9',
    gradient: ['#4CAF50', '#388E3C'],
    description: 'Workout sessions, yoga, and fitness classes',
  },
  {
    id: 'outdoor',
    name: 'Outdoor',
    icon: 'mountain',
    emoji: '🏕️',
    color: '#8BC34A',
    lightColor: '#F1F8E9',
    gradient: ['#8BC34A', '#689F38'],
    description: 'Hiking, camping, and outdoor adventures',
  },
  {
    id: 'education',
    name: 'Education',
    icon: 'book-open',
    emoji: '📚',
    color: '#3F51B5',
    lightColor: '#E8EAF6',
    gradient: ['#3F51B5', '#303F9F'],
    description: 'Lectures, seminars, and educational events',
  },
  {
    id: 'charity',
    name: 'Charity',
    icon: 'heart',
    emoji: '❤️',
    color: '#FF5722',
    lightColor: '#FBE9E7',
    gradient: ['#FF5722', '#E64A19'],
    description: 'Fundraisers and charitable events',
  },
  {
    id: 'gaming',
    name: 'Gaming',
    icon: 'gamepad-2',
    emoji: '🎮',
    color: '#00BCD4',
    lightColor: '#E0F7FA',
    gradient: ['#00BCD4', '#0097A7'],
    description: 'Gaming tournaments and esports events',
  },
];

export type EventCategoryId = (typeof EVENT_CATEGORIES)[number]['id'];

// Helper functions
export const getCategoryById = (id: string): Category | undefined => {
  return EVENT_CATEGORIES.find(cat => cat.id === id);
};

export const getCategoryColor = (id: string): string => {
  return getCategoryById(id)?.color || theme.colors.neutral[500];
};

export const getCategoryIcon = (id: string): string => {
  return getCategoryById(id)?.icon || 'tag';
};

export const getCategoryEmoji = (id: string): string => {
  return getCategoryById(id)?.emoji || '📌';
};

export const getCategoryLightColor = (id: string): string => {
  return getCategoryById(id)?.lightColor || theme.colors.neutral[100];
};

export default EVENT_CATEGORIES;
