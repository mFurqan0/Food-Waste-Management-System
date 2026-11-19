import { db } from "@/server/db";
import { addDaysIso, dateToIso, isoToDate, todayIso } from "@/lib/date";
import { KG_PER_SKIPPED_MEAL, POINTS_PER_SKIPPED_MEAL } from "@/lib/impact";
import { MEAL_TYPES } from "@/lib/constants";
import { computeStreak } from "@/lib/streak";
import { isAttendanceOpen } from "@/lib/time";
import { getMealSettings } from "./menu";

const SETTLE_DAYS = 14;

/**
 * Writes ImpactLog rows for skipped meals whose cutoff has passed.
 * Safe to run on every page load: the unique key prevents duplicates.
 */
export async function settleImpact(userId: string, now = new Date()): Promise<number> {
  const today = todayIso();
  const from = addDaysIso(today, -SETTLE_DAYS);
  const [skips, settings] = await Promise.all([
    db.mealAttendance.findMany({
      where: { userId, status: "SKIPPING", date: { gte: isoToDate(from), lte: isoToDate(today) } },
      select: { date: true, mealType: true },
    }),
    getMealSettings(),
  ]);

  const due = skips
    .filter((r) => {
      const s = settings[r.mealType];
      return !isAttendanceOpen(now, dateToIso(r.date), s.startsAt, s.cutoffMinutes);
    })
    .map((r) => ({
      userId,
      date: r.date,
      mealType: r.mealType,
      points: POINTS_PER_SKIPPED_MEAL,
      kgSaved: KG_PER_SKIPPED_MEAL.toFixed(3),
    }));

  if (due.length === 0) return 0;
  const result = await db.impactLog.createMany({ data: due, skipDuplicates: true });
  return result.count;
}

export async function getImpactSummary(userId: string, endIso: string, days = 7) {
  const range = { gte: isoToDate(addDaysIso(endIso, -(days - 1))), lte: isoToDate(endIso) };
  const [agg, going] = await Promise.all([
    db.impactLog.aggregate({
      where: { userId, date: range },
      _sum: { points: true, kgSaved: true },
      _count: { _all: true },
    }),
    db.mealAttendance.count({ where: { userId, status: "GOING", date: range } }),
  ]);
  return {
    skipped: agg._count._all,
    going,
    points: agg._sum.points ?? 0,
    kgSaved: Math.round(Number(agg._sum.kgSaved ?? 0) * 10) / 10,
  };
}

/** Logging streak: days in a row where every meal was answered. */
export async function getStreak(userId: string, endIso: string): Promise<number> {
  const from = addDaysIso(endIso, -60);
  const counts = await db.mealAttendance.groupBy({
    by: ["date"],
    where: { userId, date: { gte: isoToDate(from), lte: isoToDate(endIso) } },
    _count: { _all: true },
  });
  const complete = new Set(
    counts.filter((c) => c._count._all >= MEAL_TYPES.length).map((c) => dateToIso(c.date)),
  );
  return computeStreak(complete, endIso);
}

export async function getLeaderboard(userId: string, endIso: string, days = 7) {
  const range = { gte: isoToDate(addDaysIso(endIso, -(days - 1))), lte: isoToDate(endIso) };
  const grouped = await db.impactLog.groupBy({
    by: ["userId"],
    where: { date: range },
    _sum: { points: true, kgSaved: true },
    orderBy: { _sum: { points: "desc" } },
  });

  const ranked = grouped.map((g) => ({
    userId: g.userId,
    points: g._sum.points ?? 0,
    kgSaved: Number(g._sum.kgSaved ?? 0),
  }));

  const topIds = ranked.slice(0, 10).map((r) => r.userId);
  const users = await db.user.findMany({
    where: { id: { in: topIds } },
    select: { id: true, name: true, roomNo: true },
  });
  const byId = new Map(users.map((u) => [u.id, u]));

  const top = ranked.slice(0, 10).map((r, i) => ({
    rank: i + 1,
    isMe: r.userId === userId,
    name: byId.get(r.userId)?.name ?? "Student",
    roomNo: byId.get(r.userId)?.roomNo ?? null,
    points: r.points,
    kgSaved: Math.round(r.kgSaved * 10) / 10,
  }));

  const myIndex = ranked.findIndex((r) => r.userId === userId);
  const me = myIndex === -1 ? null : { rank: myIndex + 1, points: ranked[myIndex].points };

  return { top, me };
}
