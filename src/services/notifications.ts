import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Alert as DroneAlert } from '@/types/alert';

const NOTIFICATION_LOG_KEY = 'skyalert:notification-log';
const MAX_LOG_ENTRIES = 50;

export interface NotificationLogEntry {
  id: string;
  title: string;
  body: string;
  timestamp: number;
  alertLevel?: 'low' | 'medium' | 'high';
  alertId?: string;
}

export async function logNotification(entry: NotificationLogEntry): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem(NOTIFICATION_LOG_KEY);
    const existing: NotificationLogEntry[] = raw ? JSON.parse(raw) : [];
    const next = [entry, ...existing].slice(0, MAX_LOG_ENTRIES);
    await AsyncStorage.setItem(NOTIFICATION_LOG_KEY, JSON.stringify(next));
  } catch (e) {
    console.error('[notifications] log failed:', e);
  }
}

export async function loadNotificationLog(): Promise<NotificationLogEntry[]> {
  try {
    const raw = await AsyncStorage.getItem(NOTIFICATION_LOG_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function clearNotificationLog(): Promise<void> {
  try {
    await AsyncStorage.removeItem(NOTIFICATION_LOG_KEY);
  } catch (e) {
    console.error('[notifications] clear failed:', e);
  }
}


Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function requestNotificationPermission(): Promise<boolean> {
  const existing = await Notifications.getPermissionsAsync();
  if (existing.granted) return true;

  const request = await Notifications.requestPermissionsAsync({
    ios: {
      allowAlert: true,
      allowBadge: true,
      allowSound: true,
    },
  });
  return request.granted;
}

export async function setupNotificationChannels(): Promise<void> {
  if (Platform.OS !== 'android') return;

  await Notifications.setNotificationChannelAsync('drone-alerts', {
    name: 'Drone alerts',
    description: 'Notifications when you enter an area with reported drones',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#EF4444',
  });
}

export async function fireGeofenceAlert(alert: DroneAlert): Promise<void> {
  const title =
    alert.level === 'high'
      ? '⚠️ High-risk drone nearby'
      : alert.level === 'medium'
        ? 'Drone reported nearby'
        : 'Drone activity nearby';

  const body = `${alert.locationName} — ${alert.description.slice(0, 100)}`;

  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data: { alertId: alert.id },
      sound: 'default',
    },
    trigger: null,
  });

  await logNotification({
    id: `${Date.now()}-${alert.id}`,
    title,
    body,
    timestamp: Date.now(),
    alertLevel: alert.level,
    alertId: alert.id,
  });
}

export async function fireTestNotification(): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '🧪 Test notification',
      body: 'Local notifications are working',
      sound: 'default',
    },
    trigger: null,
  });
}