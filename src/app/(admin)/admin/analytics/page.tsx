import { Gauge, Leaf, Scale, TrendingDown, TrendingUp } from "lucide-react";
import Link from "next/link";
import { StatCard } from "@/components/admin/StatCard";
import { DailyWasteBarChart, WasteByMealChart, WasteTrendChart } from "@/components/charts/waste-charts";
import { Card, CardHeader } from "@/components/ui/Card";
import { cn } from "@/lib/cn";
import { MEAL_LABEL, MEAL_TYPES } from "@/lib/constants";
import { todayIso } from "@/lib/date";
import { getWasteAnalytics } from "@/server/services/waste";

export const dynamic = "force-dynamic";
export const metadata = { title: "Analytics" };

const RANGES = [7, 14, 30] as const;

export default async function AnalyticsPage({ searchParams }: { searchParams: { days?: string } }) {
  const requested = Number(searchParams.days);
  const days = RANGES.find((r) => r === requested) ?? 14;
  const a = await getWasteAnalytics(todayIso(), days);

  const down = a.changePct != null && a.changePct <= 0;
  const topMeal = [...MEAL_TYPES].sort((x, y) => a.byMeal[y] - a.byMeal[x])[0];

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Waste analytics</h2>
          <p className="text-sm text-muted">
            {a.totalKg > 0 ? `${MEAL_LABEL[topMeal]} produced the most waste in this period.` : "No waste logged in this period."}
          </p>
        </div>
        <div className="flex gap-1 rounded-xl border border-border bg-surface p-1" role="group" aria-label="Time range">
          {RANGES.map((r) => (
            <Link
              key={r}
              href={`/admin/analytics?days=${r}`}
              aria-current={r === days ? "true" : undefined}
              className={cn(
                "rounded-lg px-4 py-1.5 text-sm font-medium transition",
                r === days ? "bg-primary text-white dark:text-background" : "text-muted hover:text-foreground",
              )}
            >
              {r} days
            </Link>
          ))}
        </div>
      </div>

      <section className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard tone="pink" icon={Scale} label="Total waste" value={`${a.totalKg.toFixed(1)} kg`} hint={`Last ${days} days`} />
        <StatCard tone="blue" icon={Gauge} label="Average per day" value={`${a.avgPerDay.toFixed(1)} kg`} />
        <StatCard
          tone={down ? "green" : "orange"}
          icon={down ? TrendingDown : TrendingUp}
          label="Vs previous period"
          value={a.changePct == null ? "n/a" : `${a.changePct > 0 ? "+" : ""}${a.changePct.toFixed(0)}%`}
          hint={a.changePct == null ? "No earlier data" : `${a.prevKg.toFixed(1)} kg before`}
        />
        <StatCard tone="yellow" icon={Leaf} label="Waste vs prepared" value={a.wastePct == null ? "n/a" : `${a.wastePct.toFixed(1)}%`} hint="Where prepared kg was logged" />
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader title="Waste trend" subtitle="Stacked by meal, in kg" />
          <WasteTrendChart data={a.daily} />
        </Card>
        <Card>
          <CardHeader title="Share by meal" />
          <WasteByMealChart byMeal={a.byMeal} />
        </Card>
      </section>

      <Card>
        <CardHeader title="Daily total" subtitle="All meals combined, in kg" />
        <DailyWasteBarChart data={a.daily} />
      </Card>
    </div>
  );
}
