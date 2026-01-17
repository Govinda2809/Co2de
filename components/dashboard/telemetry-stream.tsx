"use client";

import { useState, useEffect } from "react";
import { Terminal as TerminalIcon, Shield, Database, Cpu, Activity, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface TelemetryStreamProps {
  metrics: any;
  isVisible: boolean;
}

export function TelemetryStream({ metrics, isVisible }: TelemetryStreamProps) {
  const [logs, setLogs] = useState<string[]>([]);
  
  useEffect(() => {
    if (!isVisible || !metrics) return;
    
    const messages = [
      `[SYSTEM] PROTOCOL_INIT: QUANTUM_FOOTPRINT_ANALYSIS`,
      `[SOURCE] TARGET_HASH: ${Math.random().toString(36).substring(7).toUpperCase()}`,
      `[METRIC] COMPLEXITY_VECTOR: O(${metrics.complexity?.toFixed(2)})`,
      `[METRIC] THERMAL_THREAT_LEVEL: ${(metrics.complexity * 12).toFixed(1)}%`,
      `[INFRA] REGION_INTENSITY: ${metrics.gridIntensity} gCO2e/kWh`,
      `[MEMORY] HEAP_PRESSURE: ${metrics.memPressure?.toFixed(2)}x ALLOC_FACTOR`,
      `[KERNEL] RECURSION_SCAN: ${metrics.recursionDetected ? "HOTSPOT_DETECTED" : "LINEAR_FLOW_VERIFIED"}`,
      `[VAULT] STATUS: ASYNC_LEDGER_SYNC_READY`,
      `[AI] SYNTHESIS: HEURISTIC_SENSORS_ONLINE`,
    ];

    let i = 0;
    const interval = setInterval(() => {
      if (i < messages.length) {
        setLogs(prev => [...prev, messages[i]].slice(-8));
        i++;
      } else {
        clearInterval(interval);
      }
    }, 400);

    return () => clearInterval(interval);
  }, [isVisible, metrics]);

  if (!isVisible) return null;

  return (
    <div className="p-8 rounded-[2.5rem] bg-emerald-500/[0.02] border border-emerald-500/10 backdrop-blur-3xl space-y-6 animate-in slide-in-from-right-10 overflow-hidden relative group">
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <TerminalIcon size={40} className="text-emerald-500" />
      </div>
      
      <div className="flex items-center gap-3 border-b border-emerald-500/10 pb-4">
        <div className="flex gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/40" />
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/20" />
        </div>
        <p className="text-[10px] font-mono text-emerald-500 uppercase tracking-[0.3em] font-black italic">Live_Structural_Telemetry</p>
      </div>

      <div className="space-y-2.5 font-mono text-[10px] leading-relaxed">
        {logs.map((log, i) => (
          <div key={i} className="flex gap-4 group/line">
            <span className="text-emerald-500/30">[{new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}]</span>
            <span className={cn(
              "transition-colors",
              log.includes("HOTSPOT") || log.includes("THREAT") ? "text-amber-500/80" : "text-emerald-500/60 group-hover/line:text-emerald-400"
            )}>
              {log}
            </span>
          </div>
        ))}
        {logs.length < 5 && (
          <div className="animate-pulse flex gap-4">
            <span className="text-emerald-500/20">[_:_:_]</span>
            <span className="text-emerald-500/20">WAITING_FOR_DATA_STREAM...</span>
          </div>
        )}
      </div>

      <div className="pt-4 grid grid-cols-2 gap-4">
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center gap-3">
          <Shield size={12} className="text-emerald-500/40" />
          <span className="text-[8px] font-mono text-gray-600 uppercase tracking-widest">Logic_Guard_v4</span>
        </div>
        <div className="p-3 rounded-xl bg-white/[0.01] border border-white/5 flex items-center gap-3">
          <Database size={12} className="text-emerald-500/40" />
          <span className="text-[8px] font-mono text-gray-600 uppercase tracking-widest">NoSQL_Buffer</span>
        </div>
      </div>
    </div>
  );
}
