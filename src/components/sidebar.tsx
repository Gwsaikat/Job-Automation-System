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
  Sparkles,
  Layers,
  Activity,
} from 'lucide-react';
import { useState } from 'react';

const mainRoutes = [
  { label: 'Mission Control', icon: LayoutDashboard, href: '/' },
  { label: 'Jobs Directory', icon: Briefcase, href: '/jobs' },
  { label: 'Applications', icon: Kanban, href: '/applications' },
  { label: 'Hiring Challenges', icon: Trophy, href: '/challenges' },
  { label: 'Funding Radar', icon: TrendingUp, href: '/funding' },
];

const toolRoutes = [
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
        "flex flex-col bg-[#08080C] text-[#A1A1AA] min-h-screen border-r border-[rgba(255,255,255,0.06)] select-none transition-all duration-300 z-30 relative shrink-0 shadow-2xl",
        collapsed ? "w-16" : "w-60"
      )}
    >
      {/* Subtle Background Glow Accent */}
      <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-[#6366f1]/10 to-transparent pointer-events-none" />

      {/* Brand Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-[rgba(255,255,255,0.06)] relative z-10">
        <Link href="/" className="flex items-center gap-3 overflow-hidden group">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#4f46e5] via-[#6366f1] to-[#38bdf8] flex items-center justify-center text-[#FAFAFA] font-bold text-sm shrink-0 shadow-[0_0_15px_rgba(99,102,241,0.4)] group-hover:scale-105 transition-transform duration-200">
            <Sparkles className="w-4 h-4 text-white fill-white/20 animate-pulse" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-bold text-sm text-[#FAFAFA] tracking-tight leading-none bg-gradient-to-r from-white via-[#E2E8F0] to-[#94A3B8] bg-clip-text text-transparent">
                CareerFlow
              </span>
              <span className="text-[10px] text-[#34d399] font-mono mt-1 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#34d399] animate-ping" />
                <span>Autonomous AI OS</span>
              </span>
            </div>
          )}
        </Link>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg text-[#71717A] hover:text-[#FAFAFA] hover:bg-[#12121A] border border-transparent hover:border-[rgba(255,255,255,0.08)] transition-all"
          title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-5 space-y-6 overflow-y-auto relative z-10 scrollbar-none">
        {/* Core Navigation Section */}
        <div className="space-y-1">
          {!collapsed && (
            <div className="text-[10px] font-semibold text-[#71717A] px-2 mb-2 uppercase tracking-widest font-mono flex items-center gap-1.5">
              <Layers className="w-3 h-3 text-[#6366f1]" />
              <span>Core Workspace</span>
            </div>
          )}
          {mainRoutes.map((route) => {
            const Icon = route.icon;
            const isActive = pathname === route.href || (route.href === '/funding' && pathname === '/funding-leads');

            return (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 group relative",
                  isActive
                    ? "bg-gradient-to-r from-[#6366f1] to-[#4f46e5] text-white shadow-[0_0_18px_rgba(99,102,241,0.35)] font-semibold border border-[#818cf8]/30"
                    : "text-[#A1A1AA] hover:bg-[#12121A] hover:text-[#FAFAFA] border border-transparent hover:border-[rgba(255,255,255,0.05)]"
                )}
                title={collapsed ? route.label : undefined}
              >
                <Icon className={cn("w-4 h-4 shrink-0 transition-transform duration-200 group-hover:scale-110", isActive ? "text-white" : "text-[#71717A] group-hover:text-[#818cf8]")} />
                {!collapsed && <span className="truncate">{route.label}</span>}
                {isActive && !collapsed && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_6px_white]" />
                )}
              </Link>
            );
          })}
        </div>

        {/* Tools & Intelligence Section */}
        <div className="space-y-1">
          {!collapsed && (
            <div className="text-[10px] font-semibold text-[#71717A] px-2 mb-2 uppercase tracking-widest font-mono flex items-center gap-1.5">
              <Activity className="w-3 h-3 text-[#34d399]" />
              <span>AI Tools & Engine</span>
            </div>
          )}
          {toolRoutes.map((route) => {
            const Icon = route.icon;
            const isActive = pathname === route.href;

            return (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 group relative",
                  isActive
                    ? "bg-gradient-to-r from-[#6366f1] to-[#4f46e5] text-white shadow-[0_0_18px_rgba(99,102,241,0.35)] font-semibold border border-[#818cf8]/30"
                    : "text-[#A1A1AA] hover:bg-[#12121A] hover:text-[#FAFAFA] border border-transparent hover:border-[rgba(255,255,255,0.05)]"
                )}
                title={collapsed ? route.label : undefined}
              >
                <Icon className={cn("w-4 h-4 shrink-0 transition-transform duration-200 group-hover:scale-110", isActive ? "text-white" : "text-[#71717A] group-hover:text-[#34d399]")} />
                {!collapsed && <span className="truncate">{route.label}</span>}
                {isActive && !collapsed && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_6px_white]" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* User Profile & Autopilot Status Card */}
      <div className="p-3 border-t border-[rgba(255,255,255,0.06)] bg-[#050508]/80 backdrop-blur-md relative z-10">
        <div className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-[#12121A] transition-colors">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#6366f1]/20 to-[#38bdf8]/20 border border-[#6366f1]/30 flex items-center justify-center font-bold text-xs text-[#818cf8] shrink-0 shadow-inner">
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

