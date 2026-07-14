'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Briefcase, 
  Code2, 
  TrendingUp, 
  ClipboardPaste, 
  Settings 
} from 'lucide-react';

const routes = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/' },
  { label: 'Jobs', icon: Briefcase, href: '/jobs' },
  { label: 'Challenges', icon: Code2, href: '/challenges' },
  { label: 'Funding Leads', icon: TrendingUp, href: '/funding-leads' },
  { label: 'Manual Paste', icon: ClipboardPaste, href: '/paste-job' },
  { label: 'Settings', icon: Settings, href: '/settings' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col w-64 bg-neutral-900 border-r border-neutral-800 min-h-screen p-4">
      <div className="flex items-center mb-8 px-2">
        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
          Job AutoSystem
        </h1>
      </div>
      
      <div className="space-y-2 flex-1">
        {routes.map((route) => (
          <Link
            key={route.href}
            href={route.href}
            className={cn(
              "flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium",
              pathname === route.href
                ? "bg-blue-500/10 text-blue-400"
                : "text-neutral-400 hover:bg-neutral-800 hover:text-neutral-100"
            )}
          >
            <route.icon className="w-5 h-5" />
            <span>{route.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
