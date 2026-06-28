# 2026-06-28 Workout MVP Scaffold

Implemented the initial Gymnazjos workout MVP scaffold.

- Added Next.js, React, TypeScript, Tailwind, local shadcn-style UI primitives, TanStack Query, React Hook Form, Zod, Supabase, and Vitest setup.
- Added a mobile-first app shell with bottom navigation, provider setup, and a simple 14-day client-side password gate.
- Added Supabase SQL migration and placeholder generated types for exercises, templates, sessions, session exercises, and sets.
- Implemented workout routes for start workout, active workout, exercise library, workout templates, workout history, and saved session details/editing.
- Added active workout draft persistence in `localStorage` with Zod validation and autosave behavior.
- Added workout query modules, schemas, hooks, type definitions, volume helpers, set-ordering helpers, and focused Vitest tests.
- Verified with `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm build`.

Dev server was started on `http://localhost:3000` with temporary password `dev`. Supabase env vars still need to be configured before live data works.
