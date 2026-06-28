# Shared Utilities

This directory contains app-wide utility functions.

- Keep utilities generic and free of product-specific state.
- Formatting helpers may encode app-wide display defaults such as kg, 24-hour time, and English labels.
- Do not import React or Supabase here unless a utility genuinely needs it.
