'use client';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle } from 'lucide-react';

export default function SettingsPage() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [masterHtml, setMasterHtml] = useState('');
  const [masterLatex, setMasterLatex] = useState('');
  const [cvType, setCvType] = useState('html');

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        setSettings(data);
        setMasterHtml(data.masterCvHtml);
        setMasterLatex(data.masterCvLatex);
        setCvType(data.cvType);
        setLoading(false);
      });

    // Check for OAuth callbacks
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
      body: JSON.stringify({ 
        masterCvHtml: masterHtml,
        masterCvLatex: masterLatex,
        cvType: cvType
      }),
    });
    setSavingSettings(false);
    alert('CV Settings saved successfully.');
  };

  const runPipeline = async (type: string) => {
    const btn = document.activeElement as HTMLButtonElement;
    const oldText = btn.innerText;
    btn.innerText = 'Starting...';
    btn.disabled = true;

    try {
      await fetch('/api/pipeline/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pipeline: type }),
      });
      alert(`${type} pipeline started in background!`);
    } finally {
      btn.innerText = oldText;
      btn.disabled = false;
    }
  };

  if (loading) return <div className="p-12 text-neutral-500 text-xs">⏳ Loading Settings...</div>;

  return (
    <div className="p-12 max-w-5xl mx-auto space-y-6 select-none animate-in fade-in duration-300">
      
      {/* Notion Breadcrumbs */}
      <div className="text-xs text-neutral-500 flex items-center gap-1.5 font-normal">
        <span>Saikat's Workspace</span>
        <span>/</span>
        <span className="text-neutral-400 font-medium">⚙️ Settings</span>
      </div>

      {/* Page Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight text-neutral-100 flex items-center gap-3">
          <span>⚙️</span> Settings
        </h1>
        <p className="text-neutral-400 text-sm">
          Manage API keys, Gmail credentials, manual pipeline execution, and customize your master CV templates.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Gmail Integration */}
        <Card className="border-[#2f2f2f] bg-[#202020] rounded shadow-none">
          <CardHeader className="pb-3 border-b border-[#2f2f2f]">
            <CardTitle className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
              ✉️ Gmail Integration
            </CardTitle>
            <CardDescription className="text-neutral-500 text-[11px] mt-0.5">Required to create automated job outreach drafts.</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            {settings.gmailConnected ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 p-2.5 rounded bg-green-950/15 border border-green-800/20 text-green-400 text-xs">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <div>
                    <h4 className="font-semibold text-xs">Connected</h4>
                    <p className="text-[10px] text-green-400/80 mt-0.5">Account: {settings.gmailEmail}</p>
                  </div>
                </div>
                <Button onClick={connectGmail} variant="outline" className="w-full h-8 text-xs bg-[#191919] border-[#2f2f2f] hover:bg-[#202020] text-neutral-300 rounded shadow-none font-normal">
                  Reconnect Account
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-2 p-2.5 rounded bg-orange-950/15 border border-orange-850/20 text-orange-400 text-xs">
                  <XCircle className="w-4 h-4 shrink-0" />
                  <div>
                    <h4 className="font-semibold text-xs">Not connected</h4>
                    <p className="text-[10px] opacity-80 mt-0.5">Outreach drafts will be skipped.</p>
                  </div>
                </div>
                <Button onClick={connectGmail} className="w-full h-8 text-xs bg-purple-650 hover:bg-purple-700 text-white font-medium rounded shadow-none">
                  Connect Gmail Account
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* API Key Status */}
        <Card className="border-[#2f2f2f] bg-[#202020] rounded shadow-none">
          <CardHeader className="pb-3 border-b border-[#2f2f2f]">
            <CardTitle className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
              🔑 System API Keys
            </CardTitle>
            <CardDescription className="text-neutral-500 text-[11px] mt-0.5">Keys loaded automatically from .env configuration.</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid grid-cols-2 gap-y-2.5 text-xs">
              <div className="flex justify-between items-center pr-4">
                <span className="text-neutral-400">OpenRouter API</span>
                {settings.apiKeys.openrouter ? <CheckCircle2 className="w-3.5 h-3.5 text-green-400" /> : <XCircle className="w-3.5 h-3.5 text-red-400" />}
              </div>
              <div className="flex justify-between items-center pr-4">
                <span className="text-neutral-400">Groq API</span>
                {settings.apiKeys.groq ? <CheckCircle2 className="w-3.5 h-3.5 text-green-400" /> : <XCircle className="w-3.5 h-3.5 text-red-400" />}
              </div>
              <div className="flex justify-between items-center pr-4">
                <span className="text-neutral-400">Adzuna Scraping</span>
                {settings.apiKeys.adzuna ? <CheckCircle2 className="w-3.5 h-3.5 text-green-400" /> : <XCircle className="w-3.5 h-3.5 text-red-400" />}
              </div>
              <div className="flex justify-between items-center pr-4">
                <span className="text-neutral-400">JSearch API</span>
                {settings.apiKeys.rapidApi ? <CheckCircle2 className="w-3.5 h-3.5 text-green-400" /> : <XCircle className="w-3.5 h-3.5 text-red-400" />}
              </div>
              <div className="flex justify-between items-center pr-4">
                <span className="text-neutral-400">Serper Search</span>
                {settings.apiKeys.serper ? <CheckCircle2 className="w-3.5 h-3.5 text-green-400" /> : <XCircle className="w-3.5 h-3.5 text-red-400" />}
              </div>
              <div className="flex justify-between items-center pr-4">
                <span className="text-neutral-400">Apollo.io Contact</span>
                {settings.apiKeys.apollo ? <CheckCircle2 className="w-3.5 h-3.5 text-green-400" /> : <XCircle className="w-3.5 h-3.5 text-red-400" />}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Manual Triggers */}
      <Card className="border-[#2f2f2f] bg-[#202020] rounded shadow-none">
        <CardHeader className="pb-3 border-b border-[#2f2f2f]">
          <CardTitle className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
            ⚡ Quick Pipeline Actions
          </CardTitle>
          <CardDescription className="text-neutral-500 text-[11px] mt-0.5">Run worker sync scripts immediately.</CardDescription>
        </CardHeader>
        <CardContent className="pt-4 flex gap-3">
          <Button onClick={() => runPipeline('scrape')} variant="outline" className="h-8 text-xs bg-[#191919] border-[#2f2f2f] hover:bg-[#202020] text-neutral-300 font-normal rounded gap-1.5 shadow-none">
            🔍 Run Daily Job Scraper
          </Button>
          <Button onClick={() => runPipeline('funding')} variant="outline" className="h-8 text-xs bg-[#191919] border-[#2f2f2f] hover:bg-[#202020] text-neutral-300 font-normal rounded gap-1.5 shadow-none">
            📈 Run Funding News Sync
          </Button>
        </CardContent>
      </Card>

      {/* Master CV Editor */}
      <Card className="border-[#2f2f2f] bg-[#202020] rounded shadow-none">
        <CardHeader className="pb-3 border-b border-[#2f2f2f] flex flex-row items-center justify-between flex-wrap gap-2">
          <div>
            <CardTitle className="text-xs font-bold text-neutral-400 uppercase tracking-wider">📄 Master CV Templates</CardTitle>
            <CardDescription className="text-neutral-500 text-[11px] mt-0.5">
              Edit the baseline CV layout that the AI references to generate tailored CVs.
            </CardDescription>
          </div>
          <Button onClick={saveCvSettings} disabled={savingSettings} className="h-8 px-5 text-xs bg-blue-650 hover:bg-blue-700 text-white font-medium rounded shadow-none">
            {savingSettings ? 'Saving...' : 'Save Templates'}
          </Button>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          <div className="flex gap-2">
            <button 
              onClick={() => setCvType('html')}
              className={`px-3 py-1 rounded text-xs font-normal border transition-colors ${cvType === 'html' ? 'bg-[#191919] border-[#2eaadc] text-neutral-100 font-medium' : 'bg-transparent border-[#2f2f2f] text-neutral-400 hover:bg-[#2c2c2c]'}`}
            >
              HTML Template
            </button>
            <button 
              onClick={() => setCvType('latex')}
              className={`px-3 py-1 rounded text-xs font-normal border transition-colors ${cvType === 'latex' ? 'bg-[#191919] border-[#2eaadc] text-neutral-100 font-medium' : 'bg-transparent border-[#2f2f2f] text-neutral-400 hover:bg-[#2c2c2c]'}`}
            >
              LaTeX Template
            </button>
          </div>

          {cvType === 'html' ? (
            <textarea
              className="w-full h-80 p-4 rounded bg-[#191919] border border-[#2f2f2f] text-neutral-300 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono text-[11px] leading-relaxed resize-y"
              value={masterHtml}
              onChange={(e) => setMasterHtml(e.target.value)}
              spellCheck="false"
              placeholder="Paste master HTML template code..."
            />
          ) : (
            <textarea
              className="w-full h-80 p-4 rounded bg-[#191919] border border-[#2f2f2f] text-neutral-300 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono text-[11px] leading-relaxed resize-y"
              value={masterLatex}
              onChange={(e) => setMasterLatex(e.target.value)}
              spellCheck="false"
              placeholder="Paste master LaTeX template code..."
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
