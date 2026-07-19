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
    <div className="flex flex-col w-60 bg-[#202020] text-neutral-300 min-h-screen p-3 select-none border-r border-[#2a2a2a]">
      {/* Workspace Header */}
      <div className="flex items-center space-x-2 mb-6 px-3 py-1.5 rounded hover:bg-[#2a2a2a] cursor-pointer transition-colors">
        <div className="w-6 h-6 rounded bg-neutral-700 flex items-center justify-center text-xs font-bold text-white">
          S
        </div>
        <div className="font-semibold text-sm text-neutral-100 truncate">
          Saikat's Workspace
        </div>
      </div>
      
      {/* Navigation Group */}
      <div className="space-y-0.5 flex-1">
        <div className="text-[11px] font-bold text-neutral-500 px-3 mb-2 tracking-wider uppercase">
          Private
        </div>
        {routes.map((route) => {
          const isActive = pathname === route.href;
          return (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "flex items-center space-x-3 px-3 py-1.5 rounded text-[14px] font-normal transition-colors duration-150",
                isActive
                  ? "bg-[#2c2c2c] text-neutral-100 font-medium"
                  : "text-neutral-400 hover:bg-[#2a2a2a] hover:text-neutral-200"
              )}
            >
              <span className="text-base leading-none">{route.emoji}</span>
              <span className="truncate">{route.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="px-3 py-2 text-[11px] text-neutral-600 border-t border-[#2a2a2a]/60">
        Job AutoSystem v0.1.0
      </div>
    </div>
  );
}
