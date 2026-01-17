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
    { label: "100k Executions", value: (metrics.estimatedCO2 * 100).toFixed(1), unit: "kg CO2e" },
    { label: "1M Executions", value: (metrics.estimatedCO2 * 10).toFixed(1), unit: "kg CO2e" },
  ];

  const cards = [
    {
      label: "Energy_Impact",
      value: metrics.estimatedEnergy.toFixed(3),
      unit: metrics.energyUnit,
      icon: Zap,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
    },
    {
      label: "CO2_Footprint",
      value: metrics.estimatedCO2.toFixed(3),
      unit: metrics.co2Unit,
      icon: Cloud,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
    },
    {
      label: "Mem_Pressure",
      value: metrics.memPressure?.toFixed(2) || "1.00",
      unit: "alloc_factor",
      icon: Activity,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      label: "Structural_BigO",
      value: metrics.complexity?.toFixed(2) || "—",
      unit: "complexity",
      icon: Code2,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
  ];

  return (
    <div className={cn("space-y-6", className)}>
      {metrics.recursionDetected && (
        <div className="p-8 rounded-[2.5rem] bg-red-500/5 border border-red-500/20 flex flex-col md:flex-row items-center justify-between gap-6 animate-in slide-in-from-top-4">
           <div className="flex items-center gap-6">
              <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20">
                 <AlertTriangle className="text-red-500" size={24} />
              </div>
              <div className="space-y-1">
                 <p className="text-lg font-black text-white italic tracking-tighter uppercase">Recursion_Hotspot_Detected</p>
                 <p className="text-[10px] font-mono text-red-500/50 uppercase tracking-widest leading-relaxed">Structural analysis indicates deep functional self-invocation. High risk of stack-frame energy leakage.</p>
              </div>
           </div>
           <div className="px-6 py-2 rounded-full border border-red-500/20 text-[10px] font-mono text-red-500 uppercase tracking-widest font-bold">Multiplier_Active: 1.5x</div>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, index) => (
          <div
            key={card.label}
            className="relative overflow-hidden rounded-3xl border border-white/5 bg-white/[0.02] backdrop-blur-3xl p-6 hover:border-white/20 transition-all group lg:hover:-translate-y-1"
          >
            <div className={cn("inline-flex p-3 rounded-2xl mb-4 group-hover:scale-110 transition-transform", card.bgColor)}>
              <card.icon className={cn("w-5 h-5", card.color)} />
            </div>
            <p className="text-[10px] text-gray-500 font-mono uppercase tracking-[0.2em] mb-1">{card.label}</p>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-white italic tracking-tighter">{card.value}</span>
              <span className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">{card.unit}</span>
            </div>
          </div>
        ))}
      </div>

      {/* SCALE PROJECTIONS */}
      <div className="p-10 rounded-[3rem] bg-emerald-500/5 border border-emerald-500/10 relative overflow-hidden group">
         <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none group-hover:rotate-12 transition-transform">
            <Scale size={120} className="text-emerald-500" />
         </div>
         <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="space-y-4">
               <div className="flex items-center gap-3">
                  <TrendingDown size={16} className="text-emerald-500" />
                  <h3 className="text-xs font-mono text-emerald-500 uppercase tracking-[0.4em] font-bold">Predictive_Scale_Impact</h3>
               </div>
               <p className="text-gray-400 text-sm font-medium max-w-sm lowercase first-letter:uppercase">Projections calculated based on enterprise-level workload simulations and grid transmission overhead.</p>
            </div>
            <div className="flex gap-12">
               {projections.map((p, i) => (
                  <div key={i} className="space-y-1 text-center md:text-right">
                     <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">{p.label}</p>
                     <p className="text-3xl font-black italic tracking-tighter text-white">
                        {p.value} <span className="text-xs font-mono not-italic text-emerald-500/50">{p.unit}</span>
                     </p>
                  </div>
               ))}
            </div>
         </div>
      </div>
    </div>
  );
}
