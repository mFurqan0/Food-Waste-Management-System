import { db } from "@/server/db";
import { MEAL_TYPES, type Meal } from "@/lib/constants";
import { cutoffLabel, isoToDate } from "@/lib/date";
import { isAttendanceOpen } from "@/lib/time";

// Used when nobody has responded yet for a meal.
const DEFAULT_GOING_RATE = 0.8;

export type MealHeadcount = {
  meal: Meal;
  going: number;
  skipping: number;
  pending: number;
  predicted: number;
  startsAt: string;
  endsAt: string;
  cutoff: string;
  open: boolean;
};

/**
 * Prediction = confirmed "going" + pending students * the going-rate among those who responded.
 * Example: 30 going, 10 skipping, 10 pending => rate 0.75 => predicted 30 + round(7.5) = 38.
 */
export async function getHeadcount(iso: string) {
  const date = isoToDate(iso);
  const [totalStudents, grouped, settings] = await Promise.all([
    db.user.count({ where: { role: "STUDENT" } }),
    db.mealAttendance.groupBy({
      by: ["mealType", "status"],
      where: { date },
      _count: { _all: true },
    }),
    db.mealSetting.findMany(),
  ]);

  const settingBy = new Map(settings.map((s) => [s.mealType, s]));
  const count = (meal: Meal, status: "GOING" | "SKIPPING") =>
    grouped.find((g) => g.mealType === meal && g.status === status)?._count._all ?? 0;

  const now = new Date();
  const meals: MealHeadcount[] = MEAL_TYPES.map((meal) => {
    const s = settingBy.get(meal) ?? { startsAt: "00:00", endsAt: "00:00", cutoffMinutes: 0 };
    const going = count(meal, "GOING");
    const skipping = count(meal, "SKIPPING");
    const responded = going + skipping;
    const pending = Math.max(totalStudents - responded, 0);
    const rate = responded > 0 ? going / responded : DEFAULT_GOING_RATE;
    const predicted = Math.min(totalStudents, going + Math.round(pending * rate));
    return {
      meal,
      going,
      skipping,
      pending,
      predicted,
      startsAt: s.startsAt,
      endsAt: s.endsAt,
      cutoff: cutoffLabel(s.startsAt, s.cutoffMinutes),
      open: isAttendanceOpen(now, iso, s.startsAt, s.cutoffMinutes),
    };
  });

  return { totalStudents, meals };
}
