import { z } from "zod";
import { MEAL_TYPES } from "./constants";
import { ISO_DATE } from "./date";

export const attendanceSchema = z.object({
  date: z.string().regex(ISO_DATE, "Invalid date"),
  mealType: z.enum(MEAL_TYPES),
  status: z.enum(["GOING", "SKIPPING"]),
});

export type AttendanceInput = z.infer<typeof attendanceSchema>;
