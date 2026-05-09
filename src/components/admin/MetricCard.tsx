import type { LucideIcon } from "lucide-react";

interface MetricCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon?: LucideIcon;
  trend?: "up" | "down" | "neutral";
  color?: "default" | "green" | "red" | "yellow" | "blue";
}

const colorMap = {
  default: "text-white",
  green:   "text-emerald-400",
  red:     "text-red-400",
  yellow:  "text-amber-400",
  blue:    "text-blue-400",
};

export function MetricCard({ label, value, sub, icon: Icon, color = "default" }: MetricCardProps) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-white/35">{label}</p>
        {Icon && <Icon className="h-4 w-4 shrink-0 text-white/20" />}
      </div>
      <p className={`mt-2 font-display text-3xl font-bold ${colorMap[color]}`}>{value}</p>
      {sub && <p className="mt-1 text-[11px] text-white/30">{sub}</p>}
    </div>
  );
}
