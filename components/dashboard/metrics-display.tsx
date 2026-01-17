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
          className="relative overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 hover:border-emerald-500/30 transition-colors group"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <div className={cn("inline-flex p-2 rounded-lg mb-3 group-hover:scale-110 transition-transform", card.bgColor)}>
            <card.icon className={cn("w-5 h-5", card.color)} />
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{card.label}</p>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold">{card.value}</span>
            <span className="text-sm text-gray-500">{card.unit}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
