"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { FileCode, Clock, TrendingUp, Upload, User, AlertCircle, Zap, RefreshCw, BarChart3, ShieldCheck } from "lucide-react";
import { client, databases, DATABASE_ID, COLLECTION_ID } from "@/lib/appwrite";
import { Query } from "appwrite";
import { useAuth } from "@/hooks/use-auth";
import { AnalysisItemSchema, AnalysisItem } from "@/lib/schemas";
import { cn } from "@/lib/utils";

import { EnergyTrendChart } from "@/components/dashboard/energy-trend";
import { Search } from "lucide-react";

export default function DashboardPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [analyses, setAnalyses] = useState<AnalysisItem[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchAnalyses = useCallback(async () => {
    if (!user) return;
    setIsSyncing(true);
    try {
      const queries = [
        Query.orderDesc("createdAt"), 
        Query.limit(50),
        Query.equal("userId", user.$id)
      ];
      const response = await databases.listDocuments(DATABASE_ID!, COLLECTION_ID!, queries);
      const validatedDocs = response.documents.map(doc => {
        try {
          return AnalysisItemSchema.parse(doc);
        } catch (e) { return null; }
      }).filter(doc => doc !== null) as AnalysisItem[];
      setAnalyses(validatedDocs);
      setError(null);
    } catch (err: any) {
      setError(err.code === 400 ? "Indexing protocol missing. Contact system admin." : "Sync sequence failed.");
    } finally {
      setDataLoading(false);
      setIsSyncing(false);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading) fetchAnalyses();
  }, [user, authLoading, fetchAnalyses]);

  useEffect(() => {
    if (!user || !DATABASE_ID || !COLLECTION_ID) return;
    const channel = `databases.${DATABASE_ID}.collections.${COLLECTION_ID}.documents`;
    const unsubscribe = client.subscribe(channel, (response) => {
      const payload = response.payload as any;
      if (payload.userId !== user.$id) return;
      if (response.events.includes("*.create")) {
        try {
          const validated = AnalysisItemSchema.parse(payload);
          setAnalyses((prev) => [validated, ...prev].slice(0, 50));
        } catch (e) {}
      }
      if (response.events.includes("*.delete")) {
        setAnalyses((prev) => prev.filter((item) => item.$id !== payload.$id));
      }
    });
    return () => unsubscribe();
  }, [user]);

  const filteredAnalyses = analyses.filter(a => 
    a.fileName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalEnergy = analyses.reduce((sum, a) => sum + (a.estimatedEnergy || 0), 0);
  const totalCO2 = analyses.reduce((sum, a) => sum + (a.estimatedCO2 || 0), 0);
  const avgScore = analyses.length > 0 ? analyses.reduce((sum, a) => sum + (a.score || 0), 0) / analyses.length : 0;

  const trendData = analyses.slice().reverse().map(a => ({
    date: new Date(a.createdAt).toLocaleDateString(),
    energy: a.estimatedEnergy
  }));

  if (authLoading || (dataLoading && !analyses.length)) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center space-y-6">
        <div className="w-16 h-16 border-2 border-white/5 border-t-emerald-500 rounded-full animate-spin shadow-[0_0_30px_rgba(16,185,129,0.2)]" />
        <p className="text-gray-500 font-mono text-[10px] uppercase tracking-[0.4em] animate-pulse">Synchronizing_Ledger...</p>
      </div>
    );
  }

  return (
    <div className="py-24 bg-[#0a0a0a] min-h-screen text-white selection:bg-emerald-500/30">
      <div className="container mx-auto px-4 max-w-7xl">
        
        {/* Header Section */}
        <div className="mb-20 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-12">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <h2 className="text-[10px] font-mono text-emerald-500 uppercase tracking-[0.5em]">Protocol.Vault_v4.0</h2>
            </div>
            <h1 className="text-5xl sm:text-8xl font-black tracking-tighter uppercase leading-none italic">
              User_<span className="text-emerald-500">{user?.name.split(' ')[0]}</span>
            </h1>
            <div className="flex items-center gap-4 text-[10px] font-mono text-gray-500 uppercase tracking-widest opacity-50">
               <ShieldCheck size={12} className="text-emerald-500" />
               Artifact_Ledger_Secured
            </div>
          </div>
          
          <div className="flex flex-wrap gap-4">
            <div className="relative group overflow-hidden rounded-full border border-white/5 bg-white/[0.02] focus-within:border-emerald-500/50 transition-all">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-focus-within:text-emerald-500 transition-colors" />
              <input 
                type="text" 
                placeholder="Search_Ledger..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-14 pr-10 py-5 bg-transparent border-none text-[10px] font-mono uppercase tracking-widest text-white focus:ring-0 w-64"
              />
            </div>
            <button 
              onClick={fetchAnalyses}
              className="p-5 rounded-full border border-white/10 hover:bg-white/5 transition-all active:scale-95"
            >
              <RefreshCw size={20} className={isSyncing ? "animate-spin text-emerald-500" : "text-gray-400"} />
            </button>
            <Link
              href="/analyze"
              className="group inline-flex items-center gap-4 px-12 py-5 rounded-full bg-white text-black font-black transition-all hover:bg-emerald-500 hover:text-white active:scale-95 text-sm uppercase tracking-tighter shadow-[0_0_40px_rgba(255,255,255,0.05)]"
            >
              <Upload size={16} />
              New_Audit
            </Link>
          </div>
        </div>

        {error && (
          <div className="mb-12 p-10 rounded-[2.5rem] bg-red-500/5 border border-red-500/10 text-red-500 font-mono text-[10px] text-center uppercase tracking-[0.4em]">
             System_Halt: {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-24">
          <div className="lg:col-span-2 p-10 rounded-[3.5rem] bg-white/[0.01] border border-white/5 backdrop-blur-3xl relative overflow-hidden group">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-[10px] font-mono text-gray-500 uppercase tracking-[0.5em]">Energy_Consumption_Trend</h3>
              <div className="h-px flex-1 bg-white/5 mx-8" />
              <Zap size={14} className="text-amber-500 animate-pulse" />
            </div>
            <EnergyTrendChart data={trendData} />
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-1 gap-6">
            {[
              { label: "Net_Energy", value: totalEnergy.toFixed(3), unit: "kWh", icon: Zap, color: "text-amber-500" },
              { label: "Net_CO2e", value: totalCO2.toFixed(2), unit: "g", icon: TrendingUp, color: "text-emerald-500" },
            ].map((stat, i) => (
              <div key={i} className="p-10 rounded-[3rem] bg-white/[0.02] border border-white/5 group hover:border-emerald-500/20 transition-all relative overflow-hidden">
                <div className="space-y-4 relative z-10 text-center">
                  <p className="text-[10px] font-mono text-gray-500 uppercase tracking-[0.2em]">{stat.label}</p>
                  <div className="flex items-baseline justify-center gap-2">
                    <p className="text-5xl font-black tracking-tighter italic">{stat.value}</p>
                    <p className="text-[10px] font-mono text-gray-600 uppercase italic">{stat.unit}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* History Ledger */}
        <div className="space-y-8">
          <div className="flex items-center justify-between mb-16">
            <h3 className="text-[10px] font-mono text-gray-400 uppercase tracking-[0.5em] flex items-center gap-6">
              <span className="w-12 h-px bg-emerald-500" />
              Operational_Trace ({filteredAnalyses.length})
            </h3>
            <div className="h-px flex-1 bg-white/5 ml-12" />
          </div>

          <div className="grid gap-6">
            {filteredAnalyses.map((analysis) => (
              <div
                key={analysis.$id}
                className="group p-10 rounded-[3.5rem] border border-white/5 bg-white/[0.01] backdrop-blur-3xl hover:bg-white/[0.03] hover:border-white/10 transition-all relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500 opacity-0 group-hover:opacity-100 transition-all" />
                
                <div className="flex flex-col lg:flex-row lg:items-center gap-12">
                  <div className="flex items-center gap-10 flex-1">
                    <div className="w-20 h-20 rounded-3xl bg-white/[0.03] border border-white/5 flex items-center justify-center group-hover:scale-110 group-hover:bg-emerald-500 group-hover:border-emerald-500 transition-all">
                      <FileCode size={32} className="text-gray-600 group-hover:text-white transition-colors" />
                    </div>
                    <div className="min-w-0 space-y-2">
                      <h3 className="text-3xl font-black truncate tracking-tighter uppercase italic">{analysis.fileName}</h3>
                      <div className="flex flex-wrap items-center gap-6 text-[10px] font-mono text-gray-600 uppercase tracking-widest">
                        <span className="px-3 py-1 rounded-full border border-white/10 bg-white/5 text-emerald-500/80">{(analysis.fileSize / 1024).toFixed(1)} KB Packet</span>
                        {analysis.region && <span className="text-amber-500/50">{analysis.region}</span>}
                        {analysis.language && <span className="text-blue-500/50">{analysis.language}</span>}
                        {analysis.complexity && <span className="text-emerald-500/50">O({analysis.complexity.toFixed(1)})</span>}
                        <span className="flex items-center gap-2">
                          <Clock size={12} />
                          {new Date(analysis.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-16 lg:gap-24 shrink-0 text-right">
                    <div className="space-y-1">
                      <p className="text-[10px] font-mono text-gray-600 uppercase tracking-widest">Energy</p>
                      <p className="text-3xl font-black text-amber-500 font-mono tracking-tighter italic">{analysis.estimatedEnergy?.toFixed(3)}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-mono text-gray-600 uppercase tracking-widest">CO2e</p>
                      <p className="text-3xl font-black text-emerald-500 font-mono tracking-tighter italic">{analysis.estimatedCO2?.toFixed(2)}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-mono text-gray-600 uppercase tracking-widest">Grade</p>
                      <p className="text-3xl font-black text-white font-mono tracking-tighter italic">{analysis.score}/10</p>
                    </div>
                  </div>
                </div>

                <div className="mt-12 pt-10 border-t border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-10">
                  <div className="flex items-start gap-6 flex-1">
                    <div className="mt-1 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                      <Zap size={14} className="text-emerald-500" />
                    </div>
                    <div className="space-y-2">
                       <p className="text-[10px] font-mono text-emerald-500/50 uppercase tracking-[0.2em] font-bold underline decoration-emerald-500/20 underline-offset-4">Optimization_Strategy</p>
                       <p className="text-[13px] text-gray-400 font-medium leading-relaxed max-w-4xl lowercase first-letter:uppercase">
                          {analysis.optimization}
                       </p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => {
                      const url = `${window.location.origin}/api/badge/${analysis.$id}`;
                      const markdown = `![CO2DE Grade](${url})`;
                      navigator.clipboard.writeText(markdown);
                      alert("Markdown badge link copied to clipboard!");
                    }}
                    className="shrink-0 flex items-center gap-4 px-8 py-4 rounded-full border border-white/10 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white hover:bg-white/5 transition-all shadow-inner"
                  >
                    <TrendingUp size={14} />
                    Share_Badge
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredAnalyses.length === 0 && !dataLoading && (
            <div className="text-center py-48 rounded-[4rem] border border-dashed border-white/5 bg-white/[0.01] backdrop-blur-sm group">
               <div className="w-24 h-24 rounded-[2rem] bg-white/5 flex items-center justify-center mx-auto mb-10 border border-white/10 group-hover:rotate-6 transition-transform">
                 <FileCode size={32} className="text-emerald-500 opacity-20" />
               </div>
               <h3 className="text-4xl font-black mb-4 tracking-tighter uppercase italic">{searchQuery ? 'No_Matches' : 'Vault_Empty'}</h3>
               <p className="text-gray-600 mb-16 max-w-sm mx-auto font-medium text-sm leading-relaxed lowercase">
                 {searchQuery ? `No artifacts found for "${searchQuery}". Try a different protocol identifier.` : 'No computational footprints detected. Initiate a high-fidelity audit to populate the protocol ledger.'}
               </p>
               <Link
                 href="/analyze"
                 className="inline-flex items-center gap-6 px-16 py-6 rounded-full bg-emerald-500 text-white font-black hover:bg-white hover:text-black transition-all active:scale-95 uppercase tracking-tighter text-sm shadow-[0_0_50px_rgba(16,185,129,0.1)]"
               >
                 START_CAPTURE
                 <Upload size={18} />
               </Link>
            </div>
          )}
        </div>

        <div className="h-40" />
      </div>
    </div>
  );
}
