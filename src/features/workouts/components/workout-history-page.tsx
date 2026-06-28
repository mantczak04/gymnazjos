"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { isSupabaseConfigured } from "@/supabase/client";
import { PageShell } from "@/shared/components/page-shell";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { formatDateTime, formatDuration, formatFeeling } from "@/shared/utils/format";
import { listCompletedSessions } from "../queries/sessions";
import { SetupAlert } from "./setup-alert";
import { WorkoutNav } from "./workout-nav";

export function WorkoutHistoryPage() {
  const configured = isSupabaseConfigured();
  const sessionsQuery = useQuery({
    queryKey: ["workout-sessions"],
    queryFn: listCompletedSessions,
    enabled: configured
  });

  return (
    <PageShell title="Workout history">
      <WorkoutNav />
      <SetupAlert />

      {sessionsQuery.isLoading ? <p className="text-sm text-muted-foreground">Loading history...</p> : null}
      {sessionsQuery.error ? (
        <p className="text-sm text-destructive">{sessionsQuery.error.message}</p>
      ) : null}

      <div className="grid gap-3">
        {(sessionsQuery.data ?? []).map((session) => (
          <section
            key={session.id}
            className="rounded-lg border border-border bg-card p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="truncate text-lg font-semibold">{session.templateName}</h2>
                <p className="text-sm text-muted-foreground">{formatDateTime(session.finishedAt)}</p>
              </div>
              <Button asChild variant="outline" size="icon" aria-label="Open workout">
                <Link href={`/workouts/history/${session.id}`}>
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </Button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge>{formatDuration(session.durationMinutes)}</Badge>
              <Badge>{Math.round(session.totalWeightedVolume)} kg volume</Badge>
              <Badge>{session.totalRepsVolume} reps</Badge>
              <Badge>{formatFeeling(session.postWorkoutFeeling)}</Badge>
            </div>
          </section>
        ))}
      </div>

      {configured && sessionsQuery.data?.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Completed workouts will appear here.</p>
        </div>
      ) : null}
    </PageShell>
  );
}
