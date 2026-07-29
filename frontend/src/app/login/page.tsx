'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, AlertCircle, Loader2 } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';

export default function LoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Use Browser Client for frontend auth
  // Ensure we use NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY as defined in middleware
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  
  const supabase = createBrowserClient(supabaseUrl, supabaseKey);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.push('/');
        router.refresh();
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        // Auto sign-in doesn't always happen if email confirm is required
        setError('Signup successful! You may now sign in.');
        setIsLogin(true);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-root)] flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 fp-card p-8 bg-[var(--bg-surface)] shadow-sm dark:bg-slate-900 dark:border-slate-800">
        <div className="text-center">
          <div className="mx-auto bg-slate-900 rounded-lg w-12 h-12 flex items-center justify-center mb-4 dark:bg-slate-800 border border-slate-800 dark:border-slate-700">
            <BookOpen className="text-white w-6 h-6" />
          </div>
          <h2 className="mt-6 text-3xl font-heading font-bold text-slate-900 dark:text-white">
            Cyber Nuts
          </h2>
          <p className="mt-2 text-sm text-slate-500 font-semibold tracking-wider uppercase dark:text-slate-400">
            Chartered Accounting
          </p>
        </div>

        {error && (
          <div className={`p-4 rounded-lg flex items-center gap-3 text-sm ${
            error.includes('successful') 
              ? 'bg-emerald-50 text-emerald-900 border border-emerald-200 dark:bg-emerald-900/30 dark:border-emerald-800 dark:text-emerald-300'
              : 'bg-rose-50 text-rose-900 border border-rose-200 dark:bg-rose-900/30 dark:border-rose-800 dark:text-rose-300'
          }`}>
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 dark:text-slate-400">
                Email address
              </label>
              <input
                type="email"
                required
                className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:focus:ring-emerald-500"
                placeholder="accountant@cybernuts.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 dark:text-slate-400">
                Password
              </label>
              <input
                type="password"
                required
                className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:focus:ring-emerald-500"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-3 flex justify-center items-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => { setIsLogin(!isLogin); setError(null); }}
            className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors dark:text-slate-400 dark:hover:text-white"
          >
            {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
}
