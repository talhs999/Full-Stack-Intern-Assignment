'use client';

import React, { useEffect, useState, useRef } from 'react';
import { TrendingUp, TrendingDown, Wallet, FileText, Send, Share2, MoreHorizontal, Trash2 } from 'lucide-react';
import { api, Transaction, PnLReport, ChatMessage } from '@/lib/api';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [pnl, setPnl] = useState<PnLReport | null>(null);

  const [chartData, setChartData] = useState<{ month: string; income: number; expenses: number }[]>([]);

  // AI Chat State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  
  useEffect(() => {
    const saved = localStorage.getItem('cybernuts_chat_history');
    if (saved) {
      try {
        setChatMessages(JSON.parse(saved));
      } catch (e) {
        setChatMessages([{ role: 'assistant', content: "Welcome back. I've analyzed the Q3 projections. Would you like to see the variance report?" }]);
      }
    } else {
      setChatMessages([{ role: 'assistant', content: "Welcome back. I've analyzed the Q3 projections. Would you like to see the variance report?" }]);
    }
  }, []);

  useEffect(() => {
    if (chatMessages.length > 0) {
      localStorage.setItem('cybernuts_chat_history', JSON.stringify(chatMessages));
    }
  }, [chatMessages]);

  const [inputMsg, setInputMsg] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const today = new Date();
      const currentYear = today.getFullYear();
      const currentMonth = today.getMonth() + 1; // 1-12
      
      const [txRes, pnlRes] = await Promise.all([
        api.getTransactions({ page_size: 5 }),
        api.getPnL(currentYear, currentMonth)
      ]);
      setTransactions(txRes.items || []);
      setPnl(pnlRes);

      // Fetch last 6 months for real chart data
      const chartPromises = [];
      const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
      for (let i = 5; i >= 0; i--) {
        let m = currentMonth - i;
        let y = currentYear;
        if (m <= 0) {
          m += 12;
          y -= 1;
        }
        chartPromises.push(api.getPnL(y, m).then(res => ({
          month: monthNames[m - 1],
          income: res.total_income,
          expenses: res.total_expenses
        })).catch(() => ({
          month: monthNames[m - 1],
          income: 0,
          expenses: 0
        })));
      }
      const history = await Promise.all(chartPromises);
      setChartData(history);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this entry?')) return;
    try {
      await api.deleteTransaction(id);
      loadDashboardData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete entry');
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSendAI = async () => {
    if (!inputMsg.trim()) return;
    const userMsg = inputMsg.trim();
    setInputMsg('');
    const newHistory: ChatMessage[] = [...chatMessages, { role: 'user', content: userMsg }];
    setChatMessages(newHistory);
    setChatLoading(true);

    try {
      const res = await api.chatWithAgent(userMsg, newHistory);
      setChatMessages([...newHistory, { role: 'assistant', content: res.reply }]);
      if (res.tool_used === 'record_transaction') {
        loadDashboardData(); // Refresh table if data was modified
      }
    } catch (error) {
      setChatMessages([...newHistory, { role: 'assistant', content: 'Sorry, I encountered an error connecting to my core brain.' }]);
    } finally {
      setChatLoading(false);
    }
  };

  // Find max value to scale chart
  const maxChartValue = chartData.length > 0 
    ? Math.max(...chartData.flatMap(d => [d.income, d.expenses, 1])) 
    : 1;

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-8rem)]">
      {/* Left: Main Dashboard Content */}
      <div className="flex-1 flex flex-col space-y-6 overflow-y-auto pr-2 pb-10">
        
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="fp-card p-5 border-t-4 border-t-emerald-500">
            <div className="flex justify-between items-start mb-2">
              <TrendingUp className="text-emerald-500 w-5 h-5" />
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Real-time</span>
            </div>
            <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500 mb-1">Net Profit</p>
            <h3 className="text-2xl font-heading text-slate-900 dark:text-white">PKR {(pnl?.net_profit || 0).toLocaleString()}</h3>
            <p className="text-xs text-slate-400 mt-2">For {pnl?.period || 'Current Month'}</p>
          </div>

          <div className="fp-card p-5 border-t-4 border-t-slate-800">
            <div className="flex justify-between items-start mb-2">
              <Wallet className="text-slate-800 w-5 h-5" />
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Active</span>
            </div>
            <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500 mb-1">Total Revenue</p>
            <h3 className="text-2xl font-heading text-slate-900 dark:text-white">PKR {(pnl?.total_income || 0).toLocaleString()}</h3>
            <p className="text-xs text-slate-400 mt-2">Verified Ledger Income</p>
          </div>

          <div className="fp-card p-5 border-t-4 border-t-rose-500">
            <div className="flex justify-between items-start mb-2">
              <FileText className="text-rose-500 w-5 h-5" />
              <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">Tracked</span>
            </div>
            <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500 mb-1">Operating Expenses</p>
            <h3 className="text-2xl font-heading text-slate-900 dark:text-white">PKR {(pnl?.total_expenses || 0).toLocaleString()}</h3>
            <p className="text-xs text-slate-400 mt-2">Recorded outflows</p>
          </div>

          <div className="fp-card p-5 border-t-4 border-t-slate-400">
            <div className="flex justify-between items-start mb-2">
              <TrendingDown className="text-slate-400 w-5 h-5" />
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Ratio</span>
            </div>
            <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500 mb-1">Profit Margin</p>
            <h3 className="text-2xl font-heading text-slate-900 dark:text-white">{pnl?.profit_margin_percentage || '0%'}</h3>
            <p className="text-xs text-slate-400 mt-2">Income vs Expense Efficiency</p>
          </div>
        </div>

        {/* Financial Performance Chart Area */}
        <div className="fp-card p-6 flex-1 min-h-[300px] flex flex-col">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h3 className="font-heading text-lg text-slate-900 dark:text-white">Financial Performance</h3>
              <p className="text-xs text-slate-500">Real Revenue vs. Expenses over the last 6 months</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium text-slate-600">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-slate-900"></span> Revenue</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Expenses</span>
            </div>
          </div>
          
          {/* Dynamic Bar Chart */}
          <div className="flex-1 flex items-end justify-between px-4 pb-2 border-b border-slate-200">
            {chartData.map((data, idx) => {
              const incomeHeight = maxChartValue > 0 ? (data.income / maxChartValue) * 100 : 0;
              const expensesHeight = maxChartValue > 0 ? (data.expenses / maxChartValue) * 100 : 0;
              return (
                <div key={idx} className="flex flex-col items-center gap-2 group w-full" title={`Inc: ${data.income} | Exp: ${data.expenses}`}>
                  <div className="flex items-end justify-center gap-1.5 h-48 w-full relative">
                    <div className="w-4 bg-slate-900 rounded-t-sm hover:opacity-80 transition-opacity" style={{ height: `${Math.max(incomeHeight, 2)}%` }}></div>
                    <div className="w-4 bg-emerald-500 rounded-t-sm hover:opacity-80 transition-opacity" style={{ height: `${Math.max(expensesHeight, 2)}%` }}></div>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{data.month}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Activities Table */}
        <div className="fp-card p-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="font-heading text-lg text-slate-900 dark:text-white">Recent Activities</h3>
              <p className="text-xs text-slate-500">Latest entries from the unified general ledger</p>
            </div>
            <button className="text-xs font-medium text-slate-900 dark:text-white hover:underline">View Full Ledger →</button>
          </div>

          <div className="overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>Transaction ID</th>
                  <th>Entity / Vendor</th>
                  <th>Date</th>
                  <th className="text-right">Amount</th>
                  <th className="text-center">Status</th>
                  <th className="text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {transactions.length > 0 ? (
                  transactions.map((tx) => (
                    <tr key={tx.id}>
                      <td className="font-mono text-xs text-slate-500">#TX-{tx.id.substring(0, 5).toUpperCase()}</td>
                      <td className="font-medium text-slate-900 dark:text-white">{tx.description}</td>
                      <td className="text-slate-500 text-xs">{tx.date}</td>
                      <td className={`text-right font-bold font-mono ${tx.type === 'income' ? 'text-slate-900 dark:text-white' : 'text-rose-600'}`}>
                        PKR {tx.amount.toLocaleString()}
                      </td>
                      <td className="text-center">
                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${tx.type === 'income' ? 'badge-verified' : 'badge-pending'}`}>
                          {tx.type === 'income' ? 'Verified' : 'Pending'}
                        </span>
                      </td>
                      <td className="text-center text-slate-400 hover:text-rose-500 cursor-pointer transition-colors">
                        <button onClick={() => handleDelete(tx.id)} title="Delete Entry">
                          <Trash2 className="w-4 h-4 mx-auto" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-500">
                      No ledger entries found. The database is empty.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Right: AI Agent Panel */}
      <div className="w-80 flex-shrink-0 fp-card flex flex-col h-full overflow-hidden bg-white/50 backdrop-blur-xl border-l border-slate-200">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-emerald-100 flex items-center justify-center">
              <Share2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-slate-900 dark:text-white text-sm">AI Agent</h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span className="text-[10px] uppercase font-bold text-emerald-600 tracking-wider">Online</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {chatMessages.map((msg, idx) => (
            <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`max-w-[90%] p-3 rounded-2xl text-sm shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-slate-900 text-white rounded-tr-sm' 
                  : 'bg-slate-50 text-slate-700 border border-slate-200 rounded-tl-sm'
              }`}>
                {msg.content}
              </div>
              <span className="text-[10px] text-slate-400 mt-1 px-1">
                {msg.role === 'user' ? 'You' : 'Cyber Nuts AI'} • Just now
              </span>
            </div>
          ))}
          {chatLoading && (
            <div className="flex flex-col items-start">
              <div className="max-w-[90%] p-3 rounded-2xl text-sm bg-slate-50 text-slate-700 border border-slate-200 rounded-tl-sm flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <div className="p-4 border-t border-slate-100 bg-white">
          <div className="flex flex-wrap gap-2 mb-3">
            <button onClick={() => setInputMsg("Compare YoY")} className="px-3 py-1.5 rounded-full text-[10px] font-medium border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors">Compare YoY</button>
            <button onClick={() => setInputMsg("Tax Summary")} className="px-3 py-1.5 rounded-full text-[10px] font-medium border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors">Tax Summary</button>
            <button onClick={() => setInputMsg("Report Ledger")} className="px-3 py-1.5 rounded-full text-[10px] font-medium border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors">Report Ledger</button>
          </div>
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSendAI(); }}
            className="flex items-center border border-emerald-500 focus-within:ring-2 ring-emerald-500/20 rounded-lg p-1 bg-white overflow-hidden"
          >
            <input 
              type="text" 
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              placeholder="Ask AI Agent..." 
              className="flex-1 outline-none text-sm px-3 py-2 bg-transparent text-slate-900 dark:text-white"
            />
            <button 
              type="submit"
              disabled={chatLoading || !inputMsg.trim()}
              className="p-2 bg-slate-900 text-white rounded-md hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
