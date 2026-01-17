"use client";

import { Clock, TrendingUp, Calendar, Zap, Leaf, Factory, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

interface CarbonProjectionsProps {
  metrics: {
    estimatedEnergy: number; // kWh per execution
    estimatedCO2: number;    // gCO2e per execution
    gridIntensity: number;   // gCO2e/kWh
  };
  executionsPerDay?: number; // Estimated daily executions
  className?: string;
}

interface Projection {
  label: string;
  period: string;
  executions: number;
  energy: number;      // kWh
  co2: number;         // kg CO2e
  trees: number;       // Trees needed to offset
  equivalent: string;  // Real-world equivalent
}

/**
 * CARBON_PROJECTION_ENGINE_V5
 * Calculates real-time carbon footprint projections across multiple time scales.
 * 
 * Based on:
 * - EPA: 1 tree absorbs ~21.77 kg CO2/year (0.0596 kg/day)
 * - Average car emits ~0.21 kg CO2/km
 * - Smartphone charge: ~0.005 kWh = ~2g CO2e
 * - LED bulb (10W): 0.01 kWh/hour
 */
export function CarbonProjections({ metrics, executionsPerDay = 100, className }: CarbonProjectionsProps) {
  // Time multipliers (from per-execution to per-period)
  const timeScales = [
    { label: "24_Hours", period: "daily", multiplier: executionsPerDay },
    { label: "1_Week", period: "weekly", multiplier: executionsPerDay * 7 },
    { label: "1_Month", period: "monthly", multiplier: executionsPerDay * 30 },
    { label: "6_Months", period: "biannual", multiplier: executionsPerDay * 180 },
    { label: "1_Year", period: "annual", multiplier: executionsPerDay * 365 },
  ];

  // Calculate projections
  const projections: Projection[] = timeScales.map(scale => {
    const totalEnergy = metrics.estimatedEnergy * scale.multiplier;
    const totalCO2Grams = metrics.estimatedCO2 * scale.multiplier;
    const totalCO2Kg = totalCO2Grams / 1000;
    
    // Trees needed to offset (1 tree = 21.77 kg CO2/year, so per day = 0.0596 kg)
    const treesPerYear = totalCO2Kg / 21.77;
    const treesDays = scale.multiplier / executionsPerDay; // Days in this period
    const treesNeeded = Math.ceil(treesPerYear * (365 / treesDays));
    
    // Real-world equivalents
    let equivalent = "";
    if (totalCO2Kg < 1) {
      const phoneCharges = Math.round(totalCO2Grams / 2); // ~2g per phone charge
      equivalent = `${phoneCharges} smartphone charges`;
    } else if (totalCO2Kg < 10) {
      const kmDriven = Math.round(totalCO2Kg / 0.21);
      equivalent = `${kmDriven} km by car`;
    } else if (totalCO2Kg < 100) {
      const flights = (totalCO2Kg / 90).toFixed(1); // ~90kg for short flight
      equivalent = `${flights} short flights`;
    } else {
      const houseDays = Math.round(totalCO2Kg / 8.5); // ~8.5 kg/day avg household
      equivalent = `${houseDays} days of home energy`;
    }

    return {
      label: scale.label,
      period: scale.period,
      executions: scale.multiplier,
      energy: totalEnergy,
      co2: totalCO2Kg,
      trees: Math.max(1, treesNeeded),
      equivalent,
    };
  });

  // Scope categorization (Greenhouse Gas Protocol)
  const scope1 = 0; // Direct emissions (we don't have these for software)
  const scope2 = projections[4].co2; // Purchased electricity (annual)
  const scope3 = scope2 * 0.15; // Upstream/downstream (estimate 15% of scope 2)

  return (
    <div className={cn("space-y-10", className)}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/5 pb-6">
        <div className="flex items-center gap-4">
          <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <BarChart3 size={16} className="text-emerald-500" />
          </div>
          <h3 className="text-xl font-black text-white tracking-tighter uppercase italic">
            Carbon_Projections
          </h3>
        </div>
        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-[9px] font-mono text-amber-500 uppercase tracking-widest font-black">
          <Zap size={10} />
          {executionsPerDay} Exec/Day
        </div>
      </div>

      {/* Execution Rate Slider */}
      <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Estimated_Daily_Executions</span>
          <span className="text-sm font-black text-emerald-500">{executionsPerDay.toLocaleString()}</span>
        </div>
        <p className="text-[10px] text-gray-600 font-mono">Based on avg deployment scale. Adjust for your production workload.</p>
      </div>

      {/* Time-Scale Projections */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {projections.map((proj, idx) => (
          <div 
            key={proj.label}
            className={cn(
              "p-6 rounded-[2rem] border bg-white/[0.01] space-y-4 transition-all hover:bg-white/[0.03]",
              idx === 0 ? "border-emerald-500/20" : "border-white/5"
            )}
          >
            <div className="flex items-center gap-2">
              <Clock size={12} className={idx === 0 ? "text-emerald-500" : "text-gray-600"} />
              <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest font-black">{proj.label}</span>
            </div>
            
            {/* CO2 */}
            <div className="space-y-1">
              <p className={cn("text-2xl font-black tracking-tighter italic", idx === 0 ? "text-emerald-500" : "text-white")}>
                {proj.co2 < 1 ? `${(proj.co2 * 1000).toFixed(0)}g` : proj.co2 < 100 ? `${proj.co2.toFixed(1)}kg` : `${(proj.co2 / 1000).toFixed(2)}t`}
              </p>
              <p className="text-[8px] font-mono text-gray-600 uppercase">CO2e</p>
            </div>

            {/* Energy */}
            <div className="text-[10px] font-mono text-gray-500">
              <span className="text-amber-500">{proj.energy < 1 ? `${(proj.energy * 1000).toFixed(0)}Wh` : `${proj.energy.toFixed(2)}kWh`}</span>
            </div>

            {/* Trees */}
            <div className="flex items-center gap-2 pt-2 border-t border-white/5">
              <Leaf size={10} className="text-emerald-500" />
              <span className="text-[9px] font-mono text-gray-600">{proj.trees} {proj.trees === 1 ? 'tree' : 'trees'}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Real-World Equivalents */}
      <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-emerald-500/5 to-transparent border border-emerald-500/10 space-y-6">
        <div className="flex items-center gap-3">
          <Factory size={16} className="text-emerald-500" />
          <p className="text-[10px] font-mono text-emerald-500 uppercase tracking-[0.3em] font-black">Annual_Impact_Equivalent</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="space-y-1">
            <p className="text-3xl font-black text-white italic">{projections[4].co2.toFixed(1)}<span className="text-lg">kg</span></p>
            <p className="text-[9px] font-mono text-gray-600 uppercase">CO2e/Year</p>
          </div>
          <div className="space-y-1">
            <p className="text-3xl font-black text-amber-500 italic">{projections[4].energy.toFixed(1)}<span className="text-lg">kWh</span></p>
            <p className="text-[9px] font-mono text-gray-600 uppercase">Energy/Year</p>
          </div>
          <div className="space-y-1">
            <p className="text-3xl font-black text-emerald-500 italic">{projections[4].trees}</p>
            <p className="text-[9px] font-mono text-gray-600 uppercase">Trees_to_Offset</p>
          </div>
          <div className="space-y-1">
            <p className="text-xl font-black text-blue-400 italic">{projections[4].equivalent}</p>
            <p className="text-[9px] font-mono text-gray-600 uppercase">Equivalent</p>
          </div>
        </div>
      </div>

      {/* GHG Protocol Scopes */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-6 rounded-2xl bg-gray-500/5 border border-gray-500/10 space-y-2 text-center">
          <p className="text-[9px] font-mono text-gray-500 uppercase tracking-widest">Scope_1</p>
          <p className="text-2xl font-black text-gray-600 italic">0<span className="text-xs">kg</span></p>
          <p className="text-[8px] text-gray-700">Direct Emissions</p>
        </div>
        <div className="p-6 rounded-2xl bg-amber-500/5 border border-amber-500/10 space-y-2 text-center">
          <p className="text-[9px] font-mono text-amber-500 uppercase tracking-widest">Scope_2</p>
          <p className="text-2xl font-black text-amber-500 italic">{scope2.toFixed(1)}<span className="text-xs">kg</span></p>
          <p className="text-[8px] text-gray-600">Electricity</p>
        </div>
        <div className="p-6 rounded-2xl bg-blue-500/5 border border-blue-500/10 space-y-2 text-center">
          <p className="text-[9px] font-mono text-blue-500 uppercase tracking-widest">Scope_3</p>
          <p className="text-2xl font-black text-blue-500 italic">{scope3.toFixed(1)}<span className="text-xs">kg</span></p>
          <p className="text-[8px] text-gray-600">Upstream/Downstream</p>
        </div>
      </div>

      {/* Methodology Note */}
      <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-center gap-4">
        <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
        <p className="text-[9px] text-gray-600 font-mono uppercase tracking-widest text-center">
          Calculations based on EPA emission factors • GHG Protocol Scopes • Real-time grid intensity
        </p>
      </div>
    </div>
  );
}
