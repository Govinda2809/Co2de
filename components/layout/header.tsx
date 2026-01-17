"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Github, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useAuth } from "@/hooks/use-auth";

export function Header() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const headerRef = useRef<HTMLElement>(null);

  const handleLogout = async () => {
    setShowUserMenu(false);
    setShowMobileMenu(false);
    await logout();
  };

  const navItems = [
    { href: "/about", label: "About" },
    { href: "/analyze", label: "Analyze" },
    { href: "/dashboard", label: "Dashboard" },
  ];

  useGSAP(() => {
    gsap.from(headerRef.current, {
      y: -20,
      opacity: 0,
      duration: 1,
      ease: "power3.out",
    });
  }, { scope: headerRef });

  return (
    <>
      <header
        ref={headerRef}
        className="fixed top-0 left-0 w-full z-50 flex justify-center pt-6 px-6"
      >
        <div className="w-full max-w-5xl bg-white/5 backdrop-blur-xl border border-white/10 rounded-full h-14 flex items-center justify-between px-6 shadow-lg shadow-black/5">
          {/* LOGO */}
          <Link href="/" className="font-sans font-medium text-sm text-white hover:text-white/80 transition-colors tracking-tight">
            CO2DE
          </Link>

          {/* DESKTOP NAV */}
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-xs font-medium tracking-wide transition-all hover:text-white relative group",
                  pathname === item.href ? "text-white" : "text-gray-400"
                )}
              >
                {item.label}
                <span className={cn(
                  "absolute -bottom-1 left-0 w-full h-px bg-white scale-x-0 group-hover:scale-x-100 transition-transform duration-300",
                  pathname === item.href && "scale-x-100"
                )} />
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <a
              href="https://github.com/Govinda2809/Co2de"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors"
            >
              <Github className="w-4 h-4" />
            </a>

            <div className="h-4 w-px bg-white/10" />

            {user ? (
              <div className="relative group">
                <button className="text-xs font-medium text-white hover:text-gray-300 transition-colors">
                  {user.name}
                </button>
                <div className="absolute right-0 top-full pt-4 w-32 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                  <div className="bg-[#111] border border-white/10 rounded-xl p-2 space-y-1 shadow-xl">
                    <Link href="/dashboard" className="block text-[10px] text-gray-400 hover:text-white px-2 py-1.5 rounded-lg hover:bg-white/5 transition-colors">Dashboard</Link>
                    <button onClick={handleLogout} className="block w-full text-left text-[10px] text-red-400 hover:text-red-300 px-2 py-1.5 rounded-lg hover:bg-white/5 transition-colors">Logout</button>
                  </div>
                </div>
              </div>
            ) : (
              <Link href="/login" className="flex items-center gap-2 bg-white text-black px-4 py-1.5 rounded-full text-xs font-medium hover:bg-gray-200 transition-colors">
                Sign In
              </Link>
            )}
          </div>

          {/* MOBILE TOGGLE */}
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="md:hidden text-white hover:text-gray-300"
          >
            {showMobileMenu ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </header>

      {/* MOBILE MENU */}
      {showMobileMenu && (
        <div className="fixed inset-0 z-40 bg-[#0a0a0a] pt-32 px-6">
          <div className="flex flex-col gap-6 items-center">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setShowMobileMenu(false)}
                className="text-2xl font-light text-white/90 hover:text-white transition-colors"
              >
                {item.label}
              </Link>
            ))}
            {!user && (
              <Link href="/login" onClick={() => setShowMobileMenu(false)} className="mt-8 px-8 py-3 bg-white text-black rounded-full font-medium">
                Get Started
              </Link>
            )}
          </div>
        </div>
      )}
    </>
  );
}
