-- M0: a one-row table that proves the app can read from Supabase.
create table public.ping (
  id bigint generated always as identity primary key,
  message text not null
);

-- RLS on from day one. Anyone with the app's key may read ping, nobody may write it.
alter table public.ping enable row level security;

create policy "ping is readable by everyone"
  on public.ping for select
  to anon, authenticated
  using (true);

grant select on public.ping to anon, authenticated;

insert into public.ping (message) values ('Hello from Supabase 👋');
