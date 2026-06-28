import type { ReactNode } from "react";
import { cn } from "@/shared/utils/cn";

type PageShellProps = {
  title: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
};

export function PageShell({ title, actions, children, className }: PageShellProps) {
  return (
    <main className={cn("mx-auto flex w-full max-w-5xl flex-col gap-4 px-4 py-5", className)}>
      <div className="flex min-h-12 items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-normal">{title}</h1>
        {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
      </div>
      {children}
    </main>
  );
}
