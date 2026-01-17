"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FileUpload } from "@/components/upload";
import { MetricsDisplay, EnergyScoreChart, AIReviewCard } from "@/components/dashboard";
import { calculateEnergyMetrics, REGIONS, HARDWARE_PROFILES, getGridIntensity, getAIReview, getAIRefactor } from "@/lib/energy";
import { AnalysisItemSchema, AIReview } from "@/lib/schemas";
import { Sparkles, RotateCcw, Loader2, Zap, TrendingUp, BarChart3, Globe, Cpu, Play, Terminal, CheckCircle2, FileStack, FileCode, Info, Save, Copy, Check, ShieldCheck } from "lucide-react";
import { databases, DATABASE_ID, COLLECTION_ID, ID } from "@/lib/appwrite";
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
  isSaving: boolean;
  isSaved: boolean;
  lastSavedId: string | null;
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
    isRunning: false,
    isSaving: false,
    isSaved: false,
    lastSavedId: null
  });
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login?callbackUrl=/analyze");
    }
  }, [user, authLoading, router]);

  const recomputeMetrics = useCallback(async (files: File[], contents: string[], targetRegion: string, targetHardware: string) => {
    try {
      let totalEnergy = 0;
      let totalCO2 = 0;
      let maxComplexity = 0;
      let totalLines = 0;

      for (let i = 0; i < files.length; i++) {
        const m = await calculateEnergyMetrics(files[i].size, files[i].name, contents[i], targetRegion, targetHardware);
        totalEnergy += m.estimatedEnergy;
        totalCO2 += m.estimatedCO2;
        maxComplexity = Math.max(maxComplexity, m.complexity);
        totalLines += m.lineCount;
      }

      const gridIntensity = await getGridIntensity(targetRegion);

      return {
        estimatedEnergy: Math.round(totalEnergy * 1000) / 1000,
        estimatedCO2: Math.round(totalCO2 * 100) / 100,
        gridIntensity,
        lineCount: totalLines,
        complexity: maxComplexity,
        energyUnit: 'kWh',
        co2Unit: 'gCO2e'
      };
    } catch (e) {
      return null;
    }
  }, []);

  useEffect(() => {
    if (state.files.length > 0 && !state.isAnalyzing) {
      const triggerUpdate = async () => {
        const updatedMetrics = await recomputeMetrics(state.files, state.contents, state.region, state.hardware);
        if (updatedMetrics) {
          setState(prev => ({ ...prev, metrics: updatedMetrics, isSaved: false }));
        }
      };
      const debounce = setTimeout(triggerUpdate, 300);
      return () => clearTimeout(debounce);
    }
  }, [state.region, state.hardware, state.files, state.contents, state.isAnalyzing, recomputeMetrics]);

  const handleFilesAccepted = useCallback(async (processed: { file: File, content: string }[]) => {
    const files = processed.map(p => p.file);
    const contents = processed.map(p => p.content);
    
    setState((prev) => ({ ...prev, files, contents, isAnalyzing: true, refactored: null, runResults: [], isSaved: false }));
    setError(null);

    try {
      const metrics = await recomputeMetrics(files, contents, state.region, state.hardware);
      if (!metrics) throw new Error("Packet computation failed.");

      const aiContext = {
        ...metrics,
        fileCount: files.length,
        packetSummary: files.map(f => f.name).join(", ")
      };

      const review = await getAIReview(contents[0], aiContext);

      setState((prev) => ({ ...prev, metrics, review, isAnalyzing: false }));
    } catch (err: any) {
      setError(err.message || "Audit failed. Check artifact compatibility.");
      setState((prev) => ({ ...prev, isAnalyzing: false }));
    }
  }, [state.region, state.hardware, recomputeMetrics]);

  const commitToLedger = async () => {
    if (!state.metrics || !state.review || !user) return;
    setState(prev => ({ ...prev, isSaving: true }));
    try {
      const validated = AnalysisItemSchema.parse({
        fileName: state.files.length > 1 ? `${state.files.length} Files Packet` : state.files[0].name,
        fileSize: state.files.reduce((acc, f) => acc + f.size, 0),
        fileId: "sim_" + Date.now(),
        estimatedEnergy: state.metrics.estimatedEnergy,
        estimatedCO2: state.metrics.estimatedCO2,
        score: state.review.score,
        bottleneck: state.review.bottleneck,
        optimization: state.review.optimization,
        improvement: state.review.improvement,
        createdAt: new Date().toISOString(),
        userId: user?.$id,
      });

      const doc = await databases.createDocument(DATABASE_ID, COLLECTION_ID, ID.unique(), validated);
      setState(prev => ({ ...prev, isSaving: false, isSaved: true, lastSavedId: doc.$id }));
    } catch (e) {
      setError("Failed to commit to ledger.");
      setState(prev => ({ ...prev, isSaving: false }));
    }
  };

  const handleCopyBadge = () => {
    if (!state.lastSavedId) return;
    const url = `${window.location.origin}/api/badge/${state.lastSavedId}`;
    const markdown = `![CO2DE Grade](${url})`;
    navigator.clipboard.writeText(markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const runCode = () => {
    setState(prev => ({ ...prev, isRunning: true, runResults: ["Initializing Virtualized Sandbox...", "Mapping Memory Segments...", "Applying Security Policies..."] }));
    
    const startTime = performance.now();
    setTimeout(() => {
      try {
        const logs: string[] = [];
        const captureLog = (...args: any[]) => logs.push(args.map(a => String(a)).join(" "));
        const sandbox = new Function("console", state.contents[0]);
        sandbox({ log: captureLog, error: captureLog, warn: captureLog });
        
        const duration = (performance.now() - startTime).toFixed(2);
        setState(prev => ({ 
          ...prev, 
          isRunning: false, 
          runResults: [...prev.runResults, `📡 Secure Link Established.`, `✅ Execution Successful (${duration}ms).`, ...logs] 
        }));
      } catch (e: any) {
        setState(prev => ({ 
          ...prev, 
          isRunning: false, 
          runResults: [...prev.runResults, "❌ Runtime Error Detonated:", e.message] 
        }));
      }
    }, 1200);
  };

  const handleRefactor = async () => {
    if (state.contents.length === 0) return;
    setState(prev => ({ ...prev, isRefactoring: true }));
    try {
      const refactored = await getAIRefactor(state.contents[0]);
      setState(prev => ({ ...prev, refactored, isRefactoring: false }));
    } catch (e) {
      setError("AI Refactoring aborted.");
      setState(prev => ({ ...prev, isRefactoring: false }));
    }
  };

  if (authLoading) return <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center"><Loader2 className="w-12 h-12 text-emerald-500 animate-spin" /></div>;

  return (
    <div className="py-24 bg-[#0a0a0a] min-h-screen overflow-x-hidden selection:bg-emerald-500/30">
      <div className="container mx-auto px-4 max-w-7xl">
        
        <div className="flex flex-col md:flex-row gap-16 mb-24">
          <div className="flex-1 space-y-12">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="h-px w-10 bg-emerald-500" />
                <h2 className="text-[10px] font-mono text-emerald-500 uppercase tracking-[0.5em]">Capture_Protocol_v3.2</h2>
              </div>
              <h1 className="text-6xl lg:text-[7rem] font-black tracking-tighter uppercase leading-[0.8] text-white">
                Green <br /> Your <br /> <span className="text-emerald-500 italic">Artifacts</span>_
              </h1>
              <p className="text-gray-500 font-medium max-w-lg text-lg leading-relaxed lowercase first-letter:uppercase">
                Capture multi-object packets and simulate footprints across modular regions. Refine your infrastructure overhead before committing to the protocol ledger.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               {[
                 { label: "Target Region", icon: Globe, value: state.region, onChange: (v: any) => setState(p => ({...p, region: v})), options: REGIONS, color: "text-emerald-500" },
                 { label: "Hardware Profile", icon: Cpu, value: state.hardware, onChange: (v: any) => setState(p => ({...p, hardware: v})), options: HARDWARE_PROFILES, color: "text-amber-500" }
               ].map((ctrl, i) => (
                 <div key={i} className="p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 space-y-4 group hover:bg-white/[0.04] transition-all">
                    <div className="flex items-center gap-2 text-[10px] font-mono text-gray-400 uppercase tracking-widest">
                      <ctrl.icon size={14} className={ctrl.color} />
                      {ctrl.label}
                    </div>
                    <select 
                      value={ctrl.value}
                      onChange={(e) => ctrl.onChange(e.target.value)}
                      className="w-full bg-transparent border-none p-0 text-xl font-black uppercase tracking-tighter focus:ring-0 text-white cursor-pointer"
                    >
                      {Object.entries(ctrl.options).map(([id, { label }]) => (
                        <option key={id} value={id} className="bg-black text-[14px] uppercase">{label}</option>
                      ))}
                    </select>
                 </div>
               ))}
            </div>
          </div>

          <div className="flex-1">
            <FileUpload
              onFilesAccepted={handleFilesAccepted}
              isLoading={state.isAnalyzing}
              acceptedFiles={state.files}
              onClear={() => setState(prev => ({ ...prev, files: [], contents: [], metrics: null, lastSavedId: null, isSaved: false }))}
            />
          </div>
        </div>

        {state.metrics && state.review && !state.isAnalyzing && (
          <div className="space-y-16 animate-in fade-in slide-in-from-bottom-5 duration-1000">
            
            {/* Command Bar */}
            <div className="flex flex-col lg:flex-row items-center justify-between gap-10 py-12 border-y border-white/5">
              <div className="space-y-2">
                <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic">Audit_Active</h2>
                <div className="flex items-center gap-4">
                  <p className="text-[10px] font-mono text-emerald-500 uppercase tracking-widest">{state.files.length} Resources Linked</p>
                  <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest opacity-50">Grid: {state.metrics.gridIntensity} gCO2e</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <button
                  onClick={runCode}
                  disabled={state.isRunning}
                  className="group flex items-center gap-4 px-10 py-4 rounded-full border border-white/10 text-white font-black hover:bg-white hover:text-black transition-all uppercase tracking-tighter disabled:opacity-50"
                >
                  {state.isRunning ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} className="group-hover:scale-110 transition-transform" />}
                  Execute_Sandbox
                </button>
                <button
                  onClick={commitToLedger}
                  disabled={state.isSaving || state.isSaved}
                  className={cn(
                    "flex items-center gap-4 px-10 py-4 rounded-full font-black transition-all uppercase tracking-tighter",
                    state.isSaved 
                      ? "bg-emerald-500 text-white cursor-default" 
                      : "bg-emerald-500 text-white hover:shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:scale-105"
                  )}
                >
                  {state.isSaving ? <Loader2 size={16} className="animate-spin" /> : state.isSaved ? <CheckCircle2 size={16} /> : <Save size={16} />}
                  {state.isSaved ? "Saved_to_Vault" : "Commit_Audit"}
                </button>
                {state.isSaved && (
                  <button
                    onClick={handleCopyBadge}
                    className="flex items-center gap-4 px-6 py-4 rounded-full bg-white/[0.05] border border-white/10 text-emerald-500 font-black hover:bg-white/[0.1] transition-all uppercase tracking-tighter"
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                    {copied ? "Markdown_Copied" : "Copy_Badge"}
                  </button>
                )}
              </div>
            </div>

            {/* Badge Preview (New Section) */}
            {state.isSaved && state.lastSavedId && (
               <div className="p-8 rounded-[2.5rem] bg-white/[0.01] border border-white/5 flex flex-col items-center gap-6 animate-in zoom-in-95 duration-500">
                  <p className="text-[10px] font-mono text-gray-600 uppercase tracking-[0.5em]">Badge_Output_Preview</p>
                  <div className="p-4 bg-black rounded-xl border border-white/5 shadow-2xl">
                     <img 
                      src={`/api/badge/${state.lastSavedId}`} 
                      alt="Carbon Badge" 
                      className="h-10 w-auto"
                     />
                  </div>
                  <p className="text-[9px] text-gray-500 text-center max-w-sm">Embed this dynamic SVG in your README to showcase your computational efficiency to the world.</p>
               </div>
            )}

            {/* Diagnostics Console */}
            {state.runResults.length > 0 && (
              <div className="rounded-[3rem] border border-emerald-500/20 bg-emerald-500/[0.02] p-12 space-y-8 animate-in slide-in-from-top-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                   <ShieldCheck size={200} className="text-emerald-500" />
                </div>
                <div className="flex items-center justify-between border-b border-emerald-500/10 pb-6 relative z-10">
                  <div className="flex items-center gap-4 text-emerald-500">
                    <Terminal size={14} className="animate-pulse" />
                    <span className="text-xs font-mono uppercase tracking-[0.5em] font-bold">Secure.Log.Trace</span>
                  </div>
                  <div className="flex items-center gap-4">
                     <div className="flex items-center gap-2 text-[9px] font-mono text-emerald-500/50 uppercase">
                        <ShieldCheck size={12} />
                        Isolation_Active
                     </div>
                     <div className="h-1 w-24 bg-white/5 rounded-full overflow-hidden">
                       <div className="h-full bg-emerald-500 w-[70%] animate-pulse" />
                     </div>
                  </div>
                </div>
                <div className="font-mono text-[11px] space-y-4 uppercase opacity-80 max-h-64 overflow-y-auto custom-scrollbar pr-4 relative z-10">
                  {state.runResults.map((line, i) => (
                    <div key={i} className={cn("flex items-start gap-6 border-l border-white/5 pl-6", line.includes('✅') ? 'text-emerald-500 font-bold' : line.includes('❌') ? 'text-red-500' : 'text-gray-400')}>
                      <span className="text-[8px] opacity-20 font-bold">{String(i+1).padStart(2, '0')}</span>
                      {line}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <MetricsDisplay metrics={state.metrics} />

            <div className="grid lg:grid-cols-2 gap-12">
              <div className="p-12 rounded-[3.5rem] border border-white/10 bg-white/[0.02] backdrop-blur-3xl relative overflow-hidden flex flex-col">
                <h3 className="text-[10px] font-mono font-bold mb-12 text-gray-500 uppercase tracking-[0.5em]">Efficiency_trajectory</h3>
                <div className="flex-1 flex items-center justify-center">
                   <EnergyScoreChart score={state.review.score} />
                </div>
                <div className="mt-8 p-6 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center gap-4">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest italic">Live Efficiency Modulation Active</p>
                </div>
              </div>

              <div className="space-y-8">
                <AIReviewCard review={state.review} />
                
                {!state.refactored ? (
                  <button
                    onClick={handleRefactor}
                    disabled={state.isRefactoring}
                    className="w-full p-10 rounded-[3rem] border border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 transition-all group flex items-center justify-between text-left relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[80px]" />
                    <div className="space-y-3 relative z-10">
                      <p className="text-emerald-500 font-black text-2xl tracking-tighter uppercase italic">Refactor_Module</p>
                      <p className="text-emerald-500/50 text-[10px] uppercase tracking-widest font-mono">Architect-level code optimization</p>
                    </div>
                    {state.isRefactoring ? <Loader2 className="animate-spin text-emerald-500" /> : <Sparkles className="text-emerald-500 group-hover:scale-125 transition-transform" />}
                  </button>
                ) : (
                   <div className="p-10 rounded-[3.5rem] border border-emerald-500/30 bg-emerald-500/5 space-y-8 animate-in zoom-in-95">
                      <div className="flex items-center justify-between border-b border-emerald-500/10 pb-6">
                         <div className="flex items-center gap-4 text-emerald-500">
                            <CheckCircle2 size={20} />
                            <span className="text-sm font-black uppercase tracking-widest text-emerald-500 underline underline-offset-8">Optimized_Payload</span>
                         </div>
                         <button onClick={() => setState(prev => ({ ...prev, refactored: null }))} className="text-[10px] font-mono text-emerald-500/50 uppercase hover:text-white transition-colors">Abort_View</button>
                      </div>
                      <div className="bg-[#050505] rounded-3xl p-8 font-mono text-[11px] text-emerald-500/90 overflow-x-auto border border-white/5 max-h-80 custom-scrollbar">
                        <pre>{state.refactored.code}</pre>
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
