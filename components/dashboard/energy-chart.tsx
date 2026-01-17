"use client";

import {
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
} from "recharts";
import { cn } from "@/lib/utils";

interface EnergyScoreChartProps {
  score: number;
  className?: string;
}

export function EnergyScoreChart({ score, className }: EnergyScoreChartProps) {
  const data = [{ name: "score", value: score * 10, fill: getScoreColor(score) }];

  const getLabel = () => {
    if (score >= 8) return "Excellent";
    if (score >= 6) return "Good";
    if (score >= 4) return "Fair";
    return "Poor";
  };

  return (
    <div className={cn("relative", className)}>
      <ResponsiveContainer width="100%" height={200}>
        <RadialBarChart
          cx="50%"
          cy="50%"
          innerRadius="60%"
          outerRadius="100%"
          barSize={20}
          data={data}
          startAngle={180}
          endAngle={0}
        >
          <PolarAngleAxis
            type="number"
            domain={[0, 100]}
            angleAxisId={0}
            tick={false}
          />
          <RadialBar
            background={{ fill: "#1f2937" }}
            dataKey="value"
            cornerRadius={10}
            angleAxisId={0}
          />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-4xl font-bold">{score}</span>
        <span className="text-sm text-gray-500">{getLabel()}</span>
      </div>
    </div>
  );
}

function getScoreColor(score: number): string {
  if (score >= 8) return "#10b981";
  if (score >= 6) return "#22c55e";
  if (score >= 4) return "#f59e0b";
  return "#ef4444";
}
