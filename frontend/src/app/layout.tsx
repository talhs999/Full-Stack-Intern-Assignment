import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import AIChatDrawer from '@/components/AIChatDrawer';

const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' });

export const metadata: Metadata = {
  title: 'Cyber Nuts — AI Accounting & Finance Assistant',
  description: 'Zero-hallucination PydanticAI Accounting Assistant for Cyber Nuts by Muhammad Talha Khan',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${outfit.variable} font-sans bg-mesh min-h-screen flex flex-col text-slate-100 antialiased selection:bg-cyan-500 selection:text-slate-950`}>
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
          {children}
        </main>
        <AIChatDrawer />
        <footer className="border-t border-white/5 py-6 px-6 text-center text-xs text-slate-500 bg-slate-950/40">
          <p>Cyber Nuts AI Accounting Assistant — Developed by Muhammad Talha Khan. Powered by Supabase & Google Gemini 2.0.</p>
        </footer>
      </body>
    </html>
  );
}
