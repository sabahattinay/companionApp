import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { AGE_RANGES, useAuth, type AgeRange } from '@/lib/auth';
import { useInterests } from '@/lib/interests';
import { supabase } from '@/lib/supabase';

const MIN_INTERESTS = 3;
const MAX_INTERESTS = 5;

export default function ProfileScreen() {
  const { session, profile, reloadProfile } = useAuth();
  const { interests, error: interestsError } = useInterests();

  // Start from the saved profile when editing, empty when setting up.
  const [nickname, setNickname] = useState(profile?.nickname ?? '');
  const [ageRange, setAgeRange] = useState<AgeRange | null>(profile?.age_range ?? null);
  const [bio, setBio] = useState(profile?.bio ?? '');
  const [picked, setPicked] = useState<string[]>(profile?.interests ?? []);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  function toggleInterest(slug: string) {
    if (picked.includes(slug)) {
      setPicked(picked.filter((s) => s !== slug));
    } else if (picked.length < MAX_INTERESTS) {
      setPicked([...picked, slug]);
    }
  }

  async function save() {
    setMessage(null);
    const name = nickname.trim();
    if (name.length < 2 || name.length > 20) return setMessage('Nickname must be 2–20 characters.');
    if (!ageRange) return setMessage('Pick your age range.');
    if (picked.length < MIN_INTERESTS) return setMessage(`Pick at least ${MIN_INTERESTS} interests.`);
    if (!session) return;

    setBusy(true);
    const { error } = await supabase.from('profiles').upsert({
      user_id: session.user.id,
      nickname: name,
      age_range: ageRange,
      bio: bio.trim() === '' ? null : bio.trim(),
      interests: picked,
    });
    if (error) {
      setBusy(false);
      return setMessage(error.message);
    }

    await reloadProfile();
    setBusy(false);
    router.replace('/');
  }

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.label}>Nickname</Text>
      <Text style={styles.hint}>Shown to other riders. No surname, phone number or social handles.</Text>
      <TextInput style={styles.input} value={nickname} onChangeText={setNickname} maxLength={20} placeholder="e.g. Deniz" />

      <Text style={styles.label}>Age range</Text>
      <View style={styles.chips}>
        {AGE_RANGES.map((range) => (
          <Chip key={range} label={range} selected={ageRange === range} onPress={() => setAgeRange(range)} />
        ))}
      </View>

      <Text style={styles.label}>
        Interests ({picked.length}/{MAX_INTERESTS}, at least {MIN_INTERESTS})
      </Text>
      {interestsError && <Text style={styles.message}>Could not load interests: {interestsError}</Text>}
      <View style={styles.chips}>
        {interests.map((interest) => (
          <Chip
            key={interest.slug}
            label={interest.label}
            selected={picked.includes(interest.slug)}
            onPress={() => toggleInterest(interest.slug)}
          />
        ))}
      </View>

      <Text style={styles.label}>Bio (optional)</Text>
      <TextInput
        style={[styles.input, styles.bio]}
        value={bio}
        onChangeText={setBio}
        maxLength={160}
        multiline
        placeholder="One line about you"
      />

      {message && <Text style={styles.message}>{message}</Text>}

      <Pressable style={styles.button} onPress={save} disabled={busy}>
        {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Save profile</Text>}
      </Pressable>
    </ScrollView>
  );
}

function Chip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable style={[styles.chip, selected && styles.chipSelected]} onPress={onPress}>
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
    padding: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
  },
  hint: {
    color: '#888',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  bio: {
    minHeight: 64,
    textAlignVertical: 'top',
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
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
  message: {
    color: '#b00020',
    marginTop: 8,
  },
  button: {
    backgroundColor: '#208AEF',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
