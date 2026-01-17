"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FileUpload } from "@/components/upload";
import { MetricsDisplay, EnergyScoreChart, AIReviewCard } from "@/components/dashboard";
import { calculateEnergyMetrics, REGIONS, HARDWARE_PROFILES } from "@/lib/energy";
import { AnalysisItemSchema, AIReview } from "@/lib/schemas";
import { Sparkles, RotateCcw, Loader2, Zap, TrendingUp, BarChart3, Globe, Cpu, Play, Terminal, CheckCircle2, Files, FileCode } from "lucide-react";
import { storage, databases, DATABASE_ID, COLLECTION_ID, BUCKET_ID, ID } from "@/lib/appwrite";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

interface AnalysisState {
  files: File[];
  contents: string[];
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
    files: [],
    contents: [],
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

  const handleFilesAccepted = useCallback(async (processed: { file: File, content: string }[]) => {
    const files = processed.map(p => p.file);
    const contents = processed.map(p => p.content);
    
    setState((prev) => ({ ...prev, files, contents, isAnalyzing: true, refactored: null, runResults: [] }));
    setError(null);

    try {
      let totalEnergy = 0;
      let totalCO2 = 0;
      let avgScore = 0;
      let maxComplexity = 0;
      let totalLines = 0;

      // Aggregate findings for all files
      for (let i = 0; i < processed.length; i++) {
        const m = await calculateEnergyMetrics(processed[i].file.size, processed[i].file.name, processed[i].content, state.region, state.hardware);
        totalEnergy += m.estimatedEnergy;
        totalCO2 += m.estimatedCO2;
        maxComplexity = Math.max(maxComplexity, m.complexity);
        totalLines += m.lineCount;
      }

      // Analyze the largest/most complex file for the AI Review
      const mainIndex = 0; // In a real app we might pick the largest
      const { getAIReview } = await import("@/lib/energy");
      const review = await getAIReview(contents[mainIndex], { 
        complexity: maxComplexity, 
        language: files[mainIndex].name.split('.').pop(),
        lineCount: totalLines
      });

      const metrics = {
        estimatedEnergy: Math.round(totalEnergy * 1000) / 1000,
        estimatedCO2: Math.round(totalCO2 * 100) / 100,
        gridIntensity: await (await import("@/lib/energy")).getGridIntensity(state.region),
        lineCount: totalLines,
        complexity: maxComplexity,
        energyUnit: 'kWh',
        co2Unit: 'gCO2e'
      };

      if (user && DATABASE_ID && COLLECTION_ID) {
        const validated = AnalysisItemSchema.parse({
          fileName: files.length > 1 ? `${files.length} Files Packet` : files[0].name,
          fileSize: files.reduce((acc, f) => acc + f.size, 0),
          fileId: "sim_" + Date.now(),
          estimatedEnergy: metrics.estimatedEnergy,
          estimatedCO2: metrics.estimatedCO2,
          score: review.score,
          bottleneck: review.bottleneck,
          optimization: review.optimization,
          improvement: review.improvement,
          createdAt: new Date().toISOString(),
          userId: user?.$id,
        });
        await databases.createDocument(DATABASE_ID, COLLECTION_ID, ID.unique(), validated);
      }

      setState((prev) => ({ ...prev, metrics, review, isAnalyzing: false }));
    } catch (err: any) {
      setError("Multi-file audit failed. Ensure all objects are text-based.");
      setState((prev) => ({ ...prev, isAnalyzing: false }));
    }
  }, [user, state.region, state.hardware]);

  const handleRefactor = async () => {
    if (state.contents.length === 0) return;
    setState(prev => ({ ...prev, isRefactoring: true }));
    try {
      const { getAIRefactor } = await import("@/lib/energy");
      const refactored = await getAIRefactor(state.contents[0]);
      setState(prev => ({ ...prev, refactored, isRefactoring: false }));
    } catch (e) {
      setError("AI Refactoring failed.");
      setState(prev => ({ ...prev, isRefactoring: false }));
    }
  };

  const runCode = () => {
    setState(prev => ({ ...prev, isRunning: true, runResults: ["Initializing Multi-Object Sandbox...", `Linking ${state.files.length} Resources...`] }));
    
    setTimeout(() => {
      try {
        const logs: string[] = [];
        const captureLog = (...args: any[]) => logs.push(args.map(a => String(a)).join(" "));
        
        // Execute main file (index 0)
        const sandbox = new Function("console", state.contents[0]);
        sandbox({ log: captureLog, error: captureLog, warn: captureLog });
        
        setState(prev => ({ 
          ...prev, 
          isRunning: false, 
          runResults: [...prev.runResults, "✅ Primary Entry Success.", ...logs] 
        }));
      } catch (e: any) {
        setState(prev => ({ 
          ...prev, 
          isRunning: false, 
          runResults: [...prev.runResults, "❌ Runtime Error in Entry:", e.message] 
        }));
      }
    }, 1500);
  };

  const handleClear = () => {
    setState((prev) => ({ ...prev, files: [], contents: [], metrics: null, review: null, refactored: null, runResults: [] }));
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
    <div className="py-24 bg-[#0a0a0a] min-h-screen overflow-x-hidden">
      <div className="container mx-auto px-4 max-w-7xl">
        
        <div className="flex flex-col md:flex-row gap-16 mb-24 relative">
          <div className="flex-1 space-y-12">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="h-px w-10 bg-emerald-500" />
                <h2 className="text-[10px] font-mono text-emerald-500 uppercase tracking-[0.5em]">Repository.Audit_v3</h2>
              </div>
              <h1 className="text-6xl lg:text-[7rem] font-black tracking-tighter uppercase leading-[0.8] text-white">
                Green <br /> Your <br /> <span className="text-emerald-500 italic">Codebase</span>_
              </h1>
              <p className="text-gray-500 font-medium max-w-lg text-lg leading-relaxed lowercase first-letter:uppercase">
                Perform multi-file computational audits. Toggle global grid parameters and hardware profiles to simulate the full scope of your software footprint.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 space-y-4 group hover:bg-white/[0.04] transition-all">
                <div className="flex items-center gap-2 text-[10px] font-mono text-gray-400 uppercase tracking-widest">
                  <Globe size={14} className="text-emerald-500" />
                  Grid_Location
                </div>
                <select 
                  value={state.region}
                  onChange={(e) => setState(prev => ({ ...prev, region: e.target.value }))}
                  className="w-full bg-transparent border-none p-0 text-xl font-black uppercase tracking-tighter focus:ring-0 text-white cursor-pointer"
                >
                  {Object.entries(REGIONS).map(([id, { label }]) => (
                    <option key={id} value={id} className="bg-black text-[14px] uppercase">{label}</option>
                  ))}
                </select>
              </div>

              <div className="p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 space-y-4 group hover:bg-white/[0.04] transition-all">
                <div className="flex items-center gap-2 text-[10px] font-mono text-gray-400 uppercase tracking-widest">
                  <Cpu size={14} className="text-amber-500" />
                  Target_Hardware
                </div>
                <select 
                  value={state.hardware}
                  onChange={(e) => setState(prev => ({ ...prev, hardware: e.target.value }))}
                  className="w-full bg-transparent border-none p-0 text-xl font-black uppercase tracking-tighter focus:ring-0 text-white cursor-pointer"
                >
                  {Object.entries(HARDWARE_PROFILES).map(([id, { label }]) => (
                    <option key={id} value={id} className="bg-black text-[14px] uppercase">{label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="flex-1 relative">
            <FileUpload
              onFilesAccepted={handleFilesAccepted}
              isLoading={state.isAnalyzing}
              acceptedFiles={state.files}
              onClear={handleClear}
            />
          </div>
        </div>

        {error && (
          <div className="mb-12 p-10 rounded-[2.5rem] bg-red-500/5 border border-red-500/10 text-red-500 font-mono text-[10px] text-center uppercase tracking-[0.4em]">
             System_Halt: {error}
          </div>
        )}

        {state.metrics && state.review && !state.isAnalyzing && (
          <div className="space-y-16 animate-in fade-in slide-in-from-bottom-5 duration-1000">
            
            <div className="flex flex-col lg:flex-row items-center justify-between gap-10 py-12 border-y border-white/5">
              <div className="space-y-2">
                <h2 className="text-4xl font-black flex items-center gap-4 text-white tracking-tighter uppercase">
                  Audit_Summary_Report
                </h2>
                <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Verified across {state.files.length} active objects</p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <button
                  onClick={runCode}
                  disabled={state.isRunning}
                  className="flex items-center gap-4 px-10 py-4 rounded-full bg-white text-black font-black hover:bg-emerald-500 hover:text-white transition-all uppercase tracking-tighter disabled:opacity-50"
                >
                  {state.isRunning ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
                  Execute_Sandbox
                </button>
                <button 
                  onClick={handleClear} 
                  className="p-4 rounded-full border border-white/10 text-gray-500 hover:text-white hover:bg-white/5 transition-all"
                >
                  <RotateCcw size={20} />
                </button>
              </div>
            </div>

            {state.runResults.length > 0 && (
              <div className="rounded-[3rem] border border-emerald-500/20 bg-emerald-500/[0.02] p-12 space-y-8 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-1000">
                  <Terminal size={200} className="text-emerald-500" />
                </div>
                <div className="flex items-center gap-4 border-b border-emerald-500/10 pb-6">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-mono uppercase tracking-[0.5em] text-emerald-500 font-bold">Realtime.Console_Output</span>
                </div>
                <div className="font-mono text-[11px] space-y-4 uppercase opacity-80 max-h-64 overflow-y-auto custom-scrollbar pr-4">
                  {state.runResults.map((line, i) => (
                    <div key={i} className={cn("flex items-start gap-6 border-l border-white/5 pl-6", line.startsWith('✅') ? 'text-emerald-500 font-bold' : line.startsWith('❌') ? 'text-red-500' : 'text-gray-400')}>
                      <span className="text-[8px] opacity-20 font-bold">{String(i+1).padStart(2, '0')}</span>
                      {line}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <MetricsDisplay metrics={state.metrics} />

            <div className="grid lg:grid-cols-2 gap-12">
              <div className="p-12 rounded-[3.5rem] border border-white/10 bg-white/[0.02] backdrop-blur-3xl relative overflow-hidden">
                <h3 className="text-[10px] font-mono font-bold mb-12 text-gray-500 uppercase tracking-[0.5em]">Efficiency.Trajectory</h3>
                <EnergyScoreChart score={state.review.score} />
              </div>

              <div className="space-y-8">
                <AIReviewCard review={state.review} />
                
                {!state.refactored ? (
                  <button
                    onClick={handleRefactor}
                    disabled={state.isRefactoring}
                    className="w-full p-10 rounded-[3rem] border border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 transition-all group flex items-center justify-between text-left relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[80px] group-hover:bg-emerald-500/20 transition-all" />
                    <div className="space-y-3 relative z-10">
                      <p className="text-emerald-500 font-black text-2xl tracking-tighter uppercase italic">Refactor_Force</p>
                      <p className="text-emerald-500/50 text-[10px] uppercase tracking-widest font-mono">Rewrite entry point for maximum efficiency</p>
                    </div>
                    {state.isRefactoring ? (
                      <Loader2 className="animate-spin text-emerald-500" />
                    ) : (
                      <Sparkles size={28} className="text-emerald-500 group-hover:scale-125 transition-transform" />
                    )}
                  </button>
                ) : (
                   <div className="p-10 rounded-[3.5rem] border border-emerald-500/30 bg-emerald-500/5 space-y-8 animate-in zoom-in-95 duration-500">
                      <div className="flex items-center justify-between border-b border-emerald-500/10 pb-6">
                         <div className="flex items-center gap-4 text-emerald-500">
                            <CheckCircle2 size={20} />
                            <span className="text-sm font-black uppercase tracking-widest text-emerald-500 underline underline-offset-8">Optimization_Locked</span>
                         </div>
                         <button 
                          onClick={() => setState(prev => ({ ...prev, refactored: null }))}
                          className="text-[10px] font-mono text-emerald-500/50 uppercase hover:text-white transition-colors"
                         >Close_Terminal</button>
                      </div>
                      <div className="bg-[#050505] rounded-3xl p-8 font-mono text-[11px] leading-relaxed text-emerald-500/90 overflow-x-auto border border-white/5 max-h-80 custom-scrollbar shadow-inner">
                        <pre className="selection:bg-emerald-500/20">{state.refactored.code}</pre>
                      </div>
                      <div className="space-y-4">
                         <div className="flex items-center gap-2">
                           <Zap size={10} className="text-emerald-500" />
                           <span className="text-[10px] font-mono text-emerald-500/50 uppercase tracking-widest">Architect.Notes</span>
                         </div>
                         <p className="text-[13px] text-gray-400 font-medium italic leading-relaxed lowercase first-letter:uppercase">
                           &quot;{state.refactored.explanation}&quot;
                         </p>
                      </div>
                   </div>
                )}
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
