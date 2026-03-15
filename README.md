# Productivity Tracker (Next.js + Supabase)

A full-stack responsive productivity app with:
- Email/password auth + forgot password
- Protected dashboard and feature routes
- Habits, Tasks, Nutrition, and Books tracking
- Dashboard analytics cards
- Light/dark mode blue-themed UI

## Tech stack
- Frontend: Next.js 14 (App Router), React, TypeScript
- Backend/Auth/DB: Supabase (Postgres + Auth + RLS)
- UX: loading skeletons, empty states, animation-ready cards, toasts, form validation

## 1) Environment setup
Create `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

## 2) Database setup (Supabase SQL editor)
Run `supabase/schema.sql` in Supabase SQL Editor.

## 3) Install and run

```bash
npm install
npm run dev
```

App runs at `http://localhost:3000`.

## 4) Auth behavior
- Signup: `/signup`
- Login: `/login`
- Forgot password: `/forgot-password`
- Protected routes under app shell (`/dashboard`, `/habits`, `/tasks`, `/nutrition`, `/books`)
- Session persists through Supabase client auth storage.

## 5) Daily reset / carry-forward strategy
- UI uses local timezone date keys for daily records.
- Daily rollover endpoint exists at `/api/daily-rollover`.
- For production automation, schedule a Supabase cron job that invokes a SQL function (example in `supabase/schema.sql`) to:
  - carry unfinished tasks forward,
  - create daily nutrition target snapshots if needed,
  - support history-safe daily analytics.

## 6) Deployment

### Option A: Vercel + Supabase (recommended)
1. Push repo to GitHub.
2. Import project in Vercel.
3. Add env vars:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy.

### Option B: Self-host Next.js
1. Build app:
   ```bash
   npm run build
   npm run start
   ```
2. Provide same environment variables on host.
3. Keep Supabase project as managed backend.

## Performance & scalability notes
- Modular pages and shared shell/components.
- Dashboard uses parallelized metric queries.
- RLS protects per-user data isolation.
- Feature pages fetch only needed rows and support incremental extension with server actions.
