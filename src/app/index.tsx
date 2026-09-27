import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useAuth } from '@/lib/auth';
import { useInterests } from '@/lib/interests';
import { supabase } from '@/lib/supabase';
import { cancelTrip, directionLabel, fetchActiveTrip, formatTime, type ActiveTrip } from '@/lib/trips';

type TripState = { kind: 'loading' } | { kind: 'error'; message: string } | { kind: 'ok'; trip: ActiveTrip | null };

export default function Home() {
  const { session, profile } = useAuth();
  const { interests } = useInterests();
  const [tripState, setTripState] = useState<TripState>({ kind: 'loading' });

  // Reload the active trip every time this screen comes back into view,
  // e.g. right after posting a trip.
  const loadTrip = useCallback(() => {
    fetchActiveTrip().then(({ trip, error }) =>
      setTripState(error ? { kind: 'error', message: error } : { kind: 'ok', trip }),
    );
  }, []);
  useFocusEffect(loadTrip);

  async function onCancel(id: number) {
    const error = await cancelTrip(id);
    if (error) setTripState({ kind: 'error', message: error });
    else loadTrip();
  }

  if (!profile) return null;

  const labels = profile.interests.map(
    (slug) => interests.find((interest) => interest.slug === slug)?.label ?? slug,
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Hi {profile.nickname} 👋</Text>
      <Text style={styles.detail}>Age range: {profile.age_range}</Text>
      <Text style={styles.detail}>Interests: {labels.join(', ')}</Text>
      {profile.bio && <Text style={styles.detail}>“{profile.bio}”</Text>}
      <Text style={styles.email}>Signed in as {session?.user.email}</Text>

      <Text style={styles.section}>Your trip</Text>
      {tripState.kind === 'loading' && <ActivityIndicator />}
      {tripState.kind === 'error' && <Text style={styles.error}>{tripState.message}</Text>}
      {tripState.kind === 'ok' && tripState.trip && (
        <View style={styles.card}>
          <Text style={styles.route}>
            {tripState.trip.from_station.name} → {tripState.trip.to_station.name}
          </Text>
          <Text style={styles.detail}>
            {directionLabel(tripState.trip.from_station.seq, tripState.trip.to_station.seq)}
          </Text>
          <Text style={styles.detail}>
            Leaving {formatTime(tripState.trip.depart_at)} (± {tripState.trip.window_min} min)
          </Text>
          <Text style={styles.muted}>Visible until {formatTime(tripState.trip.expires_at)}</Text>
          <Pressable style={[styles.button, styles.secondary]} onPress={() => onCancel(tripState.trip!.id)}>
            <Text style={[styles.buttonText, styles.secondaryText]}>Cancel trip</Text>
          </Pressable>
        </View>
      )}
      {tripState.kind === 'ok' && !tripState.trip && (
        <Pressable style={styles.button} onPress={() => router.push('/trip-new')}>
          <Text style={styles.buttonText}>Post a trip</Text>
        </Pressable>
      )}

      <Text style={styles.section}>Account</Text>
      <Pressable style={[styles.button, styles.secondary]} onPress={() => router.push('/profile')}>
        <Text style={[styles.buttonText, styles.secondaryText]}>Edit profile</Text>
      </Pressable>
      <Pressable style={[styles.button, styles.secondary]} onPress={() => router.push('/stations')}>
        <Text style={[styles.buttonText, styles.secondaryText]}>Stations</Text>
      </Pressable>
      <Pressable style={[styles.button, styles.secondary]} onPress={() => supabase.auth.signOut()}>
        <Text style={[styles.buttonText, styles.secondaryText]}>Sign out</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 8,
  },
  section: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  detail: {
    fontSize: 16,
  },
  muted: {
    color: '#888',
  },
  email: {
    color: '#888',
    marginTop: 8,
  },
  error: {
    color: '#b00020',
  },
  card: {
    gap: 4,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#E6F4FE',
  },
  route: {
    fontSize: 18,
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#208AEF',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 4,
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
