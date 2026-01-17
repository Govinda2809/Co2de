"use client";

import { useState, useEffect } from "react";
import { Globe, MapPin, Zap, Loader2, Wifi, WifiOff } from "lucide-react";
import { REGIONS } from "@/lib/energy";
import { cn } from "@/lib/utils";
import { Geolocation } from "@/lib/schemas";

interface RegionalHeatmapProps {
  selectedRegion: string;
  onRegionDetected?: (region: string, geo: Geolocation) => void;
}

export function RegionalHeatmap({ selectedRegion, onRegionDetected }: RegionalHeatmapProps) {
  const [geolocation, setGeolocation] = useState<Geolocation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);
  
  useEffect(() => {
    const fetchGeolocation = async () => {
      try {
        const response = await fetch('/api/geolocation');
        if (!response.ok) throw new Error('Failed to fetch geolocation');
        const data = await response.json();
        setGeolocation(data);
        setIsLive(true);
        
        // Notify parent component of detected region
        if (onRegionDetected && data.region) {
          onRegionDetected(data.region, data);
        }
      } catch (error) {
        console.error('Geolocation error:', error);
        setIsLive(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchGeolocation();
  }, [onRegionDetected]);

  const currentRegion = (REGIONS as any)[selectedRegion] || REGIONS.europe;
  const displayIntensity = geolocation?.gridIntensity || currentRegion.intensity;
  const displayCity = geolocation?.city || currentRegion.label.split(' (')[0];
  const displayCountry = geolocation?.country || '';
  
  return (
    <div className="p-10 rounded-[3.5rem] bg-white/[0.01] border border-white/5 backdrop-blur-3xl space-y-8 relative overflow-hidden group h-full">
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-emerald-500/5 blur-[100px] pointer-events-none group-hover:bg-emerald-500/10 transition-colors" />
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/5 pb-6">
        <div className="flex items-center gap-4">
           <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <Globe size={16} className="text-emerald-500" />
           </div>
           <h3 className="text-xl font-black text-white tracking-tighter uppercase italic">
             Grid_Intensity_Map
           </h3>
        </div>
        <div className={cn(
          "flex items-center gap-2 px-4 py-1.5 rounded-full text-[9px] font-mono uppercase tracking-widest font-black transition-colors",
          isLive 
            ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-500" 
            : "bg-amber-500/10 border border-amber-500/20 text-amber-500"
        )}>
           {isLoading ? (
             <><Loader2 size={10} className="animate-spin" /> DETECTING...</>
           ) : isLive ? (
             <><Wifi size={10} /> LIVE_IP</>
           ) : (
             <><WifiOff size={10} /> MANUAL</>
           )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Map Visualization */}
        <div className="relative aspect-square flex items-center justify-center">
           {/* Abstract Hex Grid Map */}
           <div className="absolute inset-0 grid grid-cols-6 grid-rows-6 gap-2 opacity-10">
              {Array.from({ length: 36 }).map((_, i) => (
                <div 
                  key={i} 
                  className={cn(
                    "h-full w-full rounded-[4px] transition-colors duration-500",
                    isLive && i === 14 ? "bg-emerald-500 animate-pulse" : // Center position for detected location
                    i % 5 === 0 ? "bg-emerald-500" : "bg-white/20"
                  )} 
                />
              ))}
           </div>
           
           {/* Location Pin */}
           <div className="relative z-10 w-full h-full flex items-center justify-center">
              <div className={cn(
                "w-16 h-16 rounded-full border animate-ping absolute",
                isLive ? "bg-emerald-500/20 border-emerald-500/50" : "bg-amber-500/20 border-amber-500/50"
              )} />
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center shadow-lg",
                isLive ? "bg-emerald-500 shadow-emerald-500/50" : "bg-amber-500 shadow-amber-500/50"
              )}>
                 <MapPin size={18} className="text-white" />
              </div>
           </div>
        </div>

        {/* Location Details */}
        <div className="space-y-6">
           {/* IP Address */}
           {geolocation?.ip && geolocation.ip !== 'unknown' && (
             <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
               <p className="text-[9px] font-mono text-gray-600 uppercase tracking-widest">Client_IP</p>
               <p className="text-sm font-mono text-emerald-500">{geolocation.ip}</p>
             </div>
           )}

           {/* Location */}
           <div className="space-y-2">
              <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest font-bold">Active_Sector</p>
              <p className="text-3xl font-black text-white italic tracking-tighter uppercase">
                {displayCity}
              </p>
              {displayCountry && (
                <p className="text-sm font-mono text-gray-600 uppercase tracking-widest">{displayCountry}</p>
              )}
           </div>

           {/* Carbon Intensity */}
           <div className="space-y-4">
              <div className="flex items-center justify-between text-[11px] font-mono font-black uppercase tracking-widest">
                 <span className="text-gray-500">Carbon_Density</span>
                 <span className={cn(displayIntensity > 400 ? "text-amber-500" : "text-emerald-500")}>
                   {displayIntensity} g/kWh
                 </span>
              </div>
              <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                 <div 
                   className={cn(
                     "h-full transition-all duration-1000 rounded-full",
                     displayIntensity > 400 
                       ? "bg-gradient-to-r from-amber-500 to-red-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]" 
                       : "bg-gradient-to-r from-emerald-500 to-cyan-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                   )} 
                   style={{ width: `${Math.min(100, (displayIntensity / 700) * 100)}%` }} 
                 />
              </div>
           </div>

           {/* Renewable Forecast */}
           <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
              <div className="flex items-center gap-2">
                 <Zap size={12} className="text-emerald-500" />
                 <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest font-black">Renewable_Forecast</span>
              </div>
              <p className="text-[12px] text-gray-400 font-medium leading-relaxed">
                 Grid load expected to drop by <span className="text-emerald-500 font-bold">15%</span> at <span className="text-emerald-500 font-bold">{currentRegion.bestHour}:00h</span> local time. Optimal window for high-energy computations.
              </p>
           </div>

           {/* ISP Info */}
           {geolocation?.isp && geolocation.isp !== 'Unknown' && (
             <div className="text-[10px] font-mono text-gray-700 uppercase tracking-widest">
               ISP: {geolocation.isp}
             </div>
           )}
        </div>
      </div>
    </div>
  );
}
