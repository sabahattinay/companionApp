@AGENTS.md

# CompanionApp rules

- Read `docs/KICKOFF.md` before any work. Build only the milestone the user names; never start the next one until they confirm the current one works.
- Stack is fixed: Expo + TypeScript + Expo Router, Supabase. No backend server — server-side logic is a Postgres function.
- Every database change is a new numbered SQL file in `supabase/migrations/`. Every new table gets RLS enabled and its policies in the same file.
- `.env` is committed and holds only public values: the Supabase URL and the publishable key. Never commit a secret key (`sb_secret_…` or `service_role`); secrets go in `.env.local`, which is git-ignored.
- The user is learning to read code: after each milestone, explain in plain language what was built and why.
