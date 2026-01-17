"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Leaf, Upload, BarChart3, Info, Github, LogOut, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";

import { useAuth } from "@/hooks/use-auth";

// Register GSAP plugins
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin, useGSAP);
}

const navItems = [
  { href: "/", label: "Home", icon: Leaf },
  { href: "/analyze", label: "Analyze", icon: Upload },
  { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { href: "/about", label: "About", icon: Info },
];

export function Header() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // GSAP Refs
  const headerRef = useRef<HTMLHeaderElement>(null);
  const navContainerRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const navLinksRef = useRef<(HTMLAnchorElement | null)[]>([]);

  const handleLogout = async () => {
    try {
      await logout();
      setShowUserMenu(false);
      window.location.href = "/";
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // --- GSAP IMPLEMENTATION ---

  useGSAP(() => {
    // 1. Initial Intro Animation
    const tl = gsap.timeline();
    tl.from(headerRef.current, {
      y: -100,
      opacity: 0,
      duration: 1,
      ease: "power3.out"
    });

    // 2. Scroll Effect (Sticky Header Scaling)
    ScrollTrigger.create({
      trigger: typeof document !== 'undefined' ? document.body : null,
      start: "top top",
      end: "+=100",
      onUpdate: (self) => {
        const progress = self.progress;
        if (progress > 0.05) {
          gsap.to(headerRef.current, {
            height: 60,
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            backdropFilter: "blur(12px)",
            borderBottomColor: "rgba(0,0,0,0.1)",
            duration: 0.3,
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
          });
        } else {
          gsap.to(headerRef.current, {
            height: 80,
            backgroundColor: "rgba(255, 255, 255, 0.8)",
            backdropFilter: "blur(0px)",
            borderBottomColor: "transparent",
            duration: 0.3,
            boxShadow: "none"
          });
        }
      }
    });

  }, { scope: headerRef });


  // 3. Indicator Animation Logic
  useGSAP(() => {
    const activeIndex = navItems.findIndex(item => item.href === pathname);
    const activeLink = navLinksRef.current[activeIndex];

    if (activeLink && indicatorRef.current && navContainerRef.current) {
      const navRect = navContainerRef.current.getBoundingClientRect();
      const linkRect = activeLink.getBoundingClientRect();
      const relativeLeft = linkRect.left - navRect.left;

      gsap.to(indicatorRef.current, {
        x: relativeLeft,
        width: linkRect.width,
        opacity: 1,
        duration: 0.5,
        ease: "elastic.out(1, 0.75)"
      });
    } else {
      gsap.to(indicatorRef.current, { opacity: 0, duration: 0.3 });
    }
  }, [pathname]);


  // 4. Hover Effects (Interactive Indicator)
  const handleMouseEnter = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const target = e.currentTarget;
    if (indicatorRef.current && navContainerRef.current) {
      const navRect = navContainerRef.current.getBoundingClientRect();
      const linkRect = target.getBoundingClientRect();
      const relativeLeft = linkRect.left - navRect.left;

      gsap.to(indicatorRef.current, {
        x: relativeLeft,
        width: linkRect.width,
        opacity: 1,
        duration: 0.4,
        ease: "power2.out"
      });
    }
  };

  const handleMouseLeave = () => {
    const activeIndex = navItems.findIndex(item => item.href === pathname);
    const activeLink = navLinksRef.current[activeIndex];

    if (activeLink && indicatorRef.current && navContainerRef.current) {
      const navRect = navContainerRef.current.getBoundingClientRect();
      const linkRect = activeLink.getBoundingClientRect();
      const relativeLeft = linkRect.left - navRect.left;

      gsap.to(indicatorRef.current, {
        x: relativeLeft,
        width: linkRect.width,
        opacity: 1,
        duration: 0.4,
        ease: "elastic.out(1, 0.75)"
      });
    }
  };


  // 5. Mobile Menu Animation
  useGSAP(() => {
    if (showMobileMenu) {
      gsap.to(mobileMenuRef.current, {
        autoAlpha: 1,
        y: 0,
        duration: 0.4,
        ease: "power3.out"
      });
      gsap.fromTo(".mobile-nav-item",
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.3, stagger: 0.1, delay: 0.1 }
      );
    } else {
      gsap.to(mobileMenuRef.current, {
        autoAlpha: 0,
        y: -20,
        duration: 0.3,
        ease: "power3.in"
      });
    }
  }, [showMobileMenu]);

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-50 w-full h-[80px] border-b border-transparent bg-white/80 dark:bg-gray-950/80 backdrop-blur-md transition-all will-change-transform"
    >
      <div className="container mx-auto flex h-full items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 group z-50">
          <div className="relative">
            <div className="absolute inset-0 bg-emerald-500 blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
            <div className="relative p-2 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600">
              <Leaf className="w-5 h-5 text-white" />
            </div>
          </div>
          <span className="text-xl font-bold text-gray-900 dark:text-white">
            CO<span className="text-emerald-500">2</span>DE
          </span>
        </Link>

        <div ref={navContainerRef} className="hidden md:flex items-center gap-1 relative">
          <div ref={indicatorRef} className="nav-indicator" />

          {navItems.map((item, index) => (
            <Link
              key={item.href}
              href={item.href}
              ref={el => { navLinksRef.current[index] = el }}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              className={cn(
                "relative z-10 flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200",
                pathname === item.href
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3 z-50">
          <a
            href="https://github.com/Govinda2809/Co2de"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <Github className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </a>

          {user ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-sm font-medium">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-200">{user.name}</span>
              </button>

              {showUserMenu && (
                <div className="absolute right-0 top-full mt-2 w-48 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-lg animate-in fade-in zoom-in-95 duration-200">
                  <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-800">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </div>
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <BarChart3 className="w-4 h-4" />
                    My Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-800 w-full"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium transition-colors shadow-lg shadow-emerald-500/20"
              >
                Get Started
              </Link>
            </div>
          )}

          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200"
          >
            {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <div
        ref={mobileMenuRef}
        className="mobile-menu-overlay absolute top-[80px] left-0 w-full h-[calc(100vh-80px)] bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 md:hidden flex flex-col p-6 z-40"
      >
        <nav className="flex flex-col gap-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setShowMobileMenu(false)}
              className={cn(
                "mobile-nav-item flex items-center gap-3 px-4 py-4 rounded-xl text-lg font-medium transition-all",
                pathname === item.href
                  ? "bg-emerald-500/10 text-emerald-600"
                  : "text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
              )}
            >
              <item.icon className="w-6 h-6" />
              {item.label}
            </Link>
          ))}
          {!user && (
            <div className="mobile-nav-item pt-4 border-t border-gray-200 dark:border-gray-800 space-y-3">
              <Link
                href="/login"
                onClick={() => setShowMobileMenu(false)}
                className="block px-4 py-3 text-center rounded-xl border border-gray-300 dark:border-gray-700 font-medium text-gray-700 dark:text-gray-200"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                onClick={() => setShowMobileMenu(false)}
                className="block px-4 py-3 text-center rounded-xl bg-emerald-500 text-white font-medium shadow-lg shadow-emerald-500/20"
              >
                Get Started Free
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
