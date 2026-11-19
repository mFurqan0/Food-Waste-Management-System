import { MobileNav, Sidebar } from "@/components/admin/Sidebar";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { ThemeToggle } from "@/components/ThemeToggle";
import { formatLong, todayIso } from "@/lib/date";
import { requireRole } from "@/server/session";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole("ADMIN");

  return (
    <div className="min-h-screen lg:flex">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-border bg-background/80 px-5 py-3 backdrop-blur lg:px-8">
          <div>
            <p className="text-xs text-muted">{formatLong(todayIso())}</p>
            <p className="text-sm font-semibold">{user.name}</p>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <LogoutButton />
          </div>
        </header>
        <MobileNav />
        <main className="flex-1 p-5 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
