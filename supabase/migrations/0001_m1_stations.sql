-- M1: the 43 Marmaray stations in travel order, Halkalı (seq 1) → Gebze (seq 43).
--
-- min_from_start = estimated minutes from Halkalı. The full line takes 108 minutes
-- over 42 hops, so for now every hop counts as 108 / 42 ≈ 2.57 minutes:
--   min_from_start = round((seq - 1) * 108 / 42)
-- The matching rule (M4) uses it to compare two riders' times at the same station.
-- Replace with real timetable minutes later without changing anything else.

create table public.stations (
  id smallint generated always as identity primary key,
  line text not null,
  name text not null,
  seq smallint not null check (seq >= 1),
  min_from_start smallint not null check (min_from_start >= 0),
  unique (line, seq),
  unique (line, name)
);

-- RLS on. Station names are public: anyone may read them, nobody may change them from the app.
alter table public.stations enable row level security;

create policy "stations are readable by everyone"
  on public.stations for select
  to anon, authenticated
  using (true);

grant select on public.stations to anon, authenticated;

insert into public.stations (line, name, seq, min_from_start)
select 'Marmaray', s.name, s.seq, round((s.seq - 1) * 108.0 / 42)
from unnest(array[
  'Halkalı', 'Mustafa Kemal', 'Küçükçekmece', 'Florya', 'Florya Akvaryum',
  'Yeşilköy', 'Yeşilyurt', 'Ataköy', 'Bakırköy', 'Yenimahalle',
  'Zeytinburnu', 'Kazlıçeşme', 'Yenikapı', 'Sirkeci', 'Üsküdar',
  'Ayrılık Çeşmesi', 'Söğütlüçeşme', 'Feneryolu', 'Göztepe', 'Erenköy',
  'Suadiye', 'Bostancı', 'Küçükyalı', 'İdealtepe', 'Süreyya Plajı',
  'Maltepe', 'Cevizli', 'Atalar', 'Başak', 'Kartal',
  'Yunus', 'Pendik', 'Kaynarca', 'Tersane', 'Güzelyalı',
  'Aydıntepe', 'İçmeler', 'Tuzla', 'Çayırova', 'Fatih',
  'Osmangazi', 'Darıca', 'Gebze'
]) with ordinality as s(name, seq)
order by s.seq;
