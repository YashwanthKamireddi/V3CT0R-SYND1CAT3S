// =============================================
// DATA PROVIDER (mock fallback stubs)
// =============================================
// All real data lives in Supabase. These stubs only run if Supabase
// env vars are missing. Hooks in useData.ts read IS_SUPABASE_CONFIGURED
// and route to real services when configured.

import type {
  EventWithClub,
  RegistrationWithEvent,
  Notification,
  Profile,
} from '../supabase/database.types';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
export const IS_SUPABASE_CONFIGURED = !!(SUPABASE_URL && SUPABASE_ANON_KEY);

export const MOCK_EVENTS: EventWithClub[] = [];
export const MOCK_TICKETS: RegistrationWithEvent[] = [];
export const MOCK_NOTIFICATIONS: Notification[] = [];

export const MOCK_PROFILE: Profile | null = null;

export const MOCK_LEADERBOARD: Array<{
  id: string | null;
  full_name: string | null;
  avatar_url: string | null;
  total_points: number | null;
  events_attended: number | null;
  rank: number | null;
}> = [];

export const MOCK_USER_STATS = {
  events_attended: 0,
  total_points: 0,
  badges_earned: 0,
  rank: 0,
};

export const getMockFeaturedEvents = (_limit?: number): EventWithClub[] => [];
export const getMockTodaysEvents = (): EventWithClub[] => [];
export const searchMockEvents = (_query: string): EventWithClub[] => [];
export const filterMockEventsByCategory = (
  _category: string,
): EventWithClub[] => [];
export const getMockUpcomingTickets = (): RegistrationWithEvent[] => [];
export const getMockPastTickets = (): RegistrationWithEvent[] => [];
