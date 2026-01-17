"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ArrowRight, Terminal, Globe, Sparkles } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const tl = gsap.timeline();

    tl.from(".hero-text", {
      y: 100,
      opacity: 0,
      duration: 1.5,
      ease: "power4.out",
      stagger: 0.2
    })
      .from(".hero-sub", {
        y: 20,
        opacity: 0,
        duration: 1,
        ease: "power2.out"
      }, "-=1")
      .from(".hero-btn", {
        y: 20,
        opacity: 0,
        duration: 1,
        ease: "power2.out",
        stagger: 0.1
      }, "-=0.8");

    gsap.utils.toArray('.feature-card').forEach((card: any, i) => {
      gsap.from(card, {
        scrollTrigger: {
          trigger: card,
          start: "top 85%",
        },
        y: 50,
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
      <section ref={heroRef} className="relative h-screen w-full flex items-center justify-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="/home-bg.png"
            alt="Background"
            className="w-full h-full object-cover opacity-60 scale-105 animate-slow-zoom"
          />
          <div className="absolute inset-0 bg-linear-to-b from-black/30 via-black/50 to-[#0a0a0a]"></div>
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center space-y-8">
          <div className="overflow-hidden">
            <h1 className="hero-text text-6xl md:text-8xl lg:text-9xl font-semibold tracking-tight text-white/90 leading-[0.9]">
              Code with
            </h1>
          </div>
          <div className="overflow-hidden">
            <h1 className="hero-text text-6xl md:text-8xl lg:text-9xl font-semibold tracking-tight text-white/40 leading-[0.9] italic">
              Conscience
            </h1>
          </div>

          <p className="hero-sub text-lg md:text-xl text-gray-400 font-light max-w-xl mx-auto leading-relaxed pt-6">
            A precise instrument for measuring the environmental weight of your software architecture.
          </p>

          <div className="hero-btn pt-8 flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link href="/analyze" className="group flex items-center gap-2 bg-white text-black px-8 py-4 rounded-full text-sm font-medium hover:bg-white/90 transition-all hover:scale-105 active:scale-95 duration-300">
              Start Audit <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/about" className="text-white/60 hover:text-white px-8 py-4 rounded-full text-sm font-medium transition-colors border border-white/10 hover:border-white/30 hover:bg-white/5">
              Methodology
            </Link>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 hero-btn animate-bounce opacity-50">
          <div className="w-px h-16 bg-linear-to-b from-transparent via-white/50 to-transparent"></div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="relative z-10 w-full max-w-7xl mx-auto py-32 px-6">
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              title: "AST Parsing",
              desc: "Deep analysis of abstract syntax trees to identify complexity hotspots.",
              icon: Terminal
            },
            {
              title: "Grid Sync",
              desc: "Real-time synchronization with global power grid carbon intensity.",
              icon: Globe
            },
            {
              title: "Auto Refactor",
              desc: "AI-driven logic optimization to reduce computational cycles.",
              icon: Sparkles
            }
          ].map((item, i) => (
            <div key={i} className="feature-card p-8 rounded-3xl bg-white/2 border border-white/5 hover:border-white/10 hover:bg-white/4 transition-all duration-500 group">
              <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mb-6 text-white/60 group-hover:text-white group-hover:scale-110 transition-all duration-500">
                <item.icon size={20} strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-medium text-white mb-3">{item.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed font-light">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="relative z-10 w-full max-w-5xl mx-auto py-32 px-6 text-center">
        <div className="feature-card space-y-8 p-12 md:p-24 rounded-[3rem] bg-linear-to-b from-white/3 to-transparent border border-white/5 backdrop-blur-sm overflow-hidden relative">
          <div className="absolute top-0 inset-x-0 h-px bg-linear-to-r from-transparent via-white/20 to-transparent" />

          <h2 className="text-4xl md:text-6xl font-semibold tracking-tight text-white mb-6">
            Refine your impact.
          </h2>
          <p className="text-xl text-gray-400 font-light max-w-2xl mx-auto">
            Join the new standard of sustainable software engineering. Measure, optimize, and deploy with confidence.
          </p>
          <div className="pt-8">
            <Link href="/analyze" className="inline-flex items-center gap-2 text-white hover:text-white/80 border-b border-white pb-0.5 transition-colors">
              Launch Analysis Platform <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      <footer className="w-full py-12 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center text-xs text-gray-600 font-light">
          <p>CO2DE Systems © 2026</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">Github</a>
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
