"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Dumbbell, History, Home, Library, Rows3 } from "lucide-react";
import { cn } from "@/shared/utils/cn";

const items = [
  { href: "/workouts", label: "Start", icon: Home },
  { href: "/workouts/active", label: "Active", icon: Dumbbell },
  { href: "/workouts/history", label: "History", icon: History },
  { href: "/workouts/exercises", label: "Exercises", icon: Library },
  { href: "/workouts/templates", label: "Templates", icon: Rows3 }
];

export function AppNav() {
  const pathname = usePathname();

  return (
    <>
      <header className="sticky top-0 z-30 hidden border-b border-border bg-background/95 backdrop-blur md:block">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <Link href="/workouts" className="text-base font-semibold">
            Gymnazjos
          </Link>
          <nav className="flex items-center gap-1">
            {items.map((item) => {
              const active =
                pathname === item.href ||
                (item.href !== "/workouts" && pathname.startsWith(item.href));
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "inline-flex h-10 items-center gap-2 rounded-md px-3 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground",
                    active && "bg-muted text-foreground"
                  )}
                >
                  <Icon className="size-4" aria-hidden="true" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>
      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-border bg-background md:hidden">
        {items.map((item) => {
          const active =
            pathname === item.href || (item.href !== "/workouts" && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-medium text-muted-foreground",
                active && "text-primary"
              )}
            >
              <Icon className="size-5" aria-hidden="true" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
