"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Github, BarChart3, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useAuth } from "@/hooks/use-auth";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register GSAP plugins
if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP, ScrollTrigger);
}

export function Header() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const headerRef = useRef<HTMLHeaderElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const hoverHighlightRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    try {
      await logout();
      setShowUserMenu(false);
      setShowMobileMenu(false);
      window.location.href = "/";
    } catch (error) {
      console.error("Logout failed:", error);
    }
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

  // 1. Entrance Animation
  useGSAP(() => {
    gsap.from(headerRef.current, {
      y: -50,
      opacity: 0,
      duration: 1.2,
      ease: "power3.out",
      delay: 0.5
    });
  }, { scope: headerRef });

  // 2. Hover Highlight Logic
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

      // Animate text color
      gsap.to(link, { color: "#ffffff", duration: 0.2 });
    }
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => {
    gsap.to(e.currentTarget, { color: "", clearProps: "color", duration: 0.2 });
  };

  const handleNavMouseLeave = () => {
    // Hide highlight when leaving the entire nav
    if (hoverHighlightRef.current) {
      gsap.to(hoverHighlightRef.current, { opacity: 0, duration: 0.3 });
    }
  }

  // 3. Mobile Menu Animation
  useGSAP(() => {
    if (showMobileMenu) {
      gsap.to(mobileMenuRef.current, {
        height: "100vh",
        opacity: 1,
        duration: 0.5,
        ease: "power3.inOut",
        pointerEvents: "all"
      });
      gsap.fromTo(".mobile-link",
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.1, duration: 0.5, delay: 0.2 }
      );
    } else {
      gsap.to(mobileMenuRef.current, {
        height: 0,
        opacity: 0,
        duration: 0.5,
        ease: "power3.inOut",
        pointerEvents: "none"
      });
    }
  }, [showMobileMenu]);

  return (
    <>
      <header
        ref={headerRef}
        className="fixed top-6 left-0 w-full z-50 flex justify-center pointer-events-none"
      >
        {/* LOGO (Top Left) */}
        <div className="pointer-events-auto absolute left-6 top-1/2 -translate-y-1/2 hidden md:block">
          <Link href="/" className="text-xl font-bold tracking-tighter hover:opacity-70 transition-opacity text-white">
            CO2DE
          </Link>
        </div>

        {/* CAPSULE NAVBAR (Desktop) */}
        <nav
          ref={navRef}
          onMouseLeave={handleNavMouseLeave}
          className="pointer-events-auto hidden md:flex items-center gap-1 p-1.5 rounded-full bg-white/5 backdrop-blur-3xl border border-white/10 shadow-2xl relative overflow-hidden"
        >
          {/* Hover Highlight Element */}
          <div
            ref={hoverHighlightRef}
            className="absolute bg-white/15 rounded-full pointer-events-none opacity-0"
            style={{ height: '100%', top: 0 }}
          />

          {visibleNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              className={cn(
                "relative z-10 px-5 py-2.5 text-xs font-semibold tracking-widest text-gray-400 transition-colors uppercase hover:text-white",
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
<<<<<<< HEAD
            aria-label="View on GitHub"
            className="hidden sm:flex p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
=======
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className="relative z-10 flex items-center justify-center px-3 py-2.5 text-gray-400 transition-colors hover:text-white"
>>>>>>> ed33be388b505724a000fd689e5ecab0b066829d
          >
            <Github className="w-5 h-5" />
          </a>

          {/* User Menu or Sign In */}
          {user ? (
            <div className="relative z-10">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                className="flex items-center gap-2 px-4 py-2 text-xs font-semibold tracking-widest text-gray-400 uppercase transition-colors hover:text-white"
              >
                {user.name}
              </button>

              {showUserMenu && (
                <div className="absolute right-0 top-full mt-4 w-56 p-2 rounded-2xl border border-white/10 bg-[#0a0a0a]/90 backdrop-blur-2xl shadow-xl animate-in fade-in zoom-in-95 duration-200">
                  <div className="px-4 py-3 border-b border-white/5 mb-2">
                    <p className="text-sm font-medium text-white">{user.name}</p>
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
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 w-full transition-colors"
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
<<<<<<< HEAD
            aria-label="Toggle mobile menu"
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200"
=======
            className="p-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white"
>>>>>>> ed33be388b505724a000fd689e5ecab0b066829d
          >
            {showMobileMenu ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* MOBILE MENU OVERLAY */}
      <div
        ref={mobileMenuRef}
        className="fixed inset-0 z-40 bg-[#0a0a0a] flex flex-col items-center justify-center pointer-events-none opacity-0"
        style={{ height: 0 }}
      >
        <Link
          href="/"
          onClick={() => setShowMobileMenu(false)}
          className="mobile-link text-4xl md:text-5xl font-bold tracking-tighter text-white py-4 uppercase hover:text-gray-500 transition-colors"
        >
          Home
        </Link>

        {visibleNavItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setShowMobileMenu(false)}
            className="mobile-link text-4xl md:text-5xl font-bold tracking-tighter text-white py-4 uppercase hover:text-gray-500 transition-colors"
          >
            {item.label}
          </Link>
        ))}

        {user ? (
          <button
            onClick={handleLogout}
            className="mobile-link text-4xl md:text-5xl font-bold tracking-tighter text-red-500 py-4 uppercase hover:text-red-400 transition-colors"
          >
            Logout
          </button>
        ) : (
          <>
            <Link
              href="/login"
              onClick={() => setShowMobileMenu(false)}
              className="mobile-link text-4xl md:text-5xl font-bold tracking-tighter text-white py-4 uppercase hover:text-gray-500 transition-colors"
            >
              Login
            </Link>
            <Link
              href="/signup"
              onClick={() => setShowMobileMenu(false)}
              className="mobile-link text-4xl md:text-5xl font-bold tracking-tighter text-white py-4 uppercase hover:text-gray-500 transition-colors"
            >
              Signup
            </Link>
          </>
        )}

      </div>
    </>
  );
}
