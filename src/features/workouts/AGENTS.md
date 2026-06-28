# Workout Feature Module

This module owns the workout MVP domain.

- Keep workout-specific components, hooks, queries, schemas, types, and utilities here.
- Supabase calls belong in `queries`, not React components.
- Zod schemas should stay close to the data boundary they validate.
- Preserve the MVP rules from `.ai/docs/workout.md` unless explicitly changed.
- Do not add nutrition, dashboard, auth, RPE, rest timers, personal records, charts, or full offline sync here.
