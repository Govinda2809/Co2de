"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FileUpload } from "@/components/upload";
import { MetricsDisplay, EnergyScoreChart, AIReviewCard, GridTimeline } from "@/components/dashboard";
import { calculateEnergyMetrics, REGIONS, HARDWARE_PROFILES, getGridIntensity, getAIReview, getAIRefactor } from "@/lib/energy";
import { AnalysisItemSchema, AIReview } from "@/lib/schemas";
import { Sparkles, RotateCcw, Loader2, Zap, TrendingUp, BarChart3, Globe, Cpu, Play, Terminal, CheckCircle2, FileStack, FileCode, Info, Save, Copy, Check, ShieldCheck, Box, Plus, X, Activity, ArrowRight } from "lucide-react";
import { databases, DATABASE_ID, COLLECTION_ID, ID } from "@/lib/appwrite";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

interface FeatureScope {
  id: string;
  name: string;
  code: string;
  metrics: any | null;
}

interface AnalysisState {
  mode: 'upload' | 'architect';
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
  scopes: FeatureScope[];
}

export default function AnalyzePage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [state, setState] = useState<AnalysisState>({
    mode: 'upload',
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
    scopes: [{ id: '1', name: 'Core_Service', code: '// Start architecting...\nfunction processData(input) {\n  return input.map(item => item * 2);\n}', metrics: null }]
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

  // Update metrics for ARCHITECT mode
  useEffect(() => {
    if (state.mode === 'architect') {
      const handler = async () => {
        const updatedScopes = await Promise.all(state.scopes.map(async (s) => {
          const m = await calculateEnergyMetrics(s.code.length, `${s.name}.js`, s.code, state.region, state.hardware);
          return { ...s, metrics: m };
        }));
        const totalEnergy = updatedScopes.reduce((acc, s) => acc + (s.metrics?.estimatedEnergy || 0), 0);
        const totalCO2 = updatedScopes.reduce((acc, s) => acc + (s.metrics?.estimatedCO2 || 0), 0);
        const maxComp = Math.max(...updatedScopes.map(s => s.metrics?.complexity || 1));
        const grid = updatedScopes[0]?.metrics?.gridIntensity || 300;
        const recursion = updatedScopes.some(s => s.metrics?.recursionDetected);
        
        setState(prev => ({ 
          ...prev, 
          scopes: updatedScopes,
          metrics: {
            estimatedEnergy: totalEnergy,
            estimatedCO2: totalCO2,
            complexity: maxComp,
            gridIntensity: grid,
            lineCount: updatedScopes.reduce((acc, s) => acc + (s.metrics?.lineCount || 0), 0),
            energyUnit: 'kWh', co2Unit: 'gCO2e', language: 'ARCH',
            recursionDetected: recursion
          }
        }));
      };
      const t = setTimeout(handler, 400);
      return () => clearTimeout(t);
    }
  }, [state.scopes.map(s => s.code).join('|'), state.region, state.hardware, state.mode]);

  // Update metrics for UPLOAD mode on infra change
  useEffect(() => {
    if (state.mode === 'upload' && state.files.length > 0 && !state.isAnalyzing) {
      const handler = async () => {
        const m = await recomputeMetrics(state.files, state.contents, state.region, state.hardware);
        if (m) setState(p => ({ ...p, metrics: m, isSaved: false }));
      };
      const t = setTimeout(handler, 300);
      return () => clearTimeout(t);
    }
  }, [state.region, state.hardware, state.files, state.contents, state.isAnalyzing, state.mode, recomputeMetrics]);

  const handleFilesAccepted = useCallback(async (processed: { file: File, content: string }[]) => {
    if (processed.length === 0) return;
    const files = processed.map(p => p.file);
    const contents = processed.map(p => p.content);
    setState(prev => ({ ...prev, files, contents, isAnalyzing: true, refactored: null, runResults: [], isSaved: false }));
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

  const addScope = () => setState(p => ({ ...p, scopes: [...p.scopes, { id: Date.now().toString(), name: `Scope_${p.scopes.length+1}`, code: '', metrics: null }] }));
  const updateScope = (id: string, code: string) => setState(p => ({ ...p, scopes: p.scopes.map(s => s.id === id ? { ...s, code } : s) }));
  const removeScope = (id: string) => state.scopes.length > 1 && setState(p => ({ ...p, scopes: p.scopes.filter(s => s.id !== id) }));

  const commitToLedger = async () => {
    if (!state.metrics || !user || !DATABASE_ID || !COLLECTION_ID) return;
    setState(p => ({ ...p, isSaving: true }));
    try {
      const payload = {
        fileName: state.mode === 'upload' ? (state.files.length > 1 ? `${state.files.length} Object Packet` : state.files[0].name) : `Architect_Synthesis_${state.scopes.length}_Scopes`,
        fileSize: state.mode === 'upload' ? state.files.reduce((a,f) => a+f.size, 0) : state.scopes.reduce((a,s) => a+s.code.length, 0),
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
        lineCount: state.metrics.lineCount
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
        
        {/* MODE SELECTOR */}
        <div className="flex border-b border-white/5 mb-16">
          {[
            { id: 'upload' as const, label: 'Packet_Capture', icon: FileStack },
            { id: 'architect' as const, label: 'Feature_Architect', icon: Box }
          ].map(m => (
            <button
              key={m.id}
              onClick={() => setState(p => ({ ...p, mode: m.id, metrics: null, review: null }))}
              className={cn(
                "flex items-center gap-4 px-12 py-6 font-black text-[10px] uppercase tracking-[0.4em] transition-all relative",
                state.mode === m.id ? "text-emerald-500" : "text-gray-600 hover:text-gray-400"
              )}
            >
              <m.icon size={14} />
              {m.label}
              {state.mode === m.id && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.5)]" />}
            </button>
          ))}
        </div>

        <div className="flex flex-col lg:flex-row gap-20 mb-24">
          <div className="flex-1 space-y-12">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="h-px w-10 bg-emerald-500" />
                <h2 className="text-[10px] font-mono text-emerald-500 uppercase tracking-[0.5em]">{state.mode === 'upload' ? 'Artifact_Stream' : 'Synthesis_Engine'}</h2>
              </div>
              <h1 className="text-6xl lg:text-8xl font-black tracking-tighter uppercase leading-[0.85] text-white italic">
                {state.mode === 'upload' ? 'Audit_Code_' : 'Sculpt_Impact_'}
              </h1>
              <p className="text-gray-500 font-medium max-w-lg text-lg lowercase first-letter:uppercase leading-relaxed">
                {state.mode === 'upload' ? "Quantify the environmental footprint of existing high-density packets." : "Architect modular features with real-time carbon feedback loops."}
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
                      <option key={id} value={id} className="bg-black text-[14px] uppercase">{label}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>

          <div className="flex-1">
            {state.mode === 'upload' ? (
              <FileUpload onFilesAccepted={handleFilesAccepted} isLoading={state.isAnalyzing} acceptedFiles={state.files} onClear={() => setState(p => ({ ...p, files: [], contents: [], metrics: null, review: null }))} />
            ) : (
              <div className="space-y-6">
                {state.scopes.map(s => (
                  <div key={s.id} className="p-10 rounded-[3rem] bg-white/[0.01] border border-white/5 space-y-6 animate-in slide-in-from-right-4 transition-all hover:border-white/10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Box size={16} className="text-emerald-500" />
                        <input value={s.name} onChange={(e) => setState(p => ({ ...p, scopes: p.scopes.map(sc => sc.id === s.id ? { ...sc, name: e.target.value } : sc) }))} className="bg-transparent border-none p-0 text-[11px] font-mono font-black uppercase tracking-widest text-white focus:ring-0" />
                      </div>
                      <button onClick={() => removeScope(s.id)} className="p-3 hover:bg-red-500/10 rounded-full text-gray-700 hover:text-red-500 transition-all"><X size={16} /></button>
                    </div>
                    <textarea value={s.code} onChange={(e) => updateScope(s.id, e.target.value)} placeholder="// Write feature logic..." className="w-full h-40 bg-black/50 border border-white/5 rounded-3xl p-8 font-mono text-xs text-emerald-400 placeholder-gray-900 focus:border-emerald-500/20 focus:ring-0 resize-none custom-scrollbar" />
                    {s.metrics && (
                      <div className="flex items-center justify-between px-6 pt-4 border-t border-white/5">
                        <div className="flex gap-8">
                          <div className="flex items-center gap-2"><Zap size={12} className="text-amber-500" /><span className="text-[10px] font-mono text-gray-500">{s.metrics.estimatedEnergy.toFixed(4)} KWH</span></div>
                          <div className="flex items-center gap-2"><Activity size={12} className="text-blue-500" /><span className="text-[10px] font-mono text-gray-500">O({s.metrics.complexity.toFixed(1)}) SCALE</span></div>
                        </div>
                        <span className="text-[9px] font-mono text-emerald-500/30 uppercase tracking-[0.4em]">Scope_Sync_OK</span>
                      </div>
                    )}
                  </div>
                ))}
                <button onClick={addScope} className="w-full p-10 rounded-[3.5rem] border border-dashed border-white/5 hover:border-emerald-500/50 hover:bg-emerald-500/[0.02] transition-all flex items-center justify-center gap-4 text-gray-700 hover:text-emerald-500 text-[11px] font-mono font-black uppercase tracking-[0.4em]">
                  <Plus size={18} /> Link_New_Scope
                </button>
              </div>
            )}
          </div>
        </div>

        {state.metrics && (
          <div className="space-y-20 animate-in fade-in slide-in-from-bottom-10 duration-1000">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-12 py-16 border-y border-white/5">
              <div className="space-y-4 text-center lg:text-left">
                <h2 className="text-5xl font-black text-white tracking-tighter uppercase italic">Synthesis_Live</h2>
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6">
                   <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-mono text-emerald-500 uppercase tracking-widest font-black">
                      <ShieldCheck size={12} className="animate-pulse" /> Protocol_Safe
                   </div>
                   <p className="text-[11px] font-mono text-gray-600 uppercase tracking-widest italic">{state.metrics.gridIntensity} gCO2e Grid_Load</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <button onClick={() => setState(p => ({ ...p, runResults: [], isRunning: false, metrics: null, review: null }))} className="p-4 rounded-full border border-white/10 hover:bg-white/5 transition-all"><RotateCcw size={20} className="text-gray-600" /></button>
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
                 <div className="p-16 rounded-[4rem] border border-white/10 bg-white/[0.01] backdrop-blur-3xl relative overflow-hidden flex flex-col justify-center min-h-[500px]">
                   <h3 className="text-[11px] font-mono font-black mb-16 text-gray-600 uppercase tracking-[0.5em] text-center lg:text-left">Operational_Efficiency</h3>
                   <EnergyScoreChart score={state.review?.score || Math.max(1, 10 - Math.floor(state.metrics.complexity * 1.5))} />
                   
                   {state.mode === 'architect' && (
                     <div className="mt-20 space-y-10">
                       <div className="flex items-center justify-between border-b border-white/5 pb-4">
                         <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest font-bold">Scope_Impact_Distribution</span>
                         <BarChart3 size={14} className="text-gray-700" />
                       </div>
                       <div className="space-y-8">
                          {state.scopes.map(s => {
                            const p = Math.min(100, (s.metrics?.estimatedCO2 / state.metrics.estimatedCO2) * 100) || 0;
                            return (
                              <div key={s.id} className="space-y-3">
                                 <div className="flex items-center justify-between text-[11px] font-mono font-black uppercase tracking-widest"><span className="text-white italic">{s.name}</span><span className="text-emerald-500/60">{p.toFixed(1)}%</span></div>
                                 <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden"><div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: `${p}%` }} /></div>
                              </div>
                            );
                          })}
                       </div>
                     </div>
                   )}
                 </div>

                 <GridTimeline region={state.region} />
              </div>

              <div className="space-y-10">
                {state.mode === 'upload' && state.review ? <AIReviewCard review={state.review} /> : (
                   <div className="p-16 rounded-[4rem] border border-white/10 bg-white/[0.01] space-y-12 text-center lg:text-left">
                      <div className="flex items-center justify-center lg:justify-start gap-4 text-emerald-500"><Terminal size={20} /><h3 className="text-2xl font-black tracking-tighter uppercase italic">Architect_Review</h3></div>
                      <p className="text-gray-500 leading-relaxed font-medium lowercase first-letter:uppercase">Architectural mode active. The engine is providing real-time heuristic feedback for multiple feature scopes. Complexity is being calculated across all active threads.</p>
                      <div className="grid grid-cols-1 gap-4">
                         <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 flex items-center gap-6"><div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-500"><ShieldCheck size={18} /></div><div className="space-y-1"><p className="text-[10px] font-mono text-gray-600 uppercase tracking-widest">Calculated_Complexity</p><p className="text-2xl font-black text-white italic">O({state.metrics.complexity.toFixed(2)})</p></div></div>
                         <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 flex items-center gap-6"><div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500"><Zap size={18} /></div><div className="space-y-1"><p className="text-[10px] font-mono text-gray-600 uppercase tracking-widest">Total_Draw</p><p className="text-2xl font-black text-white italic">{state.metrics.estimatedEnergy.toFixed(4)} KWH</p></div></div>
                      </div>
                   </div>
                )}
                
                {state.mode === 'upload' && (
                  !state.refactored ? (
                    <button onClick={handleRefactor} disabled={state.isRefactoring} className="w-full p-12 rounded-[4rem] border border-emerald-500/20 bg-emerald-500/[0.03] hover:bg-emerald-500/[0.06] transition-all group flex items-center justify-between text-left relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[80px]" />
                      <div className="space-y-4 relative z-10">
                        <p className="text-emerald-500 font-black text-3xl tracking-tighter uppercase italic">Refactor_Module</p>
                        <p className="text-emerald-500/40 text-[11px] uppercase tracking-[0.4em] font-mono font-bold">Autonomous_Code_Opt</p>
                      </div>
                      {state.isRefactoring ? <Loader2 className="animate-spin text-emerald-500" /> : <Sparkles className="text-emerald-500 group-hover:scale-125 transition-transform" size={28} />}
                    </button>
                  ) : (
                    <div className="p-12 rounded-[4rem] border border-emerald-500/30 bg-emerald-500/[0.02] space-y-10 animate-in zoom-in-95">
                      <div className="flex items-center justify-between border-b border-emerald-500/10 pb-8"><div className="flex items-center gap-4 text-emerald-500"><CheckCircle2 size={24} /><span className="text-xl font-black uppercase tracking-widest italic outline-none">Optimized_Result</span></div><button onClick={()=>setState(p=>({...p, refactored: null}))} className="text-[10px] font-mono text-emerald-500/40 uppercase hover:text-white transition-colors">Dismiss_View</button></div>
                      <div className="bg-black/80 rounded-[2.5rem] p-10 font-mono text-[12px] text-emerald-400/90 overflow-x-auto border border-white/5 max-h-[400px] custom-scrollbar selection:bg-emerald-500/20"><pre><code>{state.refactored.code}</code></pre></div>
                      <div className="space-y-6"><div className="flex items-center gap-2"><Zap size={14} className="text-emerald-500" /><span className="text-[11px] font-mono text-emerald-500/40 uppercase tracking-widest font-black">Architect_Summary</span></div><p className="text-[14px] text-gray-400 font-medium italic leading-relaxed lowercase first-letter:uppercase">&quot;{state.refactored.explanation}&quot;</p></div>
                    </div>
                  )
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
