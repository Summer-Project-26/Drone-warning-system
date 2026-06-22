export type AlertLevel = 'low' | 'medium' | 'high';
export type AlertStatus = 'unverified' | 'verified' | 'resolved' | 'expired';
export type AlertDirection = 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'NW';

export interface Alert {
  id: string;
  level: AlertLevel;
  status: AlertStatus;

  latitude: number;
  longitude: number;
  locationName: string;

  description: string;
  direction?: AlertDirection;
  stillVisible: boolean;
  photoUrl?: string;

  reportedAt: number; // unix ms
  expiresAt: number;
  reporterUid: string;
  confirmCount: number;
}

export interface AlertWithDistance extends Alert {
  distanceKm: number;
}