"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FileUpload } from "@/components/upload";
import { MetricsDisplay, EnergyScoreChart, AIReviewCard } from "@/components/dashboard";
import { calculateEnergyMetrics } from "@/lib/energy";
import { AnalysisItemSchema, AIReview } from "@/lib/schemas";
import { Sparkles, RotateCcw, Loader2, Zap, TrendingUp, BarChart3 } from "lucide-react";
import { storage, databases, DATABASE_ID, COLLECTION_ID, BUCKET_ID, ID } from "@/lib/appwrite";
import { useAuth } from "@/hooks/use-auth";

interface AnalysisState {
  file: File | null;
  content: string;
  metrics: {
    estimatedEnergy: number;
    estimatedCO2: number;
    energyUnit: string;
    co2Unit: string;
    gridIntensity: number;
    lineCount: number;
    language?: string;
    complexity: number;
  } | null;
  review: AIReview | null;
  isAnalyzing: boolean;
}

export default function AnalyzePage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [state, setState] = useState<AnalysisState>({
    file: null,
    content: "",
    metrics: null,
    review: null,
    isAnalyzing: false,
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login?callbackUrl=/analyze");
    }
  }, [user, authLoading, router]);

  const handleFileAccepted = useCallback(async (file: File, content: string) => {
    setState((prev) => ({ ...prev, file, content, isAnalyzing: true }));
    setError(null);

    try {
      // 1. Calculate Metrics (Carbon-Aware)
      const metrics = await calculateEnergyMetrics(file.size, file.name, content);

      // Attempt real AI analysis
      let review;
      try {
        const { getAIReview } = await import("@/lib/energy");
        review = await getAIReview(content);
      } catch (e) {
        console.warn("AI Analysis failed", e);
        // If AI fails, we can't provide a review without dummy data.
        // We'll throw to let the error handler catch it, OR provide a "N/A" review.
        // Given "remove all dummy data", failing or N/A is appropriate.
        throw new Error("AI Analysis unavailable and dummy data is disabled.");
      }

      // 2. Data Validation with Zod (Enforcement)
      const rawData = {
        fileName: file.name,
        fileSize: file.size,
        fileId: "placeholder",
        estimatedEnergy: metrics.estimatedEnergy,
        estimatedCO2: metrics.estimatedCO2,
        score: review.score,
        bottleneck: review.bottleneck,
        optimization: review.optimization,
        improvement: review.improvement,
        createdAt: new Date().toISOString(),
        userId: user?.$id,
      };

      const validatedData = AnalysisItemSchema.parse(rawData);

      // 3. Upload to Appwrite
      if (DATABASE_ID && COLLECTION_ID && BUCKET_ID) {
        try {
          const uploadedFile = await storage.createFile(BUCKET_ID, ID.unique(), file);
          validatedData.fileId = uploadedFile.$id;
          await databases.createDocument(DATABASE_ID, COLLECTION_ID, ID.unique(), validatedData);
        } catch (dbError) {
          console.error("Appwrite save failed:", dbError);
        }
      }

      setState((prev) => ({
        ...prev,
        metrics,
        review,
        isAnalyzing: false,
      }));
    } catch (err) {
      console.error("Analysis failed:", err);
      setError("Failed to analyze file. Please ensure it is a valid text-based code file.");
      setState((prev) => ({ ...prev, isAnalyzing: false }));
    }
  }, [user]);

  const handleClear = useCallback(() => {
    setState({
      file: null,
      content: "",
      metrics: null,
      review: null,
      isAnalyzing: false,
    });
    setError(null);
  }, []);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-white animate-spin" />
      </div>
    );
  }

  return (
    <div className="py-24 bg-[#0a0a0a] min-h-screen">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16 px-4">
            <h1 className="text-4xl sm:text-6xl font-black mb-6 tracking-tighter text-white uppercase">
              Analyze Your Code
            </h1>
            <p className="text-gray-500 max-w-xl mx-auto uppercase tracking-widest text-xs font-mono">
              Identify the environmental footprint of your software architecture instantly
            </p>
          </div>

          <div className="space-y-12">
            <FileUpload
              onFileAccepted={handleFileAccepted}
              isLoading={state.isAnalyzing}
              acceptedFile={state.file}
              onClear={handleClear}
            />

            {error && (
              <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm text-center font-mono">
                {error}
              </div>
            )}

            {state.metrics && state.review && !state.isAnalyzing && (
              <div className="space-y-12 animate-fade-in px-2">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <h2 className="text-2xl font-bold flex items-center gap-3 text-white tracking-tight">
                    <Sparkles className="w-6 h-6 text-emerald-500" />
                    ANALYSIS_RESULT
                  </h2>
                  <div className="flex items-center gap-4">
                    <div className="hidden lg:flex items-center gap-2 px-4 py-2 text-[10px] font-mono text-gray-500 uppercase tracking-widest bg-white/[0.03] rounded-full border border-white/5">
                      <Zap className="w-3 h-3 text-amber-500" />
                      Protocol_Intensity: {state.metrics.gridIntensity}g
                    </div>
                    <Link
                      href="/dashboard"
                      className="hidden sm:flex items-center gap-2 px-5 py-2.5 text-[10px] font-bold rounded-full bg-white text-black hover:bg-emerald-500 hover:text-white transition-all uppercase tracking-[0.2em]"
                    >
                      <BarChart3 className="w-3.5 h-3.5" />
                      View_Ledger
                    </Link>
                    <button
                      onClick={handleClear}
                      className="flex items-center gap-2 px-5 py-2.5 text-[10px] font-bold rounded-full border border-white/10 text-gray-500 hover:text-white hover:bg-white/5 transition-all uppercase tracking-[0.2em]"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Reset
                    </button>
                  </div>
                </div>

                <MetricsDisplay metrics={state.metrics} />

                <div className="grid lg:grid-cols-2 gap-12">
                  <div className="p-8 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                      <TrendingUp className="w-32 h-32 text-white" />
                    </div>
                    <h3 className="text-sm font-bold mb-8 text-center text-gray-500 uppercase tracking-widest font-mono">Energy Efficiency Score</h3>
                    <EnergyScoreChart score={state.review.score} />
                    <p className="text-center text-xs text-gray-500 mt-8 font-mono leading-relaxed max-w-xs mx-auto">
                      Calculated using pattern recognition and computational density factors.
                    </p>
                  </div>

                  <div className="p-8 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl">
                    <AIReviewCard review={state.review} />
                  </div>
                </div>

                <div className="p-8 rounded-3xl bg-white/5 border border-white/10 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
                  <h3 className="font-bold mb-3 text-white uppercase tracking-tighter flex items-center gap-2">
                    💡 Carbon-Aware Insight
                  </h3>
                  <p className="text-sm text-gray-400 leading-relaxed font-medium">
                    Your current grid intensity is <span className="text-emerald-500 font-bold">{state.metrics.gridIntensity} gCO2/kWh</span>.
                    Running intensive operations when this value is lower (e.g., during high renewable output) significantly reduces your carbon footprint.
                  </p>
                </div>
              </div>
            )}

            {state.isAnalyzing && (
              <div className="flex flex-col items-center justify-center py-24 space-y-6">
                <Loader2 className="w-16 h-16 text-white animate-spin opacity-20" />
                <p className="text-gray-500 font-mono text-xs uppercase tracking-[0.3em] animate-pulse">Computing environmental footprint...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

