# Nutrition Types

This directory contains nutrition domain types used by components, hooks, utilities, and query modules.

- Keep exported types in camelCase and aligned with UI/domain language.
- Keep Supabase row shapes and snake_case fields in `queries/query-utils.ts`.
- Represent product, meal template, daily food entry, snapshot ingredient, nutrition totals, and target concepts explicitly.
- Do not add database-only fields here unless the rest of the feature needs them.
