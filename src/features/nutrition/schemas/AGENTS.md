# Nutrition Schemas

This directory contains Zod schemas for nutrition forms and data boundaries.

- Keep validation close to the form or mutation boundary it protects.
- Enforce product basis rules, including `unitName` only for `per_unit` products.
- Require positive quantities for meal ingredients and daily food entry ingredients.
- Use schema-inferred types when practical, but keep persisted domain types in `types`.
- Do not add fields outside the diet MVP without updating `.ai/docs/diet.md` and migrations when needed.
