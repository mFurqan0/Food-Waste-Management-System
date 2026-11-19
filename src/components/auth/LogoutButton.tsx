import { LogOut } from "lucide-react";
import { logoutAction } from "@/server/actions/auth";

export function LogoutButton() {
  return (
    <form action={logoutAction}>
      <button
        type="submit"
        aria-label="Sign out"
        className="flex h-10 items-center gap-2 rounded-xl border border-border bg-surface px-3 text-sm transition hover:bg-primary/10"
      >
        <LogOut size={16} />
        <span className="hidden sm:inline">Sign out</span>
      </button>
    </form>
  );
}
