"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { LayoutDashboard, Wallet, CreditCard, BookOpen, BarChart3, Settings, HelpCircle, LogOut } from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Overview', href: '/', icon: LayoutDashboard },
    { name: 'Income', href: '/income', icon: Wallet },
    { name: 'Expenses', href: '/expenses', icon: CreditCard },
    { name: 'Ledgers', href: '/ledgers', icon: BookOpen },
    { name: 'Reports', href: '/reports', icon: BarChart3 },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <div className="w-64 bg-white border-r border-slate-200 h-screen flex flex-col fixed left-0 top-0 z-40 dark:bg-slate-950 dark:border-slate-800 transition-colors duration-200">
      {/* Brand & Logo */}
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-slate-900 rounded-lg w-8 h-8 flex items-center justify-center">
            <BookOpen className="text-white w-5 h-5" />
          </div>
          <div>
            <h1 className="font-heading text-lg font-bold text-slate-900 leading-tight dark:text-white">Cyber Nuts</h1>
            <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Chartered Accounting</p>
          </div>
        </div>
        
        {/* CTA Button */}
        <button className="w-full btn-primary py-2.5 flex items-center justify-center gap-2 mb-8">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
             <path d="M12 4V20M4 12H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          Generate Audit
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.name} href={item.href} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${isActive ? 'sidebar-link-active dark:bg-slate-900 dark:text-white dark:border-slate-700' : 'sidebar-link dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white'}`}>
              <item.icon className="w-4 h-4" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Nav */}
      <div className="p-4 border-t border-slate-200 space-y-1 dark:border-slate-800">
        <Link href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm sidebar-link dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white">
          <HelpCircle className="w-4 h-4" />
          Support
        </Link>
        <button 
          onClick={async () => {
            const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
            const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
            const supabase = createBrowserClient(supabaseUrl, supabaseKey);
            await supabase.auth.signOut();
            window.location.href = '/login';
          }}
          className="flex items-center gap-3 px-3 py-2.5 w-full text-left rounded-lg text-sm sidebar-link dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
