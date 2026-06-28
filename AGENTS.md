# Agent Instructions

This is a private, mobile-first gym progress and diet tracker. The current MVP is the workout module.

## Stack

- Next.js, React, TypeScript
- Tailwind CSS and local shadcn/ui-style components
- React Hook Form and Zod
- TanStack Query
- Supabase/PostgreSQL
- Vitest

## Commands

- `pnpm dev`
- `pnpm build`
- `pnpm typecheck`
- `pnpm lint`
- `pnpm test`
- `pnpm format`

## Instruction Discovery

- Always read this root `AGENTS.md` before changing code.
- Before working in a directory, check for every `AGENTS.md` from the repository root down to that directory.
- Apply all relevant `AGENTS.md` files, with deeper files taking precedence over broader files when they are more specific.
- When a change touches multiple directories, read and follow the `AGENTS.md` files for each touched subtree.
- If two instruction files conflict and the conflict cannot be resolved by specificity, ask the user before changing code.
- Keep newly added or changed code consistent with the most local `AGENTS.md` file.

## Conventions

- Keep domain code inside `src/features/<domain>`.
- Keep workout-specific code in `src/features/workouts`.
- Keep Supabase calls out of React components; use feature query modules.
- Use Zod schemas at data and form boundaries.
- Prefer small components, hooks, and utilities.
- Do not add global state unless a real need appears.
- Do not treat the password gate as real database security.
- Update docs and SQL migrations when changing product behavior or schema.

## Current Product Decisions

- The workout MVP starts sessions from templates only.
- There is exactly one active local workout draft.
- Active workout drafts are stored in `localStorage`.
- Discarded drafts never write to Supabase.
- Completed workouts require at least one valid set and a 1-5 post-workout feeling rating.
- Exercise and active template names are unique case-insensitively.
- Exercise/template deactivation is preferred over hard deletion after historical use.

## More information
Comprehensive documentation about general, modules and technical information about project can be found in `.ai/docs`:
- `tech.md` is general technical information about product.
- `workout.md` is general information about how workout section should look like.
- `diet.md` is general information about how diet section should look like.
- `.ai/docs/done` have files that describe what is already implemented in the application.
