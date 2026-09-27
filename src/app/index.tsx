import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';

import { supabase } from '@/lib/supabase';

type Station = {
  id: number;
  name: string;
  seq: number;
  min_from_start: number;
};

type State =
  | { kind: 'loading' }
  | { kind: 'error'; message: string }
  | { kind: 'ok'; stations: Station[] };

export default function Home() {
  const [state, setState] = useState<State>({ kind: 'loading' });

  useEffect(() => {
    async function loadStations() {
      const { data, error } = await supabase
        .from('stations')
        .select('id, name, seq, min_from_start')
        .eq('line', 'Marmaray')
        .order('seq')
        .returns<Station[]>();

      if (error) {
        setState({ kind: 'error', message: error.message });
      } else {
        setState({ kind: 'ok', stations: data ?? [] });
      }
    }

    loadStations();
  }, []);

  if (state.kind === 'loading') {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  if (state.kind === 'error') {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>Supabase error: {state.message}</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={state.stations}
      keyExtractor={(station) => String(station.id)}
      ListHeaderComponent={
        <Text style={styles.header}>{state.stations.length} Marmaray stations</Text>
      }
      renderItem={({ item }) => (
        <View style={styles.row}>
          <Text style={styles.seq}>{item.seq}</Text>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.minutes}>{item.min_from_start} min</Text>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  error: {
    fontSize: 16,
    color: '#b00020',
    textAlign: 'center',
  },
  header: {
    fontSize: 18,
    fontWeight: '600',
    padding: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ccc',
  },
  seq: {
    width: 32,
    color: '#888',
  },
  name: {
    flex: 1,
    fontSize: 16,
  },
  minutes: {
    color: '#888',
  },
});
