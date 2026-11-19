"use client";

import { Leaf } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { ADMIN_NAV } from "./nav";

const isActive = (pathname: string, href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border bg-surface p-5 lg:flex">
      <Link href="/admin" className="mb-8 flex items-center gap-3 px-2">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white dark:text-background">
          <Leaf size={20} />
        </span>
        <span className="text-lg font-semibold">Smart Mess</span>
      </Link>

      <nav className="flex flex-1 flex-col gap-1" aria-label="Admin">
        {ADMIN_NAV.map(({ href, label, icon: Icon }) => {
          const active = isActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition",
                active ? "bg-primary text-white shadow-soft dark:text-background" : "text-muted hover:bg-primary/10 hover:text-foreground",
              )}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="flex items-center gap-3 rounded-2xl bg-primary/10 p-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white dark:text-background">
          MA
        </span>
        <div className="leading-tight">
          <p className="text-sm font-medium">Mess Admin</p>
          <p className="text-xs text-muted">Administrator</p>
        </div>
      </div>
    </aside>
  );
}

export function MobileNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Admin" className="flex gap-2 overflow-x-auto border-b border-border bg-surface px-4 py-2 lg:hidden">
      {ADMIN_NAV.map(({ href, label, icon: Icon }) => {
        const active = isActive(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-medium",
              active ? "bg-primary text-white dark:text-background" : "text-muted",
            )}
          >
            <Icon size={16} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
