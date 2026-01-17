"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { FileCode, Clock, TrendingUp, Upload, Zap, RefreshCw, ShieldCheck, Search, Trash2, Download, Leaf, Calendar, ArrowUpRight } from "lucide-react";
import { client, databases, DATABASE_ID, COLLECTION_ID, isAppwriteConfigured, listUserAnalyses, deleteAnalysisDocument } from "@/lib/appwrite";
import { Query } from "appwrite";
import { useAuth } from "@/hooks/use-auth";
import { AnalysisItemSchema, AnalysisItem } from "@/lib/schemas";
import { cn } from "@/lib/utils";
import { EnergyTrendChart } from "@/components/dashboard/energy-trend";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

export default function DashboardPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [analyses, setAnalyses] = useState<AnalysisItem[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const fetchAnalyses = useCallback(async () => {
    if (!user) return;
    if (!isAppwriteConfigured()) {
      setError("Appwrite not configured. Check environment variables.");
      setDataLoading(false);
      return;
    }
    setIsSyncing(true);
    try {
      const documents = await listUserAnalyses(user.$id, 50);
      const validatedDocs = documents.map(doc => {
        try {
          return AnalysisItemSchema.parse(doc);
        } catch (e) { return null; }
      }).filter(doc => doc !== null) as AnalysisItem[];
      setAnalyses(validatedDocs);
      setError(null);
    } catch (err: any) {
      if (err.code === 404) {
        setError("Collection not found. Check your Collection ID in environment variables.");
      } else if (err.code === 401) {
        setError("Authentication required. Please log in again.");
      } else {
        setError(err.message || "Sync sequence failed.");
      }
    } finally {
      setDataLoading(false);
      setIsSyncing(false);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading) fetchAnalyses();
  }, [user, authLoading, fetchAnalyses]);

  useEffect(() => {
    if (!user || !isAppwriteConfigured()) return;
    const channel = `databases.${DATABASE_ID}.collections.${COLLECTION_ID}.documents`;
    const unsubscribe = client.subscribe(channel, (response) => {
      const payload = response.payload as any;
      if (payload.userId !== user.$id) return;
      if (response.events.includes("*.create")) {
        try {
          const validated = AnalysisItemSchema.parse(payload);
          setAnalyses((prev) => [validated, ...prev].slice(0, 50));
        } catch (e) { }
      }
      if (response.events.includes("*.delete")) {
        setAnalyses((prev) => prev.filter((item) => item.$id !== payload.$id));
      }
    });
    return () => unsubscribe();
  }, [user]);

  // GSAP Animations
  useGSAP(() => {
    if (dataLoading) return;

    const tl = gsap.timeline();

    tl.from(".dashboard-header", {
      y: 30,
      opacity: 0,
      duration: 1,
      ease: "power3.out"
    })
      .from(".stat-card", {
        y: 20,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "power2.out"
      }, "-=0.5")
      .from(".analysis-card", {
        y: 30,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "power2.out"
      }, "-=0.5");

  }, { scope: containerRef, dependencies: [dataLoading, analyses] });

  const filteredAnalyses = analyses.filter(a =>
    a.fileName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalEnergy = analyses.reduce((sum, a) => sum + (a.estimatedEnergy || 0), 0);
  const totalCO2 = analyses.reduce((sum, a) => sum + (a.estimatedCO2 || 0), 0);
  const refactoredAnalyses = analyses.filter(a => a.optimizationDelta);
  const avgSaved = refactoredAnalyses.length > 0
    ? refactoredAnalyses.reduce((sum, a) => sum + (a.optimizationDelta || 0), 0) / refactoredAnalyses.length
    : 0;
  const avgScore = analyses.length > 0 ? analyses.reduce((sum, a) => sum + (a.score || 0), 0) / analyses.length : 0;

  const trendData = analyses.slice().reverse().map(a => ({
    date: new Date(a.createdAt).toLocaleDateString(),
    energy: a.estimatedEnergy
  }));

  const deleteAnalysis = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!DATABASE_ID || !COLLECTION_ID) return;
    if (!confirm("Confirm deletion?")) return;
    try {
      await databases.deleteDocument(DATABASE_ID, COLLECTION_ID, id);
      setAnalyses(prev => prev.filter(a => a.$id !== id));
    } catch (err) { alert("Deletion failed."); }
  };

  const exportLedger = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(analyses, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `CO2DE_Ledger_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  if (authLoading || (dataLoading && !analyses.length)) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center space-y-6">
        <div className="w-16 h-16 border-2 border-white/5 border-t-white rounded-full animate-spin" />
        <p className="text-gray-500 font-medium text-sm tracking-widest animate-pulse">Loading Dashboard...</p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="py-24 bg-[#0a0a0a] min-h-screen text-white selection:bg-white/20 selection:text-white">
      <div className="container mx-auto px-6 max-w-7xl">

        {/* Header Section */}
        <div className="dashboard-header mb-20 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-12">
          <div className="space-y-6">
            <h1 className="text-5xl sm:text-7xl font-medium tracking-tight text-white leading-none">
              Overview
            </h1>
            <p className="text-xl text-gray-400 font-light max-w-lg leading-relaxed">
              Tracking the environmental footprint of your software architecture.
            </p>
          </div>

          <div className="flex flex-wrap gap-4">
            <button
              onClick={exportLedger}
              className="flex items-center gap-2 px-6 py-3 rounded-full border border-white/10 hover:bg-white/5 text-sm font-medium text-gray-300 hover:text-white transition-all"
            >
              <Download size={16} />
              Export
            </button>
            <div className="relative group overflow-hidden rounded-full border border-white/10 hover:border-white/20 transition-all bg-white/[0.02] focus-within:bg-white/5">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-white transition-colors" />
              <input
                type="text"
                placeholder="Search audits..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-6 py-3 bg-transparent border-none text-sm text-white focus:ring-0 placeholder:text-gray-600 w-64"
              />
            </div>
            <Link
              href="/analyze"
              className="group inline-flex items-center gap-2 px-8 py-3 rounded-full bg-white text-black text-sm font-medium transition-all hover:bg-gray-200 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]"
            >
              <Upload size={16} />
              New Audit
            </Link>
          </div>
        </div>

        {error && (
          <div className="mb-12 p-6 rounded-2xl bg-red-500/5 border border-red-500/10 text-red-400 text-sm">
            Error: {error}
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-24">
          {/* Main Chart Card */}
          <div className="stat-card lg:col-span-2 p-8 rounded-[2rem] bg-[#111] border border-white/5 hover:border-white/10 transition-colors relative overflow-hidden group">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-medium text-white">Consumption</h3>
              <Zap size={18} className="text-white/40" />
            </div>
            <div className="h-[200px] w-full">
              <EnergyTrendChart data={trendData} />
            </div>
          </div>

          {[
            { label: "Total Energy", value: totalEnergy.toFixed(2), unit: "kWh", icon: Zap },
            { label: "Carbon Footprint", value: (totalCO2 / 1000).toFixed(2), unit: "kg", icon: Leaf },
          ].map((stat, i) => (
            <div key={i} className="stat-card p-8 rounded-[2rem] bg-[#111] border border-white/5 hover:border-white/10 hover:bg-[#161616] transition-all duration-500 group relative flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div className="p-3 rounded-xl bg-white/5 text-white/60 group-hover:text-white group-hover:bg-white/10 transition-colors">
                  <stat.icon size={20} />
                </div>
                <ArrowUpRight size={18} className="text-white/20 group-hover:text-white/60 transition-colors opacity-0 group-hover:opacity-100 transform translate-y-2 -translate-x-2 group-hover:translate-y-0 group-hover:translate-x-0 duration-300" />
              </div>
              <div>
                <p className="text-4xl font-medium tracking-tight text-white mb-1 group-hover:scale-105 transition-transform origin-left duration-500">{stat.value}</p>
                <div className="flex items-center gap-2 text-gray-500 text-sm">
                  <span>{stat.unit}</span>
                  <span className="w-1 h-1 rounded-full bg-gray-700" />
                  <span>{stat.label}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Secondary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-24">
          <div className="stat-card p-8 rounded-[2rem] bg-[#111] border border-white/5 hover:border-white/10 transition-colors">
            <p className="text-sm text-gray-500 mb-2">Efficiency Score</p>
            <div className="flex items-end gap-3">
              <span className="text-5xl font-medium tracking-tight text-white">{avgScore.toFixed(1)}</span>
              <span className="text-xl text-gray-600 mb-1">/10</span>
            </div>
          </div>

          <div className="stat-card p-8 rounded-[2rem] bg-[#111] border border-white/5 hover:border-white/10 transition-colors">
            <p className="text-sm text-gray-500 mb-2">Offset Required</p>
            <div className="flex items-end gap-3">
              <span className="text-5xl font-medium tracking-tight text-white">{Math.ceil((totalCO2 / 1000) / 21.77 * 365)}</span>
              <span className="text-sm text-gray-600 mb-2">Trees/yr</span>
            </div>
          </div>

          <div className="stat-card p-8 rounded-[2rem] bg-[#111] border border-white/5 hover:border-white/10 transition-colors">
            <p className="text-sm text-gray-500 mb-2">Optimization Gain</p>
            <div className="flex items-end gap-3">
              <span className="text-5xl font-medium tracking-tight text-white">+{avgSaved.toFixed(0)}</span>
              <span className="text-xl text-gray-600 mb-1">%</span>
            </div>
          </div>
        </div>

        {/* Audit List */}
        <div className="space-y-6">
          <div className="flex items-center justify-between mb-8 dashboard-header">
            <h2 className="text-2xl font-medium">Recent Audits ({filteredAnalyses.length})</h2>
          </div>

          <div className="grid gap-4">
            {filteredAnalyses.map((analysis) => (
              <div
                key={analysis.$id}
                className="analysis-card group p-6 rounded-3xl border border-white/5 bg-[#111] hover:bg-[#161616] hover:border-white/10 transition-all duration-300 relative overflow-hidden"
              >
                <div className="flex flex-col lg:flex-row lg:items-center gap-8 justify-between">
                  <div className="flex items-center gap-6">
                    <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-gray-400 group-hover:text-white group-hover:bg-white/10 transition-all duration-300">
                      <FileCode size={24} strokeWidth={1.5} />
                    </div>
                    <div>
                      <h3 className="text-xl font-medium text-white mb-1 group-hover:text-white/90 transition-colors">{analysis.fileName}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>{(analysis.fileSize / 1024).toFixed(1)} KB</span>
                        <span className="w-1 h-1 rounded-full bg-gray-700" />
                        <span>{new Date(analysis.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-12 lg:pr-8">
                    <div className="text-right">
                      <p className="text-xs text-gray-500 mb-1">Energy</p>
                      <p className="text-lg font-medium text-gray-200">{analysis.estimatedEnergy?.toFixed(3)} kWh</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 mb-1">Carbon</p>
                      <p className="text-lg font-medium text-gray-200">{analysis.estimatedCO2?.toFixed(2)} g</p>
                    </div>
                    <div className="text-right flex items-center gap-6">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Score</p>
                        <p className="text-xl font-medium text-white">{analysis.score}</p>
                      </div>

                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0 duration-300">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const url = `${window.location.origin}/api/badge/${analysis.$id}`;
                            const markdown = `![CO2DE Grade](${url})`;
                            navigator.clipboard.writeText(markdown);
                            alert("Badge copied!");
                          }}
                          className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                          title="Copy Badge"
                        >
                          <TrendingUp size={18} />
                        </button>
                        <button
                          onClick={(e) => deleteAnalysis(analysis.$id!, e)}
                          className="p-2 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredAnalyses.length === 0 && !dataLoading && (
            <div className="text-center py-32 opacity-50 dashboard-header">
              <p className="text-gray-500 text-lg font-light">No audits found.</p>
              <Link href="/analyze" className="text-white underline mt-4 inline-block hover:text-gray-300 transition-colors">Start your first audit</Link>
            </div>
          )}
        </div>

        <div className="h-20" />
      </div>
    </div>
  );
}
