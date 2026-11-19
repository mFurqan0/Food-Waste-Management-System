import type { LucideIcon } from "lucide-react";

export type Tone = "orange" | "blue" | "yellow" | "pink" | "green";

const tones: Record<Tone, { card: string; icon: string }> = {
  orange: { card: "bg-orange-100 dark:bg-orange-500/15", icon: "bg-orange-400" },
  blue: { card: "bg-sky-100 dark:bg-sky-500/15", icon: "bg-sky-500" },
  yellow: { card: "bg-amber-100 dark:bg-amber-500/15", icon: "bg-amber-400" },
  pink: { card: "bg-rose-100 dark:bg-rose-500/15", icon: "bg-rose-500" },
  green: { card: "bg-emerald-100 dark:bg-emerald-500/15", icon: "bg-emerald-500" },
};

export function StatCard({
  label,
  value,
  hint,
  tone,
  icon: Icon,
}: {
  label: string;
  value: string;
  hint?: string;
  tone: Tone;
  icon: LucideIcon;
}) {
  const t = tones[tone];
  return (
    <div className={`relative overflow-hidden rounded-card p-5 ${t.card}`}>
      <span className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/50 dark:bg-white/5" />
      <span className={`flex h-10 w-10 items-center justify-center rounded-full text-white ${t.icon}`}>
        <Icon size={20} />
      </span>
      <p className="mt-4 text-sm text-muted">{label}</p>
      <p className="mt-0.5 text-2xl font-semibold tracking-tight">{value}</p>
      {hint ? <p className="mt-1 text-xs text-muted">{hint}</p> : null}
    </div>
  );
}
