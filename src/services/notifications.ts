import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import type { Alert as DroneAlert } from '@/types/alert';

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

  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body: `${alert.locationName} — ${alert.description.slice(0, 100)}`,
      data: { alertId: alert.id },
      sound: 'default',
    },
    trigger: null,
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