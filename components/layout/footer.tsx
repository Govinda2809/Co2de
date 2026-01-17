import Link from "next/link";
import { Heart, Github, Globe } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t-2 border-white/20 bg-black relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-5"
        style={{ backgroundImage: 'linear-gradient(#444 1px, transparent 1px), linear-gradient(90deg, #444 1px, transparent 1px)', backgroundSize: '20px 20px' }}
      />

      <div className="container mx-auto px-6 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="md:col-span-2 space-y-6">
            <Link href="/" className="inline-block">
              <span className="font-pixel text-2xl text-white tracking-widest hover:text-emerald-500 transition-colors">
                CO2DE_
              </span>
            </Link>
            <p className="font-mono text-xs text-gray-500 max-w-sm leading-relaxed uppercase">
              // TERMINAL_OUTPUT:: <br />
              Quantifying software carbon intensity. <br />
              Optimizing for a sustainable computational future.
            </p>
          </div>

          <div>
            <h3 className="font-pixel text-sm text-white mb-6 uppercase tracking-widest">Navigation</h3>
            <ul className="space-y-4 font-mono text-xs text-gray-500">
              <li><Link href="/analyze" className="hover:text-emerald-500 hover:underline decoration-2 underline-offset-4 transition-all">START_AUDIT</Link></li>
              <li><Link href="/dashboard" className="hover:text-emerald-500 hover:underline decoration-2 underline-offset-4 transition-all">LEADERBOARD</Link></li>
              <li><Link href="/about" className="hover:text-emerald-500 hover:underline decoration-2 underline-offset-4 transition-all">PROTOCOL_DOCS</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-pixel text-sm text-white mb-6 uppercase tracking-widest">Network</h3>
            <ul className="space-y-4 font-mono text-xs text-gray-500">
              <li><a href="https://greensoftware.foundation" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-500 hover:underline decoration-2 underline-offset-4 transition-all flex items-center gap-2"><Globe size={12} /> GREEN_SW_FDN</a></li>
              <li><a href="https://github.com/Govinda2809/Co2de" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-500 hover:underline decoration-2 underline-offset-4 transition-all flex items-center gap-2"><Github size={12} /> REPOSITORY</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t-2 border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-6 font-mono text-[10px] text-gray-600 uppercase tracking-widest">
          <p>
            SYSTEM_ID: CO2DE-2026 // ALL_RIGHTS_RESERVED
          </p>
          <p className="flex items-center gap-2">
            COMPILED_WITH <Heart className="w-3 h-3 text-red-600 fill-current animate-pulse" /> FOR_EARTH
          </p>
        </div>
      </div>
    </footer>
  );
}
