'use client';

import { useState } from 'react';
import { Search, Bell, Command, RefreshCw, CheckCircle2, AlertCircle, Info, X, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CommandPalette } from '@/components/command-palette';

interface TopbarProps {
  onMobileMenuToggle?: () => void;
}

export function Topbar({ onMobileMenuToggle }: TopbarProps) {
  const [syncing, setSyncing] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const [notifications] = useState([
    { id: 1, title: 'Job Scraper Finished', desc: 'Discovered 14 new qualified engineering roles.', time: '10m ago', type: 'success' },
    { id: 2, title: 'Playwright Verification', desc: 'Auto-apply engine pre-filled 3 ATS forms.', time: '1h ago', type: 'info' },
    { id: 3, title: 'Gmail Inbox Synced', desc: 'Checked recruiter responses. 0 new status updates.', time: '2h ago', type: 'info' },
  ]);

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
    <>
      <header className="h-[52px] bg-white border-b border-[#E2E8F0] px-3 sm:px-5 flex items-center justify-between sticky top-0 z-20 shadow-xs gap-2">
        {/* Mobile Hamburger Toggle */}
        {onMobileMenuToggle && (
          <button
            onClick={onMobileMenuToggle}
            className="md:hidden p-1.5 rounded-[6px] text-[#475569] hover:bg-[#F1F5F9] cursor-pointer shrink-0"
            title="Open Mobile Navigation"
          >
            <Menu className="w-5 h-5 text-[#0F172A]" />
          </button>
        )}

        {/* Search Trigger */}
        <div className="flex items-center gap-3 flex-1 max-w-md">
          <div
            onClick={() => setCommandOpen(true)}
            className="relative w-full cursor-pointer group"
          >
            <Search className="w-3.5 h-3.5 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2 group-hover:text-[#4F46E5] transition-colors duration-150" />
            <input
              type="text"
              readOnly
              placeholder="Search jobs, companies, or run command..."
              className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-[8px] pl-9 pr-8 sm:pr-14 py-[5px] text-[12px] text-[#0F172A] placeholder-[#94A3B8] cursor-pointer group-hover:border-[#CBD5E1] transition-colors duration-150 truncate"
            />
            <div className="hidden sm:flex absolute right-2.5 top-1/2 -translate-y-1/2 items-center gap-0.5 text-[10px] font-mono text-[#64748B] bg-white px-1.5 py-[2px] rounded-[5px] border border-[#E2E8F0]">
              <Command className="w-2.5 h-2.5" />
              <span>K</span>
            </div>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 relative shrink-0">
          {/* Worker Status */}
          <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-[#475569] bg-[#F8FAFC] px-2.5 py-[4px] rounded-[6px] border border-[#E2E8F0] font-medium">
            <span className="status-dot status-dot-active" />
            <span>Worker Active</span>
          </div>

          {/* Sync */}
          <Button
            onClick={handleManualSync}
            disabled={syncing}
            variant="outline"
            size="sm"
            className="h-[30px] px-2.5 text-[11px] gap-1.5 rounded-[6px]"
          >
            <RefreshCw className={`w-3 h-3 ${syncing ? 'animate-spin text-[#4F46E5]' : 'text-[#64748B]'}`} />
            <span className="hidden sm:inline">{syncing ? 'Syncing' : 'Sync'}</span>
          </Button>

          {/* Notification Bell Dropdown */}
          <div className="relative">
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="w-[30px] h-[30px] rounded-[6px] bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center text-[#64748B] hover:text-[#0F172A] hover:border-[#CBD5E1] transition-colors duration-150 relative cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-3.5 h-3.5" />
              <span className="absolute top-1 right-1 w-[6px] h-[6px] rounded-full bg-[#4F46E5]" />
            </button>

            {/* Notification Dropdown Popover */}
            {notificationsOpen && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-[#E2E8F0] rounded-[10px] shadow-xl z-50 p-3 space-y-2.5 slide-up">
                <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-2">
                  <span className="font-semibold text-[12px] text-[#0F172A]">Notifications</span>
                  <button onClick={() => setNotificationsOpen(false)} className="text-[#94A3B8] hover:text-[#0F172A] p-0.5">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-2">
                  {notifications.map((n) => (
                    <div key={n.id} className="flex gap-2.5 p-2 rounded-[6px] bg-[#F8FAFC] border border-[#E2E8F0] text-xs">
                      {n.type === 'success' ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981] shrink-0 mt-0.5" />
                      ) : n.type === 'alert' ? (
                        <AlertCircle className="w-3.5 h-3.5 text-[#EF4444] shrink-0 mt-0.5" />
                      ) : (
                        <Info className="w-3.5 h-3.5 text-[#4F46E5] shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1 min-w-0 space-y-0.5">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-[#0F172A] text-[11px]">{n.title}</span>
                          <span className="text-[9px] text-[#94A3B8] font-mono">{n.time}</span>
                        </div>
                        <p className="text-[10px] text-[#64748B] leading-tight line-clamp-2">{n.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Profile */}
          <div className="flex items-center gap-2 pl-1 border-l border-[#E2E8F0] ml-0.5">
            <div className="w-7 h-7 rounded-[8px] bg-[#EEF2FF] border border-[#C7D2FE] flex items-center justify-center font-bold text-[11px] text-[#4F46E5]">
              S
            </div>
            <span className="hidden sm:inline text-[12px] font-semibold text-[#0F172A]">Saikat</span>
          </div>
        </div>
      </header>

      <CommandPalette isOpen={commandOpen} onClose={() => setCommandOpen(false)} />
    </>
  );
}
