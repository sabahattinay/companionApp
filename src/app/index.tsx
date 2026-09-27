import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAuth } from '@/lib/auth';
import { useInterests } from '@/lib/interests';
import { supabase } from '@/lib/supabase';

export default function Home() {
  const { session, profile } = useAuth();
  const { interests } = useInterests();

  if (!profile) return null;

  const labels = profile.interests.map(
    (slug) => interests.find((interest) => interest.slug === slug)?.label ?? slug,
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hi {profile.nickname} 👋</Text>
      <Text style={styles.detail}>Age range: {profile.age_range}</Text>
      <Text style={styles.detail}>Interests: {labels.join(', ')}</Text>
      {profile.bio && <Text style={styles.detail}>“{profile.bio}”</Text>}
      <Text style={styles.email}>Signed in as {session?.user.email}</Text>

      <Pressable style={styles.button} onPress={() => router.push('/profile')}>
        <Text style={styles.buttonText}>Edit profile</Text>
      </Pressable>
      <Pressable style={styles.button} onPress={() => router.push('/stations')}>
        <Text style={styles.buttonText}>Stations</Text>
      </Pressable>
      <Pressable style={[styles.button, styles.secondary]} onPress={() => supabase.auth.signOut()}>
        <Text style={[styles.buttonText, styles.secondaryText]}>Sign out</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 8,
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 8,
  },
  detail: {
    fontSize: 16,
  },
  email: {
    color: '#888',
    marginTop: 8,
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#208AEF',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#208AEF',
  },
  secondaryText: {
    color: '#208AEF',
  },
});
