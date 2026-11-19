// Meal cutoff logic lives here so it is unit-testable and timezone-aware.
export const MESS_TZ = process.env.MESS_TIMEZONE ?? "Asia/Karachi";

/** Converts "HH:mm" plus a date into an absolute Date in MESS_TZ. */
export function mealStartAt(dayIso: string, hhmm: string): Date {
  // Offset Asia/Karachi is +05:00 with no DST. Revisit if the timezone changes.
  return new Date(`${dayIso}T${hhmm}:00+05:00`);
}

/** Attendance can be changed only while now is before (start - cutoff). */
export function isAttendanceOpen(now: Date, dayIso: string, startsAt: string, cutoffMinutes: number): boolean {
  const cutoff = new Date(mealStartAt(dayIso, startsAt).getTime() - cutoffMinutes * 60_000);
  return now.getTime() < cutoff.getTime();
}
