import { Flame } from "lucide-react";

export function StreakCard({ days }: { days: number }) {
  return (
    <section
      aria-label="Logging streak"
      className="flex items-center gap-4 rounded-card border border-border bg-surface p-5 shadow-soft"
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-500 text-white">
        <Flame size={22} />
      </span>
      <div>
        <p className="text-2xl font-semibold">
          {days} {days === 1 ? "day" : "days"}
        </p>
        <p className="text-xs text-muted">
          {days > 0 ? "in a row you answered every meal" : "Answer all three meals today to start a streak"}
        </p>
      </div>
    </section>
  );
}
