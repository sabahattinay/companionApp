import { useEffect, useState } from 'react';

import { supabase } from '@/lib/supabase';

export type Station = {
  id: number;
  name: string;
  seq: number;
  min_from_start: number;
};

/** All Marmaray stations in travel order, Halkalı (seq 1) → Gebze (seq 43). */
export function useStations() {
  const [stations, setStations] = useState<Station[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from('stations')
      .select('id, name, seq, min_from_start')
      .eq('line', 'Marmaray')
      .order('seq')
      .returns<Station[]>()
      .then(({ data, error }) => {
        if (error) setError(error.message);
        else setStations(data ?? []);
      });
  }, []);

  return { stations, error };
}
