import { supabase } from '@/lib/supabase';

export type ActiveTrip = {
  id: number;
  depart_at: string;
  window_min: number;
  expires_at: string;
  from_station: { name: string; seq: number };
  to_station: { name: string; seq: number };
};

/**
 * The signed-in rider's current trip, or null.
 * "Current" = status 'active' and not yet past expires_at (RLS already limits
 * the rows to the rider's own trips).
 */
export async function fetchActiveTrip(): Promise<{ trip: ActiveTrip | null; error: string | null }> {
  const { data, error } = await supabase
    .from('trips')
    .select(
      'id, depart_at, window_min, expires_at,' +
        ' from_station:stations!trips_from_station_id_fkey(name, seq),' +
        ' to_station:stations!trips_to_station_id_fkey(name, seq)',
    )
    .eq('status', 'active')
    .gt('expires_at', new Date().toISOString())
    .maybeSingle<ActiveTrip>();
  return { trip: data, error: error?.message ?? null };
}

export async function cancelTrip(id: number): Promise<string | null> {
  const { error } = await supabase.from('trips').update({ status: 'cancelled' }).eq('id', id);
  return error?.message ?? null;
}

/** "towards Gebze" when the rider moves up the line, "towards Halkalı" when down. */
export function directionLabel(fromSeq: number, toSeq: number): string {
  return toSeq > fromSeq ? 'towards Gebze' : 'towards Halkalı';
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/** Departure time as an ISO string, `leaveInMin` minutes from the moment this is called. */
export function departureFromNow(leaveInMin: number): string {
  return new Date(Date.now() + leaveInMin * 60_000).toISOString();
}
