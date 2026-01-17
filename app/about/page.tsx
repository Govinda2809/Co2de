import { Metadata } from "next";
import { Zap, Globe, Code, ArrowRight } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Protocol — About",
  description: "Understanding the environmental footprint of digital infrastructure.",
};

const stats = [
  { value: "2-4%", label: "global emissons from tech" },
  { value: "9%", label: "annual energy growth" },
  { value: "1.6B", label: "tons of CO₂ from code" },
];

const principles = [
  {
    icon: Zap,
    title: "COMPUTATIONAL DENSITY",
    description: "Write code that does more with less. Optimized algorithms are the first line of defense against hardware expansion.",
  },
  {
    icon: Globe,
    title: "TEMPORAL SHIFTING",
    description: "Understand the grid. Software should be carbon-aware, shifting workloads to periods of high renewable energy availability.",
  },
  {
    icon: Code,
    title: "HARDWARE LONGEVITY",
    description: "Efficient code extends hardware lifecycles. Reducing CPU/RAM demand directly minimizes the need for high-turnover server hardware.",
  },
];

export default function AboutPage() {
  return (
    <div className="bg-[#0a0a0a] min-h-screen text-white py-32 px-4 selection:bg-white selection:text-black">
      <div className="container mx-auto max-w-6xl">
        
        {/* HERO SECTION */}
        <div className="mb-32">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-px w-12 bg-white" />
            <span className="text-[10px] font-mono tracking-[0.5em] uppercase text-gray-500">Manifesto v1.0</span>
          </div>
          <h1 className="text-5xl sm:text-8xl font-black tracking-tighter uppercase leading-[0.8] mb-12">
            The Code <br /> Is The <br /> <span className="text-emerald-500">Footprint</span>.
          </h1>
          <p className="text-xl sm:text-2xl text-gray-400 font-medium leading-relaxed max-w-3xl">
            In an era of rapid digital expansion, we believe efficiency is no longer just a performance metric—it is an environmental necessity.
          </p>
        </div>

        {/* STATS STRIP */}
        <div className="grid md:grid-cols-3 gap-8 mb-32 py-12 border-y border-white/10">
          {stats.map((stat, i) => (
            <div key={i} className="space-y-2">
              <p className="text-5xl font-black tracking-tighter text-white">{stat.value}</p>
              <p className="text-[10px] font-mono uppercase tracking-widest text-gray-500">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* CORE PRINCIPLES */}
        <div className="mb-32">
          <div className="flex items-center justify-between mb-16">
            <h2 className="text-sm font-mono text-gray-500 uppercase tracking-widest">Protocol Principles</h2>
            <div className="h-px flex-1 bg-white/10 ml-8" />
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {principles.map((principle, i) => (
              <div key={i} className="group space-y-6">
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:bg-white transition-all group-hover:rotate-6">
                  <principle.icon size={20} className="text-gray-400 group-hover:text-black transition-colors" />
                </div>
                <h3 className="text-xl font-bold tracking-tight">{principle.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed font-medium">
                  {principle.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CALL TO ACTION */}
        <div className="p-12 md:p-24 rounded-[3rem] bg-white text-black relative overflow-hidden group">
          <div className="relative z-10 flex flex-col items-center text-center">
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase leading-none mb-8">
              Join the <br /> Optimization <br /> Force.
            </h2>
            <p className="text-lg font-medium max-w-md mb-12 opacity-70">
              Start measuring your impact. Every millisecond of compute saved counts toward a sustainable future.
            </p>
            <Link 
              href="/analyze"
              className="group/btn flex items-center gap-4 bg-black text-white px-10 py-5 rounded-full font-bold transition-all hover:pr-12 active:scale-95"
            >
              INITIALIZE_AUDIT
              <ArrowRight size={20} className="group-hover/btn:translate-x-2 transition-transform" />
            </Link>
          </div>

          {/* BACKGROUND DECORATION */}
          <div className="absolute top-0 right-0 p-24 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
            <Globe size={400} />
          </div>
        </div>

      </div>
    </div>
  );
}
