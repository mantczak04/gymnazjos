# Workout Routes

This route group exposes the workout MVP screens.

- Keep pages as route adapters only; import feature components from `src/features/workouts/components`.
- Workout sessions always start from an active template.
- Active workout data lives in one local draft, not in route state.
- Do not add nutrition or dashboard behavior here.
- Use child routes only for screen-level navigation, not business logic.
