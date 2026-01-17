"use client";

import { Thermometer, Activity, Cpu } from "lucide-react";
import { HARDWARE_PROFILES } from "@/lib/energy";
import { cn } from "@/lib/utils";

export function HardwareThermalIndex({ selectedHardware, complexity }: { selectedHardware: string, complexity: number }) {
  const hardware = (HARDWARE_PROFILES as any)[selectedHardware] || HARDWARE_PROFILES.laptop;
  const thermalLoad = Math.min(100, (complexity * hardware.factor * 15));
  
  return (
    <div className="p-10 rounded-[3.5rem] bg-white/[0.01] border border-white/5 backdrop-blur-3xl space-y-8 relative overflow-hidden group h-full flex flex-col justify-center">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-amber-500/5 blur-[100px] pointer-events-none group-hover:bg-amber-500/10 transition-colors" />
      
      <div className="flex items-center justify-between border-b border-white/5 pb-6">
        <div className="flex items-center gap-4">
           <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <Thermometer size={16} className="text-amber-500" />
           </div>
           <h3 className="text-xl font-black text-white tracking-tighter uppercase italic">
             Thermal_Signature
           </h3>
        </div>
        <div className="flex items-center gap-2">
           <Activity size={14} className="text-gray-700 animate-pulse" />
        </div>
      </div>

      <div className="space-y-10 py-4">
         <div className="flex items-center justify-center relative">
            <div className="w-48 h-48 rounded-full border border-white/5 flex items-center justify-center relative">
               <div className="absolute inset-0 rounded-full border-2 border-dashed border-white/10 animate-[spin_10s_linear_infinite]" />
               <div className="text-center space-y-1">
                  <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest font-bold">Estimated_Load</p>
                  <p className={cn("text-6xl font-black tracking-tighter italic transition-colors", thermalLoad > 70 ? "text-amber-500" : "text-white")}>{thermalLoad.toFixed(0)}%</p>
                  <p className="text-[9px] font-mono text-gray-700 uppercase tracking-widest font-black">{hardware.label}</p>
               </div>
            </div>
         </div>

         <div className="space-y-6">
            <div className="space-y-3">
               <div className="flex items-center justify-between text-[10px] font-mono font-black uppercase tracking-[0.2em]">
                  <span className="text-gray-600">Dynamic_TDP_Response</span>
                  <span className="text-amber-500">{(hardware.factor * complexity).toFixed(1)}x Factor</span>
               </div>
               <div className="grid grid-cols-10 gap-1.5">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div 
                      key={i} 
                      className={cn(
                        "h-2 rounded-full transition-all duration-700", 
                        i < (thermalLoad / 10) ? (thermalLoad > 70 ? "bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]" : "bg-white") : "bg-white/5"
                      )} 
                    />
                  ))}
               </div>
            </div>

            <div className="flex items-start gap-4 p-5 rounded-2xl bg-white/[0.03] border border-white/5">
               <Cpu size={14} className="text-gray-500 mt-1" />
               <p className="text-[11px] text-gray-500 font-medium leading-relaxed lowercase first-letter:uppercase">
                  Executing high-complexity recursion on <span className="text-white italic">{hardware.label}</span> infrastructure will trigger thermal throttling in sustained cycles.
               </p>
            </div>
         </div>
      </div>
    </div>
  );
}
