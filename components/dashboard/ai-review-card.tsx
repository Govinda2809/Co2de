"use client";

import { AlertTriangle, Lightbulb, TrendingUp, Target } from "lucide-react";
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
      label: "Primary Bottleneck",
      value: review.bottleneck,
      icon: AlertTriangle,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
    },
    {
      label: "Recommended Optimization",
      value: review.optimization,
      icon: Lightbulb,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      label: "Expected Improvement",
      value: review.improvement,
      icon: TrendingUp,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
    },
  ];

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Target className="w-5 h-5 text-emerald-500" />
          AI Energy Review
        </h3>
        <span className="text-xs px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-600 font-medium">
          Powered by AI
        </span>
      </div>

      <div className="space-y-3">
        {items.map((item, index) => (
          <div
            key={item.label}
            className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900"
            style={{ animationDelay: `${index * 150}ms` }}
          >
            <div className="flex items-start gap-3">
              <div className={cn("p-2 rounded-lg shrink-0", item.bgColor)}>
                <item.icon className={cn("w-4 h-4", item.color)} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  {item.label}
                </p>
                <p className="text-sm">{item.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-gray-500 text-center italic">
        * This analysis is an estimate based on code patterns and heuristics
      </p>
    </div>
  );
}
