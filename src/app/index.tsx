import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { supabase } from '@/lib/supabase';

type Ping = {
  id: number;
  message: string;
};

type State =
  | { kind: 'loading' }
  | { kind: 'error'; message: string }
  | { kind: 'empty' }
  | { kind: 'ok'; message: string };

export default function Home() {
  const [state, setState] = useState<State>({ kind: 'loading' });

  useEffect(() => {
    async function loadPing() {
      const { data, error } = await supabase
        .from('ping')
        .select('id, message')
        .order('id')
        .returns<Ping[]>();

      if (error) {
        setState({ kind: 'error', message: error.message });
      } else if (!data || data.length === 0) {
        setState({ kind: 'empty' });
      } else {
        setState({ kind: 'ok', message: data[0].message });
      }
    }

    loadPing();
  }, []);

  return (
    <View style={styles.container}>
      {state.kind === 'loading' && <ActivityIndicator />}
      {state.kind === 'ok' && <Text style={styles.message}>{state.message}</Text>}
      {state.kind === 'empty' && (
        <Text style={styles.hint}>Connected, but the ping table has no rows.</Text>
      )}
      {state.kind === 'error' && (
        <Text style={styles.error}>Supabase error: {state.message}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  message: {
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
  },
  hint: {
    fontSize: 16,
    textAlign: 'center',
  },
  error: {
    fontSize: 16,
    color: '#b00020',
    textAlign: 'center',
  },
});
