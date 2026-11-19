import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-3 rounded-card border border-border bg-surface p-8 shadow-soft">
        <h1 className="text-2xl font-semibold">Smart Mess</h1>
        <p className="text-sm text-muted">Mess management and food waste reduction.</p>
        <Link
          href="/student"
          className="mt-4 block rounded-xl bg-primary px-4 py-2.5 text-center text-sm font-medium text-white dark:text-background"
        >
          Open student app
        </Link>
        <Link
          href="/admin"
          className="block rounded-xl border border-border px-4 py-2.5 text-center text-sm font-medium hover:bg-primary/10"
        >
          Open admin dashboard
        </Link>
      </div>
    </main>
  );
}
