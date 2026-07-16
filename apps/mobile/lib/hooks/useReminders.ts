// =============================================
// USE REMINDERS HOOK
// =============================================
// Custom hook for managing event reminders

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabase/client';
import { useAuth } from '../context/AuthContext';

// =============================================
// TYPES
// =============================================
interface Reminder {
  id: string;
  eventId: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  location: string;
  timeUntil: string;
  color: string;
  icon: string;
  reminder_time: string;
}

// =============================================
// CALCULATE TIME UNTIL
// =============================================
function calculateTimeUntilFromTimestamp(timestamp: string): string {
  try {
    const eventDateTime = new Date(timestamp);
    const diff = eventDateTime.getTime() - Date.now();
    if (diff < 0) return 'past';
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    if (days > 0) return `in ${days} day${days > 1 ? 's' : ''}`;
    if (hours > 0) return `in ${hours} hour${hours > 1 ? 's' : ''}`;
    return 'soon';
  } catch {
    return 'upcoming';
  }
}

// =============================================
// GET CATEGORY COLOR
// =============================================
function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    hackathon: '#7C3AED',
    technical: '#3B82F6',
    workshop: '#FF6B35',
    cultural: '#EC4899',
    sports: '#10B981',
    seminar: '#6366F1',
    social: '#F59E0B',
    club: '#8B5CF6',
  };
  return colors[category?.toLowerCase()] || '#6366F1';
}

// =============================================
// GET CATEGORY ICON
// =============================================
function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    hackathon: 'code',
    technical: 'cpu',
    workshop: 'tool',
    cultural: 'music',
    sports: 'activity',
    seminar: 'book-open',
    social: 'heart',
    club: 'users',
  };
  return icons[category?.toLowerCase()] || 'calendar';
}

// =============================================
// USE REMINDERS
// =============================================
export const useReminders = () => {
  const { user, isAuthenticated } = useAuth();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReminders = useCallback(async () => {
    if (!user) {
      setReminders([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('reminders')
        .select(`
          *,
          events:event_id (
            id,
            title,
            date,
            location,
            category
          )
        `)
        .eq('user_id', user.id)
        .eq('is_sent', false)
        .order('remind_at', { ascending: true });

      if (fetchError) throw fetchError;

      const formattedReminders: Reminder[] = (data || [])
        .filter((r: any) => r.events)
        .map((r: any) => {
          const dt = new Date(r.events.date);
          const timeStr = dt.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
          });
          const dateStr = dt.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          });
          return {
            id: r.id,
            eventId: r.event_id,
            eventTitle: r.events.title,
            eventDate: dateStr,
            eventTime: timeStr,
            location: r.events.location ?? '',
            timeUntil: calculateTimeUntilFromTimestamp(r.events.date),
            color: getCategoryColor(r.events.category),
            icon: getCategoryIcon(r.events.category),
            reminder_time: r.remind_at ?? '',
          };
        });

      setReminders(formattedReminders);
    } catch (err) {
      console.error('Error fetching reminders:', err);
      setError('Failed to fetch reminders');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Set a reminder for an event
  const setReminder = useCallback(
    async (eventId: string, reminderTime: Date, registrationId?: string) => {
      if (!user) return { success: false, error: 'Not authenticated' };

      try {
        const { error: insertError } = await supabase.from('reminders').insert({
          user_id: user.id,
          event_id: eventId,
          registration_id: registrationId || eventId,
          remind_at: reminderTime.toISOString(),
          type: '1day',
          is_sent: false,
        });

        if (insertError) throw insertError;

        await fetchReminders();
        return { success: true };
      } catch (err) {
        console.error('Error setting reminder:', err);
        return { success: false, error: 'Failed to set reminder' };
      }
    },
    [user, fetchReminders]
  );

  // Remove a reminder
  const removeReminder = useCallback(
    async (reminderId: string) => {
      if (!user) return { success: false, error: 'Not authenticated' };

      try {
        const { error: deleteError } = await supabase
          .from('reminders')
          .delete()
          .eq('id', reminderId)
          .eq('user_id', user.id);

        if (deleteError) throw deleteError;

        setReminders((prev) => prev.filter((r) => r.id !== reminderId));
        return { success: true };
      } catch (err) {
        console.error('Error removing reminder:', err);
        return { success: false, error: 'Failed to remove reminder' };
      }
    },
    [user]
  );

  useEffect(() => {
    if (isAuthenticated) {
      fetchReminders();
    } else {
      setReminders([]);
      setIsLoading(false);
    }
  }, [isAuthenticated, fetchReminders]);

  return {
    reminders,
    isLoading,
    error,
    setReminder,
    removeReminder,
    refresh: fetchReminders,
  };
};

export default useReminders;
