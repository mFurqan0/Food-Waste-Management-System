import { describe, expect, it } from "vitest";
import { isAttendanceOpen } from "./time";

describe("isAttendanceOpen", () => {
  it("is open before the cutoff", () => {
    // Lunch 12:30, cutoff 90 min => closes 11:00 local
    expect(isAttendanceOpen(new Date("2026-11-19T10:59:00+05:00"), "2026-11-19", "12:30", 90)).toBe(true);
  });
  it("is closed at and after the cutoff", () => {
    expect(isAttendanceOpen(new Date("2026-11-19T11:00:00+05:00"), "2026-11-19", "12:30", 90)).toBe(false);
    expect(isAttendanceOpen(new Date("2026-11-19T11:30:00+05:00"), "2026-11-19", "12:30", 90)).toBe(false);
  });
});
