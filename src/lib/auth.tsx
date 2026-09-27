import type { Session } from '@supabase/supabase-js';
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';

import { supabase } from '@/lib/supabase';

export const AGE_RANGES = ['18-24', '25-34', '35-44', '45+'] as const;
export type AgeRange = (typeof AGE_RANGES)[number];

export type Profile = {
  user_id: string;
  nickname: string;
  age_range: AgeRange;
  bio: string | null;
  interests: string[];
};

type AuthState = {
  session: Session | null;
  profile: Profile | null;
  /** True until we know who is signed in and whether they have a profile. */
  loading: boolean;
  profileError: string | null;
  reloadProfile: () => Promise<void>;
};

// The result of the last profile fetch, tagged with the user it belongs to,
// so a result for a previous user is never shown for the current one.
type ProfileResult = { userId: string; profile: Profile | null; error: string | null };

async function fetchProfile(userId: string): Promise<ProfileResult> {
  const { data, error } = await supabase
    .from('profiles')
    .select('user_id, nickname, age_range, bio, interests')
    .eq('user_id', userId)
    .maybeSingle<Profile>();
  return { userId, profile: data, error: error?.message ?? null };
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [sessionLoaded, setSessionLoaded] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [result, setResult] = useState<ProfileResult | null>(null);

  // 1. Read the saved session from the phone, then keep listening for sign in / sign out.
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setSessionLoaded(true);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  const userId = session?.user.id ?? null;

  // 2. Whenever the signed-in user changes, fetch their profile row (if any).
  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    fetchProfile(userId).then((r) => {
      if (!cancelled) setResult(r);
    });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const reloadProfile = useCallback(async () => {
    if (userId) setResult(await fetchProfile(userId));
  }, [userId]);

  const current = result !== null && result.userId === userId ? result : null;
  const loading = !sessionLoaded || (userId !== null && current === null);

  return (
    <AuthContext.Provider
      value={{
        session,
        profile: current?.profile ?? null,
        loading,
        profileError: current?.error ?? null,
        reloadProfile,
      }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside <AuthProvider>');
  return value;
}
