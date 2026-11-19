// Client-safe meal constants (do not import enums from @prisma/client in client components).
export const MEAL_TYPES = ["BREAKFAST", "LUNCH", "DINNER"] as const;
export type Meal = (typeof MEAL_TYPES)[number];

export const MEAL_LABEL: Record<Meal, string> = {
  BREAKFAST: "Breakfast",
  LUNCH: "Lunch",
  DINNER: "Dinner",
};

export const MEAL_COLOR: Record<Meal, string> = {
  BREAKFAST: "#f59e0b",
  LUNCH: "#8b5cf6",
  DINNER: "#ec4899",
};
