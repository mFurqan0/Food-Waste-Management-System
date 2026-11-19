"use client";

import { useFormState } from "react-dom";
import { Field, inputClass } from "@/components/ui/Field";
import { FormMessage } from "@/components/ui/FormMessage";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { loginAction } from "@/server/actions/auth";

export function LoginForm() {
  const [state, action] = useFormState(loginAction, null);

  return (
    <form action={action} className="space-y-4">
      <Field label="Email" error={state?.errors?.email}>
        <input type="email" name="email" autoComplete="email" required placeholder="you@mess.local" className={inputClass} />
      </Field>
      <Field label="Password" error={state?.errors?.password}>
        <input type="password" name="password" autoComplete="current-password" required className={inputClass} />
      </Field>
      <div className="space-y-3">
        <FormMessage state={state} />
        <SubmitButton pendingText="Signing in…">Sign in</SubmitButton>
      </div>
    </form>
  );
}
