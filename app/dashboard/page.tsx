"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { FileCode, Clock, TrendingUp, Upload, User, AlertCircle, Zap, RefreshCw } from "lucide-react";
import { client, databases, DATABASE_ID, COLLECTION_ID } from "@/lib/appwrite";
import { Query } from "appwrite";
import { useAuth } from "@/hooks/use-auth";
import { AnalysisItemSchema, AnalysisItem } from "@/lib/schemas";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [analyses, setAnalyses] = useState<AnalysisItem[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const fetchAnalyses = useCallback(async () => {
    if (!user) return;
    
    if (!DATABASE_ID || !COLLECTION_ID) {
      setError("Storage configuration missing.");
      setDataLoading(false);
      return;
    }

    setIsSyncing(true);
    try {
      const queries = [
        Query.orderDesc("createdAt"), 
        Query.limit(20),
        Query.equal("userId", user.$id)
      ];

      const response = await databases.listDocuments(DATABASE_ID, COLLECTION_ID, queries);
      
      const validatedDocs = response.documents.map(doc => {
        try {
          return AnalysisItemSchema.parse(doc);
        } catch (e) {
          console.warn("Doc validation error:", e);
          return null;
        }
      }).filter(doc => doc !== null) as AnalysisItem[];

      setAnalyses(validatedDocs);
      setError(null);
    } catch (err: any) {
      console.error("Dashboard: Fetch failed", err);
      if (err.code === 400) {
        setError("Missing Index error. Ensure 'userId' index is created in Appwrite.");
      } else {
        setError("Failed to sync historical data.");
      }
    } finally {
      setDataLoading(false);
      setIsSyncing(false);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading) {
      fetchAnalyses();
    }
  }, [user, authLoading, fetchAnalyses]);

  // Real-time synchronization
  useEffect(() => {
    if (!user || !DATABASE_ID || !COLLECTION_ID) return;

    const channel = `databases.${DATABASE_ID}.collections.${COLLECTION_ID}.documents`;
    const unsubscribe = client.subscribe(channel, (response) => {
      const payload = response.payload as any;
      if (payload.userId !== user.$id) return;

      if (response.events.includes("databases.*.collections.*.documents.*.create")) {
        try {
          const validated = AnalysisItemSchema.parse(payload);
          setAnalyses((prev) => [validated, ...prev].slice(0, 50));
        } catch (e) {}
      }
      
      if (response.events.includes("databases.*.collections.*.documents.*.delete")) {
        setAnalyses((prev) => prev.filter((item) => item.$id !== payload.$id));
      }
    });

    return () => unsubscribe();
  }, [user]);

  const totalEnergy = analyses.reduce((sum, a) => sum + (a.estimatedEnergy || 0), 0);
  const totalCO2 = analyses.reduce((sum, a) => sum + (a.estimatedCO2 || 0), 0);
  const avgScore = analyses.length > 0 
    ? analyses.reduce((sum, a) => sum + (a.score || 0), 0) / analyses.length 
    : 0;

  if (authLoading || (dataLoading && !analyses.length)) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center space-y-6">
        <div className="w-16 h-16 border-2 border-white/5 border-t-emerald-500 rounded-full animate-spin" />
        <p className="text-gray-500 font-mono text-[10px] uppercase tracking-[0.4em] animate-pulse">Syncing environment...</p>
      </div>
    );
  }

  return (
    <div className="py-24 bg-[#0a0a0a] min-h-screen text-white">
      <div className="container mx-auto px-4 max-w-7xl">
        
        {/* Header Section */}
        <div className="mb-16 flex flex-col md:flex-row md:items-end md:justify-between gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <h2 className="text-xs font-mono text-gray-500 uppercase tracking-widest">Protocol.Dashboard</h2>
              {isSyncing && <RefreshCw size={10} className="animate-spin text-emerald-500" />}
            </div>
            <h1 className="text-4xl sm:text-7xl font-black tracking-tighter uppercase leading-none">
              Welcome, <span className="text-emerald-500">{user?.name.split(' ')[0]}</span>
            </h1>
            <p className="text-gray-500 font-mono text-xs uppercase tracking-widest italic opacity-50">Secure Session Verified_</p>
          </div>
          
          <div className="flex gap-4">
            <button 
              onClick={fetchAnalyses}
              className="p-4 rounded-full border border-white/10 hover:bg-white/5 transition-colors"
              aria-label="Refresh Data"
            >
              <RefreshCw size={18} className={isSyncing ? "animate-spin" : ""} />
            </button>
            <Link
              href="/analyze"
              className="group inline-flex items-center gap-4 px-10 py-4 rounded-full bg-white text-black font-black transition-all hover:bg-emerald-500 hover:text-white active:scale-95 text-sm uppercase tracking-tighter"
            >
              <Upload size={16} />
              Analyze_New
            </Link>
          </div>
        </div>

        {error && (
          <div className="mb-12 p-6 rounded-3xl bg-red-500/5 border border-red-500/20 text-red-500 flex items-start gap-4 font-mono text-xs leading-relaxed">
            <AlertCircle size={18} className="shrink-0" />
            <div className="space-y-2">
              <p className="font-bold uppercase tracking-widest">System_Error</p>
              <p className="opacity-70 lowercase">{error}</p>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-20">
          {[
            { label: "Analyses", value: analyses.length, icon: FileCode, color: "text-white" },
            { label: "Energy (kWh)", value: totalEnergy.toFixed(3), icon: Zap, color: "text-amber-500" },
            { label: "CO2 (gCO2e)", value: totalCO2.toFixed(2), icon: TrendingUp, color: "text-emerald-500" },
            { label: "Avg Score", value: avgScore.toFixed(1), icon: User, color: "text-blue-500" },
          ].map((stat, i) => (
            <div key={i} className="p-8 rounded-[2rem] bg-white/5 border border-white/10 backdrop-blur-3xl group hover:border-white/20 transition-all hover:-translate-y-1">
              <div className="flex items-center gap-3 mb-8">
                <div className={cn("p-2 rounded-xl bg-white/5", stat.color)}>
                  <stat.icon size={14} />
                </div>
                <span className="text-[10px] font-mono text-gray-500 uppercase tracking-[0.2em]">{stat.label}</span>
              </div>
              <p className="text-4xl font-black tracking-tighter italic">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* History Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-[10px] font-mono text-gray-400 uppercase tracking-[0.5em] flex items-center gap-4">
              <span className="w-8 h-px bg-white/20" />
              Recent Logs
            </h3>
            <div className="h-px flex-1 bg-white/5 ml-8" />
          </div>

          <div className="grid gap-4">
            {analyses.map((analysis) => (
              <div
                key={analysis.$id}
                className="group p-8 rounded-[2rem] border border-white/5 bg-white/2 backdrop-blur-3xl hover:bg-white/5 hover:border-white/20 transition-all relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500/0 group-hover:bg-emerald-500 transition-all" />
                
                <div className="flex flex-col lg:flex-row lg:items-center gap-10">
                  <div className="flex items-center gap-8 flex-1">
                    <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <FileCode size={28} className="text-gray-500 group-hover:text-emerald-500 transition-colors" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-2xl font-black truncate tracking-tighter uppercase mb-1">{analysis.fileName}</h3>
                      <div className="flex items-center gap-6 text-[10px] font-mono text-gray-500 uppercase tracking-widest">
                        <span className="px-2 py-0.5 rounded-full border border-white/10">{(analysis.fileSize / 1024).toFixed(1)} KB</span>
                        <span className="flex items-center gap-2">
                          <Clock size={12} />
                          {new Date(analysis.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-12 lg:gap-20 shrink-0">
                    <div className="text-right">
                      <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-2">Energy</p>
                      <p className="text-2xl font-black text-amber-500 font-mono tracking-tighter">{analysis.estimatedEnergy?.toFixed(3)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-2">CO2</p>
                      <p className="text-2xl font-black text-emerald-500 font-mono tracking-tighter">{analysis.estimatedCO2?.toFixed(2)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-2">Efficiency</p>
                      <p className="text-2xl font-black text-white font-mono tracking-tighter">{analysis.score}/10</p>
                    </div>
                  </div>
                </div>

                <div className="mt-10 pt-8 border-t border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="mt-1 p-2 rounded-xl bg-white/5 border border-white/5">
                      <Zap size={12} className="text-emerald-500" />
                    </div>
                    <p className="text-xs text-gray-400 font-medium leading-relaxed max-w-4xl lowercase first-letter:uppercase">
                      <span className="text-white uppercase font-bold mr-3 text-[10px] tracking-widest opacity-50 underline decoration-emerald-500/50 underline-offset-4">Optimization_Strategy:</span> 
                      {analysis.optimization}
                    </p>
                  </div>
                  
                  <button
                    onClick={() => {
                      const url = `${window.location.origin}/api/badge/${analysis.$id}`;
                      const markdown = `![CO2DE Grade](${url})`;
                      navigator.clipboard.writeText(markdown);
                      alert("Markdown badge link copied to clipboard!");
                    }}
                    className="shrink-0 flex items-center gap-3 px-6 py-3 rounded-full border border-white/10 text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-white hover:bg-white/5 transition-all"
                  >
                    <TrendingUp size={12} />
                    Share_Badge
                  </button>
                </div>
              </div>
            ))}
          </div>

          {analyses.length === 0 && !dataLoading && (
            <div className="text-center py-40 rounded-[3rem] border border-dashed border-white/10 bg-white/2 backdrop-blur-sm group">
               <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-10 border border-white/5 group-hover:bg-white/10 transition-colors">
                 <FileCode size={32} className="text-gray-800" />
               </div>
               <h3 className="text-3xl font-black mb-4 tracking-tighter uppercase">Vault Empty</h3>
               <p className="text-gray-500 mb-12 max-w-sm mx-auto font-medium text-sm leading-relaxed">No computational footprints detected. Initiate a code audit to populate the protocol ledger.</p>
               <Link
                 href="/analyze"
                 className="inline-flex items-center gap-4 px-12 py-5 rounded-full bg-white text-black font-black hover:bg-emerald-500 hover:text-white transition-all active:scale-95 uppercase tracking-tighter text-sm"
               >
                 START_FIRST_CAPTURE
                 <Upload size={16} />
               </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
