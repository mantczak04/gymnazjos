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

export function WorkoutNav() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-2 overflow-x-auto pb-1">
      {items.map((item) => {
        const active =
          pathname === item.href || (item.href !== "/workouts" && pathname.startsWith(item.href));
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "inline-flex h-10 shrink-0 items-center gap-2 rounded-md border border-border bg-background px-3 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground",
              active &&
                "border-primary bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
            )}
          >
            <Icon className="size-4" aria-hidden="true" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
