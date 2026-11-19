import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-sm rounded-card border border-border bg-surface p-8 shadow-soft">
        <h1 className="text-2xl font-semibold">Smart Mess</h1>
        <p className="mt-2 text-sm text-muted">Mess management and food waste reduction.</p>
        <Link
          href="/admin"
          className="mt-6 block rounded-xl bg-primary px-4 py-2.5 text-center text-sm font-medium text-white dark:text-background"
        >
          Open admin dashboard
        </Link>
      </div>
    </main>
  );
}
