'use client';

import React, { useEffect, useState } from 'react';
import { BarChart3, PieChart, ShieldAlert, CheckCircle2, AlertTriangle, RefreshCw, FileText, Download, Calendar, Layers, Award } from 'lucide-react';
import { api, PnLReport, BalanceSheetReport, MonthlyAuditReport, API_BASE_URL } from '@/lib/api';

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
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-emerald-500" />
            Financial Reports & AI Audit Scan
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Deterministic P&L, Balance Sheet statements and PydanticAI automated anomaly review
          </p>
        </div>
        <button
          onClick={loadReports}
          disabled={loading}
          className="p-3 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-50 shadow-sm transition-all self-start"
          title="Refresh Statements"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin text-emerald-500' : ''}`} />
        </button>
      </div>

      {/* Complete Financial Statement & PDF Download Center */}
      <div className="fp-card p-6 border-t-4 border-t-emerald-500 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1.5 w-fit">
              <Award className="w-3.5 h-3.5 text-emerald-600" /> Double-Entry Verified Export
            </span>
            <h3 className="text-lg font-heading font-bold text-slate-900 dark:text-white mt-2 flex items-center gap-2">
              <Download className="w-5 h-5 text-emerald-500" />
              Download Official Financial Statement (PDF / CSV)
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Select your reporting period (Daily, Weekly, Monthly, or All-Time History) to generate a ReportLab PDF statement.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <a
              href={`${API_BASE_URL}/reports/statement/pdf?period=${exportPeriod}`}
              target="_blank"
              rel="noreferrer"
              className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-2 shadow-sm transition-all text-sm"
            >
              <FileText className="w-4 h-4" />
              <span>Download PDF Statement</span>
            </a>
            <a
              href={`${API_BASE_URL}/reports/statement/csv?period=${exportPeriod}`}
              target="_blank"
              rel="noreferrer"
              className="px-5 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-bold flex items-center gap-2 shadow-sm transition-all text-sm"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </a>
          </div>
        </div>

        {/* Period Selector Tabs */}
        <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-100">
          <span className="text-xs font-bold text-slate-500 self-center mr-2 flex items-center gap-1 uppercase tracking-wider">
            <Calendar className="w-3.5 h-3.5 text-slate-400" /> Select Period:
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
              className={`px-4 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                exportPeriod === p.id
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm scale-105'
                  : 'bg-white hover:bg-slate-50 text-slate-600 border border-slate-200'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200 max-w-lg">
        <button
          onClick={() => setTab('pnl')}
          className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${
            tab === 'pnl' ? 'bg-white text-slate-900 dark:text-white shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Profit & Loss</span>
        </button>
        <button
          onClick={() => setTab('balance_sheet')}
          className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${
            tab === 'balance_sheet' ? 'bg-white text-slate-900 dark:text-white shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Balance Sheet</span>
        </button>
        <button
          onClick={() => setTab('audit')}
          className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${
            tab === 'audit' ? 'bg-amber-50 text-amber-700 shadow-sm border border-amber-200' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <ShieldAlert className="w-4 h-4 text-amber-500" />
          <span>AI Audit</span>
        </button>
      </div>

      {/* Tab 1: Profit & Loss Statement */}
      {tab === 'pnl' && (
        <div className="fp-card p-8 space-y-8">
          <div className="border-b border-slate-100 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                Income Statement
              </span>
              <h3 className="text-2xl font-heading font-bold text-slate-900 dark:text-white mt-2">Cyber Nuts Profit & Loss Statement</h3>
              <p className="text-sm text-slate-500">For the period: {pnl?.period || 'Current Month'}</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Net Operational Result</p>
              <p className={`text-3xl font-extrabold font-mono ${(pnl?.net_profit || 0) >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                PKR {(pnl?.net_profit || 0).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Revenue Column */}
            <div className="space-y-4 bg-slate-50 p-6 rounded-2xl border border-slate-200">
              <h4 className="font-bold text-slate-900 dark:text-white text-lg border-b border-slate-200 pb-2 flex items-center justify-between">
                <span>Revenue & Receipts</span>
                <span className="text-emerald-600">PKR {(pnl?.total_income || 0).toLocaleString()}</span>
              </h4>
              <div className="space-y-3">
                {pnl?.income_breakdown && pnl.income_breakdown.length > 0 ? (
                  pnl.income_breakdown.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm py-1">
                      <span className="text-slate-600 font-medium">{item.category}</span>
                      <span className="font-mono font-semibold text-slate-900 dark:text-white">PKR {item.amount.toLocaleString()}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 py-4 font-medium">No income recorded in this period.</p>
                )}
              </div>
            </div>

            {/* Expenses Column */}
            <div className="space-y-4 bg-slate-50 p-6 rounded-2xl border border-slate-200">
              <h4 className="font-bold text-slate-900 dark:text-white text-lg border-b border-slate-200 pb-2 flex items-center justify-between">
                <span>Operating Expenses</span>
                <span className="text-rose-600">PKR {(pnl?.total_expenses || 0).toLocaleString()}</span>
              </h4>
              <div className="space-y-3">
                {pnl?.expense_breakdown && pnl.expense_breakdown.length > 0 ? (
                  pnl.expense_breakdown.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm py-1">
                      <span className="text-slate-600 font-medium">{item.category}</span>
                      <span className="font-mono font-semibold text-slate-900 dark:text-white">PKR {item.amount.toLocaleString()}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 py-4 font-medium">No operating expenses recorded.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Balance Sheet */}
      {tab === 'balance_sheet' && (
        <div className="fp-card p-8 space-y-8">
          <div className="border-b border-slate-100 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                Statement of Financial Position
              </span>
              <h3 className="text-2xl font-heading font-bold text-slate-900 dark:text-white mt-2">Cyber Nuts Balance Sheet</h3>
              <p className="text-sm text-slate-500">As of Date: {bs?.as_of_date || new Date().toISOString().split('T')[0]}</p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-bold shadow-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <span>{bs?.balanced ? 'Equation Balanced (A = L + E)' : 'Ledger Active'}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Assets */}
            <div className="space-y-4 bg-slate-50 p-6 rounded-2xl border border-slate-200">
              <h4 className="font-bold text-emerald-700 text-md border-b border-slate-200 pb-2 flex justify-between">
                <span>Assets</span>
                <span>PKR {(bs?.assets?.total || 0).toLocaleString()}</span>
              </h4>
              <div className="space-y-2 text-sm">
                {bs?.assets?.items?.map((item, idx) => (
                  <div key={idx} className="flex flex-col py-1">
                    <div className="flex justify-between text-slate-700 font-medium">
                      <span>{item.account}</span>
                      <span className={`font-mono font-bold ${item.balance < 0 ? 'text-rose-600' : 'text-slate-900'}`}>
                        PKR {item.balance.toLocaleString()}
                      </span>
                    </div>
                    {item.warning && (
                      <span className="text-[10px] text-rose-500 mt-0.5 flex items-center gap-1 font-bold">
                        <AlertTriangle className="w-3 h-3" /> {item.warning}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Liabilities */}
            <div className="space-y-4 bg-slate-50 p-6 rounded-2xl border border-slate-200">
              <h4 className="font-bold text-rose-700 text-md border-b border-slate-200 pb-2 flex justify-between">
                <span>Liabilities</span>
                <span>PKR {(bs?.liabilities?.total || 0).toLocaleString()}</span>
              </h4>
              <div className="space-y-2 text-sm">
                {bs?.liabilities?.items?.map((item, idx) => (
                  <div key={idx} className="flex justify-between py-1 text-slate-700 font-medium">
                    <span>{item.account}</span>
                    <span className="font-mono text-slate-900 font-bold">PKR {item.balance.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Equity */}
            <div className="space-y-4 bg-slate-50 p-6 rounded-2xl border border-slate-200">
              <h4 className="font-bold text-blue-700 text-md border-b border-slate-200 pb-2 flex justify-between">
                <span>Equity</span>
                <span>PKR {(bs?.equity?.total || 0).toLocaleString()}</span>
              </h4>
              <div className="space-y-2 text-sm">
                {bs?.equity?.items?.map((item, idx) => (
                  <div key={idx} className="flex justify-between py-1 text-slate-700 font-medium">
                    <span>{item.account}</span>
                    <span className="font-mono text-slate-900 font-bold">PKR {item.balance.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: AI Anomaly & Audit View */}
      {tab === 'audit' && (
        <div className="fp-card p-8 space-y-8 border-t-4 border-t-amber-400">
          <div className="border-b border-slate-100 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-amber-50/50 p-6 rounded-2xl -m-2">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-200 flex items-center gap-1.5 w-max">
                <ShieldAlert className="w-3.5 h-3.5" /> Automated Anomaly Detection
              </span>
              <h3 className="text-2xl font-heading font-bold text-slate-900 mt-2">AI Continuous Ledger Audit</h3>
              <p className="text-sm text-slate-600 mt-1 font-medium">{audit?.ai_summary || 'Scanning ledger for duplicates, statistical outliers, and policy compliance...'}</p>
            </div>
            <div className="flex items-center gap-4 bg-white shadow-sm px-5 py-3 rounded-xl border border-slate-200">
              <div className="text-center">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Flagged</p>
                <p className="text-2xl font-bold font-mono text-amber-500">{audit?.total_anomalies || 0}</p>
              </div>
              <div className="h-8 w-px bg-slate-200" />
              <div className="text-center">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Scan Status</p>
                <p className="text-xs font-bold text-emerald-600 uppercase">Real-time</p>
              </div>
            </div>
          </div>

          {/* Anomaly Feed */}
          <div className="space-y-4">
            <h4 className="font-bold text-slate-900 text-md flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" /> Flagged Transactions Requiring Review
            </h4>

            {audit?.anomalies && audit.anomalies.length > 0 ? (
              audit.anomalies.map((item, idx) => {
                const status = reviewedAnomalies[item.transaction_id];
                return (
                  <div
                    key={idx}
                    className={`p-6 rounded-2xl border transition-all ${
                      status === 'approved'
                        ? 'bg-emerald-50 border-emerald-200 opacity-70'
                        : status === 'flagged'
                        ? 'bg-rose-50 border-rose-200'
                        : 'bg-white border-amber-200 shadow-sm'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                              item.severity === 'HIGH'
                                ? 'bg-rose-100 text-rose-700 border border-rose-200'
                                : 'bg-amber-100 text-amber-700 border border-amber-200'
                            }`}
                          >
                            {item.severity} RISK
                          </span>
                          <span className="text-xs font-mono font-bold text-slate-500">Type: {item.type}</span>
                          <span className="text-xs font-medium text-slate-400">• Flagged at {item.flagged_at}</span>
                        </div>
                        <p className="text-sm font-bold text-slate-800">{item.description}</p>
                      </div>

                      <div className="flex items-center gap-3">
                        {status ? (
                          <span
                            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase shadow-sm ${
                              status === 'approved' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-rose-100 text-rose-700 border border-rose-200'
                            }`}
                          >
                            {status === 'approved' ? 'Verified & Approved' : 'Flagged for Audit'}
                          </span>
                        ) : (
                          <>
                            <button
                              onClick={() => handleReview(item.transaction_id, 'approved')}
                              className="px-4 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                            >
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Approve as Valid
                            </button>
                            <button
                              onClick={() => handleReview(item.transaction_id, 'flagged')}
                              className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                            >
                              <AlertTriangle className="w-4 h-4 text-rose-600" /> Flag for Investigation
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-12 text-center bg-slate-50 rounded-2xl border border-slate-200">
                <Award className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                <h5 className="font-bold text-slate-900 text-lg">Clean Ledger Record!</h5>
                <p className="text-sm text-slate-500 mt-1 font-medium max-w-md mx-auto">
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
