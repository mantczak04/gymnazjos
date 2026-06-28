import { AlertTriangle } from "lucide-react";
import { isSupabaseConfigured } from "@/supabase/client";

export function SetupAlert() {
  if (isSupabaseConfigured()) {
    return null;
  }

  return (
    <div className="flex items-start gap-3 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
      <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <p>
        Supabase is not configured. Add `NEXT_PUBLIC_SUPABASE_URL` and
        `NEXT_PUBLIC_SUPABASE_ANON_KEY` to `.env.local` before using live data.
      </p>
    </div>
  );
}
