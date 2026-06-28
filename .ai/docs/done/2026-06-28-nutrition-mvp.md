# 2026-06-28 Nutrition MVP

Implemented the initial nutrition MVP from `.ai/docs/diet.md`.

- Added Supabase migration and placeholder types for products, meal templates, daily food entries, daily food entry ingredient snapshots, and global daily nutrition targets.
- Added the `src/features/nutrition` domain with types, Zod schemas, query modules, TanStack Query hooks, calculation utilities, formatting utilities, and snapshot helpers.
- Added nutrition routes for the Daily Food Log, Product Library, and Meal Library.
- Added product create/edit/deactivate, meal template create/edit/deactivate, ingredient quantity editing, daily target editing, date navigation, add meal, add product, editable daily entries, and daily totals.
- Updated app navigation to switch between Workouts and Nutrition at the global level, with local sub-navigation inside each domain.
- Added focused Vitest coverage for nutrition calculations, snapshots, formatting, and schemas.
- Added `.ai/docs/schema.md` with the checked-in workout and nutrition schema summary.
