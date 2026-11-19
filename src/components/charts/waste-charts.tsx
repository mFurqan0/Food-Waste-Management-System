"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { MEAL_COLOR, MEAL_LABEL, MEAL_TYPES, type Meal } from "@/lib/constants";
import type { DailyWaste } from "@/lib/types";

const tooltipProps = {
  contentStyle: {
    background: "hsl(var(--surface))",
    border: "1px solid hsl(var(--border))",
    borderRadius: 12,
    fontSize: 12,
  },
  labelStyle: { color: "hsl(var(--foreground))", fontWeight: 600 },
  itemStyle: { color: "hsl(var(--foreground))" },
} as const;

const axisTick = { fill: "currentColor", fontSize: 11 };

function Legend() {
  return (
    <div className="mb-3 flex flex-wrap gap-4 text-xs text-muted">
      {MEAL_TYPES.map((m) => (
        <span key={m} className="flex items-center gap-1.5">
          <i className="h-2.5 w-2.5 rounded-full" style={{ background: MEAL_COLOR[m] }} />
          {MEAL_LABEL[m]}
        </span>
      ))}
    </div>
  );
}

export function WasteTrendChart({ data }: { data: DailyWaste[] }) {
  return (
    <div>
      <Legend />
      <div className="h-72 w-full text-muted">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
            <defs>
              {MEAL_TYPES.map((m) => (
                <linearGradient key={m} id={`fill-${m}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={MEAL_COLOR[m]} stopOpacity={0.45} />
                  <stop offset="95%" stopColor={MEAL_COLOR[m]} stopOpacity={0.03} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid stroke="currentColor" strokeOpacity={0.12} vertical={false} />
            <XAxis dataKey="label" tick={axisTick} tickLine={false} axisLine={false} minTickGap={24} />
            <YAxis tick={axisTick} tickLine={false} axisLine={false} unit=" kg" width={56} />
            <Tooltip {...tooltipProps} formatter={(v: number, name: string) => [`${v} kg`, name]} />
            {MEAL_TYPES.map((m) => (
              <Area
                key={m}
                type="monotone"
                dataKey={m}
                name={MEAL_LABEL[m]}
                stackId="waste"
                stroke={MEAL_COLOR[m]}
                strokeWidth={2}
                fill={`url(#fill-${m})`}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function WasteByMealChart({ byMeal }: { byMeal: Record<Meal, number> }) {
  const total = MEAL_TYPES.reduce((sum, m) => sum + byMeal[m], 0);
  if (total === 0) {
    return <p className="py-16 text-center text-sm text-muted">No waste logged in this period.</p>;
  }
  const data = MEAL_TYPES.map((m) => ({ meal: m, name: MEAL_LABEL[m], value: byMeal[m] }));

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row">
      <div className="relative h-48 w-48 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" innerRadius={58} outerRadius={88} paddingAngle={3} cornerRadius={6} stroke="none">
              {data.map((d) => (
                <Cell key={d.meal} fill={MEAL_COLOR[d.meal]} />
              ))}
            </Pie>
            <Tooltip {...tooltipProps} formatter={(v: number, name: string) => [`${v} kg`, name]} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-semibold">{total.toFixed(1)}</span>
          <span className="text-xs text-muted">kg total</span>
        </div>
      </div>

      <ul className="w-full space-y-3 text-sm">
        {data.map((d) => (
          <li key={d.meal} className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2">
              <i className="h-2.5 w-2.5 rounded-full" style={{ background: MEAL_COLOR[d.meal] }} />
              {d.name}
            </span>
            <span className="text-muted">
              <span className="font-medium text-foreground">{d.value.toFixed(1)} kg</span> · {((d.value / total) * 100).toFixed(0)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function DailyWasteBarChart({ data }: { data: DailyWaste[] }) {
  return (
    <div className="h-64 w-full text-muted">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
          <CartesianGrid stroke="currentColor" strokeOpacity={0.12} vertical={false} />
          <XAxis dataKey="label" tick={axisTick} tickLine={false} axisLine={false} minTickGap={24} />
          <YAxis tick={axisTick} tickLine={false} axisLine={false} unit=" kg" width={56} />
          <Tooltip {...tooltipProps} cursor={{ fill: "currentColor", fillOpacity: 0.06 }} formatter={(v: number) => [`${v} kg`, "Total waste"]} />
          <Bar dataKey="total" fill="#8b5cf6" radius={[8, 8, 0, 0]} maxBarSize={36} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
