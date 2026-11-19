import { ImpactCard } from "@/components/student/ImpactCard";
import { Leaderboard } from "@/components/student/Leaderboard";
import { MealCard } from "@/components/student/MealCard";
import { StreakCard } from "@/components/student/StreakCard";
import { MEAL_TYPES, MEAL_LABEL } from "@/lib/constants";
import { cutoffLabel, formatLong, todayIso } from "@/lib/date";
import { isAttendanceOpen } from "@/lib/time";
import { getCurrentStudent } from "@/server/session";
import { getAttendanceForDate } from "@/server/services/attendance";
import { getImpactSummary, getLeaderboard, getStreak, settleImpact } from "@/server/services/impact";
import { getMealSettings, getMenusForDate } from "@/server/services/menu";

export const dynamic = "force-dynamic";
export const metadata = { title: "Today" };

export default async function StudentTodayPage() {
  const student = await getCurrentStudent();
  const iso = todayIso();

  // Settle first so this page's impact numbers include meals whose cutoff just passed.
  await settleImpact(student.id);

  const [menus, settings, attendance, impact, streak, board] = await Promise.all([
    getMenusForDate(iso),
    getMealSettings(),
    getAttendanceForDate(student.id, iso),
    getImpactSummary(student.id, iso),
    getStreak(student.id, iso),
    getLeaderboard(student.id, iso),
  ]);
  const now = new Date();

  return (
    <>
      <section>
        <h1 className="text-2xl font-semibold">Today</h1>
        <p className="text-sm text-muted">{formatLong(iso)}</p>
      </section>

      <section className="space-y-4" aria-label="Meals">
        {MEAL_TYPES.map((meal) => {
          const s = settings[meal];
          const cutoff = cutoffLabel(s.startsAt, s.cutoffMinutes);
          return (
            <MealCard
              key={meal}
              date={iso}
              meal={meal}
              items={menus[meal]?.items ?? []}
              initialStatus={attendance[meal]}
              open={isAttendanceOpen(now, iso, s.startsAt, s.cutoffMinutes)}
              cutoff={cutoff}
              windowLabel={`${MEAL_LABEL[meal]} ${s.startsAt}–${s.endsAt}`}
            />
          );
        })}
      </section>

      <StreakCard days={streak} />

      <ImpactCard
        skipped={impact.skipped}
        going={impact.going}
        kgSaved={impact.kgSaved}
        points={impact.points}
      />

      <Leaderboard rows={board.top} me={board.me} />
    </>
  );
}
