import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';

import type { Alert as DroneAlert } from '@/types/alert';
import { DEFAULT_GEOFENCE_RADIUS_M } from '@/constants/map';
import { fireGeofenceAlert } from './notifications';

export const GEOFENCE_TASK_NAME = 'skyalert.geofence-task';

const alertCache = new Map<string, DroneAlert>();

TaskManager.defineTask(GEOFENCE_TASK_NAME, async ({ data, error }) => {
  if (error) {
    console.error('[geofence-task] error:', error);
    return;
  }

  const { eventType, region } = data as {
    eventType: Location.GeofencingEventType;
    region: Location.LocationRegion;
  };

  if (eventType !== Location.GeofencingEventType.Enter) return;
  if (!region.identifier) return;

  const alert = alertCache.get(region.identifier);
  if (!alert) {
    console.warn(`[geofence-task] no cached alert for region ${region.identifier}`);
    return;
  }

  await fireGeofenceAlert(alert);
});

export async function requestLocationPermissions(): Promise<{
  foreground: boolean;
  background: boolean;
}> {
  const fg = await Location.requestForegroundPermissionsAsync();
  if (!fg.granted) {
    return { foreground: false, background: false };
  }

  const bg = await Location.requestBackgroundPermissionsAsync();
  return { foreground: true, background: bg.granted };
}

export async function startGeofencing(
  alerts: DroneAlert[],
  userLat: number,
  userLng: number,
  radiusMeters: number = DEFAULT_GEOFENCE_RADIUS_M
): Promise<void> {
  const nearest = [...alerts]
    .map((a) => ({
      alert: a,
      dist: (a.latitude - userLat) ** 2 + (a.longitude - userLng) ** 2,
    }))
    .sort((a, b) => a.dist - b.dist)
    .slice(0, 20)
    .map((x) => x.alert);

  alertCache.clear();
  for (const alert of nearest) {
    alertCache.set(alert.id, alert);
  }

  const isRunning = await Location.hasStartedGeofencingAsync(GEOFENCE_TASK_NAME);
  if (isRunning) {
    await Location.stopGeofencingAsync(GEOFENCE_TASK_NAME);
  }

  const regions: Location.LocationRegion[] = nearest.map((a) => ({
    identifier: a.id,
    latitude: a.latitude,
    longitude: a.longitude,
    radius: radiusMeters,
    notifyOnEnter: true,
    notifyOnExit: false,
  }));

  if (regions.length === 0) return;

  await Location.startGeofencingAsync(GEOFENCE_TASK_NAME, regions);
}

export async function stopGeofencing(): Promise<void> {
  const isRunning = await Location.hasStartedGeofencingAsync(GEOFENCE_TASK_NAME);
  if (isRunning) {
    await Location.stopGeofencingAsync(GEOFENCE_TASK_NAME);
  }
  alertCache.clear();
}