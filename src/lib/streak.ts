import { addDaysIso } from "./date";

/**
 * Counts days in a row, ending today, where every meal was answered.
 * If today is not finished yet, the streak carries over from yesterday.
 */
export function computeStreak(completeDays: Set<string>, today: string): number {
  let day = completeDays.has(today) ? today : addDaysIso(today, -1);
  let count = 0;
  while (completeDays.has(day)) {
    count++;
    day = addDaysIso(day, -1);
  }
  return count;
}
