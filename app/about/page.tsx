import { Metadata } from "next";
import { Zap, Globe, Code, ArrowRight, Terminal, Cpu, Sparkles } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Protocol — About",
  description: "Architecture and methodology of the CO2DE carbon engineering platform.",
};

const stats = [
  { value: "2-4%", label: "global emissons from tech" },
  { value: "PUE 1.1", label: "target infrastructure" },
  { value: "1.6B", label: "tons of CO₂ from code" },
];

const principles = [
  {
    icon: Terminal,
    title: "AST_COMPLEXITY",
    description: "Deep-layer Abstract Syntax Tree parsing for JS/TS to identify Big O complexity and compute-expensive iteration patterns.",
  },
  {
    icon: Globe,
    title: "GRID_SYNCHRONIZATION",
    description: "Dynamic carbon-aware calculations synchronized with real-world PUE factors and live grid intensity across global regions.",
  },
  {
    icon: Sparkles,
    title: "REFACTOR_FORCE",
    description: "AI-driven code transformation engine designed to rewrite logic for maximum energy efficiency without altering functionality.",
  },
];

export default function AboutPage() {
  return (
    <div className="bg-[#0a0a0a] min-h-screen text-white pt-32 pb-40 px-4 selection:bg-emerald-500 selection:text-white">
      <div className="container mx-auto max-w-6xl">
        
        {/* HERO SECTION */}
        <div className="mb-40">
          <div className="flex items-center gap-4 mb-12">
            <div className="h-px w-12 bg-emerald-500" />
            <span className="text-[10px] font-mono tracking-[0.5em] uppercase text-emerald-500">Methodology v3.2</span>
          </div>
          <h1 className="text-6xl sm:text-8xl md:text-[9rem] font-black tracking-tighter uppercase leading-[0.8] mb-16 italic">
            The Code <br /> Is The <br /> <span className="text-emerald-500">Footprint</span>_
          </h1>
          <p className="text-xl sm:text-2xl text-gray-500 font-medium leading-relaxed max-w-3xl lowercase first-letter:uppercase">
            In an era of rapid digital expansion, we believe efficiency is no longer just a performance metric—it is an environmental necessity.
          </p>
        </div>

        {/* STATS STRIP */}
        <div className="grid md:grid-cols-3 gap-12 mb-40 py-16 border-y border-white/5 bg-white/[0.01]">
          {stats.map((stat, i) => (
            <div key={i} className="space-y-4 text-center">
              <p className="text-6xl font-black tracking-tighter text-white italic">{stat.value}</p>
              <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-gray-600">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* ARCHITECTURE SECTION */}
        <div className="mb-40 space-y-24">
           <div className="flex items-center gap-8">
              <h2 className="text-sm font-mono text-gray-400 uppercase tracking-[0.4em] whitespace-nowrap">Core_Architecture</h2>
              <div className="h-px flex-1 bg-white/5" />
           </div>

           <div className="grid md:grid-cols-3 gap-16">
              {principles.map((principle, i) => (
                <div key={i} className="group space-y-10">
                  <div className="w-16 h-16 rounded-[2rem] bg-white/[0.03] flex items-center justify-center border border-white/10 group-hover:bg-emerald-500 group-hover:border-emerald-500 transition-all group-hover:rotate-12 group-hover:shadow-[0_0_40px_rgba(16,185,129,0.2)]">
                    <principle.icon size={28} className="text-gray-500 group-hover:text-white transition-colors" />
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-2xl font-black tracking-tighter uppercase italic">{principle.title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed font-medium">
                      {principle.description}
                    </p>
                  </div>
                </div>
              ))}
           </div>
        </div>

        {/* DETAILED METHODOLOGY */}
        <div className="mb-40 p-12 md:p-24 rounded-[4rem] bg-white/[0.02] border border-white/5 relative overflow-hidden">
           <div className="absolute top-0 right-0 p-24 opacity-[0.02] pointer-events-none group-hover:scale-110 transition-transform">
              <Cpu size={400} />
           </div>
           
           <div className="relative z-10 grid lg:grid-cols-2 gap-20">
              <div className="space-y-12">
                 <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic leading-none">
                    High_Fidelity <br /> <span className="text-emerald-500">Calculations</span>.
                 </h2>
                 <div className="space-y-8 font-mono text-[10px] text-gray-500 uppercase tracking-widest">
                    <div className="flex items-start gap-4 p-6 rounded-2xl bg-black/50 border border-white/5">
                       <span className="text-emerald-500 font-bold">01/</span>
                       <span>Intensity = [Baseline * Complexity * PUE * Hardware_Factor]</span>
                    </div>
                    <div className="flex items-start gap-4 p-6 rounded-2xl bg-black/50 border border-white/5">
                       <span className="text-emerald-500 font-bold">02/</span>
                       <span>Emissions = (Intensity * Grid_gCO2e) / Transmission_Efficiency</span>
                    </div>
                 </div>
              </div>
              <div className="space-y-8">
                 <p className="text-gray-400 leading-relaxed">
                    Our calculation engine doesn&apos;t just count lines of code. It looks at the <span className="text-white">computational physics</span> of software—how data moves, how many cycles it takes to sort an array, and what hardware class it finally runs on.
                 </p>
                 <p className="text-gray-400 leading-relaxed">
                    By integrating live grid intensity and regional PUE data, we provide a mathematically defensible estimate of your digital emissions.
                 </p>
              </div>
           </div>
        </div>

        {/* CALL TO ACTION */}
        <div className="p-16 md:p-32 rounded-[5rem] bg-emerald-500 text-black relative overflow-hidden group">
          <div className="relative z-10 flex flex-col items-center text-center">
            <h2 className="text-5xl md:text-[7rem] font-black tracking-tighter uppercase leading-[0.85] mb-12 italic">
               Commit <br /> To The <br /> Future_
            </h2>
            <p className="text-lg font-bold max-w-md mb-16 opacity-80 uppercase tracking-tighter">
              Start measuring your impact. Every millisecond of compute saved counts toward a sustainable future.
            </p>
            <Link 
              href="/analyze"
              className="group/btn flex items-center gap-6 bg-black text-white px-12 py-6 rounded-full font-black transition-all hover:px-16 active:scale-95 uppercase tracking-tighter text-sm"
            >
              INITIALIZE_AUDIT
              <ArrowRight size={20} className="group-hover/btn:translate-x-2 transition-transform" />
            </Link>
          </div>

          <div className="absolute top-0 right-0 p-24 opacity-10 group-hover:rotate-12 transition-all pointer-events-none">
            <Globe size={500} />
          </div>
        </div>

      </div>
    </div>
  );
}
