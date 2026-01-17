"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, Loader2, Sparkles } from "lucide-react";
import { account } from "@/lib/appwrite";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      // Appwrite password recovery
      await account.createRecovery(email, `${window.location.origin}/reset-password`);
      setMessage({ type: 'success', text: "Recovery protocol initiated. Check your inbox for the link." });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || "Protocol failure. Verify your identifier and retry." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-24 px-6 bg-[#0a0a0a]">
      <div className="w-full max-w-lg">
        <div className="text-center mb-16 space-y-4">
          <Link href="/" className="inline-block group">
            <h1 className="text-4xl font-black italic tracking-tighter text-white group-hover:text-emerald-500 transition-colors uppercase">
              CO2DE_
            </h1>
          </Link>
          <div className="space-y-2">
            <h2 className="text-xs font-mono text-gray-500 uppercase tracking-[0.4em]">Auth.Recovery_v1</h2>
            <p className="text-gray-400 font-medium lowercase first-letter:uppercase">Enter your registered identifier to receive an encrypted reset token.</p>
          </div>
        </div>

        <div className="p-12 rounded-[2.5rem] border border-white/10 bg-white/[0.02] backdrop-blur-3xl shadow-3xl">
          <form onSubmit={handleSubmit} className="space-y-8">
            {message && (
              <div className={cn(
                "p-6 rounded-2xl border text-xs font-mono uppercase tracking-widest leading-relaxed",
                message.type === 'success' ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-500" : "bg-red-500/5 border-red-500/20 text-red-500"
              )}>
                {message.type === 'success' ? 'Protocol_Accepted:' : 'Protocol_Failed:'} {message.text}
              </div>
            )}

            <div className="space-y-3">
              <label htmlFor="email" className="block text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500 ml-2">
                Identifier_Email
              </label>
              <div className="relative">
                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-14 pr-6 py-5 rounded-2xl border border-white/5 bg-black/40 text-white placeholder-gray-700 focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all outline-none font-mono text-xs lowercase"
                  placeholder="usr@node.env"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 py-5 rounded-full bg-white hover:bg-emerald-500 text-black hover:text-white font-black transition-all disabled:opacity-50 active:scale-95 text-xs uppercase tracking-tighter"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  REQUEST_TOKEN
                  <Sparkles size={14} />
                </>
              )}
            </button>
          </form>

          <div className="mt-12 text-center">
            <Link 
              href="/login" 
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-white transition-colors"
            >
              <ArrowLeft size={14} />
              Return_to_Access
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// Utility class helper since I can't import cn easily in a new file without checking lib/utils
function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
