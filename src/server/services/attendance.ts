import type { AttendanceStatus } from "@prisma/client";
import { db } from "@/server/db";
import { MEAL_LABEL, MEAL_TYPES, type Meal } from "@/lib/constants";
import { addDaysIso, cutoffLabel, isoToDate, todayIso } from "@/lib/date";
import { isAttendanceOpen } from "@/lib/time";
import { getMealSettings } from "./menu";

export type MealStatus = "GOING" | "SKIPPING" | null;

export async function getAttendanceForDate(userId: string, iso: string): Promise<Record<Meal, MealStatus>> {
  const rows = await db.mealAttendance.findMany({ where: { userId, date: isoToDate(iso) } });
  const result = { BREAKFAST: null, LUNCH: null, DINNER: null } as Record<Meal, MealStatus>;
  for (const meal of MEAL_TYPES) {
    const row = rows.find((r) => r.mealType === meal);
    result[meal] = row?.status ?? null;
  }
  return result;
}

/** Server-side cutoff check. The UI can be bypassed, so this is the real lock. */
export async function setAttendance(
  userId: string,
  iso: string,
  meal: Meal,
  status: AttendanceStatus,
): Promise<{ ok: true } | { ok: false; message: string }> {
  if (iso > addDaysIso(todayIso(), 7)) {
    return { ok: false, message: "You can set meals up to 7 days ahead." };
  }

  const s = (await getMealSettings())[meal];
  if (!isAttendanceOpen(new Date(), iso, s.startsAt, s.cutoffMinutes)) {
    return {
      ok: false,
      message: `${MEAL_LABEL[meal]} is locked. The cutoff was ${cutoffLabel(s.startsAt, s.cutoffMinutes)}.`,
    };
  }

  const date = isoToDate(iso);
  await db.mealAttendance.upsert({
    where: { userId_date_mealType: { userId, date, mealType: meal } },
    update: { status },
    create: { userId, date, mealType: meal, status },
  });
  return { ok: true };
}
