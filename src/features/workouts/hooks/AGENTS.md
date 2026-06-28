# Workout Hooks

This directory contains workout-specific React hooks.

- Hooks may coordinate local state, browser storage, and feature workflows.
- Keep direct Supabase calls in `queries`.
- Active workout draft behavior belongs in `use-active-workout-draft.ts`.
- Preserve one active workout draft at a time.
