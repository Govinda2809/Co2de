"use client";

import { Zap, Cloud, Activity, Code2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricsDisplayProps {
  metrics: {
    estimatedEnergy: number;
    estimatedCO2: number;
    energyUnit: string;
    co2Unit: string;
    lineCount?: number;
    complexity?: number;
    language?: string;
  } | null;
  className?: string;
}

export function MetricsDisplay({ metrics, className }: MetricsDisplayProps) {
  if (!metrics) return null;

  const cards = [
    {
      label: "Energy Impact",
      value: metrics.estimatedEnergy.toFixed(3),
      unit: metrics.energyUnit,
      icon: Zap,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
    },
    {
      label: "CO₂ Footprint",
      value: metrics.estimatedCO2.toFixed(3),
      unit: metrics.co2Unit,
      icon: Cloud,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
    },
    {
      label: "Lang Detected",
      value: metrics.language?.toUpperCase() || "JS",
      unit: "runtime",
      icon: Code2,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      label: "Complexity",
      value: metrics.complexity?.toFixed(2) || "—",
      unit: "factor",
      icon: Activity,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
  ];

  return (
    <div className={cn("grid grid-cols-2 lg:grid-cols-4 gap-4", className)}>
      {cards.map((card, index) => (
        <div
          key={card.label}
          className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-4 hover:border-white/20 transition-all group hover:-translate-y-1"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <div className={cn("inline-flex p-2 rounded-xl mb-3 group-hover:scale-110 transition-transform", card.bgColor)}>
            <card.icon className={cn("w-5 h-5", card.color)} />
          </div>
          <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-1">{card.label}</p>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-white">{card.value}</span>
            <span className="text-xs text-gray-400 font-mono">{card.unit}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
