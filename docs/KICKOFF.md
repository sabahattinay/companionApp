# CompanionApp — Project Plan

Marmaray passengers post a trip they are about to take and get matched with other passengers on the same stretch of track, at the same time, who share at least one interest. Social only — not dating, not ride-sharing.

## Stack (fixed)

- React Native + Expo (SDK 57), TypeScript, Expo Router (`src/app/`)
- Supabase: PostgreSQL + Auth + Realtime. No backend server. Logic that must not run on a phone is a Postgres function.
- Test with Expo Go. Ship an Android APK (EAS Build).

## Database (each table is created in its milestone, with RLS on at creation)

```sql
ping     (id, message)                                            -- M0 only
stations (id, line, name, seq, min_from_start)                    -- seq: Halkalı=1 … Gebze=43
profiles (user_id, nickname, age_range, bio, interests[])         -- interests from a fixed tag list
trips    (id, user_id, line, from_station_id, to_station_id, depart_at, window_min, status, expires_at)
matches  (id, trip_a_id, trip_b_id, score, a_waved, b_waved, is_mutual)  -- is_mutual = a_waved AND b_waved (generated)
messages (id, match_id, sender_id, body, sent_at)
reports  (id, reporter_id, reported_id, reason, created_at)
blocks   (blocker_id, blocked_id)
```

## Matching rule (Postgres function, runs automatically when a trip is saved)

Two trips A and B match when all hold:

1. Same line.
2. Same direction: `sign(a.to_seq - a.from_seq) = sign(b.to_seq - b.from_seq)`.
3. Overlap ≥ 1 hop: `least(a.hi, b.hi) - greatest(a.lo, b.lo) >= 1`, where `lo/hi` = min/max of from_seq, to_seq.
4. Same train, compared at the overlap's first station:
   ```
   overlap_start = the later of the two boarding stations, in travel direction
   a_time_there  = a.depart_at + |min_from_start(overlap_start) - min_from_start(a.from)|
   b_time_there  = b.depart_at + |min_from_start(overlap_start) - min_from_start(b.from)|
   |a_time_there - b_time_there| <= least(a.window_min, b.window_min)
   ```
5. At least 1 shared interest. `score` = number of shared interests.

Never match: a user with themselves; trips where `status <> 'active'` or `expires_at < now()`; users where either one blocked the other.

The function runs with elevated rights (SECURITY DEFINER), because under RLS a user cannot read other users' trips. Each pair is stored once.

## Rules decided at review

| Topic | Decision |
|---|---|
| Shared interest | Required (≥ 1) |
| Travel time per station | Equal estimate per hop now; real timetable later |
| Interests | Fixed list of 20 tags in the `interests` table; each user picks 3–5 |
| Trips | `from ≠ to`; one active trip per user; `expires_at = depart_at + window_min + travel time to to_station`; no cron job, queries skip expired rows |
| Before mutual wave | Show nickname, age range, interests, shared stretch only |
| Profiles RLS | Readable by the owner and by users they share a match with |
| Auth | Email + password; email confirmation off during development |
| Age | Buckets only, youngest bucket 18–24 |
| Push notifications | Not in v1; M8 after shipping (needs a development build, not Expo Go) |
| Later | KVKK privacy notice, account deletion, free Supabase project pauses after 7 idle days |

## Safety (from the start)

- Never show live location or carriage — only the posted trip.
- Nickname only. No surname, phone, or socials.
- Chat opens only after both users wave.
- Block + report on every profile and chat screen.
- RLS on every table from the milestone that creates it. A user reads only their own trips, matches and messages.

## Milestones

| M | Goal | Done when |
|---|---|---|
| M0 | Skeleton | App on the phone shows text fetched from Supabase |
| M1 | Stations | 43 Marmaray stations seeded in order, with `min_from_start` |
| M2 | Auth + profile | Sign up, set nickname + 3 interests, still logged in after restart |
| M3 | Post a trip | Posted trip appears as a row in Supabase |
| M4 | Matching | Function passes the test cases below |
| M5 | Match list + wave | Two accounts match, both wave, match becomes mutual |
| M6 | Chat | Message on phone A appears on phone B with no refresh |
| M7 | Safety + ship | RLS verified, block/report work, APK a friend can install |

M4 test cases:

| A | B | Expected |
|---|---|---|
| seq 1→20, 08:00, ±10 | seq 5→30, same train, ±10 | match |
| 1→20 | 30→10 | no match (opposite direction) |
| 1→5 | 5→9 | no match (0 hops shared) |
| 1→20, 08:00 | 5→30, train 25 min later | no match (outside window) |
| user X | user X | no match (self) |
| X blocked Y | Y's trip | no match (blocked) |

## How we work

1. Requirement → 2. Claude builds, commits, pushes, opens a PR → 3. Run it with Expo Go → 4. Check "Done when" → 5. Read the diff on GitHub and merge. After each milestone Claude explains what was built and why.
