'use client';

import React, { useEffect, useState } from 'react';
import { Receipt, Plus, Trash2, CheckCircle2, AlertCircle, RefreshCw, Calendar, Tag, CreditCard, Building2 } from 'lucide-react';
import { api, Transaction, Category, Account, TransactionCreate } from '@/lib/api';

export default function ExpensesPage() {
  const [tab, setTab] = useState<'petty_cash' | 'office_cost' | 'revenue' | 'equity'>('petty_cash');
  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

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

  // Pre-select appropriate category/account types based on tab
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
      } else if (tab === 'equity') {
        const incCat = categories.find((c) => c.type === 'income');
        if (incCat) setCategoryId(incCat.id); // Usually Equity has its own category, we use income for Capital Injection here
        const eqAcc = accounts.find((a) => a.type === 'equity' || a.name.toLowerCase().includes('equity'));
        if (eqAcc) setAccountId(eqAcc.id);
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
      const accObj = accounts.find((a) => a.id === accountId);
      
      // Force income type if we're injecting equity, or if category is income
      const txType = (catObj?.type === 'income' || accObj?.type === 'equity' || tab === 'equity') ? 'income' : 'expense';

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
    if (deletingId) return; // Prevent double clicks
    if (!confirm('Are you sure you want to delete this transaction record?')) return;
    setDeletingId(id);
    try {
      await api.deleteTransaction(id);
      setMessage({ type: 'success', text: 'Transaction deleted and audit log recorded.' });
      loadData();
    } catch (err: any) {
      alert(err.message || 'Error deleting transaction.');
    } finally {
      setDeletingId(null);
    }
  };

  // Filter categories based on tab context
  const filteredCategories = categories.filter((c) => c.type === 'expense');

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-heading">Expense Journal</h1>
        <p className="text-slate-500 mt-1">Record and manage business outflows (Petty Cash & Office Costs)</p>
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl border flex items-center gap-3 text-sm font-medium ${
            message.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
              : 'bg-rose-50 border-rose-200 text-rose-700'
          }`}
        >
          {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-500" /> : <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-500" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Grid: Form Left, Recent Table Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Entry Form */}
        <div className="fp-card p-6 space-y-6">
          {/* Tabs */}
          <div className="flex flex-wrap gap-2 mb-8">
            <button
              onClick={() => setTab('petty_cash')}
              className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${
                tab === 'petty_cash' ? 'bg-slate-900 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              ☕ Petty Cash
            </button>
            <button
              onClick={() => setTab('office_cost')}
              className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${
                tab === 'office_cost' ? 'bg-slate-900 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              🏢 Office Cost
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">Amount (PKR) *</label>
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
                  className="w-full bg-white border border-slate-300 rounded-xl pl-12 pr-4 py-3 text-lg font-mono font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">Description *</label>
              <input
                type="text"
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={tab === 'petty_cash' ? 'e.g. Office afternoon tea & biscuits' : 'e.g. July High-Speed Fiber Internet Bill'}
                className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5 flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5" /> Category *
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                >
                  {filteredCategories.map((c) => (
                    <option key={c.id} value={c.id} className="text-slate-900 dark:text-white">
                      {c.name} ({c.type})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5 flex items-center gap-1">
                  <CreditCard className="w-3.5 h-3.5" /> Account *
                </label>
                <select
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                >
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id} className="text-slate-900 dark:text-white">
                      {a.name} ({a.type})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> Date
                </label>
                <input
                  type="date"
                  value={dateStr}
                  onChange={(e) => setDateStr(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">Ref / Inv No (Opt)</label>
                <input
                  type="text"
                  value={referenceNo}
                  onChange={(e) => setReferenceNo(e.target.value)}
                  placeholder="e.g. INV-9901"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className={`w-full py-3 rounded-xl font-bold text-white shadow-sm flex items-center justify-center gap-2 mt-4 ${
                tab === 'revenue' || tab === 'equity' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-slate-900 hover:bg-slate-800'
              }`}
            >
              {submitting ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
              <span>{submitting ? 'Recording Ledger Entry...' : `Confirm & Record ${tab === 'revenue' ? 'Revenue' : tab === 'equity' ? 'Equity' : 'Expense'}`}</span>
            </button>
          </form>
        </div>

        {/* Transaction Table */}
        <div className="lg:col-span-2 fp-card p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-lg font-heading font-bold text-slate-900">Recent Logged Entries</h3>
              <p className="text-xs text-slate-500">Click delete icon to reverse entry (recorded in audit log)</p>
            </div>
            <button
              onClick={loadData}
              className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors border border-slate-200"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
                  <th className="pb-3 font-semibold">Date</th>
                  <th className="pb-3 font-semibold">Description</th>
                  <th className="pb-3 font-semibold">Category</th>
                  <th className="pb-3 font-semibold">Account</th>
                  <th className="pb-3 font-semibold text-right">Amount (PKR)</th>
                  <th className="pb-3 font-semibold text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-500">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <RefreshCw className="w-5 h-5 animate-spin text-rose-500" />
                        <span>Waking up database & loading entries...</span>
                      </div>
                    </td>
                  </tr>
                ) : transactions.length > 0 ? (
                  transactions.map((tx) => {
                    const isInc = tx.type === 'income';
                    return (
                      <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 text-xs font-mono text-slate-500">{tx.date}</td>
                        <td className="py-3 font-medium text-slate-900 max-w-[200px] truncate">{tx.description}</td>
                        <td className="py-3">
                          <span
                            className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-bold uppercase border"
                            style={{
                              backgroundColor: `${tx.category?.color || '#F43F5E'}15`,
                              borderColor: `${tx.category?.color || '#F43F5E'}40`,
                              color: tx.category?.color || '#F43F5E',
                            }}
                          >
                            {tx.category?.name || 'Uncategorized'}
                          </span>
                        </td>
                        <td className="py-3 text-xs font-medium text-slate-600">{tx.account?.name || 'Cash'}</td>
                        <td className={`py-3 font-mono font-bold text-right ${isInc ? 'text-emerald-600' : 'text-slate-900'}`}>
                          {isInc ? '+' : '-'} PKR {tx.amount.toLocaleString()}
                        </td>
                        <td className="py-3 text-center">
                          <button
                            onClick={() => handleDelete(tx.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
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
