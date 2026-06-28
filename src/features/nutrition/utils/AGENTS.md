# Nutrition Utilities

This directory contains pure nutrition helpers.

- Keep utilities deterministic and free of React, TanStack Query, and Supabase dependencies.
- Put calorie/macro math, formatting, date helpers, and snapshot construction here.
- Cover calculation, formatting, and snapshot behavior with focused Vitest tests.
- Preserve basis-specific quantity semantics: grams for `per_100g`, milliliters for `per_100ml`, and counts for `per_unit`.
