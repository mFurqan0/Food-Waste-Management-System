import { Card, CardHeader } from "@/components/ui/Card";
import { cn } from "@/lib/cn";
import { MEAL_LABEL } from "@/lib/constants";
import type { MealHeadcount } from "@/server/services/headcount";

export function HeadcountCard({ meals, totalStudents }: { meals: MealHeadcount[]; totalStudents: number }) {
  const pct = (n: number) => (totalStudents > 0 ? `${(n / totalStudents) * 100}%` : "0%");

  return (
    <Card>
      <CardHeader
        title="Live headcount prediction"
        subtitle={`${totalStudents} students · prediction = going + pending × current going-rate`}
      />
      <div className="space-y-6">
        {meals.map((m) => (
          <div key={m.meal}>
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <h4 className="font-medium">{MEAL_LABEL[m.meal]}</h4>
                <span
                  className={cn(
                    "rounded-full px-2.5 py-0.5 text-xs font-medium",
                    m.open ? "bg-success/15 text-success" : "bg-muted/15 text-muted",
                  )}
                >
                  {m.open ? `Open · closes ${m.cutoff}` : `Locked since ${m.cutoff}`}
                </span>
              </div>
              <p className="text-sm text-muted">
                Expected <span className="text-lg font-semibold text-foreground">~{m.predicted}</span>
              </p>
            </div>

            <div
              className="flex h-3 overflow-hidden rounded-full bg-muted/15"
              role="img"
              aria-label={`${m.going} going, ${m.skipping} skipping, ${m.pending} pending`}
            >
              <div className="bg-success transition-all" style={{ width: pct(m.going) }} />
              <div className="bg-danger transition-all" style={{ width: pct(m.skipping) }} />
            </div>

            <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted">
              <span className="flex items-center gap-1.5">
                <i className="h-2 w-2 rounded-full bg-success" /> {m.going} going
              </span>
              <span className="flex items-center gap-1.5">
                <i className="h-2 w-2 rounded-full bg-danger" /> {m.skipping} skipping
              </span>
              <span className="flex items-center gap-1.5">
                <i className="h-2 w-2 rounded-full bg-muted/40" /> {m.pending} not responded
              </span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
