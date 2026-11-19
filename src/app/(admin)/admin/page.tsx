import { ArrowDownRight, ArrowUpRight, Leaf, Trash2, UserMinus, Users, Utensils } from "lucide-react";
import Link from "next/link";
import { HeadcountCard } from "@/components/admin/HeadcountCard";
import { StatCard } from "@/components/admin/StatCard";
import { WasteTrendChart } from "@/components/charts/waste-charts";
import { Card, CardHeader } from "@/components/ui/Card";
import { MEAL_LABEL, MEAL_TYPES } from "@/lib/constants";
import { todayIso } from "@/lib/date";
import { getHeadcount } from "@/server/services/headcount";
import { getMenusForDate } from "@/server/services/menu";
import { getWasteAnalytics, getWasteDaySummary } from "@/server/services/waste";

export const dynamic = "force-dynamic";
export const metadata = { title: "Dashboard" };

function changeText(pct: number | null, unit: string) {
  if (pct == null) return "No earlier data to compare";
  return `${Math.abs(pct).toFixed(0)}% ${pct <= 0 ? "lower" : "higher"} than the previous ${unit}`;
}

export default async function AdminDashboardPage() {
  const iso = todayIso();
  const [headcount, week, trend, menus, wasteToday] = await Promise.all([
    getHeadcount(iso),
    getWasteAnalytics(iso, 7),
    getWasteAnalytics(iso, 14),
    getMenusForDate(iso),
    getWasteDaySummary(iso),
  ]);

  const expected = headcount.meals.reduce((s, m) => s + m.predicted, 0);
  const skipped = headcount.meals.reduce((s, m) => s + m.skipping, 0);
  const lunch = headcount.meals.find((m) => m.meal === "LUNCH");
  const improving = trend.changePct != null && trend.changePct <= 0;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Overview</h2>
        <p className="text-sm text-muted">Today’s mess at a glance.</p>
      </div>

      <section aria-label="Key numbers" className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-5">
        <StatCard tone="orange" icon={Users} label="Mess members" value={String(headcount.totalStudents)} hint="Registered students" />
        <StatCard tone="blue" icon={Utensils} label="Meals expected today" value={String(expected)} hint={lunch ? `Lunch ~${lunch.predicted}` : undefined} />
        <StatCard tone="yellow" icon={UserMinus} label="Meals skipped" value={String(skipped)} hint="Food you don’t need to cook" />
        <StatCard tone="pink" icon={Trash2} label="Waste today" value={`${wasteToday.kg.toFixed(1)} kg`} hint={`${wasteToday.meals} of 3 meals logged`} />
        <StatCard tone="green" icon={Leaf} label="Avg waste / day" value={`${week.avgPerDay.toFixed(1)} kg`} hint={changeText(week.changePct, "7 days")} />
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <HeadcountCard meals={headcount.meals} totalStudents={headcount.totalStudents} />
        </div>

        <Card>
          <CardHeader
            title="Today’s menu"
            action={
              <Link href="/admin/menu" className="text-sm font-medium text-primary hover:underline">
                Edit
              </Link>
            }
          />
          <div className="space-y-5">
            {MEAL_TYPES.map((m) => {
              const menu = menus[m];
              return (
                <div key={m}>
                  <h4 className="mb-2 text-sm font-medium">{MEAL_LABEL[m]}</h4>
                  {menu ? (
                    <div className="flex flex-wrap gap-2">
                      {menu.items.map((item) => (
                        <span key={item} className="rounded-full bg-primary/10 px-3 py-1 text-xs">
                          {item}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted">No menu published yet.</p>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader title="Waste by meal" subtitle="Last 14 days, in kg" />
          <WasteTrendChart data={trend.daily} />
        </Card>

        <div className="relative overflow-hidden rounded-card bg-gradient-to-br from-violet-500 via-fuchsia-500 to-pink-500 p-6 text-white shadow-soft">
          <span className="pointer-events-none absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-white/15" />
          <p className="text-sm text-white/80">Total waste, last 14 days</p>
          <p className="mt-1 text-4xl font-semibold">{trend.totalKg.toFixed(1)} kg</p>
          <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-sm">
            {improving ? <ArrowDownRight size={16} /> : <ArrowUpRight size={16} />}
            {changeText(trend.changePct, "14 days")}
          </div>
          <dl className="mt-8 grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-white/70">Avg per day</dt>
              <dd className="text-lg font-semibold">{trend.avgPerDay.toFixed(1)} kg</dd>
            </div>
            <div>
              <dt className="text-white/70">Waste vs prepared</dt>
              <dd className="text-lg font-semibold">{trend.wastePct == null ? "n/a" : `${trend.wastePct.toFixed(1)}%`}</dd>
            </div>
          </dl>
        </div>
      </section>
    </div>
  );
}
