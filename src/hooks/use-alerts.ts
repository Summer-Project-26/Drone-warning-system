import { useEffect, useState } from 'react';
import { collection, onSnapshot, Timestamp } from 'firebase/firestore';

import { db } from '@/services/firebase';
import type { Alert, AlertLevel, AlertStatus } from '@/types/alert';

// Translate Firestore document (Student C's schema) to our Alert type
function mapFirestoreToAlert(id: string, data: any): Alert {
  const levelMap: Record<string, AlertLevel> = {
    normal: 'low',
    verified: 'medium',
    emergency: 'high',
  };

  const status: AlertStatus = data.verified ? 'verified' : 'unverified';

  const timestampToMs = (v: any): number => {
    if (v instanceof Timestamp) return v.toMillis();
    if (typeof v === 'number') return v;
    if (v?.seconds) return v.seconds * 1000;
    return Date.now();
  };

  const nameFromCategory = (cat: string | undefined): string => {
    if (!cat) return 'Alert';
    return cat.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  };

  return {
    id,
    level: levelMap[data.level] ?? 'low',
    status,
    latitude: data.latitude,
    longitude: data.longitude,
    locationName: nameFromCategory(data.category),
    description: data.description ?? '',
    stillVisible: true,
    photoUrl: data.imageUrl,
    reportedAt: timestampToMs(data.createdAt),
    expiresAt: timestampToMs(data.expiresAt),
    reporterUid: data.userId ?? 'anonymous',
    confirmCount: data.confirmations ?? 1,
  };
}

export function useAlerts(): { alerts: Alert[]; loading: boolean } {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const alertsRef = collection(db, 'alerts');

    const unsubscribe = onSnapshot(
      alertsRef,
      (snapshot) => {
        const list: Alert[] = snapshot.docs
          .map((doc) => mapFirestoreToAlert(doc.id, doc.data()))
          .filter((a) => a.expiresAt > Date.now());
        setAlerts(list);
        setLoading(false);
      },
      (err) => {
        console.error('[useAlerts] firestore error:', err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { alerts, loading };
}