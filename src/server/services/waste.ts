import { db } from "@/server/db";
import type { Meal } from "@/lib/constants";
import { addDaysIso, dateToIso, formatShort, isoToDate } from "@/lib/date";
import type { DailyWaste } from "@/lib/types";

const r2 = (n: number) => Math.round(n * 100) / 100;

export async function upsertWaste(input: {
  date: string;
  mealType: Meal;
  wasteKg: number;
  preparedKg?: number;
  notes?: string;
}) {
  const date = isoToDate(input.date);
  const data = { wasteKg: input.wasteKg, preparedKg: input.preparedKg ?? null, notes: input.notes ?? null };
  await db.wasteLog.upsert({
    where: { date_mealType: { date, mealType: input.mealType } },
    update: data,
    create: { date, mealType: input.mealType, ...data },
  });
}

export async function deleteWaste(id: string) {
  await db.wasteLog.deleteMany({ where: { id } });
}

export type WasteRow = {
  id: string;
  iso: string;
  meal: Meal;
  wasteKg: number;
  preparedKg: number | null;
  wastePct: number | null;
  notes: string;
};

export async function listRecentWaste(limit = 12): Promise<WasteRow[]> {
  const rows = await db.wasteLog.findMany({
    orderBy: [{ date: "desc" }, { mealType: "asc" }],
    take: limit,
  });
  return rows.map((r) => {
    const wasteKg = Number(r.wasteKg);
    const preparedKg = r.preparedKg == null ? null : Number(r.preparedKg);
    return {
      id: r.id,
      iso: dateToIso(r.date),
      meal: r.mealType,
      wasteKg,
      preparedKg,
      wastePct: preparedKg && preparedKg > 0 ? (wasteKg / preparedKg) * 100 : null,
      notes: r.notes ?? "",
    };
  });
}

export async function getWasteDaySummary(iso: string) {
  const agg = await db.wasteLog.aggregate({
    where: { date: isoToDate(iso) },
    _sum: { wasteKg: true },
    _count: { _all: true },
  });
  return { kg: Number(agg._sum.wasteKg ?? 0), meals: agg._count._all };
}

/** Analytics for the `days` days ending at `endIso`, compared with the `days` days before that. */
export async function getWasteAnalytics(endIso: string, days: number) {
  const startIso = addDaysIso(endIso, -(days - 1));
  const prevStartIso = addDaysIso(startIso, -days);
  const prevEndIso = addDaysIso(startIso, -1);

  const [logs, prev] = await Promise.all([
    db.wasteLog.findMany({
      where: { date: { gte: isoToDate(startIso), lte: isoToDate(endIso) } },
      orderBy: { date: "asc" },
    }),
    db.wasteLog.aggregate({
      where: { date: { gte: isoToDate(prevStartIso), lte: isoToDate(prevEndIso) } },
      _sum: { wasteKg: true },
    }),
  ]);

  const byDay = new Map<string, DailyWaste>();
  for (let i = 0; i < days; i++) {
    const iso = addDaysIso(startIso, i);
    byDay.set(iso, { iso, label: formatShort(iso), total: 0, BREAKFAST: 0, LUNCH: 0, DINNER: 0 });
  }

  const byMeal: Record<Meal, number> = { BREAKFAST: 0, LUNCH: 0, DINNER: 0 };
  let totalKg = 0;
  let wasteWithPrepared = 0;
  let prepared = 0;

  for (const log of logs) {
    const row = byDay.get(dateToIso(log.date));
    if (!row) continue;
    const kg = Number(log.wasteKg);
    row[log.mealType] += kg;
    row.total += kg;
    byMeal[log.mealType] += kg;
    totalKg += kg;
    if (log.preparedKg != null) {
      wasteWithPrepared += kg;
      prepared += Number(log.preparedKg);
    }
  }

  const daily = [...byDay.values()].map((d) => ({
    ...d,
    total: r2(d.total),
    BREAKFAST: r2(d.BREAKFAST),
    LUNCH: r2(d.LUNCH),
    DINNER: r2(d.DINNER),
  }));

  const prevKg = Number(prev._sum.wasteKg ?? 0);
  return {
    daily,
    byMeal: { BREAKFAST: r2(byMeal.BREAKFAST), LUNCH: r2(byMeal.LUNCH), DINNER: r2(byMeal.DINNER) },
    totalKg: r2(totalKg),
    avgPerDay: r2(totalKg / days),
    prevKg: r2(prevKg),
    changePct: prevKg > 0 ? ((totalKg - prevKg) / prevKg) * 100 : null,
    wastePct: prepared > 0 ? (wasteWithPrepared / prepared) * 100 : null,
  };
}
