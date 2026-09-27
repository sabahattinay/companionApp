import { Pressable, StyleSheet, Text } from 'react-native';

/** A small rounded toggle button, filled when selected. */
export function Chip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable style={[styles.chip, selected && styles.chipSelected]} onPress={onPress}>
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderWidth: 1,
    borderColor: '#208AEF',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  chipSelected: {
    backgroundColor: '#208AEF',
  },
  chipText: {
    color: '#208AEF',
  },
  chipTextSelected: {
    color: '#fff',
  },
});
