import { useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Spacing } from '@/constants/theme';
import { loginUser, resetPassword, signupUser } from '@/services/authService';

type AuthMode = 'login' | 'signup' | 'reset';

type AuthScreenProps = {
  mode?: AuthMode;
};

const authCopy = {
  login: {
    eyebrow: 'Sign in',
    title: 'Welcome back to SkyAlert',
    subtitle: 'Use your account to review alerts, manage reports, and reach the admin dashboard.',
    primary: 'Sign in',
    secondary: 'Create account',
    alternate: 'Forgot password?',
    alternateHref: '/reset-password',
    chips: ['Real-time alerts', 'Admin dashboard', 'Secure access'],
  },
  signup: {
    eyebrow: 'Create account',
    title: 'Set up your SkyAlert access',
    subtitle: 'Create an account to receive alerts, report drone activity, and track status from anywhere.',
    primary: 'Create account',
    secondary: 'Back to sign in',
    alternate: 'Need help with a password reset?',
    alternateHref: '/reset-password',
    chips: ['Role-based access', '24h alert TTL', 'Mobile-ready'],
  },
  reset: {
    eyebrow: 'Password reset',
    title: 'Recover your account',
    subtitle: 'Enter your email and we will send a reset link so you can get back in quickly.',
    primary: 'Send reset link',
    secondary: 'Back to sign in',
    alternate: 'Create a new account instead',
    alternateHref: '/signup',
    chips: ['Email link', 'No password needed', 'Fast recovery'],
  },
} as const;

export function AuthScreen({ mode = 'login' }: AuthScreenProps) {
  const router = useRouter();
  const copy = authCopy[mode];
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loadingAction, setLoadingAction] = useState<'login' | 'signup' | 'reset' | null>(null);

  const isPasswordRequired = mode !== 'reset';

  const primaryStateLabel = useMemo(() => {
    if (loadingAction === 'login') {
      return 'Signing in...';
    }

    if (loadingAction === 'signup') {
      return 'Creating account...';
    }

    if (loadingAction === 'reset') {
      return 'Sending reset email...';
    }

    return copy.primary;
  }, [copy.primary, loadingAction]);

  const runAction = async (
    action: 'login' | 'signup' | 'reset',
    callback: () => Promise<unknown>,
  ) => {
    if (!email.trim()) {
      Alert.alert('Email required', 'Enter an email address first.');
      return;
    }

    if (action !== 'reset' && !password.trim()) {
      Alert.alert('Password required', 'Enter a password first.');
      return;
    }

    try {
      setLoadingAction(action);
      await callback();
      if (action === 'reset') {
        Alert.alert('Password reset sent', 'Check your inbox for the reset email.');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Something went wrong.';
      Alert.alert('Firebase auth error', message);
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <ThemedView style={styles.page}>
      <View style={styles.topGlow} />
      <View style={styles.bottomGlow} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}>
          <View style={styles.shell}>
            <View style={styles.heroCard}>
              <View style={styles.brandRow}>
                <View style={styles.brandBadge}>
                  <ThemedText type="smallBold" style={styles.brandBadgeText}>
                    SA
                  </ThemedText>
                </View>
                <View>
                  <ThemedText type="smallBold" style={styles.brandName}>
                    SkyAlert
                  </ThemedText>
                  <ThemedText themeColor="textSecondary" type="small">
                    Drone warning and response platform
                  </ThemedText>
                </View>
              </View>

              <ThemedText type="subtitle" style={styles.heroTitle}>
                {copy.title}
              </ThemedText>
              <ThemedText themeColor="textSecondary" style={styles.heroSubtitle}>
                {copy.subtitle}
              </ThemedText>

              <View style={styles.chipRow}>
                {copy.chips.map(chip => (
                  <View key={chip} style={styles.chip}>
                    <ThemedText type="smallBold" style={styles.chipText}>
                      {chip}
                    </ThemedText>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.card}>
              <ThemedText type="smallBold" themeColor="textSecondary" style={styles.eyebrow}>
                {copy.eyebrow}
              </ThemedText>

              <View style={styles.fieldGroup}>
                <ThemedText type="smallBold">Email</ThemedText>
                <TextInput
                  autoCapitalize="none"
                  autoComplete="email"
                  keyboardType="email-address"
                  placeholder="name@company.com"
                  placeholderTextColor={Colors.light.textSecondary}
                  value={email}
                  onChangeText={setEmail}
                  style={styles.input}
                />
              </View>

              {isPasswordRequired ? (
                <View style={styles.fieldGroup}>
                  <View style={styles.fieldHeaderRow}>
                    <ThemedText type="smallBold">Password</ThemedText>
                    {mode === 'signup' ? (
                      <ThemedText themeColor="textSecondary" type="small">
                        8+ characters recommended
                      </ThemedText>
                    ) : null}
                  </View>
                  <TextInput
                    autoCapitalize="none"
                    autoComplete="password"
                    placeholder="••••••••"
                    placeholderTextColor={Colors.light.textSecondary}
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                    style={styles.input}
                  />
                </View>
              ) : (
                <View style={styles.noticeBox}>
                  <ThemedText type="smallBold">No password needed</ThemedText>
                  <ThemedText themeColor="textSecondary" type="small">
                    We&apos;ll send a secure reset link to this email address.
                  </ThemedText>
                </View>
              )}

              <Pressable
                onPress={() => {
                  if (mode === 'login') {
                    void runAction('login', () => loginUser(email.trim(), password));
                    return;
                  }

                  if (mode === 'signup') {
                    void runAction('signup', () => signupUser(email.trim(), password));
                    return;
                  }

                  void runAction('reset', () => resetPassword(email.trim()));
                }}
                style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
                disabled={loadingAction !== null}>
                <ThemedText type="smallBold" style={styles.primaryButtonText}>
                  {primaryStateLabel}
                </ThemedText>
              </Pressable>

              <View style={styles.footerRow}>
                <Pressable
                  onPress={() => router.replace(copy.secondary === 'Back to sign in' ? '/login' : '/signup')}
                  disabled={loadingAction !== null}>
                  <ThemedText type="linkPrimary">{copy.secondary}</ThemedText>
                </Pressable>

                {mode !== 'reset' ? (
                  <Pressable
                    onPress={() => router.push(copy.alternateHref)}
                    disabled={loadingAction !== null}>
                    <ThemedText type="linkPrimary">{copy.alternate}</ThemedText>
                  </Pressable>
                ) : null}
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    overflow: 'hidden',
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.five,
  },
  shell: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: 560,
    gap: Spacing.four,
  },
  topGlow: {
    position: 'absolute',
    top: -120,
    right: -90,
    width: 260,
    height: 260,
    borderRadius: 260,
    backgroundColor: 'rgba(60, 135, 247, 0.18)',
  },
  bottomGlow: {
    position: 'absolute',
    bottom: -150,
    left: -100,
    width: 280,
    height: 280,
    borderRadius: 280,
    backgroundColor: 'rgba(239, 68, 68, 0.10)',
  },
  heroCard: {
    gap: Spacing.three,
    padding: Spacing.four,
    borderRadius: Spacing.five,
    backgroundColor: 'rgba(60, 135, 247, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(60, 135, 247, 0.18)',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  brandBadge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3c87f7',
  },
  brandBadgeText: {
    color: '#ffffff',
  },
  brandName: {
    fontSize: 18,
    lineHeight: 22,
  },
  heroTitle: {
    marginTop: Spacing.one,
  },
  heroSubtitle: {
    lineHeight: 22,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  chip: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
  },
  chipText: {
    color: '#1C1D20',
  },
  card: {
    gap: Spacing.three,
    padding: Spacing.four,
    borderRadius: Spacing.five,
    backgroundColor: '#1C1D20',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    shadowColor: '#000000',
    shadowOpacity: 0.22,
    shadowOffset: { width: 0, height: 12 },
    shadowRadius: 24,
    elevation: 8,
  },
  eyebrow: {
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  fieldGroup: {
    gap: Spacing.one,
  },
  fieldHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.two,
  },
  input: {
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    backgroundColor: '#FFFFFF',
    color: '#000000',
    minHeight: 52,
  },
  noticeBox: {
    gap: Spacing.one,
    padding: Spacing.three,
    borderRadius: Spacing.three,
    backgroundColor: '#2A2D33',
  },
  primaryButton: {
    borderRadius: Spacing.three,
    paddingVertical: Spacing.three,
    alignItems: 'center',
    backgroundColor: '#3c87f7',
    minHeight: 52,
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#ffffff',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.two,
  },
  pressed: {
    opacity: 0.75,
  },
});