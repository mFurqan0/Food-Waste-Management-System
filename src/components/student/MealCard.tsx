"use client";

import { Check, Lock, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/cn";
import { MEAL_COLOR, MEAL_LABEL, type Meal } from "@/lib/constants";
import { setAttendanceAction } from "@/server/actions/attendance";

type Status = "GOING" | "SKIPPING" | null;

export function MealCard({
  date,
  meal,
  items,
  initialStatus,
  open,
  cutoff,
  windowLabel,
}: {
  date: string;
  meal: Meal;
  items: string[];
  initialStatus: Status;
  open: boolean;
  cutoff: string;
  windowLabel: string;
}) {
  const [status, setStatus] = useState<Status>(initialStatus);
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function choose(next: "GOING" | "SKIPPING") {
    if (!open || pending || status === next) return;
    const previous = status;
    setStatus(next);
    setMessage("");
    setPending(true);
    const res = await setAttendanceAction({ date, mealType: meal, status: next });
    setPending(false);
    if (!res.ok) {
      setStatus(previous);
    }
    setMessage(res.message);
  }

  return (
    <article className="rounded-card border border-border bg-surface p-5 shadow-soft">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="h-10 w-1.5 rounded-full" style={{ background: MEAL_COLOR[meal] }} />
          <div>
            <h2 className="font-semibold">{MEAL_LABEL[meal]}</h2>
            <p className="text-xs text-muted">{windowLabel}</p>
          </div>
        </div>
        <span
          className={cn(
            "rounded-full px-2.5 py-1 text-xs font-medium",
            open ? "bg-success/15 text-success" : "bg-muted/15 text-muted",
          )}
        >
          {open ? `Closes ${cutoff}` : `Locked since ${cutoff}`}
        </span>
      </div>

      {items.length > 0 ? (
        <div className="mb-4 flex flex-wrap gap-2">
          {items.map((item) => (
            <span key={item} className="rounded-full bg-primary/10 px-3 py-1 text-xs">
              {item}
            </span>
          ))}
        </div>
      ) : (
        <p className="mb-4 text-xs text-muted">Menu not published yet.</p>
      )}

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          aria-pressed={status === "GOING"}
          disabled={!open || pending}
          onClick={() => choose("GOING")}
          className={cn(
            "flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50",
            status === "GOING" ? "bg-success text-white" : "border border-border hover:bg-primary/10",
          )}
        >
          <Check size={16} /> Going
        </button>
        <button
          type="button"
          aria-pressed={status === "SKIPPING"}
          disabled={!open || pending}
          onClick={() => choose("SKIPPING")}
          className={cn(
            "flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50",
            status === "SKIPPING" ? "bg-danger text-white" : "border border-border hover:bg-primary/10",
          )}
        >
          <X size={16} /> Skipping
        </button>
      </div>

      <p aria-live="polite" className="mt-3 min-h-5 text-xs text-muted">
        {!open ? (
          <span className="inline-flex items-center gap-1">
            <Lock size={12} /> Changes are closed for this meal.
          </span>
        ) : (
          message
        )}
      </p>
    </article>
  );
}
