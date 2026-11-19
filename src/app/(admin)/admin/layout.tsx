import { MobileNav, Sidebar } from "@/components/admin/Sidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { formatLong, todayIso } from "@/lib/date";

// TODO (Phase 5): protect everything under /admin with auth + role check.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen lg:flex">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-border bg-background/80 px-5 py-3 backdrop-blur lg:px-8">
          <div>
            <p className="text-xs text-muted">{formatLong(todayIso())}</p>
            <p className="text-sm font-semibold">Mess Admin</p>
          </div>
          <ThemeToggle />
        </header>
        <MobileNav />
        <main className="flex-1 p-5 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
