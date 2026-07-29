import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AppShell } from '@/components/app-shell';

const inter = Inter({ subsets: ['latin'], weight: ['300', '400', '500', '600', '700'] });

export const metadata: Metadata = {
  title: 'CareerFlow — Autonomous AI Career Operating System',
  description: 'Autonomous AI Career Operating System for Software Engineers',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-[#F8FAFC] text-[#0F172A] antialiased`}>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
