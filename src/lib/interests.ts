import { useEffect, useState } from 'react';

import { supabase } from '@/lib/supabase';

export type Interest = {
  slug: string;
  label: string;
};

/** The fixed interest list from the `interests` table, in display order. */
export function useInterests() {
  const [interests, setInterests] = useState<Interest[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from('interests')
      .select('slug, label')
      .order('sort')
      .returns<Interest[]>()
      .then(({ data, error }) => {
        if (error) setError(error.message);
        else setInterests(data ?? []);
      });
  }, []);

  return { interests, error };
}
