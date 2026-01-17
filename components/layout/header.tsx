"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Leaf, Upload, BarChart3, Info, Github } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Home", icon: Leaf },
  { href: "/analyze", label: "Analyze", icon: Upload },
  { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { href: "/about", label: "About", icon: Info },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200/50 dark:border-gray-800/50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="relative">
            <div className="absolute inset-0 bg-emerald-500 blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
            <div className="relative p-2 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600">
              <Leaf className="w-5 h-5 text-white" />
            </div>
          </div>
          <span className="text-xl font-bold">
            CO<span className="text-emerald-500">2</span>DE
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                pathname === item.href
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <a
            href="https://github.com/Govinda2809/Co2de"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <Github className="w-5 h-5" />
          </a>
          <Link
            href="/analyze"
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-medium text-sm transition-colors"
          >
            <Upload className="w-4 h-4" />
            Analyze Code
          </Link>
        </div>
      </div>
    </header>
  );
}
