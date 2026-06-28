# Workout Module Specification

## Purpose

The workout module is the first MVP domain of the application.

Its purpose is to let the user:

- define exercises,
- define reusable workout templates,
- start a workout from a template,
- log performed sets quickly on mobile,
- see the last performed sets for each exercise,
- finish the workout with a required post-workout feeling rating,
- review and edit completed workout history,
- provide workout data for future dashboard progress tracking.

The module should prioritize fast mobile data entry over complex planning features.

## Core Concepts

### Exercise Library

The Exercise Library is the global pool of exercises that can be used in workout templates and workout sessions.

Each exercise defines how it should be logged.

Supported logging types:

- `weighted_reps` — the exercise is logged with weight and reps.
- `reps_only` — the exercise is logged with reps only.

Examples:

```txt
Bench Press -> weighted_reps
Squat -> weighted_reps
Push-up -> reps_only
Pull-up -> reps_only
```

The MVP does not include muscle groups, categories, equipment tags, movement patterns, or exercise notes.

### Workout Template

A Workout Template is a reusable workout definition.

Examples:

- Upper Body
- Lower Body
- Push
- Pull
- Legs
- Accessories

A template contains a list of exercises from the Exercise Library in a specific order.

The template does not define:

- planned sets,
- target reps,
- target weight,
- RPE,
- rest times,
- intensity targets.

The template only defines which exercises are part of the workout and in what order they appear.

### Workout Session

A Workout Session is a completed instance of a workout performed on a specific date.

A session is always started from an active Workout Template.

The MVP does not support starting an empty workout session without a template.

During the workout, the user can add additional ad-hoc exercises from the Exercise Library. These ad-hoc exercises are added only to the current session and do not modify the template.

### Workout Set

A Workout Set is a single performed set inside a workout session.

For `weighted_reps` exercises, a set contains:

- weight,
- reps.

For `reps_only` exercises, a set contains:

- reps.

## Data Model

### Exercise

```txt
Exercise
  - id
  - name
  - logging_type: weighted_reps | reps_only
  - is_active: boolean
```

Rules:

- Exercise names must be unique.
- Name uniqueness should be case-insensitive.
- Example: `Bench Press` and `bench press` should be treated as the same exercise.
- Exercises should not be hard-deleted after they have been used in workout history.
- Inactive exercises are hidden from the default Exercise Library view.
- Inactive exercises are not shown by default when adding exercises to templates or active sessions.
- Historical workout sessions still display inactive exercises normally.

### Workout Template

```txt
Workout Template
  - id
  - name
  - is_active: boolean
```

Rules:

- Workout templates are not hard-deleted after they have been used in workout history.
- Inactive templates are hidden from the default Start Workout view.
- Historical workout sessions still display inactive templates normally.
- Active workout template names must be unique.
- Name uniqueness should be case-insensitive.
- Inactive templates do not block creating a new active template with the same name.

### Workout Template Exercise

```txt
Workout Template Exercise
  - id
  - template_id
  - exercise_id
  - order_index
```

Rules:

- A workout template contains exercises in a specific order.
- `order_index` defines the display and execution order.
- A workout template cannot contain the same exercise more than once.
- The pair `template_id + exercise_id` must be unique.
- Exercise ordering is changed using simple Move up / Move down controls.
- The MVP should not use drag-and-drop for exercise ordering.

### Workout Session

```txt
Workout Session
  - id
  - template_id
  - started_at
  - finished_at
  - post_workout_feeling: 1 | 2 | 3 | 4 | 5
```

Rules:

- A workout session is always started from an active Workout Template.
- A completed workout session must contain at least one valid set.
- A completed workout session must have `started_at`, `finished_at`, and `post_workout_feeling`.
- Workout history only shows completed workout sessions.
- Discarded active workout drafts are not saved to Supabase and never appear in workout history.

### Workout Session Exercise

```txt
Workout Session Exercise
  - id
  - session_id
  - exercise_id
  - order_index
  - source: template | ad_hoc
```

Rules:

- A workout session cannot contain the same exercise as multiple separate exercise blocks.
- Each exercise appears at most once per session.
- If the user performs the same exercise again later in the workout, they should add more sets to the existing exercise block.
- Exercises from the selected template appear first.
- Template exercises use the order defined by `Workout Template Exercise.order_index`.
- Exercises added ad hoc during the session appear after template exercises.
- Ad-hoc exercises are ordered by the time they were added.
- The user cannot reorder exercises during an active workout session in the MVP.
- When a workout is finished, the app saves the exact exercise order from the active workout draft.

### Workout Set

```txt
Workout Set
  - id
  - session_exercise_id
  - set_index
  - reps
  - weight? only for weighted_reps
```

Rules:

- For `weighted_reps`, both `weight` and `reps` are required.
- For `reps_only`, only `reps` is required.
- Sets can be added, edited, and deleted during an active workout.
- Sets can also be edited later from saved workout history.
- `set_index` defines the order of sets within a session exercise.

## Derived Metrics

### Weighted Volume Load

For `weighted_reps` exercises:

```txt
volume_load = weight * reps
```

Examples:

```txt
30 kg × 10 reps = 300 kg volume
3 sets × 10 reps × 30 kg = 900 kg total exercise volume
```

Session total volume:

```txt
sum(volume_load) across all weighted sets in the workout session
```

This is one of the main progress metrics for the future dashboard.

Example:

```txt
Past workout:
3 sets × 10 reps × 30 kg = 900 kg

Later workout:
3 sets × 10 reps × 40 kg = 1200 kg

Dashboard should show increased total volume.
```

### Reps Volume

For `reps_only` exercises:

```txt
reps_volume = sum(reps)
```

Reps-only exercises should not be mixed into kilogram-based volume totals.

They can be tracked separately.

## Post-Workout Feeling

After finishing a workout, the user must provide a post-workout feeling rating.

Scale:

```txt
1 = very bad
2 = bad
3 = okay
4 = good
5 = very good
```

Finish workout flow:

```txt
How do you feel after this workout?

[1] [2] [3] [4] [5]

Save workout
```

Rules:

- The rating is required.
- The workout cannot be saved without selecting this rating.
- The rating is a simple 1–5 tap/click selection.
- The rating should be available later for dashboard analysis.

## Active Workout Draft

An active workout is stored locally as a browser draft.

The draft should survive:

- page refresh,
- accidental tab close,
- brief connectivity issues.

The active workout is not saved to Supabase immediately.

Supabase receives the workout only after the user finishes the workout and selects the required post-workout feeling rating.

Discarding an active workout removes the local draft and does not write anything to Supabase.

### Draft Storage

The active workout draft is stored in `localStorage`.

Reasons:

- only one active workout draft exists at a time,
- the draft is small,
- implementation is simple,
- debugging is easy,
- no full offline synchronization is required,
- easier for coding agents to maintain than IndexedDB.

Recommended key:

```txt
gym-tracker.active-workout-draft
```

### Draft Shape

```ts
type ActiveWorkoutDraft = {
  templateId: string;
  templateName: string;
  startedAt: string;
  exercises: ActiveWorkoutDraftExercise[];
};

type ActiveWorkoutDraftExercise = {
  exerciseId: string;
  exerciseName: string;
  loggingType: "weighted_reps" | "reps_only";
  orderIndex: number;
  source: "template" | "ad_hoc";
  sets: ActiveWorkoutDraftSet[];
};

type ActiveWorkoutDraftSet = {
  localId: string;
  setIndex: number;
  reps: number | null;
  weight: number | null;
};
```

A Zod schema should be used to validate the draft when reading from `localStorage`.

If the draft is malformed, the app should handle it safely rather than crashing.

### Draft Lifetime

The active workout draft has no automatic timeout.

The draft remains in `localStorage` until the user explicitly:

- finishes the workout,
- discards the workout.

The app should not automatically delete a draft based on age.

### Autosave

The active workout draft is automatically saved to `localStorage` after every meaningful change.

Meaningful changes include:

- starting a workout,
- adding a set,
- editing a set,
- deleting a set,
- adding an ad-hoc exercise,
- discarding a workout.

There is no manual "Save draft" button in the MVP.

The user should not need to think about saving the active workout draft.

### Resume Behavior

If an active workout draft exists in `localStorage`, the app automatically resumes it.

The user is taken directly to the active workout screen.

The active workout screen still provides a Discard Workout action.

The app does not show a separate Resume / Discard choice screen in the MVP.

### One Active Workout

The app supports exactly one local active workout draft at a time.

If a draft exists:

- the user is taken to the active workout,
- the user cannot start another workout,
- the user can finish or discard the current draft.

If no draft exists:

- the user can start a new workout from an active Workout Template.

## Active Workout Behavior

### Starting a Workout

A workout session must always be started from an active Workout Template.

The MVP does not support starting an empty workout session without a template.

If the user wants a flexible workout, they should create a generic template such as `Free Workout` or `Accessories`.

When a workout is started:

- the app reads the selected template,
- creates a local draft,
- copies template exercises into the draft,
- sets `startedAt`,
- stores the draft in `localStorage`,
- navigates to the Active Workout screen.

### Exercise Display

Each exercise in the active workout screen shows:

- exercise name,
- logging type,
- last performed sets for this exercise,
- current session sets,
- Add set button.

### Last Performed Sets

During a workout, the app should show the last performed sets for each exercise.

The app should find the most recent previous completed session where the same exercise was performed.

Example:

```txt
Bench Press

Last time:
60 kg × 8
60 kg × 7
55 kg × 9

Current session:
[ + Add set ]
```

For `weighted_reps`, show weight and reps.

For `reps_only`, show reps.

### Adding Sets

Sets are added manually by the user with an Add set button.

The app does not pre-generate empty sets.

For `weighted_reps` exercises:

- When adding the first set, fields are empty.
- When adding another set, `weight` is copied from the previous set.
- `reps` stays empty.

For `reps_only` exercises:

- When adding a new set, `reps` stays empty.

### Editing Sets During Active Workout

During an active workout, each set can be:

- edited,
- deleted.

Editing should be inline or very lightweight.

The user should not need to leave the active workout screen to correct a set.

### Skipped Exercises

A workout template can contain exercises that are not performed in a specific session.

If an exercise has no sets in a workout session, it is treated as skipped for that session.

Skipping an exercise does not modify the workout template.

### Ad-Hoc Session Exercises

During an active workout session, the user can add an exercise from the Exercise Library even if that exercise is not part of the selected Workout Template.

Adding an exercise during a session affects only the current Workout Session.

It does not modify the Workout Template.

The added exercise behaves like any other exercise in the session:

- it shows the correct logging fields based on its `logging_type`,
- it supports adding, editing, and deleting sets,
- it contributes to session volume/reps metrics.

New exercises cannot be created from the active workout screen.

During an active workout, the user can only add exercises that already exist in the Exercise Library.

New exercises should be created separately in the Exercise Library management screen.

### Discarding Active Workout

An unfinished workout can be discarded.

Discarding removes the active workout draft and does not create a completed workout history entry.

The user should confirm before discarding.

### Finishing Active Workout

A workout cannot be finished unless it contains at least one valid set.

When the user finishes a workout:

1. The app asks for the required post-workout feeling rating.
2. The user selects a rating from 1 to 5.
3. The app validates the active workout draft.
4. The app saves the completed workout session to Supabase.
5. The app saves session exercises and sets.
6. The app clears the localStorage draft.
7. The app navigates to workout history or session details.

## Workout Module Screens

### 1. Start Workout

Purpose:

- Choose a workout template and start a session.

Content:

- List of active workout templates.
- Start workout button for each template.
- If an active draft exists, auto-resume it instead of showing normal start flow.

Actions:

- Start workout from template.
- Navigate to Workout Templates.
- Navigate to Workout History.
- Navigate to Exercise Library.

### 2. Active Workout

Purpose:

- Log the current workout quickly on mobile.

Content:

- Template name.
- Workout start time or duration.
- Exercises from selected template.
- Ad-hoc exercises added during session.
- Last performed sets per exercise.
- Current session sets.
- Add set buttons.
- Finish workout button.
- Discard workout button.

Actions:

- Add set.
- Edit set.
- Delete set.
- Add ad-hoc exercise from Exercise Library.
- Finish workout.
- Discard workout.

### 3. Workout History

Purpose:

- Review completed workouts.

Content:

- List of completed workout sessions.
- Date.
- Template name.
- Duration.
- Total weighted volume.
- Total reps-only volume.
- Post-workout feeling.
- Open session details.

Rules:

- Only completed workouts are shown.
- Discarded drafts are never shown.

### 4. Workout Session Details / Edit

Purpose:

- View and correct a completed workout.

Content:

- Session date.
- Template name.
- Started and finished time.
- Duration.
- Post-workout feeling.
- Exercises performed.
- Sets for each exercise.
- Total weighted volume.
- Total reps-only volume.

Actions:

- Change post-workout feeling.
- Edit existing sets.
- Delete incorrect sets.
- Add missing sets.

The editing flow should reuse the same set editing UI as the active workout screen where possible.

### 5. Exercise Library

Purpose:

- Manage available exercises.

Content:

- List of active exercises.
- Exercise name.
- Logging type.

Actions:

- Create exercise.
- Edit exercise.
- Deactivate exercise.

Create exercise form:

```txt
Exercise name
Logging type: weighted_reps | reps_only
```

Rules:

- New exercises cannot be created from the Active Workout screen.
- Exercise names must be unique case-insensitively.
- Inactive exercises should be hidden by default.

### 6. Workout Templates

Purpose:

- Manage reusable workout definitions.

Content:

- List of active templates.
- Template name.
- Ordered list of exercises inside each template.

Actions:

- Create template.
- Edit template name.
- Add exercise from Exercise Library.
- Remove exercise from template.
- Reorder exercises using Move up / Move down buttons.
- Deactivate template.

Rules:

- Active template names must be unique case-insensitively.
- One template cannot contain the same exercise more than once.
- Templates contain only exercise lists, not planned sets or target reps.
- Inactive templates should be hidden by default from the Start Workout screen.

## MVP Scope

Included in MVP:

- Exercise Library.
- Exercise creation/edit/deactivation.
- Workout Template creation/edit/deactivation.
- Ordered exercises inside templates.
- Start workout from template.
- Active workout local draft in `localStorage`.
- Autosave active workout draft.
- Auto-resume active workout draft.
- Add/edit/delete sets during active workout.
- Add ad-hoc exercises from existing Exercise Library.
- Show last performed sets for each exercise.
- Finish workout with required 1–5 feeling rating.
- Save completed workout to Supabase.
- Discard active workout.
- Workout history.
- Saved workout details.
- Simple saved workout editing.
- Basic derived volume metrics.

Not included in MVP:

- Native mobile app.
- Full offline synchronization.
- Supabase Auth.
- User accounts.
- Starting empty workout sessions.
- Creating exercises from the active workout screen.
- Planned sets or target reps in templates.
- RPE tracking.
- Rest timers.
- Drag-and-drop ordering.
- Muscle group categories.
- Equipment categories.
- Exercise tags.
- Multiple active workouts.
- Automatic progression suggestions.
- Personal records.
- Charts inside the workout module.
- Nutrition functionality.
- Dashboard functionality.

## Implementation Notes for Agents

Keep workout-specific code inside:

```txt
src/features/workouts/
```

Recommended structure:

```txt
src/features/workouts/
  components/
  hooks/
  queries/
  schemas/
  types/
  utils/
```

Database queries should be kept out of React components.

Recommended query files:

```txt
src/features/workouts/queries/exercises.ts
src/features/workouts/queries/templates.ts
src/features/workouts/queries/sessions.ts
```

Recommended schema files:

```txt
src/features/workouts/schemas/exercise.schema.ts
src/features/workouts/schemas/template.schema.ts
src/features/workouts/schemas/session.schema.ts
src/features/workouts/schemas/active-workout-draft.schema.ts
```

Recommended utility files:

```txt
src/features/workouts/utils/volume.ts
src/features/workouts/utils/set-ordering.ts
src/features/workouts/utils/draft-storage.ts
```

Recommended hooks:

```txt
src/features/workouts/hooks/use-active-workout-draft.ts
src/features/workouts/hooks/use-last-performed-sets.ts
src/features/workouts/hooks/use-finish-workout.ts
```

Agents should preserve these product decisions unless the user explicitly changes them.
