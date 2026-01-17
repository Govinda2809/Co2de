"use client";

import { AlertTriangle, Lightbulb, TrendingUp, Target, ShieldCheck, Zap } from "lucide-react";
import { AIReview } from "@/lib/schemas";
import { cn } from "@/lib/utils";

interface AIReviewCardProps {
  review: AIReview | null;
  className?: string;
}

export function AIReviewCard({ review, className }: AIReviewCardProps) {
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

  return (
    <div className={cn("space-y-8", className)}>
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
           Verified_By_CO2DE_AI
        </div>
      </div>

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
                <p className="text-sm text-gray-400 font-medium leading-relaxed lowercase first-letter:uppercase">{item.value}</p>
              </div>
            </div>
          </div>
        ))}

        {review.dependencies && review.dependencies.length > 0 && (
          <div className="mt-8 space-y-6">
            <div className="flex items-center gap-4 px-2">
              <div className="h-px flex-1 bg-white/5" />
              <p className="text-[10px] font-mono text-gray-500 uppercase tracking-[0.5em] font-black">Dependency_Audit</p>
              <div className="h-px flex-1 bg-white/5" />
            </div>
            
            <div className="grid gap-4">
               {review.dependencies.map((dep, idx) => (
                 <div key={idx} className="p-8 rounded-[2.5rem] bg-emerald-500/[0.02] border border-emerald-500/10 flex flex-col md:flex-row md:items-center justify-between gap-6 group hover:bg-emerald-500/[0.04] transition-all">
                    <div className="space-y-1">
                       <div className="flex items-center gap-3">
                          <span className="text-sm font-black text-white uppercase italic">{dep.name}</span>
                          <span className="text-[9px] font-mono text-emerald-500/40 uppercase tracking-widest font-bold px-2 py-0.5 rounded-full border border-emerald-500/10">Inefficient</span>
                       </div>
                       <p className="text-[11px] text-gray-500 font-medium lowercase first-letter:uppercase">{dep.impact}</p>
                    </div>
                    <div className="flex items-center gap-4 bg-black/40 p-4 rounded-2xl border border-white/5">
                       <TrendingUp size={14} className="text-emerald-500" />
                       <div className="space-y-0.5">
                          <p className="text-[8px] font-mono text-gray-600 uppercase tracking-widest">Recommended_Swap</p>
                          <p className="text-[11px] font-black text-emerald-500 uppercase italic tracking-tighter">{dep.alternative}</p>
                       </div>
                    </div>
                 </div>
               ))}
            </div>
          </div>
        )}
      </div>

      <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-center gap-4">
         <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
         <p className="text-[10px] text-gray-600 font-mono uppercase tracking-widest italic text-center">
           Heuristic simulation derived from structural AST parsing
         </p>
      </div>
    </div>
  );
}
