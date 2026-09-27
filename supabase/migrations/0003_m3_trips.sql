-- M3: a rider posts the trip they are about to take.
--
-- The app sends only four values: from station, to station, departure time,
-- and a ± window in minutes. The database fills in the rest:
--   line       = the line of the two stations (they must be on the same line)
--   status     = 'active'
--   expires_at = depart_at + window_min + ride minutes
--   ride minutes = |to.min_from_start - from.min_from_start|
-- Example: Yenikapı (31 min) → Bostancı (54 min), depart 08:00, window ±10
--   expires_at = 08:00 + 10 + |54 - 31| = 08:33
-- After expires_at the trip is simply ignored; no scheduled job is needed.

create table public.trips (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references public.profiles (user_id) on delete cascade,
  line text not null,
  from_station_id smallint not null references public.stations (id),
  to_station_id smallint not null references public.stations (id),
  depart_at timestamptz not null,
  window_min smallint not null check (window_min between 0 and 60),
  status text not null default 'active' check (status in ('active', 'cancelled', 'expired')),
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  check (from_station_id <> to_station_id)
);

-- At most one active trip per rider.
create unique index trips_one_active_per_user on public.trips (user_id) where status = 'active';

-- Checks and calculated fields for a new trip.
create function public.trips_before_insert()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  from_station public.stations;
  to_station public.stations;
begin
  select * into from_station from public.stations where id = new.from_station_id;
  select * into to_station from public.stations where id = new.to_station_id;

  if from_station.line is distinct from to_station.line then
    raise exception 'From and to stations must be on the same line';
  end if;

  if new.depart_at < now() - interval '10 minutes' or new.depart_at > now() + interval '24 hours' then
    raise exception 'Departure must be between 10 minutes ago and 24 hours from now';
  end if;

  -- Close this rider's old active trips that have already expired.
  update public.trips
     set status = 'expired'
   where user_id = new.user_id and status = 'active' and expires_at <= now();

  if exists (select 1 from public.trips where user_id = new.user_id and status = 'active') then
    raise exception 'You already have an active trip. Cancel it before posting a new one.';
  end if;

  new.line := from_station.line;
  new.status := 'active';
  new.expires_at := new.depart_at
    + make_interval(mins => new.window_min + abs(to_station.min_from_start - from_station.min_from_start));
  new.created_at := now();
  return new;
end;
$$;

create trigger trips_before_insert
  before insert on public.trips
  for each row execute function public.trips_before_insert();

-- A trip can only be closed (active → cancelled or expired), never reopened.
create function public.trips_before_update()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if old.status <> 'active' or new.status not in ('cancelled', 'expired') then
    raise exception 'A trip can only change from active to cancelled or expired';
  end if;
  return new;
end;
$$;

create trigger trips_before_update
  before update on public.trips
  for each row execute function public.trips_before_update();

-- RLS: a rider sees and changes only their own trips.
alter table public.trips enable row level security;

create policy "read own trips"
  on public.trips for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "post own trips"
  on public.trips for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "close own trips"
  on public.trips for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- Column-level grants: the app may send only these four values on insert,
-- and may change only the status afterwards.
grant select on public.trips to authenticated;
grant insert (from_station_id, to_station_id, depart_at, window_min) on public.trips to authenticated;
grant update (status) on public.trips to authenticated;
