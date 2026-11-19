import type { ActionState } from "@/lib/action-state";
import { cn } from "@/lib/cn";

export function FormMessage({ state }: { state: ActionState }) {
  return (
    <p aria-live="polite" className={cn("min-h-5 text-sm", state?.ok ? "text-success" : "text-danger")}>
      {state?.message ?? ""}
    </p>
  );
}
