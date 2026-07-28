'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, X, Send, Bot, User, RefreshCw, CheckCircle2, ArrowRight, DollarSign, ShieldAlert } from 'lucide-react';
import { api, ChatMessage } from '@/lib/api';

export default function AIChatDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: "Hello! I am your **Cyber Nuts AI Accounting Assistant**. Ask me to record transactions or summarize financial reports in plain English or Urdu!\n\nTry: *\"Paid 45,000 for office rent today\"* or *\"Run monthly audit scan\"*."
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [lastStructuredData, setLastStructuredData] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend?: string) => {
    const msgText = textToSend || input;
    if (!msgText.trim() || loading) return;

    const userMsg: ChatMessage = { role: 'user', content: msgText };
    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const res = await api.chatWithAgent(msgText, messages);
      setMessages([...newHistory, { role: 'assistant', content: res.reply }]);
      if (res.structured_data) {
        setLastStructuredData({ type: res.tool_used, data: res.structured_data });
      }
    } catch (error: any) {
      setMessages([
        ...newHistory,
        { role: 'assistant', content: `⚠️ Error: Could not reach the ledger database (${error.message || 'Network error'}).` }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = [
    "Paid 50,000 for Office Rent",
    "Paid 3,500 for Petty Cash tea & snacks",
    "What is our Profit & Loss summary?",
    "Show Balance Sheet snapshot",
    "Run monthly audit scan for duplicates"
  ];

  return (
    <>
      {/* Floating Pill Trigger */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center space-x-2 px-5 py-3.5 rounded-full btn-gradient shadow-2xl hover:scale-105 active:scale-95 transition-all text-slate-950 font-bold tracking-wide"
      >
        <Sparkles className="w-5 h-5 animate-spin" style={{ animationDuration: '4s' }} />
        <span>✨ Ask AI Assistant</span>
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 transition-opacity animate-fade-in"
        />
      )}

      {/* Drawer Panel */}
      <aside
        className={`fixed top-0 right-0 h-full w-full sm:w-[450px] md:w-[500px] z-50 glass-panel border-l border-white/10 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Drawer Header */}
        <div className="px-6 py-5 border-b border-white/10 bg-gradient-to-r from-slate-900/80 to-blue-950/40 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-white text-md flex items-center gap-1.5">
                Cyber Nuts AI Ledger
              </h2>
              <p className="text-xs text-cyan-400 font-medium">Zero-Hallucination PydanticAI Assistant</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Prompts */}
        <div className="px-4 py-3 bg-slate-900/40 border-b border-white/5 flex gap-2 overflow-x-auto no-scrollbar">
          {quickPrompts.map((qp, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(qp)}
              disabled={loading}
              className="text-xs whitespace-nowrap px-3 py-1.5 rounded-lg bg-white/5 hover:bg-cyan-500/20 hover:text-cyan-300 hover:border-cyan-500/30 border border-white/5 text-slate-300 transition-all flex items-center gap-1"
            >
              <span>{qp}</span>
              <ArrowRight className="w-3 h-3 opacity-60" />
            </button>
          ))}
        </div>

        {/* Message Feed */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((m, idx) => {
            const isBot = m.role === 'assistant';
            return (
              <div key={idx} className={`flex gap-3 ${isBot ? 'items-start' : 'items-start flex-row-reverse'}`}>
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    isBot ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'bg-blue-600 text-white'
                  }`}
                >
                  {isBot ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>
                <div
                  className={`max-w-[80%] rounded-2xl p-4 text-sm leading-relaxed ${
                    isBot
                      ? 'bg-slate-900/80 border border-white/10 text-slate-200 shadow-lg'
                      : 'bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-medium shadow-md'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{m.content}</div>
                </div>
              </div>
            );
          })}
          {loading && (
            <div className="flex gap-3 items-center text-slate-400 text-sm animate-pulse">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                <RefreshCw className="w-4 h-4 animate-spin" />
              </div>
              <span>Processing with deterministic financial tools...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Structured Data Preview Card (if any tool returned data) */}
        {lastStructuredData && lastStructuredData.type === 'create_transaction' && (
          <div className="m-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between text-xs text-emerald-300">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Recorded: PKR {lastStructuredData.data.amount} ({lastStructuredData.data.type})</span>
            </div>
            <button
              onClick={() => setLastStructuredData(null)}
              className="text-slate-400 hover:text-white"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Input Bar */}
        <div className="p-4 border-t border-white/10 bg-slate-900/90">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask AI e.g., 'Paid 15000 for electricity bill'..."
              className="flex-1 bg-slate-950/80 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-4 py-3 rounded-xl btn-gradient text-slate-950 font-semibold flex items-center justify-center disabled:opacity-50 disabled:pointer-events-none"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 px-1">
            <span>Powered by Gemini 2.0 / PydanticAI</span>
            <span className="flex items-center gap-1 text-cyan-400/80">
              <ShieldAlert className="w-3 h-3" /> Zero Hallucination
            </span>
          </div>
        </div>
      </aside>
    </>
  );
}
