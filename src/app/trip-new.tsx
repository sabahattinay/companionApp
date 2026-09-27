import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Chip } from '@/components/chip';
import { StationPicker } from '@/components/station-picker';
import { useStations } from '@/lib/stations';
import { supabase } from '@/lib/supabase';
import { departureFromNow, directionLabel } from '@/lib/trips';

// "Leaving in X minutes" choices, and the ± flexibility window.
const LEAVE_IN_MIN = [0, 5, 10, 15, 20, 30, 45, 60];
const WINDOW_MIN = [5, 10, 15, 30];

export default function NewTrip() {
  const { stations, error: stationsError } = useStations();
  const [fromId, setFromId] = useState<number | null>(null);
  const [toId, setToId] = useState<number | null>(null);
  const [leaveIn, setLeaveIn] = useState(10);
  const [windowMin, setWindowMin] = useState(10);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  if (stationsError) return <Text style={[styles.message, styles.pad]}>Could not load stations: {stationsError}</Text>;
  if (!stations) return <ActivityIndicator style={styles.pad} />;

  const from = stations.find((s) => s.id === fromId);
  const to = stations.find((s) => s.id === toId);
  const rideMin = from && to ? Math.abs(to.min_from_start - from.min_from_start) : null;

  async function post() {
    setMessage(null);
    if (!from || !to) return setMessage('Choose both stations.');
    if (from.id === to.id) return setMessage('From and to must be different stations.');

    setBusy(true);
    // The departure time is taken at the moment of posting.
    const departAt = departureFromNow(leaveIn);
    const { error } = await supabase.from('trips').insert({
      from_station_id: from.id,
      to_station_id: to.id,
      depart_at: departAt,
      window_min: windowMin,
    });
    setBusy(false);

    if (error) return setMessage(error.message);
    router.back();
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <StationPicker label="From" stations={stations} value={fromId} onChange={setFromId} />
      <StationPicker label="To" stations={stations} value={toId} onChange={setToId} />

      {from && to && from.id !== to.id && (
        <Text style={styles.hint}>
          {directionLabel(from.seq, to.seq)} · {Math.abs(to.seq - from.seq)} stops · ride ≈ {rideMin} min
        </Text>
      )}

      <Text style={styles.label}>Leaving</Text>
      <View style={styles.chips}>
        {LEAVE_IN_MIN.map((m) => (
          <Chip key={m} label={m === 0 ? 'Now' : `in ${m} min`} selected={leaveIn === m} onPress={() => setLeaveIn(m)} />
        ))}
      </View>

      <Text style={styles.label}>Flexible by</Text>
      <View style={styles.chips}>
        {WINDOW_MIN.map((m) => (
          <Chip key={m} label={`± ${m} min`} selected={windowMin === m} onPress={() => setWindowMin(m)} />
        ))}
      </View>

      {message && <Text style={styles.message}>{message}</Text>}

      <Pressable style={styles.button} onPress={post} disabled={busy}>
        {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Post trip</Text>}
      </Pressable>
    </ScrollView>
  );
}


const styles = StyleSheet.create({
  container: {
    gap: 12,
    padding: 24,
  },
  pad: {
    padding: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
  },
  hint: {
    color: '#555',
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  message: {
    color: '#b00020',
  },
  button: {
    backgroundColor: '#208AEF',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
