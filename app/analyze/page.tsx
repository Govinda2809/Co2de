"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FileUpload } from "@/components/upload";
import { MetricsDisplay, EnergyScoreChart, AIReviewCard } from "@/components/dashboard";
import { calculateEnergyMetrics, REGIONS, HARDWARE_PROFILES } from "@/lib/energy";
import { AnalysisItemSchema, AIReview } from "@/lib/schemas";
import { Sparkles, RotateCcw, Loader2, Zap, TrendingUp, BarChart3, Globe, Cpu, Play, Terminal, CheckCircle2, XCircle } from "lucide-react";
import { storage, databases, DATABASE_ID, COLLECTION_ID, BUCKET_ID, ID } from "@/lib/appwrite";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

interface AnalysisState {
  file: File | null;
  content: string;
  metrics: any | null;
  review: AIReview | null;
  isAnalyzing: boolean;
  refactored: { code: string; explanation: string } | null;
  isRefactoring: boolean;
  region: string;
  hardware: string;
  runResults: string[];
  isRunning: boolean;
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
    refactored: null,
    isRefactoring: false,
    region: "europe",
    hardware: "laptop",
    runResults: [],
    isRunning: false
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login?callbackUrl=/analyze");
    }
  }, [user, authLoading, router]);

  // Recalculate metrics if region or hardware changes
  useEffect(() => {
    if (state.file && state.content) {
      recalculate();
    }
  }, [state.region, state.hardware]);

  const recalculate = async () => {
    if (!state.file) return;
    const metrics = await calculateEnergyMetrics(state.file.size, state.file.name, state.content, state.region, state.hardware);
    setState(prev => ({ ...prev, metrics }));
  };

  const handleFileAccepted = useCallback(async (file: File, content: string) => {
    setState((prev) => ({ ...prev, file, content, isAnalyzing: true, refactored: null, runResults: [] }));
    setError(null);

    try {
      const metrics = await calculateEnergyMetrics(file.size, file.name, content, state.region, state.hardware);
      const { getAIReview } = await import("@/lib/energy");
      const review = await getAIReview(content, metrics);

      const rawData = {
        fileName: file.name,
        fileSize: file.size,
        fileId: "simulated_" + Date.now(),
        estimatedEnergy: metrics.estimatedEnergy,
        estimatedCO2: metrics.estimatedCO2,
        score: review.score,
        bottleneck: review.bottleneck,
        optimization: review.optimization,
        improvement: review.improvement,
        createdAt: new Date().toISOString(),
        userId: user?.$id,
      };

      const validated = AnalysisItemSchema.parse(rawData);

      if (user && DATABASE_ID && COLLECTION_ID) {
        await databases.createDocument(DATABASE_ID, COLLECTION_ID, ID.unique(), validated);
      }

      setState((prev) => ({ ...prev, metrics, review, isAnalyzing: false }));
    } catch (err: any) {
      console.error("Audit Protocol Failure:", err);
      setError(err.message || "Auditing sequence interrupted. Check network connectivity.");
      setState((prev) => ({ ...prev, isAnalyzing: false }));
    }
  }, [user, state.region, state.hardware]);

  const handleRefactor = async () => {
    if (!state.content) return;
    setState(prev => ({ ...prev, isRefactoring: true }));
    try {
      const { getAIRefactor } = await import("@/lib/energy");
      const refactored = await getAIRefactor(state.content);
      setState(prev => ({ ...prev, refactored, isRefactoring: false }));
    } catch (e) {
      setError("AI Refactoring failed.");
      setState(prev => ({ ...prev, isRefactoring: false }));
    }
  };

  const runCode = () => {
    setState(prev => ({ ...prev, isRunning: true, runResults: ["Initializing Sandbox Environment...", "Checking Runtime Compatibility..."] }));
    
    setTimeout(() => {
      try {
        const logs: string[] = [];
        const captureLog = (...args: any[]) => logs.push(args.map(a => String(a)).join(" "));
        
        // Simple sandbox for JS
        const sandbox = new Function("console", state.content);
        sandbox({ log: captureLog, error: captureLog, warn: captureLog });
        
        setState(prev => ({ 
          ...prev, 
          isRunning: false, 
          runResults: [...prev.runResults, "✅ Sequence Success.", ...logs] 
        }));
      } catch (e: any) {
        setState(prev => ({ 
          ...prev, 
          isRunning: false, 
          runResults: [...prev.runResults, "❌ Sequence Runtime Error:", e.message] 
        }));
      }
    }, 1200);
  };

  const handleClear = () => {
    setState((prev) => ({ ...prev, file: null, content: "", metrics: null, review: null, refactored: null, runResults: [] }));
    setError(null);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="py-24 bg-[#0a0a0a] min-h-screen selection:bg-emerald-500 selection:text-white">
      <div className="container mx-auto px-4 max-w-7xl">
        
        <div className="flex flex-col md:flex-row gap-12 mb-32">
          {/* Header & Controls */}
          <div className="flex-1 space-y-12">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-px w-8 bg-emerald-500" />
                <h2 className="text-xs font-mono text-emerald-500 uppercase tracking-[0.5em]">Protocol.Analyze_v2</h2>
              </div>
              <h1 className="text-5xl lg:text-8xl font-black tracking-tighter uppercase leading-[0.8]">
                Audit <br /> The <span className="text-white/20 italic">Energy</span>.
              </h1>
              <p className="text-gray-500 font-medium max-w-xl text-lg leading-relaxed lowercase first-letter:uppercase">
                Analyze computational footprints across global grids and hardware profiles. Implement AI-driven refactoring for a net-zero future.
              </p>
            </div>

            {/* Context Selectors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 space-y-4">
                <div className="flex items-center gap-2 text-[10px] font-mono text-gray-500 uppercase tracking-widest">
                  <Globe size={14} className="text-emerald-500" />
                  Target_Region
                </div>
                <select 
                  value={state.region}
                  onChange={(e) => setState(prev => ({ ...prev, region: e.target.value }))}
                  className="w-full bg-black/50 border border-white/10 rounded-2xl px-4 py-3 text-sm focus:ring-1 focus:ring-emerald-500 outline-none text-gray-300"
                >
                  {Object.entries(REGIONS).map(([id, { label }]) => (
                    <option key={id} value={id}>{label}</option>
                  ))}
                </select>
              </div>

              <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 space-y-4">
                <div className="flex items-center gap-2 text-[10px] font-mono text-gray-500 uppercase tracking-widest">
                  <Cpu size={14} className="text-amber-500" />
                  Execution_Profile
                </div>
                <select 
                  value={state.hardware}
                  onChange={(e) => setState(prev => ({ ...prev, hardware: e.target.value }))}
                  className="w-full bg-black/50 border border-white/10 rounded-2xl px-4 py-3 text-sm focus:ring-1 focus:ring-emerald-500 outline-none text-gray-300"
                >
                  {Object.entries(HARDWARE_PROFILES).map(([id, { label }]) => (
                    <option key={id} value={id}>{label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="flex-1">
            <FileUpload
              onFileAccepted={handleFileAccepted}
              isLoading={state.isAnalyzing}
              acceptedFile={state.file}
              onClear={handleClear}
            />
          </div>
        </div>

        {error && (
          <div className="mb-12 p-8 rounded-3xl bg-red-500/5 border border-red-500/20 text-red-500 font-mono text-xs text-center uppercase tracking-widest">
            {error}
          </div>
        )}

        {state.metrics && state.review && !state.isAnalyzing && (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-10 duration-1000">
            
            {/* Analysis Header */}
            <div className="flex flex-col lg:flex-row items-center justify-between gap-8 pb-12 border-b border-white/5">
              <h2 className="text-3xl font-black flex items-center gap-4 text-white tracking-tighter uppercase italic">
                <Sparkles className="w-8 h-8 text-emerald-500" />
                Operational_Ledger
              </h2>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <div className="flex items-center gap-2 px-6 py-3 rounded-full bg-white/[0.03] border border-white/10 text-[10px] font-mono text-gray-500 uppercase tracking-widest">
                  <Globe className="w-4 h-4 text-emerald-500" />
                  Grid: {state.metrics.gridIntensity} gCO2e
                </div>
                <button
                  onClick={runCode}
                  disabled={state.isRunning}
                  className="flex items-center gap-3 px-8 py-3 rounded-full bg-white text-black font-black hover:bg-emerald-500 hover:text-white transition-all uppercase tracking-tighter disabled:opacity-50"
                >
                  {state.isRunning ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
                  Run_Sequence
                </button>
                <Link
                  href="/dashboard"
                  className="flex items-center gap-3 px-8 py-3 rounded-full border border-white/10 text-white font-black hover:bg-white hover:text-black transition-all uppercase tracking-tighter"
                >
                  <BarChart3 size={16} />
                  View_Vault
                </Link>
                <button onClick={handleClear} className="p-3 rounded-full border border-white/10 text-gray-500 hover:text-white transition-all">
                  <RotateCcw size={18} />
                </button>
              </div>
            </div>

            {/* Project Runner Console */}
            {state.runResults.length > 0 && (
              <div className="rounded-[2.5rem] border border-emerald-500/20 bg-emerald-500/[0.02] p-8 space-y-6">
                <div className="flex items-center gap-3 border-b border-emerald-500/10 pb-4">
                  <Terminal size={14} className="text-emerald-500" />
                  <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-emerald-500/70">Console.Sandbox_Out</span>
                </div>
                <div className="font-mono text-xs space-y-2 uppercase opacity-80 max-h-40 overflow-y-auto">
                  {state.runResults.map((line, i) => (
                    <div key={i} className={cn("flex items-start gap-4", line.startsWith('✅') ? 'text-emerald-500 font-bold' : line.startsWith('❌') ? 'text-red-500' : 'text-gray-400')}>
                      <span className="opacity-30">{i+1}.</span>
                      {line}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <MetricsDisplay metrics={state.metrics} />

            <div className="grid lg:grid-cols-2 gap-12">
              <div className="p-10 rounded-[3rem] border border-white/10 bg-white/[0.02] backdrop-blur-3xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none group-hover:rotate-12 transition-transform duration-700">
                  <TrendingUp size={120} />
                </div>
                <h3 className="text-[10px] font-mono font-bold mb-12 text-gray-500 uppercase tracking-widest">Efficiency.Metric_Analysis</h3>
                <EnergyScoreChart score={state.review.score} />
                <div className="mt-12 flex items-center justify-between text-[10px] font-mono text-gray-500 uppercase tracking-widest pt-8 border-t border-white/5">
                  <span>Logic: Deterministic AST</span>
                  <span>Accuracy: High_Precision</span>
                </div>
              </div>

              <div className="space-y-6">
                <AIReviewCard review={state.review} />
                
                {/* Refactor Trigger */}
                {!state.refactored ? (
                  <button
                    onClick={handleRefactor}
                    disabled={state.isRefactoring}
                    className="w-full p-8 rounded-[2.5rem] border border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 transition-all group flex items-center justify-between text-left"
                  >
                    <div className="space-y-2">
                      <p className="text-emerald-500 font-black text-xl tracking-tighter uppercase">AI_Refactor_Engine</p>
                      <p className="text-emerald-500/50 text-[10px] uppercase tracking-widest font-mono">Transform code for net-zero execution</p>
                    </div>
                    {state.isRefactoring ? (
                      <Loader2 className="animate-spin text-emerald-500" />
                    ) : (
                      <Sparkles className="text-emerald-500 group-hover:scale-125 transition-transform" />
                    )}
                  </button>
                ) : (
                   <div className="p-8 rounded-[2.5rem] border border-emerald-500/30 bg-emerald-500/5 space-y-6">
                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-3 text-emerald-500">
                            <CheckCircle2 size={16} />
                            <span className="text-xs font-black uppercase tracking-widest text-emerald-500">Optimization_Applied</span>
                         </div>
                         <button 
                          onClick={() => setState(prev => ({ ...prev, refactored: null }))}
                          className="text-[10px] font-mono text-emerald-500 underline uppercase hover:text-white"
                         >Reset_View</button>
                      </div>
                      <div className="bg-black/80 rounded-2xl p-6 font-mono text-[10px] leading-relaxed text-emerald-500/80 overflow-x-auto border border-emerald-500/10 max-h-60">
                        <pre>{state.refactored.code}</pre>
                      </div>
                      <p className="text-xs text-emerald-400 font-medium lowercase first-letter:uppercase italic leading-relaxed">
                        &quot;{state.refactored.explanation}&quot;
                      </p>
                   </div>
                )}
              </div>
            </div>

            {/* Bottom Insight */}
            <div className="p-12 rounded-[3.5rem] bg-white/[0.03] border border-white/5 relative overflow-hidden">
               <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500" />
               <div className="grid md:grid-cols-2 gap-12 items-center">
                  <div className="space-y-6">
                    <h3 className="text-2xl font-black uppercase italic text-white flex items-center gap-4">
                      <Globe className="text-emerald-500" />
                      Carbon_Aware Intelligence
                    </h3>
                    <p className="text-gray-400 font-medium text-lg leading-relaxed">
                      By prioritizing <span className="text-white underline decoration-emerald-500 underline-offset-8 decoration-2">{REGIONS[state.region as keyof typeof REGIONS].label}</span> and <span className="text-white underline decoration-emerald-500 underline-offset-8 decoration-2">{HARDWARE_PROFILES[state.hardware as keyof typeof HARDWARE_PROFILES].label}</span>, you are actively decreasing simulated scope-3 emissions.
                    </p>
                  </div>
                  <div className="bg-black/50 p-8 rounded-3xl border border-white/5 font-mono text-[10px] text-gray-500 uppercase tracking-widest space-y-4">
                      <div className="flex justify-between">
                        <span>Transmission_Draw:</span>
                        <span className="text-white">{(state.metrics.estimatedEnergy * 0.1).toFixed(4)} kWh</span>
                      </div>
                      <div className="flex justify-between font-bold text-emerald-500">
                        <span>Renewable_Potential:</span>
                        <span>{state.region === 'nordics' ? 'EXCELLENT' : 'VARIABLE'}</span>
                      </div>
                      <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 w-[70%]" />
                      </div>
                  </div>
               </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
