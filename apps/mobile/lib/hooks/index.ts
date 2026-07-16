// =============================================
// HOOKS INDEX
// =============================================
// Central export for all custom hooks

// Auth
export { useAuth } from '../context/AuthContext';

// Events
export {
  useEvents,
  useFeaturedEvents,
  useTodaysEvents,
  useEvent,
  useEventSearch,
  useEventCategories,
  useEventAvailability,
} from './useEvents';

// Tickets
export {
  useTickets,
  useTicket,
  useRegistration,
  useUpcomingTicketsCount,
} from './useTickets';

// Notifications
export {
  useNotifications,
  useUnreadNotificationCount,
  useReminders,
  useFilteredNotifications,
} from './useNotifications';

// Profile
export {
  useProfile,
  useUserStats,
  useUserRank,
  usePointsHistory,
  useProfileCompletion,
  useEditProfile,
} from './useProfile';

// Leaderboard
export {
  useLeaderboard,
  useTopUsers,
  useBranchLeaderboard,
  useNearbyUsers,
  useFilteredLeaderboard,
} from './useLeaderboard';
