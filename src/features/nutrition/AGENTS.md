# Nutrition Feature Module

This module owns the diet/nutrition MVP domain.

- Keep nutrition-specific components, hooks, queries, schemas, types, and utilities here.
- Supabase calls belong in `queries`, not React components.
- Zod schemas should stay close to the data boundary they validate.
- Preserve the MVP rules from `.ai/docs/diet.md` unless explicitly changed.
- Do not add barcode scanning, external product databases, meal categories, micronutrients, charts, AI food recognition, or offline sync here.
