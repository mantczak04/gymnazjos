# Database Schema

The initial workout schema is represented by SQL migrations in `supabase/migrations`.

Tables:

- `exercises`
- `workout_templates`
- `workout_template_exercises`
- `workout_sessions`
- `workout_session_exercises`
- `workout_sets`

Generated Supabase types should replace the hand-maintained placeholder in `src/supabase/types.ts` once the project is connected to a Supabase instance.
