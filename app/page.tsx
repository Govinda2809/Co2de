"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ArrowDown } from "lucide-react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
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

  const manifestoText = "IN ORDER TO BUILD, DEVELOP, IMPACT, CHANGE, DESIGN, BUILD THE FUTURE ONE LINE AT A TIME.";
  const words = manifestoText.split(" ");

  return (
    <div ref={containerRef} className="bg-[#0a0a0a] min-h-[200vh] text-white font-sans selection:bg-white selection:text-black">

      {/* BACKGROUND GRAIN/NOISE */}
      <div className="fixed inset-0 bg-noise pointer-events-none opacity-40 z-0 mix-blend-overlay" />

      {/* HERO SECTION */}
      <section className="relative h-screen w-full flex flex-col justify-center items-center px-4 overflow-hidden">

        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img src="/hero-bg.png" alt="Landscape" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/30" /> {/* Overlay */}
        </div>

        {/* Main Typography */}
        <div className="relative z-10 max-w-7xl mx-auto text-center [perspective:1000px] px-2">
          <h1 ref={textRef} className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black leading-[0.9] tracking-tighter uppercase text-white drop-shadow-xl">
            {words.map((word, i) => {
              const isBloody = i >= 8 && i <= 10; // "BUILD THE FUTURE"
              return (
                <span
                  key={i}
                  className={`word inline-block origin-bottom [transform-style:preserve-3d] mx-[0.5vw] ${isBloody ? 'text-red-600' : ''}`}
                >
                  {word}
                </span>
              );
            })}
          </h1>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-12 flex flex-col items-center gap-2 text-white/80 animate-bounce z-20">
          <span className="text-xs font-mono uppercase tracking-widest">Scroll</span>
          <ArrowDown size={16} />
        </div>

      </section>

      {/* PRODUCT FEATURES SECTION */}
      <section className="relative z-10 w-full max-w-6xl mx-auto py-32 px-6">

        <div className="grid md:grid-cols-2 gap-16 mb-24">
          <div className="space-y-6">
            <h2 className="text-sm font-mono text-gray-500 uppercase tracking-widest">01 — Audit</h2>
            <h3 className="text-4xl font-bold text-white">Historical Resource Audit & Reporting</h3>
            <p className="text-lg text-gray-400 leading-relaxed">
              Sustainability efforts require accountability. How can organizations access detailed historical data on their energy and resource consumption for audits and long-term planning?
            </p>
          </div>
          <div className="p-8 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm shadow-xl flex items-center justify-center">
            {/* Visual placeholder or icon */}
            <div className="w-full h-48 bg-white/5 rounded-xl flex items-center justify-center">
              <span className="text-gray-400 font-mono text-xl">Audit_Log_v2.json</span>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-16 mb-24 md:flex-row-reverse">
          <div className="space-y-6 md:order-2">
            <h2 className="text-sm font-mono text-gray-500 uppercase tracking-widest">02 — Profile</h2>
            <h3 className="text-4xl font-bold text-white">Energy Profiling for Functions</h3>
            <p className="text-lg text-gray-400 leading-relaxed">
              Developers often write code without knowing which parts consume excessive energy. How can energy-intensive functions be identified and made visible for optimization?
            </p>
          </div>
          <div className="md:order-1 p-8 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm shadow-xl flex items-center justify-center">
            <div className="w-full h-48 bg-white/5 rounded-xl flex items-center justify-center">
              <span className="text-gray-400 font-mono text-xl">Function_Trace()</span>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-16">
          <div className="space-y-6">
            <h2 className="text-sm font-mono text-gray-500 uppercase tracking-widest">03 — Simulate</h2>
            <h3 className="text-4xl font-bold text-white">Code Execution Carbon Impact Simulator</h3>
            <p className="text-lg text-gray-400 leading-relaxed">
              Software consumes resources differently depending on workload. How can developers estimate the environmental impact of their code and explore alternatives to reduce it?
            </p>
          </div>
          <div className="p-8 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm shadow-xl flex items-center justify-center">
            <div className="w-full h-48 bg-white/5 rounded-xl flex items-center justify-center">
              <span className="text-gray-400 font-mono text-xl">Simulation_Active...</span>
            </div>
          </div>
        </div>

        <div className="h-24" />
      </section>

    </div>
  );
}
