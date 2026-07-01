import { View, Text, StyleSheet } from 'react-native';
import { Marker, Callout } from 'react-native-maps';

import { ALERT_COLORS } from '@/constants/map';
import type { Alert } from '@/types/alert';

interface Props {
  alert: Alert;
  onPress?: (alert: Alert) => void;
}

export function AlertMarker({ alert, onPress }: Props) {
  const color = ALERT_COLORS[alert.level];

  return (
    <Marker
      coordinate={{ latitude: alert.latitude, longitude: alert.longitude }}
      tracksViewChanges={false}
      onPress={() => onPress?.(alert)}>
      <View style={[styles.pin, { backgroundColor: color }]}>
        <View style={styles.pinInner} />
      </View>

      <Callout tooltip>
        <View style={styles.callout}>
          <View style={styles.calloutHeader}>
            <View style={[styles.dot, { backgroundColor: color }]} />
            <Text style={styles.calloutTitle} numberOfLines={1}>
              {alert.locationName}
            </Text>
          </View>
          <Text style={styles.calloutLevel}>{alert.level.toUpperCase()}</Text>
          <Text style={styles.calloutDesc} numberOfLines={2}>
            {alert.description}
          </Text>
        </View>
      </Callout>
    </Marker>
  );
}

const styles = StyleSheet.create({
  pin: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.9)',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  pinInner: {
    width: 10,
    height: 10,
    backgroundColor: '#fff',
    borderRadius: 2,
  },
  callout: {
    backgroundColor: '#1F2023',
    borderRadius: 12,
    padding: 12,
    width: 220,
    borderWidth: 1,
    borderColor: '#2E3135',
  },
  calloutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  calloutTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  calloutLevel: {
    color: '#B0B4BA',
    fontSize: 11,
    fontWeight: '500',
    marginBottom: 6,
  },
  calloutDesc: {
    color: '#B0B4BA',
    fontSize: 12,
    lineHeight: 16,
  },
});