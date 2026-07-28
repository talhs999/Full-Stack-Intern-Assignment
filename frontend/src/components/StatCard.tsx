'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isUp: boolean;
  };
  colorScheme?: 'cyan' | 'coral' | 'gold' | 'emerald';
}

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  colorScheme = 'cyan',
}: StatCardProps) {
  const colorMap = {
    cyan: 'from-cyan-500/20 to-blue-500/10 border-cyan-500/30 text-cyan-400 shadow-cyan-500/10',
    coral: 'from-rose-500/20 to-orange-500/10 border-rose-500/30 text-rose-400 shadow-rose-500/10',
    gold: 'from-amber-500/20 to-yellow-500/10 border-amber-500/30 text-amber-400 shadow-amber-500/10',
    emerald: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-400 shadow-emerald-500/10',
  };

  const iconBgMap = {
    cyan: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    coral: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
    gold: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    emerald: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  };

  return (
    <div className={`glass-card p-6 rounded-3xl relative overflow-hidden group hover:scale-[1.02] transition-all duration-300`}>
      {/* Background Glow */}
      <div className={`absolute -top-12 -right-12 w-32 h-32 rounded-full bg-gradient-to-br ${colorMap[colorScheme]} blur-2xl opacity-40 group-hover:opacity-70 transition-opacity`} />

      <div className="flex items-start justify-between relative z-10">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">{title}</p>
          <h3 className="text-3xl font-extrabold text-white tracking-tight mb-1">{value}</h3>
          {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
        </div>
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${iconBgMap[colorScheme]} shadow-lg`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>

      {trend && (
        <div className="mt-4 pt-3 border-t border-white/5 flex items-center gap-2 text-xs font-medium">
          <span className={`px-2 py-0.5 rounded-full ${trend.isUp ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'}`}>
            {trend.isUp ? '↑' : '↓'} {trend.value}
          </span>
          <span className="text-slate-400">vs previous month</span>
        </div>
      )}
    </div>
  );
}
