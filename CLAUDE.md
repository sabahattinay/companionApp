@AGENTS.md

# CompanionApp rules

- Read `docs/KICKOFF.md` before any work. Build only the milestone the user names; never start the next one until they confirm the current one works.
- Stack is fixed: Expo + TypeScript + Expo Router, Supabase. No backend server — server-side logic is a Postgres function.
- Every database change is a new numbered SQL file in `supabase/migrations/`. Every new table gets RLS enabled and its policies in the same file.
- Never commit `.env` or any key. `.env.example` lists the variables.
- The user is learning to read code: after each milestone, explain in plain language what was built and why.
