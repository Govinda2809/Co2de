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
    { label: "100K_RUNS", value: (metrics.estimatedCO2 * 100).toFixed(1), unit: "KG" },
    { label: "1M_RUNS", value: (metrics.estimatedCO2 * 10).toFixed(1), unit: "KG" },
  ];

  const cards = [
    {
      label: "ENERGY_VAL",
      value: metrics.estimatedEnergy.toFixed(3),
      unit: metrics.energyUnit,
      icon: Zap,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
    },
    {
      label: "CO2_OUTPUT",
      value: metrics.estimatedCO2.toFixed(3),
      unit: metrics.co2Unit,
      icon: Cloud,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
    },
    {
      label: "MEM_LOAD",
      value: metrics.memPressure?.toFixed(2) || "1.00",
      unit: "X",
      icon: Activity,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      label: "BIG_O_CPLX",
      value: metrics.complexity?.toFixed(2) || "—",
      unit: "IDX",
      icon: Code2,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
  ];

  return (
    <div className={cn("space-y-8", className)}>
      {metrics.recursionDetected && (
        <div className="p-6 bg-red-900/10 border-2 border-red-500 pixel-border flex flex-col md:flex-row items-center justify-between gap-6 animate-pulse">
          <div className="flex items-center gap-6">
            <div className="p-2 bg-red-500 text-black border border-red-500 pixel-border">
              <AlertTriangle size={24} />
            </div>
            <div className="space-y-1">
              <p className="font-pixel text-lg text-red-500 uppercase">RECURSION_HOTSPOT_DETECTED</p>
              <p className="font-mono text-xs text-red-400 max-w-lg">
                   // WARN: Deep stack invocation detected. <br />
                   // Energy leakage probability: HIGH.
              </p>
            </div>
          </div>
          <div className="px-4 py-2 bg-red-500 text-black font-pixel text-xs border border-red-500 pixel-border">MULTIPLIER: 1.5X</div>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, index) => (
          <div
            key={card.label}
            className="pixel-border border-2 border-white/10 bg-black p-6 hover:border-white hover:-translate-y-1 transition-all duration-200 group relative overflow-hidden"
          >
            <div className={`absolute top-0 right-0 p-2 ${card.color} opacity-20 group-hover:opacity-100 transition-opacity`}>
              <card.icon size={40} />
            </div>

            <div className={cn("inline-flex p-2 mb-4 pixel-border border transition-colors bg-transparent", card.color, "border-current")}>
              <card.icon className="w-4 h-4" />
            </div>
            <p className="font-pixel text-xs text-gray-500 mb-2">{card.label}</p>
            <div className="flex items-baseline gap-2">
              <span className="font-pixel text-2xl text-white block">{card.value}</span>
              <span className="font-pixel text-[10px] text-gray-500">{card.unit}</span>
            </div>
          </div>
        ))}
      </div>

      {/* SCALE PROJECTIONS */}
      <div className="p-8 bg-black border-2 border-emerald-500/50 pixel-border relative overflow-hidden group">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <TrendingDown size={16} className="text-emerald-500" />
              <h3 className="font-pixel text-sm text-emerald-500 uppercase">PREDICTIVE_SCALE_IMPACT</h3>
            </div>
            <p className="font-mono text-xs text-gray-400 max-w-sm">
                 // SIMULATING_WORKLOAD_SPIKE... <br />
              Estimating carbon tonnage at enterprise scale.
            </p>
          </div>
          <div className="flex gap-12">
            {projections.map((p, i) => (
              <div key={i} className="text-center md:text-right space-y-1">
                <p className="font-mono text-[10px] text-gray-500 uppercase tracking-widest">{p.label}</p>
                <p className="font-pixel text-3xl text-white">
                  {p.value} <span className="text-xs text-emerald-500">{p.unit}</span>
                </p>
              </div>
            ))}
          </div>
        </div>
        {/* Background Grid */}
        <div className="absolute inset-0 pointer-events-none opacity-5"
          style={{ backgroundImage: 'linear-gradient(#10b981 1px, transparent 1px), linear-gradient(90deg, #10b981 1px, transparent 1px)', backgroundSize: '10px 10px' }}
        />
      </div>
    </div>
  );
}
