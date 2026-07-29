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
  Layers,
  Wrench,
  UserCheck,
  GitBranch,
  Code2,
  FileCheck,
  Users,
  MessageSquare,
  Gift,
  Lightbulb,
  X,
} from 'lucide-react';
import { useState, useEffect } from 'react';

const mainRoutes = [
  { label: 'Mission Control', icon: LayoutDashboard, href: '/' },
  { label: 'Jobs Directory', icon: Briefcase, href: '/jobs' },
  { label: 'Applications', icon: Kanban, href: '/applications' },
  { label: 'Hiring Challenges', icon: Trophy, href: '/challenges' },
  { label: 'Funding Radar', icon: TrendingUp, href: '/funding' },
];

const personalRoutes = [
  { label: 'Developer Stats', icon: Code2, href: '/personal?tab=stats' },
  { label: 'Open-Source Matcher', icon: GitBranch, href: '/personal?tab=opensource' },
  { label: 'STAR Story Bank', icon: BookOpen, href: '/personal?tab=star-bank' },
];

const networkingRoutes = [
  { label: 'Discussion Hub', icon: MessageSquare, href: '/networking?tab=discussions' },
  { label: 'Referral Market', icon: Gift, href: '/networking?tab=referrals' },
  { label: 'Idea & Market Gap', icon: Lightbulb, href: '/networking?tab=gaps' },
];

const toolRoutes = [
  { label: 'ATS Simulator', icon: FileCheck, href: '/ats-simulator' },
  { label: 'Resume Studio', icon: FileText, href: '/resume-studio' },
  { label: 'Outreach Hub', icon: Send, href: '/outreach' },
  { label: 'Intelligence', icon: Brain, href: '/intelligence' },
  { label: 'Analytics', icon: BarChart3, href: '/analytics' },
  { label: 'Settings', icon: Settings, href: '/settings' },
];

interface SidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function Sidebar({ mobileOpen = false, onMobileClose }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  // Close mobile sidebar on route change
  useEffect(() => {
    if (onMobileClose) onMobileClose();
  }, [pathname]);

  const sidebarContent = (
    <aside
      className={cn(
        "flex flex-col bg-white text-[#475569] min-h-screen border-r border-[#E2E8F0] select-none transition-all duration-200 shrink-0 shadow-xs",
        collapsed ? "w-[60px]" : "w-[232px]"
      )}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between h-[52px] px-3.5 border-b border-[#E2E8F0] relative z-10">
        <Link href="/" className="flex items-center gap-2.5 overflow-hidden group">
          <div className="w-7 h-7 rounded-[8px] bg-[#4F46E5] flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-xs">
            CF
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-[13px] text-[#0F172A] tracking-tight leading-none truncate">
                CareerFlow
              </span>
              <span className="text-[10px] text-[#10B981] font-semibold mt-0.5 flex items-center gap-1.5">
                <span className="status-dot status-dot-active" />
                <span>AI Engine Active</span>
              </span>
            </div>
          )}
        </Link>
        
        {/* Desktop Collapse Button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden md:flex p-1 rounded-[6px] text-[#94A3B8] hover:text-[#0F172A] hover:bg-[#F1F5F9] transition-all duration-150 cursor-pointer"
          title={collapsed ? "Expand" : "Collapse"}
        >
          {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>

        {/* Mobile Close Button */}
        {onMobileClose && (
          <button
            onClick={onMobileClose}
            className="md:hidden p-1.5 rounded-[6px] text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2.5 py-4 space-y-4 overflow-y-auto relative z-10 scrollbar-none">
        {/* Core Workspace */}
        <div className="space-y-0.5">
          {!collapsed && (
            <div className="text-[10px] font-semibold text-[#94A3B8] px-2 mb-1.5 uppercase tracking-[0.08em] flex items-center gap-1.5">
              <Layers className="w-3 h-3 text-[#4F46E5]" />
              <span>Workspace</span>
            </div>
          )}
          {mainRoutes.map((route) => {
            const Icon = route.icon;
            const isActive = pathname === route.href || (route.href === '/funding' && pathname === '/funding-leads');

            return (
              <Link
                key={route.href}
                href={route.href}
                onClick={() => onMobileClose?.()}
                className={cn(
                  "flex items-center gap-2.5 px-2.5 py-1.5 rounded-[8px] text-[13px] font-medium transition-all duration-150 group relative",
                  isActive
                    ? "bg-[#EEF2FF] text-[#4F46E5] font-semibold"
                    : "text-[#475569] hover:bg-[#F8FAFC] hover:text-[#0F172A]"
                )}
                title={collapsed ? route.label : undefined}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 rounded-r-full bg-[#4F46E5]" />
                )}
                <Icon
                  className={cn(
                    "w-[16px] h-[16px] shrink-0 transition-colors duration-150",
                    isActive ? "text-[#4F46E5]" : "text-[#64748B] group-hover:text-[#334155]"
                  )}
                />
                {!collapsed && <span className="truncate">{route.label}</span>}
              </Link>
            );
          })}
        </div>

        {/* Personal Studio */}
        <div className="space-y-0.5">
          {!collapsed && (
            <div className="text-[10px] font-semibold text-[#94A3B8] px-2 mb-1.5 uppercase tracking-[0.08em] flex items-center gap-1.5">
              <UserCheck className="w-3 h-3 text-[#2563EB]" />
              <span>Personal Studio</span>
            </div>
          )}
          {personalRoutes.map((route) => {
            const Icon = route.icon;
            const isActive = pathname.startsWith('/personal') && (
              (route.href.includes('stats') && (!pathname.includes('?') || pathname.includes('stats'))) ||
              (route.href.includes('opensource') && pathname.includes('opensource')) ||
              (route.href.includes('star-bank') && pathname.includes('star-bank'))
            );

            return (
              <Link
                key={route.href}
                href={route.href}
                onClick={() => onMobileClose?.()}
                className={cn(
                  "flex items-center gap-2.5 px-2.5 py-1.5 rounded-[8px] text-[13px] font-medium transition-all duration-150 group relative",
                  isActive
                    ? "bg-[#EEF2FF] text-[#2563EB] font-semibold"
                    : "text-[#475569] hover:bg-[#F8FAFC] hover:text-[#0F172A]"
                )}
                title={collapsed ? route.label : undefined}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 rounded-r-full bg-[#2563EB]" />
                )}
                <Icon
                  className={cn(
                    "w-[16px] h-[16px] shrink-0 transition-colors duration-150",
                    isActive ? "text-[#2563EB]" : "text-[#64748B] group-hover:text-[#334155]"
                  )}
                />
                {!collapsed && <span className="truncate">{route.label}</span>}
              </Link>
            );
          })}
        </div>

        {/* Networking & Community */}
        <div className="space-y-0.5">
          {!collapsed && (
            <div className="text-[10px] font-semibold text-[#94A3B8] px-2 mb-1.5 uppercase tracking-[0.08em] flex items-center gap-1.5">
              <Users className="w-3 h-3 text-[#047857]" />
              <span>Networking & Hub</span>
            </div>
          )}
          {networkingRoutes.map((route) => {
            const Icon = route.icon;
            const isActive = pathname.startsWith('/networking');

            return (
              <Link
                key={route.href}
                href={route.href}
                onClick={() => onMobileClose?.()}
                className={cn(
                  "flex items-center gap-2.5 px-2.5 py-1.5 rounded-[8px] text-[13px] font-medium transition-all duration-150 group relative",
                  isActive
                    ? "bg-[#ECFDF5] text-[#047857] font-semibold"
                    : "text-[#475569] hover:bg-[#F8FAFC] hover:text-[#0F172A]"
                )}
                title={collapsed ? route.label : undefined}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 rounded-r-full bg-[#047857]" />
                )}
                <Icon
                  className={cn(
                    "w-[16px] h-[16px] shrink-0 transition-colors duration-150",
                    isActive ? "text-[#047857]" : "text-[#64748B] group-hover:text-[#334155]"
                  )}
                />
                {!collapsed && <span className="truncate">{route.label}</span>}
              </Link>
            );
          })}
        </div>

        {/* AI Tools */}
        <div className="space-y-0.5">
          {!collapsed && (
            <div className="text-[10px] font-semibold text-[#94A3B8] px-2 mb-1.5 uppercase tracking-[0.08em] flex items-center gap-1.5">
              <Wrench className="w-3 h-3 text-[#10B981]" />
              <span>AI Tools</span>
            </div>
          )}
          {toolRoutes.map((route) => {
            const Icon = route.icon;
            const isActive = pathname === route.href;

            return (
              <Link
                key={route.href}
                href={route.href}
                onClick={() => onMobileClose?.()}
                className={cn(
                  "flex items-center gap-2.5 px-2.5 py-1.5 rounded-[8px] text-[13px] font-medium transition-all duration-150 group relative",
                  isActive
                    ? "bg-[#EEF2FF] text-[#4F46E5] font-semibold"
                    : "text-[#475569] hover:bg-[#F8FAFC] hover:text-[#0F172A]"
                )}
                title={collapsed ? route.label : undefined}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 rounded-r-full bg-[#4F46E5]" />
                )}
                <Icon
                  className={cn(
                    "w-[16px] h-[16px] shrink-0 transition-colors duration-150",
                    isActive ? "text-[#4F46E5]" : "text-[#64748B] group-hover:text-[#334155]"
                  )}
                />
                {!collapsed && <span className="truncate">{route.label}</span>}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Footer Profile */}
      <div className="p-2.5 border-t border-[#E2E8F0] bg-[#F8FAFC]">
        <div className="flex items-center gap-2.5 p-1.5 rounded-[8px]">
          <div className="w-7 h-7 rounded-[8px] bg-[#EEF2FF] border border-[#C7D2FE] flex items-center justify-center font-bold text-[11px] text-[#4F46E5] shrink-0">
            SM
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-[12px] font-semibold text-[#0F172A] truncate">
                Saikat Maji
              </span>
              <span className="text-[10px] text-[#10B981] font-semibold flex items-center gap-1">
                <span className="status-dot status-dot-active" />
                Autopilot On
              </span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop Sidebar (visible md and up) */}
      <div className="hidden md:block shrink-0">
        {sidebarContent}
      </div>

      {/* Mobile Slide-Over Drawer with Overlay (visible under md when mobileOpen is true) */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Overlay backdrop click to close */}
          <div
            className="fixed inset-0 bg-[#0F172A]/60 backdrop-blur-xs transition-opacity"
            onClick={onMobileClose}
          />
          {/* Slide-out Panel */}
          <div className="relative z-10 flex-1 max-w-[240px] w-full shadow-2xl h-full">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
