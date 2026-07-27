import { useEffect, useMemo } from 'react';
import { View, StyleSheet, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { UrlTile, PROVIDER_DEFAULT } from 'react-native-maps';
import * as Location from 'expo-location';
import { useState } from 'react';

import { DEFAULT_REGION, TILE_URL, MAX_ZOOM, TILE_ATTRIBUTION } from '@/constants/map';
import { AlertMarker } from '@/components/map/alert-marker';
import { MapHeader } from '@/components/map/map-header';
import { NearbyAlertCard } from '@/components/map/nearby-alert-card';
import { attachDistances, filterNearby } from '@/services/geofencing';
import { startGeofencing } from '@/services/background-location';
import { useAlerts } from '@/hooks/use-alerts';
import type { AlertWithDistance } from '@/types/alert';

export default function MapScreen() {
  const { alerts, loading } = useAlerts();
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(
    null
  );

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status !== 'granted') return;

      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      if (cancelled) return;
      setUserLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!userLocation || alerts.length === 0) return;
    startGeofencing(alerts, userLocation.latitude, userLocation.longitude).catch((e) =>
      console.warn('[geofencing] start failed:', e)
    );
  }, [alerts, userLocation]);

  const alertsWithDistance: AlertWithDistance[] = useMemo(() => {
    if (!userLocation) {
      return alerts.map((a) => ({ ...a, distanceKm: 0 }));
    }
    return attachDistances(alerts, userLocation.latitude, userLocation.longitude);
  }, [alerts, userLocation]);

  const nearby = useMemo(() => filterNearby(alertsWithDistance, 50), [alertsWithDistance]);

  const worstLevel = useMemo(() => {
    if (nearby.some((a) => a.level === 'high')) return 'high' as const;
    if (nearby.some((a) => a.level === 'medium')) return 'medium' as const;
    if (nearby.length > 0) return 'low' as const;
    return null;
  }, [nearby]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.mapWrapper}>
        <MapHeader activeCount={nearby.length} worstLevel={worstLevel} />

        <MapView
          provider={PROVIDER_DEFAULT}
          style={styles.map}
          initialRegion={DEFAULT_REGION}
          showsUserLocation={true}
          showsPointsOfInterests={false}
          showsBuildings={false}>
          <UrlTile urlTemplate={TILE_URL} maximumZ={MAX_ZOOM} flipY={false} />

          {alertsWithDistance.map((alert) => (
            <AlertMarker key={alert.id} alert={alert} />
          ))}
        </MapView>

        <View style={styles.attribution} pointerEvents="none">
          <Text style={styles.attributionText}>{TILE_ATTRIBUTION}</Text>
        </View>
      </View>

      <View style={styles.nearbySection}>
        <View style={styles.nearbyHeader}>
          <Text style={styles.nearbyTitle}>Nearby Alerts</Text>
          <Text style={styles.seeAll}>See all</Text>
        </View>

        {loading ? (
          <Text style={styles.empty}>Loading alerts…</Text>
        ) : nearby.length === 0 ? (
          <Text style={styles.empty}>No alerts nearby.</Text>
        ) : (
          <ScrollView style={styles.nearbyList}>
            <View style={styles.nearbyListInner}>
              {nearby.slice(0, 3).map((alert) => (
                <NearbyAlertCard key={alert.id} alert={alert} />
              ))}
            </View>
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#000' },
  mapWrapper: { flex: 1.4, position: 'relative' },
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
  nearbySection: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 4,
    gap: 12,
  },
  nearbyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nearbyTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },
  seeAll: { color: '#3B82F6', fontSize: 14, fontWeight: '500' },
  nearbyList: { flex: 1 },
  nearbyListInner: { gap: 10 },
  empty: {
    color: '#60646C',
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 32,
  },
});