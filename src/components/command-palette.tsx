'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  LayoutDashboard,
  Briefcase,
  Kanban,
  Trophy,
  TrendingUp,
  FileText,
  Send,
  BarChart3,
  Settings,
  Zap,
  RefreshCw,
  X,
  Code2,
  GitBranch,
  BookOpen,
  FileCheck,
  Users,
  MessageSquare,
  Gift,
  Lightbulb,
} from 'lucide-react';

import { Portal } from '@/components/portal';

export function CommandPalette({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [query, setQuery] = useState('');
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const actions = [
    { label: 'Go to Mission Control', icon: LayoutDashboard, category: 'Navigation', action: () => { router.push('/'); onClose(); } },
    { label: 'Explore Jobs Directory', icon: Briefcase, category: 'Navigation', action: () => { router.push('/jobs'); onClose(); } },
    { label: 'View Applications Kanban', icon: Kanban, category: 'Navigation', action: () => { router.push('/applications'); onClose(); } },
    { label: 'Run ATS Parsing Simulator', icon: FileCheck, category: 'AI Tools', action: () => { router.push('/ats-simulator'); onClose(); } },
    { label: 'Open Discussion Hub', icon: MessageSquare, category: 'Networking & Hub', action: () => { router.push('/networking'); onClose(); } },
    { label: 'Open Referral Market', icon: Gift, category: 'Networking & Hub', action: () => { router.push('/networking'); onClose(); } },
    { label: 'Post Software Market Gap Idea', icon: Lightbulb, category: 'Networking & Hub', action: () => { router.push('/networking'); onClose(); } },
    { label: 'View Developer Stats (LeetCode, GitHub)', icon: Code2, category: 'Personal Studio', action: () => { router.push('/personal?tab=stats'); onClose(); } },
    { label: 'AI Open-Source Contribution Matcher', icon: GitBranch, category: 'Personal Studio', action: () => { router.push('/personal?tab=opensource'); onClose(); } },
    { label: 'Behavioral STAR Story Bank', icon: BookOpen, category: 'Personal Studio', action: () => { router.push('/personal?tab=star-bank'); onClose(); } },
    { label: 'Browse Hiring Challenges', icon: Trophy, category: 'Navigation', action: () => { router.push('/challenges'); onClose(); } },
    { label: 'Track Startup Funding Radar', icon: TrendingUp, category: 'Navigation', action: () => { router.push('/funding'); onClose(); } },
    { label: 'Open Resume Studio', icon: FileText, category: 'Navigation', action: () => { router.push('/resume-studio'); onClose(); } },
    { label: 'Launch Outreach Hub', icon: Send, category: 'Navigation', action: () => { router.push('/outreach'); onClose(); } },
    { label: 'View Career Analytics', icon: BarChart3, category: 'Navigation', action: () => { router.push('/analytics'); onClose(); } },
    { label: 'Open System Settings', icon: Settings, category: 'Navigation', action: () => { router.push('/settings'); onClose(); } },
  ];

  const filtered = actions.filter(a => a.label.toLowerCase().includes(query.toLowerCase()) || a.category.toLowerCase().includes(query.toLowerCase()));

  return (
    <Portal>
      <div className="fixed inset-0 ag-overlay z-50 flex items-start justify-center pt-[18vh] px-4" onClick={onClose}>
        <div
          className="bg-white border border-[#E2E8F0] rounded-[12px] w-full max-w-xl shadow-2xl overflow-hidden flex flex-col slide-up"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Search Header */}
          <div className="p-3.5 border-b border-[#F1F5F9] flex items-center gap-2.5">
            <Search className="w-4 h-4 text-[#4F46E5]" />
            <input
              type="text"
              autoFocus
              placeholder="Type a command or search..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-transparent border-none text-[13px] text-[#0F172A] placeholder-[#94A3B8] outline-none"
            />
            <button onClick={onClose} className="p-1 text-[#94A3B8] hover:text-[#0F172A] rounded-[6px] hover:bg-[#F1F5F9] transition-colors duration-150">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Results */}
          <div className="p-1.5 max-h-[320px] overflow-y-auto space-y-0.5">
            {filtered.length === 0 ? (
              <div className="p-6 text-center text-[12px] text-[#64748B]">
                No commands matching &quot;{query}&quot;
              </div>
            ) : (
              filtered.map((item, index) => {
                const Icon = item.icon;
                return (
                  <button
                    key={index}
                    onClick={item.action}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-[8px] text-[12px] text-[#475569] hover:bg-[#F8FAFC] hover:text-[#0F172A] transition-colors duration-150 group text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4 text-[#64748B] group-hover:text-[#4F46E5] transition-colors duration-150" />
                      <span className="font-medium">{item.label}</span>
                    </div>
                    <span className="text-[10px] font-mono text-[#64748B] bg-[#F1F5F9] px-1.5 py-0.5 rounded-[4px] border border-[#E2E8F0]">
                      {item.category}
                    </span>
                  </button>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="p-2.5 border-t border-[#F1F5F9] bg-[#F8FAFC] text-[10px] text-[#64748B] font-mono flex justify-between items-center px-4">
            <span>CareerFlow Command Palette</span>
            <span>ESC to close</span>
          </div>
        </div>
      </div>
    </Portal>
  );
}
