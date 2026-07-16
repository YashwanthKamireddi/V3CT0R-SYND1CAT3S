/**
 * Core Type Definitions for CampusPulse
 */

import { EventCategoryId } from '../constants/categories';
import { BadgeId } from '../constants/badges';

// ============================================
// User Types
// ============================================

export interface User {
  id: string;
  email: string;
  name: string;
  username: string;
  avatar?: string;
  department: string;
  year: number; // 2024, 2025, etc.
  interests: EventCategoryId[];
  bio?: string;
  phone?: string;
  role: 'student' | 'faculty' | 'admin' | 'organizer';
  createdAt: Date;
  updatedAt: Date;
}

export interface UserStats {
  eventsAttended: number;
  eventsRegistered: number;
  totalPoints: number;
  currentRank: number;
  badgesEarned: number;
  organizationsFollowing: number;
  streak: number; // Days
  lastActive: Date;
}

export interface UserProfile extends User {
  stats: UserStats;
  badges: UserBadge[];
  following: string[]; // Organization IDs
  friends: string[]; // User IDs
}

export interface UserBadge {
  badgeId: BadgeId;
  earnedAt: Date;
  progress?: number; // For badges with progress
}

// ============================================
// Event Types
// ============================================

export interface Event {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  category: EventCategoryId;

  // Date & Time
  startDate: Date;
  endDate: Date;
  timezone: string;

  // Location
  venue: string;
  room?: string;
  buildingId?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };

  // Organization
  organizationId: string;
  organization?: Organization; // Populated

  // Media
  image: string;
  images?: string[]; // Additional images

  // Capacity
  capacity: number;
  registered: number;
  waitlist: number;

  // Registration
  registrationOpen: boolean;
  registrationDeadline?: Date;
  requiresApproval: boolean;

  // Rewards
  points: number;
  badges?: BadgeId[]; // Badges awarded for attending

  // Metadata
  tags: string[];
  isFeatured: boolean;
  isPublic: boolean;
  targetAudience: string[]; // ['students', 'faculty', 'all']

  // Status
  status: 'draft' | 'published' | 'ongoing' | 'completed' | 'cancelled';

  // Stats
  views: number;
  interested: number;
  attended: number;
  rating?: number;

  createdAt: Date;
  updatedAt: Date;
  createdBy: string; // User ID
}

export interface EventRegistration {
  id: string;
  eventId: string;
  userId: string;
  status: 'pending' | 'confirmed' | 'waitlist' | 'cancelled';
  checked_in: boolean;
  check_in_time?: Date;
  qr_token: string; // Unique token
  createdAt: Date;
  updatedAt: Date;
}

export interface EventConflict {
  eventId: string;
  conflictingEvent: Event;
  overlapMinutes: number;
}

// ============================================
// Organization Types
// ============================================

export interface Organization {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;

  // Media
  logo: string;
  coverImage?: string;

  // Contact
  email: string;
  website?: string;
  social?: {
    instagram?: string;
    twitter?: string;
    linkedin?: string;
  };

  // Members
  members: OrganizationMember[];
  followers: number;

  // Stats
  eventsHosted: number;
  totalAttendees: number;
  rating: number;

  // Status
  isVerified: boolean;
  isActive: boolean;

  createdAt: Date;
  updatedAt: Date;
}

export interface OrganizationMember {
  userId: string;
  role: 'admin' | 'moderator' | 'member';
  joinedAt: Date;
  permissions: string[];
}

// ============================================
// Notification Types
// ============================================

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>; // Deep link data
  read: boolean;
  createdAt: Date;
}

export type NotificationType =
  | 'event_reminder' // 24h, 2h, 30min before
  | 'registration_confirmed'
  | 'registration_cancelled'
  | 'waitlist_available'
  | 'event_updated'
  | 'event_cancelled'
  | 'badge_earned'
  | 'milestone_reached'
  | 'friend_activity'
  | 'organization_update'
  | 'reward_available'
  | 'leaderboard_change';

// ============================================
// Leaderboard Types
// ============================================

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  user?: User; // Populated
  points: number;
  eventsAttended: number;
  badges: number;
  change: number; // Rank change from last period
}

export interface Leaderboard {
  type: 'all-time' | 'semester' | 'month' | 'week';
  department?: string;
  year?: number;
  entries: LeaderboardEntry[];
  updatedAt: Date;
}

// ============================================
// Reward Types
// ============================================

export interface Reward {
  id: string;
  name: string;
  description: string;
  image: string;
  category: 'sticker' | 'merch' | 'pass' | 'perk';
  pointsCost: number;
  stock: number;
  available: boolean;
  featured: boolean;
}

export interface RewardRedemption {
  id: string;
  userId: string;
  rewardId: string;
  pointsSpent: number;
  status: 'pending' | 'approved' | 'collected' | 'rejected';
  redeemedAt: Date;
  collectedAt?: Date;
  qrCode: string; // For collection
}

// ============================================
// Search & Filter Types
// ============================================

export interface EventFilters {
  categories?: EventCategoryId[];
  startDate?: Date;
  endDate?: Date;
  organizations?: string[];
  tags?: string[];
  pointsMin?: number;
  pointsMax?: number;
  hasSpaceAvailable?: boolean;
  isFeatured?: boolean;
}

export interface SearchQuery {
  query: string;
  filters?: EventFilters;
  sortBy?: 'date' | 'popularity' | 'points' | 'relevance';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface SearchResult<T> {
  items: T[];
  total: number;
  hasMore: boolean;
}

// ============================================
// Analytics Types (for organizers)
// ============================================

export interface EventAnalytics {
  eventId: string;

  // Registration
  totalRegistrations: number;
  totalWaitlist: number;
  registrationsByDate: { date: string; count: number }[];

  // Attendance
  totalAttended: number;
  attendanceRate: number;
  noShowRate: number;

  // Demographics
  byDepartment: { department: string; count: number }[];
  byYear: { year: number; count: number }[];

  // Engagement
  averageRating: number;
  totalFeedback: number;

  // Traffic
  totalViews: number;
  conversionRate: number;
}

// ============================================
// API Response Types
// ============================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}

export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

// ============================================
// Form Types
// ============================================

export interface LoginFormData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface SignupFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  department: string;
  year: number;
  acceptTerms: boolean;
}

export interface EventFormData {
  title: string;
  subtitle?: string;
  description: string;
  category: EventCategoryId;
  startDate: Date;
  endDate: Date;
  venue: string;
  room?: string;
  capacity: number;
  registrationDeadline?: Date;
  requiresApproval: boolean;
  points: number;
  tags: string[];
  image: string;
  isPublic: boolean;
  targetAudience: string[];
}

// ============================================
// Navigation Types
// ============================================

export type RootStackParamList = {
  // Auth Stack
  Login: undefined;
  Signup: undefined;
  Interests: undefined;

  // Main Stack
  Home: undefined;
  Explore: undefined;
  Tickets: undefined;
  Profile: undefined;

  // Detail Screens
  EventDetail: { eventId: string };
  OrganizationDetail: { organizationId: string };
  UserProfile: { userId: string };

  // Modals
  QRCode: { registrationId: string };
  Filters: { currentFilters?: EventFilters };
  Calendar: undefined;
  Notifications: undefined;

  // Other
  Leaderboard: undefined;
  Rewards: undefined;
  Settings: undefined;
};

// ============================================
// Component Props Types
// ============================================

export interface EventCardProps {
  event: Event;
  variant?: 'default' | 'compact' | 'featured';
  onPress?: () => void;
  onRegister?: () => void;
  showOrganization?: boolean;
  showPoints?: boolean;
}

export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  onPress: () => void;
  children: React.ReactNode;
}

// Export all types
export type {
  EventCategoryId,
  BadgeId,
};
