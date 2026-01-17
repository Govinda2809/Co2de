"use client";

import { Globe, MapPin, Zap } from "lucide-react";
import { REGIONS } from "@/lib/energy";
import { cn } from "@/lib/utils";

export function RegionalHeatmap({ selectedRegion }: { selectedRegion: string }) {
  const currentRegion = (REGIONS as any)[selectedRegion] || REGIONS.europe;
  
  return (
    <div className="p-10 rounded-[3.5rem] bg-white/[0.01] border border-white/5 backdrop-blur-3xl space-y-8 relative overflow-hidden group">
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-emerald-500/5 blur-[100px] pointer-events-none group-hover:bg-emerald-500/10 transition-colors" />
      
      <div className="flex items-center justify-between border-b border-white/5 pb-6">
        <div className="flex items-center gap-4">
           <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <Globe size={16} className="text-emerald-500" />
           </div>
           <h3 className="text-xl font-black text-white tracking-tighter uppercase italic">
             Grid_Intensity_Map
           </h3>
        </div>
        <div className="px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-mono text-emerald-500 uppercase tracking-widest font-black">
           LIVE_SURFACE
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="relative aspect-square flex items-center justify-center">
           {/* Abstract Hex Grid Map Simulation */}
           <div className="absolute inset-0 grid grid-cols-6 grid-rows-6 gap-2 opacity-10">
              {Array.from({ length: 36 }).map((_, i) => (
                <div key={i} className={cn("h-full w-full rounded-[4px]", i % 5 === 0 ? "bg-emerald-500" : "bg-white/20")} />
              ))}
           </div>
           
           <div className="relative z-10 w-full h-full flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/50 animate-ping absolute" />
              <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.5)]">
                 <MapPin size={16} className="text-white" />
              </div>
           </div>
        </div>

        <div className="space-y-8">
           <div className="space-y-2">
              <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest font-bold">Active_Sector</p>
              <p className="text-3xl font-black text-white italic tracking-tighter uppercase">{currentRegion.label.split(' (')[0]}</p>
           </div>

           <div className="space-y-4">
              <div className="flex items-center justify-between text-[11px] font-mono font-black uppercase tracking-widest">
                 <span className="text-gray-500">Carbon_Density</span>
                 <span className={cn(currentRegion.intensity > 400 ? "text-amber-500" : "text-emerald-500")}>{currentRegion.intensity} g/kWh</span>
              </div>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                 <div 
                   className={cn("h-full transition-all duration-1000", currentRegion.intensity > 400 ? "bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]" : "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]")} 
                   style={{ width: `${(currentRegion.intensity / 700) * 100}%` }} 
                 />
              </div>
           </div>

           <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
              <div className="flex items-center gap-2">
                 <Zap size={12} className="text-emerald-500" />
                 <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest font-black">Renewable_Forecast</span>
              </div>
              <p className="text-[12px] text-gray-400 font-medium leading-relaxed lowercase first-letter:uppercase">
                 Grid load is expected to drop by 15% in <span className="text-emerald-500">{currentRegion.bestHour}:00h</span>. Optimal window for high-energy packets.
              </p>
           </div>
        </div>
      </div>
    </div>
  );
}
