import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '@/services/firebase';

export default function ReportBugScreen() {
  const router = useRouter();
  const [description, setDescription] = useState('');
  const [email, setEmail] = useState(auth.currentUser?.email ?? '');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    if (!description.trim()) {
      Alert.alert('Missing info', 'Please describe the bug');
      return;
    }
    setSubmitting(true);
    try {
      await addDoc(collection(db, 'bugReports'), {
        description: description.trim(),
        email: email.trim(),
        userId: auth.currentUser?.uid ?? 'anonymous',
        createdAt: serverTimestamp(),
      });
      Alert.alert('Thank you', 'Your bug report has been submitted');
      router.back();
    } catch (e) {
      Alert.alert('Error', 'Could not submit bug report');
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </Pressable>
        <Text style={styles.title}>Report a Bug</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.body}>Found something not working? Let us know.</Text>

        <View style={styles.card}>
          <Text style={styles.label}>Describe the bug</Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="What happened? What did you expect?"
            placeholderTextColor="#60646C"
            multiline
            numberOfLines={6}
            style={[styles.input, { minHeight: 120, textAlignVertical: 'top' }]}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Email (optional)</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            placeholderTextColor="#60646C"
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
          />
        </View>

        <Pressable
          onPress={handleSubmit}
          disabled={submitting}
          style={({ pressed }) => [styles.submitBtn, pressed && { opacity: 0.7 }]}>
          <Text style={styles.submitText}>{submitting ? 'Submitting…' : 'Submit Report'}</Text>
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
  body: { color: '#B0B4BA', fontSize: 14, lineHeight: 20, marginBottom: 8 },
  card: { backgroundColor: '#1F2023', padding: 14, borderRadius: 12, borderWidth: 1, borderColor: '#2E3135' },
  label: { color: '#B0B4BA', fontSize: 12, marginBottom: 6 },
  input: { color: '#fff', fontSize: 14 },
  submitBtn: { backgroundColor: '#3B82F6', paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  submitText: { color: '#fff', fontSize: 15, fontWeight: '600' },
});