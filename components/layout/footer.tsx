import Link from "next/link";
import { Play, ArrowRight, Github, Twitter, Linkedin, Youtube, CheckCircle2 } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative bg-[#0a0a0a] pt-24 pb-12 overflow-hidden">
      {/* Large CTA Section */}
      <div className="container mx-auto px-6 relative z-20 mb-24">
        <div className="rounded-[3rem] bg-gradient-to-br from-[#111] to-black border border-white/5 p-12 md:p-20 relative overflow-hidden group">
          {/* Abstract Background Elements */}
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
          <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.03]" />

          <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start justify-between gap-12 text-center md:text-left">
            <div className="max-w-2xl space-y-6">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-medium text-white tracking-tight leading-[1.1]">
                Measure your impact.<br />
                <span className="text-white/40">Optimize for the future.</span>
              </h2>
            </div>

            <div className="max-w-md space-y-8 md:pt-4">
              <p className="text-lg text-gray-400 font-light leading-relaxed">
                Connect your codebase with advanced algorithmic strategies that quantify carbon intensity and automatically suggest energy-efficient refactors.
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <Link
                  href="/analyze"
                  className="px-8 py-4 rounded-full bg-white text-black font-medium hover:bg-gray-200 transition-colors flex items-center gap-2 group/btn"
                >
                  Get started
                  <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/about"
                  className="px-8 py-4 rounded-full border border-white/10 hover:bg-white/5 text-white transition-colors flex items-center gap-2"
                >
                  <Play size={18} className="fill-current" />
                  Watch how it works
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="container mx-auto px-6 relative z-10">
        {/* Giant Watermark */}
        <div className="absolute left-1/2 -translate-x-1/2 top-1/3 -z-10 select-none pointer-events-none opacity-[0.02]">
          <span className="text-[20vw] font-bold tracking-tighter text-white whitespace-nowrap">CO2DE</span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-6 gap-12 lg:gap-8 mb-20">
          <div className="col-span-2 lg:col-span-2 space-y-6">
            <Link href="/" className="inline-block">
              <span className="text-2xl font-bold text-white tracking-tight">CO2DE</span>
            </Link>
            <p className="text-sm text-gray-500 max-w-xs">
              There is no risk-free code. Every byte consumes energy. We make that consumption visible and optimized.
            </p>
          </div>

          <div className="space-y-6">
            <h4 className="text-sm font-medium text-white">About</h4>
            <ul className="space-y-4 text-sm text-gray-500">
              <li><Link href="/about" className="hover:text-emerald-400 transition-colors">Our Mission</Link></li>
              <li><Link href="/team" className="hover:text-emerald-400 transition-colors">Team</Link></li>
              <li><Link href="/careers" className="hover:text-emerald-400 transition-colors">Careers</Link></li>
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="text-sm font-medium text-white">Product</h4>
            <ul className="space-y-4 text-sm text-gray-500">
              <li><Link href="/analyze" className="hover:text-emerald-400 transition-colors">Analyze</Link></li>
              <li><Link href="/dashboard" className="hover:text-emerald-400 transition-colors">Dashboard</Link></li>
              <li><Link href="/api" className="hover:text-emerald-400 transition-colors">API</Link></li>
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="text-sm font-medium text-white">Legal</h4>
            <ul className="space-y-4 text-sm text-gray-500">
              <li><Link href="/privacy" className="hover:text-emerald-400 transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-emerald-400 transition-colors">Terms of Use</Link></li>
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="text-sm font-medium text-white">Social</h4>
            <ul className="space-y-4 text-sm text-gray-500">
              <li><a href="#" className="hover:text-emerald-400 transition-colors flex items-center gap-2">X (Twitter)</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors flex items-center gap-2">LinkedIn</a></li>
              <li><a href="https://github.com/Govinda2809/Co2de" className="hover:text-emerald-400 transition-colors flex items-center gap-2">GitHub</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3 px-4 py-1.5 rounded-full border border-white/5 bg-white/[0.02]">
            <div className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </div>
            <span className="text-xs font-medium text-gray-400">All systems operational</span>
          </div>

          <p className="text-xs text-gray-600">
            © {new Date().getFullYear()} CO2DE. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
