import { View, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { UrlTile, PROVIDER_DEFAULT } from 'react-native-maps';

import { DEFAULT_REGION, TILE_URL, MAX_ZOOM, TILE_ATTRIBUTION } from '@/constants/map';

export default function MapScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.mapWrapper}>
        <MapView
          provider={PROVIDER_DEFAULT}
          style={styles.map}
          initialRegion={DEFAULT_REGION}
          showsPointsOfInterests={false}
          showsBuildings={false}>
          <UrlTile
            urlTemplate={TILE_URL}
            maximumZ={MAX_ZOOM}
            flipY={false}
          />
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