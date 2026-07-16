// =============================================
// USE EVENTS HOOK
// =============================================
// Custom hook for fetching and managing events

import { useState, useEffect, useCallback } from 'react';
import { Event, EventWithClub } from '../supabase/database.types';
import {
  getEvents,
  getFeaturedEvents,
  getEventById,
  getTodaysEvents,
  searchEvents,
  getEventCategories,
  checkEventAvailability,
  subscribeToEventUpdates,
  EventFilters,
  PaginationOptions,
} from '../services/eventService';

// =============================================
// USE EVENTS - List with Filters
// =============================================
export const useEvents = (filters?: EventFilters) => {
  const [events, setEvents] = useState<EventWithClub[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  const fetchEvents = useCallback(async (pageNum: number = 1, append: boolean = false) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await getEvents(filters, { page: pageNum, limit: 10 });

      if (result.error) {
        setError(result.error);
        return;
      }

      const data = result.data || [];

      if (append) {
        setEvents((prev) => [...prev, ...data]);
      } else {
        setEvents(data);
      }

      setHasMore(data.length === 10);
    } catch (err) {
      setError('Failed to fetch events');
      console.error('Error fetching events:', err);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  const loadMore = useCallback(() => {
    if (!isLoading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchEvents(nextPage, true);
    }
  }, [isLoading, hasMore, page, fetchEvents]);

  const refresh = useCallback(() => {
    setPage(1);
    fetchEvents(1, false);
  }, [fetchEvents]);

  useEffect(() => {
    fetchEvents(1, false);
  }, [fetchEvents]);

  return {
    events,
    isLoading,
    error,
    hasMore,
    loadMore,
    refresh,
  };
};

// =============================================
// USE FEATURED EVENTS
// =============================================
export const useFeaturedEvents = (limit: number = 5) => {
  const [events, setEvents] = useState<EventWithClub[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFeaturedEvents = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await getFeaturedEvents(limit);
      if (result.error) {
        setError(result.error);
        return;
      }
      setEvents(result.data || []);
    } catch (err) {
      setError('Failed to fetch featured events');
      console.error('Error fetching featured events:', err);
    } finally {
      setIsLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchFeaturedEvents();
  }, [fetchFeaturedEvents]);

  return {
    events,
    isLoading,
    error,
    refresh: fetchFeaturedEvents,
  };
};

// =============================================
// USE TODAY'S EVENTS
// =============================================
export const useTodaysEvents = () => {
  const [events, setEvents] = useState<EventWithClub[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTodaysEvents = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await getTodaysEvents();
      if (result.error) {
        setError(result.error);
        return;
      }
      setEvents(result.data || []);
    } catch (err) {
      setError("Failed to fetch today's events");
      console.error('Error fetching todays events:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTodaysEvents();
  }, [fetchTodaysEvents]);

  return {
    events,
    isLoading,
    error,
    refresh: fetchTodaysEvents,
  };
};

// =============================================
// USE SINGLE EVENT
// =============================================
export const useEvent = (eventId: string | null) => {
  const [event, setEvent] = useState<EventWithClub | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvent = useCallback(async () => {
    if (!eventId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await getEventById(eventId);
      if (result.error) {
        setError(result.error);
        return;
      }
      setEvent(result.data);
    } catch (err) {
      setError('Failed to fetch event');
      console.error('Error fetching event:', err);
    } finally {
      setIsLoading(false);
    }
  }, [eventId]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!eventId) return;

    const channel = subscribeToEventUpdates(eventId, (updatedEvent) => {
      setEvent((prev) =>
        prev ? { ...prev, ...updatedEvent } : null
      );
    });

    return () => {
      channel.unsubscribe();
    };
  }, [eventId]);

  useEffect(() => {
    fetchEvent();
  }, [fetchEvent]);

  return {
    event,
    isLoading,
    error,
    refresh: fetchEvent,
  };
};

// =============================================
// USE EVENT SEARCH
// =============================================
export const useEventSearch = () => {
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
      const searchResult = await searchEvents(query);
      if (searchResult.error) {
        setError(searchResult.error);
        return;
      }
      setResults(searchResult.data || []);
    } catch (err) {
      setError('Search failed');
      console.error('Error searching events:', err);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const clearSearch = useCallback(() => {
    setResults([]);
    setError(null);
  }, []);

  return {
    results,
    isSearching,
    error,
    search,
    clearSearch,
  };
};

// =============================================
// USE EVENT CATEGORIES
// =============================================
interface CategoryItem {
  value: string;
  label: string;
  icon: string;
}

export const useEventCategories = () => {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await getEventCategories();
      setCategories(result);
    } catch (err) {
      setError('Failed to fetch categories');
      console.error('Error fetching categories:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return {
    categories,
    isLoading,
    error,
    refresh: fetchCategories,
  };
};

// =============================================
// USE EVENT AVAILABILITY
// =============================================
export const useEventAvailability = (eventId: string | null) => {
  const [availability, setAvailability] = useState<{
    available: boolean;
    spotsLeft: number | null;
    waitlist: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAvailability = useCallback(async () => {
    if (!eventId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      const result = await checkEventAvailability(eventId);
      setAvailability({
        available: result.available,
        spotsLeft: result.spotsLeft,
        waitlist: 0, // Add default waitlist
      });
    } catch (err) {
      console.error('Error checking availability:', err);
    } finally {
      setIsLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    checkAvailability();
  }, [checkAvailability]);

  return {
    availability,
    isLoading,
    refresh: checkAvailability,
  };
};
