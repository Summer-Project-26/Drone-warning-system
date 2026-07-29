import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Switch, Alert as RNAlert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { signOut } from 'firebase/auth';
import { auth } from '@/services/firebase';

import { loadSettings, saveSettings, DEFAULT_SETTINGS, type AppSettings } from '@/services/settings';
import { stopGeofencing } from '@/services/background-location';

const RADIUS_OPTIONS = [1, 3, 5, 10] as const;

export default function SettingsScreen() {
  const router = useRouter();
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadSettings().then((s) => {
      setSettings(s);
      setLoaded(true);
    });
  }, []);

  async function update<K extends keyof AppSettings>(key: K, value: AppSettings[K]) {
    const next = { ...settings, [key]: value };
    setSettings(next);
    await saveSettings(next);

    if (key === 'backgroundLocationEnabled' && value === false) {
      await stopGeofencing().catch(() => undefined);
    }
  }

  async function handleLogout() {
    RNAlert.alert('Log out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log out',
        style: 'destructive',
        onPress: async () => {
          try {
            await signOut(auth);
          } catch (e) {
            console.error('[settings] logout failed:', e);
          }
        },
      },
    ]);
  }

  if (!loaded) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <Text style={styles.loading}>Loading…</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Settings</Text>
            <Text style={styles.subtitle}>Alerts &amp; preferences</Text>
          </View>
        </View>

        {/* ALERT RADIUS */}
        <Text style={styles.sectionLabel}>ALERT RADIUS</Text>
        <View style={styles.card}>
          <Text style={styles.rowTitle}>Detection radius</Text>
          <Text style={styles.rowSub}>You'll receive alerts within this range</Text>
          <View style={styles.radiusRow}>
            {RADIUS_OPTIONS.map((r) => {
              const selected = settings.alertRadiusKm === r;
              return (
                <Pressable
                  key={r}
                  onPress={() => update('alertRadiusKm', r)}
                  style={[styles.radiusBtn, selected && styles.radiusBtnSelected]}>
                  <Text style={[styles.radiusText, selected && styles.radiusTextSelected]}>
                    {r} km
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* NOTIFICATIONS */}
        <Text style={styles.sectionLabel}>NOTIFICATIONS</Text>
        <View style={styles.card}>
          <ToggleRow
            title="All reports"
            subtitle="Including unverified sightings"
            value={settings.notifyAll}
            onChange={(v) => update('notifyAll', v)}
          />
          <View style={styles.divider} />
          <ToggleRow
            title="Verified only"
            subtitle="Moderator-confirmed alerts"
            value={settings.notifyVerifiedOnly}
            onChange={(v) => update('notifyVerifiedOnly', v)}
          />
          <View style={styles.divider} />
          <ToggleRow
            title="High risk only"
            subtitle="Critical alerts only"
            value={settings.notifyHighRiskOnly}
            onChange={(v) => update('notifyHighRiskOnly', v)}
          />
        </View>

        {/* PRIVACY & LOCATION */}
        <Text style={styles.sectionLabel}>PRIVACY &amp; LOCATION</Text>
        <View style={styles.card}>
          <ToggleRow
            title="Background location"
            subtitle="Required for live alerts"
            value={settings.backgroundLocationEnabled}
            onChange={(v) => update('backgroundLocationEnabled', v)}
          />
          <View style={styles.divider} />
          <ToggleRow
            title="Anonymous reports"
            subtitle="Hide your identity from reports"
            value={settings.anonymousReports}
            onChange={(v) => update('anonymousReports', v)}
          />
        </View>

        {/* Privacy note */}
        <View style={styles.privacyNote}>
          <Ionicons name="lock-closed-outline" size={16} color="#B0B4BA" />
          <Text style={styles.privacyText}>
            Your location data is never stored on our servers. Reports are anonymized before submission.
          </Text>
        </View>

        {/* ACCOUNT */}
        <Text style={styles.sectionLabel}>ACCOUNT</Text>
        <View style={styles.card}>
          <Pressable
            onPress={() => router.push('/profile')}
            style={({ pressed }) => [styles.accountRow, pressed && { opacity: 0.7 }]}>
            <View style={styles.accountIcon}>
              <Ionicons name="person-outline" size={18} color="#3B82F6" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle}>Profile</Text>
              <Text style={styles.rowSub}>Manage your account details</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#60646C" />
          </Pressable>

          <View style={styles.divider} />

          <Pressable
            onPress={() => router.push('/report-bug')}
            style={({ pressed }) => [styles.accountRow, pressed && { opacity: 0.7 }]}>
            <View style={styles.accountIcon}>
              <Ionicons name="bug-outline" size={18} color="#3B82F6" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle}>Report a Bug</Text>
              <Text style={styles.rowSub}>Help us fix issues quickly</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#60646C" />
          </Pressable>
        </View>

        {/* Log out */}
        <Pressable
          onPress={handleLogout}
          style={({ pressed }) => [styles.logoutBtn, pressed && { opacity: 0.7 }]}>
          <Ionicons name="log-out-outline" size={20} color="#EF4444" />
          <Text style={styles.logoutText}>Log out</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function ToggleRow({
  title,
  subtitle,
  value,
  onChange,
}: {
  title: string;
  subtitle: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <View style={styles.toggleRow}>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowTitle}>{title}</Text>
        <Text style={styles.rowSub}>{subtitle}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: '#3F3F46', true: '#3B82F6' }}
        thumbColor="#fff"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#000' },
  loading: { color: '#B0B4BA', textAlign: 'center', marginTop: 40 },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
    marginTop: 8,
  },
  title: { color: '#fff', fontSize: 26, fontWeight: '700' },
  subtitle: { color: '#B0B4BA', fontSize: 13, marginTop: 2 },
  sectionLabel: {
    color: '#60646C',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1,
    marginTop: 20,
    marginBottom: 8,
  },
  card: {
    backgroundColor: '#1F2023',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#2E3135',
    gap: 12,
  },
  rowTitle: { color: '#fff', fontSize: 15, fontWeight: '600' },
  rowSub: { color: '#B0B4BA', fontSize: 12, marginTop: 2 },
  radiusRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  radiusBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3F3F46',
    alignItems: 'center',
  },
  radiusBtnSelected: {
    backgroundColor: '#1E3A8A',
    borderColor: '#3B82F6',
  },
  radiusText: { color: '#B0B4BA', fontSize: 13, fontWeight: '600' },
  radiusTextSelected: { color: '#fff' },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  accountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  accountIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#1B2A4A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: { height: 1, backgroundColor: '#2E3135' },
  privacyNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#1F2023',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2E3135',
    marginTop: 20,
  },
  privacyText: {
    color: '#B0B4BA',
    fontSize: 12,
    lineHeight: 18,
    flex: 1,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#1F2023',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EF4444',
    marginTop: 24,
  },
  logoutText: {
    color: '#EF4444',
    fontSize: 15,
    fontWeight: '600',
  },
});