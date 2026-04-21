import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  hint,
  icon,
  accent = "cyan",
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  icon?: ReactNode;
  accent?: "cyan" | "purple" | "amber" | "emerald" | "rose";
}) {
  const accents: Record<string, string> = {
    cyan: "from-cyan-500/20 to-cyan-500/0 text-cyan-300",
    purple: "from-purple-500/20 to-purple-500/0 text-purple-300",
    amber: "from-amber-500/20 to-amber-500/0 text-amber-300",
    emerald: "from-emerald-500/20 to-emerald-500/0 text-emerald-300",
    rose: "from-rose-500/20 to-rose-500/0 text-rose-300",
  };
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-[#0B1220] p-5">
      <div
        className={cn(
          "absolute inset-x-0 top-0 h-24 bg-gradient-to-b opacity-60 pointer-events-none",
          accents[accent],
        )}
      />
      <div className="relative flex items-start justify-between">
        <div>
          <div className="text-xs uppercase tracking-wide text-white/50">{label}</div>
          <div className="mt-1 text-2xl font-semibold">{value}</div>
          {hint && <div className="mt-1 text-xs text-white/40">{hint}</div>}
        </div>
        {icon && <div className={cn("opacity-80", accents[accent].split(" ").pop())}>{icon}</div>}
      </div>
    </div>
  );
}
