import { describe, expect, it } from "vitest";
import { menuSchema, wasteSchema } from "./validators";

describe("menuSchema", () => {
  it("splits lines into trimmed items and drops blanks", () => {
    const r = menuSchema.parse({ date: "2026-11-20", mealType: "LUNCH", items: " Rice \n\nKarahi\n", notes: "" });
    expect(r.items).toEqual(["Rice", "Karahi"]);
    expect(r.notes).toBeUndefined();
  });
  it("rejects more than 12 items", () => {
    const items = Array.from({ length: 13 }, (_, i) => `Item ${i}`).join("\n");
    expect(menuSchema.safeParse({ date: "2026-11-20", mealType: "LUNCH", items }).success).toBe(false);
  });
});

describe("wasteSchema", () => {
  const base = { date: "2026-11-20", mealType: "DINNER", notes: "" };
  it("requires waste kg", () => {
    expect(wasteSchema.safeParse({ ...base, wasteKg: "", preparedKg: "" }).success).toBe(false);
  });
  it("accepts waste without prepared", () => {
    const r = wasteSchema.parse({ ...base, wasteKg: "4.5", preparedKg: "" });
    expect(r.wasteKg).toBe(4.5);
    expect(r.preparedKg).toBeUndefined();
  });
  it("rejects prepared lower than waste", () => {
    expect(wasteSchema.safeParse({ ...base, wasteKg: "10", preparedKg: "5" }).success).toBe(false);
  });
});
