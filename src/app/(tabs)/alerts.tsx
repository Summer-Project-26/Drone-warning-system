import { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { loadNotificationLog, clearNotificationLog, type NotificationLogEntry } from '@/services/notifications';
import { ALERT_COLORS } from '@/constants/map';

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

function bucketFor(timestamp: number): 'today' | 'yesterday' | 'earlier' {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfYesterday = startOfToday - ONE_DAY_MS;

  if (timestamp >= startOfToday) return 'today';
  if (timestamp >= startOfYesterday) return 'yesterday';
  return 'earlier';
}

function formatTime(timestamp: number): string {
  const d = new Date(timestamp);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function NotificationsScreen() {
  const router = useRouter();
  const [log, setLog] = useState<NotificationLogEntry[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const entries = await loadNotificationLog();
    setLog(entries);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  async function handleClear() {
    await clearNotificationLog();
    setLog([]);
  }

  const grouped = {
    today: log.filter((e) => bucketFor(e.timestamp) === 'today'),
    yesterday: log.filter((e) => bucketFor(e.timestamp) === 'yesterday'),
    earlier: log.filter((e) => bucketFor(e.timestamp) === 'earlier'),
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.headerRow}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Notifications</Text>
        </View>
        {log.length > 0 && (
          <Pressable onPress={handleClear} style={styles.clearBtn}>
            <Text style={styles.clearText}>Clear</Text>
          </Pressable>
        )}
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={async () => {
              setRefreshing(true);
              await load();
              setRefreshing(false);
            }}
            tintColor="#3B82F6"
          />
        }>
        {log.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="notifications-outline" size={48} color="#60646C" />
            <Text style={styles.emptyText}>No notifications yet</Text>
            <Text style={styles.emptySub}>
              You'll see drone alerts here when they trigger in your area
            </Text>
          </View>
        ) : (
          <>
            <NotificationGroup label="TODAY" entries={grouped.today} />
            <NotificationGroup label="YESTERDAY" entries={grouped.yesterday} />
            <NotificationGroup label="EARLIER" entries={grouped.earlier} />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function NotificationGroup({ label, entries }: { label: string; entries: NotificationLogEntry[] }) {
  if (entries.length === 0) return null;

  return (
    <View style={{ gap: 8 }}>
      <Text style={styles.groupLabel}>{label}</Text>
      {entries.map((entry) => (
        <NotificationCard key={entry.id} entry={entry} />
      ))}
    </View>
  );
}

function NotificationCard({ entry }: { entry: NotificationLogEntry }) {
  const color = entry.alertLevel ? ALERT_COLORS[entry.alertLevel] : '#3B82F6';

  return (
    <View style={styles.card}>
      <View style={[styles.iconBox, { backgroundColor: `${color}22` }]}>
        <View style={[styles.iconInner, { backgroundColor: color }]} />
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle} numberOfLines={1}>
          {entry.title}
        </Text>
        <Text style={styles.cardBody} numberOfLines={2}>
          {entry.body}
        </Text>
        <View style={styles.metaRow}>
          <Text style={styles.metaText}>{formatTime(entry.timestamp)}</Text>
          {entry.alertLevel && (
            <>
              <Text style={styles.metaSeparator}>•</Text>
              <View style={[styles.levelBadge, { backgroundColor: `${color}33` }]}>
                <Text style={[styles.levelBadgeText, { color }]}>
                  {entry.alertLevel.toUpperCase()}
                </Text>
              </View>
            </>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#000' },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { color: '#fff', fontSize: 22, fontWeight: '700' },
  clearBtn: { paddingHorizontal: 12, paddingVertical: 8 },
  clearText: { color: '#EF4444', fontSize: 14, fontWeight: '500' },
  content: { paddingHorizontal: 16, paddingBottom: 24, gap: 16 },
  empty: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyText: { color: '#B0B4BA', fontSize: 16, fontWeight: '600' },
  emptySub: {
    color: '#60646C',
    fontSize: 13,
    textAlign: 'center',
    paddingHorizontal: 32,
    lineHeight: 20,
  },
  groupLabel: {
    color: '#60646C',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1,
    marginTop: 8,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#1F2023',
    borderRadius: 14,
    padding: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: '#2E3135',
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconInner: { width: 14, height: 14, borderRadius: 3 },
  cardContent: { flex: 1, gap: 4 },
  cardTitle: { color: '#fff', fontSize: 15, fontWeight: '600' },
  cardBody: { color: '#B0B4BA', fontSize: 13, lineHeight: 18 },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  metaText: { color: '#B0B4BA', fontSize: 12 },
  metaSeparator: { color: '#60646C', fontSize: 12 },
  levelBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  levelBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});