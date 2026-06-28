"use client";

import type { ReactNode } from "react";
import { FormEvent, useEffect, useState } from "react";
import { Lock } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";

const UNLOCKED_UNTIL_KEY = "gym-tracker.unlocked-until";
const FOURTEEN_DAYS_MS = 14 * 24 * 60 * 60 * 1000;

async function sha256Hex(value: string) {
  const buffer = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function hasValidUnlock() {
  const stored = window.localStorage.getItem(UNLOCKED_UNTIL_KEY);
  if (!stored) {
    return false;
  }

  const timestamp = Number(stored);
  return Number.isFinite(timestamp) && timestamp > Date.now();
}

export function PasswordGate({ children }: { children: ReactNode }) {
  const configuredHash = process.env.NEXT_PUBLIC_APP_PASSWORD_HASH?.trim();
  const [hydrated, setHydrated] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setUnlocked(hasValidUnlock());
    setHydrated(true);
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);

    try {
      if (!configuredHash) {
        setError("Password hash is not configured.");
        return;
      }

      const digest = await sha256Hex(password);
      if (digest !== configuredHash) {
        setError("Incorrect password.");
        return;
      }

      window.localStorage.setItem(UNLOCKED_UNTIL_KEY, String(Date.now() + FOURTEEN_DAYS_MS));
      setUnlocked(true);
    } finally {
      setBusy(false);
    }
  }

  if (!hydrated) {
    return null;
  }

  if (unlocked) {
    return children;
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-8">
      <form
        className="flex w-full max-w-sm flex-col gap-4 rounded-lg border border-border bg-card p-5 shadow-sm"
        onSubmit={handleSubmit}
      >
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Lock className="size-5" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-xl font-semibold">Gymnazjos</h1>
            <p className="text-sm text-muted-foreground">Enter the app password.</p>
          </div>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="app-password">Password</Label>
          <Input
            id="app-password"
            type="password"
            value={password}
            autoComplete="current-password"
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <Button type="submit" disabled={busy || !password}>
          Unlock
        </Button>
      </form>
    </main>
  );
}
