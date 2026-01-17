import Link from "next/link";
import { Leaf, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950/50">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600">
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">
                CO<span className="text-emerald-500">2</span>DE
              </span>
            </Link>
            <p className="text-sm text-gray-600 dark:text-gray-400 max-w-xs">
              Helping developers understand and reduce the environmental footprint of their code.
              Built for a sustainable future.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Product</h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li><Link href="/analyze" className="hover:text-emerald-500 transition-colors">Analyze Code</Link></li>
              <li><Link href="/dashboard" className="hover:text-emerald-500 transition-colors">Dashboard</Link></li>
              <li><Link href="/about" className="hover:text-emerald-500 transition-colors">About</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Resources</h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li><a href="https://greensoftware.foundation" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-500 transition-colors">Green Software Foundation</a></li>
              <li><a href="https://github.com/Govinda2809/Co2de" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-500 transition-colors">GitHub</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            © {new Date().getFullYear()} CO2DE. All rights reserved.
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
            Made with <Heart className="w-4 h-4 text-red-500 fill-current" /> for the planet
          </p>
        </div>
      </div>
    </footer>
  );
}
