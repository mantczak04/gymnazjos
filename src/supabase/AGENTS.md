# Supabase Client

This directory contains frontend Supabase setup and generated type placeholders.

- `client.ts` should stay small and only create/configure the typed Supabase client.
- `types.ts` should be replaced by generated Supabase types once connected to a real project.
- Do not scatter Supabase client construction across feature modules.
- This app currently uses direct frontend Supabase access without Supabase Auth.
