"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Apple, BookOpen, Utensils } from "lucide-react";
import { cn } from "@/shared/utils/cn";

const items = [
  { href: "/nutrition", label: "Daily Log", icon: Utensils },
  { href: "/nutrition/products", label: "Products", icon: Apple },
  { href: "/nutrition/meals", label: "Meals", icon: BookOpen }
];

export function NutritionNav() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-2 overflow-x-auto pb-1">
      {items.map((item) => {
        const active = pathname === item.href;
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "inline-flex h-10 shrink-0 items-center gap-2 rounded-md border border-border bg-background px-3 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground",
              active && "border-primary bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
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
