import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';

export default function LocationPermissionScreen() {
  const router = useRouter();
  const [requesting, setRequesting] = useState(false);

  async function handleAllow() {
    setRequesting(true);
    try {
      const fg = await Location.requestForegroundPermissionsAsync();
      if (fg.granted) {
        await Location.requestBackgroundPermissionsAsync();
      }
    } catch (e) {
      console.error('[permission] request failed:', e);
    } finally {
      setRequesting(false);
      router.replace('/map');
    }
  }

  function handleSkip() {
    router.replace('/map');
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.iconWrap}>
          <View style={styles.iconBox} />
        </View>

        <Text style={styles.title}>Enable location access</Text>
        <Text style={styles.body}>
          SkyAlert uses your location to show drone warnings nearby and send you relevant alerts in
          your area.
        </Text>

        <View style={styles.benefits}>
          <BenefitRow text="Receive warnings within your chosen radius" />
          <BenefitRow text="Auto-fill location when submitting a report" />
          <BenefitRow text="See distance to each alert on the feed" />
        </View>

        <Pressable
          onPress={handleAllow}
          disabled={requesting}
          style={({ pressed }) => [
            styles.primaryBtn,
            pressed && styles.pressed,
            requesting && styles.disabled,
          ]}>
          <Text style={styles.primaryBtnText}>
            {requesting ? 'Requesting…' : 'Allow Location Access'}
          </Text>
        </Pressable>

        <Pressable
          onPress={handleSkip}
          style={({ pressed }) => [styles.secondaryBtn, pressed && styles.pressed]}>
          <Text style={styles.secondaryBtnText}>Not now — enter manually</Text>
        </Pressable>

        <View style={styles.privacy}>
          <Text style={styles.privacyText}>
            Location data is processed on-device. We comply with GDPR and local privacy regulations.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function BenefitRow({ text }: { text: string }) {
  return (
    <View style={styles.benefitRow}>
      <View style={styles.benefitCheck} />
      <Text style={styles.benefitText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#000' },
  content: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 24,
    alignItems: 'center',
    gap: 16,
  },
  iconWrap: { marginTop: 24, marginBottom: 8 },
  iconBox: {
    width: 80,
    height: 80,
    borderRadius: 16,
    backgroundColor: '#1B2A4A',
    borderWidth: 1.5,
    borderColor: '#3B82F6',
  },
  title: { color: '#fff', fontSize: 24, fontWeight: '700', textAlign: 'center' },
  body: {
    color: '#B0B4BA',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 8,
    marginBottom: 8,
  },
  benefits: { alignSelf: 'stretch', gap: 10, marginTop: 8 },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#1F2023',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2E3135',
  },
  benefitCheck: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#3B82F6',
  },
  benefitText: { color: '#fff', fontSize: 14, flex: 1 },
  primaryBtn: {
    alignSelf: 'stretch',
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  secondaryBtn: {
    alignSelf: 'stretch',
    backgroundColor: '#1F2023',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2E3135',
  },
  secondaryBtnText: { color: '#B0B4BA', fontSize: 14, fontWeight: '500' },
  pressed: { opacity: 0.7 },
  disabled: { opacity: 0.5 },
  privacy: {
    alignSelf: 'stretch',
    backgroundColor: '#1F2023',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2E3135',
    marginTop: 8,
  },
  privacyText: {
    color: '#B0B4BA',
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
  },
});