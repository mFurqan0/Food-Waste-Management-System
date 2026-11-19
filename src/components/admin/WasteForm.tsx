"use client";

import { useEffect, useRef } from "react";
import { useFormState } from "react-dom";
import { Card, CardHeader } from "@/components/ui/Card";
import { Field, inputClass } from "@/components/ui/Field";
import { FormMessage } from "@/components/ui/FormMessage";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { MEAL_LABEL, MEAL_TYPES } from "@/lib/constants";
import { saveWasteAction } from "@/server/actions/waste";

export function WasteForm({ today }: { today: string }) {
  const [state, action] = useFormState(saveWasteAction, null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.ok) formRef.current?.reset();
  }, [state]);

  return (
    <Card>
      <CardHeader title="Log food waste" subtitle="Saving the same date and meal again updates the entry." />
      <form ref={formRef} action={action} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Date" error={state?.errors?.date}>
            <input type="date" name="date" defaultValue={today} max={today} required className={inputClass} />
          </Field>
          <Field label="Meal" error={state?.errors?.mealType}>
            <select name="mealType" defaultValue="LUNCH" className={inputClass}>
              {MEAL_TYPES.map((m) => (
                <option key={m} value={m}>
                  {MEAL_LABEL[m]}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Waste (kg)" error={state?.errors?.wasteKg}>
            <input type="number" name="wasteKg" step="0.1" min="0" inputMode="decimal" required placeholder="0.0" className={inputClass} />
          </Field>
          <Field label="Prepared (kg)" hint="Optional" error={state?.errors?.preparedKg}>
            <input type="number" name="preparedKg" step="0.1" min="0" inputMode="decimal" placeholder="0.0" className={inputClass} />
          </Field>
        </div>

        <Field label="Notes (optional)" error={state?.errors?.notes}>
          <input name="notes" placeholder="e.g. Rice over-cooked" className={inputClass} />
        </Field>

        <div className="flex items-center justify-between gap-3">
          <FormMessage state={state} />
          <SubmitButton>Save waste</SubmitButton>
        </div>
      </form>
    </Card>
  );
}
