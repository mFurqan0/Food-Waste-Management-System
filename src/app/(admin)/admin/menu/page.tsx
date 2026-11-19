import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { MenuEditor } from "@/components/admin/MenuEditor";
import { inputClass } from "@/components/ui/Field";
import { MEAL_TYPES } from "@/lib/constants";
import { addDaysIso, cutoffLabel, formatLong, parseIsoOr, todayIso } from "@/lib/date";
import { getMealSettings, getMenusForDate } from "@/server/services/menu";

export const dynamic = "force-dynamic";
export const metadata = { title: "Daily Menu" };

export default async function MenuPage({ searchParams }: { searchParams: { date?: string } }) {
  const today = todayIso();
  const iso = parseIsoOr(searchParams.date, today);
  const [menus, settings] = await Promise.all([getMenusForDate(iso), getMealSettings()]);

  const navBtn = "flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface hover:bg-primary/10";

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Daily menu</h2>
          <p className="text-sm text-muted">{formatLong(iso)}{iso === today ? " · today" : ""}</p>
        </div>

        <div className="flex items-center gap-2">
          <Link href={`/admin/menu?date=${addDaysIso(iso, -1)}`} className={navBtn} aria-label="Previous day">
            <ChevronLeft size={18} />
          </Link>
          <form method="get" className="flex items-center gap-2">
            <input type="date" name="date" defaultValue={iso} className={`${inputClass} w-auto`} aria-label="Pick a date" />
            <button className="rounded-xl border border-border bg-surface px-3 py-2.5 text-sm hover:bg-primary/10">Go</button>
          </form>
          <Link href={`/admin/menu?date=${addDaysIso(iso, 1)}`} className={navBtn} aria-label="Next day">
            <ChevronRight size={18} />
          </Link>
          {iso !== today ? (
            <Link href="/admin/menu" className="px-2 text-sm font-medium text-primary hover:underline">
              Today
            </Link>
          ) : null}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {MEAL_TYPES.map((meal) => {
          const s = settings[meal];
          const menu = menus[meal];
          return (
            <MenuEditor
              key={`${iso}-${meal}`}
              date={iso}
              meal={meal}
              items={menu?.items ?? []}
              notes={menu?.notes ?? ""}
              windowLabel={`${s.startsAt}–${s.endsAt} · attendance closes ${cutoffLabel(s.startsAt, s.cutoffMinutes)}`}
            />
          );
        })}
      </div>
    </div>
  );
}
