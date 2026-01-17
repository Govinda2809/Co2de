"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ArrowDown, Zap, Globe, Cpu, Sparkles, Terminal, BarChart3, ArrowRight } from "lucide-react";
import Link from "next/link";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLHeadingElement>(null);

  useGSAP(() => {
    // Reveal Text Animation
    const words = textRef.current?.querySelectorAll(".word");
    if (words) {
      gsap.fromTo(words,
        { y: 100, opacity: 0, rotateX: -90 },
        {
          y: 0,
          opacity: 1,
          rotateX: 0,
          stagger: 0.05,
          duration: 1.2,
          ease: "power4.out",
          delay: 0.2
        }
      );
    }

    // Parallax Effect on Scroll
    gsap.to(textRef.current, {
      y: 200,
      ease: "none",
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top top",
        end: "bottom top",
        scrub: true
      }
    });

  }, { scope: containerRef });

  const manifestoText = "Carbon Aware Software Engineering Platform.";
  const words = manifestoText.split(" ");

  return (
    <div ref={containerRef} className="bg-[#0a0a0a] min-h-screen text-white font-sans selection:bg-emerald-500 selection:text-white overflow-hidden">

      {/* BACKGROUND GRAIN/NOISE */}
      <div className="fixed inset-0 bg-noise pointer-events-none opacity-40 z-0 mix-blend-overlay" />
      <div className="fixed inset-0 bg-gradient-to-b from-emerald-500/5 to-transparent pointer-events-none" />

      {/* HERO SECTION */}
      <section className="relative h-screen w-full flex flex-col justify-center items-center px-4 overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[#0a0a0a]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-500/10 blur-[120px] rounded-full animate-pulse" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto text-center px-2">
          <div className="flex items-center justify-center gap-3 mb-12 opacity-50">
             <div className="h-px w-8 bg-white" />
             <span className="text-[10px] font-mono uppercase tracking-[0.5em]">System_Online_v3.2</span>
             <div className="h-px w-8 bg-white" />
          </div>
          <h1 ref={textRef} className="text-5xl sm:text-7xl md:text-8xl lg:text-[9rem] font-black leading-[0.85] tracking-tighter uppercase text-white mb-16 italic">
            {words.map((word, i) => (
              <span key={i} className="word inline-block origin-bottom [transform-style:preserve-3d] mx-[0.5vw]">
                {word === "Platform." ? <span className="text-emerald-500">{word}</span> : word}
              </span>
            ))}
          </h1>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
             <Link href="/analyze" className="group flex items-center gap-4 bg-white text-black px-10 py-5 rounded-full font-black text-sm uppercase tracking-tighter hover:bg-emerald-500 hover:text-white transition-all active:scale-95 shadow-[0_0_40px_rgba(255,255,255,0.1)]">
                Initialize_Audit
                <Sparkles size={16} />
             </Link>
             <Link href="/about" className="group flex items-center gap-4 border border-white/10 px-10 py-5 rounded-full font-black text-sm uppercase tracking-tighter hover:bg-white/5 transition-all text-gray-400 hover:text-white">
                View_Protocol
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
             </Link>
          </div>
        </div>

        <div className="absolute bottom-12 flex flex-col items-center gap-2 text-white/20 animate-bounce z-20">
          <span className="text-[8px] font-mono uppercase tracking-widest">Scroll_Down</span>
          <ArrowDown size={14} />
        </div>
      </section>

      {/* CORE CAPABILITIES */}
      <section className="relative z-10 w-full max-w-7xl mx-auto py-40 px-6">
        <div className="flex items-center gap-4 mb-24">
           <h2 className="text-[10px] font-mono text-emerald-500 uppercase tracking-[0.5em]">Capabilities_Manifest</h2>
           <div className="h-px flex-1 bg-white/5" />
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {[
            {
              id: "01",
              title: "AST_Engine",
              desc: "Deep-layer Abstract Syntax Tree parsing for JS/TS to identify Big O complexity and compute-expensive iteration patterns.",
              icon: Terminal,
              color: "text-emerald-500",
              metrics: ["O(n) Detection", "Memory Mapping"]
            },
            {
              id: "02",
              title: "Grid_Sync",
              desc: "Dynamic carbon-aware calculations synchronized with real-world PUE factors across North America, EU, and Asian power grids.",
              icon: Globe,
              color: "text-blue-500",
              metrics: ["5 Regional Grids", "Live Intensity"]
            },
            {
              id: "03",
              title: "Refactor_Force",
              desc: "AI-driven code transformation engine designed to rewrite logic for maximum energy efficiency without altering functionality.",
              icon: Sparkles,
              color: "text-purple-500",
              metrics: ["1-Click Opt", "Green Copilot"]
            }
          ].map((feat, i) => (
            <div key={i} className="group p-12 rounded-[3rem] bg-white/[0.02] border border-white/5 hover:border-emerald-500/20 hover:bg-white/[0.04] transition-all relative overflow-hidden">
                <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none group-hover:rotate-12 group-hover:scale-110 transition-all duration-700">
                   <feat.icon size={120} className={feat.color} />
                </div>
                <div className="space-y-8 relative z-10">
                   <div className="flex items-center justify-between">
                      <feat.icon size={24} className={feat.color} />
                      <span className="text-[10px] font-mono text-gray-600 font-bold tracking-widest">{feat.id}</span>
                   </div>
                   <h3 className="text-3xl font-black uppercase tracking-tighter italic">{feat.title}</h3>
                   <p className="text-gray-500 leading-relaxed font-medium lowercase first-letter:uppercase">{feat.desc}</p>
                   <div className="flex flex-wrap gap-3 pt-4">
                      {feat.metrics.map((m, j) => (
                        <span key={j} className="px-4 py-1.5 rounded-full bg-white/5 border border-white/5 text-[9px] font-mono text-gray-500 uppercase tracking-widest">
                           {m}
                        </span>
                      ))}
                   </div>
                </div>
            </div>
          ))}
        </div>

        {/* RECENT INNOVATION BANNER */}
        <div className="mt-40 p-16 rounded-[4rem] bg-emerald-500/5 border border-emerald-500/10 flex flex-col lg:flex-row items-center justify-between gap-12 group">
           <div className="space-y-6 max-w-2xl text-center lg:text-left">
              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 font-mono text-[8px] uppercase tracking-widest">
                 <Zap size={10} />
                 New_Update: Real-time Execution Sandbox
              </div>
              <h3 className="text-4xl md:text-5xl font-black tracking-tighter uppercase leading-none italic">
                Simulate <br /> <span className="text-emerald-500 opacity-50">Impact</span>_ In Realtime.
              </h3>
              <p className="text-gray-400 font-medium leading-relaxed max-w-lg">
                Our new virtualized sandbox traces execution sequences with micro-timing precision, offering a literal view of your code&apos;s computational heartbeat.
              </p>
           </div>
           <Link href="/analyze" className="px-12 py-6 rounded-full bg-emerald-500 text-white font-black text-sm uppercase tracking-tighter group-hover:scale-105 transition-all shadow-[0_0_50px_rgba(16,185,129,0.2)]">
              Open_Sandbox
           </Link>
        </div>

      </section>

      {/* FOOTER */}
      <footer className="w-full max-w-7xl mx-auto py-20 px-6 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-8 opacity-40">
         <p className="text-[10px] font-mono uppercase tracking-[0.5em]">CO2DE_SYSTEM_PROTOCOLS © 2026</p>
         <div className="flex gap-8 text-[10px] font-mono uppercase tracking-widest">
            <Link href="/" className="hover:text-white transition-colors">Documentation</Link>
            <Link href="/" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/" className="hover:text-white transition-colors">GitHub</Link>
         </div>
      </footer>

    </div>
  );
}
