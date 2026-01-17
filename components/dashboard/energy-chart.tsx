"use client";

import {
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
} from "recharts";
import { cn } from "@/lib/utils";
import { Activity } from "lucide-react";

interface EnergyScoreChartProps {
  score: number;
  className?: string;
}

export function EnergyScoreChart({ score, className }: EnergyScoreChartProps) {
  const data = [{ name: "score", value: score * 10, fill: getScoreColor(score) }];

  const getLabel = () => {
    if (score >= 9) return "OPTIMIZED_MAX";
    if (score >= 7) return "HIGH_EFFICIENCY";
    if (score >= 5) return "STANDARD_LOAD";
    if (score >= 3) return "STRUCTURAL_LAG";
    return "CRITICAL_OVERHEAD";
  };

  return (
    <div className={cn("relative h-[250px] flex flex-col items-center justify-center", className)}>
      <div className="absolute inset-0 flex items-center justify-center">
         <div className="w-[180px] h-[180px] rounded-full border border-white/5 bg-white/[0.01] shadow-[inset_0_0_40px_rgba(255,255,255,0.02)]" />
      </div>
      
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart
          cx="50%"
          cy="50%"
          innerRadius="75%"
          outerRadius="100%"
          barSize={12}
          data={data}
          startAngle={225}
          endAngle={-45}
        >
          <PolarAngleAxis
            type="number"
            domain={[0, 100]}
            angleAxisId={0}
            tick={false}
          />
          <RadialBar
            background={{ fill: "rgba(255,255,255,0.03)" }}
            dataKey="value"
            cornerRadius={20}
            angleAxisId={0}
          />
        </RadialBarChart>
      </ResponsiveContainer>
      
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none space-y-2">
        <div className="flex items-center gap-2 text-[10px] font-mono text-gray-500 uppercase tracking-[0.4em]">
           <Activity size={10} className="text-emerald-500" />
           Sensor_Read
        </div>
        <span className="text-7xl font-black text-white italic tracking-tighter leading-none">{score}</span>
        <div className="flex flex-col items-center">
           <span className="text-[9px] font-mono font-bold uppercase tracking-[0.5em] text-gray-400 bg-white/5 px-4 py-1.5 rounded-full border border-white/5">
             {getLabel()}
           </span>
        </div>
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1 items-center opacity-20">
         {[...Array(20)].map((_, i) => (
           <div key={i} className={cn("w-1 h-3 rounded-full bg-white", i < score * 2 ? 'opacity-100' : 'opacity-20')} />
         ))}
      </div>
    </div>
  );
}

function getScoreColor(score: number): string {
  if (score >= 8) return "#10b981"; // Emerald
  if (score >= 6) return "#3b82f6"; // Blue
  if (score >= 4) return "#f59e0b"; // Amber
  return "#ef4444"; // Red
}
