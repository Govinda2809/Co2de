"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Lock, ArrowRight, Loader2, ShieldCheck, Zap } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || "Credential verification failed.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-20 px-4 bg-[#0a0a0a] overflow-hidden selection:bg-emerald-500/30">
      {/* Background Grain */}
      <div className="fixed inset-0 bg-noise pointer-events-none opacity-20 z-0" />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-lg relative z-10">
        <div className="text-center mb-16 space-y-4">
          <Link href="/" className="inline-flex items-center gap-3 mb-8 group">
             <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 group-hover:rotate-12 transition-transform">
                <Zap size={24} className="text-emerald-500" />
             </div>
             <span className="text-4xl font-black tracking-tighter text-white uppercase italic">
               CO2DE_
             </span>
          </Link>
          <h1 className="text-4xl font-black tracking-tighter text-white uppercase italic">Establish_Session_</h1>
          <p className="text-gray-500 font-mono text-[10px] uppercase tracking-[0.4em] opacity-50">
            Secure Gateway Access Required
          </p>
        </div>

        <div className="p-12 rounded-[3.5rem] border border-white/5 bg-white/[0.01] backdrop-blur-3xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-12 opacity-[0.02] pointer-events-none">
             <ShieldCheck size={200} />
          </div>

          <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
            {error && (
              <div className="p-6 rounded-2xl bg-red-500/5 border border-red-500/10 text-red-500 font-mono text-[10px] text-center uppercase tracking-widest leading-relaxed">
                System_Error: {error}
              </div>
            )}

            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest pl-2">
                  Identity_Key (Email)
                </label>
                <div className="relative group">
                  <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-700 group-focus-within:text-emerald-500 transition-colors" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-14 pr-6 py-5 rounded-3xl border border-white/5 bg-black text-white placeholder-gray-800 focus:border-emerald-500/30 transition-all outline-none text-sm font-medium"
                    placeholder="protocol_user@co2de.dev"
                    required
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between px-2">
                  <label className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest">
                    Auth_Secret (Password)
                  </label>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-700 group-focus-within:text-emerald-500 transition-colors" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-14 pr-6 py-5 rounded-3xl border border-white/5 bg-black text-white placeholder-gray-800 focus:border-emerald-500/30 transition-all outline-none text-sm font-medium"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-4 py-6 rounded-full bg-white text-black font-black uppercase tracking-tighter hover:bg-emerald-500 hover:text-white transition-all active:scale-95 text-sm shadow-[0_0_40px_rgba(255,255,255,0.05)]"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  INITIALIZE_SESSION
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-12 pt-10 border-t border-white/5">
             <div className="flex flex-col sm:flex-row gap-6 items-center justify-between">
                <Link href="/signup" className="text-[10px] font-mono text-gray-600 uppercase tracking-widest hover:text-white transition-colors">
                   Create_New_Identity
                </Link>
                <div className="flex gap-8">
                   <button className="text-[10px] font-mono text-gray-600 uppercase tracking-widest hover:text-white transition-colors">GitHub</button>
                   <button className="text-[10px] font-mono text-gray-600 uppercase tracking-widest hover:text-white transition-colors">Cloud</button>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
