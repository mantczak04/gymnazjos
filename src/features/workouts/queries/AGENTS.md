# Workout Query Layer

This directory owns Supabase access for the workout domain.

- Keep raw table names, snake_case fields, and relation mapping here.
- Export camelCase domain objects to the rest of the app.
- Throw clear errors when Supabase returns errors or unexpected missing records.
- Keep insert/update/delete behavior aligned with `supabase/migrations`.
- Do not call these modules from server components unless the client-side Supabase strategy changes.
