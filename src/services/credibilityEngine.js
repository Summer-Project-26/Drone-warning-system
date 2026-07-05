/**
 * Credibility Engine (Student C)
 *
 * Pure logic module — no Firebase imports here on purpose, so it can be
 * unit tested in isolation and reused by alertService.js.
 *
 * RULES (per spec):
 *   1 report  -> normal
 *   2 reports -> verified
 *   3+ reports -> emergency (siren flag ON)
 *
 * Two reports are considered the "same incident" when they share the same
 * category AND are within MATCH_RADIUS_METERS of each other.
 */

export const MATCH_RADIUS_METERS = 500;

export const CredibilityLevel = Object.freeze({
  NORMAL: "normal",
  VERIFIED: "verified",
  EMERGENCY: "emergency",
});

const EARTH_RADIUS_METERS = 6371000;

function toRadians(degrees) {
  return (degrees * Math.PI) / 180;
}

export function haversineDistanceMeters(lat1, lon1, lat2, lon2) {
  if (
    typeof lat1 !== "number" ||
    typeof lon1 !== "number" ||
    typeof lat2 !== "number" ||
    typeof lon2 !== "number"
  ) {
    return Infinity;
  }
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_METERS * c;
}

export function isSameIncident(newReport, existingAlert) {
  if (!existingAlert || existingAlert.category !== newReport.category) {
    return false;
  }
  const distance = haversineDistanceMeters(
    newReport.latitude,
    newReport.longitude,
    existingAlert.latitude,
    existingAlert.longitude,
  );
  return distance <= MATCH_RADIUS_METERS;
}

export function levelForConfirmations(confirmations) {
  if (confirmations >= 3) {
    return CredibilityLevel.EMERGENCY;
  }
  if (confirmations === 2) {
    return CredibilityLevel.VERIFIED;
  }
  return CredibilityLevel.NORMAL;
}

export function findMatchingAlerts(newReport, existingAlerts = []) {
  return existingAlerts.filter(alert => isSameIncident(newReport, alert));
}

export function evaluateCredibility(newReport, existingAlerts = []) {
  const matches = findMatchingAlerts(newReport, existingAlerts);
  const confirmations = matches.length + 1;
  const level = levelForConfirmations(confirmations);

  return {
    confirmations,
    level,
    verified: level !== CredibilityLevel.NORMAL,
    emergencySound: level === CredibilityLevel.EMERGENCY,
    matchedAlertIds: matches.map(alert => alert.id),
  };
}