// =============================================
// EVENT SERVICE
// =============================================
// All event-related API calls

import { supabase } from '../supabase/client';
import { Event, EventWithClub } from '../supabase/database.types';

// =============================================
// TYPES
// =============================================
type EventCategory = 'tech' | 'cultural' | 'sports' | 'workshop' | 'seminar' | 'competition' | 'social' | 'all';
type EventStatus = 'draft' | 'upcoming' | 'ongoing' | 'completed' | 'cancelled';

export interface EventFilters {
  category?: EventCategory;
  status?: EventStatus;
  clubId?: string;
  search?: string;
  isFeatured?: boolean;
  startDate?: string;
  endDate?: string;
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
}

// =============================================
// GET ALL EVENTS
// =============================================
export const getEvents = async (
  filters?: EventFilters,
  pagination?: PaginationOptions
): Promise<{ data: EventWithClub[] | null; error: string | null; count: number }> => {
  try {
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 20;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('events')
      .select(`
        *,
        clubs (
          id,
          name,
          slug,
          logo_url,
          category
        )
      `, { count: 'exact' })
      .order('date', { ascending: true })
      .range(offset, offset + limit - 1);

    // Apply filters
    if (filters?.category && filters.category !== 'all') {
      query = query.eq('category', filters.category);
    }

    // Filter by active status
    if (filters?.status === 'cancelled') {
      query = query.eq('is_active', false);
    } else {
      query = query.eq('is_active', true);
      // Additional time-based filtering
      const now = new Date().toISOString();
      if (filters?.status === 'upcoming') {
        query = query.gte('date', now);
      } else if (filters?.status === 'completed') {
        query = query.lt('date', now);
      }
    }

    if (filters?.clubId) {
      query = query.eq('club_id', filters.clubId);
    }

    if (filters?.isFeatured) {
      query = query.eq('is_featured', true);
    }

    if (filters?.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    if (filters?.startDate) {
      query = query.gte('date', filters.startDate);
    }

    if (filters?.endDate) {
      query = query.lte('date', filters.endDate);
    }

    const { data, error, count } = await query;

    if (error) {
      return { data: null, error: error.message, count: 0 };
    }

    return { data: data as EventWithClub[], error: null, count: count || 0 };
  } catch (error) {
    console.error('Get events error:', error);
    return { data: null, error: 'Failed to fetch events', count: 0 };
  }
};

// =============================================
// GET FEATURED EVENTS
// =============================================
export const getFeaturedEvents = async (
  limit: number = 5
): Promise<{ data: EventWithClub[] | null; error: string | null }> => {
  try {
    const { data, error } = await supabase
      .from('events')
      .select(`
        *,
        clubs (
          id,
          name,
          slug,
          logo_url
        )
      `)
      .eq('is_featured', true)
      .eq('is_active', true)
      .gte('date', new Date().toISOString())
      .order('date', { ascending: true })
      .limit(limit);

    if (error) {
      return { data: null, error: error.message };
    }

    return { data: data as EventWithClub[], error: null };
  } catch (error) {
    console.error('Get featured events error:', error);
    return { data: null, error: 'Failed to fetch featured events' };
  }
};

// =============================================
// GET EVENT BY ID
// =============================================
export const getEventById = async (
  eventId: string
): Promise<{ data: EventWithClub | null; error: string | null }> => {
  try {
    const { data, error } = await supabase
      .from('events')
      .select(`
        *,
        clubs (
          id,
          name,
          slug,
          logo_url,
          description,
          instagram_url,
          website
        )
      `)
      .eq('id', eventId)
      .single();

    if (error) {
      return { data: null, error: error.message };
    }

    return { data: data as EventWithClub, error: null };
  } catch (error) {
    console.error('Get event by ID error:', error);
    return { data: null, error: 'Failed to fetch event' };
  }
};

// =============================================
// GET EVENT BY SLUG
// =============================================
export const getEventBySlug = async (
  slug: string
): Promise<{ data: EventWithClub | null; error: string | null }> => {
  try {
    const { data, error } = await supabase
      .from('events')
      .select(`
        *,
        clubs (
          id,
          name,
          slug,
          logo_url,
          description
        )
      `)
      .eq('slug', slug)
      .single();

    if (error) {
      return { data: null, error: error.message };
    }

    return { data: data as EventWithClub, error: null };
  } catch (error) {
    console.error('Get event by slug error:', error);
    return { data: null, error: 'Failed to fetch event' };
  }
};

// =============================================
// GET EVENTS BY CLUB
// =============================================
export const getEventsByClub = async (
  clubId: string,
  includeInactive?: boolean
): Promise<{ data: Event[] | null; error: string | null }> => {
  try {
    let query = supabase
      .from('events')
      .select('*')
      .eq('club_id', clubId)
      .order('date', { ascending: true });

    if (!includeInactive) {
      query = query.eq('is_active', true);
    }

    const { data, error } = await query;

    if (error) {
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Get events by club error:', error);
    return { data: null, error: 'Failed to fetch club events' };
  }
};

// =============================================
// GET TODAY'S EVENTS
// =============================================
export const getTodaysEvents = async (): Promise<{
  data: EventWithClub[] | null;
  error: string | null;
}> => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('events')
      .select(`
        *,
        clubs (
          id,
          name,
          slug,
          logo_url
        )
      `)
      .gte('date', `${today}T00:00:00`)
      .lte('date', `${today}T23:59:59`)
      .eq('is_active', true)
      .order('date', { ascending: true });

    if (error) {
      return { data: null, error: error.message };
    }

    return { data: data as EventWithClub[], error: null };
  } catch (error) {
    console.error('Get today\'s events error:', error);
    return { data: null, error: 'Failed to fetch today\'s events' };
  }
};

// =============================================
// SEARCH EVENTS
// =============================================
export const searchEvents = async (
  query: string,
  limit: number = 10
): Promise<{ data: EventWithClub[] | null; error: string | null }> => {
  try {
    const { data, error } = await supabase
      .from('events')
      .select(`
        *,
        clubs (
          id,
          name,
          slug,
          logo_url
        )
      `)
      .or(`title.ilike.%${query}%,description.ilike.%${query}%,venue.ilike.%${query}%`)
      .eq('is_active', true)
      .gte('date', new Date().toISOString())
      .order('date', { ascending: true })
      .limit(limit);

    if (error) {
      return { data: null, error: error.message };
    }

    return { data: data as EventWithClub[], error: null };
  } catch (error) {
    console.error('Search events error:', error);
    return { data: null, error: 'Failed to search events' };
  }
};

// =============================================
// GET EVENT CATEGORIES
// =============================================
export const getEventCategories = (): { value: string; label: string; icon: string }[] => {
  return [
    { value: 'all', label: 'All', icon: 'grid' },
    { value: 'tech', label: 'Tech', icon: 'code' },
    { value: 'cultural', label: 'Cultural', icon: 'music' },
    { value: 'sports', label: 'Sports', icon: 'activity' },
    { value: 'workshop', label: 'Workshop', icon: 'tool' },
    { value: 'seminar', label: 'Seminar', icon: 'book-open' },
    { value: 'competition', label: 'Competition', icon: 'award' },
    { value: 'social', label: 'Social', icon: 'users' },
  ];
};

// =============================================
// CHECK EVENT AVAILABILITY
// =============================================
export const checkEventAvailability = async (
  eventId: string
): Promise<{ available: boolean; spotsLeft: number | null; error: string | null }> => {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('max_attendees, current_attendees')
      .eq('id', eventId)
      .single();

    if (error) {
      return { available: false, spotsLeft: null, error: error.message };
    }

    if (!data.max_attendees) {
      // Unlimited capacity
      return { available: true, spotsLeft: null, error: null };
    }

    const spotsLeft = data.max_attendees - (data.current_attendees || 0);
    return { available: spotsLeft > 0, spotsLeft, error: null };
  } catch (error) {
    console.error('Check availability error:', error);
    return { available: false, spotsLeft: null, error: 'Failed to check availability' };
  }
};

// =============================================
// SUBSCRIBE TO EVENT UPDATES (Real-time)
// =============================================
export const subscribeToEventUpdates = (
  eventId: string,
  callback: (payload: any) => void
) => {
  return supabase
    .channel(`event-${eventId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'events',
        filter: `id=eq.${eventId}`,
      },
      callback
    )
    .subscribe();
};

// =============================================
// SUBSCRIBE TO NEW EVENTS (Real-time)
// =============================================
export const subscribeToNewEvents = (callback: (payload: any) => void) => {
  return supabase
    .channel('new-events')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'events',
        filter: 'status=eq.upcoming',
      },
      callback
    )
    .subscribe();
};
