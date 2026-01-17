"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
<<<<<<< HEAD
import { Menu, X, Github, BarChart3, LogOut, User as UserIcon } from "lucide-react";
=======
import { Menu, X, Github, BarChart3, LogOut, User } from "lucide-react";
>>>>>>> 499689fa5298b70d7ac393ad928573c9e46d40bf
import { cn } from "@/lib/utils";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useAuth } from "@/hooks/use-auth";

export function Header() {
  const pathname = usePathname();
  const { user, logout, isLoading: authLoading } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const headerRef = useRef<HTMLElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const hoverHighlightRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    setShowUserMenu(false);
    setShowMobileMenu(false);
    await logout();
  };

  const getNavItems = () => {
    const items = [
      { href: "/about", label: "ABOUT", access: "public" },
      { href: "/analyze", label: "ANALYZE", access: "protected" },
      { href: "/dashboard", label: "DASHBOARD", access: "protected" },
    ];

    return items.filter((item) => {
      if (item.access === "public") return true;
      if (item.access === "protected") return !!user;
      return true;
    });
  };

  const visibleNavItems = getNavItems();

  useGSAP(() => {
    gsap.from(headerRef.current, {
      y: -50,
      opacity: 0,
      duration: 1.2,
      ease: "power3.out",
      delay: 0.2
    });
  }, { scope: headerRef });

  const handleMouseEnter = (e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => {
    if (!hoverHighlightRef.current) return;
    const link = e.currentTarget;
    const linkRect = link.getBoundingClientRect();
    const navRect = navRef.current?.getBoundingClientRect();

    if (navRect) {
      const relativeLeft = linkRect.left - navRect.left;
      const relativeTop = linkRect.top - navRect.top;

      gsap.to(hoverHighlightRef.current, {
        opacity: 1,
        width: linkRect.width,
        height: linkRect.height,
        x: relativeLeft,
        y: relativeTop,
        duration: 0.4,
        ease: "power2.out"
      });
      gsap.to(link, { color: "#ffffff", duration: 0.2 });
    }
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => {
    gsap.to(e.currentTarget, { color: "", clearProps: "color", duration: 0.2 });
  };

  const handleNavMouseLeave = () => {
    if (hoverHighlightRef.current) {
      gsap.to(hoverHighlightRef.current, { opacity: 0, duration: 0.3 });
    }
  }

  return (
    <>
      <header
        ref={headerRef}
        className="fixed top-6 left-0 w-full z-50 flex justify-center pointer-events-none"
      >
        <div className="pointer-events-auto absolute left-6 top-1/2 -translate-y-1/2 hidden lg:block">
          <Link href="/" className="text-xl font-black tracking-tighter text-white hover:opacity-70 transition-opacity">
            CO2DE_
          </Link>
        </div>

        <nav
          ref={navRef}
          onMouseLeave={handleNavMouseLeave}
<<<<<<< HEAD
          className="pointer-events-auto hidden md:flex items-center gap-1 p-1.5 rounded-full bg-white/5 backdrop-blur-3xl border border-white/10 shadow-2xl relative"
=======
<<<<<<< HEAD
          className="pointer-events-auto flex items-center gap-1 p-1.5 rounded-full bg-white/[0.03] backdrop-blur-3xl border border-white/10 shadow-2xl relative overflow-hidden"
=======
          className="pointer-events-auto hidden md:flex items-center gap-1 p-1.5 rounded-full bg-white/5 backdrop-blur-3xl border border-white/10 shadow-2xl relative"
>>>>>>> cc51710 (Allow user dropdown to overflow navbar)
>>>>>>> temp_resolve
        >
          <div
            ref={hoverHighlightRef}
            className="absolute bg-white/[0.08] rounded-full pointer-events-none opacity-0"
            style={{ height: '100%', top: 0 }}
          />

          {visibleNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              className={cn(
                "relative z-10 px-6 py-2.5 text-[10px] font-bold tracking-[0.2em] text-gray-500 transition-colors uppercase hover:text-white",
                pathname === item.href && "text-white"
              )}
            >
              {item.label}
            </Link>
          ))}

          {/* GitHub Icon */}
          <a
            href="https://github.com/Govinda2809/Co2de"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="View on GitHub"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className="relative z-10 flex items-center justify-center px-3 py-2.5 text-gray-400 transition-colors hover:text-white"
          >
            <Github className="w-5 h-5" />
          </a>

          {/* User Menu or Sign In */}
          {user ? (
            <div
              className="relative z-10"
              onMouseEnter={() => setShowUserMenu(true)}
              onMouseLeave={() => setShowUserMenu(false)}
            >
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center justify-center px-3 py-2.5 text-gray-400 transition-colors hover:text-white"
                aria-label="User menu"
              >
                <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center border border-white/10">
                  <User className="w-4 h-4" />
                </div>
              </button>

              {showUserMenu && (
                <div className="absolute right-0 top-full mt-2 w-64 p-2 rounded-2xl border border-white/10 bg-[#0a0a0a]/90 backdrop-blur-2xl shadow-xl animate-in fade-in zoom-in-95 duration-200">
                  <div className="px-4 py-3 border-b border-white/5 mb-2">
                    <p className="text-sm font-medium text-white truncate">{user.name}</p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </div>
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <BarChart3 className="w-4 h-4" />
                    Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 w-full transition-colors font-medium"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                href="/login"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                className="relative z-10 px-5 py-2.5 text-xs font-semibold tracking-widest text-gray-400 transition-colors uppercase hover:text-white"
              >
                LOGIN
              </Link>
              <Link
                href="/signup"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                className="relative z-10 px-5 py-2.5 text-xs font-semibold tracking-widest text-gray-400 transition-colors uppercase hover:text-white"
              >
                SIGNUP
              </Link>
            </>
          )}

        </nav>

        {/* MOBILE TOGGLE (Top Right) */}
        <div className="md:hidden pointer-events-auto absolute right-6 top-0">
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            aria-label="Toggle mobile menu"
            className="p-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white"
          >
            {showMobileMenu ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/95 flex flex-col items-center justify-center transition-all duration-700 ease-in-out px-6",
          showMobileMenu ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-full pointer-events-none"
        )}
      >
        <div className="text-center space-y-8">
          <Link
            href="/"
            className="text-5xl font-black italic tracking-tighter text-white uppercase block"
            onClick={() => setShowMobileMenu(false)}
          >
            Home_
          </Link>
          {visibleNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setShowMobileMenu(false)}
              className="text-5xl font-black italic tracking-tighter text-white uppercase block hover:text-emerald-500 transition-colors"
            >
              {item.label}
            </Link>
          ))}
          {user ? (
            <button
              onClick={handleLogout}
              className="text-5xl font-black italic tracking-tighter text-red-500 uppercase block"
            >
              Terminate_
            </button>
          ) : (
            <Link
              href="/login"
              onClick={() => setShowMobileMenu(false)}
              className="text-5xl font-black italic tracking-tighter text-emerald-500 uppercase block"
            >
              Access_
            </Link>
          )}
        </div>
      </div>
    </>
  );
}
