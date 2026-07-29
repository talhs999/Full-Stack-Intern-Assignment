import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Cyber Nuts — AI Accounting Assistant',
  description: 'AI-Powered Chartered Accounting Assistant',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning className="font-sans bg-[var(--bg-root)] text-[var(--text-main)] min-h-screen antialiased selection:bg-emerald-500 selection:text-white transition-colors duration-200">
        {children}
      </body>
    </html>
  );
}
