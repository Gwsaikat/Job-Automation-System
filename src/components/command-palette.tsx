'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Command,
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
  Plus,
  X,
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
        else onClose(); // parent will toggle
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
    { label: 'Explore Jobs & Match Engine', icon: Briefcase, category: 'Navigation', action: () => { router.push('/jobs'); onClose(); } },
    { label: 'View Applications Kanban', icon: Kanban, category: 'Navigation', action: () => { router.push('/applications'); onClose(); } },
    { label: 'Browse Hiring Challenges', icon: Trophy, category: 'Navigation', action: () => { router.push('/challenges'); onClose(); } },
    { label: 'Track Startup Funding Leads', icon: TrendingUp, category: 'Navigation', action: () => { router.push('/funding'); onClose(); } },
    { label: 'Open Resume Studio & LaTeX', icon: FileText, category: 'Navigation', action: () => { router.push('/resume-studio'); onClose(); } },
    { label: 'Launch Outreach Hub', icon: Send, category: 'Navigation', action: () => { router.push('/outreach'); onClose(); } },
    { label: 'View Career Analytics', icon: BarChart3, category: 'Navigation', action: () => { router.push('/analytics'); onClose(); } },
    { label: 'Open System Settings', icon: Settings, category: 'Navigation', action: () => { router.push('/settings'); onClose(); } },
    
    // Commands
    { label: 'Execute Daily Job Scraper', icon: Zap, category: 'Pipeline Commands', action: async () => {
        await fetch('/api/pipeline/run', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ pipeline: 'scrape' }) });
        alert('Daily Scraper pipeline triggered!');
        onClose();
      } 
    },
    { label: 'Sync Startup Funding News', icon: RefreshCw, category: 'Pipeline Commands', action: async () => {
        await fetch('/api/pipeline/run', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ pipeline: 'funding' }) });
        alert('Funding pipeline triggered!');
        onClose();
      } 
    },
  ];

  const filtered = actions.filter(a => a.label.toLowerCase().includes(query.toLowerCase()) || a.category.toLowerCase().includes(query.toLowerCase()));

  return (
    <Portal>
      <div className="fixed inset-0 bg-[#09090B]/80 backdrop-blur-md z-50 flex items-start justify-center pt-24 px-4 page-fade">
      <div className="bg-[#141419] border border-[rgba(255,255,255,0.12)] rounded-xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col">
        {/* Search Header */}
        <div className="p-3.5 border-b border-[rgba(255,255,255,0.08)] flex items-center gap-2.5">
          <Search className="w-4 h-4 text-[#818cf8]" />
          <input
            type="text"
            autoFocus
            placeholder="Type a command or search AntiGravity..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent border-none text-xs text-[#FAFAFA] placeholder-[#71717A] outline-none"
          />
          <button onClick={onClose} className="p-1 text-[#71717A] hover:text-[#FAFAFA]">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="p-2 max-h-80 overflow-y-auto space-y-1">
          {filtered.length === 0 ? (
            <div className="p-6 text-center text-xs text-[#71717A]">
              No commands matching "{query}"
            </div>
          ) : (
            filtered.map((item, index) => {
              const Icon = item.icon;
              return (
                <button
                  key={index}
                  onClick={item.action}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs text-[#A1A1AA] hover:bg-[#1c1c24] hover:text-[#FAFAFA] transition-colors group text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 text-[#71717A] group-hover:text-[#818cf8] transition-colors" />
                    <span>{item.label}</span>
                  </div>
                  <span className="text-[10px] font-mono text-[#71717A] bg-[#09090B] px-1.5 py-0.5 rounded border border-[rgba(255,255,255,0.08)]">
                    {item.category}
                  </span>
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-2.5 border-t border-[rgba(255,255,255,0.08)] bg-[#09090B]/60 text-[10px] text-[#71717A] font-mono flex justify-between items-center px-4">
          <span>AntiGravity Command Bar</span>
          <span>Press ESC to close</span>
        </div>
      </div>
    </div>
    </Portal>
  );
}
