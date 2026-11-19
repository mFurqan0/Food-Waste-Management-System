"use client";

import { CalendarCheck, Leaf, Trophy } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

const ITEMS = [
  { href: "/student", label: "Today", icon: CalendarCheck },
  { href: "/student#impact", label: "Impact", icon: Leaf },
  { href: "/student#leaderboard", label: "Ranks", icon: Trophy },
];

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Student"
      className="fixed inset-x-0 bottom-0 z-20 mx-auto flex max-w-md justify-around border-t border-border bg-surface/95 px-6 py-2 backdrop-blur"
    >
      {ITEMS.map(({ href, label, icon: Icon }) => {
        const active = href === "/student" && pathname === "/student";
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex flex-col items-center gap-1 rounded-xl px-5 py-1.5 text-xs font-medium",
              active ? "text-primary" : "text-muted",
            )}
          >
            <Icon size={20} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
