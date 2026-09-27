import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';

import { useStations } from '@/lib/stations';

export default function Stations() {
  const { stations, error } = useStations();

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>Supabase error: {error}</Text>
      </View>
    );
  }

  if (!stations) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <FlatList
      data={stations}
      keyExtractor={(station) => String(station.id)}
      ListHeaderComponent={<Text style={styles.header}>{stations.length} Marmaray stations</Text>}
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
