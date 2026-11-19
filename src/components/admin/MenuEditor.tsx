"use client";

import { useFormState } from "react-dom";
import { Card } from "@/components/ui/Card";
import { Field, inputClass } from "@/components/ui/Field";
import { FormMessage } from "@/components/ui/FormMessage";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { MEAL_COLOR, MEAL_LABEL, type Meal } from "@/lib/constants";
import { saveMenuAction } from "@/server/actions/menu";

export function MenuEditor({
  date,
  meal,
  items,
  notes,
  windowLabel,
}: {
  date: string;
  meal: Meal;
  items: string[];
  notes: string;
  windowLabel: string;
}) {
  const [state, action] = useFormState(saveMenuAction, null);

  return (
    <Card>
      <form action={action} className="space-y-4">
        <input type="hidden" name="date" value={date} />
        <input type="hidden" name="mealType" value={meal} />

        <div className="flex items-center gap-3">
          <span className="h-9 w-1.5 rounded-full" style={{ background: MEAL_COLOR[meal] }} />
          <div>
            <h3 className="font-semibold">{MEAL_LABEL[meal]}</h3>
            <p className="text-xs text-muted">{windowLabel}</p>
          </div>
        </div>

        <Field label="Menu items" hint="One item per line. Save with no items to clear this meal." error={state?.errors?.items}>
          <textarea
            name="items"
            rows={5}
            defaultValue={items.join("\n")}
            placeholder={"Chicken Karahi\nRice\nSalad"}
            className={inputClass}
          />
        </Field>

        <Field label="Notes (optional)" error={state?.errors?.notes}>
          <input name="notes" defaultValue={notes} placeholder="e.g. Spicy level reduced" className={inputClass} />
        </Field>

        <div className="flex items-center justify-between gap-3">
          <FormMessage state={state} />
          <SubmitButton>Save {MEAL_LABEL[meal].toLowerCase()}</SubmitButton>
        </div>
      </form>
    </Card>
  );
}
