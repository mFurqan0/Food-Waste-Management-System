import { describe, expect, it } from "vitest";
import { addDaysIso, cutoffLabel, parseIsoOr } from "./date";

describe("date helpers", () => {
  it("computes the attendance cutoff time", () => {
    expect(cutoffLabel("12:30", 90)).toBe("11:00");
    expect(cutoffLabel("07:30", 120)).toBe("05:30");
  });
  it("adds days across month boundaries", () => {
    expect(addDaysIso("2026-11-30", 1)).toBe("2026-12-01");
    expect(addDaysIso("2026-03-01", -1)).toBe("2026-02-28");
  });
  it("falls back when the date param is invalid", () => {
    expect(parseIsoOr("nope", "2026-11-20")).toBe("2026-11-20");
    expect(parseIsoOr("2026-11-19", "2026-11-20")).toBe("2026-11-19");
  });
});
