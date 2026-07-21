'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Briefcase,
  Kanban,
  Trophy,
  TrendingUp,
  FileText,
  Send,
  Brain,
  BarChart3,
  BookOpen,
  Settings,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { useState } from 'react';

const routes = [
  { label: 'Mission Control', icon: LayoutDashboard, href: '/' },
  { label: 'Jobs', icon: Briefcase, href: '/jobs' },
  { label: 'Applications', icon: Kanban, href: '/applications' },
  { label: 'Challenges', icon: Trophy, href: '/challenges' },
  { label: 'Funding', icon: TrendingUp, href: '/funding' },
  { label: 'Resume Studio', icon: FileText, href: '/resume-studio' },
  { label: 'Outreach Hub', icon: Send, href: '/outreach' },
  { label: 'STAR Story Bank', icon: BookOpen, href: '/interview-bank' },
  { label: 'Intelligence', icon: Brain, href: '/intelligence' },
  { label: 'Analytics', icon: BarChart3, href: '/analytics' },
  { label: 'Settings', icon: Settings, href: '/settings' },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "flex flex-col bg-[#111827] text-[#A1A1AA] min-h-screen border-r border-[rgba(255,255,255,0.08)] select-none transition-all duration-200 z-30 relative shrink-0",
        collapsed ? "w-16" : "w-60"
      )}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-[rgba(255,255,255,0.08)]">
        <Link href="/" className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-8 h-8 rounded-lg bg-[#6366f1] flex items-center justify-center text-[#FAFAFA] font-bold text-sm shrink-0 shadow-sm">
            <Zap className="w-4 h-4 text-white fill-white" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-semibold text-sm text-[#FAFAFA] tracking-tight leading-none">
                AntiGravity
              </span>
              <span className="text-[10px] text-[#71717A] font-mono mt-0.5">
                Career OS v2.0
              </span>
            </div>
          )}
        </Link>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded-md text-[#71717A] hover:text-[#FAFAFA] hover:bg-[#18181B] transition-colors"
          title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {!collapsed && (
          <div className="text-[10px] font-semibold text-[#71717A] px-3 mb-2 uppercase tracking-wider font-mono">
            Navigation
          </div>
        )}
        {routes.map((route) => {
          const Icon = route.icon;
          // Alias /funding-leads to /funding for active state
          const isActive = pathname === route.href || (route.href === '/funding' && pathname === '/funding-leads');

          return (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-180 group relative",
                isActive
                  ? "bg-[#6366f1] text-[#FAFAFA] shadow-sm font-semibold"
                  : "text-[#A1A1AA] hover:bg-[#18181B] hover:text-[#FAFAFA]"
              )}
              title={collapsed ? route.label : undefined}
            >
              <Icon className={cn("w-4 h-4 shrink-0 transition-transform duration-180 group-hover:scale-110", isActive ? "text-[#FAFAFA]" : "text-[#71717A] group-hover:text-[#A1A1AA]")} />
              {!collapsed && <span className="truncate">{route.label}</span>}
              {isActive && !collapsed && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#FAFAFA]" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Profile & System Status */}
      <div className="p-3 border-t border-[rgba(255,255,255,0.08)] bg-[#09090B]/40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#18181B] border border-[rgba(255,255,255,0.1)] flex items-center justify-center font-semibold text-xs text-[#FAFAFA] shrink-0">
            SM
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-xs font-semibold text-[#FAFAFA] truncate">
                Saikat Maji
              </span>
              <div className="flex items-center gap-1.5 text-[10px] text-[#34d399] font-mono mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#34d399] animate-pulse" />
                <span>Autopilot Active</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
