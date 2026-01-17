"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FileUpload } from "@/components/upload";
import { MetricsDisplay, EnergyScoreChart, AIReviewCard, GridTimeline } from "@/components/dashboard";
import { calculateEnergyMetrics, REGIONS, HARDWARE_PROFILES, getGridIntensity, getAIReview, getAIRefactor } from "@/lib/energy";
import { AnalysisItemSchema, AIReview } from "@/lib/schemas";
import { Sparkles, RotateCcw, Loader2, Zap, TrendingUp, BarChart3, Globe, Cpu, Terminal, CheckCircle2, FileStack, Save, Copy, Check, ShieldCheck, Rocket, ArrowRight, BrainCircuit } from "lucide-react";
import { databases, DATABASE_ID, COLLECTION_ID, ID } from "@/lib/appwrite";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

interface AnalysisState {
  files: File[];
  contents: string[];
  metrics: any | null;
  review: AIReview | null;
  isAnalyzing: boolean;
  refactored: { code: string; explanation: string; metrics: any | null } | null;
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
    lastSavedId: null,
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
      let totalEnergy = 0, totalCO2 = 0, maxComplexity = 0, totalLines = 0, totalMem = 0, recursion = false;
      for (let i = 0; i < files.length; i++) {
        const m = await calculateEnergyMetrics(files[i].size, files[i].name, contents[i], targetRegion, targetHardware);
        totalEnergy += m.estimatedEnergy;
        totalCO2 += m.estimatedCO2;
        maxComplexity = Math.max(maxComplexity, m.complexity);
        totalLines += m.lineCount;
        totalMem += m.memPressure || 1;
        if (m.recursionDetected) recursion = true;
      }
      return {
        estimatedEnergy: Math.round(totalEnergy * 1000) / 1000,
        estimatedCO2: Math.round(totalCO2 * 100) / 100,
        gridIntensity: await getGridIntensity(targetRegion),
        lineCount: totalLines,
        complexity: maxComplexity,
        memPressure: totalMem / (files.length || 1),
        energyUnit: 'kWh',
        co2Unit: 'gCO2e',
        language: files.length === 1 ? files[0].name.split('.').pop()?.toUpperCase() : 'PACKET',
        recursionDetected: recursion
      };
    } catch (e) { return null; }
  }, []);

  // Update metrics on infra change
  useEffect(() => {
    if (state.files.length > 0 && !state.isAnalyzing) {
      const handler = async () => {
        const m = await recomputeMetrics(state.files, state.contents, state.region, state.hardware);
        if (m) setState(p => ({ ...p, metrics: m, isSaved: false }));
      };
      const t = setTimeout(handler, 300);
      return () => clearTimeout(t);
    }
  }, [state.region, state.hardware, state.files, state.contents, state.isAnalyzing, recomputeMetrics]);

  const handleFilesAccepted = useCallback(async (processed: { file: File, content: string }[]) => {
    if (processed.length === 0) return;
    const files = processed.map(p => p.file);
    const contents = processed.map(p => p.content);
    setState(prev => ({ ...prev, files, contents, isAnalyzing: true, refactored: null, runResults: [], isSaved: false, review: null }));
    try {
      const metrics = await recomputeMetrics(files, contents, state.region, state.hardware);
      if (!metrics) throw new Error("Synthesis failed.");
      const review = await getAIReview(contents[0], metrics);
      setState(prev => ({ ...prev, metrics, review, isAnalyzing: false }));
    } catch (err: any) {
      setError(err.message);
      setState(prev => ({ ...prev, isAnalyzing: false }));
    }
  }, [state.region, state.hardware, recomputeMetrics]);

  const commitToLedger = async () => {
    if (!state.metrics || !user || !DATABASE_ID || !COLLECTION_ID) return;
    setState(p => ({ ...p, isSaving: true }));
    try {
      const payload = {
        fileName: state.files.length > 1 ? `${state.files.length} Object Packet` : state.files[0].name,
        fileSize: state.files.reduce((a,f) => a+f.size, 0),
        fileId: "sim_" + Date.now(),
        estimatedEnergy: state.metrics.estimatedEnergy,
        estimatedCO2: state.metrics.estimatedCO2,
        score: state.review?.score || Math.max(1, 10 - Math.floor(state.metrics.complexity * 1.5)),
        bottleneck: state.review?.bottleneck || "Heuristic scale limit detected.",
        optimization: state.review?.optimization || "Reduce algorithmic depth.",
        improvement: state.review?.improvement || "Optimized compute possible.",
        createdAt: new Date().toISOString(),
        userId: user.$id,
        complexity: state.metrics.complexity,
        memPressure: state.metrics.memPressure,
        lineCount: state.metrics.lineCount,
        region: state.region,
        hardwareProfile: state.hardware,
        gridIntensity: state.metrics.gridIntensity,
        recursionDetected: state.metrics.recursionDetected,
        language: state.metrics.language,
        engineVersion: '4.0.0-gamma'
      };
      const doc = await databases.createDocument(DATABASE_ID, COLLECTION_ID, ID.unique(), AnalysisItemSchema.parse(payload));
      setState(p => ({ ...p, isSaving: false, isSaved: true, lastSavedId: doc.$id }));
    } catch (e: any) {
      setError("Vault commit failed: " + e.message);
      setState(p => ({ ...p, isSaving: false }));
    }
  };

  const handleRefactor = async () => {
    if (state.contents.length === 0) return;
    setState(p => ({ ...p, isRefactoring: true }));
    try {
      const res = await getAIRefactor(state.contents[0]);
      const m = await calculateEnergyMetrics(res.refactoredCode.length, state.files[0].name, res.refactoredCode, state.region, state.hardware);
      setState(p => ({ 
        ...p, 
        isRefactoring: false, 
        refactored: { 
          code: res.refactoredCode, 
          explanation: res.explanation, 
          metrics: m 
        } 
      }));
    } catch (e) { setError("AI Refactor Engine Offline."); setState(p => ({ ...p, isRefactoring: false })); }
  };

  if (authLoading) return <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center font-mono text-emerald-500 animate-pulse">Initializing_Control_Surface...</div>;

  return (
    <div className="py-24 bg-[#0a0a0a] min-h-screen selection:bg-emerald-500/30">
      <div className="container mx-auto px-4 max-w-7xl">
        
        <div className="flex flex-col lg:flex-row gap-20 mb-24">
          <div className="flex-1 space-y-12">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="h-px w-10 bg-emerald-500" />
                <h2 className="text-[10px] font-mono text-emerald-500 uppercase tracking-[0.5em]">Artifact_Stream</h2>
              </div>
              <h1 className="text-6xl lg:text-8xl font-black tracking-tighter uppercase leading-[0.85] text-white italic">
                Audit_Code_
              </h1>
              <p className="text-gray-500 font-medium max-w-lg text-lg lowercase first-letter:uppercase leading-relaxed">
                Quantify the environmental footprint of existing high-density packets. High-fidelity carbon telemetry powered by Gemini 2.0.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                { label: "Regional Power Grid", icon: Globe, value: state.region, onChange: (v: any) => setState(p => ({...p, region: v})), options: REGIONS, color: "text-emerald-500" },
                { label: "Hardware TDP Profile", icon: Cpu, value: state.hardware, onChange: (v: any) => setState(p => ({...p, hardware: v})), options: HARDWARE_PROFILES, color: "text-amber-500" }
              ].map((ctrl, i) => (
                <div key={i} className="p-8 rounded-[2.5rem] bg-white/[0.01] border border-white/5 space-y-6 hover:bg-white/[0.03] transition-all">
                  <div className="flex items-center gap-2 text-[10px] font-mono text-gray-500 uppercase tracking-widest font-bold">
                    <ctrl.icon size={14} className={ctrl.color} />
                    {ctrl.label}
                  </div>
                  <select value={ctrl.value} onChange={(e) => ctrl.onChange(e.target.value)} className="w-full bg-transparent border-none p-0 text-2xl font-black uppercase tracking-tighter focus:ring-0 text-white cursor-pointer">
                    {Object.entries(ctrl.options).map(([id, { label }]) => (
                      <option key={id} value={id} className="bg-black text-[14px] uppercase font-mono">{label}</option>
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
              onClear={() => setState(p => ({ ...p, files: [], contents: [], metrics: null, review: null }))} 
            />
          </div>
        </div>

        {state.metrics && (
          <div className="space-y-20 animate-in fade-in slide-in-from-bottom-10 duration-1000">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-12 py-16 border-y border-white/5 bg-gradient-to-r from-transparent via-emerald-500/[0.01] to-transparent">
              <div className="space-y-4 text-center lg:text-left">
                <div className="flex items-center justify-center lg:justify-start gap-4 mb-2">
                   <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                      <Rocket size={16} className="text-emerald-500" />
                   </div>
                   <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic">Synthesis_Audit_Live</h2>
                </div>
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6">
                   <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-mono text-emerald-500 uppercase tracking-widest font-black">
                      <ShieldCheck size={12} className="animate-pulse" /> Protocol_Safe
                   </div>
                   <p className="text-[11px] font-mono text-gray-600 uppercase tracking-widest italic font-bold">{state.metrics.gridIntensity} gCO2e Grid_Load</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <button onClick={() => setState(p => ({ ...p, metrics: null, review: null, files: [], contents: [] }))} className="p-4 rounded-full border border-white/10 hover:bg-white/5 transition-all text-gray-600 hover:text-white"><RotateCcw size={20} /></button>
                <button onClick={commitToLedger} disabled={state.isSaving || state.isSaved} className={cn("flex items-center gap-6 px-14 py-6 rounded-full font-black uppercase tracking-widest text-[11px] transition-all", state.isSaved ? "bg-emerald-500 text-white cursor-default" : "bg-white text-black hover:bg-emerald-500 hover:text-white hover:scale-105 shadow-[0_0_50px_rgba(255,255,255,0.05)] active:scale-95")}>
                  {state.isSaving ? <Loader2 size={16} className="animate-spin" /> : state.isSaved ? <CheckCircle2 size={16} /> : <Save size={16} />}
                  {state.isSaved ? "Saved_to_Vault" : "Commit_Audit"}
                </button>
                {state.isSaved && (
                  <button onClick={() => navigator.clipboard.writeText(`![CO2DE Grade](${window.location.origin}/api/badge/${state.lastSavedId})`).then(() => {setCopied(true); setTimeout(()=>setCopied(false),2000)})} className="flex items-center gap-4 px-10 py-6 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 font-black uppercase tracking-widest text-[11px] transition-all">
                    {copied ? <Check size={16} /> : <Copy size={16} />} {copied ? "Copied" : "Badge"}
                  </button>
                )}
              </div>
            </div>

            <MetricsDisplay metrics={state.metrics} />

            <div className="grid lg:grid-cols-2 gap-16">
              <div className="space-y-16">
                 <div className="p-16 rounded-[4rem] border border-white/10 bg-white/[0.01] backdrop-blur-3xl relative overflow-hidden flex flex-col justify-center min-h-[500px] group">
                   <div className="absolute top-0 right-0 p-16 opacity-[0.02] pointer-events-none group-hover:rotate-12 transition-transform duration-1000">
                      <BarChart3 size={200} className="text-white" />
                   </div>
                   <h3 className="text-[11px] font-mono font-black mb-16 text-gray-500 uppercase tracking-[0.5em] text-center lg:text-left">Operational_Efficiency_Index</h3>
                   <EnergyScoreChart score={state.review?.score || Math.max(1, 10 - Math.floor(state.metrics.complexity * 1.5))} />
                 </div>

                 <GridTimeline region={state.region} />
              </div>

              <div className="space-y-10">
                {state.isAnalyzing && (
                  <div className="p-16 rounded-[4rem] border border-white/10 bg-white/[0.01] flex flex-col items-center justify-center space-y-8 animate-pulse">
                     <BrainCircuit size={48} className="text-emerald-500 animate-bounce" />
                     <p className="text-[10px] font-mono text-gray-500 uppercase tracking-[0.4em]">Synthesizing_AI_Review...</p>
                  </div>
                )}
                
                {state.review && <AIReviewCard review={state.review} />}
                
                {state.metrics && !state.refactored && (
                    <button onClick={handleRefactor} disabled={state.isRefactoring} className="w-full p-12 rounded-[4rem] border border-emerald-500/20 bg-emerald-500/[0.03] hover:bg-emerald-500/[0.06] transition-all group flex items-center justify-between text-left relative overflow-hidden shadow-2xl">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[80px]" />
                      <div className="space-y-4 relative z-10">
                        <p className="text-emerald-500 font-black text-3xl tracking-tighter uppercase italic">Refactor_Module</p>
                        <p className="text-emerald-500/40 text-[11px] uppercase tracking-[0.4em] font-mono font-black">AI_Autonomous_Opt_Engine</p>
                      </div>
                      {state.isRefactoring ? <Loader2 className="animate-spin text-emerald-500" /> : <Sparkles className="text-emerald-500 group-hover:scale-125 transition-transform duration-500" size={28} />}
                    </button>
                  )}

                  {state.refactored && (
                    <div className="p-12 rounded-[4rem] border border-emerald-500/30 bg-emerald-500/[0.02] space-y-10 animate-in zoom-in-95 backdrop-blur-3xl">
                      <div className="flex items-center justify-between border-b border-emerald-500/10 pb-8"><div className="flex items-center gap-4 text-emerald-500"><CheckCircle2 size={24} /><span className="text-xl font-black uppercase tracking-widest italic outline-none">Optimized_Result</span></div><button onClick={()=>setState(p=>({...p, refactored: null}))} className="text-[10px] font-mono text-emerald-500/40 uppercase hover:text-white transition-colors font-bold">Dismiss_View</button></div>
                      <div className="bg-black/80 rounded-[2.5rem] p-10 border border-white/5 max-h-[400px] overflow-hidden flex flex-col">
                         <div className="flex items-center justify-between mb-4 px-2">
                            <span className="text-[9px] font-mono text-gray-600 uppercase tracking-widest">Calculated_Green_Architecture</span>
                         </div>
                         <div className="flex-1 overflow-y-auto custom-scrollbar font-mono text-[12px] text-emerald-400/90 selection:bg-emerald-500/20"><pre><code>{state.refactored.code}</code></pre></div>
                      </div>
                      <div className="space-y-6 p-6 rounded-[2rem] bg-emerald-500/[0.03] border border-emerald-500/10"><div className="flex items-center gap-2"><BrainCircuit size={14} className="text-emerald-500" /><span className="text-[11px] font-mono text-emerald-500/40 uppercase tracking-widest font-black">AI_Architect_Summary</span></div><p className="text-[14px] text-gray-300 font-medium italic leading-relaxed lowercase first-letter:uppercase">&quot;{state.refactored.explanation}&quot;</p></div>
                    </div>
                  )}
                
                <Link href="/dashboard" className="w-full p-10 rounded-[4rem] border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-all flex items-center justify-between group">
                   <div className="space-y-2"><p className="text-xl font-black text-white/50 tracking-tighter uppercase italic group-hover:text-white transition-colors">Protocol_Vault</p><p className="text-[11px] font-mono text-gray-800 uppercase tracking-widest group-hover:text-gray-600 transition-colors">View historical audit ledger</p></div>
                   <ArrowRight size={24} className="text-gray-800 group-hover:text-emerald-500 group-hover:translate-x-2 transition-all" />
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
