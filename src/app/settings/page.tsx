'use client';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, RefreshCw } from 'lucide-react';

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

  if (loading) return <div className="p-12 text-indigo-400 text-xs">⏳ Loading Workspace Settings...</div>;

  return (
    <div className="p-12 max-w-6xl mx-auto space-y-8 select-none relative animate-in fade-in duration-500">
      
      {/* Background Aura Glows */}
      <div className="absolute top-0 right-1/4 w-80 h-80 bg-indigo-600/5 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Notion Breadcrumbs */}
      <div className="text-[11px] text-neutral-500 flex items-center gap-1.5 font-mono uppercase tracking-wider relative z-10">
        <span>Cosmic Hub</span>
        <span>/</span>
        <span className="text-indigo-400 font-medium">⚙️ System Settings</span>
      </div>

      {/* Page Header */}
      <div className="space-y-1 relative z-10">
        <h1 className="text-4xl font-extrabold tracking-tight text-neutral-100 flex items-center gap-3">
          <span>⚙️</span> <span className="gradient-text-cosmic">Settings</span>
        </h1>
        <p className="text-neutral-400 text-[14.5px] font-light leading-relaxed max-w-xl">
          Configure API integrations, monitor credentials status, and manage baseline resume templates.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 relative z-10">
        {/* Gmail Integration */}
        <Card className="glass-panel bg-[#0d0d12]/65 border-white/5 rounded-2xl shadow-xl overflow-hidden">
          <CardHeader className="pb-3 border-b border-white/5">
            <CardTitle className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-2 font-mono">
              ✉️ GMAIL INTEGRATION
            </CardTitle>
            <CardDescription className="text-neutral-500 text-[11px] mt-0.5 font-light">Required to automatically stage cold email drafts in Gmail.</CardDescription>
          </CardHeader>
          <CardContent className="pt-5">
            {settings.gmailConnected ? (
              <div className="space-y-3.5">
                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-green-950/15 border border-green-800/20 text-green-400 text-xs">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-green-400" />
                  <div>
                    <h4 className="font-semibold text-xs">Integration Connected</h4>
                    <p className="text-[10px] text-green-400/80 mt-0.5 select-all font-mono">Authorized: {settings.gmailEmail}</p>
                  </div>
                </div>
                <Button onClick={connectGmail} variant="outline" className="w-full h-9 text-xs bg-[#050508] border-white/5 hover:border-indigo-500/20 hover:bg-[#12121b] text-neutral-300 font-medium rounded-xl shadow-none transition-colors">
                  Reconnect Google Account
                </Button>
              </div>
            ) : (
              <div className="space-y-3.5">
                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-orange-950/15 border border-orange-850/20 text-orange-400 text-xs">
                  <XCircle className="w-4 h-4 shrink-0 text-orange-400" />
                  <div>
                    <h4 className="font-semibold text-xs">Gmail Disconnected</h4>
                    <p className="text-[10px] opacity-80 mt-0.5">Outreach stages will generate text but skip staging.</p>
                  </div>
                </div>
                <Button onClick={connectGmail} className="w-full h-9 text-xs bg-purple-650 hover:bg-purple-700 text-white font-semibold rounded-xl shadow-none border-none">
                  Authorize Google Console
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* API Key Status */}
        <Card className="glass-panel bg-[#0d0d12]/65 border-white/5 rounded-2xl shadow-xl overflow-hidden">
          <CardHeader className="pb-3 border-b border-white/5">
            <CardTitle className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-2 font-mono">
              🔑 API CREDENTIAL MONITOR
            </CardTitle>
            <CardDescription className="text-neutral-500 text-[11px] mt-0.5 font-light">Status of credentials loaded from background worker .env.</CardDescription>
          </CardHeader>
          <CardContent className="pt-5">
            <div className="grid grid-cols-2 gap-y-3 text-xs font-light">
              <div className="flex justify-between items-center pr-4">
                <span className="text-neutral-400">OpenRouter API</span>
                {settings.apiKeys.openrouter ? <span className="text-green-400 font-semibold font-mono text-[10px]">ACTIVE</span> : <span className="text-red-400 font-semibold font-mono text-[10px]">MISSING</span>}
              </div>
              <div className="flex justify-between items-center pr-4">
                <span className="text-neutral-400">Groq API key</span>
                {settings.apiKeys.groq ? <span className="text-green-400 font-semibold font-mono text-[10px]">ACTIVE</span> : <span className="text-red-400 font-semibold font-mono text-[10px]">MISSING</span>}
              </div>
              <div className="flex justify-between items-center pr-4">
                <span className="text-neutral-400">Adzuna App</span>
                {settings.apiKeys.adzuna ? <span className="text-green-400 font-semibold font-mono text-[10px]">ACTIVE</span> : <span className="text-red-400 font-semibold font-mono text-[10px]">MISSING</span>}
              </div>
              <div className="flex justify-between items-center pr-4">
                <span className="text-neutral-400">JSearch Client</span>
                {settings.apiKeys.rapidApi ? <span className="text-green-400 font-semibold font-mono text-[10px]">ACTIVE</span> : <span className="text-red-400 font-semibold font-mono text-[10px]">MISSING</span>}
              </div>
              <div className="flex justify-between items-center pr-4">
                <span className="text-neutral-400">Serper Search</span>
                {settings.apiKeys.serper ? <span className="text-green-400 font-semibold font-mono text-[10px]">ACTIVE</span> : <span className="text-red-400 font-semibold font-mono text-[10px]">MISSING</span>}
              </div>
              <div className="flex justify-between items-center pr-4">
                <span className="text-neutral-400">Apollo.io Lookup</span>
                {settings.apiKeys.apollo ? <span className="text-green-400 font-semibold font-mono text-[10px]">ACTIVE</span> : <span className="text-red-400 font-semibold font-mono text-[10px]">MISSING</span>}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Manual Triggers */}
      <Card className="glass-panel bg-[#0d0d12]/65 border-white/5 rounded-2xl shadow-xl overflow-hidden relative z-10">
        <CardHeader className="pb-3 border-b border-white/5">
          <CardTitle className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-2 font-mono">
            ⚡ MANUAL PIPELINE TRIGGER
          </CardTitle>
          <CardDescription className="text-neutral-500 text-[11px] mt-0.5 font-light">Dispatches standard background worker scripts immediately.</CardDescription>
        </CardHeader>
        <CardContent className="pt-5 flex gap-3">
          <Button onClick={() => runPipeline('scrape')} variant="outline" className="h-9 px-4 text-xs bg-[#050508] border-white/5 hover:border-indigo-500/20 hover:bg-[#12121b] text-neutral-300 font-medium rounded-xl shadow-none transition-colors">
            🔍 Execute Daily Job Scraper
          </Button>
          <Button onClick={() => runPipeline('funding')} variant="outline" className="h-9 px-4 text-xs bg-[#050508] border-white/5 hover:border-indigo-500/20 hover:bg-[#12121b] text-neutral-300 font-medium rounded-xl shadow-none transition-colors">
            📈 Sync Startup Funding Leads
          </Button>
        </CardContent>
      </Card>

      {/* Master CV Editor */}
      <Card className="glass-panel bg-[#0d0d12]/65 border-white/5 rounded-2xl shadow-xl overflow-hidden relative z-10">
        <CardHeader className="pb-3 border-b border-white/5 flex flex-row items-center justify-between flex-wrap gap-3">
          <div>
            <CardTitle className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest font-mono">📄 MASTER RESUME TEMPLATES</CardTitle>
            <CardDescription className="text-neutral-500 text-[11px] mt-0.5 font-light">
               baseline templates used by LLM models during the resume tailoring stage.
            </CardDescription>
          </div>
          <Button onClick={saveCvSettings} disabled={savingSettings} className="button-premium h-9 px-6 text-xs font-semibold rounded-xl transition-all shadow-md border-none">
            {savingSettings ? 'Saving...' : 'Commit Baseline Templates'}
          </Button>
        </CardHeader>
        <CardContent className="pt-5 space-y-4">
          <div className="flex gap-2">
            <button 
              onClick={() => setCvType('html')}
              className={`px-4 py-1.5 rounded-xl text-xs font-medium border transition-all duration-300 ${cvType === 'html' ? 'bg-[#050508] border-indigo-500/40 text-neutral-100' : 'bg-transparent border-white/5 text-neutral-500 hover:text-neutral-300 hover:bg-[#12121b]'}`}
            >
              HTML Source Code
            </button>
            <button 
              onClick={() => setCvType('latex')}
              className={`px-4 py-1.5 rounded-xl text-xs font-medium border transition-all duration-300 ${cvType === 'latex' ? 'bg-[#050508] border-indigo-500/40 text-neutral-100' : 'bg-transparent border-white/5 text-neutral-500 hover:text-neutral-300 hover:bg-[#12121b]'}`}
            >
              LaTeX Source Code
            </button>
          </div>

          {cvType === 'html' ? (
            <textarea
              className="w-full h-[500px] p-4 rounded-xl bg-[#050508]/85 border border-white/5 text-neutral-300 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 font-mono text-[11.5px] leading-relaxed resize-y transition-all"
              value={masterHtml}
              onChange={(e) => setMasterHtml(e.target.value)}
              spellCheck="false"
              placeholder="Paste baseline HTML document structure..."
            />
          ) : (
            <textarea
              className="w-full h-[500px] p-4 rounded-xl bg-[#050508]/85 border border-white/5 text-neutral-300 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 font-mono text-[11.5px] leading-relaxed resize-y transition-all"
              value={masterLatex}
              onChange={(e) => setMasterLatex(e.target.value)}
              spellCheck="false"
              placeholder="Paste baseline LaTeX document markup..."
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
