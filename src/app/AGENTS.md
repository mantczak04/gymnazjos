# App Router Notes

This directory owns Next.js App Router entrypoints, global styles, and client providers.

- Keep route files thin; route components should delegate product behavior to `src/features`.
- Keep global provider wiring in `providers.tsx`.
- Keep `layout.tsx` free of domain logic.
- Avoid network-dependent font loaders in build-critical code.
- Shared navigation belongs in `src/shared/components/app-nav.tsx`.
