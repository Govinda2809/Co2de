"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const stats = [
  { value: "2-4%", label: "Global Tech Emissions" },
  { value: "1.1", label: "Target PUE" },
  { value: "1.6B", label: "Tons CO₂ from Code" },
];

const principles = [
  {
    title: "AST Complexity",
    description: "Deep-layer Abstract Syntax Tree parsing identifying Big O complexity patterns.",
  },
  {
    title: "Grid Sync",
    description: "Carbon-aware calculations synchronized with live regional power intensity.",
  },
  {
    title: "Refactor Force",
    description: "AI-driven transformation engine rewriting logic for maximum efficiency.",
  },
];

export default function AboutPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const tl = gsap.timeline();

    tl.from(".hero-text", {
      y: 50,
      opacity: 0,
      duration: 1.2,
      stagger: 0.2,
      ease: "power3.out"
    });

    gsap.utils.toArray('.anim-card').forEach((card: any, i) => {
      gsap.from(card, {
        scrollTrigger: {
          trigger: card,
          start: "top 90%",
        },
        y: 40,
        opacity: 0,
        duration: 1,
        delay: i * 0.1,
        ease: "power3.out"
      });
    });

  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="bg-[#0a0a0a] min-h-screen text-white font-sans selection:bg-white/20 selection:text-white">

      {/* HERO SECTION */}
      <section className="relative h-[80vh] w-full flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="/about-bg.jpg"
            alt="Methodology Background"
            className="w-full h-full object-cover opacity-50 scale-105 animate-slow-zoom"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a]/30 via-[#0a0a0a]/60 to-[#0a0a0a]"></div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center space-y-8">
          <span className="hero-text inline-block py-1 px-3 border border-white/20 rounded-full text-xs font-light tracking-widest uppercase text-white/80 bg-black/20 backdrop-blur-md">
            Methodology v3.2
          </span>
          <h1 className="hero-text text-5xl md:text-7xl lg:text-8xl font-medium tracking-tight leading-tight">
            The code is the <br /> <span className="italic text-white/50">footprint.</span>
          </h1>
          <p className="hero-text text-lg text-gray-300 font-light max-w-2xl mx-auto leading-relaxed">
            Efficiency is no longer just a performance metric—it is an environmental necessity.
          </p>
        </div>
      </section>

      {/* STATS STRIP */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 mb-32">
        <div className="grid md:grid-cols-3 gap-8 border-y border-white/5 py-16">
          {stats.map((stat, i) => (
            <div key={i} className="anim-card text-center space-y-2 group cursor-default">
              <p className="text-4xl md:text-5xl font-light tracking-tight group-hover:scale-110 transition-transform duration-500 ease-out">{stat.value}</p>
              <p className="text-sm font-medium text-gray-500 uppercase tracking-widest">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CORE ARCHITECTURE */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 mb-32 space-y-16">
        <div className="anim-card flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-8">
          <h2 className="text-3xl font-medium">Core Architecture</h2>
          <p className="text-gray-400 max-w-md text-sm leading-relaxed">
            Our engine parses computational physics—how data moves, cycles consumed, and hardware utilization.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {principles.map((principle, i) => (
            <div key={i} className="anim-card group relative p-10 rounded-[2rem] bg-white/[0.02] border border-white/5 overflow-hidden hover:bg-white/[0.04] transition-colors duration-500">
              <div className="mb-12">
                <span className="text-6xl font-light text-white/5 group-hover:text-white/10 transition-colors">0{i + 1}</span>
              </div>
              <div className="space-y-4 relative z-10">
                <h3 className="text-xl font-medium text-white">{principle.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed font-light">
                  {principle.description}
                </p>
              </div>
              <div className="absolute bottom-6 right-6 w-8 h-8 rounded-full border border-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 group-hover:-translate-y-2 group-hover:-translate-x-2">
                <ArrowRight size={14} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* DETAILED METHODOLOGY */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 mb-32">
        <div className="anim-card p-12 md:p-20 rounded-[3rem] bg-gradient-to-b from-white/[0.03] to-transparent border border-white/5 backdrop-blur-xl relative overflow-hidden">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <h2 className="text-3xl md:text-4xl font-medium leading-tight">
                High Fidelity <br /> <span className="text-white/40 italic">Calculations</span>
              </h2>
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                  <code className="text-xs text-gray-300 font-mono">Intensity = [Baseline * Complexity * PUE]</code>
                </div>
              </div>
            </div>
            <div className="space-y-6 text-gray-400 font-light leading-relaxed">
              <p>
                We don't just count lines of code. We analyze the <span className="text-white font-normal">computational energy</span> required to execute your logic.
              </p>
              <p>
                By integrating live grid intensity and regional hardware profiles, we provide a mathematically defensible estimate of your digital emissions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 max-w-3xl mx-auto px-6 pb-32 text-center">
        <div className="anim-card space-y-8">
          <h2 className="text-4xl md:text-5xl font-medium tracking-tight">
            Ready to audit?
          </h2>
          <p className="text-gray-400 font-light">
            Start measuring your impact. Every millisecond counts.
          </p>
          <div className="pt-4">
            <Link
              href="/analyze"
              className="inline-flex items-center gap-3 bg-white text-black px-10 py-5 rounded-full text-sm font-medium hover:scale-105 transition-transform duration-300"
            >
              Initialize Audit <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
