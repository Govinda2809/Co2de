"use client";

import { Zap, Cloud, Activity, Code2, TrendingDown, Scale, AlertTriangle } from "lucide-react";
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
    memPressure?: number;
    recursionDetected?: boolean;
  } | null;
  className?: string;
}

export function MetricsDisplay({ metrics, className }: MetricsDisplayProps) {
  if (!metrics) return null;

  const projections = [
    { label: "100k Runs", value: (metrics.estimatedCO2 * 100).toFixed(1), unit: "KG" },
    { label: "1M Runs", value: (metrics.estimatedCO2 * 10).toFixed(1), unit: "KG" },
  ];

  const cards = [
    {
      label: "Energy Value",
      value: metrics.estimatedEnergy.toFixed(3),
      unit: metrics.energyUnit,
      icon: Zap,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
    },
    {
      label: "CO2 Output",
      value: metrics.estimatedCO2.toFixed(3),
      unit: metrics.co2Unit,
      icon: Cloud,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
    },
    {
      label: "Memory Load",
      value: metrics.memPressure?.toFixed(2) || "1.00",
      unit: "X",
      icon: Activity,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      label: "Complexity",
      value: metrics.complexity?.toFixed(2) || "—",
      unit: "IDX",
      icon: Code2,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
  ];

  return (
    <div className={cn("space-y-12", className)}>
      {metrics.recursionDetected && (
        <div className="p-8 rounded-[2rem] bg-gradient-to-r from-red-500/10 to-transparent border border-red-500/20 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500" />
          <div className="flex items-center gap-6 relative z-10">
            <div className="p-4 rounded-full bg-red-500/10 text-red-500 border border-red-500/10">
              <AlertTriangle size={24} />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-red-400 uppercase tracking-wide">Recursion Hotspot Detected</p>
              <p className="text-lg text-white font-light">
                Deep stack invocation detected. <br />
                Energy leakage probability: High.
              </p>
            </div>
          </div>
          <div className="px-5 py-2 rounded-full bg-red-500 text-white font-medium text-sm shadow-red-500/20 shadow-lg">Impact 1.5x</div>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, index) => (
          <div
            key={card.label}
            className="rounded-[3rem] bg-[#111] border border-white/5 p-8 hover:border-white/20 transition-all duration-300 group relative overflow-hidden"
          >
            <div className={`absolute top-0 right-0 p-6 ${card.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}>
              <card.icon size={80} />
            </div>

            <div className={cn("inline-flex p-4 rounded-2xl mb-6 transition-colors bg-white/5", card.color)}>
              <card.icon className="w-5 h-5" />
            </div>
            <p className="text-sm text-gray-500 font-medium mb-1">{card.label}</p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl text-white font-medium block tracking-tight">{card.value}</span>
              <span className="text-xs text-gray-500 font-medium">{card.unit}</span>
            </div>
          </div>
        ))}
      </div>

      {/* SCALE PROJECTIONS */}
      <div className="p-10 rounded-[3rem] bg-[#111] border border-white/5 relative overflow-hidden group">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="space-y-4 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3">
              <div className="p-2 bg-emerald-500/10 rounded-full"><TrendingDown size={18} className="text-emerald-500" /></div>
              <h3 className="text-lg font-medium text-white">Projected Impact</h3>
            </div>
            <p className="text-sm text-gray-500 max-w-sm leading-relaxed">
              Based on your current metrics, here is the estimated environmental impact at enterprise scale.
            </p>
          </div>
          <div className="flex gap-16 item-center">
            {projections.map((p, i) => (
              <div key={i} className="text-center md:text-right space-y-1">
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">{p.label.replace('_', ' ')}</p>
                <div className="relative inline-block">
                  <p className="text-4xl text-white font-medium tracking-tight">
                    {p.value}
                  </p>
                  <span className="absolute -top-1 -right-6 text-[10px] text-emerald-500 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded-full">{p.unit}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Background Grid */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }}
        />
      </div>
    </div>
  );
}
