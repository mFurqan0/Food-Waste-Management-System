function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-white/70">{label}</dt>
      <dd className="text-lg font-semibold">{value}</dd>
    </div>
  );
}

export function ImpactCard({
  skipped,
  going,
  kgSaved,
  points,
}: {
  skipped: number;
  going: number;
  kgSaved: number;
  points: number;
}) {
  return (
    <section
      id="impact"
      aria-label="Your impact this week"
      className="relative scroll-mt-24 overflow-hidden rounded-card bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 p-6 text-white shadow-soft"
    >
      <span className="pointer-events-none absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-white/15" />
      <p className="text-sm text-white/80">Your impact, last 7 days</p>
      <p className="mt-1 text-4xl font-semibold">{kgSaved.toFixed(1)} kg</p>
      <p className="text-sm text-white/80">estimated food saved</p>
      <dl className="mt-6 grid grid-cols-3 gap-3 text-sm">
        <Stat label="Skipped" value={String(skipped)} />
        <Stat label="Eaten" value={String(going)} />
        <Stat label="Points" value={String(points)} />
      </dl>
    </section>
  );
}
