'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Receipt, BookOpen, BarChart3, ShieldAlert, Sparkles, Building2, Sun, Moon } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const [isLight, setIsLight] = React.useState(false);

  React.useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'light') {
      document.body.classList.add('light-mode');
      setIsLight(true);
    }
  }, []);

  const toggleTheme = () => {
    const nextMode = !isLight;
    setIsLight(nextMode);
    if (nextMode) {
      document.body.classList.add('light-mode');
      localStorage.setItem('theme', 'light');
    } else {
      document.body.classList.remove('light-mode');
      localStorage.setItem('theme', 'dark');
    }
  };

  const navItems = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Expenses & Revenue', href: '/expenses', icon: Receipt },
    { name: 'General Ledger', href: '/ledgers', icon: BookOpen },
    { name: 'Reports & Audit', href: '/reports', icon: BarChart3, badge: 'AI Audit' },
  ];

  return (
    <header className="sticky top-0 z-40 glass-panel border-b border-white/10 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Logo & Title */}
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
            <Building2 className="w-6 h-6 text-slate-950" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
              Cyber Nuts <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 font-medium">AI Ledger v1.0</span>
            </h1>
            <p className="text-xs text-slate-400">Muhammad Talha Khan — Accounting Assistant</p>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center space-x-1 bg-slate-900/60 p-1.5 rounded-2xl border border-white/5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 border border-cyan-500/30 shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{item.name}</span>
                {item.badge && (
                  <span className="text-[10px] px-1.5 py-0.2 bg-amber-500/20 text-amber-300 rounded border border-amber-500/30 font-semibold animate-pulse">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right Status / Action */}
        <div className="flex items-center space-x-3">
          <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Supabase Ledger Active</span>
          </div>
          
          <button
            onClick={toggleTheme}
            aria-label="Toggle Light / Dark Mode"
            title={isLight ? "Switch to Obsidian Dark Mode" : "Switch to Pearl Light Mode"}
            className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all flex items-center justify-center text-slate-300 hover:text-cyan-400 shadow-sm cursor-pointer"
          >
            {isLight ? <Moon className="w-4 h-4 text-slate-800" /> : <Sun className="w-4 h-4 text-amber-400 animate-spin-slow" />}
          </button>
        </div>
      </div>
    </header>
  );
}
