import { View, Text, StyleSheet } from 'react-native';

import { ALERT_COLORS } from '@/constants/map';
import type { AlertLevel } from '@/types/alert';

interface Props {
  activeCount: number;
  worstLevel: AlertLevel | null;
}

export function MapHeader({ activeCount, worstLevel }: Props) {
  return (
    <View style={styles.container} pointerEvents="box-none">
      <View style={styles.card}>
        <View>
          <Text style={styles.title}>SkyAlert</Text>
          <Text style={styles.subtitle}>{activeCount} active nearby</Text>
        </View>
        {worstLevel && (
          <View style={[styles.badge, { backgroundColor: ALERT_COLORS[worstLevel] }]}>
            <Text style={styles.badgeText}>{worstLevel.toUpperCase()}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    zIndex: 10,
  },
  card: {
    backgroundColor: 'rgba(31,32,35,0.95)',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    alignSelf: 'flex-start',
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  title: { color: '#fff', fontSize: 16, fontWeight: '700' },
  subtitle: { color: '#B0B4BA', fontSize: 12, marginTop: 2 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
});