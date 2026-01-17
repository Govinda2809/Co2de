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
    <span className={cn("text-[10px] font-medium uppercase tracking-widest px-3 py-1 rounded-full border", colors[severity] || colors.low)}>
      {severity}
    </span>
  );
}

function DependencyCard({ dep }: { dep: Dependency }) {
  return (
  return (
    <div className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 hover:border-emerald-500/20 transition-all group space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Package size={16} className="text-emerald-500" />
          <span className="text-base font-medium text-white tracking-tight">{dep.name}</span>
        </div>
        <div className="flex items-center gap-3">
          {dep.bundleSizeKb && (
            <span className="text-xs text-gray-400 font-medium">{dep.bundleSizeKb}kb</span>
          )}
          <SeverityBadge severity={dep.severity || 'medium'} />
        </div>
      </div>
      <p className="text-[11px] text-gray-500 font-medium leading-relaxed">{dep.impact}</p>
      <div className="flex items-center gap-4 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
        <TrendingUp size={12} className="text-emerald-500 shrink-0" />
        <div className="space-y-0.5">
          <p className="text-[10px] text-gray-500 uppercase tracking-widest">Recommended Swap</p>
          <p className="text-xs font-medium text-emerald-500">{dep.alternative}</p>
        </div>
      </div>
      {dep.category && (
        <span className="inline-block text-[10px] font-medium text-gray-500 uppercase tracking-widest px-3 py-1 rounded-full border border-white/5 bg-white/[0.02]">
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
      <div className="flex items-center justify-between border-b border-white/5 pb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
            <Zap size={20} className="text-emerald-500" />
          </div>
          <h3 className="text-2xl font-medium text-white tracking-tight">
            Review Intelligence
          </h3>
        </div>
        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-medium text-gray-500 uppercase tracking-widest">
          <ShieldCheck size={12} className="text-emerald-500" />
          AI Analysis Active
        </div>
      </div>

      {/* Code Summary - NEW */}
      {review.summary && (
        <div className="p-10 rounded-[2.5rem] bg-linear-to-br from-emerald-500/5 to-transparent border border-emerald-500/10 space-y-4">
          <div className="flex items-center gap-3">
            <FileText size={18} className="text-emerald-500" />
            <p className="text-xs font-medium text-emerald-500 uppercase tracking-widest">Code Explanation</p>
          </div>
          <p className="text-base text-gray-300 leading-relaxed font-light">
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
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none group-hover:scale-110 transition-transform">
              <item.icon size={80} className={item.color} />
            </div>
            <div className="flex items-start gap-8 relative z-10">
              <div className={cn("p-4 rounded-2xl shrink-0 border", item.bgColor, item.border)}>
                <item.icon size={20} className={item.color} />
              </div>
              <div className="min-w-0 space-y-2">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-widest">
                  {item.label.replace('_', ' ')}
                </p>
                <p className="text-base text-white font-light leading-relaxed">{item.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Security Notes - NEW */}
      {review.securityNotes && (
        <div className="p-8 rounded-[2rem] bg-red-500/5 border border-red-500/10 space-y-4">
          <div className="flex items-center gap-3">
            <Shield size={16} className="text-red-500" />
            <p className="text-xs font-medium text-red-500 uppercase tracking-widest">Security Advisory</p>
          </div>
          <p className="text-sm text-red-400/90 leading-relaxed">{review.securityNotes}</p>
        </div>
      )}

      {/* Performance Hotspots - NEW */}
      {review.hotspots && review.hotspots.length > 0 && (
        <div className="space-y-4">
          <button
            onClick={() => setShowHotspots(!showHotspots)}
            className="w-full flex items-center justify-between p-6 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="p-2 bg-amber-500/10 rounded-xl text-amber-500 group-hover:bg-amber-500/20 transition-colors">
                <AlertCircle size={18} />
              </div>
              <span className="text-sm font-medium text-gray-300 uppercase tracking-wide">
                Performance Hotspots ({review.hotspots.length})
              </span>
            </div>
            {showHotspots ? <ChevronUp size={18} className="text-gray-500" /> : <ChevronDown size={18} className="text-gray-500" />}
          </button>

          {showHotspots && (
            <div className="space-y-3 animate-in slide-in-from-top-4">
              {review.hotspots.map((hotspot, idx) => (
                <div key={idx} className="flex items-start gap-5 p-6 rounded-2xl bg-white/[0.01] border border-white/5">
                  <div className="mt-0.5">
                    <Info size={16} className={cn(
                      hotspot.severity === 'critical' ? 'text-red-500' :
                        hotspot.severity === 'warning' ? 'text-amber-500' : 'text-blue-500'
                    )} />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm text-gray-300 leading-relaxed">{hotspot.description}</p>
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
        <div className="space-y-8">
          <div className="flex items-center gap-6 px-2">
            <div className="h-px flex-1 bg-white/5" />
            <p className="text-xs font-medium text-gray-500 uppercase tracking-widest flex items-center gap-3">
              <Package size={14} className="text-emerald-500" />
              Dependency Audit ({review.dependencies.length})
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
              className="w-full p-5 rounded-2xl bg-white/[0.02] border border-white/5 text-xs font-medium text-gray-400 uppercase tracking-widest hover:bg-white/[0.04] hover:text-white transition-all flex items-center justify-center gap-2"
            >
              {showAllDeps ? (
                <>Show Less <ChevronUp size={14} /></>
              ) : (
                <>Show All ({review.dependencies.length - 3} more) <ChevronDown size={14} /></>
              )}
            </button>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 flex items-center justify-center gap-4">
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        <p className="text-xs text-gray-500 font-medium uppercase tracking-widest text-center">
          Real-time analysis powered by multi-model AI synthesis
        </p>
      </div>
    </div>
  );
}
