# Database Schema

This file summarizes checked-in Supabase migrations. The source of truth remains the SQL files in `supabase/migrations`.

## Workout MVP

Migration: `0001_workout_mvp.sql`

- `exercises`
- `workout_templates`
- `workout_template_exercises`
- `workout_sessions`
- `workout_session_exercises`
- `workout_sets`
- Enums: `exercise_logging_type`, `workout_session_exercise_source`

## Nutrition MVP

Migration: `0002_nutrition_mvp.sql`

- `products`
  - Active product names are unique case-insensitively with a partial index.
  - Nutrition basis is `per_100g`, `per_100ml`, or `per_unit`.
  - Per-unit products require `unit_name`; weight and volume products store `unit_name` as null.
  - Products are soft-deactivated with `is_active`.

- `meal_templates`
  - Active meal names are unique case-insensitively with a partial index.
  - Meal templates are soft-deactivated with `is_active`.

- `meal_template_ingredients`
  - Connects meal templates to products.
  - `meal_template_id + product_id` is unique.
  - `quantity` is positive and means grams, milliliters, or unit count depending on the product basis.

- `daily_food_entries`
  - One row per daily log entry.
  - Uses `entry_date`, `entry_type`, and `name_snapshot`.
  - No meal time, created time, section, or manual order is stored in the MVP.

- `daily_food_entry_ingredients`
  - Stores copied product nutrition snapshots for historical stability.
  - Keeps optional `product_id`; historical rows still work if the product is edited, deactivated, or later unavailable.
  - `quantity` is positive.

- `daily_nutrition_targets`
  - Singleton table with `id = 1`.
  - Stores global fixed daily targets for calories, protein, carbs, and fat.

- Enums: `nutrition_basis`, `daily_food_entry_type`
