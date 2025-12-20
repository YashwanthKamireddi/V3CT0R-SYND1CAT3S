/**
 * useNotifications Hook - CampusPulse
 * React hook for managing push notifications and reminders
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'expo-router';
import * as Notifications from 'expo-notifications';

import {
  registerForPushNotifications,
  scheduleEventReminder,
  cancelEventReminder,
  cancelAllEventReminders,
  getReminders,
  getNotificationPreferences,
  updateNotificationPreferences,
  setupNotificationListeners,
  clearBadgeCount,
  type EventReminder,
  type NotificationPreferences,
} from '@/lib/services/notifications';

export interface UseNotificationsReturn {
  // State
  pushToken: string | null;
  reminders: EventReminder[];
  preferences: NotificationPreferences | null;
  isLoading: boolean;
  hasPermission: boolean;

  // Actions
  requestPermissions: () => Promise<boolean>;
  setReminder: (
    eventId: string,
    eventTitle: string,
    eventDate: Date,
    location: string,
    notifyBefore: '24h' | '2h' | '30m'
  ) => Promise<boolean>;
  removeReminder: (eventId: string, notifyBefore: '24h' | '2h' | '30m') => Promise<boolean>;
  removeAllRemindersForEvent: (eventId: string) => Promise<boolean>;
  updatePreferences: (prefs: Partial<NotificationPreferences>) => Promise<void>;
  refreshReminders: () => Promise<void>;
  clearBadge: () => Promise<void>;

  // Helpers
  hasReminderForEvent: (eventId: string, notifyBefore?: '24h' | '2h' | '30m') => boolean;
  getRemindersForEvent: (eventId: string) => EventReminder[];
}

export function useNotifications(): UseNotificationsReturn {
  const router = useRouter();
  const [pushToken, setPushToken] = useState<string | null>(null);
  const [reminders, setReminders] = useState<EventReminder[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasPermission, setHasPermission] = useState(false);
  const notificationListener = useRef<(() => void) | undefined>(undefined);

  // Initialize notifications
  useEffect(() => {
    async function initialize() {
      setIsLoading(true);

      try {
        // Check/request permissions and get token
        const token = await registerForPushNotifications();
        setPushToken(token);
        setHasPermission(!!token);

        // Load saved reminders
        const savedReminders = await getReminders();
        setReminders(savedReminders);

        // Load preferences
        const prefs = await getNotificationPreferences();
        setPreferences(prefs);
      } catch (error) {
        console.error('Error initializing notifications:', error);
      } finally {
        setIsLoading(false);
      }
    }

    initialize();
  }, []);

  // Set up notification listeners
  useEffect(() => {
    const handleNotificationReceived = (notification: Notifications.Notification) => {
      console.log('Notification received:', notification);
      // Refresh reminders when a notification is received
      refreshReminders();
    };

    const handleNotificationResponse = (response: Notifications.NotificationResponse) => {
      console.log('Notification tapped:', response);

      const data = response.notification.request.content.data;

      // Navigate based on notification type
      if (data?.eventId) {
        router.push(`/event/${data.eventId}`);
      } else if (data?.type === 'badge_earned') {
        router.push('/profile/achievements');
      } else if (data?.type === 'points_earned') {
        router.push('/profile/rewards');
      }

      // Clear badge
      clearBadgeCount();
    };

    notificationListener.current = setupNotificationListeners(
      handleNotificationReceived,
      handleNotificationResponse
    );

    return () => {
      notificationListener.current?.();
    };
  }, [router]);

  // Request permissions
  const requestPermissions = useCallback(async (): Promise<boolean> => {
    const token = await registerForPushNotifications();
    setPushToken(token);
    setHasPermission(!!token);
    return !!token;
  }, []);

  // Set a reminder
  const setReminder = useCallback(async (
    eventId: string,
    eventTitle: string,
    eventDate: Date,
    location: string,
    notifyBefore: '24h' | '2h' | '30m'
  ): Promise<boolean> => {
    try {
      const notificationId = await scheduleEventReminder(
        eventId,
        eventTitle,
        eventDate,
        location,
        notifyBefore
      );

      if (notificationId) {
        await refreshReminders();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error setting reminder:', error);
      return false;
    }
  }, []);

  // Remove a specific reminder
  const removeReminder = useCallback(async (
    eventId: string,
    notifyBefore: '24h' | '2h' | '30m'
  ): Promise<boolean> => {
    try {
      const success = await cancelEventReminder(eventId, notifyBefore);
      if (success) {
        await refreshReminders();
      }
      return success;
    } catch (error) {
      console.error('Error removing reminder:', error);
      return false;
    }
  }, []);

  // Remove all reminders for an event
  const removeAllRemindersForEvent = useCallback(async (
    eventId: string
  ): Promise<boolean> => {
    try {
      const success = await cancelAllEventReminders(eventId);
      if (success) {
        await refreshReminders();
      }
      return success;
    } catch (error) {
      console.error('Error removing reminders:', error);
      return false;
    }
  }, []);

  // Update preferences
  const updatePreferencesHandler = useCallback(async (
    prefs: Partial<NotificationPreferences>
  ): Promise<void> => {
    try {
      await updateNotificationPreferences(prefs);
      const updated = await getNotificationPreferences();
      setPreferences(updated);
    } catch (error) {
      console.error('Error updating preferences:', error);
    }
  }, []);

  // Refresh reminders from storage
  const refreshReminders = useCallback(async (): Promise<void> => {
    try {
      const savedReminders = await getReminders();
      setReminders(savedReminders);
    } catch (error) {
      console.error('Error refreshing reminders:', error);
    }
  }, []);

  // Clear badge
  const clearBadge = useCallback(async (): Promise<void> => {
    await clearBadgeCount();
  }, []);

  // Check if event has a reminder
  const hasReminderForEvent = useCallback((
    eventId: string,
    notifyBefore?: '24h' | '2h' | '30m'
  ): boolean => {
    if (notifyBefore) {
      return reminders.some(
        (r) => r.eventId === eventId && r.notifyBefore === notifyBefore && r.isActive
      );
    }
    return reminders.some((r) => r.eventId === eventId && r.isActive);
  }, [reminders]);

  // Get reminders for a specific event
  const getRemindersForEvent = useCallback((eventId: string): EventReminder[] => {
    return reminders.filter((r) => r.eventId === eventId && r.isActive);
  }, [reminders]);

  return {
    pushToken,
    reminders,
    preferences,
    isLoading,
    hasPermission,
    requestPermissions,
    setReminder,
    removeReminder,
    removeAllRemindersForEvent,
    updatePreferences: updatePreferencesHandler,
    refreshReminders,
    clearBadge,
    hasReminderForEvent,
    getRemindersForEvent,
  };
}

export default useNotifications;
