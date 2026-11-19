import { z } from "zod";
import { MEAL_TYPES } from "./constants";

const iso = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a valid date");
const meal = z.enum(MEAL_TYPES, { errorMap: () => ({ message: "Pick a meal" }) });
const emptyToUndefined = (v: unknown) => (v === "" || v == null ? undefined : v);
const optionalText = z
  .string()
  .max(200, "Max 200 characters")
  .optional()
  .transform((v) => v?.trim() || undefined);

export const menuSchema = z.object({
  date: iso,
  mealType: meal,
  items: z
    .string()
    .transform((s) =>
      s
        .split("\n")
        .map((x) => x.trim())
        .filter(Boolean),
    )
    .pipe(z.array(z.string().max(60, "Keep each item under 60 characters")).max(12, "Max 12 items")),
  notes: optionalText,
});

export const wasteSchema = z
  .object({
    date: iso,
    mealType: meal,
    wasteKg: z.preprocess(
      emptyToUndefined,
      z
        .coerce.number({ required_error: "Enter the waste in kg", invalid_type_error: "Enter a number" })
        .min(0, "Must be 0 or more")
        .max(9999, "That looks too large"),
    ),
    preparedKg: z.preprocess(
      emptyToUndefined,
      z.coerce.number({ invalid_type_error: "Enter a number" }).min(0, "Must be 0 or more").max(9999).optional(),
    ),
    notes: optionalText,
  })
  .refine((d) => d.preparedKg == null || d.preparedKg >= d.wasteKg, {
    message: "Prepared food can't be less than the waste",
    path: ["preparedKg"],
  });

export function flattenErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
