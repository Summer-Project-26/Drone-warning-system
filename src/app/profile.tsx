import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { updateProfile } from 'firebase/auth';
import { auth } from '@/services/firebase';

export default function ProfileScreen() {
  const router = useRouter();
  const user = auth.currentUser;
  const [displayName, setDisplayName] = useState(user?.displayName ?? '');
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!user) return;
    setSaving(true);
    try {
      await updateProfile(user, { displayName });
      Alert.alert('Saved', 'Your profile has been updated');
    } catch (e) {
      Alert.alert('Error', 'Could not save profile');
      console.error(e);
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </Pressable>
        <Text style={styles.title}>Profile</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>{user?.email ?? 'Not signed in'}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Display name</Text>
          <TextInput
            value={displayName}
            onChangeText={setDisplayName}
            placeholder="Your name"
            placeholderTextColor="#60646C"
            style={styles.input}
          />
        </View>

        <Pressable
          onPress={handleSave}
          disabled={saving}
          style={({ pressed }) => [styles.saveBtn, pressed && { opacity: 0.7 }]}>
          <Text style={styles.saveText}>{saving ? 'Saving…' : 'Save changes'}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#000' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16 },
  title: { color: '#fff', fontSize: 22, fontWeight: '700' },
  content: { padding: 16, gap: 12 },
  card: { backgroundColor: '#1F2023', padding: 14, borderRadius: 12, borderWidth: 1, borderColor: '#2E3135' },
  label: { color: '#B0B4BA', fontSize: 12, marginBottom: 4 },
  value: { color: '#fff', fontSize: 15 },
  input: { color: '#fff', fontSize: 15, borderBottomWidth: 1, borderBottomColor: '#2E3135', paddingVertical: 6 },
  saveBtn: { backgroundColor: '#3B82F6', paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  saveText: { color: '#fff', fontSize: 15, fontWeight: '600' },
});