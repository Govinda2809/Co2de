"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FileCode, Clock, TrendingUp, Upload, User, AlertCircle } from "lucide-react";
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
      setError("Appwrite is not fully configured. Please check your environment variables.");
      setIsLoading(false);
      return;
    }

    const fetchAnalyses = async () => {
      try {
        const queries = [Query.orderDesc("createdAt"), Query.limit(50)];
        
        if (user) {
          queries.push(Query.equal("userId", user.$id));
        } else {
          setAnalyses([]);
          setIsLoading(false);
          return;
        }

        const response = await databases.listDocuments(
          DATABASE_ID,
          COLLECTION_ID,
          queries
        );
        
        // Zod Runtime Validation for results
        const validatedDocs = response.documents.map(doc => {
          try {
            return AnalysisItemSchema.parse(doc);
          } catch (e) {
            console.warn("Invalid analysis document skipped:", doc.$id, e);
            return null;
          }
        }).filter(doc => doc !== null) as AnalysisItem[];

        setAnalyses(validatedDocs);
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Failed to load your analysis history.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalyses();

    // Appwrite Realtime Sync
    const unsubscribe = client.subscribe(
      `databases.${DATABASE_ID}.collections.${COLLECTION_ID}.documents`,
      (response) => {
        const payload = response.payload as any;
        if (user && payload.userId !== user.$id) return;

        // Create
        if (response.events.includes("databases.*.collections.*.documents.*.create")) {
          try {
            const validated = AnalysisItemSchema.parse(payload);
            setAnalyses((prev) => [validated, ...prev]);
          } catch (e) {
            console.error("Realtime validation failed:", e);
          }
        }
        
        // Delete
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
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-500 font-medium font-heading">Syncing with Appwrite Realtime...</p>
      </div>
    );
  }

  return (
    <div className="py-12">
      <div className="container mx-auto px-4">
        <div className="mb-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            {user && (
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-emerald-500/20">
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h1 className="text-3xl font-bold font-heading">
                {user ? `Welcome, ${user.name}!` : "Dashboard"}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {user ? "Real-time environmental impact tracking" : "Sign in to track your impact over time"}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {!user && (
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 font-medium transition-colors"
              >
                Sign In
              </Link>
            )}
            <Link
              href="/analyze"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-medium transition-colors shadow-lg shadow-emerald-500/20"
            >
              <Upload className="w-5 h-5" />
              Analyze New File
            </Link>
          </div>
        </div>

        {error && (
          <div className="mb-8 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* User stats cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-10">
          <div className="p-6 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm hover:border-blue-500/30 transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <FileCode className="w-5 h-5 text-blue-500" />
              </div>
              <span className="text-sm text-gray-500 font-medium uppercase tracking-wider">Total Analyses</span>
            </div>
            <p className="text-3xl font-bold">{analyses.length}</p>
          </div>

          <div className="p-6 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm hover:border-amber-500/30 transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <TrendingUp className="w-5 h-5 text-amber-500" />
              </div>
              <span className="text-sm text-gray-500 font-medium uppercase tracking-wider">Total Energy</span>
            </div>
            <p className="text-3xl font-bold">{totalEnergy.toFixed(3)}<span className="text-lg text-gray-500 ml-1 font-normal">kWh</span></p>
          </div>

          <div className="p-6 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm hover:border-emerald-500/30 transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <TrendingUp className="w-5 h-5 text-emerald-500" />
              </div>
              <span className="text-sm text-gray-500 font-medium uppercase tracking-wider">Total CO₂</span>
            </div>
            <p className="text-3xl font-bold text-emerald-500">{totalCO2.toFixed(2)}<span className="text-lg text-emerald-600 ml-1 font-normal">gCO2e</span></p>
          </div>

          <div className="p-6 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm hover:border-purple-500/30 transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <TrendingUp className="w-5 h-5 text-purple-500" />
              </div>
              <span className="text-sm text-gray-500 font-medium uppercase tracking-wider">Avg Score</span>
            </div>
            <p className="text-3xl font-bold">{avgScore.toFixed(1)}<span className="text-lg text-gray-500 ml-1 font-normal">/10</span></p>
          </div>
        </div>

        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold font-heading">Analysis History</h2>
        </div>

        <div className="space-y-4">
          {analyses.map((analysis) => (
            <div
              key={analysis.$id}
              className="p-6 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-emerald-500/50 transition-all hover:shadow-md group"
            >
              <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                <div className="flex items-center gap-4 flex-1">
                  <div className="p-3 rounded-xl bg-gray-100 dark:bg-gray-800 group-hover:bg-emerald-500/10 transition-colors">
                    <FileCode className="w-6 h-6 text-gray-600 dark:text-gray-400 group-hover:text-emerald-500 transition-colors" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold truncate text-lg">{analysis.fileName}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>{(analysis.fileSize / 1024).toFixed(2)} KB</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(analysis.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-6 lg:gap-12 shrink-0">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-amber-500">{analysis.estimatedEnergy?.toFixed(3)}</p>
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-tighter">kWh</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-emerald-500">{analysis.estimatedCO2?.toFixed(2)}</p>
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-tighter">gCO2e</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">{analysis.score}/10</p>
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-tighter">Score</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                <div className="flex items-start gap-3">
                  <div className="mt-1 p-1 rounded-full bg-blue-500/10">
                    <Zap className="w-3 h-3 text-blue-500" />
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    <span className="font-semibold text-gray-900 dark:text-white">Optimization Path:</span> {analysis.optimization}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {!user && !isLoading && (
          <div className="text-center py-20 bg-gray-50 dark:bg-gray-900/50 rounded-3xl border border-dashed border-gray-300 dark:border-gray-700">
             <User className="w-16 h-16 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
             <h3 className="text-xl font-semibold mb-2">Login to see your history</h3>
             <p className="text-gray-500 mb-8 max-w-sm mx-auto">Track your environmental impact trends by signing in to your account.</p>
             <Link
               href="/login"
               className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold transition-all shadow-lg shadow-emerald-500/20"
             >
               Sign In to Continue
             </Link>
          </div>
        )}

        {user && analyses.length === 0 && !error && (
          <div className="text-center py-20 bg-gray-50 dark:bg-gray-900/50 rounded-3xl border border-dashed border-gray-300 dark:border-gray-700">
            <FileCode className="w-16 h-16 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2 font-heading">No analyses yet</h3>
            <p className="text-gray-500 mb-8 max-w-sm mx-auto font-medium">Upload your first code file to begin tracking your sustainability impact.</p>
            <Link
              href="/analyze"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold transition-all shadow-lg shadow-emerald-500/20"
            >
              <Upload className="w-5 h-5" />
              Analyze Code Now
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
