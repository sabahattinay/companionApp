# CompanionApp

Match Marmaray passengers on the same stretch of track who share an interest. Plan and milestones: [`docs/KICKOFF.md`](docs/KICKOFF.md).

## Run it

1. Install [Node.js](https://nodejs.org) (LTS) on your computer and the **Expo Go** app on your phone.
2. `npm install`
3. `npx expo start`, then scan the QR code with Expo Go (phone and computer on the same Wi-Fi, or run `npx expo start --tunnel`).

## Folders

| Path | What it holds |
|---|---|
| `src/app/` | Screens (Expo Router: each file is a screen) |
| `src/lib/` | Shared code, e.g. the Supabase client |
| `supabase/migrations/` | SQL to run in the Supabase SQL Editor, in number order |
| `docs/` | Project plan |
