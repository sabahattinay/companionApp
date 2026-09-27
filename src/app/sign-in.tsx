import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { supabase } from '@/lib/supabase';

type Mode = 'sign-in' | 'sign-up';

export default function SignIn() {
  const [mode, setMode] = useState<Mode>('sign-in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function submit() {
    setMessage(null);
    if (!email.includes('@') || password.length < 6) {
      setMessage('Enter an email and a password of at least 6 characters.');
      return;
    }

    setBusy(true);
    const credentials = { email: email.trim(), password };
    const { data, error } =
      mode === 'sign-up'
        ? await supabase.auth.signUp(credentials)
        : await supabase.auth.signInWithPassword(credentials);
    setBusy(false);

    if (error) {
      setMessage(error.message);
    } else if (!data.session) {
      // Happens only if "Confirm email" is still on in the Supabase dashboard.
      setMessage('Account created. Confirm your email, then sign in.');
    }
    // On success the auth listener sees the new session and the layout
    // moves on to the profile screen by itself.
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{mode === 'sign-in' ? 'Welcome back' : 'Create an account'}</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password (min. 6 characters)"
        autoCapitalize="none"
        autoComplete={mode === 'sign-up' ? 'new-password' : 'current-password'}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {message && <Text style={styles.message}>{message}</Text>}

      <Pressable style={styles.button} onPress={submit} disabled={busy}>
        {busy ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>{mode === 'sign-in' ? 'Sign in' : 'Sign up'}</Text>
        )}
      </Pressable>

      <Pressable
        onPress={() => {
          setMode(mode === 'sign-in' ? 'sign-up' : 'sign-in');
          setMessage(null);
        }}>
        <Text style={styles.switch}>
          {mode === 'sign-in' ? 'No account yet? Sign up' : 'Already have an account? Sign in'}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    gap: 12,
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  message: {
    color: '#b00020',
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
  switch: {
    color: '#208AEF',
    textAlign: 'center',
    marginTop: 8,
  },
});
