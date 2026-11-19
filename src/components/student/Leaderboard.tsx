import { Trophy } from "lucide-react";
import { cn } from "@/lib/cn";

type Row = {
  rank: number;
  isMe: boolean;
  name: string;
  roomNo: string | null;
  points: number;
  kgSaved: number;
};

export function Leaderboard({
  rows,
  me,
}: {
  rows: Row[];
  me: { rank: number; points: number } | null;
}) {
  const myRowShown = rows.some((r) => r.isMe);

  return (
    <section
      id="leaderboard"
      aria-label="Leaderboard"
      className="scroll-mt-24 rounded-card border border-border bg-surface p-5 shadow-soft"
    >
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="font-semibold">Leaderboard</h2>
          <p className="text-xs text-muted">Most meals skipped, last 7 days</p>
        </div>
        <Trophy size={20} className="text-warning" />
      </div>

      {rows.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted">No skipped meals yet this week.</p>
      ) : (
        <ol className="space-y-2">
          {rows.map((r) => (
            <li
              key={r.rank}
              className={cn(
                "flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-sm",
                r.isMe ? "bg-primary/15 font-medium" : "bg-background/60",
              )}
            >
              <span className="flex min-w-0 items-center gap-3">
                <span className="w-6 text-center font-semibold text-muted">{r.rank}</span>
                <span className="truncate">
                  {r.name}
                  {r.isMe ? " (you)" : ""}
                </span>
              </span>
              <span className="shrink-0 text-right">
                <span className="font-semibold">{r.points}</span> pts · {r.kgSaved.toFixed(1)} kg
              </span>
            </li>
          ))}
        </ol>
      )}

      {me && !myRowShown ? (
        <p className="mt-3 text-xs text-muted">
          You&apos;re #{me.rank} with {me.points} pts.
        </p>
      ) : null}
      {!me ? <p className="mt-3 text-xs text-muted">Skip a meal after its cutoff to appear here.</p> : null}
    </section>
  );
}
