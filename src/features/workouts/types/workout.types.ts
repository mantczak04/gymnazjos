export type LoggingType = "weighted_reps" | "reps_only";
export type WorkoutSessionExerciseSource = "template" | "ad_hoc";
export type PostWorkoutFeeling = 1 | 2 | 3 | 4 | 5;

export type Exercise = {
  id: string;
  name: string;
  loggingType: LoggingType;
  isActive: boolean;
};

export type WorkoutTemplateExercise = {
  id: string;
  exercise: Exercise;
  orderIndex: number;
};

export type WorkoutTemplate = {
  id: string;
  name: string;
  isActive: boolean;
  exercises: WorkoutTemplateExercise[];
};

export type ActiveWorkoutDraftSet = {
  localId: string;
  setIndex: number;
  reps: number | null;
  weight: number | null;
};

export type ActiveWorkoutDraftExercise = {
  exerciseId: string;
  exerciseName: string;
  loggingType: LoggingType;
  orderIndex: number;
  source: WorkoutSessionExerciseSource;
  sets: ActiveWorkoutDraftSet[];
};

export type ActiveWorkoutDraft = {
  templateId: string;
  templateName: string;
  startedAt: string;
  exercises: ActiveWorkoutDraftExercise[];
};

export type LastPerformedSet = {
  setIndex: number;
  reps: number;
  weight: number | null;
};

export type SessionExerciseDetails = {
  id: string;
  exerciseId: string;
  exerciseName: string;
  loggingType: LoggingType;
  orderIndex: number;
  source: WorkoutSessionExerciseSource;
  sets: SavedWorkoutSet[];
};

export type SavedWorkoutSet = {
  id: string;
  sessionExerciseId: string;
  setIndex: number;
  reps: number;
  weight: number | null;
};

export type WorkoutSessionSummary = {
  id: string;
  templateName: string;
  startedAt: string;
  finishedAt: string;
  postWorkoutFeeling: PostWorkoutFeeling;
  durationMinutes: number;
  totalWeightedVolume: number;
  totalRepsVolume: number;
};

export type WorkoutSessionDetails = WorkoutSessionSummary & {
  templateId: string;
  exercises: SessionExerciseDetails[];
};
