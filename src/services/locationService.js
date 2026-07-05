import * as Location from "expo-location";

// Reuse the same default region Student B already defined for the map, so
// there's a single source of truth for the fallback coordinates.
import { DEFAULT_REGION } from "../constants/map";

export const FALLBACK_LOCATION = {
  latitude: DEFAULT_REGION.latitude, // 65.0121
  longitude: DEFAULT_REGION.longitude, // 25.4651
};

export async function resolveAlertLocation(overrideLocation = null) {
  if (
    overrideLocation &&
    typeof overrideLocation.latitude === "number" &&
    typeof overrideLocation.longitude === "number"
  ) {
    return { ...overrideLocation, isFallback: false };
  }

  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      return { ...FALLBACK_LOCATION, isFallback: true };
    }

    const position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    return {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      isFallback: false,
    };
  } catch {
    return { ...FALLBACK_LOCATION, isFallback: true };
  }
}