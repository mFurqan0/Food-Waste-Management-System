"use server";

import { revalidatePath } from "next/cache";
import type { ActionState } from "@/lib/action-state";
import { MEAL_LABEL } from "@/lib/constants";
import { flattenErrors, menuSchema } from "@/lib/validators";
import { upsertMenu } from "@/server/services/menu";

// TODO (Phase 5): verify the session has role ADMIN before writing.
export async function saveMenuAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = menuSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { ok: false, message: "Please fix the highlighted fields.", errors: flattenErrors(parsed.error) };
  }
  try {
    await upsertMenu(parsed.data);
  } catch (error) {
    console.error(error);
    return { ok: false, message: "Could not save the menu. Please try again." };
  }
  revalidatePath("/admin");
  revalidatePath("/admin/menu");
  const label = MEAL_LABEL[parsed.data.mealType];
  return { ok: true, message: parsed.data.items.length ? `${label} menu saved.` : `${label} menu cleared.` };
}
