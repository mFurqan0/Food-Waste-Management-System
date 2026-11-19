import { MESS_TZ } from "./time";

// All "day" values in the app are ISO strings (YYYY-MM-DD) in the mess timezone.
// They are stored in @db.Date columns as UTC midnight.
export const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export function todayIso(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: MESS_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export function parseIsoOr(value: string | undefined, fallback: string): string {
  return value && ISO_DATE.test(value) && !Number.isNaN(Date.parse(value)) ? value : fallback;
}

export const isoToDate = (iso: string): Date => new Date(`${iso}T00:00:00.000Z`);
export const dateToIso = (d: Date): string => d.toISOString().slice(0, 10);

export function addDaysIso(iso: string, days: number): string {
  const d = isoToDate(iso);
  d.setUTCDate(d.getUTCDate() + days);
  return dateToIso(d);
}

export function formatLong(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  }).format(isoToDate(iso));
}

export function formatShort(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", timeZone: "UTC" }).format(isoToDate(iso));
}

const pad = (n: number) => String(n).padStart(2, "0");

/** "12:30" minus 90 minutes => "11:00" */
export function cutoffLabel(startsAt: string, cutoffMinutes: number): string {
  const [h, m] = startsAt.split(":").map(Number);
  const total = h * 60 + m - cutoffMinutes;
  const t = ((total % 1440) + 1440) % 1440;
  return `${pad(Math.floor(t / 60))}:${pad(t % 60)}`;
}
