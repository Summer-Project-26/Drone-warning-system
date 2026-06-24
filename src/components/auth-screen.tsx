import { useState } from 'react';
import {
  Alert,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Spacing } from '@/constants/theme';
import { loginUser, resetPassword, signupUser } from '@/services/authService';

export function AuthScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loadingAction, setLoadingAction] = useState<'login' | 'signup' | 'reset' | null>(null);

  const runAction = async (
    action: 'login' | 'signup' | 'reset',
    callback: () => Promise<unknown>,
    successMessage: string,
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
        Alert.alert('Password reset sent', successMessage);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Something went wrong.';
      Alert.alert('Firebase auth error', message);
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.card}>
        <ThemedText type="subtitle" style={styles.title}>
          SkyAlert
        </ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.subtitle}>
          Sign in to access the tabs.
        </ThemedText>

        <TextInput
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          placeholder="Email"
          placeholderTextColor={Colors.light.textSecondary}
          value={email}
          onChangeText={setEmail}
          style={styles.input}
        />

        <TextInput
          autoCapitalize="none"
          autoComplete="password"
          placeholder="Password"
          placeholderTextColor={Colors.light.textSecondary}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          style={styles.input}
        />

        <Pressable
          onPress={() => runAction('login', () => loginUser(email.trim(), password), 'You can now access the app.')}
          style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
          disabled={loadingAction !== null}>
          <ThemedText type="smallBold" style={styles.buttonText}>
            {loadingAction === 'login' ? 'Signing in...' : 'Sign in'}
          </ThemedText>
        </Pressable>

        <Pressable
          onPress={() => runAction('signup', () => signupUser(email.trim(), password), 'Your account has been created.')}
          style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
          disabled={loadingAction !== null}>
          <ThemedText type="smallBold">Create account</ThemedText>
        </Pressable>

        <Pressable
          onPress={() => runAction('reset', () => resetPassword(email.trim()), 'Check your inbox for the reset email.')}
          style={({ pressed }) => [styles.linkButton, pressed && styles.pressed]}
          disabled={loadingAction !== null}>
          <ThemedText type="linkPrimary">
            {loadingAction === 'reset' ? 'Sending reset email...' : 'Forgot password?'}
          </ThemedText>
        </Pressable>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: Spacing.four,
  },
  card: {
    gap: Spacing.three,
    padding: Spacing.four,
    borderRadius: Spacing.five,
    backgroundColor: '#1C1D20',
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
  },
  title: {
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
  },
  input: {
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    backgroundColor: '#FFFFFF',
    color: '#000000',
  },
  primaryButton: {
    borderRadius: Spacing.three,
    paddingVertical: Spacing.three,
    alignItems: 'center',
    backgroundColor: '#3c87f7',
  },
  secondaryButton: {
    borderRadius: Spacing.three,
    paddingVertical: Spacing.three,
    alignItems: 'center',
    backgroundColor: '#F0F0F3',
  },
  linkButton: {
    alignItems: 'center',
    paddingVertical: Spacing.one,
  },
  buttonText: {
    color: '#ffffff',
  },
  pressed: {
    opacity: 0.75,
  },
});