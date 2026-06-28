# Nutrition Query Layer

This directory owns Supabase access for the nutrition domain.

- Keep raw table names, snake_case fields, relation selects, and row mapping here.
- Export camelCase domain objects to the rest of the app.
- Preserve snapshot behavior for daily food entries so history does not change after product or meal edits.
- Keep insert/update/delete behavior aligned with `supabase/migrations`.
- Do not call these modules from server components unless the client-side Supabase strategy changes.
