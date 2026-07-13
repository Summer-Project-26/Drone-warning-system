import type { Alert, AlertWithDistance } from '@/types/alert';

const EARTH_RADIUS_M = 6371000;

export function distanceMeters(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_M * c;
}

export function distanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  return distanceMeters(lat1, lng1, lat2, lng2) / 1000;
}

export function attachDistances(
  alerts: Alert[],
  userLat: number,
  userLng: number
): AlertWithDistance[] {
  return alerts
    .map((alert) => ({
      ...alert,
      distanceKm: distanceKm(userLat, userLng, alert.latitude, alert.longitude),
    }))
    .sort((a, b) => a.distanceKm - b.distanceKm);
}

export function filterNearby(alerts: AlertWithDistance[], radiusKm: number): AlertWithDistance[] {
  return alerts.filter((a) => a.distanceKm <= radiusKm);
}

export function formatDistance(km: number): string {
  if (km < 0.1) return '< 100 m';
  if (km < 10) return `${km.toFixed(1)} km`;
  return `${Math.round(km)} km`;
}