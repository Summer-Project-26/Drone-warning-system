import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Spacing } from '@/constants/theme';
import { logoutUser } from '@/services/authService';
import { cleanupExpiredAlerts, getRecentAlerts } from '@/services/alertService';
import { getDashboardStats } from '@/services/dashboardService';

const statLabels = [
  { key: 'users', label: 'Users' },
  { key: 'alerts', label: 'Alerts' },
  { key: 'reports', label: 'Reports' },
  { key: 'feedback', label: 'Feedback' },
] as const;

type DashboardStats = {
  users: number;
  alerts: number;
  reports: number;
  feedback: number;
};

type AlertSummary = {
  id: string;
  title?: string;
  message?: string;
};

export function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentAlerts, setRecentAlerts] = useState<AlertSummary[]>([]);
  const [refreshing, setRefreshing] = useState(true);
  const [cleanupCount, setCleanupCount] = useState<number | null>(null);

  const loadDashboard = useCallback(async () => {
    setRefreshing(true);

    try {
      const [dashboardStats, alerts, removedCount] = await Promise.all([
        getDashboardStats(),
        getRecentAlerts(5),
        cleanupExpiredAlerts(),
      ]);

      setStats(dashboardStats);
      setRecentAlerts(alerts);
      setCleanupCount(removedCount);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load dashboard data.';
      Alert.alert('Admin dashboard error', message);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to sign out.';
      Alert.alert('Logout error', message);
    }
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadDashboard} />}>
      <ThemedView style={styles.hero}>
        <ThemedText type="subtitle">Admin Dashboard</ThemedText>
        <ThemedText themeColor="textSecondary">
          Monitoring users, alerts, reports, and feedback from Firestore.
        </ThemedText>
      </ThemedView>

      <View style={styles.statsGrid}>
        {statLabels.map(stat => (
          <ThemedView key={stat.key} type="backgroundElement" style={styles.statCard}>
            <ThemedText type="small" themeColor="textSecondary">
              {stat.label}
            </ThemedText>
            <ThemedText type="title" style={styles.statValue}>
              {stats ? stats[stat.key] : '...'}
            </ThemedText>
          </ThemedView>
        ))}
      </View>

      <ThemedView type="backgroundElement" style={styles.panel}>
        <ThemedText type="subtitle" style={styles.panelTitle}>
          Alert TTL
        </ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.panelBody}>
          Alerts store an expiresAt field and the dashboard removes expired documents older than 24 hours.
        </ThemedText>
        <ThemedText type="smallBold">
          {cleanupCount === null ? 'Cleanup pending' : `Expired alerts deleted: ${cleanupCount}`}
        </ThemedText>
      </ThemedView>

      <ThemedView type="backgroundElement" style={styles.panel}>
        <ThemedText type="subtitle" style={styles.panelTitle}>
          Recent alerts
        </ThemedText>

        {refreshing && !stats ? (
          <ActivityIndicator />
        ) : recentAlerts.length === 0 ? (
          <ThemedText themeColor="textSecondary">No alerts found.</ThemedText>
        ) : (
          recentAlerts.map(alert => (
            <View key={alert.id} style={styles.alertRow}>
              <ThemedText type="smallBold">{alert.title ?? 'Untitled alert'}</ThemedText>
              <ThemedText themeColor="textSecondary" type="small">
                {alert.message ?? 'No message provided.'}
              </ThemedText>
            </View>
          ))
        )}
      </ThemedView>

      <Pressable onPress={loadDashboard} style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
        <ThemedText type="smallBold" style={styles.buttonText}>
          Refresh dashboard
        </ThemedText>
      </Pressable>

      <Pressable onPress={handleLogout} style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}>
        <ThemedText type="smallBold">Sign out</ThemedText>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    gap: Spacing.three,
    padding: Spacing.four,
  },
  hero: {
    gap: Spacing.one,
    padding: Spacing.four,
    borderRadius: Spacing.five,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  statCard: {
    minWidth: 140,
    flexGrow: 1,
    padding: Spacing.three,
    borderRadius: Spacing.four,
    gap: Spacing.one,
  },
  statValue: {
    fontSize: 40,
    lineHeight: 44,
  },
  panel: {
    padding: Spacing.four,
    borderRadius: Spacing.four,
    gap: Spacing.two,
  },
  panelTitle: {
    marginBottom: 4,
  },
  panelBody: {
    lineHeight: 22,
  },
  alertRow: {
    gap: 4,
    paddingVertical: Spacing.two,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.light.backgroundSelected,
  },
  button: {
    borderRadius: Spacing.three,
    paddingVertical: Spacing.three,
    alignItems: 'center',
    backgroundColor: '#3c87f7',
  },
  secondaryButton: {
    borderRadius: Spacing.three,
    paddingVertical: Spacing.three,
    alignItems: 'center',
    backgroundColor: Colors.light.backgroundElement,
  },
  buttonText: {
    color: '#ffffff',
  },
  pressed: {
    opacity: 0.8,
  },
});