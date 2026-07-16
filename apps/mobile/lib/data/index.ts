// =============================================
// DATA LAYER INDEX
// =============================================
// Central export for data hooks and mock data

// Mock Data
export {
  IS_SUPABASE_CONFIGURED,
  MOCK_EVENTS,
  MOCK_PROFILE,
  MOCK_TICKETS,
  MOCK_NOTIFICATIONS,
  MOCK_LEADERBOARD,
  MOCK_USER_STATS,
  getMockFeaturedEvents,
  getMockTodaysEvents,
  searchMockEvents,
  filterMockEventsByCategory,
  getMockUpcomingTickets,
  getMockPastTickets,
} from './mockData';

// Data Hooks
export {
  useEventsData,
  useFeaturedEventsData,
  useTodaysEventsData,
  useEventSearchData,
  useTicketsData,
  useNotificationsData,
  useProfileData,
  useLeaderboardData,
  useUserStatsData,
} from './useData';
