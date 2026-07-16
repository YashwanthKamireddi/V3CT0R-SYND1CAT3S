// =============================================
// NOTIFICATION SERVICE
// =============================================
// All notification-related API calls

import { supabase } from '../supabase/client';
import { Notification, NotificationWithEvent } from '../supabase/database.types';

// Type for notification types
type NotificationType = 'event' | 'reminder' | 'points' | 'badge' | 'social' | 'alert';

// =============================================
// GET USER NOTIFICATIONS
// =============================================
export const getUserNotifications = async (
  userId: string,
  options?: {
    limit?: number;
    unreadOnly?: boolean;
    type?: NotificationType;
  }
): Promise<{ data: NotificationWithEvent[] | null; error: string | null }> => {
  try {
    let query = supabase
      .from('notifications')
      .select(`
        *,
        events (
          id,
          title,
          event_date,
          start_time,
          venue,
          image_url
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (options?.unreadOnly) {
      query = query.eq('is_read', false);
    }

    if (options?.type) {
      query = query.eq('type', options.type);
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;

    if (error) {
      return { data: null, error: error.message };
    }

    return { data: data as NotificationWithEvent[], error: null };
  } catch (error) {
    console.error('Get notifications error:', error);
    return { data: null, error: 'Failed to fetch notifications' };
  }
};

// =============================================
// GET UNREAD COUNT
// =============================================
export const getUnreadNotificationCount = async (
  userId: string
): Promise<{ count: number; error: string | null }> => {
  try {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) {
      return { count: 0, error: error.message };
    }

    return { count: count || 0, error: null };
  } catch (error) {
    console.error('Get unread count error:', error);
    return { count: 0, error: 'Failed to get unread count' };
  }
};

// =============================================
// MARK NOTIFICATION AS READ
// =============================================
export const markNotificationAsRead = async (
  notificationId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)
      .eq('user_id', userId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Mark as read error:', error);
    return { success: false, error: 'Failed to mark as read' };
  }
};

// =============================================
// MARK ALL NOTIFICATIONS AS READ
// =============================================
export const markAllNotificationsAsRead = async (
  userId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Mark all as read error:', error);
    return { success: false, error: 'Failed to mark all as read' };
  }
};

// =============================================
// DELETE NOTIFICATION
// =============================================
export const deleteNotification = async (
  notificationId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId)
      .eq('user_id', userId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Delete notification error:', error);
    return { success: false, error: 'Failed to delete notification' };
  }
};

// =============================================
// CLEAR ALL NOTIFICATIONS
// =============================================
export const clearAllNotifications = async (
  userId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('user_id', userId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Clear all notifications error:', error);
    return { success: false, error: 'Failed to clear notifications' };
  }
};

// =============================================
// CREATE NOTIFICATION (Internal use)
// =============================================
export const createNotification = async (
  userId: string,
  notification: {
    title: string;
    message: string;
    type: 'reminder' | 'event' | 'badge' | 'alert' | 'social' | 'points';
    icon?: string;
    color?: string;
    eventId?: string;
    actionUrl?: string;
  }
): Promise<{ success: boolean; data?: Notification; error?: string }> => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        icon: notification.icon || null,
        color: notification.color || null,
        event_id: notification.eventId || null,
        action_url: notification.actionUrl || null,
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Create notification error:', error);
    return { success: false, error: 'Failed to create notification' };
  }
};

// =============================================
// SUBSCRIBE TO NOTIFICATIONS (Real-time)
// =============================================
export const subscribeToNotifications = (
  userId: string,
  callback: (notification: Notification) => void
) => {
  return supabase
    .channel(`notifications-${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        callback(payload.new as Notification);
      }
    )
    .subscribe();
};

// =============================================
// GET UPCOMING REMINDERS
// =============================================
export const getUpcomingReminders = async (
  userId: string,
  limit: number = 5
): Promise<{
  data: Array<{
    id: string;
    eventTitle: string;
    eventDate: string;
    eventTime: string;
    location: string;
    timeUntil: string;
    reminderType: string;
    eventId: string;
    color: string;
  }> | null;
  error: string | null;
}> => {
  try {
    const { data, error } = await supabase
      .from('reminders')
      .select(`
        id,
        reminder_type,
        scheduled_for,
        events (
          id,
          title,
          event_date,
          start_time,
          venue,
          category
        )
      `)
      .eq('user_id', userId)
      .eq('sent', false)
      .gte('scheduled_for', new Date().toISOString())
      .order('scheduled_for', { ascending: true })
      .limit(limit);

    if (error) {
      return { data: null, error: error.message };
    }

    // Transform data
    const reminders = data?.map((reminder: any) => {
      const eventDate = new Date(`${reminder.events.event_date}T${reminder.events.start_time}`);
      const now = new Date();
      const diff = eventDate.getTime() - now.getTime();

      let timeUntil = '';
      if (diff < 60 * 60 * 1000) {
        timeUntil = `in ${Math.round(diff / (60 * 1000))} min`;
      } else if (diff < 24 * 60 * 60 * 1000) {
        timeUntil = `in ${Math.round(diff / (60 * 60 * 1000))} hours`;
      } else {
        timeUntil = `in ${Math.round(diff / (24 * 60 * 60 * 1000))} days`;
      }

      const categoryColors: Record<string, string> = {
        tech: '#7C3AED',
        cultural: '#EC4899',
        sports: '#10B981',
        workshop: '#F59E0B',
        seminar: '#3B82F6',
        competition: '#EF4444',
        social: '#8B5CF6',
      };

      return {
        id: reminder.id,
        eventTitle: reminder.events.title,
        eventDate: reminder.events.event_date,
        eventTime: reminder.events.start_time,
        location: reminder.events.venue,
        timeUntil,
        reminderType: reminder.reminder_type,
        eventId: reminder.events.id,
        color: categoryColors[reminder.events.category] || '#7C3AED',
      };
    });

    return { data: reminders || [], error: null };
  } catch (error) {
    console.error('Get reminders error:', error);
    return { data: null, error: 'Failed to fetch reminders' };
  }
};
