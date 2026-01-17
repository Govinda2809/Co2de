"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FileCode, Clock, TrendingUp, Upload, User, AlertCircle, Zap } from "lucide-react";
import { client, databases, DATABASE_ID, COLLECTION_ID } from "@/lib/appwrite";
import { Query } from "appwrite";
import { useAuth } from "@/hooks/use-auth";
import { AnalysisItemSchema, AnalysisItem } from "@/lib/schemas";

export default function DashboardPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [analyses, setAnalyses] = useState<AnalysisItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;

    if (!DATABASE_ID || !COLLECTION_ID) {
      setError("Appwrite configuration missing.");
      setIsLoading(false);
      return;
    }

    const fetchAnalyses = async () => {
      try {
        const queries = [Query.orderDesc("createdAt"), Query.limit(50)];
        if (user) queries.push(Query.equal("userId", user.$id));
        else {
          setAnalyses([]);
          setIsLoading(false);
          return;
        }

        const response = await databases.listDocuments(DATABASE_ID, COLLECTION_ID, queries);
        const validatedDocs = response.documents.map(doc => {
          try {
            return AnalysisItemSchema.parse(doc);
          } catch (e) {
            return null;
          }
        }).filter(doc => doc !== null) as AnalysisItem[];

        setAnalyses(validatedDocs);
      } catch (err) {
        setError("Failed to sync analysis history.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalyses();

    const unsubscribe = client.subscribe(
      `databases.${DATABASE_ID}.collections.${COLLECTION_ID}.documents`,
      (response) => {
        const payload = response.payload as any;
        if (user && payload.userId !== user.$id) return;

        if (response.events.includes("databases.*.collections.*.documents.*.create")) {
          try {
            const validated = AnalysisItemSchema.parse(payload);
            setAnalyses((prev) => [validated, ...prev]);
          } catch (e) {}
        }
        if (response.events.includes("databases.*.collections.*.documents.*.delete")) {
          setAnalyses((prev) => prev.filter((item) => item.$id !== payload.$id));
        }
      }
    );

    return () => unsubscribe();
  }, [user, authLoading]);

  const totalEnergy = analyses.reduce((sum, a) => sum + (a.estimatedEnergy || 0), 0);
  const totalCO2 = analyses.reduce((sum, a) => sum + (a.estimatedCO2 || 0), 0);
  const avgScore = analyses.length > 0 
    ? analyses.reduce((sum, a) => sum + (a.score || 0), 0) / analyses.length 
    : 0;

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center space-y-6">
        <div className="w-16 h-16 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        <p className="text-gray-500 font-mono text-xs uppercase tracking-[0.4em]">Establishing secure link...</p>
      </div>
    );
  }

  return (
    <div className="py-24 bg-[#0a0a0a] min-h-screen text-white">
      <div className="container mx-auto px-4 max-w-7xl">
        
        {/* Header Section */}
        <div className="mb-16 flex flex-col md:flex-row md:items-end md:justify-between gap-8">
          <div className="space-y-4">
            <h2 className="text-xs font-mono text-gray-500 uppercase tracking-widest">User Dashboard</h2>
            <h1 className="text-4xl sm:text-6xl font-black tracking-tighter uppercase leading-[0.9]">
              {user ? `Welcome, ${user.name.split(' ')[0]}` : "Protocol: History"}
            </h1>
            <p className="text-gray-500 font-mono text-sm">REAL-TIME DATA STREAM ACTIVE</p>
          </div>
          
          <Link
            href="/analyze"
            className="group inline-flex items-center gap-4 px-8 py-4 rounded-full bg-white text-black font-bold transition-all hover:bg-gray-200 active:scale-95"
          >
            <Upload size={18} />
            NEW_ANALYSIS
          </Link>
        </div>

        {error && (
          <div className="mb-12 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center gap-3 font-mono text-xs uppercase tracking-wider">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {[
            { label: "Analyses", value: analyses.length, icon: FileCode, color: "text-white" },
            { label: "Energy (kWh)", value: totalEnergy.toFixed(3), icon: Zap, color: "text-amber-500" },
            { label: "CO2 (gCO2e)", value: totalCO2.toFixed(2), icon: TrendingUp, color: "text-emerald-500" },
            { label: "Avg Score", value: avgScore.toFixed(1), icon: User, color: "text-blue-500" },
          ].map((stat, i) => (
            <div key={i} className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm group hover:bg-white/10 transition-colors">
              <div className="flex items-center gap-3 mb-6">
                <stat.icon size={16} className={stat.color} />
                <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">{stat.label}</span>
              </div>
              <p className="text-3xl font-black tracking-tighter">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* History Listing */}
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-sm font-mono text-gray-500 uppercase tracking-widest">Recent Logs</h3>
            <div className="h-px flex-1 bg-white/10 mx-6" />
          </div>

          {analyses.map((analysis) => (
            <div
              key={analysis.$id}
              className="group p-8 rounded-3xl border border-white/5 bg-white/2 backdrop-blur-sm hover:bg-white/5 hover:border-white/20 transition-all"
            >
              <div className="flex flex-col lg:flex-row lg:items-center gap-8">
                <div className="flex items-center gap-6 flex-1">
                  <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                    <FileCode size={24} className="text-gray-400 group-hover:text-white transition-colors" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xl font-bold truncate tracking-tight">{analysis.fileName}</h3>
                    <div className="flex items-center gap-4 text-xs font-mono text-gray-500 mt-1">
                      <span>{(analysis.fileSize / 1024).toFixed(1)} KB</span>
                      <span className="flex items-center gap-2">
                        <Clock size={12} />
                        {new Date(analysis.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-12 shrink-0">
                  <div className="text-right">
                    <p className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-1">Energy</p>
                    <p className="text-xl font-black text-amber-500 font-mono">{analysis.estimatedEnergy?.toFixed(3)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-1">CO2</p>
                    <p className="text-xl font-black text-emerald-500 font-mono">{analysis.estimatedCO2?.toFixed(2)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-1">Score</p>
                    <p className="text-xl font-black text-white font-mono">{analysis.score}/10</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-white/5">
                <div className="flex items-start gap-4">
                  <div className="mt-1 p-1.5 rounded-full bg-white/10">
                    <Zap size={10} className="text-white" />
                  </div>
                  <p className="text-xs text-gray-400 font-medium leading-relaxed max-w-3xl lowercase">
                    <span className="text-white uppercase font-bold mr-2 text-[10px] tracking-widest">OP_PATH:</span> {analysis.optimization}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {analyses.length === 0 && !authLoading && !isLoading && (
            <div className="text-center py-32 rounded-[2rem] border border-dashed border-white/10 bg-white/2">
               <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-8">
                 <FileCode size={32} className="text-gray-700" />
               </div>
               <h3 className="text-2xl font-bold mb-4 tracking-tight">No data detected in stream</h3>
               <p className="text-gray-500 mb-10 max-w-sm mx-auto font-medium text-sm">Upload a source file to begin calculating your environmental impact signature.</p>
               <Link
                 href="/analyze"
                 className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-white text-black font-bold hover:bg-gray-200 transition-all active:scale-95"
               >
                 START_CAPTURE
               </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
