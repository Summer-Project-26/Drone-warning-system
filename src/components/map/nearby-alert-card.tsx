import { View, Text, StyleSheet, Pressable } from 'react-native';

import { ALERT_COLORS } from '@/constants/map';
import type { AlertWithDistance } from '@/types/alert';
import { formatDistance } from '@/services/geofencing';

interface Props {
  alert: AlertWithDistance;
  onPress?: (alert: AlertWithDistance) => void;
}

export function NearbyAlertCard({ alert, onPress }: Props) {
  const color = ALERT_COLORS[alert.level];

  const minutesAgo = Math.max(0, Math.floor((Date.now() - alert.reportedAt) / 60000));
  const timeStr =
    minutesAgo < 1
      ? 'just now'
      : minutesAgo < 60
        ? `${minutesAgo} min ago`
        : `${Math.floor(minutesAgo / 60)} h ago`;

  return (
    <Pressable
      onPress={() => onPress?.(alert)}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}>
      <View style={[styles.iconBox, { backgroundColor: `${color}22` }]}>
        <View style={[styles.iconInner, { backgroundColor: color }]} />
      </View>

      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{alert.locationName}</Text>
          <View style={[styles.badge, { backgroundColor: `${color}33` }]}>
            <View style={[styles.badgeDot, { backgroundColor: color }]} />
            <Text style={[styles.badgeText, { color }]}>{alert.level.toUpperCase()}</Text>
          </View>
        </View>

        <View style={styles.metaRow}>
          <Text style={styles.meta}>{formatDistance(alert.distanceKm)}</Text>
          <Text style={styles.metaSeparator}>•</Text>
          <Text style={styles.meta}>{timeStr}</Text>
          {alert.confirmCount > 0 && (
            <>
              <Text style={styles.metaSeparator}>•</Text>
              <Text style={styles.meta}>{alert.confirmCount} confirms</Text>
            </>
          )}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#1F2023',
    borderRadius: 14,
    padding: 12,
    gap: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2E3135',
  },
  cardPressed: { opacity: 0.7 },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconInner: { width: 14, height: 14, borderRadius: 3 },
  content: { flex: 1, gap: 4 },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  title: { color: '#fff', fontSize: 15, fontWeight: '600', flex: 1 },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeDot: { width: 6, height: 6, borderRadius: 3 },
  badgeText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  meta: { color: '#B0B4BA', fontSize: 12 },
  metaSeparator: { color: '#60646C', fontSize: 12 },
});