import { getSupabaseClient } from "@/supabase/client";
import type { SavedSetValues } from "../schemas/session.schema";
import type {
  ActiveWorkoutDraft,
  LastPerformedSet,
  PostWorkoutFeeling,
  SessionExerciseDetails,
  WorkoutSessionDetails,
  WorkoutSessionSummary
} from "../types/workout.types";
import { isDraftSetValid } from "../utils/set-ordering";
import {
  calculateSessionRepsVolume,
  calculateSessionWeightedVolume,
  hasAtLeastOneValidSet
} from "../utils/volume";
import {
  numberFromDb,
  singleRelation,
  throwIfError,
  toFeeling,
  type SessionExerciseRow,
  type SessionRow,
  type SetRow
} from "./query-utils";

const SESSION_SELECT = `
  id,
  template_id,
  started_at,
  finished_at,
  post_workout_feeling,
  template:workout_templates(id,name),
  workout_session_exercises(
    id,
    exercise_id,
    order_index,
    source,
    exercise:exercises(id,name,logging_type,is_active),
    workout_sets(id,session_exercise_id,set_index,reps,weight)
  )
`;

function durationMinutes(startedAt: string, finishedAt: string) {
  return Math.max(0, Math.round((Date.parse(finishedAt) - Date.parse(startedAt)) / 60_000));
}

function mapSessionExercise(row: SessionExerciseRow): SessionExerciseDetails | null {
  const exercise = singleRelation(row.exercise);
  if (!exercise) {
    return null;
  }

  return {
    id: row.id,
    exerciseId: row.exercise_id,
    exerciseName: exercise.name,
    loggingType: exercise.logging_type,
    orderIndex: row.order_index,
    source: row.source,
    sets: (row.workout_sets ?? [])
      .map((set: SetRow) => ({
        id: set.id,
        sessionExerciseId: set.session_exercise_id,
        setIndex: set.set_index,
        reps: set.reps,
        weight: numberFromDb(set.weight)
      }))
      .sort((a, b) => a.setIndex - b.setIndex)
  };
}

function mapSessionDetails(row: SessionRow): WorkoutSessionDetails {
  const template = singleRelation(row.template);
  const exercises = (row.workout_session_exercises ?? [])
    .map(mapSessionExercise)
    .filter((value): value is SessionExerciseDetails => Boolean(value))
    .sort((a, b) => a.orderIndex - b.orderIndex);

  return {
    id: row.id,
    templateId: row.template_id,
    templateName: template?.name ?? "Inactive template",
    startedAt: row.started_at,
    finishedAt: row.finished_at,
    postWorkoutFeeling: toFeeling(row.post_workout_feeling),
    durationMinutes: durationMinutes(row.started_at, row.finished_at),
    totalWeightedVolume: calculateSessionWeightedVolume(exercises),
    totalRepsVolume: calculateSessionRepsVolume(exercises),
    exercises
  };
}

function mapSessionSummary(details: WorkoutSessionDetails): WorkoutSessionSummary {
  return {
    id: details.id,
    templateName: details.templateName,
    startedAt: details.startedAt,
    finishedAt: details.finishedAt,
    postWorkoutFeeling: details.postWorkoutFeeling,
    durationMinutes: details.durationMinutes,
    totalWeightedVolume: details.totalWeightedVolume,
    totalRepsVolume: details.totalRepsVolume
  };
}

export async function listCompletedSessions(): Promise<WorkoutSessionSummary[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("workout_sessions")
    .select(SESSION_SELECT)
    .order("finished_at", { ascending: false });

  throwIfError(error);
  return ((data ?? []) as unknown as SessionRow[]).map(mapSessionDetails).map(mapSessionSummary);
}

export async function getSessionDetails(sessionId: string) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("workout_sessions")
    .select(SESSION_SELECT)
    .eq("id", sessionId)
    .single();

  throwIfError(error);
  return mapSessionDetails(data as unknown as SessionRow);
}

export async function getLastPerformedSetsByExerciseIds(exerciseIds: string[]) {
  if (exerciseIds.length === 0) {
    return {};
  }

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("workout_sessions")
    .select(SESSION_SELECT)
    .order("finished_at", { ascending: false })
    .limit(60);

  throwIfError(error);

  const wanted = new Set(exerciseIds);
  const found: Record<string, LastPerformedSet[]> = {};

  for (const session of ((data ?? []) as unknown as SessionRow[]).map(mapSessionDetails)) {
    for (const exercise of session.exercises) {
      if (!wanted.has(exercise.exerciseId) || found[exercise.exerciseId] || exercise.sets.length === 0) {
        continue;
      }

      found[exercise.exerciseId] = exercise.sets.map((set) => ({
        setIndex: set.setIndex,
        reps: set.reps,
        weight: set.weight
      }));
    }
  }

  return found;
}

export async function finishWorkout(draft: ActiveWorkoutDraft, feeling: PostWorkoutFeeling) {
  if (!hasAtLeastOneValidSet(draft)) {
    throw new Error("A workout needs at least one valid set before it can be finished.");
  }

  const supabase = getSupabaseClient();
  const { data: session, error: sessionError } = await supabase
    .from("workout_sessions")
    .insert({
      template_id: draft.templateId,
      started_at: draft.startedAt,
      finished_at: new Date().toISOString(),
      post_workout_feeling: feeling
    })
    .select("id")
    .single();

  throwIfError(sessionError);
  if (!session) {
    throw new Error("Workout session was not created.");
  }

  const sessionId = session.id;

  try {
    const { data: sessionExercises, error: exercisesError } = await supabase
      .from("workout_session_exercises")
      .insert(
        draft.exercises.map((exercise) => ({
          session_id: sessionId,
          exercise_id: exercise.exerciseId,
          order_index: exercise.orderIndex,
          source: exercise.source
        }))
      )
      .select("id,exercise_id");

    throwIfError(exercisesError);

    const sessionExerciseIdByExerciseId = new Map(
      (sessionExercises ?? []).map((exercise) => [exercise.exercise_id, exercise.id])
    );
    const setInserts = draft.exercises.flatMap((exercise) => {
      const sessionExerciseId = sessionExerciseIdByExerciseId.get(exercise.exerciseId);
      if (!sessionExerciseId) {
        return [];
      }

      return exercise.sets
        .filter((set) => isDraftSetValid(exercise.loggingType, set))
        .map((set, index) => ({
          session_exercise_id: sessionExerciseId,
          set_index: index,
          reps: set.reps!,
          weight: exercise.loggingType === "weighted_reps" ? set.weight : null
        }));
    });

    if (setInserts.length > 0) {
      const { error: setsError } = await supabase.from("workout_sets").insert(setInserts);
      throwIfError(setsError);
    }
  } catch (error) {
    await supabase.from("workout_sessions").delete().eq("id", sessionId);
    throw error;
  }

  return sessionId;
}

export async function updateSessionFeeling(sessionId: string, feeling: PostWorkoutFeeling) {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from("workout_sessions")
    .update({ post_workout_feeling: feeling })
    .eq("id", sessionId);

  throwIfError(error);
}

export async function updateWorkoutSet(setId: string, values: SavedSetValues) {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from("workout_sets")
    .update({ reps: values.reps, weight: values.weight })
    .eq("id", setId);

  throwIfError(error);
}

async function reindexSavedSets(sessionExerciseId: string) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("workout_sets")
    .select("id,set_index")
    .eq("session_exercise_id", sessionExerciseId)
    .order("set_index", { ascending: true });

  throwIfError(error);

  for (const [index, set] of (data ?? []).entries()) {
    if (set.set_index !== index) {
      const { error: updateError } = await supabase
        .from("workout_sets")
        .update({ set_index: index })
        .eq("id", set.id);
      throwIfError(updateError);
    }
  }
}

export async function deleteWorkoutSet(setId: string, sessionExerciseId: string) {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from("workout_sets").delete().eq("id", setId);

  throwIfError(error);
  await reindexSavedSets(sessionExerciseId);
}

export async function addWorkoutSet(sessionExerciseId: string, values: SavedSetValues) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("workout_sets")
    .select("id")
    .eq("session_exercise_id", sessionExerciseId);

  throwIfError(error);

  const { error: insertError } = await supabase.from("workout_sets").insert({
    session_exercise_id: sessionExerciseId,
    set_index: data?.length ?? 0,
    reps: values.reps,
    weight: values.weight
  });

  throwIfError(insertError);
}
