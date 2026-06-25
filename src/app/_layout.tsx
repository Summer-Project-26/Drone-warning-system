import { DarkTheme, DefaultTheme, Redirect, Stack, ThemeProvider, useSegments } from 'expo-router';
import { useEffect, useState } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { ActivityIndicator, View, useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { AdminDashboard } from '@/components/admin-dashboard';
import AppTabs from '@/components/app-tabs';
import { auth } from '@/services/firebase';
import { cleanupExpiredAlerts } from '@/services/alertService';
import { subscribeUserProfile } from '@/services/userService';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const segments = useSegments();
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<'admin' | 'user' | null>(null);
  const [initializing, setInitializing] = useState(true);
  const authRoutes = new Set(['login', 'signup', 'reset-password', 'create-account']);
  const isAuthRoute = authRoutes.has(segments[0] ?? '');

  useEffect(() => {
    let unsubscribeProfile = () => {};

    const unsubscribe = onAuthStateChanged(auth, nextUser => {
      unsubscribeProfile();
      setUser(nextUser);

      if (!nextUser) {
        setRole(null);
        setInitializing(false);
        return;
      }

      setInitializing(true);
      cleanupExpiredAlerts().catch(() => undefined);
      unsubscribeProfile = subscribeUserProfile(nextUser.uid, (profile: { role: string; }) => {
        setRole(profile?.role === 'admin' ? 'admin' : 'user');
        setInitializing(false);
      });
    });

    return () => {
      unsubscribeProfile();
      unsubscribe();
    };
  }, []);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay />
      {initializing ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator />
        </View>
      ) : user && role === 'admin' ? (
        <AdminDashboard />
      ) : user ? (
        <AppTabs />
      ) : isAuthRoute ? (
        <Stack screenOptions={{ headerShown: false }} />
      ) : (
        <Redirect href="/login" />
      )}
    </ThemeProvider>
  );
}
