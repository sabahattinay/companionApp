import { useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import type { Station } from '@/lib/stations';

type Props = {
  label: string;
  stations: Station[];
  value: number | null;
  onChange: (id: number) => void;
};

/** A field that opens the full station list and returns the chosen station id. */
export function StationPicker({ label, stations, value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const selected = stations.find((s) => s.id === value);

  return (
    <>
      <Pressable style={styles.field} onPress={() => setOpen(true)}>
        <Text style={styles.fieldLabel}>{label}</Text>
        <Text style={selected ? styles.fieldValue : styles.placeholder}>
          {selected ? selected.name : 'Choose a station'}
        </Text>
      </Pressable>

      <Modal visible={open} animationType="slide" onRequestClose={() => setOpen(false)}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>{label}</Text>
          <Pressable onPress={() => setOpen(false)}>
            <Text style={styles.close}>Close</Text>
          </Pressable>
        </View>
        <FlatList
          data={stations}
          keyExtractor={(s) => String(s.id)}
          renderItem={({ item }) => (
            <Pressable
              style={[styles.row, item.id === value && styles.rowSelected]}
              onPress={() => {
                onChange(item.id);
                setOpen(false);
              }}>
              <Text style={styles.seq}>{item.seq}</Text>
              <Text style={styles.name}>{item.name}</Text>
            </Pressable>
          )}
        />
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  field: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  fieldLabel: {
    color: '#888',
    fontSize: 12,
  },
  fieldValue: {
    fontSize: 16,
  },
  placeholder: {
    fontSize: 16,
    color: '#aaa',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 48,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ccc',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  close: {
    color: '#208AEF',
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee',
  },
  rowSelected: {
    backgroundColor: '#E6F4FE',
  },
  seq: {
    width: 32,
    color: '#888',
  },
  name: {
    fontSize: 16,
  },
});
