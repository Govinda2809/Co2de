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

  const addScope = () => setState(p => ({ ...p, scopes: [...p.scopes, { id: Date.now().toString(), name: `Scope_${p.scopes.length + 1}`, code: '', metrics: null }] }));
  const updateScope = (id: string, code: string) => setState(p => ({ ...p, scopes: p.scopes.map(s => s.id === id ? { ...s, code } : s) }));
  const removeScope = (id: string) => state.scopes.length > 1 && setState(p => ({ ...p, scopes: p.scopes.filter(s => s.id !== id) }));

  const commitToLedger = async () => {
    if (!state.metrics || !user || !DATABASE_ID || !COLLECTION_ID) return;
    setState(p => ({ ...p, isSaving: true }));
    try {
      const payload = {
        fileName: state.mode === 'upload' ? (state.files.length > 1 ? `${state.files.length} Object Packet` : state.files[0].name) : `Architect_Synthesis_${state.scopes.length}_Scopes`,
        fileSize: state.mode === 'upload' ? state.files.reduce((a, f) => a + f.size, 0) : state.scopes.reduce((a, s) => a + s.code.length, 0),
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

  if (authLoading) return <div className="min-h-screen bg-black flex items-center justify-center font-pixel text-emerald-500 animate-pulse text-2xl">LOADING_INTERFACE...</div>;

  return (
    <div className="py-24 bg-black min-h-screen selection:bg-emerald-500/30 text-white font-mono">
      <div className="container mx-auto px-6 max-w-7xl">

        {/* MODE SELECTOR */}
        <div className="flex border-b-2 border-white/20 mb-16">
          {[
            { id: 'upload' as const, label: 'PACKET_CAPTURE', icon: FileStack },
            { id: 'architect' as const, label: 'FEATURE_ARCHITECT', icon: Box }
          ].map(m => (
            <button
              key={m.id}
              onClick={() => setState(p => ({ ...p, mode: m.id, metrics: null, review: null }))}
              className={cn(
                "flex items-center gap-4 px-8 py-4 font-pixel text-xs uppercase tracking-widest transition-all relative border-r-2 border-white/20 hover:bg-white/5",
                state.mode === m.id ? "bg-emerald-900/20 text-emerald-400" : "text-gray-500"
              )}
            >
              <m.icon size={16} />
              {m.label}
              {state.mode === m.id && <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500" />}
            </button>
          ))}
        </div>

        <div className="flex flex-col lg:flex-row gap-20 mb-24">
          <div className="flex-1 space-y-12">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-emerald-500 animate-pulse pixel-border" />
                <h2 className="text-xs font-pixel text-emerald-500 uppercase tracking-widest">{state.mode === 'upload' ? 'ARTIFACT_STREAM' : 'SYNTHESIS_ENGINE'}</h2>
              </div>
              <h1 className="text-4xl lg:text-6xl font-pixel uppercase leading-none text-white">
                {state.mode === 'upload' ? 'AUDIT_CODE_' : 'SCULPT_IMPACT_'}
              </h1>
              <p className="text-gray-500 font-mono text-sm max-w-lg leading-relaxed">
                // {state.mode === 'upload' ? "Initialising static analysis sequence..." : "Real-time carbon feedback loop active."}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                { label: "GRID_REGION", icon: Globe, value: state.region, onChange: (v: any) => setState(p => ({ ...p, region: v })), options: REGIONS, color: "text-emerald-500" },
                { label: "TDP_PROFILE", icon: Cpu, value: state.hardware, onChange: (v: any) => setState(p => ({ ...p, hardware: v })), options: HARDWARE_PROFILES, color: "text-amber-500" }
              ].map((ctrl, i) => (
                <div key={i} className="p-6 bg-black border-2 border-white/20 pixel-border space-y-4 hover:border-emerald-500/50 transition-colors">
                  <div className="flex items-center gap-2 text-[10px] font-pixel text-gray-400 uppercase tracking-widest">
                    <ctrl.icon size={14} className={ctrl.color} />
                    {ctrl.label}
                  </div>
                  <select value={ctrl.value} onChange={(e) => ctrl.onChange(e.target.value)} className="w-full bg-transparent border-none p-0 text-lg font-pixel uppercase focus:ring-0 text-white cursor-pointer appearance-none">
                    {Object.entries(ctrl.options).map(([id, { label }]) => (
                      <option key={id} value={id} className="bg-black text-sm font-mono">{label}</option>
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
                  <div key={s.id} className="p-6 bg-black border-2 border-white/20 pixel-border space-y-6 animate-in slide-in-from-right-4 transition-all">
                    <div className="flex items-center justify-between border-b-2 border-white/10 pb-4">
                      <div className="flex items-center gap-4">
                        <Box size={16} className="text-emerald-500" />
                        <input value={s.name} onChange={(e) => setState(p => ({ ...p, scopes: p.scopes.map(sc => sc.id === s.id ? { ...sc, name: e.target.value } : sc) }))} className="bg-transparent border-none p-0 text-xs font-pixel uppercase tracking-widest text-white focus:ring-0 w-full" />
                      </div>
                      <button onClick={() => removeScope(s.id)} className="p-2 hover:bg-red-900/20 text-gray-500 hover:text-red-500 transition-colors pixel-border border border-transparent hover:border-red-500"><X size={14} /></button>
                    </div>
                    <textarea value={s.code} onChange={(e) => updateScope(s.id, e.target.value)} placeholder="// Write feature logic..." className="w-full h-40 bg-white/5 border-2 border-transparent focus:border-emerald-500 pixel-border p-4 font-mono text-xs text-emerald-400 placeholder-gray-700 resize-none custom-scrollbar outline-none" />
                    {s.metrics && (
                      <div className="flex items-center justify-between px-2 pt-2">
                        <div className="flex gap-6">
                          <div className="flex items-center gap-2"><Zap size={10} className="text-amber-500" /><span className="text-[10px] font-pixel text-gray-400">{s.metrics.estimatedEnergy.toFixed(4)} KWH</span></div>
                          <div className="flex items-center gap-2"><Activity size={10} className="text-blue-500" /><span className="text-[10px] font-pixel text-gray-400">O({s.metrics.complexity.toFixed(1)})</span></div>
                        </div>
                        <span className="text-[9px] font-pixel text-emerald-500 uppercase">SYNCED</span>
                      </div>
                    )}
                  </div>
                ))}
                <button onClick={addScope} className="w-full p-6 border-2 border-dashed border-white/20 hover:border-emerald-500/50 hover:bg-emerald-900/10 transition-all flex items-center justify-center gap-4 text-gray-500 hover:text-emerald-400 text-xs font-pixel uppercase tracking-widest pixel-border">
                  <Plus size={16} /> ADD_NEW_SCOPE
                </button>
              </div>
            )}
          </div>
        </div>

        {state.metrics && (
          <div className="space-y-20 animate-in fade-in slide-in-from-bottom-10 duration-500">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-12 py-12 border-y-2 border-white/10 border-dashed">
              <div className="space-y-4 text-center lg:text-left">
                <h2 className="text-4xl font-pixel text-white uppercase">SYNTHESIS_LIVE</h2>
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6">
                  <div className="flex items-center gap-2 px-3 py-1 bg-emerald-900/20 border-2 border-emerald-500/20 text-[10px] font-mono text-emerald-500 uppercase tracking-widest pixel-border">
                    <ShieldCheck size={12} className="animate-pulse" /> PROTOCOL_SAFE
                  </div>
                  <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">GRID_LOAD: {state.metrics.gridIntensity} gCO2e</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <button onClick={() => setState(p => ({ ...p, runResults: [], isRunning: false, metrics: null, review: null }))} className="p-4 border-2 border-white/20 hover:bg-white/10 transition-colors pixel-border"><RotateCcw size={20} className="text-gray-400" /></button>
                <button onClick={commitToLedger} disabled={state.isSaving || state.isSaved} className={cn("flex items-center gap-4 px-8 py-4 font-pixel uppercase text-xs transition-all pixel-border border-2", state.isSaved ? "bg-emerald-500 text-black border-emerald-500 cursor-default" : "bg-black text-white border-white hover:bg-white hover:text-black")}>
                  {state.isSaving ? <Loader2 size={16} className="animate-spin" /> : state.isSaved ? <CheckCircle2 size={16} /> : <Save size={16} />}
                  {state.isSaved ? "SAVED_TO_VAULT" : "COMMIT_AUDIT"}
                </button>
                {state.isSaved && (
                  <button onClick={() => navigator.clipboard.writeText(`![CO2DE Grade](${window.location.origin}/api/badge/${state.lastSavedId})`).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000) })} className="flex items-center gap-4 px-8 py-4 bg-emerald-900/20 border-2 border-emerald-500/20 text-emerald-500 font-pixel uppercase text-xs transition-all pixel-border">
                    {copied ? <Check size={16} /> : <Copy size={16} />} {copied ? "COPIED" : "BADGE"}
                  </button>
                )}
              </div>
            </div>

            <MetricsDisplay metrics={state.metrics} />

            <div className="grid lg:grid-cols-2 gap-16">
              <div className="space-y-16">
                <div className="p-8 border-2 border-white/20 bg-black pixel-border relative overflow-hidden flex flex-col justify-center min-h-[400px]">
                  <h3 className="text-xs font-pixel mb-12 text-gray-500 uppercase tracking-widest text-center lg:text-left">OPERATIONAL_EFFICIENCY</h3>
                  <EnergyScoreChart score={state.review?.score || Math.max(1, 10 - Math.floor(state.metrics.complexity * 1.5))} />

                  {state.mode === 'architect' && (
                    <div className="mt-16 space-y-8">
                      <div className="flex items-center justify-between border-b-2 border-white/10 pb-2">
                        <span className="text-[10px] font-pixel text-gray-500 uppercase">SCOPE_IMPACT_DISTRIBUTION</span>
                        <BarChart3 size={14} className="text-gray-600" />
                      </div>
                      <div className="space-y-4">
                        {state.scopes.map(s => {
                          const p = Math.min(100, (s.metrics?.estimatedCO2 / state.metrics.estimatedCO2) * 100) || 0;
                          return (
                            <div key={s.id} className="space-y-2">
                              <div className="flex items-center justify-between text-[10px] font-mono uppercase"><span className="text-white">{s.name}</span><span className="text-emerald-500">{p.toFixed(1)}%</span></div>
                              <div className="h-2 w-full bg-white/10"><div className="h-full bg-emerald-500" style={{ width: `${p}%` }} /></div>
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
                  <div className="p-8 border-2 border-white/10 bg-black space-y-8 text-center lg:text-left pixel-border">
                    <div className="flex items-center justify-center lg:justify-start gap-4 text-emerald-500"><Terminal size={20} /><h3 className="text-xl font-pixel uppercase">ARCHITECT_REVIEW</h3></div>
                    <p className="text-gray-500 font-mono text-sm leading-relaxed">
                        // ENGINE STATUS: ACTIVE <br />
                      Analyzing multiple feature scopes for cumulative carbon density. Refactor suggestions disabled in synthesis mode.
                    </p>
                    <div className="grid grid-cols-1 gap-4">
                      <div className="p-4 bg-white/5 border border-white/10 flex items-center gap-6 pixel-border"><div className="text-emerald-500"><ShieldCheck size={18} /></div><div className="space-y-1"><p className="text-[10px] font-mono text-gray-500 uppercase">COMPLEXITY</p><p className="text-xl font-pixel text-white">O({state.metrics.complexity.toFixed(2)})</p></div></div>
                      <div className="p-4 bg-white/5 border border-white/10 flex items-center gap-6 pixel-border"><div className="text-amber-500"><Zap size={18} /></div><div className="space-y-1"><p className="text-[10px] font-mono text-gray-500 uppercase">TOTAL_DRAW</p><p className="text-xl font-pixel text-white">{state.metrics.estimatedEnergy.toFixed(4)} KWH</p></div></div>
                    </div>
                  </div>
                )}

                {state.mode === 'upload' && (
                  !state.refactored ? (
                    <button onClick={handleRefactor} disabled={state.isRefactoring} className="w-full p-8 border-2 border-emerald-500/50 bg-emerald-900/10 hover:bg-emerald-900/20 transition-all group flex items-center justify-between text-left relative overflow-hidden pixel-border">
                      <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/10 blur-3xl" />
                      <div className="space-y-2 relative z-10">
                        <p className="text-emerald-500 font-pixel text-xl uppercase">REFACTOR_MODULE</p>
                        <p className="text-emerald-500/60 text-[10px] uppercase font-mono">AUTONOMOUS_CODE_OPT</p>
                      </div>
                      {state.isRefactoring ? <Loader2 className="animate-spin text-emerald-500" /> : <Sparkles className="text-emerald-500 group-hover:scale-110 transition-transform" size={24} />}
                    </button>
                  ) : (
                    <div className="p-8 border-2 border-emerald-500 bg-black space-y-6 animate-in zoom-in-95 pixel-border relative">
                      <div className="flex items-center justify-between border-b-2 border-emerald-500/20 pb-4"><div className="flex items-center gap-4 text-emerald-500"><CheckCircle2 size={24} /><span className="text-lg font-pixel uppercase">OPTIMIZED_RESULT</span></div><button onClick={() => setState(p => ({ ...p, refactored: null }))} className="text-[10px] font-mono text-gray-500 uppercase hover:text-white transition-colors">DISMISS</button></div>
                      <div className="bg-black/80 p-6 font-mono text-xs text-emerald-400 overflow-x-auto border border-white/10 max-h-[400px] custom-scrollbar selection:bg-emerald-500/20"><pre><code>{state.refactored.code}</code></pre></div>
                      <div className="space-y-4"><div className="flex items-center gap-2"><Zap size={14} className="text-emerald-500" /><span className="text-[10px] font-pixel text-emerald-500 uppercase">SUMMARY</span></div><p className="text-sm text-gray-400 font-mono leading-relaxed">// {state.refactored.explanation}</p></div>
                    </div>
                  )
                )}

                <Link href="/dashboard" className="w-full p-8 border-2 border-white/10 bg-black hover:bg-white hover:text-black transition-colors flex items-center justify-between group pixel-border">
                  <div className="space-y-1"><p className="text-lg font-pixel uppercase transition-colors">PROTOCOL_VAULT</p><p className="text-[10px] font-mono text-gray-500 uppercase group-hover:text-black transition-colors">VIEW_HISTORICAL_LEDGER</p></div>
                  <ArrowRight size={24} className="text-gray-500 group-hover:text-black group-hover:translate-x-2 transition-all" />
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
