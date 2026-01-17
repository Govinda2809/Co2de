"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { Mail, Lock, User, Eye, EyeOff, Loader2, ArrowLeft, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

export default function SignupPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { signup } = useAuth();
  const router = useRouter();
  const containerRef = useRef(null);

  useGSAP(() => {
    const tl = gsap.timeline();

    tl.from(".signup-card", {
      y: 20,
      opacity: 0,
      duration: 0.8,
      ease: "power3.out"
    })
      .from(".form-item", {
        y: 10,
        opacity: 0,
        duration: 0.5,
        stagger: 0.1,
        ease: "power2.out"
      }, "-=0.4");
  }, { scope: containerRef });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setIsLoading(true);
    try {
      await signup(formData.email, formData.password, formData.name);
    } catch (err: any) {
      setError(err.message || "Registration failed.");
      setIsLoading(false);
    }
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4 selection:bg-white/20 selection:text-white">
      <div className="signup-card w-full max-w-[1200px] bg-black border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[700px]">

        {/* LEFT: IMAGE SECTION */}
        <div className="relative w-full md:w-1/2 min-h-[300px] md:min-h-full">
          <img
            src="/login-bg.png"
            alt="CO₂ Impact"
            className="absolute inset-0 w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-black/40" /> {/* Darker overlay */}

          <div className="absolute top-8 left-8">
            <Link href="/" className="inline-flex items-center gap-2 text-white font-medium text-lg tracking-wide hover:opacity-80 transition-opacity">
              CO₂DE
            </Link>
          </div>

          <div className="absolute top-8 right-8">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-4 py-2 bg-black/20 backdrop-blur-md border border-white/10 rounded-full text-white text-sm hover:bg-white/10 transition-colors"
            >
              Back to website <ArrowLeft size={16} className="rotate-180" />
            </Link>
          </div>

          <div className="absolute bottom-16 left-12 text-white space-y-4 max-w-md">
            <h2 className="text-4xl font-medium leading-tight">
              Join the <br />Green Revolution
            </h2>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-white/80 text-sm">
                <CheckCircle2 size={14} className="text-white" />
                <span>Real-time Carbon Audits</span>
              </div>
              <div className="flex items-center gap-2 text-white/80 text-sm">
                <CheckCircle2 size={14} className="text-white" />
                <span>AI-Powered Refactoring</span>
              </div>
              <div className="flex items-center gap-2 text-white/80 text-sm">
                <CheckCircle2 size={14} className="text-white" />
                <span>Global Grid Synchronization</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: FORM SECTION */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-[#0a0a0a] text-white">
          <div className="max-w-md mx-auto w-full space-y-8">

            <div className="space-y-2 form-item">
              <h1 className="text-4xl font-medium">Create account</h1>
              <p className="text-gray-400">
                Already have an account? <Link href="/login" className="text-white hover:text-gray-300 transition-colors underline decoration-white/30 underline-offset-4">Log in</Link>
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 form-item">
              {error && (
                <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm animate-in fade-in slide-in-from-top-2">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="bg-white/5 rounded-xl px-4 py-3 border border-white/5 focus-within:border-white/20 transition-colors">
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-transparent text-white placeholder-gray-500 outline-none text-sm"
                      placeholder="Full Name"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="bg-white/5 rounded-xl px-4 py-3 border border-white/5 focus-within:border-white/20 transition-colors">
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-transparent text-white placeholder-gray-500 outline-none text-sm"
                      placeholder="Email"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2 relative">
                  <div className="bg-white/5 rounded-xl px-4 py-3 border border-white/5 focus-within:border-white/20 transition-colors flex items-center justify-between">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full bg-transparent text-white placeholder-gray-500 outline-none text-sm"
                      placeholder="Password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-gray-500 hover:text-gray-300"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2 relative">
                  <div className="bg-white/5 rounded-xl px-4 py-3 border border-white/5 focus-within:border-white/20 transition-colors">
                    <input
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className="w-full bg-transparent text-white placeholder-gray-500 outline-none text-sm"
                      placeholder="Confirm Password"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 rounded-xl bg-white hover:bg-gray-200 text-black font-medium transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Sign Up"}
                </button>
              </div>
            </form>

            <div className="relative py-4 form-item">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-[#0a0a0a] text-gray-500">Or register with</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 form-item">
              <button className="flex items-center justify-center gap-2 py-3 rounded-xl border border-white/10 hover:bg-white/5 transition-colors bg-white/2">
                <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true"><path d="M12.0003 20.45c4.6667 0 8.45-3.7833 8.45-8.45 0-.4167-.0334-.8167-.1-1.2h-8.35v2.4h4.7833c-.2 1.0833-1.0833 2-2.3 2.8l-.0232.1554 3.3283 2.5768.2306.0229c2.0667-1.9 3.25-4.7 3.25-7.9551 0-.825-.1333-1.6167-.3667-2.3667H12.0003v-2.4h8.8834c.15.7833.2333 1.5833.2333 2.4 0 .8167-.0833 1.6167-.2333 2.4H12.0003v4.6167z" fill="#4285F4" /><path d="M2.6835 14.2833l3.6167-2.8333c1.0333 3.0333 3.8833 5.2 7.2166 5.2 1.6334 0 3.1667-.5833 4.35-1.55l3.5834 2.7667C19.3335 19.95 15.9335 21.65 12.0002 21.65c-4.9167 0-9.1-3.2333-10.7667-7.3667l1.45-1.1z" fill="#34A853" /><path d="M13.5169 5.2833l3.6 2.8c-1.1833-1-2.7167-1.5833-4.35-1.5833-3.3334 0-6.1834 2.1667-7.2167 5.2l-3.6-2.8167C4.1669 4.3 8.3502 1.0833 13.5169 1.0833z" fill="#EA4335" /><path d="M12.0003 4.8833c1.8334 0 3.5167.65 4.85 1.7167l3.6-2.8C18.4336 2.05 15.4336.4833 12.0003.4833 6.8336.4833 2.4503 3.4833.4836 7.85l3.5834 2.8c1.0333-2.9833 3.8666-5.1167 7.9333-5.7667z" fill="#FBBC05" /></svg>
                <span className="text-sm">Google</span>
              </button>
              <button className="flex items-center justify-center gap-2 py-3 rounded-xl border border-white/10 hover:bg-white/5 transition-colors bg-white/2">
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden="true"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.78.85.04 2.09-.96 3.84-.75 1.03.11 2.07.59 2.08.61-.06.04-1.96 1.15-1.96 3.51 0 2.87 2.21 4.02 2.37 4.12-.17.52-.4 1.15-.76 1.69-.9 1.33-1.78 2.07-2.61 3h-.04zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.16 2.29-2.2 4.1-3.74 4.25z" /></svg>
                <span className="text-sm">Apple</span>
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
