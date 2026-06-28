import { WorkoutSessionDetailsPage } from "@/features/workouts/components/workout-session-details-page";

type RouteProps = {
  params: Promise<{ sessionId: string }>;
};

export default async function WorkoutSessionDetailsRoute({ params }: RouteProps) {
  const resolvedParams = await params;
  return <WorkoutSessionDetailsPage sessionId={resolvedParams.sessionId} />;
}
