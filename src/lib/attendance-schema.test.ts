import { describe, expect, it } from "vitest";
import { attendanceSchema } from "./attendance-schema";

describe("attendanceSchema", () => {
  it("accepts a valid request", () => {
    expect(attendanceSchema.safeParse({ date: "2026-11-20", mealType: "LUNCH", status: "GOING" }).success).toBe(true);
  });
  it("rejects an unknown status", () => {
    expect(attendanceSchema.safeParse({ date: "2026-11-20", mealType: "LUNCH", status: "MAYBE" }).success).toBe(false);
  });
});
