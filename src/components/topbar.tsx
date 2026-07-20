'use client';
import { useState } from 'react';
import { Search, Bell, Command, RefreshCw, Zap, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Topbar() {
  const [syncing, setSyncing] = useState(false);

  const handleManualSync = async () => {
    setSyncing(true);
    try {
      await fetch('/api/pipeline/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pipeline: 'scrape' }),
      });
    } catch {
      // handled
    } finally {
      setTimeout(() => setSyncing(false), 2000);
    }
  };

  return (
    <header className="h-16 bg-[#111827] border-b border-[rgba(255,255,255,0.08)] px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Global Search / Command Palette */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-[#71717A] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search jobs, companies, skills or ask AntiGravity..."
            className="w-full bg-[#18181B] border border-[rgba(255,255,255,0.08)] rounded-lg pl-9 pr-12 py-1.5 text-xs text-[#FAFAFA] placeholder-[#71717A] focus:outline-none focus:border-[#6366f1] transition-colors"
          />
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[10px] font-mono text-[#71717A] bg-[#09090B] px-1.5 py-0.5 rounded border border-[rgba(255,255,255,0.08)]">
            <Command className="w-2.5 h-2.5" />
            <span>K</span>
          </div>
        </div>
      </div>

      {/* Right Action Tools */}
      <div className="flex items-center gap-3">
        {/* Sync Status Badge */}
        <div className="flex items-center gap-2 text-xs text-[#A1A1AA] bg-[#18181B] px-3 py-1.5 rounded-lg border border-[rgba(255,255,255,0.08)] font-mono">
          <div className="w-2 h-2 rounded-full bg-[#34d399] animate-pulse" />
          <span className="text-[11px]">Worker Running</span>
        </div>

        {/* Sync Trigger */}
        <Button
          onClick={handleManualSync}
          disabled={syncing}
          variant="outline"
          className="h-8 px-3 text-xs bg-[#18181B] border-[rgba(255,255,255,0.08)] hover:border-[#6366f1]/40 text-[#FAFAFA] font-medium rounded-lg gap-1.5 shadow-none transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin text-[#6366f1]' : 'text-[#71717A]'}`} />
          <span>{syncing ? 'Syncing...' : 'Sync'}</span>
        </Button>

        {/* Notifications */}
        <button
          className="w-8 h-8 rounded-lg bg-[#18181B] border border-[rgba(255,255,255,0.08)] flex items-center justify-center text-[#71717A] hover:text-[#FAFAFA] hover:border-[#6366f1]/30 transition-colors relative"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#6366f1]" />
        </button>

        {/* User Pill */}
        <div className="flex items-center gap-2 pl-2 border-l border-[rgba(255,255,255,0.08)]">
          <div className="w-7 h-7 rounded-lg bg-[#6366f1]/10 border border-[#6366f1]/20 flex items-center justify-center font-semibold text-xs text-[#818cf8]">
            S
          </div>
          <span className="text-xs font-medium text-[#FAFAFA]">Saikat</span>
        </div>
      </div>
    </header>
  );
}
