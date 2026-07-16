// =============================================
// USE DATA HOOKS
// =============================================
// Hooks that switch between mock and real data
// Based on whether Supabase is configured

import { useState, useEffect, useCallback } from 'react';
import {
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

import { EventWithClub, RegistrationWithEvent, Notification, Profile } from '../supabase/database.types';

// Import real services only if Supabase is configured
let eventService: any = null;
let registrationService: any = null;
let notificationService: any = null;
let leaderboardService: any = null;

if (IS_SUPABASE_CONFIGURED) {
  eventService = require('../services/eventService');
  registrationService = require('../services/registrationService');
  notificationService = require('../services/notificationService');
  leaderboardService = require('../services/leaderboardService');
}

// =============================================
// USE EVENTS DATA
// =============================================
export function useEventsData(options?: {
  category?: string;
  limit?: number;
  featured?: boolean;
}) {
  const [events, setEvents] = useState<EventWithClub[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (IS_SUPABASE_CONFIGURED && eventService) {
        // Use real Supabase data
        if (options?.featured) {
          const data = await eventService.getFeaturedEvents(options.limit || 5);
          setEvents(data);
        } else {
          const data = await eventService.getEvents({
            category: options?.category !== 'all' ? options?.category : undefined,
            limit: options?.limit || 20,
          });
          setEvents(data);
        }
      } else {
        // Use mock data
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay

        if (options?.featured) {
          setEvents(getMockFeaturedEvents(options.limit));
        } else if (options?.category && options.category !== 'all') {
          setEvents(filterMockEventsByCategory(options.category));
        } else {
          setEvents(MOCK_EVENTS.slice(0, options?.limit || 20));
        }
      }
    } catch (err) {
      console.error('Error fetching events:', err);
      setError('Failed to fetch events');
      // Fallback to mock data on error
      setEvents(MOCK_EVENTS);
    } finally {
      setIsLoading(false);
    }
  }, [options?.category, options?.limit, options?.featured]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return { events, isLoading, error, refresh: fetchEvents };
}

// =============================================
// USE FEATURED EVENTS DATA
// =============================================
export function useFeaturedEventsData(limit: number = 5) {
  return useEventsData({ featured: true, limit });
}

// =============================================
// USE TODAY'S EVENTS DATA
// =============================================
export function useTodaysEventsData() {
  const [events, setEvents] = useState<EventWithClub[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (IS_SUPABASE_CONFIGURED && eventService) {
        const data = await eventService.getTodaysEvents();
        setEvents(data);
      } else {
        await new Promise(resolve => setTimeout(resolve, 300));
        setEvents(getMockTodaysEvents());
      }
    } catch (err) {
      console.error('Error fetching today\'s events:', err);
      setError('Failed to fetch events');
      setEvents([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return { events, isLoading, error, refresh: fetchEvents };
}

// =============================================
// USE EVENT SEARCH DATA
// =============================================
export function useEventSearchData() {
  const [results, setResults] = useState<EventWithClub[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    setError(null);

    try {
      if (IS_SUPABASE_CONFIGURED && eventService) {
        const data = await eventService.searchEvents(query);
        setResults(data);
      } else {
        await new Promise(resolve => setTimeout(resolve, 200));
        setResults(searchMockEvents(query));
      }
    } catch (err) {
      console.error('Search error:', err);
      setError('Search failed');
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const clearSearch = useCallback(() => {
    setResults([]);
    setError(null);
  }, []);

  return { results, isSearching, error, search, clearSearch };
}

// =============================================
// USE TICKETS DATA
// =============================================
export function useTicketsData(userId?: string) {
  const [upcoming, setUpcoming] = useState<RegistrationWithEvent[]>([]);
  const [past, setPast] = useState<RegistrationWithEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTickets = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (IS_SUPABASE_CONFIGURED && registrationService && userId) {
        const [upcomingData, pastData] = await Promise.all([
          registrationService.getUserRegistrations(userId, 'upcoming'),
          registrationService.getUserRegistrations(userId, 'past'),
        ]);
        setUpcoming(upcomingData);
        setPast(pastData);
      } else {
        await new Promise(resolve => setTimeout(resolve, 400));
        setUpcoming(getMockUpcomingTickets());
        setPast(getMockPastTickets());
      }
    } catch (err) {
      console.error('Error fetching tickets:', err);
      setError('Failed to fetch tickets');
      // Fallback to mock
      setUpcoming(getMockUpcomingTickets());
      setPast(getMockPastTickets());
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  return { upcoming, past, isLoading, error, refresh: fetchTickets };
}

// =============================================
// USE NOTIFICATIONS DATA
// =============================================
export function useNotificationsData(userId?: string) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (IS_SUPABASE_CONFIGURED && notificationService && userId) {
        const data = await notificationService.getUserNotifications(userId);
        setNotifications(data);
      } else {
        await new Promise(resolve => setTimeout(resolve, 300));
        setNotifications(MOCK_NOTIFICATIONS);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Failed to fetch notifications');
      setNotifications(MOCK_NOTIFICATIONS);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const markAsRead = useCallback(async (notificationId: string) => {
    if (IS_SUPABASE_CONFIGURED && notificationService) {
      await notificationService.markNotificationAsRead(notificationId);
    }
    setNotifications(prev =>
      prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
    );
  }, []);

  const markAllAsRead = useCallback(async () => {
    if (IS_SUPABASE_CONFIGURED && notificationService && userId) {
      await notificationService.markAllNotificationsAsRead(userId);
    }
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  }, [userId]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    refresh: fetchNotifications,
    markAsRead,
    markAllAsRead,
  };
}

// =============================================
// USE PROFILE DATA
// =============================================
export function useProfileData(userId?: string) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (IS_SUPABASE_CONFIGURED && userId) {
        // Import auth service dynamically
        const authService = require('../supabase/auth');
        const data = await authService.getUserProfile(userId);
        setProfile(data);
      } else {
        await new Promise(resolve => setTimeout(resolve, 300));
        setProfile(MOCK_PROFILE);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Failed to fetch profile');
      setProfile(MOCK_PROFILE);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return { profile, isLoading, error, refresh: fetchProfile };
}

// =============================================
// USE LEADERBOARD DATA
// =============================================
export function useLeaderboardData(limit: number = 50) {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaderboard = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (IS_SUPABASE_CONFIGURED && leaderboardService) {
        const data = await leaderboardService.getLeaderboard(limit);
        setLeaderboard(data);
      } else {
        await new Promise(resolve => setTimeout(resolve, 400));
        setLeaderboard(MOCK_LEADERBOARD.slice(0, limit));
      }
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
      setError('Failed to fetch leaderboard');
      setLeaderboard(MOCK_LEADERBOARD);
    } finally {
      setIsLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  const topThree = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);

  return { leaderboard, topThree, rest, isLoading, error, refresh: fetchLeaderboard };
}

// =============================================
// USE USER STATS DATA
// =============================================
export function useUserStatsData(userId?: string) {
  const [stats, setStats] = useState(MOCK_USER_STATS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (IS_SUPABASE_CONFIGURED && leaderboardService && userId) {
        const data = await leaderboardService.getUserStats(userId);
        setStats(data);
      } else {
        await new Promise(resolve => setTimeout(resolve, 300));
        setStats(MOCK_USER_STATS);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
      setError('Failed to fetch stats');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, isLoading, error, refresh: fetchStats };
}

// =============================================
// EXPORT CHECK
// =============================================
export { IS_SUPABASE_CONFIGURED };
