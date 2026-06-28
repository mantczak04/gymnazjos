# Technical Notes

Gymnazjos is a private, mobile-first responsive web app for tracking gym progress and diet. The MVP focuses on workouts.

## Stack

- Next.js, React, TypeScript
- Tailwind CSS and local shadcn/ui-style components
- React Hook Form, Zod
- TanStack Query
- Supabase/PostgreSQL
- Vitest

## Access Gate

The MVP uses a simple client-side password gate configured with `NEXT_PUBLIC_APP_PASSWORD_HASH`.
This only blocks casual UI access. It is not database security.

## Data

Supabase is accessed directly from the frontend with public environment variables. SQL migrations live in `supabase/migrations`.

## Local Drafts

The active workout draft is stored in `localStorage` under `gym-tracker.active-workout-draft`.
It has no timeout and is cleared only when the workout is finished or discarded.
