import { Stack } from 'expo-router';
import { ActivityIndicator, Button, StyleSheet, Text, View } from 'react-native';

import { AuthProvider, useAuth } from '@/lib/auth';

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootStack />
    </AuthProvider>
  );
}

// Which screens exist depends on the user's state:
//   not signed in                 → sign-in
//   signed in, no profile yet     → profile (setup)
//   signed in, profile saved      → home, stations, post a trip, profile (edit)
// If the current screen stops being allowed, Expo Router moves to the first allowed one.
function RootStack() {
  const { session, profile, loading, profileError, reloadProfile } = useAuth();

  if (profileError) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>Could not load your profile: {profileError}</Text>
        <Button title="Try again" onPress={reloadProfile} />
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  const signedIn = session !== null;
  const hasProfile = profile !== null;

  return (
    <Stack>
      <Stack.Protected guard={signedIn && hasProfile}>
        <Stack.Screen name="index" options={{ title: 'CompanionApp' }} />
        <Stack.Screen name="stations" options={{ title: 'Stations' }} />
        <Stack.Screen name="trip-new" options={{ title: 'Post a trip' }} />
      </Stack.Protected>
      <Stack.Protected guard={signedIn}>
        <Stack.Screen name="profile" options={{ title: hasProfile ? 'Edit profile' : 'Your profile' }} />
      </Stack.Protected>
      <Stack.Protected guard={!signedIn}>
        <Stack.Screen name="sign-in" options={{ title: 'Sign in' }} />
      </Stack.Protected>
    </Stack>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 24,
  },
  error: {
    fontSize: 16,
    color: '#b00020',
    textAlign: 'center',
  },
});
