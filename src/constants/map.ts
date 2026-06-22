// MapTiler tiles. Free tier key, put in .env.
// Falls back to OpenTopoMap if no key (so it doesn't crash in dev).
const MAPTILER_KEY = process.env.EXPO_PUBLIC_MAPTILER_KEY;

export const TILE_URL = MAPTILER_KEY
  ? `https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=${MAPTILER_KEY}`
  : 'https://tile.opentopomap.org/{z}/{x}/{y}.png';

export const TILE_ATTRIBUTION = MAPTILER_KEY
  ? '© MapTiler © OpenStreetMap contributors'
  : '© OpenTopoMap (CC-BY-SA) © OpenStreetMap';

export const MAX_ZOOM = 19;

// Oulu default
export const DEFAULT_REGION = {
  latitude: 65.0121,
  longitude: 25.4651,
  latitudeDelta: 0.15,
  longitudeDelta: 0.15,
};

export const DEFAULT_GEOFENCE_RADIUS_M = 5000;
export const GEOFENCE_RADIUS_OPTIONS_M = [1000, 3000, 5000, 10000] as const;

// foreground updates — every 5s or 10m moved
export const FOREGROUND_LOCATION_INTERVAL_MS = 5000;
export const FOREGROUND_DISTANCE_INTERVAL_M = 10;

// background — lighter to save battery
export const BACKGROUND_LOCATION_INTERVAL_MS = 60000;
export const BACKGROUND_DISTANCE_INTERVAL_M = 100;

export const ALERT_COLORS = {
  high: '#EF4444',
  medium: '#F59E0B',
  low: '#10B981',
} as const;