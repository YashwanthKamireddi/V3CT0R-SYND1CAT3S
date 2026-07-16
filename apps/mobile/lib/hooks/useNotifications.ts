// =============================================
// USE NOTIFICATIONS HOOK
// =============================================
// Custom hook for managing user notifications

import { useState, useEffect, useCallback } from 'react';
import { Notification } from '../supabase/database.types';
import {
  getUserNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  clearAllNotifications,
  subscribeToNotifications,
  getUpcomingReminders,
} from '../services/notificationService';
import { useAuth } from '../context/AuthContext';

// =============================================
// USE NOTIFICATIONS
// =============================================
export const useNotifications = () => {
  const { user, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await getUserNotifications(user.id);
      if (result.error) {
        setError(result.error);
      } else {
        setNotifications(result.data || []);
      }
    } catch (err) {
      setError('Failed to fetch notifications');
      console.error('Error fetching notifications:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Subscribe to real-time notifications
  useEffect(() => {
    if (!user) return;

    const channel = subscribeToNotifications(user.id, (newNotification) => {
      setNotifications((prev) => [newNotification, ...prev]);
    });

    return () => {
      channel.unsubscribe();
    };
  }, [user]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
    } else {
      setNotifications([]);
      setIsLoading(false);
    }
  }, [isAuthenticated, fetchNotifications]);

  // Mark single notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    if (!user) return { success: false };
    const result = await markNotificationAsRead(notificationId, user.id);
    if (result.success) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
      );
    }
    return result;
  }, [user]);

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    if (!user) return false;

    const success = await markAllNotificationsAsRead(user.id);
    if (success) {
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    }
    return success;
  }, [user]);

  // Delete single notification
  const removeNotification = useCallback(async (notificationId: string) => {
    if (!user) return { success: false };
    const result = await deleteNotification(notificationId, user.id);
    if (result.success) {
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
    }
    return result;
  }, [user]);

  // Clear all notifications
  const clearAll = useCallback(async () => {
    if (!user) return false;

    const success = await clearAllNotifications(user.id);
    if (success) {
      setNotifications([]);
    }
    return success;
  }, [user]);

  // Group notifications by date
  const groupedNotifications = notifications.reduce((groups, notification) => {
    const date = new Date(notification.created_at ?? Date.now()).toLocaleDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(notification);
    return groups;
  }, {} as Record<string, Notification[]>);

  // Unread notifications
  const unreadNotifications = notifications.filter((n) => !n.is_read);

  return {
    notifications,
    groupedNotifications,
    unreadNotifications,
    isLoading,
    error,
    refresh: fetchNotifications,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
  };
};

// =============================================
// USE UNREAD COUNT
// =============================================
export const useUnreadNotificationCount = () => {
  const { user, isAuthenticated } = useAuth();
  const [count, setCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCount = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      const result = await getUnreadNotificationCount(user.id);
      if (!result.error) {
        setCount(result.count);
      }
    } catch (err) {
      console.error('Error fetching unread count:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Subscribe to new notifications to update count
  useEffect(() => {
    if (!user) return;

    const channel = subscribeToNotifications(user.id, () => {
      setCount((prev) => prev + 1);
    });

    return () => {
      channel.unsubscribe();
    };
  }, [user]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCount();
    } else {
      setCount(0);
      setIsLoading(false);
    }
  }, [isAuthenticated, fetchCount]);

  return {
    count,
    isLoading,
    refresh: fetchCount,
  };
};

// =============================================
// USE REMINDERS
// =============================================
export const useReminders = () => {
  const { user, isAuthenticated } = useAuth();
  const [reminders, setReminders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReminders = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await getUpcomingReminders(user.id);
      if (result.error) {
        setError(result.error);
      } else {
        setReminders(result.data || []);
      }
    } catch (err) {
      setError('Failed to fetch reminders');
      console.error('Error fetching reminders:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

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
    refresh: fetchReminders,
  };
};

// =============================================
// USE NOTIFICATION FILTERS
// =============================================
type NotificationFilter = 'all' | 'unread' | 'events' | 'achievements' | 'reminders';

export const useFilteredNotifications = () => {
  const { notifications, isLoading, error, ...rest } = useNotifications();
  const [filter, setFilter] = useState<NotificationFilter>('all');

  const filteredNotifications = notifications.filter((notification) => {
    switch (filter) {
      case 'unread':
        return !notification.is_read;
      case 'events':
        return ['event', 'reminder'].includes(notification.type);
      case 'achievements':
        return ['badge', 'points'].includes(notification.type);
      case 'reminders':
        return notification.type === 'reminder';
      default:
        return true;
    }
  });

  return {
    notifications: filteredNotifications,
    allNotifications: notifications,
    filter,
    setFilter,
    isLoading,
    error,
    ...rest,
  };
};
