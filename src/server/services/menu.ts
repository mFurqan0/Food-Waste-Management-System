import { db } from "@/server/db";
import { MEAL_TYPES, type Meal } from "@/lib/constants";
import { isoToDate } from "@/lib/date";

export type MenuView = { items: string[]; notes: string } | null;

export async function getMenusForDate(iso: string): Promise<Record<Meal, MenuView>> {
  const rows = await db.dailyMenu.findMany({ where: { date: isoToDate(iso) } });
  const result = { BREAKFAST: null, LUNCH: null, DINNER: null } as Record<Meal, MenuView>;
  for (const meal of MEAL_TYPES) {
    const row = rows.find((r) => r.mealType === meal);
    result[meal] = row ? { items: row.items, notes: row.notes ?? "" } : null;
  }
  return result;
}

export type MealSettingView = { startsAt: string; endsAt: string; cutoffMinutes: number };

export async function getMealSettings(): Promise<Record<Meal, MealSettingView>> {
  const rows = await db.mealSetting.findMany();
  const fallback: MealSettingView = { startsAt: "00:00", endsAt: "00:00", cutoffMinutes: 0 };
  const result = {} as Record<Meal, MealSettingView>;
  for (const meal of MEAL_TYPES) {
    const row = rows.find((r) => r.mealType === meal);
    result[meal] = row
      ? { startsAt: row.startsAt, endsAt: row.endsAt, cutoffMinutes: row.cutoffMinutes }
      : fallback;
  }
  return result;
}

/** Saving an empty item list removes that meal's menu. */
export async function upsertMenu(input: { date: string; mealType: Meal; items: string[]; notes?: string }) {
  const date = isoToDate(input.date);
  if (input.items.length === 0) {
    await db.dailyMenu.deleteMany({ where: { date, mealType: input.mealType } });
    return;
  }
  await db.dailyMenu.upsert({
    where: { date_mealType: { date, mealType: input.mealType } },
    update: { items: input.items, notes: input.notes ?? null },
    create: { date, mealType: input.mealType, items: input.items, notes: input.notes ?? null },
  });
}
