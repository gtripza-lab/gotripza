"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";

const BRAND   = "#5A6CFF";
const EMERALD = "#34d399";
const AMBER   = "#fbbf24";
const RED     = "#f87171";
const GRID    = "rgba(255,255,255,0.04)";
const COLORS  = [BRAND, EMERALD, AMBER, RED, "#a78bfa", "#38bdf8", "#fb923c"];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function Tip({ active, payload, label, prefix = "", suffix = "" }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-white/10 bg-[#0d0d14] px-3 py-2 text-xs text-white/80 shadow-xl">
      {label && <p className="mb-1 text-white/40">{label}</p>}
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      {payload.map((p: any, i: number) => (
        <p key={i} className="font-semibold">{prefix}{typeof p.value === "number" ? p.value.toLocaleString() : p.value}{suffix}</p>
      ))}
    </div>
  );
}

export function AreaChartCard({
  data,
  dataKey,
  label,
  color = BRAND,
  prefix = "",
  suffix = "",
}: {
  data: Record<string, unknown>[];
  dataKey: string;
  label: string;
  color?: string;
  prefix?: string;
  suffix?: string;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5">
      <p className="mb-4 text-[11px] font-medium uppercase tracking-[0.2em] text-white/35">{label}</p>
      <ResponsiveContainer width="100%" height={180}>
        <AreaChart data={data} margin={{ top: 4, right: 0, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id={`grad-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor={color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={GRID} />
          <XAxis dataKey="date" tick={{ fontSize: 9, fill: "rgba(255,255,255,0.25)" }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fontSize: 9, fill: "rgba(255,255,255,0.25)" }} tickLine={false} axisLine={false} />
          <Tooltip content={(p) => <Tip {...p} prefix={prefix} suffix={suffix} />} />
          <Area type="monotone" dataKey={dataKey} stroke={color} fill={`url(#grad-${dataKey})`} strokeWidth={2} dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function BarChartCard({
  data,
  dataKey,
  nameKey,
  label,
  color = BRAND,
  horizontal = false,
  prefix = "",
  suffix = "",
}: {
  data: Record<string, unknown>[];
  dataKey: string;
  nameKey: string;
  label: string;
  color?: string;
  horizontal?: boolean;
  prefix?: string;
  suffix?: string;
}) {
  if (horizontal) {
    return (
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5">
        <p className="mb-4 text-[11px] font-medium uppercase tracking-[0.2em] text-white/35">{label}</p>
        <ResponsiveContainer width="100%" height={Math.max(160, data.length * 36)}>
          <BarChart data={data} layout="vertical" margin={{ top: 0, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={GRID} horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 9, fill: "rgba(255,255,255,0.25)" }} tickLine={false} axisLine={false} />
            <YAxis dataKey={nameKey} type="category" width={90} tick={{ fontSize: 10, fill: "rgba(255,255,255,0.5)" }} tickLine={false} axisLine={false} />
            <Tooltip content={(p) => <Tip {...p} prefix={prefix} suffix={suffix} />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
            <Bar dataKey={dataKey} fill={color} radius={[0, 4, 4, 0]} maxBarSize={18} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5">
      <p className="mb-4 text-[11px] font-medium uppercase tracking-[0.2em] text-white/35">{label}</p>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data} margin={{ top: 4, right: 0, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={GRID} />
          <XAxis dataKey={nameKey} tick={{ fontSize: 9, fill: "rgba(255,255,255,0.25)" }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fontSize: 9, fill: "rgba(255,255,255,0.25)" }} tickLine={false} axisLine={false} />
          <Tooltip content={(p) => <Tip {...p} prefix={prefix} suffix={suffix} />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
          <Bar dataKey={dataKey} fill={color} radius={[4, 4, 0, 0]} maxBarSize={32} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function DonutChart({
  data,
  nameKey,
  valueKey,
  label,
}: {
  data: Record<string, unknown>[];
  nameKey: string;
  valueKey: string;
  label: string;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5">
      <p className="mb-4 text-[11px] font-medium uppercase tracking-[0.2em] text-white/35">{label}</p>
      <div className="flex items-center gap-6">
        <ResponsiveContainer width="50%" height={160}>
          <PieChart>
            <Pie data={data} dataKey={valueKey} nameKey={nameKey} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={2}>
              {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Pie>
            <Tooltip content={(p) => <Tip {...p} />} />
          </PieChart>
        </ResponsiveContainer>
        <ul className="flex-1 space-y-1.5 text-xs">
          {data.map((d, i) => (
            <li key={i} className="flex items-center gap-2 text-white/60">
              <span className="h-2 w-2 rounded-full shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
              <span className="truncate">{String(d[nameKey])}</span>
              <span className="ml-auto font-semibold text-white/80">{String(d[valueKey])}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function LineChartCard({
  data,
  lines,
  nameKey,
  label,
}: {
  data: Record<string, unknown>[];
  lines: { key: string; color?: string }[];
  nameKey: string;
  label: string;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5">
      <p className="mb-4 text-[11px] font-medium uppercase tracking-[0.2em] text-white/35">{label}</p>
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={data} margin={{ top: 4, right: 0, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={GRID} />
          <XAxis dataKey={nameKey} tick={{ fontSize: 9, fill: "rgba(255,255,255,0.25)" }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fontSize: 9, fill: "rgba(255,255,255,0.25)" }} tickLine={false} axisLine={false} />
          <Tooltip content={(p) => <Tip {...p} />} />
          {lines.map((l, i) => (
            <Line key={l.key} type="monotone" dataKey={l.key} stroke={l.color ?? COLORS[i]} dot={false} strokeWidth={2} />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
