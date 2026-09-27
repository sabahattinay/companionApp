-- M2: interest tags and user profiles.

-- 1. Fixed interest list. Users pick from these; no free text, so "football"
--    always means the same thing when M4 counts shared interests.
create table public.interests (
  slug text primary key,
  label text not null,
  sort smallint not null unique
);

alter table public.interests enable row level security;

create policy "interests are readable by everyone"
  on public.interests for select
  to anon, authenticated
  using (true);

grant select on public.interests to anon, authenticated;

insert into public.interests (slug, label, sort)
select s.slug, s.label, s.sort
from unnest(
  array['books', 'music', 'football', 'basketball', 'running',
        'cycling', 'hiking', 'travel', 'photography', 'cinema',
        'series', 'gaming', 'cooking', 'coffee', 'art',
        'history', 'technology', 'startups', 'languages', 'podcasts'],
  array['Books', 'Music', 'Football', 'Basketball', 'Running',
        'Cycling', 'Hiking', 'Travel', 'Photography', 'Cinema',
        'TV series', 'Gaming', 'Cooking', 'Coffee', 'Art',
        'History', 'Technology', 'Startups', 'Languages', 'Podcasts']
) with ordinality as s(slug, label, sort);

-- 2. One profile per signed-in user. Nickname only (no surname, phone or socials),
--    age as a bucket (never a birthdate), adults only.
create table public.profiles (
  user_id uuid primary key default auth.uid() references auth.users (id) on delete cascade,
  nickname text not null check (char_length(btrim(nickname)) between 2 and 20),
  age_range text not null check (age_range in ('18-24', '25-34', '35-44', '45+')),
  bio text check (bio is null or char_length(bio) <= 160),
  interests text[] not null check (cardinality(interests) between 3 and 5),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Every interest must exist in public.interests and appear only once.
-- (A CHECK constraint cannot look at another table, so a trigger does it.)
create function public.validate_profile()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if exists (
    select 1 from unnest(new.interests) as t(slug)
    where not exists (select 1 from public.interests i where i.slug = t.slug)
  ) then
    raise exception 'Unknown interest in %', new.interests;
  end if;

  if (select count(distinct t.slug) from unnest(new.interests) as t(slug))
     <> cardinality(new.interests) then
    raise exception 'Duplicate interest in %', new.interests;
  end if;

  new.nickname := btrim(new.nickname);
  new.updated_at := now();
  return new;
end;
$$;

create trigger profiles_validate
  before insert or update on public.profiles
  for each row execute function public.validate_profile();

-- RLS: a user can read, create and change only their own profile.
-- (M5 adds: you can also read the profile of someone you are matched with.)
alter table public.profiles enable row level security;

create policy "read own profile"
  on public.profiles for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "create own profile"
  on public.profiles for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "update own profile"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

grant select, insert, update on public.profiles to authenticated;
