import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { CameraView, useCameraPermissions, type CameraCapturedPicture } from 'expo-camera';
import { Image } from 'expo-image';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { submitAlert } from '@/services/alertService';
import { resolveAlertLocation } from '@/services/locationService';

const CATEGORIES = [
  { id: 'drone_sighting', label: 'Drone sighting' },
  { id: 'suspicious_activity', label: 'Suspicious activity' },
  { id: 'no_fly_zone', label: 'No-fly zone violation' },
  { id: 'other', label: 'Other' },
] as const;

type LocationState = {
  latitude: number;
  longitude: number;
  isFallback: boolean;
} | null;

export default function AddAlertScreen() {
  const theme = useTheme();
  const router = useRouter();

  const [category, setCategory] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState<LocationState>(null);
  const [locating, setLocating] = useState(true);

  const [cameraOpen, setCameraOpen] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const cameraRef = useRef<CameraView>(null);

  const [submitting, setSubmitting] = useState(false);

  const loadLocation = useCallback(async () => {
    setLocating(true);
    try {
      const resolved = await resolveAlertLocation();
      setLocation(resolved);
    } finally {
      setLocating(false);
    }
  }, []);

  useEffect(() => {
    loadLocation();
  }, [loadLocation]);

  const handleOpenCamera = useCallback(async () => {
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        Alert.alert(
          'Camera unavailable',
          'Camera permission was denied. You can still submit this alert without a photo.',
        );
        return;
      }
    }
    setCameraOpen(true);
  }, [permission, requestPermission]);

  const handleCapture = useCallback(async () => {
    if (!cameraRef.current) return;
    try {
      const picture: CameraCapturedPicture | undefined = await cameraRef.current.takePictureAsync({
        quality: 0.6,
      });
      if (picture?.uri) {
        setPhotoUri(picture.uri);
      }
    } catch {
      Alert.alert('Camera error', 'Could not capture a photo. You can continue without one.');
    } finally {
      setCameraOpen(false);
    }
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!category) {
      Alert.alert('Category required', 'Please choose what you are reporting.');
      return;
    }
    if (!location) {
      Alert.alert('Location required', 'Still resolving your location — try again in a moment.');
      return;
    }

    setSubmitting(true);
    try {
      const result = await submitAlert({
        category,
        description: description.trim(),
        latitude: location.latitude,
        longitude: location.longitude,
        localImageUri: photoUri ?? undefined,
      });

      Alert.alert(
        result.level === 'emergency' ? 'Emergency alert sent 🚨' : 'Alert sent',
        result.level === 'emergency'
          ? 'This matches 3+ nearby reports and has been marked as an emergency.'
          : result.level === 'verified'
            ? 'This matches another nearby report and has been marked as verified.'
            : 'Thanks — your report is now live on the map.',
        [{ text: 'OK', onPress: () => router.back() }],
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not submit this alert.';
      Alert.alert('Submission failed', message);
    } finally {
      setSubmitting(false);
    }
  }, [category, description, location, photoUri, router]);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.headerRow}>
            <Pressable onPress={() => router.back()} hitSlop={12}>
              <ThemedText type="link">Cancel</ThemedText>
            </Pressable>
          </View>

          <ThemedText type="title" style={styles.title}>
            Report a drone
          </ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.subtitle}>
            A photo is optional — you can always skip it and submit with just a category and
            description.
          </ThemedText>

          <ThemedText type="smallBold" style={styles.sectionLabel}>
            Category
          </ThemedText>
          <View style={styles.pillRow}>
            {CATEGORIES.map(item => {
              const selected = category === item.id;
              return (
                <Pressable
                  key={item.id}
                  onPress={() => setCategory(item.id)}
                  style={[
                    styles.pill,
                    {
                      backgroundColor: selected ? theme.text : theme.backgroundElement,
                    },
                  ]}>
                  <ThemedText
                    type="small"
                    style={{ color: selected ? theme.background : theme.text }}>
                    {item.label}
                  </ThemedText>
                </Pressable>
              );
            })}
          </View>

          <ThemedText type="smallBold" style={styles.sectionLabel}>
            Description
          </ThemedText>
          <ThemedView type="backgroundElement" style={styles.textAreaWrapper}>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="What did you see? Altitude, direction, number of drones..."
              placeholderTextColor={theme.textSecondary}
              multiline
              numberOfLines={4}
              style={[styles.textArea, { color: theme.text }]}
            />
          </ThemedView>

          <ThemedText type="smallBold" style={styles.sectionLabel}>
            Photo (optional)
          </ThemedText>
          {photoUri ? (
            <View style={styles.photoPreviewWrapper}>
              <Image source={{ uri: photoUri }} style={styles.photoPreview} contentFit="cover" />
              <View style={styles.photoActionsRow}>
                <Pressable
                  onPress={handleOpenCamera}
                  style={[styles.secondaryButton, { borderColor: theme.textSecondary }]}>
                  <ThemedText type="small">Retake</ThemedText>
                </Pressable>
                <Pressable
                  onPress={() => setPhotoUri(null)}
                  style={[styles.secondaryButton, { borderColor: theme.textSecondary }]}>
                  <ThemedText type="small">Remove photo</ThemedText>
                </Pressable>
              </View>
            </View>
          ) : (
            <View style={styles.photoActionsRow}>
              <Pressable
                onPress={handleOpenCamera}
                style={[styles.secondaryButton, { borderColor: theme.textSecondary }]}>
                <ThemedText type="small">Take photo</ThemedText>
              </Pressable>
              <ThemedText type="small" themeColor="textSecondary">
                or just skip it
              </ThemedText>
            </View>
          )}

          <ThemedText type="smallBold" style={styles.sectionLabel}>
            Location
          </ThemedText>
          <ThemedView type="backgroundElement" style={styles.locationCard}>
            {locating ? (
              <ActivityIndicator />
            ) : location ? (
              <>
                <ThemedText type="small">
                  {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                </ThemedText>
                {location.isFallback && (
                  <ThemedText type="small" themeColor="textSecondary">
                    GPS unavailable — using the default fallback location.
                  </ThemedText>
                )}
              </>
            ) : (
              <ThemedText type="small" themeColor="textSecondary">
                Could not resolve a location.
              </ThemedText>
            )}
            <Pressable onPress={loadLocation} hitSlop={8}>
              <ThemedText type="link">Refresh location</ThemedText>
            </Pressable>
          </ThemedView>

          <Pressable
            onPress={handleSubmit}
            disabled={submitting}
            style={[styles.submitButton, submitting && { opacity: 0.7 }]}>
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <ThemedText type="smallBold" style={{ color: '#fff' }}>
                Submit alert
              </ThemedText>
            )}
          </Pressable>
        </ScrollView>
      </SafeAreaView>

      <Modal visible={cameraOpen} animationType="slide">
        <View style={styles.cameraContainer}>
          <CameraView ref={cameraRef} style={styles.camera} facing="back" />
          <View style={styles.cameraControls}>
            <Pressable
              onPress={() => setCameraOpen(false)}
              style={[styles.secondaryButton, styles.cameraCancel]}>
              <ThemedText type="small" style={{ color: '#fff' }}>
                Cancel
              </ThemedText>
            </Pressable>
            <Pressable onPress={handleCapture} style={styles.shutterButton} />
          </View>
        </View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  scrollContent: {
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.six,
    gap: Spacing.one,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingTop: Spacing.two,
  },
  title: {
    fontSize: 32,
    lineHeight: 38,
    marginTop: Spacing.two,
  },
  subtitle: {
    marginTop: Spacing.one,
    marginBottom: Spacing.three,
  },
  sectionLabel: {
    marginTop: Spacing.three,
    marginBottom: Spacing.two,
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  pill: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.five,
  },
  textAreaWrapper: {
    borderRadius: Spacing.three,
    padding: Spacing.three,
  },
  textArea: {
    fontSize: 16,
    minHeight: 96,
    textAlignVertical: 'top',
  },
  photoActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  secondaryButton: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.five,
    borderWidth: StyleSheet.hairlineWidth,
  },
  photoPreviewWrapper: {
    gap: Spacing.two,
  },
  photoPreview: {
    width: '100%',
    aspectRatio: 4 / 3,
    borderRadius: Spacing.three,
  },
  locationCard: {
    borderRadius: Spacing.three,
    padding: Spacing.three,
    gap: Spacing.one,
    alignItems: 'flex-start',
  },
  submitButton: {
    marginTop: Spacing.five,
    backgroundColor: '#3B82F6',
    borderRadius: Spacing.four,
    paddingVertical: Spacing.three,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  cameraControls: {
    position: 'absolute',
    bottom: Spacing.six,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.five,
  },
  cameraCancel: {
    position: 'absolute',
    left: Spacing.four,
    borderColor: '#fff',
  },
  shutterButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#fff',
    borderWidth: 4,
    borderColor: Colors.dark.backgroundElement,
  },
});