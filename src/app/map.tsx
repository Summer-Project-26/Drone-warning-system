import { View, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { UrlTile, PROVIDER_DEFAULT } from 'react-native-maps';

import { DEFAULT_REGION, TILE_URL, MAX_ZOOM, TILE_ATTRIBUTION } from '@/constants/map';
import { AlertMarker } from '@/components/map/alert-marker';
import type { Alert } from '@/types/alert';

const DUMMY_ALERTS: Alert[] = [
  {
    id: 'a1',
    level: 'high',
    status: 'verified',
    latitude: 65.0145,
    longitude: 25.4720,
    locationName: 'North Park, Oak Street',
    description: 'Low-flying drone circling residential area, heading south',
    direction: 'S',
    stillVisible: true,
    reportedAt: Date.now() - 4 * 60 * 1000,
    expiresAt: Date.now() + 26 * 60 * 1000,
    reporterUid: 'demo-1',
    confirmCount: 5,
  },
  {
    id: 'a2',
    level: 'medium',
    status: 'unverified',
    latitude: 65.0098,
    longitude: 25.4590,
    locationName: 'River District',
    description: 'Drone observed near school playground, hovering',
    direction: 'NW',
    stillVisible: true,
    reportedAt: Date.now() - 18 * 60 * 1000,
    expiresAt: Date.now() + 12 * 60 * 1000,
    reporterUid: 'demo-2',
    confirmCount: 2,
  },
  {
    id: 'a3',
    level: 'low',
    status: 'resolved',
    latitude: 65.0050,
    longitude: 25.4810,
    locationName: 'Market Square',
    description: 'Brief drone sighting, no longer visible',
    stillVisible: false,
    reportedAt: Date.now() - 45 * 60 * 1000,
    expiresAt: Date.now() + 60 * 60 * 1000,
    reporterUid: 'demo-3',
    confirmCount: 1,
  },
];

export default function MapScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.mapWrapper}>
        <MapView
          provider={PROVIDER_DEFAULT}
          style={styles.map}
          initialRegion={DEFAULT_REGION}
          showsUserLocation={true}
          showsPointsOfInterests={false}
          showsBuildings={false}>
          <UrlTile
            urlTemplate={TILE_URL}
            maximumZ={MAX_ZOOM}
            flipY={false}
          />

          {DUMMY_ALERTS.map((alert) => (
            <AlertMarker key={alert.id} alert={alert} />
          ))}
        </MapView>

        <View style={styles.attribution} pointerEvents="none">
          <Text style={styles.attributionText}>{TILE_ATTRIBUTION}</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#000' },
  mapWrapper: { flex: 1, position: 'relative' },
  map: { flex: 1 },
  attribution: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: 'rgba(255,255,255,0.7)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  attributionText: { fontSize: 9, color: '#000' },
});