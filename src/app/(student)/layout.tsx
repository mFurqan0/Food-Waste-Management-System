import { BottomNav } from "@/components/student/BottomNav";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { ThemeToggle } from "@/components/ThemeToggle";
import { requireRole } from "@/server/session";

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole("STUDENT");

  return (
    <div className="mx-auto min-h-screen max-w-md pb-28">
      <header className="sticky top-0 z-10 flex items-center justify-between bg-background/80 px-5 py-4 backdrop-blur">
        <div>
          <p className="text-xs text-muted">Smart Mess</p>
          <p className="font-semibold">{user.name}</p>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <LogoutButton />
        </div>
      </header>
      <main className="space-y-5 px-5">{children}</main>
      <BottomNav />
    </div>
  );
}
