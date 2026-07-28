'use client';

import React, { useEffect, useState } from 'react';
import { Receipt, Plus, Trash2, Filter, CheckCircle2, AlertCircle, RefreshCw, DollarSign, Calendar, Tag, CreditCard } from 'lucide-react';
import { api, Transaction, Category, Account, TransactionCreate } from '@/lib/api';

export default function ExpensesPage() {
  const [tab, setTab] = useState<'petty_cash' | 'office_cost' | 'revenue'>('petty_cash');
  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form State
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [accountId, setAccountId] = useState('');
  const [dateStr, setDateStr] = useState(new Date().toISOString().split('T')[0]);
  const [referenceNo, setReferenceNo] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [cats, accs, txRes] = await Promise.all([
        api.getCategories(),
        api.getAccounts(),
        api.getTransactions({ page_size: 50 })
      ]);
      setCategories(cats);
      setAccounts(accs);
      setTransactions(txRes.items || []);

      // Set default selections
      if (cats.length > 0 && !categoryId) setCategoryId(cats[0].id);
      if (accs.length > 0 && !accountId) setAccountId(accs[0].id);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // When tab changes, pre-select appropriate category/account types
  useEffect(() => {
    if (categories.length > 0 && accounts.length > 0) {
      if (tab === 'revenue') {
        const incCat = categories.find((c) => c.type === 'income');
        if (incCat) setCategoryId(incCat.id);
        const assetAcc = accounts.find((a) => a.type === 'asset' || a.type === 'revenue');
        if (assetAcc) setAccountId(assetAcc.id);
      } else if (tab === 'petty_cash') {
        const pettyCat = categories.find((c) => c.name.toLowerCase().includes('petty') || c.type === 'expense');
        if (pettyCat) setCategoryId(pettyCat.id);
        const cashAcc = accounts.find((a) => a.name.toLowerCase().includes('cash') || a.type === 'asset');
        if (cashAcc) setAccountId(cashAcc.id);
      } else {
        const rentCat = categories.find((c) => c.name.toLowerCase().includes('rent') || c.type === 'expense');
        if (rentCat) setCategoryId(rentCat.id);
      }
    }
  }, [tab, categories, accounts]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setMessage({ type: 'error', text: 'Please enter a valid positive amount.' });
      return;
    }
    if (!description.trim() || !categoryId || !accountId) {
      setMessage({ type: 'error', text: 'Please fill out all required fields.' });
      return;
    }

    setSubmitting(true);
    setMessage(null);
    try {
      const catObj = categories.find((c) => c.id === categoryId);
      const txType = catObj?.type === 'income' ? 'income' : 'expense';

      const txData: TransactionCreate = {
        date: dateStr,
        amount: Number(amount),
        type: txType,
        description: description.trim(),
        account_id: accountId,
        category_id: categoryId,
        reference_no: referenceNo.trim() || undefined,
        is_recurring: isRecurring,
      };

      await api.createTransaction(txData);
      setMessage({ type: 'success', text: `Successfully recorded ${txType.toUpperCase()} of PKR ${Number(amount).toLocaleString()}!` });
      setAmount('');
      setDescription('');
      setReferenceNo('');
      setIsRecurring(false);
      loadData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Error recording transaction.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this transaction record?')) return;
    try {
      await api.deleteTransaction(id);
      setMessage({ type: 'success', text: 'Transaction deleted and audit log recorded.' });
      loadData();
    } catch (err: any) {
      alert(err.message || 'Error deleting transaction.');
    }
  };

  const filteredCategories = categories.filter((c) => (tab === 'revenue' ? c.type === 'income' : c.type === 'expense'));

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
          <Receipt className="w-8 h-8 text-cyan-400" />
          Expenses & Revenue Logging
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Record financial flows with Pydantic schema validation and automatic audit logging
        </p>
      </div>

      {message && (
        <div
          className={`p-4 rounded-2xl border flex items-center gap-3 text-sm ${
            message.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}
        >
          {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Grid: Form Left, Recent Table Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Entry Form */}
        <div className="glass-card p-6 rounded-3xl space-y-6">
          {/* Quick Entry Tabs */}
          <div className="grid grid-cols-3 gap-1 bg-slate-900/80 p-1.5 rounded-2xl border border-white/10">
            <button
              type="button"
              onClick={() => setTab('petty_cash')}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                tab === 'petty_cash' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              ☕ Petty Cash
            </button>
            <button
              type="button"
              onClick={() => setTab('office_cost')}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                tab === 'office_cost' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              🏢 Office Cost
            </button>
            <button
              type="button"
              onClick={() => setTab('revenue')}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                tab === 'revenue' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              💰 Revenue
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5">Amount (PKR) *</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 font-bold text-sm">
                  PKR
                </div>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="e.g. 15000"
                  className="w-full bg-slate-950/80 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-lg font-mono font-bold text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5">Description *</label>
              <input
                type="text"
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={tab === 'petty_cash' ? 'e.g. Office afternoon tea & biscuits' : 'e.g. July High-Speed Fiber Internet Bill'}
                className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400 transition-colors"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5 flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5" /> Category *
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3 py-3 text-sm text-white focus:outline-none focus:border-cyan-400 transition-colors"
                >
                  {filteredCategories.map((c) => (
                    <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                      {c.name} ({c.type})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5 flex items-center gap-1">
                  <CreditCard className="w-3.5 h-3.5" /> Account *
                </label>
                <select
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                  className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3 py-3 text-sm text-white focus:outline-none focus:border-cyan-400 transition-colors"
                >
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id} className="bg-slate-900 text-white">
                      {a.name} ({a.type})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> Date
                </label>
                <input
                  type="date"
                  value={dateStr}
                  onChange={(e) => setDateStr(e.target.value)}
                  className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-400 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5">Ref / Inv No (Opt)</label>
                <input
                  type="text"
                  value={referenceNo}
                  onChange={(e) => setReferenceNo(e.target.value)}
                  placeholder="e.g. INV-9901"
                  className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400 transition-colors"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <input
                type="checkbox"
                id="isRecurring"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="w-4 h-4 rounded border-white/20 bg-slate-900 text-cyan-400 focus:ring-0"
              />
              <label htmlFor="isRecurring" className="text-xs font-medium text-slate-300 select-none cursor-pointer">
                Recurring monthly obligation (e.g. rent, salaries)
              </label>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className={`w-full py-3.5 rounded-xl font-bold text-slate-950 shadow-lg flex items-center justify-center gap-2 mt-4 ${
                tab === 'revenue' ? 'bg-gradient-to-r from-emerald-400 to-teal-500 hover:brightness-110' : 'btn-gradient'
              }`}
            >
              {submitting ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
              <span>{submitting ? 'Recording Ledger Entry...' : `Confirm & Record ${tab === 'revenue' ? 'Revenue' : 'Expense'}`}</span>
            </button>
          </form>
        </div>

        {/* Transaction Table */}
        <div className="lg:col-span-2 glass-card p-6 rounded-3xl space-y-6">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <div>
              <h3 className="text-lg font-bold text-white">Recent Logged Entries</h3>
              <p className="text-xs text-slate-400">Click delete icon to reverse entry (recorded in audit log)</p>
            </div>
            <button
              onClick={loadData}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-slate-400 text-xs uppercase tracking-wider">
                  <th className="pb-3 font-semibold">Date</th>
                  <th className="pb-3 font-semibold">Description</th>
                  <th className="pb-3 font-semibold">Category</th>
                  <th className="pb-3 font-semibold">Account</th>
                  <th className="pb-3 font-semibold text-right">Amount (PKR)</th>
                  <th className="pb-3 font-semibold text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {transactions.length > 0 ? (
                  transactions.map((tx) => {
                    const isInc = tx.type === 'income';
                    return (
                      <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3 text-xs font-mono text-slate-400">{tx.date}</td>
                        <td className="py-3 font-medium text-white max-w-[200px] truncate">{tx.description}</td>
                        <td className="py-3">
                          <span
                            className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium border"
                            style={{
                              backgroundColor: `${tx.category?.color || '#00F2FE'}15`,
                              borderColor: `${tx.category?.color || '#00F2FE'}40`,
                              color: tx.category?.color || '#00F2FE',
                            }}
                          >
                            {tx.category?.name || 'Uncategorized'}
                          </span>
                        </td>
                        <td className="py-3 text-xs text-slate-300">{tx.account?.name || 'Cash'}</td>
                        <td className={`py-3 font-mono font-bold text-right ${isInc ? 'text-emerald-400' : 'text-white'}`}>
                          {isInc ? '+' : '-'} PKR {tx.amount.toLocaleString()}
                        </td>
                        <td className="py-3 text-center">
                          <button
                            onClick={() => handleDelete(tx.id)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                            title="Delete Transaction"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-500">
                      No entries logged yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
