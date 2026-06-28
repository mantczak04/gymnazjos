# Nutrition Hooks

This directory contains client hooks for nutrition data access and local UI coordination.

- Wrap TanStack Query usage and export stable query keys when callers need invalidation.
- Call nutrition query modules rather than constructing Supabase clients here.
- Keep hooks small and specific to products, meals, daily logs, or targets.
- Do not introduce global state for nutrition unless a concrete cross-screen need appears.
