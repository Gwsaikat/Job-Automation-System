'use client';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Settings, RefreshCw, Key, Mail, User, FileText } from 'lucide-react';

export default function SettingsPage() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [masterLatex, setMasterLatex] = useState('');

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        setSettings(data);
        setMasterLatex(data.masterCvLatex || '');
        setLoading(false);
      });

    const params = new URLSearchParams(window.location.search);
    if (params.get('success')) {
      alert('Successfully connected Gmail!');
      window.history.replaceState({}, '', '/settings');
    }
  }, []);

  const connectGmail = async () => {
    const res = await fetch('/api/settings/gmail', { method: 'POST' });
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    } else {
      alert('Failed to get Auth URL: ' + data.error);
    }
  };

  const saveCvSettings = async () => {
    setSavingSettings(true);
    await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ masterCvLatex: masterLatex }),
    });
    setSavingSettings(false);
    alert('Master resume template saved successfully.');
  };

  const runPipeline = async (type: string) => {
    try {
      await fetch('/api/pipeline/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pipeline: type }),
      });
      alert(`${type} pipeline started in background!`);
    } catch {
      // ignore
    }
  };

  if (loading) return <div className="p-8 text-[#A1A1AA] text-xs font-mono">Loading AntiGravity Settings...</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 page-fade">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#FAFAFA] flex items-center gap-2.5">
            <Settings className="w-6 h-6 text-[#6366f1]" />
            <span>Settings</span>
          </h1>
          <p className="text-sm text-[#A1A1AA] mt-0.5">
            Manage integrations, API credentials, and candidate resume templates.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Gmail Integration */}
        <Card className="ag-card p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[rgba(255,255,255,0.08)] pb-3">
            <h3 className="font-semibold text-xs text-[#FAFAFA] uppercase font-mono flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#818cf8]" /> Gmail Integration
            </h3>
            {settings?.gmailConnected ? (
              <span className="ag-badge-green">Connected</span>
            ) : (
              <span className="ag-badge">Disconnected</span>
            )}
          </div>

          <p className="text-xs text-[#A1A1AA] leading-relaxed">
            Authorized to stage personalized cold outreach emails directly as Gmail drafts.
          </p>

          {settings?.gmailConnected ? (
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-[#111827] border border-[rgba(255,255,255,0.08)] text-xs text-[#34d399] font-mono">
                Authorized: {settings.gmailEmail}
              </div>
              <Button
                onClick={connectGmail}
                variant="outline"
                className="w-full h-8 text-xs bg-[#09090B] text-[#FAFAFA] border-[rgba(255,255,255,0.08)]"
              >
                Reconnect Account
              </Button>
            </div>
          ) : (
            <Button
              onClick={connectGmail}
              className="w-full h-8 text-xs bg-[#6366f1] hover:bg-[#4f46e5] text-white"
            >
              Authorize Gmail
            </Button>
          )}
        </Card>

        {/* API Monitor */}
        <Card className="ag-card p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[rgba(255,255,255,0.08)] pb-3">
            <h3 className="font-semibold text-xs text-[#FAFAFA] uppercase font-mono flex items-center gap-2">
              <Key className="w-4 h-4 text-[#818cf8]" /> API Key Monitor
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-y-2.5 text-xs text-[#A1A1AA]">
            <div className="flex justify-between items-center pr-2">
              <span>Groq API</span>
              {settings?.apiKeys?.groq ? <span className="text-[#34d399] font-mono text-[11px]">ACTIVE</span> : <span className="text-[#ef4444] font-mono text-[11px]">MISSING</span>}
            </div>
            <div className="flex justify-between items-center pr-2">
              <span>Serper Search</span>
              {settings?.apiKeys?.serper ? <span className="text-[#34d399] font-mono text-[11px]">ACTIVE</span> : <span className="text-[#ef4444] font-mono text-[11px]">MISSING</span>}
            </div>
            <div className="flex justify-between items-center pr-2">
              <span>Adzuna App</span>
              {settings?.apiKeys?.adzuna ? <span className="text-[#34d399] font-mono text-[11px]">ACTIVE</span> : <span className="text-[#ef4444] font-mono text-[11px]">MISSING</span>}
            </div>
            <div className="flex justify-between items-center pr-2">
              <span>Apollo.io Lookup</span>
              {settings?.apiKeys?.apollo ? <span className="text-[#34d399] font-mono text-[11px]">ACTIVE</span> : <span className="text-[#ef4444] font-mono text-[11px]">MISSING</span>}
            </div>
          </div>
        </Card>
      </div>

      {/* Candidate Profile Summary */}
      <Card className="ag-card p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-[rgba(255,255,255,0.08)] pb-3">
          <h3 className="font-semibold text-xs text-[#FAFAFA] uppercase font-mono flex items-center gap-2">
            <User className="w-4 h-4 text-[#818cf8]" /> Candidate Profile (Source of Truth)
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-[#A1A1AA]">
          <div className="space-y-1">
            <span className="text-[10px] font-mono text-[#71717A] uppercase block">Candidate Name</span>
            <p className="text-[#FAFAFA] font-semibold">Saikat Maji</p>
            <p className="text-[11px]">B.Tech CSE (JIS University 2026)</p>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-mono text-[#71717A] uppercase block">Location & Work Auth</span>
            <p className="text-[#FAFAFA] font-semibold">Kolkata, India</p>
            <p className="text-[11px] text-[#34d399]">India authorization (No US/EU visa requirement)</p>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-mono text-[#71717A] uppercase block">Core Tech Stack</span>
            <p className="text-[#FAFAFA] font-semibold">MERN / TypeScript / Next.js</p>
            <p className="text-[11px] text-[#818cf8]">React, Node, Express, MongoDB, Socket.io, Redis</p>
          </div>
        </div>
      </Card>

      {/* Manual Pipeline Triggers */}
      <Card className="ag-card p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-[rgba(255,255,255,0.08)] pb-3">
          <h3 className="font-semibold text-xs text-[#FAFAFA] uppercase font-mono flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-[#818cf8]" /> Manual Pipeline Triggers
          </h3>
        </div>

        <div className="flex gap-3 flex-wrap">
          <Button
            onClick={() => runPipeline('scrape')}
            variant="outline"
            className="h-8 text-xs bg-[#111827] text-[#FAFAFA] border-[rgba(255,255,255,0.08)] hover:border-[#6366f1]/40"
          >
            Run Daily Job Scraper
          </Button>
          <Button
            onClick={() => runPipeline('funding')}
            variant="outline"
            className="h-8 text-xs bg-[#111827] text-[#FAFAFA] border-[rgba(255,255,255,0.08)] hover:border-[#6366f1]/40"
          >
            Sync Startup Funding Leads
          </Button>
        </div>
      </Card>

      {/* Master Resume Template */}
      <Card className="ag-card p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-[rgba(255,255,255,0.08)] pb-3">
          <h3 className="font-semibold text-xs text-[#FAFAFA] uppercase font-mono flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#818cf8]" /> Master LaTeX Resume Template
          </h3>
          <Button
            onClick={saveCvSettings}
            disabled={savingSettings}
            className="h-8 px-4 text-xs bg-[#6366f1] hover:bg-[#4f46e5] text-white"
          >
            {savingSettings ? 'Saving...' : 'Save Template'}
          </Button>
        </div>

        <textarea
          value={masterLatex}
          onChange={(e) => setMasterLatex(e.target.value)}
          className="w-full h-96 bg-[#09090B] border border-[rgba(255,255,255,0.08)] rounded-lg p-4 font-mono text-xs text-[#FAFAFA] leading-relaxed focus:outline-none focus:border-[#6366f1] resize-none"
          spellCheck="false"
        />
      </Card>
    </div>
  );
}
