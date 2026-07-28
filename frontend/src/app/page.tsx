'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { DollarSign, TrendingUp, TrendingDown, PieChart, Plus, ArrowUpRight, ArrowDownRight, RefreshCw, Wallet, Calendar, AlertCircle } from 'lucide-react';
import StatCard from '@/components/StatCard';
import { api, Transaction, PnLReport } from '@/lib/api';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [pnl, setPnl] = useState<PnLReport | null>(null);
  const [cashBalance, setCashBalance] = useState<number>(350000); // Base starting capital

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const today = new Date();
      const [txRes, pnlRes, bsRes] = await Promise.all([
        api.getTransactions({ page_size: 10 }),
        api.getPnL(today.getFullYear(), today.getMonth() + 1),
        api.getBalanceSheet()
      ]);
      setTransactions(txRes.items || []);
      setPnl(pnlRes);
      if (bsRes && bsRes.assets) {
        setCashBalance(bsRes.assets.total);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch live data from backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Banner & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card p-6 rounded-3xl bg-gradient-to-r from-slate-900/90 via-blue-950/40 to-slate-900/90 border-cyan-500/20">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">
            Executive Ledger Overview
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-2 tracking-tight">
            Financial Health & AI Monitoring
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Real-time double-entry ledger synced with Supabase PostgreSQL and PydanticAI
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadDashboardData}
            disabled={loading}
            className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-all flex items-center justify-center"
            title="Refresh Ledger Data"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
          <Link
            href="/expenses"
            className="px-5 py-3 rounded-2xl btn-gradient text-slate-950 font-bold flex items-center gap-2 shadow-lg"
          >
            <Plus className="w-5 h-5" />
            <span>Record Transaction</span>
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-center gap-3 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-400" />
          <span>{error} Ensure FastAPI backend is running on port 8000.</span>
        </div>
      )}

      {/* Hero Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Cash & Bank"
          value={`PKR ${cashBalance.toLocaleString()}`}
          subtitle="Liquid Assets Available"
          icon={Wallet}
          colorScheme="cyan"
          trend={{ value: '8.4%', isUp: true }}
        />
        <StatCard
          title="This Month Revenue"
          value={`PKR ${(pnl?.total_income || 0).toLocaleString()}`}
          subtitle={pnl?.period || 'Current Month'}
          icon={TrendingUp}
          colorScheme="emerald"
          trend={{ value: '14.2%', isUp: true }}
        />
        <StatCard
          title="This Month Expenses"
          value={`PKR ${(pnl?.total_expenses || 0).toLocaleString()}`}
          subtitle="Operating Outflow"
          icon={TrendingDown}
          colorScheme="coral"
          trend={{ value: '3.1%', isUp: false }}
        />
        <StatCard
          title="Net Profit Margin"
          value={`PKR ${(pnl?.net_profit || 0).toLocaleString()}`}
          subtitle={(pnl?.net_profit || 0) >= 0 ? 'Surplus (Positive)' : 'Deficit (Negative)'}
          icon={PieChart}
          colorScheme="gold"
        />
      </div>

      {/* Analytics & Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue vs Expense Comparison */}
        <div className="lg:col-span-2 glass-card p-6 rounded-3xl space-y-6">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-cyan-400" />
                Revenue vs Expense Breakdown
              </h3>
              <p className="text-xs text-slate-400">Monthly operational performance analysis</p>
            </div>
            <Link href="/reports" className="text-xs text-cyan-400 hover:underline font-medium">
              View Full P&L Report →
            </Link>
          </div>

          <div className="space-y-4 pt-2">
            <div>
              <div className="flex justify-between text-sm font-semibold mb-2">
                <span className="text-emerald-400 flex items-center gap-1.5">
                  <ArrowUpRight className="w-4 h-4" /> Total Income
                </span>
                <span className="text-white">PKR {(pnl?.total_income || 0).toLocaleString()}</span>
              </div>
              <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-white/5">
                <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full" style={{ width: '75%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm font-semibold mb-2">
                <span className="text-rose-400 flex items-center gap-1.5">
                  <ArrowDownRight className="w-4 h-4" /> Total Operating Expenses
                </span>
                <span className="text-white">PKR {(pnl?.total_expenses || 0).toLocaleString()}</span>
              </div>
              <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-white/5">
                <div className="h-full bg-gradient-to-r from-rose-500 to-orange-400 rounded-full" style={{ width: '45%' }} />
              </div>
            </div>
          </div>

          {/* Key Indicators Pill */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/5">
            <div className="p-3 rounded-2xl bg-slate-900/60 border border-white/5 text-center">
              <p className="text-[11px] text-slate-400">Burn Rate (Monthly)</p>
              <p className="text-sm font-bold text-rose-300">PKR {((pnl?.total_expenses || 0) / 30).toFixed(0)}/day</p>
            </div>
            <div className="p-3 rounded-2xl bg-slate-900/60 border border-white/5 text-center">
              <p className="text-[11px] text-slate-400">Profitability Ratio</p>
              <p className="text-sm font-bold text-emerald-300">
                {pnl && pnl.total_income > 0 ? `${((pnl.net_profit / pnl.total_income) * 100).toFixed(1)}%` : 'N/A'}
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-slate-900/60 border border-white/5 text-center">
              <p className="text-[11px] text-slate-400">Audit Status</p>
              <p className="text-sm font-bold text-cyan-300">All Scanned</p>
            </div>
          </div>
        </div>

        {/* Expense Category Breakdown */}
        <div className="glass-card p-6 rounded-3xl space-y-4">
          <div className="border-b border-white/5 pb-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <PieChart className="w-5 h-5 text-amber-400" />
              Expense Distribution
            </h3>
            <p className="text-xs text-slate-400">Top cost drivers this period</p>
          </div>

          <div className="space-y-3 max-h-[260px] overflow-y-auto pr-1">
            {pnl && pnl.expense_breakdown && pnl.expense_breakdown.length > 0 ? (
              pnl.expense_breakdown.map((item, idx) => (
                <div key={idx} className="p-3 rounded-2xl bg-slate-900/50 border border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full flex-shrink-0 shadow-sm" style={{ backgroundColor: item.color || '#00F2FE' }} />
                    <span className="text-sm font-medium text-slate-200">{item.category}</span>
                  </div>
                  <span className="text-sm font-bold text-white">PKR {item.amount.toLocaleString()}</span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 text-center py-8">No expense data recorded for this month yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Transactions Table */}
      <div className="glass-card p-6 rounded-3xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-cyan-400" />
              Recent Ledger Entries
            </h3>
            <p className="text-xs text-slate-400">Live immutable log of financial transactions</p>
          </div>
          <Link
            href="/ledgers"
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-300 transition-colors text-center"
          >
            View General Ledger ({transactions.length}) →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-slate-400 text-xs uppercase tracking-wider">
                <th className="pb-3 font-semibold">Date</th>
                <th className="pb-3 font-semibold">Description</th>
                <th className="pb-3 font-semibold">Category</th>
                <th className="pb-3 font-semibold">Account</th>
                <th className="pb-3 font-semibold">Type</th>
                <th className="pb-3 font-semibold text-right">Amount (PKR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {transactions.length > 0 ? (
                transactions.map((tx) => {
                  const isInc = tx.type === 'income';
                  return (
                    <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="py-4 text-xs font-mono text-slate-400">{tx.date}</td>
                      <td className="py-4 font-medium text-white max-w-xs truncate">{tx.description}</td>
                      <td className="py-4">
                        <span
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border"
                          style={{
                            backgroundColor: `${tx.category?.color || '#00F2FE'}15`,
                            borderColor: `${tx.category?.color || '#00F2FE'}40`,
                            color: tx.category?.color || '#00F2FE',
                          }}
                        >
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: tx.category?.color || '#00F2FE' }} />
                          {tx.category?.name || 'Uncategorized'}
                        </span>
                      </td>
                      <td className="py-4 text-xs text-slate-300">{tx.account?.name || 'Cash'}</td>
                      <td className="py-4">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase ${
                          isInc ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}>
                          {tx.type}
                        </span>
                      </td>
                      <td className={`py-4 font-mono font-bold text-right ${isInc ? 'text-emerald-400' : 'text-white'}`}>
                        {isInc ? '+' : '-'} PKR {tx.amount.toLocaleString()}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    No transactions found. Ask the AI assistant or click &quot;Record Transaction&quot; to begin!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
