"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ArrowRight, History, Library, Rows3 } from "lucide-react";
import { isSupabaseConfigured } from "@/supabase/client";
import { PageShell } from "@/shared/components/page-shell";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { formatLoggingType } from "@/shared/utils/format";
import { useActiveWorkoutDraft } from "../hooks/use-active-workout-draft";
import { getTemplateWithExercises, listActiveTemplatesWithExercises } from "../queries/templates";
import { SetupAlert } from "./setup-alert";
import { WorkoutNav } from "./workout-nav";

export function StartWorkoutPage() {
  const router = useRouter();
  const { draft, hydrated, startWorkout } = useActiveWorkoutDraft();
  const configured = isSupabaseConfigured();

  useEffect(() => {
    if (hydrated && draft) {
      router.replace("/workouts/active");
    }
  }, [draft, hydrated, router]);

  const templatesQuery = useQuery({
    queryKey: ["workout-templates"],
    queryFn: listActiveTemplatesWithExercises,
    enabled: configured
  });

  const startMutation = useMutation({
    mutationFn: getTemplateWithExercises,
    onSuccess: (template) => {
      startWorkout(template);
      router.push("/workouts/active");
    }
  });

  return (
    <PageShell title="Start workout">
      <WorkoutNav />
      <SetupAlert />

      <div className="grid gap-3 sm:grid-cols-3">
        <Button asChild variant="outline">
          <Link href="/workouts/templates">
            <Rows3 className="size-4" aria-hidden="true" />
            Templates
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/workouts/history">
            <History className="size-4" aria-hidden="true" />
            History
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/workouts/exercises">
            <Library className="size-4" aria-hidden="true" />
            Exercises
          </Link>
        </Button>
      </div>

      {templatesQuery.isLoading ? <p className="text-sm text-muted-foreground">Loading templates...</p> : null}
      {templatesQuery.error ? (
        <p className="text-sm text-destructive">{templatesQuery.error.message}</p>
      ) : null}

      <div className="grid gap-3">
        {(templatesQuery.data ?? []).map((template) => (
          <section
            key={template.id}
            className="rounded-lg border border-border bg-card p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="truncate text-lg font-semibold">{template.name}</h2>
                <p className="text-sm text-muted-foreground">
                  {template.exercises.length} exercise{template.exercises.length === 1 ? "" : "s"}
                </p>
              </div>
              <Button
                type="button"
                disabled={startMutation.isPending}
                onClick={() => startMutation.mutate(template.id)}
              >
                Start
                <ArrowRight className="size-4" aria-hidden="true" />
              </Button>
            </div>
            {template.exercises.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {template.exercises.map((templateExercise) => (
                  <Badge key={templateExercise.id}>
                    {templateExercise.exercise.name} ·{" "}
                    {formatLoggingType(templateExercise.exercise.loggingType)}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-sm text-muted-foreground">
                Add exercises before using this template.
              </p>
            )}
          </section>
        ))}
      </div>

      {configured && templatesQuery.data?.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Create a template before starting a workout.</p>
        </div>
      ) : null}
    </PageShell>
  );
}
