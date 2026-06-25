import { useCallback, useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { logoutUser } from '@/services/authService';

export default function HomeScreen() {
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = useCallback(async () => {
    try {
      setLoggingOut(true);
      await logoutUser();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to sign out.';
      Alert.alert('Logout error', message);
    } finally {
      setLoggingOut(false);
    }
  }, []);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.logoutSlot}>
          <Pressable
            onPress={handleLogout}
            style={({ pressed }) => [styles.logoutButton, pressed && styles.logoutButtonPressed]}
            disabled={loggingOut}>
            <ThemedText type="smallBold" style={styles.logoutText}>
              {loggingOut ? 'Logging out...' : 'Log out'}
            </ThemedText>
          </Pressable>
        </View>

        <ThemedView style={styles.heroSection}>
          <ThemedText type="smallBold" style={styles.pill}>
            SkyAlert control center
          </ThemedText>
          <ThemedText type="title" style={styles.title}>
            Keep drone warnings visible, fast, and under control.
          </ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.subtitle}>
            Monitor active alerts, review recent activity, and stay signed in to your operational dashboard.
          </ThemedText>
        </ThemedView>

        <View style={styles.cardGrid}>
          <ThemedView type="backgroundElement" style={styles.infoCard}>
            <ThemedText type="smallBold">Live alerts</ThemedText>
            <ThemedText themeColor="textSecondary" type="small">
              Watch the latest drone alerts that still fall inside the 24-hour window.
            </ThemedText>
          </ThemedView>

          <ThemedView type="backgroundElement" style={styles.infoCard}>
            <ThemedText type="smallBold">Admin tools</ThemedText>
            <ThemedText themeColor="textSecondary" type="small">
              Review users, expired alerts, and cleanup activity from the admin dashboard.
            </ThemedText>
          </ThemedView>

          <ThemedView type="backgroundElement" style={styles.infoCard}>
            <ThemedText type="smallBold">Secure session</ThemedText>
            <ThemedText themeColor="textSecondary" type="small">
              Use the corner button to log out instantly when you&apos;re done.
            </ThemedText>
          </ThemedView>
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    flexDirection: 'row',
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    gap: Spacing.three,
    paddingBottom: BottomTabInset + Spacing.three,
    maxWidth: MaxContentWidth,
    width: '100%',
  },
  logoutSlot: {
    width: '100%',
    alignItems: 'flex-end',
  },
  logoutButton: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    borderRadius: Spacing.five,
    backgroundColor: '#FEE2E2',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#FCA5A5',
  },
  logoutButtonPressed: {
    opacity: 0.8,
  },
  logoutText: {
    color: '#B91C1C',
  },
  heroSection: {
    gap: Spacing.three,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.three,
  },
  title: {
    maxWidth: 420,
  },
  subtitle: {
    maxWidth: 460,
    lineHeight: 22,
  },
  pill: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    borderRadius: Spacing.five,
    backgroundColor: '#DBEAFE',
    color: '#1D4ED8',
  },
  cardGrid: {
    gap: Spacing.two,
    paddingTop: Spacing.three,
  },
  infoCard: {
    gap: Spacing.one,
    padding: Spacing.four,
    borderRadius: Spacing.four,
  },
});
