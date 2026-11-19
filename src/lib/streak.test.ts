import { describe, expect, it } from "vitest";
import { computeStreak } from "./streak";

const TODAY = "2026-11-20";

describe("computeStreak", () => {
  it("counts consecutive complete days ending today", () => {
    expect(computeStreak(new Set(["2026-11-18", "2026-11-19", "2026-11-20"]), TODAY)).toBe(3);
  });
  it("carries over from yesterday when today is not finished", () => {
    expect(computeStreak(new Set(["2026-11-18", "2026-11-19"]), TODAY)).toBe(2);
  });
  it("breaks on a gap", () => {
    expect(computeStreak(new Set(["2026-11-17", "2026-11-19", "2026-11-20"]), TODAY)).toBe(2);
  });
  it("returns 0 with no complete days", () => {
    expect(computeStreak(new Set(), TODAY)).toBe(0);
  });
});
