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
    <div className="p-10 rounded-[3.5rem] border border-white/5 bg-[#111] space-y-8 relative overflow-hidden group hover:border-white/10 transition-colors duration-500">
      <div className="absolute top-0 right-0 p-12 opacity-[0.02] pointer-events-none group-hover:opacity-[0.05] transition-opacity duration-700">
        <Leaf size={140} className="text-emerald-500" />
      </div>

      <div className="flex items-center justify-between">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse ring-4 ring-emerald-500/10" />
            <h3 className="text-xs font-medium text-gray-400 uppercase tracking-widest">Live Grid Sync</h3>
          </div>
          <p className="text-3xl font-medium text-white tracking-tight">Carbon Intensity Forecast</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/5 text-[10px] font-medium text-gray-400 uppercase tracking-wide">
          <Info size={12} className="text-emerald-500" />
          Predictive Model Active
        </div>
      </div>

      <div className="h-[240px] w-full mt-8">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorIntensity" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
            <XAxis
              dataKey="time"
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10, fontFamily: 'sans-serif' }}
              interval={4}
              dy={10}
            />
            <YAxis hide />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-[#0a0a0a] border border-white/10 p-4 rounded-2xl shadow-2xl backdrop-blur-xl">
                      <p className="text-xs font-medium text-gray-500 mb-1">{payload[0].payload.time}</p>
                      <p className="text-2xl font-medium text-white">{payload[0].value} <span className="text-[10px] text-gray-500 font-normal ml-1">gCO2e/kWh</span></p>
                    </div>
                  );
                }
                return null;
              }}
              cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1, strokeDasharray: '4 4' }}
            />
            <Area
              type="monotone"
              dataKey="intensity"
              stroke="#10b981"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorIntensity)"
              animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-between pt-6 border-t border-white/5">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2.5">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-xs font-medium text-gray-400">Optimal Window</span>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-2 h-2 rounded-full bg-red-500/50" />
            <span className="text-xs font-medium text-gray-400">Peak Load</span>
          </div>
        </div>
        <p className="text-[10px] font-medium text-emerald-500/80 uppercase tracking-widest bg-emerald-500/5 px-3 py-1 rounded-full border border-emerald-500/10">Recommended: 22:00 - 05:00</p>
      </div>
    </div>
  );
}
