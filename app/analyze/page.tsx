"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FileUpload } from "@/components/upload";
import { MetricsDisplay, EnergyScoreChart, AIReviewCard, GridTimeline } from "@/components/dashboard";
import { calculateEnergyMetrics, REGIONS, HARDWARE_PROFILES, getGridIntensity, getAIReview, getAIRefactor } from "@/lib/energy";
import { AnalysisItemSchema, AIReview, Geolocation } from "@/lib/schemas";
import { Sparkles, RotateCcw, Loader2, Zap, TrendingUp, BarChart3, Globe, Cpu, Terminal, CheckCircle2, FileStack, Save, Copy, Check, ShieldCheck, Box, Plus, X, Activity, ArrowRight, ArrowLeft } from "lucide-react";
import { createAnalysisDocument, isAppwriteConfigured } from "@/lib/appwrite";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

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
  geolocation: Geolocation | null;
  scopes: FeatureScope[];
}

export default function AnalyzePage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

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
    geolocation: null,
    scopes: [{ id: '1', name: 'New Scope', code: '', metrics: null }]
  });
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login?callbackUrl=/analyze");
    }
  }, [user, authLoading, router]);

  // Auto-detect region from IP on page load
  useEffect(() => {
    const fetchGeolocation = async () => {
      try {
        const response = await fetch('/api/geolocation');
        if (!response.ok) throw new Error('Geolocation failed');
        const geo = await response.json();
        setState(p => ({ ...p, region: geo.region, geolocation: geo }));
      } catch (error) {
        console.error('Geolocation detection failed:', error);
      }
    };
    fetchGeolocation();
  }, []);

  useGSAP(() => {
    const tl = gsap.timeline();

    tl.from(".analyze-header", {
      y: 30,
      opacity: 0,
      duration: 1,
      ease: "power3.out"
    })
      .from(".control-panel", {
        y: 20,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "power2.out"
      }, "-=0.5")
      .from(".content-area", {
        y: 30,
        opacity: 0,
        duration: 0.8,
        ease: "power2.out"
      }, "-=0.6");

  }, { scope: containerRef });

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
  }, [state.scopes, state.region, state.hardware, state.mode]);

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

  const addScope = () => setState(p => ({ ...p, scopes: [...p.scopes, { id: Date.now().toString(), name: `Scope ${p.scopes.length + 1}`, code: '', metrics: null }] }));
  const updateScope = (id: string, code: string) => setState(p => ({ ...p, scopes: p.scopes.map(s => s.id === id ? { ...s, code } : s) }));
  const removeScope = (id: string) => state.scopes.length > 1 && setState(p => ({ ...p, scopes: p.scopes.filter(s => s.id !== id) }));

  const commitToLedger = async () => {
    if (!state.metrics || !user) return;
    if (!process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || !process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID) {
      setError("Appwrite not configured. Check environment variables.");
      return;
    }
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
        lineCount: state.metrics.lineCount,
        region: state.region,
        hardwareProfile: state.hardware,
        gridIntensity: state.geolocation?.gridIntensity || state.metrics.gridIntensity,
        recursionDetected: state.metrics.recursionDetected,
        language: state.metrics.language,
        clientCity: state.geolocation?.city,
        clientCountry: state.geolocation?.country,
        clientIp: state.geolocation?.ip,
        engineVersion: '5.0.0-delta',
        summary: state.review?.summary,
        dependencies: state.review?.dependencies,
        hotspots: state.review?.hotspots,
        securityNotes: state.review?.securityNotes
      };
      const doc = await createAnalysisDocument(user.$id, payload);
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

  if (authLoading) return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center space-y-6">
      <div className="w-16 h-16 border-2 border-white/5 border-t-white rounded-full animate-spin" />
    </div>
  );

  return (
    <div ref={containerRef} className="py-24 bg-[#0a0a0a] min-h-screen selection:bg-white/20 selection:text-white text-white">
      <div className="container mx-auto px-6 max-w-7xl">

        {/* Back Link */}
        <div className="mb-8 analyze-header">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-white transition-colors">
            <ArrowLeft size={16} /> Back to Dashboard
          </Link>
        </div>

        {/* Header */}
        <div className="flex flex-col lg:flex-row gap-12 mb-16 analyze-header justify-between items-end">
          <div className="space-y-6">
            <h1 className="text-5xl sm:text-7xl font-medium tracking-tight text-white leading-none">
              {state.mode === 'upload' ? 'Analyze' : 'Architect'}
            </h1>
            <p className="text-xl text-gray-400 font-light max-w-lg leading-relaxed">
              {state.mode === 'upload'
                ? "Upload your code to measure its environmental impact."
                : "Design and simulate energy-efficient systems."}
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="flex p-1 bg-white/5 rounded-full border border-white/10">
            {[
              { id: 'upload' as const, label: 'Upload Code' },
              { id: 'architect' as const, label: 'Architect' }
            ].map(m => (
              <button
                key={m.id}
                onClick={() => setState(p => ({ ...p, mode: m.id, metrics: null, review: null }))}
                className={cn(
                  "px-8 py-3 rounded-full text-sm font-medium transition-all",
                  state.mode === m.id ? "bg-white text-black shadow-lg" : "text-gray-400 hover:text-white"
                )}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-12 mb-24">
          <div className="flex-1 space-y-8 control-panel">

            {/* Context Settings */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="p-6 bg-[#111] border border-white/5 rounded-3xl space-y-4 hover:border-white/10 transition-colors group">
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                  <Globe size={16} className="text-white/40 group-hover:text-emerald-400 transition-colors" />
                  Region
                </div>
                <div>
                  <p className="text-lg font-medium text-white">
                    {state.geolocation ? (REGIONS as any)[state.region]?.label?.split(' (')[0] || state.region : "Detecting..."}
                  </p>
                  {state.geolocation?.city && (
                    <p className="text-sm text-gray-500 mt-1">
                      {state.geolocation.city}, {state.geolocation.country}
                    </p>
                  )}
                </div>
              </div>

              <div className="p-6 bg-[#111] border border-white/5 rounded-3xl space-y-4 hover:border-white/10 transition-colors group">
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                  <Cpu size={16} className="text-white/40 group-hover:text-amber-400 transition-colors" />
                  Hardware
                </div>
                <select
                  value={state.hardware}
                  onChange={(e) => setState(p => ({ ...p, hardware: e.target.value }))}
                  className="w-full bg-transparent border-none p-0 text-lg font-medium focus:ring-0 text-white cursor-pointer appearance-none"
                >
                  {Object.entries(HARDWARE_PROFILES).map(([id, { label }]) => (
                    <option key={id} value={id} className="bg-black text-sm">{label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Main Input Area */}
            <div className="content-area">
              {state.mode === 'upload' ? (
                <div className="bg-[#111] rounded-[2.5rem] border border-white/5 p-2 overflow-hidden">
                  <div className="rounded-[2rem] border border-dashed border-white/10 bg-black/50 overflow-hidden">
                    <FileUpload onFilesAccepted={handleFilesAccepted} isLoading={state.isAnalyzing} acceptedFiles={state.files} onClear={() => setState(p => ({ ...p, files: [], contents: [], metrics: null, review: null }))} />
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {state.scopes.map(s => (
                    <div key={s.id} className="p-8 bg-[#111] border border-white/5 rounded-[2.5rem] space-y-6 hover:border-white/10 transition-colors shadow-2xl shadow-black/50">
                      <div className="flex items-center justify-between">
                        <input
                          value={s.name}
                          onChange={(e) => setState(p => ({ ...p, scopes: p.scopes.map(sc => sc.id === s.id ? { ...sc, name: e.target.value } : sc) }))}
                          className="bg-transparent border-none p-0 text-lg font-medium text-white focus:ring-0 w-full placeholder:text-gray-600"
                          placeholder="Scope Name"
                        />
                        <button onClick={() => removeScope(s.id)} className="p-2 bg-white/5 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
                          <X size={16} />
                        </button>
                      </div>
                      <textarea
                        value={s.code}
                        onChange={(e) => updateScope(s.id, e.target.value)}
                        placeholder="// Write your logic here..."
                        className="w-full h-48 bg-black/50 rounded-2xl border border-white/5 focus:border-white/20 p-6 text-sm text-gray-300 placeholder-gray-700 resize-none font-mono outline-none transition-colors"
                      />
                      {s.metrics && (
                        <div className="flex items-center gap-6 pt-2 border-t border-white/5">
                          <div className="flex items-center gap-2"><Zap size={14} className="text-amber-400/80" /><span className="text-sm text-gray-400">{s.metrics.estimatedEnergy.toFixed(4)} kWh</span></div>
                          <div className="flex items-center gap-2"><Activity size={14} className="text-blue-400/80" /><span className="text-sm text-gray-400">Complexity O({s.metrics.complexity.toFixed(1)})</span></div>
                        </div>
                      )}
                    </div>
                  ))}
                  <button onClick={addScope} className="w-full py-6 rounded-full border border-dashed border-white/10 hover:border-white/20 hover:bg-white/5 transition-all flex items-center justify-center gap-2 text-gray-400 hover:text-white text-sm font-medium">
                    <Plus size={18} /> Add Scope
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Results Section */}
        {state.metrics && (
          <div className="space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-12 py-12 border-t border-white/10">
              <div className="space-y-2 text-center lg:text-left">
                <h2 className="text-3xl font-medium text-white">Analysis Complete</h2>
                <p className="text-gray-500">Grid Intensity: <span className="text-white">{state.metrics.gridIntensity} gCO2e</span></p>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => setState(p => ({ ...p, runResults: [], isRunning: false, metrics: null, review: null }))}
                  className="p-4 rounded-full border border-white/10 hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
                >
                  <RotateCcw size={20} />
                </button>
                <button
                  onClick={commitToLedger}
                  disabled={state.isSaving || state.isSaved}
                  className={cn(
                    "flex items-center gap-3 px-8 py-4 rounded-full text-sm font-medium transition-all shadow-lg",
                    state.isSaved
                      ? "bg-emerald-500 text-white cursor-default"
                      : "bg-white text-black hover:bg-gray-200 active:scale-95"
                  )}
                >
                  {state.isSaving ? <Loader2 size={18} className="animate-spin" /> : state.isSaved ? <CheckCircle2 size={18} /> : <Save size={18} />}
                  {state.isSaved ? "Saved to Vault" : "Commit Audit"}
                </button>
                {state.isSaved && (
                  <button
                    onClick={() => navigator.clipboard.writeText(`![CO2DE Grade](${window.location.origin}/api/badge/${state.lastSavedId})`).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000) })}
                    className="flex items-center gap-3 px-8 py-4 rounded-full bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all text-sm font-medium"
                  >
                    {copied ? <Check size={18} /> : <Copy size={18} />} {copied ? "Copied" : "Copy Badge"}
                  </button>
                )}
              </div>
            </div>

            <MetricsDisplay metrics={state.metrics} />

            <div className="grid lg:grid-cols-2 gap-12">
              <div className="space-y-12">
                <div className="p-10 rounded-[3rem] bg-[#111] border border-white/5">
                  <h3 className="text-lg font-medium text-white mb-8">Efficiency Score</h3>
                  <EnergyScoreChart score={state.review?.score || Math.max(1, 10 - Math.floor(state.metrics.complexity * 1.5))} />

                  {state.mode === 'architect' && (
                    <div className="mt-12 space-y-6">
                      <p className="text-sm text-gray-500 font-medium">Impact Distribution</p>
                      <div className="space-y-4">
                        {state.scopes.map(s => {
                          const p = Math.min(100, (s.metrics?.estimatedCO2 / state.metrics.estimatedCO2) * 100) || 0;
                          return (
                            <div key={s.id} className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-white">{s.name}</span>
                                <span className="text-emerald-400">{p.toFixed(1)}%</span>
                              </div>
                              <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${p}%` }} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
                <GridTimeline region={state.region} />
              </div>

              <div className="space-y-8">
                {state.mode === 'upload' && state.review ? <AIReviewCard review={state.review} /> : (
                  <div className="p-10 rounded-[3rem] bg-[#111] border border-white/5 text-center lg:text-left">
                    <div className="flex items-center justify-center lg:justify-start gap-4 mb-6">
                      <div className="p-3 bg-white/5 rounded-2xl text-emerald-400"><Terminal size={24} /></div>
                      <h3 className="text-xl font-medium text-white">Architect Review</h3>
                    </div>
                    <p className="text-gray-400 leading-relaxed mb-8">
                      The engine is actively analyzing multiple feature scopes to determine cumulative carbon density and optimize algorithmic complexity.
                    </p>
                    <div className="grid gap-4">
                      <div className="p-5 rounded-2xl bg-white/5 flex items-center gap-4">
                        <ShieldCheck className="text-emerald-400" size={20} />
                        <div>
                          <p className="text-xs text-gray-500 mb-0.5">Complexity</p>
                          <p className="text-white font-medium">O({state.metrics.complexity.toFixed(2)})</p>
                        </div>
                      </div>
                      <div className="p-5 rounded-2xl bg-white/5 flex items-center gap-4">
                        <Zap className="text-amber-400" size={20} />
                        <div>
                          <p className="text-xs text-gray-500 mb-0.5">Total Draw</p>
                          <p className="text-white font-medium">{state.metrics.estimatedEnergy.toFixed(4)} kWh</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {state.mode === 'upload' && (
                  !state.refactored ? (
                    <button
                      onClick={handleRefactor}
                      disabled={state.isRefactoring}
                      className="w-full p-8 rounded-[2.5rem] bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/20 hover:border-emerald-500/40 transition-all group relative overflow-hidden text-left"
                    >
                      <div className="relative z-10 flex justify-between items-center">
                        <div>
                          <p className="text-xl text-emerald-400 font-medium mb-1">Auto-Refactor</p>
                          <p className="text-emerald-400/60 text-sm">AI-powered code optimization</p>
                        </div>
                        {state.isRefactoring ? <Loader2 className="animate-spin text-emerald-400" /> : <Sparkles className="text-emerald-400 group-hover:scale-110 transition-transform" size={24} />}
                      </div>
                    </button>
                  ) : (
                    <div className="p-8 rounded-[2.5rem] bg-[#111] border border-emerald-500/30 space-y-6 relative overflow-hidden">
                      <div className="flex items-center justify-between pb-4 border-b border-white/5">
                        <div className="flex items-center gap-3 text-emerald-400">
                          <CheckCircle2 size={24} />
                          <span className="text-lg font-medium">Optimized Result</span>
                        </div>
                        <button onClick={() => setState(p => ({ ...p, refactored: null }))} className="text-xs text-gray-500 hover:text-white transition-colors">DISMISS</button>
                      </div>
                      <div className="bg-black/50 rounded-2xl p-6 text-sm text-emerald-300 font-mono overflow-x-auto border border-white/5 max-h-[400px]">
                        <pre><code>{state.refactored.code}</code></pre>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-emerald-400 text-xs font-medium uppercase tracking-widest">
                          <Zap size={12} /> Summary
                        </div>
                        <p className="text-gray-400 text-sm leading-relaxed">{state.refactored.explanation}</p>
                      </div>
                    </div>
                  )
                )}

                <Link href="/dashboard" className="w-full p-8 rounded-[2.5rem] bg-[#111] border border-white/5 hover:bg-white hover:text-black transition-all flex items-center justify-between group">
                  <div>
                    <p className="text-lg font-medium mb-1 group-hover:text-black">Protocol Vault</p>
                    <p className="text-sm text-gray-500 group-hover:text-black/60">View historical ledger</p>
                  </div>
                  <ArrowRight size={24} className="text-gray-500 group-hover:text-black group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
