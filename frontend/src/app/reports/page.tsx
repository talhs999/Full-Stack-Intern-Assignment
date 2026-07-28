'use client';

import React, { useEffect, useState } from 'react';
import { BarChart3, PieChart, ShieldAlert, CheckCircle2, AlertTriangle, RefreshCw, FileText, ArrowRight, DollarSign, Award, Layers, Download, Calendar } from 'lucide-react';
import { api, PnLReport, BalanceSheetReport, MonthlyAuditReport, AnomalyItem } from '@/lib/api';

export default function ReportsPage() {
  const [tab, setTab] = useState<'pnl' | 'balance_sheet' | 'audit'>('pnl');
  const [exportPeriod, setExportPeriod] = useState<'today' | 'week' | 'month' | 'all'>('month');
  const [loading, setLoading] = useState(true);
  const [pnl, setPnl] = useState<PnLReport | null>(null);
  const [bs, setBs] = useState<BalanceSheetReport | null>(null);
  const [audit, setAudit] = useState<MonthlyAuditReport | null>(null);
  const [reviewedAnomalies, setReviewedAnomalies] = useState<Record<string, 'approved' | 'flagged'>>({});

  const loadReports = async () => {
    setLoading(true);
    try {
      const today = new Date();
      const [pnlRes, bsRes, auditRes] = await Promise.all([
        api.getPnL(today.getFullYear(), today.getMonth() + 1),
        api.getBalanceSheet(),
        api.getAuditAnomalies(today.getFullYear(), today.getMonth() + 1)
      ]);
      setPnl(pnlRes);
      setBs(bsRes);
      setAudit(auditRes);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const handleReview = (id: string, status: 'approved' | 'flagged') => {
    setReviewedAnomalies((prev) => ({ ...prev, [id]: status }));
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-cyan-400" />
            Financial Reports & AI Audit Scan
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Deterministic P&L, Balance Sheet statements and PydanticAI automated anomaly review
          </p>
        </div>
        <button
          onClick={loadReports}
          disabled={loading}
          className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-all self-start"
          title="Refresh Statements"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
        </button>
      </div>

      {/* Complete Financial Statement & PDF Download Center */}
      <div className="glass-card p-6 rounded-3xl bg-gradient-to-r from-slate-900/90 via-blue-950/40 to-slate-900/90 border-cyan-500/20 space-y-4 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20 flex items-center gap-1.5 w-fit">
              <Award className="w-3.5 h-3.5 text-cyan-400" /> Double-Entry Verified Export
            </span>
            <h3 className="text-lg font-bold text-white mt-2 flex items-center gap-2">
              <Download className="w-5 h-5 text-cyan-400" />
              Download Official Financial Statement (PDF / CSV)
            </h3>
            <p className="text-xs text-slate-400">
              Select your reporting period (Daily, Weekly, Monthly, or All-Time History) to generate a ReportLab PDF statement.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <a
              href={`http://localhost:8000/api/v1/reports/statement/pdf?period=${exportPeriod}`}
              target="_blank"
              rel="noreferrer"
              className="px-5 py-3 rounded-2xl btn-gradient text-slate-950 font-bold flex items-center gap-2 shadow-lg hover:scale-105 active:scale-95 transition-all text-sm"
            >
              <FileText className="w-4 h-4" />
              <span>Download PDF Statement</span>
            </a>
            <a
              href={`http://localhost:8000/api/v1/reports/statement/csv?period=${exportPeriod}`}
              target="_blank"
              rel="noreferrer"
              className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-emerald-300 border border-emerald-500/30 font-bold flex items-center gap-2 transition-all text-sm"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </a>
          </div>
        </div>

        {/* Period Selector Tabs */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-white/5">
          <span className="text-xs font-semibold text-slate-400 self-center mr-2 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-cyan-400" /> Select Period:
          </span>
          {[
            { id: 'today', label: 'Din Ki (Today)' },
            { id: 'week', label: 'Hafte Ki (Last 7 Days)' },
            { id: 'month', label: 'Maheena Ki (This Month)' },
            { id: 'all', label: 'Poori (All Time History)' }
          ].map((p) => (
            <button
              key={p.id}
              onClick={() => setExportPeriod(p.id as any)}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                exportPeriod === p.id
                  ? 'bg-cyan-500 text-slate-950 shadow-md font-extrabold scale-105'
                  : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 bg-slate-900/80 p-1.5 rounded-2xl border border-white/10 max-w-lg">
        <button
          onClick={() => setTab('pnl')}
          className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
            tab === 'pnl' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Profit & Loss</span>
        </button>
        <button
          onClick={() => setTab('balance_sheet')}
          className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
            tab === 'balance_sheet' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30 shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Balance Sheet</span>
        </button>
        <button
          onClick={() => setTab('audit')}
          className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
            tab === 'audit' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          <ShieldAlert className="w-4 h-4 text-amber-400" />
          <span>AI Audit</span>
        </button>
      </div>

      {/* Tab 1: Profit & Loss Statement */}
      {tab === 'pnl' && (
        <div className="glass-card p-8 rounded-3xl space-y-8">
          <div className="border-b border-white/10 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">
                Income Statement
              </span>
              <h3 className="text-2xl font-bold text-white mt-2">Cyber Nuts Profit & Loss Statement</h3>
              <p className="text-sm text-slate-400">For the period: {pnl?.period || 'Current Month'}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-400">Net Operational Result</p>
              <p className={`text-3xl font-extrabold font-mono ${(pnl?.net_profit || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                PKR {(pnl?.net_profit || 0).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Revenue Column */}
            <div className="space-y-4 bg-slate-900/40 p-6 rounded-2xl border border-white/5">
              <h4 className="font-bold text-emerald-400 text-lg border-b border-white/10 pb-2 flex items-center justify-between">
                <span>Revenue & Receipts</span>
                <span>PKR {(pnl?.total_income || 0).toLocaleString()}</span>
              </h4>
              <div className="space-y-3">
                {pnl?.income_breakdown && pnl.income_breakdown.length > 0 ? (
                  pnl.income_breakdown.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm py-1">
                      <span className="text-slate-300">{item.category}</span>
                      <span className="font-mono font-semibold text-white">PKR {item.amount.toLocaleString()}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 py-4">No income recorded in this period.</p>
                )}
              </div>
            </div>

            {/* Expenses Column */}
            <div className="space-y-4 bg-slate-900/40 p-6 rounded-2xl border border-white/5">
              <h4 className="font-bold text-rose-400 text-lg border-b border-white/10 pb-2 flex items-center justify-between">
                <span>Operating Expenses</span>
                <span>PKR {(pnl?.total_expenses || 0).toLocaleString()}</span>
              </h4>
              <div className="space-y-3">
                {pnl?.expense_breakdown && pnl.expense_breakdown.length > 0 ? (
                  pnl.expense_breakdown.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm py-1">
                      <span className="text-slate-300">{item.category}</span>
                      <span className="font-mono font-semibold text-white">PKR {item.amount.toLocaleString()}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 py-4">No operating expenses recorded.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Balance Sheet */}
      {tab === 'balance_sheet' && (
        <div className="glass-card p-8 rounded-3xl space-y-8">
          <div className="border-b border-white/10 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
                Statement of Financial Position
              </span>
              <h3 className="text-2xl font-bold text-white mt-2">Cyber Nuts Balance Sheet</h3>
              <p className="text-sm text-slate-400">As of Date: {bs?.as_of_date || new Date().toISOString().split('T')[0]}</p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-bold">
              <CheckCircle2 className="w-5 h-5" />
              <span>{bs?.balanced ? 'Equation Balanced (A = L + E)' : 'Ledger Active'}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Assets */}
            <div className="space-y-4 bg-slate-900/40 p-6 rounded-2xl border border-white/5">
              <h4 className="font-bold text-cyan-400 text-md border-b border-white/10 pb-2 flex justify-between">
                <span>Assets</span>
                <span>PKR {(bs?.assets?.total || 0).toLocaleString()}</span>
              </h4>
              <div className="space-y-2 text-sm">
                {bs?.assets?.items?.map((item, idx) => (
                  <div key={idx} className="flex justify-between py-1 text-slate-300">
                    <span>{item.account}</span>
                    <span className="font-mono text-white font-semibold">PKR {item.balance.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Liabilities */}
            <div className="space-y-4 bg-slate-900/40 p-6 rounded-2xl border border-white/5">
              <h4 className="font-bold text-rose-400 text-md border-b border-white/10 pb-2 flex justify-between">
                <span>Liabilities</span>
                <span>PKR {(bs?.liabilities?.total || 0).toLocaleString()}</span>
              </h4>
              <div className="space-y-2 text-sm">
                {bs?.liabilities?.items?.map((item, idx) => (
                  <div key={idx} className="flex justify-between py-1 text-slate-300">
                    <span>{item.account}</span>
                    <span className="font-mono text-white font-semibold">PKR {item.balance.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Equity */}
            <div className="space-y-4 bg-slate-900/40 p-6 rounded-2xl border border-white/5">
              <h4 className="font-bold text-amber-400 text-md border-b border-white/10 pb-2 flex justify-between">
                <span>Equity</span>
                <span>PKR {(bs?.equity?.total || 0).toLocaleString()}</span>
              </h4>
              <div className="space-y-2 text-sm">
                {bs?.equity?.items?.map((item, idx) => (
                  <div key={idx} className="flex justify-between py-1 text-slate-300">
                    <span>{item.account}</span>
                    <span className="font-mono text-white font-semibold">PKR {item.balance.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: AI Anomaly & Audit View */}
      {tab === 'audit' && (
        <div className="glass-card p-8 rounded-3xl space-y-8 border-amber-500/30">
          <div className="border-b border-white/10 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-amber-500/10 via-transparent to-transparent p-6 rounded-2xl -m-2">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-500/20 px-3 py-1 rounded-full border border-amber-500/30 flex items-center gap-1.5 w-max">
                <ShieldAlert className="w-3.5 h-3.5" /> Automated Anomaly Detection
              </span>
              <h3 className="text-2xl font-bold text-white mt-2">AI Continuous Ledger Audit</h3>
              <p className="text-sm text-slate-300 mt-1">{audit?.ai_summary || 'Scanning ledger for duplicates, statistical outliers, and policy compliance...'}</p>
            </div>
            <div className="flex items-center gap-4 bg-slate-900/80 px-5 py-3 rounded-2xl border border-white/10">
              <div className="text-center">
                <p className="text-[11px] text-slate-400">Total Flagged</p>
                <p className="text-2xl font-bold font-mono text-amber-400">{audit?.total_anomalies || 0}</p>
              </div>
              <div className="h-8 w-px bg-white/10" />
              <div className="text-center">
                <p className="text-[11px] text-slate-400">Scan Status</p>
                <p className="text-xs font-bold text-emerald-400 uppercase">Real-time</p>
              </div>
            </div>
          </div>

          {/* Anomaly Feed */}
          <div className="space-y-4">
            <h4 className="font-bold text-white text-md flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" /> Flagged Transactions Requiring Review
            </h4>

            {audit?.anomalies && audit.anomalies.length > 0 ? (
              audit.anomalies.map((item, idx) => {
                const status = reviewedAnomalies[item.transaction_id];
                return (
                  <div
                    key={idx}
                    className={`p-6 rounded-2xl border transition-all ${
                      status === 'approved'
                        ? 'bg-emerald-500/5 border-emerald-500/30 opacity-70'
                        : status === 'flagged'
                        ? 'bg-rose-500/10 border-rose-500/40'
                        : 'bg-slate-900/80 border-amber-500/30 shadow-lg'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                              item.severity === 'HIGH'
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            }`}
                          >
                            {item.severity} RISK
                          </span>
                          <span className="text-xs font-mono text-slate-400">Type: {item.type}</span>
                          <span className="text-xs text-slate-500">• Flagged at {item.flagged_at}</span>
                        </div>
                        <p className="text-sm font-semibold text-white">{item.description}</p>
                      </div>

                      <div className="flex items-center gap-3">
                        {status ? (
                          <span
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase ${
                              status === 'approved' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                            }`}
                          >
                            {status === 'approved' ? 'Verified & Approved' : 'Flagged for Audit'}
                          </span>
                        ) : (
                          <>
                            <button
                              onClick={() => handleReview(item.transaction_id, 'approved')}
                              className="px-4 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition-all flex items-center gap-1.5"
                            >
                              <CheckCircle2 className="w-4 h-4" /> Approve as Valid
                            </button>
                            <button
                              onClick={() => handleReview(item.transaction_id, 'flagged')}
                              className="px-4 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-xs font-bold transition-all flex items-center gap-1.5"
                            >
                              <AlertTriangle className="w-4 h-4" /> Flag for Investigation
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-12 text-center bg-slate-900/40 rounded-2xl border border-white/5">
                <Award className="w-12 h-12 text-emerald-400 mx-auto mb-3 opacity-80" />
                <h5 className="font-bold text-white text-lg">Clean Ledger Record!</h5>
                <p className="text-xs text-slate-400 mt-1">
                  No duplicate entries, statistical outliers, or off-hours anomalies were detected by PydanticAI for this period.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
