'use client';

import React, { useEffect, useState } from 'react';
import { BookOpen, Search, Download, RefreshCw } from 'lucide-react';
import { api, Transaction, Account, Category } from '@/lib/api';

export default function LedgersPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [accountFilter, setAccountFilter] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');

  const loadLedgers = async () => {
    setLoading(true);
    try {
      const [accs, cats, txRes] = await Promise.all([
        api.getAccounts(),
        api.getCategories(),
        api.getTransactions({
          page_size: 100,
          type: typeFilter || undefined,
          account_id: accountFilter || undefined,
          category_id: categoryFilter || undefined,
          search: search || undefined,
        })
      ]);
      setAccounts(accs);
      setCategories(cats);
      setTransactions(txRes.items || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLedgers();
  }, [typeFilter, accountFilter, categoryFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadLedgers();
  };

  const exportCSV = () => {
    if (transactions.length === 0) {
      alert('No ledger entries to export.');
      return;
    }
    const headers = ['ID,Date,Type,Amount (PKR),Description,Category,Account,Reference No'];
    const rows = transactions.map((t) =>
      `"${t.id}","${t.date}","${t.type}","${t.amount}","${t.description.replace(/"/g, '""')}","${t.category?.name || ''}","${t.account?.name || ''}","${t.reference_no || ''}"`
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `cybernuts_general_ledger_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-emerald-500" />
            General Ledger & Historical Records
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Auditable double-entry chronological record of all corporate financial events
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadLedgers}
            disabled={loading}
            className="p-3 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-50 shadow-sm transition-all"
            title="Refresh Ledger"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin text-emerald-500' : ''}`} />
          </button>
          <button
            onClick={exportCSV}
            className="px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold flex items-center gap-2 shadow-sm transition-all"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="fp-card p-6 space-y-4">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search description..."
              className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
            />
          </div>

          <div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
            >
              <option value="">All Types (Income & Expense)</option>
              <option value="income">Income Only (+)</option>
              <option value="expense">Expense Only (-)</option>
            </select>
          </div>

          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={accountFilter}
              onChange={(e) => setAccountFilter(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
            >
              <option value="">All Accounts</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.type})
                </option>
              ))}
            </select>
          </div>
        </form>
      </div>

      {/* Ledger Table */}
      <div className="fp-card p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 text-xs text-slate-500">
          <span>Showing {transactions.length} immutable ledger records</span>
          <span className="font-mono font-bold text-slate-400">Database Engine: Supabase / PostgreSQL</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
                <th className="pb-3 font-semibold">Date</th>
                <th className="pb-3 font-semibold">Ref #</th>
                <th className="pb-3 font-semibold">Description</th>
                <th className="pb-3 font-semibold">Category</th>
                <th className="pb-3 font-semibold">Account</th>
                <th className="pb-3 font-semibold text-right">Debit / Credit (PKR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transactions.length > 0 ? (
                transactions.map((tx) => {
                  const isInc = tx.type === 'income';
                  return (
                    <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-4 text-xs font-mono text-slate-500">{tx.date}</td>
                      <td className="py-4 text-xs font-mono text-slate-400">{tx.reference_no || '—'}</td>
                      <td className="py-4 font-medium text-slate-900 dark:text-white">{tx.description}</td>
                      <td className="py-4">
                        <span
                          className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-bold uppercase border"
                          style={{
                            backgroundColor: `${tx.category?.color || '#10B981'}15`,
                            borderColor: `${tx.category?.color || '#10B981'}40`,
                            color: tx.category?.color || '#10B981',
                          }}
                        >
                          {tx.category?.name || 'Uncategorized'}
                        </span>
                      </td>
                      <td className="py-4 text-xs font-medium text-slate-600">
                        <span className="px-2 py-1 rounded-md bg-slate-100 border border-slate-200">
                          {tx.account?.name || 'Cash'}
                        </span>
                      </td>
                      <td className={`py-4 font-mono font-bold text-right ${isInc ? 'text-emerald-600' : 'text-slate-900'}`}>
                        {isInc ? `+ PKR ${tx.amount.toLocaleString()}` : `- PKR ${tx.amount.toLocaleString()}`}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    No matching general ledger entries found.
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
