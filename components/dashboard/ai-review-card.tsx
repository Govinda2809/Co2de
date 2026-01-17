"use client";

import { AlertTriangle, Lightbulb, TrendingUp, ShieldCheck, Zap, Package, AlertCircle, Info, FileText, Shield, ChevronDown, ChevronUp } from "lucide-react";
import { AIReview, Dependency } from "@/lib/schemas";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface AIReviewCardProps {
  review: AIReview | null;
  className?: string;
}

function SeverityBadge({ severity }: { severity: string }) {
  const colors: Record<string, string> = {
    low: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    medium: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    high: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    critical: "bg-red-500/10 text-red-500 border-red-500/20",
    info: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    warning: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  };
  return (
    <span className={cn("text-[8px] font-mono uppercase tracking-widest font-bold px-2 py-0.5 rounded-full border", colors[severity] || colors.low)}>
      {severity}
    </span>
  );
}

function DependencyCard({ dep }: { dep: Dependency }) {
  return (
    <div className="p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:border-emerald-500/20 transition-all group space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Package size={14} className="text-emerald-500" />
          <span className="text-sm font-black text-white uppercase italic tracking-tight">{dep.name}</span>
        </div>
        <div className="flex items-center gap-2">
          {dep.bundleSizeKb && (
            <span className="text-[9px] font-mono text-gray-500 uppercase">{dep.bundleSizeKb}kb</span>
          )}
          <SeverityBadge severity={dep.severity || 'medium'} />
        </div>
      </div>
      <p className="text-[11px] text-gray-500 font-medium leading-relaxed">{dep.impact}</p>
      <div className="flex items-center gap-4 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
        <TrendingUp size={12} className="text-emerald-500 shrink-0" />
        <div className="space-y-0.5">
          <p className="text-[8px] font-mono text-gray-600 uppercase tracking-widest">Recommended_Swap</p>
          <p className="text-[11px] font-black text-emerald-500 uppercase italic">{dep.alternative}</p>
        </div>
      </div>
      {dep.category && (
        <span className="inline-block text-[8px] font-mono text-gray-600 uppercase tracking-widest px-2 py-1 rounded border border-white/5">
          {dep.category}
        </span>
      )}
    </div>
  );
}

export function AIReviewCard({ review, className }: AIReviewCardProps) {
  const [showAllDeps, setShowAllDeps] = useState(false);
  const [showHotspots, setShowHotspots] = useState(false);
  
  if (!review) return null;

  const items = [
    {
      label: "Primary_Bottleneck",
      value: review.bottleneck,
      icon: AlertTriangle,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
      border: "border-amber-500/20"
    },
    {
      label: "Optimization_Vector",
      value: review.optimization,
      icon: Lightbulb,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      border: "border-blue-500/20"
    },
    {
      label: "Efficiency_Delta",
      value: review.improvement,
      icon: TrendingUp,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
      border: "border-emerald-500/20"
    },
  ];

  const visibleDeps = showAllDeps ? review.dependencies : review.dependencies?.slice(0, 3);

  return (
    <div className={cn("space-y-8", className)}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/5 pb-6">
        <div className="flex items-center gap-4">
           <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <Zap size={16} className="text-emerald-500" />
           </div>
           <h3 className="text-xl font-black text-white tracking-tighter uppercase italic">
             Review_Intelligence
           </h3>
        </div>
        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.03] border border-white/10 text-[9px] font-mono text-gray-500 uppercase tracking-widest">
           <ShieldCheck size={10} className="text-emerald-500" />
           CO2DE_AI_v5.0
        </div>
      </div>

      {/* Code Summary - NEW */}
      {review.summary && (
        <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-emerald-500/5 to-transparent border border-emerald-500/10 space-y-4">
          <div className="flex items-center gap-3">
            <FileText size={16} className="text-emerald-500" />
            <p className="text-[10px] font-mono text-emerald-500 uppercase tracking-[0.3em] font-black">Code_Explanation</p>
          </div>
          <p className="text-sm text-gray-300 font-medium leading-relaxed">
            {review.summary}
          </p>
        </div>
      )}

      {/* Main Insights */}
      <div className="grid gap-4">
        {items.map((item, index) => (
          <div
            key={item.label}
            className={cn(
               "p-8 rounded-[2rem] border bg-white/[0.01] backdrop-blur-3xl transition-all group overflow-hidden relative",
               "hover:bg-white/[0.03] hover:translate-x-1",
               item.border
            )}
            style={{ animationDelay: `${index * 150}ms` }}
          >
            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none group-hover:scale-110 transition-transform">
               <item.icon size={60} className={item.color} />
            </div>
            <div className="flex items-start gap-8 relative z-10">
              <div className={cn("p-3 rounded-2xl shrink-0 border", item.bgColor, item.border)}>
                <item.icon size={18} className={item.color} />
              </div>
              <div className="min-w-0 space-y-2">
                <p className="text-[10px] font-mono font-bold text-gray-600 uppercase tracking-[0.3em]">
                  {item.label}
                </p>
                <p className="text-sm text-gray-400 font-medium leading-relaxed">{item.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Security Notes - NEW */}
      {review.securityNotes && (
        <div className="p-6 rounded-[2rem] bg-red-500/5 border border-red-500/10 space-y-3">
          <div className="flex items-center gap-3">
            <Shield size={14} className="text-red-500" />
            <p className="text-[10px] font-mono text-red-500 uppercase tracking-[0.3em] font-black">Security_Advisory</p>
          </div>
          <p className="text-[12px] text-red-400/80 font-medium leading-relaxed">{review.securityNotes}</p>
        </div>
      )}

      {/* Performance Hotspots - NEW */}
      {review.hotspots && review.hotspots.length > 0 && (
        <div className="space-y-4">
          <button 
            onClick={() => setShowHotspots(!showHotspots)}
            className="w-full flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all"
          >
            <div className="flex items-center gap-3">
              <AlertCircle size={14} className="text-amber-500" />
              <span className="text-[10px] font-mono text-gray-500 uppercase tracking-[0.3em] font-black">
                Performance_Hotspots ({review.hotspots.length})
              </span>
            </div>
            {showHotspots ? <ChevronUp size={14} className="text-gray-500" /> : <ChevronDown size={14} className="text-gray-500" />}
          </button>
          
          {showHotspots && (
            <div className="space-y-3 animate-in slide-in-from-top-4">
              {review.hotspots.map((hotspot, idx) => (
                <div key={idx} className="flex items-start gap-4 p-5 rounded-xl bg-white/[0.01] border border-white/5">
                  <Info size={12} className={cn(
                    hotspot.severity === 'critical' ? 'text-red-500' : 
                    hotspot.severity === 'warning' ? 'text-amber-500' : 'text-blue-500'
                  )} />
                  <div className="flex-1 space-y-1">
                    <p className="text-[11px] text-gray-400 font-medium">{hotspot.description}</p>
                  </div>
                  <SeverityBadge severity={hotspot.severity} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Dependencies */}
      {review.dependencies && review.dependencies.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center gap-4 px-2">
            <div className="h-px flex-1 bg-white/5" />
            <p className="text-[10px] font-mono text-gray-500 uppercase tracking-[0.5em] font-black flex items-center gap-2">
              <Package size={12} className="text-emerald-500" />
              Dependency_Audit ({review.dependencies.length})
            </p>
            <div className="h-px flex-1 bg-white/5" />
          </div>
          
          <div className="grid gap-4">
            {visibleDeps?.map((dep, idx) => (
              <DependencyCard key={idx} dep={dep} />
            ))}
          </div>
          
          {review.dependencies.length > 3 && (
            <button 
              onClick={() => setShowAllDeps(!showAllDeps)}
              className="w-full p-4 rounded-xl bg-white/[0.02] border border-white/5 text-[10px] font-mono text-gray-500 uppercase tracking-widest hover:bg-white/[0.04] hover:text-white transition-all flex items-center justify-center gap-2"
            >
              {showAllDeps ? (
                <>Show Less <ChevronUp size={12} /></>
              ) : (
                <>Show All ({review.dependencies.length - 3} more) <ChevronDown size={12} /></>
              )}
            </button>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-center gap-4">
         <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
         <p className="text-[10px] text-gray-600 font-mono uppercase tracking-widest italic text-center">
           Real-time analysis powered by multi-model AI synthesis
         </p>
      </div>
    </div>
  );
}
