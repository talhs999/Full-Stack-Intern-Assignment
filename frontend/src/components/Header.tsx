"use client";

import { Search, Bell, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function Header() {
  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-30 dark:bg-slate-950 dark:border-slate-800 transition-colors duration-200">
      {/* Left: Search */}
      <div className="flex-1 flex items-center">
        <div className="relative w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg leading-5 bg-slate-50 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm transition-colors dark:bg-slate-900 dark:border-slate-800 dark:text-white dark:focus:bg-slate-800"
            placeholder="Search ledgers, audits, or clients..."
          />
        </div>
      </div>

      {/* Middle: Quick Links */}
      <div className="flex items-center gap-6 px-8 border-x border-slate-200 h-full dark:border-slate-800">
        <Link href="/reports" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors flex items-center gap-1 dark:text-slate-400 dark:hover:text-white">
          <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">P&L</span>
        </Link>
        <Link href="/reports" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors dark:text-slate-400 dark:hover:text-white">
          Balance Sheet
        </Link>
        <Link href="/reports" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors dark:text-slate-400 dark:hover:text-white">
          Audits
        </Link>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-4 pl-6">
        <button className="flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-emerald-600 transition-colors dark:text-slate-300 dark:hover:text-emerald-400">
          <Sparkles className="w-4 h-4 text-emerald-500" />
          AI Insights
        </button>
        
        <button className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors dark:hover:text-slate-300">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-950"></span>
        </button>

        <div className="h-8 w-8 rounded-full bg-slate-200 overflow-hidden border border-slate-300 dark:border-slate-700">
          <img src="https://ui-avatars.com/api/?name=User&background=0F172A&color=fff" alt="User Avatar" />
        </div>
      </div>
    </header>
  );
}
