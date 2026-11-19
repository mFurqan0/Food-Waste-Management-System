import type { Meal } from "./constants";

export type DailyWaste = {
  iso: string;
  label: string;
  total: number;
} & Record<Meal, number>;
