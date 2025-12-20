/**
 * Notification Service - CampusPulse
 * Handles push notifications and event reminders
 */

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Types
export interface EventReminder {
  id: string;
  eventId: string;
  eventTitle: string;
  eventDate: Date;
  location: string;
  notifyBefore: '24h' | '2h' | '30m';
  notificationId?: string;
  isActive: boolean;
}

export interface NotificationPreferences {
  eventReminders: boolean;
  newEvents: boolean;
  pointsEarned: boolean;
  badgesUnlocked: boolean;
  socialUpdates: boolean;
  marketingUpdates: boolean;
}

// Constants
const REMINDERS_STORAGE_KEY = '@campuspulse_reminders';
const PREFERENCES_STORAGE_KEY = '@campuspulse_notification_prefs';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Register for push notifications
 */
export async function registerForPushNotifications(): Promise<string | null> {
  let token: string | null = null;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF6B35',
    });

    await Notifications.setNotificationChannelAsync('reminders', {
      name: 'Event Reminders',
      description: 'Reminders for upcoming events',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF6B35',
      sound: 'default',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return null;
    }

    try {
      const pushToken = await Notifications.getExpoPushTokenAsync({
        projectId: 'your-project-id', // Replace with your Expo project ID
      });
      token = pushToken.data;
    } catch (error) {
      console.log('Error getting push token:', error);
    }
  } else {
    console.log('Must use physical device for Push Notifications');
  }

  return token;
}

/**
 * Schedule a reminder notification for an event
 */
export async function scheduleEventReminder(
  eventId: string,
  eventTitle: string,
  eventDate: Date,
  location: string,
  notifyBefore: '24h' | '2h' | '30m'
): Promise<string | null> {
  // Calculate trigger time
  const now = new Date();
  let triggerDate = new Date(eventDate);

  switch (notifyBefore) {
    case '24h':
      triggerDate.setHours(triggerDate.getHours() - 24);
      break;
    case '2h':
      triggerDate.setHours(triggerDate.getHours() - 2);
      break;
    case '30m':
      triggerDate.setMinutes(triggerDate.getMinutes() - 30);
      break;
  }

  // Don't schedule if the trigger time is in the past
  if (triggerDate <= now) {
    console.log('Reminder time is in the past, not scheduling');
    return null;
  }

  const timeUntilEvent = getTimeUntilString(notifyBefore);

  try {
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: `🔔 ${eventTitle}`,
        body: `Starting ${timeUntilEvent}! Don't forget to check in at ${location}.`,
        data: { eventId, type: 'event_reminder' },
        sound: 'default',
        ...(Platform.OS === 'android' && { channelId: 'reminders' }),
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: triggerDate,
      },
    });

    // Save reminder to storage
    await saveReminder({
      id: `${eventId}_${notifyBefore}`,
      eventId,
      eventTitle,
      eventDate,
      location,
      notifyBefore,
      notificationId,
      isActive: true,
    });

    return notificationId;
  } catch (error) {
    console.error('Error scheduling notification:', error);
    return null;
  }
}

/**
 * Cancel a scheduled reminder
 */
export async function cancelEventReminder(
  eventId: string,
  notifyBefore: '24h' | '2h' | '30m'
): Promise<boolean> {
  try {
    const reminders = await getReminders();
    const reminderId = `${eventId}_${notifyBefore}`;
    const reminder = reminders.find((r) => r.id === reminderId);

    if (reminder?.notificationId) {
      await Notifications.cancelScheduledNotificationAsync(reminder.notificationId);
    }

    // Update storage
    const updatedReminders = reminders.filter((r) => r.id !== reminderId);
    await AsyncStorage.setItem(REMINDERS_STORAGE_KEY, JSON.stringify(updatedReminders));

    return true;
  } catch (error) {
    console.error('Error canceling reminder:', error);
    return false;
  }
}

/**
 * Cancel all reminders for an event
 */
export async function cancelAllEventReminders(eventId: string): Promise<boolean> {
  try {
    const reminders = await getReminders();
    const eventReminders = reminders.filter((r) => r.eventId === eventId);

    for (const reminder of eventReminders) {
      if (reminder.notificationId) {
        await Notifications.cancelScheduledNotificationAsync(reminder.notificationId);
      }
    }

    // Update storage
    const updatedReminders = reminders.filter((r) => r.eventId !== eventId);
    await AsyncStorage.setItem(REMINDERS_STORAGE_KEY, JSON.stringify(updatedReminders));

    return true;
  } catch (error) {
    console.error('Error canceling reminders:', error);
    return false;
  }
}

/**
 * Get all saved reminders
 */
export async function getReminders(): Promise<EventReminder[]> {
  try {
    const data = await AsyncStorage.getItem(REMINDERS_STORAGE_KEY);
    if (data) {
      const reminders = JSON.parse(data);
      // Convert date strings back to Date objects
      return reminders.map((r: any) => ({
        ...r,
        eventDate: new Date(r.eventDate),
      }));
    }
    return [];
  } catch (error) {
    console.error('Error getting reminders:', error);
    return [];
  }
}

/**
 * Save a reminder to storage
 */
async function saveReminder(reminder: EventReminder): Promise<void> {
  try {
    const reminders = await getReminders();
    const existingIndex = reminders.findIndex((r) => r.id === reminder.id);

    if (existingIndex >= 0) {
      reminders[existingIndex] = reminder;
    } else {
      reminders.push(reminder);
    }

    await AsyncStorage.setItem(REMINDERS_STORAGE_KEY, JSON.stringify(reminders));
  } catch (error) {
    console.error('Error saving reminder:', error);
  }
}

/**
 * Get notification preferences
 */
export async function getNotificationPreferences(): Promise<NotificationPreferences> {
  try {
    const data = await AsyncStorage.getItem(PREFERENCES_STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
    // Default preferences
    return {
      eventReminders: true,
      newEvents: true,
      pointsEarned: true,
      badgesUnlocked: true,
      socialUpdates: true,
      marketingUpdates: false,
    };
  } catch (error) {
    console.error('Error getting notification preferences:', error);
    return {
      eventReminders: true,
      newEvents: true,
      pointsEarned: true,
      badgesUnlocked: true,
      socialUpdates: true,
      marketingUpdates: false,
    };
  }
}

/**
 * Update notification preferences
 */
export async function updateNotificationPreferences(
  preferences: Partial<NotificationPreferences>
): Promise<void> {
  try {
    const current = await getNotificationPreferences();
    const updated = { ...current, ...preferences };
    await AsyncStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Error updating notification preferences:', error);
  }
}

/**
 * Send a local notification immediately
 */
export async function sendLocalNotification(
  title: string,
  body: string,
  data?: Record<string, any>
): Promise<string> {
  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data: data || {},
      sound: 'default',
    },
    trigger: null, // Send immediately
  });

  return notificationId;
}

/**
 * Get all scheduled notifications
 */
export async function getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
  return await Notifications.getAllScheduledNotificationsAsync();
}

/**
 * Cancel all scheduled notifications
 */
export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
  await AsyncStorage.setItem(REMINDERS_STORAGE_KEY, JSON.stringify([]));
}

/**
 * Get badge count
 */
export async function getBadgeCount(): Promise<number> {
  return await Notifications.getBadgeCountAsync();
}

/**
 * Set badge count
 */
export async function setBadgeCount(count: number): Promise<void> {
  await Notifications.setBadgeCountAsync(count);
}

/**
 * Clear badge count
 */
export async function clearBadgeCount(): Promise<void> {
  await Notifications.setBadgeCountAsync(0);
}

// Helper functions
function getTimeUntilString(notifyBefore: '24h' | '2h' | '30m'): string {
  switch (notifyBefore) {
    case '24h':
      return 'in 24 hours';
    case '2h':
      return 'in 2 hours';
    case '30m':
      return 'in 30 minutes';
  }
}

// Export notification listeners setup
export function setupNotificationListeners(
  onNotificationReceived: (notification: Notifications.Notification) => void,
  onNotificationResponse: (response: Notifications.NotificationResponse) => void
) {
  const receivedSubscription = Notifications.addNotificationReceivedListener(onNotificationReceived);
  const responseSubscription = Notifications.addNotificationResponseReceivedListener(onNotificationResponse);

  return () => {
    receivedSubscription.remove();
    responseSubscription.remove();
  };
}

export default {
  registerForPushNotifications,
  scheduleEventReminder,
  cancelEventReminder,
  cancelAllEventReminders,
  getReminders,
  getNotificationPreferences,
  updateNotificationPreferences,
  sendLocalNotification,
  getScheduledNotifications,
  cancelAllNotifications,
  getBadgeCount,
  setBadgeCount,
  clearBadgeCount,
  setupNotificationListeners,
};
