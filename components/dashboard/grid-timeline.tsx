"use client";

import { useMemo } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Leaf, Info } from "lucide-react";

interface GridTimelineProps {
  region: string;
}

export function GridTimeline({ region }: GridTimelineProps) {
  const data = useMemo(() => {
    const hours = Array.from({ length: 24 }, (_, i) => {
      const hour = (new Date().getHours() + i) % 24;
      // Simulated carbon intensity curve
      // Lower during night (wind), higher during day (load), lower during peak sun (solar)
      let intensity = 400;
      if (hour >= 22 || hour <= 5) intensity = 280; // Night wind boost
      else if (hour >= 10 && hour <= 15) intensity = 320; // Solar boost
      else if (hour >= 17 && hour <= 21) intensity = 550; // Peak load
      
      // Random variance
      intensity += Math.floor(Math.random() * 40) - 20;

      return {
        time: `${hour}:00`,
        intensity,
        isOptimal: intensity < 350
      };
    });
    return hours;
  }, [region]);

  return (
    <div className="p-10 rounded-[3.5rem] border border-white/5 bg-white/[0.01] backdrop-blur-3xl space-y-8 relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-10 opacity-[0.03] pointer-events-none">
        <Leaf size={120} className="text-emerald-500" />
      </div>

      <div className="flex items-center justify-between">
         <div className="space-y-2">
            <div className="flex items-center gap-3">
               <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
               <h3 className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-[0.4em]">Grid_Sync_Live_Sync</h3>
            </div>
            <p className="text-2xl font-black text-white tracking-tighter uppercase italic">Carbon_Intensity_Forecast</p>
         </div>
         <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/5 text-[9px] font-mono text-gray-500 uppercase">
            <Info size={10} />
            Predictive_Modeling_Active
         </div>
      </div>

      <div className="h-[200px] w-full mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorIntensity" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
            <XAxis 
              dataKey="time" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: 'rgba(255,255,255,0.2)', fontSize: 9, fontFamily: 'monospace' }} 
              interval={4}
            />
            <YAxis hide />
            <Tooltip 
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-black border border-white/10 p-3 rounded-xl shadow-2xl">
                      <p className="text-[9px] font-mono text-gray-500 uppercase mb-1">{payload[0].payload.time}</p>
                      <p className="text-lg font-black text-white italic">{payload[0].value} <span className="text-[8px] opacity-50 not-italic">gCO2e/kWh</span></p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area 
              type="monotone" 
              dataKey="intensity" 
              stroke="#10b981" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorIntensity)" 
              animationDuration={2000}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-white/5">
         <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-emerald-500" />
               <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest">Optimal_Window</span>
            </div>
            <div className="flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-red-500/50" />
               <span className="text-[9px] font-mono text-gray-600 uppercase tracking-widest">Peak_Load</span>
            </div>
         </div>
         <p className="text-[9px] font-mono text-emerald-500/50 uppercase tracking-widest font-bold">Recommended: 22h00 - 05h00</p>
      </div>
    </div>
  );
}
