# Supabase Migrations

This directory contains checked-in SQL migrations.

- Keep migrations explicit and reviewable.
- Mirror schema changes in `docs/schema.md` and `src/supabase/types.ts`.
- Preserve case-insensitive uniqueness rules and historical soft-deactivation behavior.
- Add constraints for domain invariants when practical.
