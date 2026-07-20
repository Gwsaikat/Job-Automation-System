'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const routes = [
  { label: 'Dashboard', emoji: '📊', href: '/' },
  { label: 'Jobs', emoji: '💼', href: '/jobs' },
  { label: 'Challenges', emoji: '🏆', href: '/challenges' },
  { label: 'Funding Leads', emoji: '📈', href: '/funding-leads' },
  { label: 'Manual Paste', emoji: '📝', href: '/paste-job' },
  { label: 'Settings', emoji: '⚙️', href: '/settings' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col w-64 bg-[#0d0d12]/90 backdrop-blur-xl text-neutral-300 min-h-screen p-4 select-none border-r border-indigo-950/20 relative">
      {/* Dynamic Background Aura Glow */}
      <div className="absolute top-0 left-0 w-24 h-48 bg-indigo-600/10 rounded-full blur-[60px] pointer-events-none"></div>

      {/* Workspace Header */}
      <div className="flex items-center space-x-3 mb-8 px-3 py-2.5 rounded-xl bg-indigo-950/20 border border-indigo-900/15 relative z-10">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20">
          S
        </div>
        <div className="flex flex-col min-w-0">
          <div className="font-bold text-[14px] text-neutral-100 leading-none mb-0.5">
            Saikat's Workspace
          </div>
          <span className="text-[10px] text-indigo-400/80 font-medium">Cosmic Hub</span>
        </div>
      </div>
      
      {/* Navigation Group */}
      <div className="space-y-1 flex-1 relative z-10">
        <div className="text-[10px] font-bold text-neutral-500 px-3.5 mb-3 tracking-widest uppercase">
          Workspace Navigation
        </div>
        {routes.map((route) => {
          const isActive = pathname === route.href;
          return (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "flex items-center space-x-3.5 px-3.5 py-2.5 rounded-xl text-[14px] font-normal transition-all duration-300 relative group",
                isActive
                  ? "bg-indigo-650/15 text-indigo-200 border border-indigo-500/20 shadow-inner"
                  : "text-neutral-400 hover:bg-neutral-900/60 hover:text-neutral-200 hover:translate-x-1"
              )}
            >
              {/* Highlight bar for active tab */}
              {isActive && (
                <div className="absolute left-0 w-1 h-5 rounded-r bg-indigo-400"></div>
              )}
              <span className="text-lg leading-none transition-transform duration-300 group-hover:scale-110">{route.emoji}</span>
              <span className="truncate tracking-wide">{route.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="px-3.5 py-3 text-[10px] text-neutral-500 border-t border-neutral-900/70 font-mono relative z-10 flex items-center justify-between">
        <span>Job AutoSystem</span>
        <span className="text-indigo-400/70 bg-indigo-500/5 border border-indigo-500/10 px-1.5 py-0.2 rounded font-sans">v0.1.0</span>
      </div>
    </div>
  );
}
