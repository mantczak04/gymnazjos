# Nutrition Routes

This route group exposes the nutrition MVP screens.

- Keep pages as route adapters only; import feature components from `src/features/nutrition/components`.
- `/nutrition` is the Daily Food Log entrypoint.
- Use child routes only for screen-level navigation, not business logic.
- Do not add workout, dashboard, auth, barcode scanning, or external food database behavior here.
- Preserve the English-only UI and naming rule from `.ai/docs/diet.md`.
