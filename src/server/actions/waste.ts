"use server";

import { revalidatePath } from "next/cache";
import type { ActionState } from "@/lib/action-state";
import { MEAL_LABEL } from "@/lib/constants";
import { flattenErrors, wasteSchema } from "@/lib/validators";
import { deleteWaste, upsertWaste } from "@/server/services/waste";

function refresh() {
  revalidatePath("/admin");
  revalidatePath("/admin/waste");
  revalidatePath("/admin/analytics");
}

// TODO (Phase 5): verify the session has role ADMIN before writing.
export async function saveWasteAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = wasteSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { ok: false, message: "Please fix the highlighted fields.", errors: flattenErrors(parsed.error) };
  }
  try {
    await upsertWaste(parsed.data);
  } catch (error) {
    console.error(error);
    return { ok: false, message: "Could not save the waste log. Please try again." };
  }
  refresh();
  const { mealType, wasteKg } = parsed.data;
  return { ok: true, message: `${MEAL_LABEL[mealType]} waste saved: ${wasteKg} kg.` };
}

export async function deleteWasteAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await deleteWaste(id);
  refresh();
}
