'use client';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mail, CheckCircle2, XCircle, Database, Search, Bot, Play } from 'lucide-react';

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

  if (loading) return <div className="p-8 text-neutral-500">Loading settings...</div>;

  return (
    <div className="p-8 max-w-[1200px] mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Settings</h1>
        <p className="text-neutral-400">Configure API keys, connect Gmail, and edit your master CV template.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Gmail Integration */}
        <Card className="border-neutral-800 bg-neutral-900/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Mail className="w-5 h-5 text-purple-400" />
              Gmail Integration
            </CardTitle>
            <CardDescription className="text-neutral-400">Required for creating outreach drafts (never auto-sends).</CardDescription>
          </CardHeader>
          <CardContent>
            {settings.gmailConnected ? (
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3 p-4 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400">
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  <div>
                    <h4 className="font-medium text-sm">Connected successfully</h4>
                    <p className="text-xs mt-0.5 text-green-400/80">Authorized as: {settings.gmailEmail}</p>
                  </div>
                </div>
                <Button onClick={connectGmail} variant="outline" className="w-full">
                  Reconnect Gmail
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3 p-4 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400">
                  <XCircle className="w-5 h-5 shrink-0" />
                  <div>
                    <h4 className="font-medium text-sm">Not connected</h4>
                    <p className="text-xs mt-0.5 opacity-80">Outreach pipeline cannot create drafts.</p>
                  </div>
                </div>
                <Button onClick={connectGmail} className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                  Connect Gmail
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* API Key Status */}
        <Card className="border-neutral-800 bg-neutral-900/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Database className="w-5 h-5 text-blue-400" />
              API Key Status
            </CardTitle>
            <CardDescription className="text-neutral-400">Keys are loaded securely from .env.local</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-y-3 text-sm">
              <div className="flex justify-between items-center pr-4">
                <span className="text-neutral-300">OpenRouter</span>
                {settings.apiKeys.openrouter ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <XCircle className="w-4 h-4 text-red-400" />}
              </div>
              <div className="flex justify-between items-center pr-4">
                <span className="text-neutral-300">Groq</span>
                {settings.apiKeys.groq ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <XCircle className="w-4 h-4 text-red-400" />}
              </div>
              <div className="flex justify-between items-center pr-4">
                <span className="text-neutral-300">Adzuna</span>
                {settings.apiKeys.adzuna ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <XCircle className="w-4 h-4 text-red-400" />}
              </div>
              <div className="flex justify-between items-center pr-4">
                <span className="text-neutral-300">JSearch (RapidAPI)</span>
                {settings.apiKeys.rapidApi ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <XCircle className="w-4 h-4 text-red-400" />}
              </div>
              <div className="flex justify-between items-center pr-4">
                <span className="text-neutral-300">Serper.dev</span>
                {settings.apiKeys.serper ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <XCircle className="w-4 h-4 text-red-400" />}
              </div>
              <div className="flex justify-between items-center pr-4">
                <span className="text-neutral-300">Apollo.io</span>
                {settings.apiKeys.apollo ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <XCircle className="w-4 h-4 text-red-400" />}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Manual Triggers */}
      <Card className="border-neutral-800 bg-neutral-900/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Play className="w-5 h-5 text-green-400" />
            Manual Triggers
          </CardTitle>
          <CardDescription className="text-neutral-400">Trigger background pipelines on demand.</CardDescription>
        </CardHeader>
        <CardContent className="flex gap-4">
          <Button onClick={() => runPipeline('scrape')} variant="secondary" className="gap-2">
            <Search className="w-4 h-4" /> Run Job Scraper Now
          </Button>
          <Button onClick={() => runPipeline('funding')} variant="secondary" className="gap-2">
            <Bot className="w-4 h-4" /> Run Funding News Now
          </Button>
        </CardContent>
      </Card>

      {/* Master CV Editor */}
      <Card className="border-neutral-800 bg-neutral-900/50">
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <CardTitle className="text-lg">Master CV Template</CardTitle>
            <CardDescription className="text-neutral-400 mt-1 max-w-[600px]">
              Choose your CV rendering engine. HTML uses Puppeteer, while LaTeX requires <code className="text-pink-400">pdflatex</code> installed locally on your system. Keep the AI_EDITABLE comments intact.
            </CardDescription>
            <div className="flex gap-4 mt-4">
              <button 
                onClick={() => setCvType('html')}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${cvType === 'html' ? 'bg-blue-600 text-white' : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'}`}
              >
                HTML Engine
              </button>
              <button 
                onClick={() => setCvType('latex')}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${cvType === 'latex' ? 'bg-pink-600 text-white' : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'}`}
              >
                LaTeX Engine
              </button>
            </div>
          </div>
          <Button onClick={saveCvSettings} disabled={savingSettings} className="bg-blue-600 hover:bg-blue-700 text-white mt-2">
            {savingSettings ? 'Saving...' : 'Save Changes'}
          </Button>
        </CardHeader>
        <CardContent>
          {cvType === 'html' ? (
            <textarea
              className="w-full h-[600px] p-4 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-xs font-medium leading-relaxed resize-y"
              value={masterHtml}
              onChange={(e) => setMasterHtml(e.target.value)}
              spellCheck="false"
              placeholder="Paste your HTML here..."
            />
          ) : (
            <textarea
              className="w-full h-[600px] p-4 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-300 focus:outline-none focus:ring-2 focus:ring-pink-500 font-mono text-xs font-medium leading-relaxed resize-y"
              value={masterLatex}
              onChange={(e) => setMasterLatex(e.target.value)}
              spellCheck="false"
              placeholder="Paste your LaTeX code here..."
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
