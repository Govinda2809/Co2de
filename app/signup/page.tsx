"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Lock, User, ArrowRight, Loader2, Zap, ShieldCheck, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { signup } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (formData.password !== formData.confirmPassword) {
      setError("Secret verification mismatch.");
      return;
    }
    setIsLoading(true);
    try {
      await signup(formData.email, formData.password, formData.name);
    } catch (err: any) {
      setError(err.message || "Identity synthesis failed.");
      setIsLoading(false);
    }
  };

  const benefits = [
    "High-Fidelity Carbon Audits",
    "AST-Layer Complexity Mapping",
    "Dual-Router AI Optimizations",
    "Protocol Ledger Persistence",
  ];

  return (
    <div className="min-h-screen flex items-center justify-center py-20 px-4 bg-[#0a0a0a] overflow-hidden selection:bg-emerald-500/30">
      <div className="fixed inset-0 bg-noise pointer-events-none opacity-20 z-0" />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-emerald-500/5 blur-[150px] rounded-full pointer-events-none" />

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
          <h1 className="text-4xl font-black tracking-tighter text-white uppercase italic">Synthesize_Identity_</h1>
          <p className="text-gray-500 font-mono text-[10px] uppercase tracking-[0.4em] opacity-50">
            Official Protocol Enrollment
          </p>
        </div>

        <div className="p-12 rounded-[3.5rem] border border-white/5 bg-white/[0.01] backdrop-blur-3xl relative overflow-hidden group">
          <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
            {error && (
              <div className="p-6 rounded-2xl bg-red-500/5 border border-red-500/10 text-red-500 font-mono text-[10px] text-center uppercase tracking-widest">
                Protocol_Halt: {error}
              </div>
            )}

            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest pl-2">Subject_Name</label>
                <div className="relative group">
                  <User className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-700 group-focus-within:text-emerald-500 transition-colors" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full pl-14 pr-6 py-5 rounded-3xl border border-white/5 bg-black text-white focus:border-emerald-500/30 transition-all outline-none text-sm font-medium"
                    placeholder="Full Stack Operator"
                    required
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest pl-2">Identity_Key</label>
                <div className="relative group">
                  <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-700 group-focus-within:text-emerald-500 transition-colors" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-14 pr-6 py-5 rounded-3xl border border-white/5 bg-black text-white focus:border-emerald-500/30 transition-all outline-none text-sm font-medium"
                    placeholder="operator@co2de.dev"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest pl-2">Secret</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-6 py-5 rounded-3xl border border-white/5 bg-black text-white focus:border-emerald-500/30 transition-all outline-none text-sm font-medium"
                    placeholder="••••••••"
                    required
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest pl-2">Verify</label>
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="w-full px-6 py-5 rounded-3xl border border-white/5 bg-black text-white focus:border-emerald-500/30 transition-all outline-none text-sm font-medium"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-4 py-6 rounded-full bg-white text-black font-black uppercase tracking-tighter hover:bg-emerald-500 hover:text-white transition-all active:scale-95 text-sm"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  INITIALIZE_IDENTITY
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-12 p-8 rounded-[2rem] bg-emerald-500/5 border border-emerald-500/10 space-y-4">
             <p className="text-[10px] font-mono font-bold text-emerald-500 uppercase tracking-widest">Protocol_Privileges:</p>
             <div className="grid grid-cols-1 gap-3">
                {benefits.map((b) => (
                  <div key={b} className="flex items-center gap-3 text-[10px] text-gray-500 font-medium lowercase first-letter:uppercase">
                    <CheckCircle2 size={12} className="text-emerald-500" />
                    {b}
                  </div>
                ))}
             </div>
          </div>

          <p className="mt-10 text-center text-[10px] font-mono text-gray-600 uppercase tracking-widest">
            Existing Identity?{" "}
            <Link href="/login" className="text-white hover:underline">
              Sign_In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
