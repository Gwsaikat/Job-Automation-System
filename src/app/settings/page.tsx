'use client';
import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings, Key, Mail, User, FileText, Eye, EyeOff, Save, Trash2, CheckCircle2, XCircle, Shield, RefreshCw } from 'lucide-react';

const API_KEY_DEFINITIONS = [
  { key: 'ADZUNA_APP_ID', label: 'Adzuna App ID', group: 'Job Scraping' },
  { key: 'ADZUNA_APP_KEY', label: 'Adzuna App Key', group: 'Job Scraping' },
  { key: 'RAPIDAPI_KEY', label: 'RapidAPI Key', group: 'Job Scraping' },
  { key: 'SERPER_API_KEY', label: 'Serper Search Key', group: 'Job Scraping' },
  { key: 'OPENROUTER_API_KEY', label: 'OpenRouter API Key', group: 'AI Providers' },
  { key: 'GROQ_API_KEY1', label: 'Groq API Key 1', group: 'AI Providers' },
  { key: 'GROQ_API_KEY2', label: 'Groq API Key 2', group: 'AI Providers' },
  { key: 'GROQ_API_KEY3', label: 'Groq API Key 3', group: 'AI Providers' },
  { key: 'APOLLO_API_KEY', label: 'Apollo.io Key', group: 'Outreach' },
  { key: 'TELEGRAM_BOT_TOKEN', label: 'Telegram Bot Token', group: 'Notifications' },
  { key: 'GOOGLE_CLIENT_ID', label: 'Google Client ID', group: 'Google OAuth' },
  { key: 'GOOGLE_CLIENT_SECRET', label: 'Google Client Secret', group: 'Google OAuth' },
];

export default function SettingsPage() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [masterLatex, setMasterLatex] = useState('');

  // Dynamic API keys state
  const [apiKeyValues, setApiKeyValues] = useState<Record<string, string>>({});
  const [apiKeyVisibility, setApiKeyVisibility] = useState<Record<string, boolean>>({});
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [savedKeys, setSavedKeys] = useState<Set<string>>(new Set());

  // Profile & Sync handles state
  const [profileData, setProfileData] = useState({
    githubUsername: '',
    leetcodeUsername: '',
    codeforcesUsername: '',
    targetRole: 'Full Stack Developer',
    targetLocation: 'India / Remote',
  });
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        setSettings(data);
        setMasterLatex(data.masterCvLatex || '');
        if (data.profile) {
          setProfileData(data.profile);
        }

        if (data.storedApiKeys) {
          const vals: Record<string, string> = {};
          for (const def of API_KEY_DEFINITIONS) {
            vals[def.key] = data.storedApiKeys[def.key] || '';
          }
          setApiKeyValues(vals);
        }
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

  const saveProfileSettings = async () => {
    setSavingProfile(true);
    try {
      await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile: profileData }),
      });
      alert('Developer profile handles and target role preferences saved!');
    } catch {
      alert('Failed to save profile settings.');
    }
    setSavingProfile(false);
  };

  const saveApiKey = async (keyName: string) => {
    setSavingKey(keyName);
    try {
      await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKeys: { [keyName]: apiKeyValues[keyName] } }),
      });
      setSavedKeys(prev => new Set([...prev, keyName]));
      setTimeout(() => setSavedKeys(prev => { const n = new Set(prev); n.delete(keyName); return n; }), 2000);
    } catch {
      alert('Failed to save API key.');
    }
    setSavingKey(null);
  };

  const deleteApiKey = async (keyName: string) => {
    if (!confirm(`Remove ${keyName} from database? The system will fall back to .env value if available.`)) return;
    setApiKeyValues(prev => ({ ...prev, [keyName]: '' }));
    await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiKeys: { [keyName]: '' } }),
    });
  };

  const runPipeline = async (type: string) => {
    try {
      await fetch('/api/pipeline/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pipeline: type }),
      });
      alert(`${type} pipeline started in background!`);
    } catch { /* ignore */ }
  };

  const toggleVisibility = (key: string) => {
    setApiKeyVisibility(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const maskValue = (val: string) => {
    if (!val || val.length < 8) return val ? '****' : '';
    return val.slice(0, 4) + '****' + val.slice(-4);
  };

  if (loading) return <div className="p-6 text-[#64748B] text-[12px] font-mono">Loading Settings...</div>;

  const groups = Array.from(new Set(API_KEY_DEFINITIONS.map(d => d.group)));

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-5 page-fade">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#0F172A] flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-[8px] bg-[#EEF2FF] border border-[#C7D2FE] flex items-center justify-center">
            <Settings className="w-4 h-4 text-[#4F46E5]" />
          </div>
          Settings & Dynamic API Keys
        </h1>
        <p className="text-[13px] text-[#64748B] mt-0.5">Manage API keys, integrations, and resume templates. Paste your own keys below.</p>
      </div>

      {/* User Profile & Sync Handles Card */}
      <Card className="ag-card p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
          <h3 className="font-bold text-[13px] text-[#0F172A] flex items-center gap-2">
            <User className="w-4 h-4 text-[#2563EB]" />
            Developer Profile & Sync Handles
          </h3>
          <Button size="sm" onClick={saveProfileSettings} disabled={savingProfile}>
            <Save className="w-3.5 h-3.5" />
            {savingProfile ? 'Saving...' : 'Save Profile Settings'}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-[11px] font-semibold text-[#64748B] block mb-1">GitHub Username</label>
            <input
              type="text"
              value={profileData.githubUsername}
              onChange={(e) => setProfileData(p => ({ ...p, githubUsername: e.target.value }))}
              placeholder="e.g. GwSaikat"
              className="ag-input w-full"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-[#64748B] block mb-1">LeetCode Handle</label>
            <input
              type="text"
              value={profileData.leetcodeUsername}
              onChange={(e) => setProfileData(p => ({ ...p, leetcodeUsername: e.target.value }))}
              placeholder="e.g. Alpha7679"
              className="ag-input w-full"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-[#64748B] block mb-1">Codeforces Handle</label>
            <input
              type="text"
              value={profileData.codeforcesUsername}
              onChange={(e) => setProfileData(p => ({ ...p, codeforcesUsername: e.target.value }))}
              placeholder="e.g. tourist"
              className="ag-input w-full"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-[#64748B] block mb-1">Target Primary Role</label>
            <input
              type="text"
              value={profileData.targetRole}
              onChange={(e) => setProfileData(p => ({ ...p, targetRole: e.target.value }))}
              placeholder="e.g. Full Stack Developer"
              className="ag-input w-full"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-[#64748B] block mb-1">Target Location Preference</label>
            <input
              type="text"
              value={profileData.targetLocation}
              onChange={(e) => setProfileData(p => ({ ...p, targetLocation: e.target.value }))}
              placeholder="e.g. India / Remote"
              className="ag-input w-full"
            />
          </div>
        </div>
      </Card>

      {/* Dynamic API Key Setup */}
      <Card className="ag-card p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
          <h3 className="font-bold text-[13px] text-[#0F172A] flex items-center gap-2">
            <Key className="w-4 h-4 text-[#F59E0B]" />
            API Key Setup Box
          </h3>
          <div className="flex items-center gap-1.5 text-[11px] text-[#64748B]">
            <Shield className="w-3.5 h-3.5 text-[#10B981]" />
            <span>Keys are stored securely in local database</span>
          </div>
        </div>

        <p className="text-[12px] text-[#64748B]">
          Paste your API keys below. The system will run on your custom keys dynamically instead of hardcoded values.
        </p>

        <div className="space-y-5">
          {groups.map((group) => (
            <div key={group} className="space-y-2">
              <h4 className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">{group}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {API_KEY_DEFINITIONS.filter(d => d.group === group).map((def) => {
                  const val = apiKeyValues[def.key] || '';
                  const isVisible = apiKeyVisibility[def.key];
                  const isSaving = savingKey === def.key;
                  const justSaved = savedKeys.has(def.key);
                  const hasValue = val.trim().length > 0;
                  const envActive = settings?.apiKeys?.[def.key.toLowerCase().replace(/_/g, '').replace('apikey', '')] || false;

                  return (
                    <div key={def.key} className="bg-[#F8FAFC] rounded-[8px] border border-[#E2E8F0] p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-bold text-[#0F172A]">{def.label}</label>
                        <div className="flex items-center gap-1">
                          {hasValue ? (
                            <span className="text-[9px] font-mono text-[#047857] bg-[#ECFDF5] px-1.5 py-0.2 rounded border border-[#A7F3D0] flex items-center gap-0.5 font-bold">
                              <CheckCircle2 className="w-2.5 h-2.5" /> DB ACTIVE
                            </span>
                          ) : envActive ? (
                            <span className="text-[9px] font-mono text-[#B45309] bg-[#FFFBEB] px-1.5 py-0.2 rounded border border-[#FDE68A] flex items-center gap-0.5 font-bold">
                              <CheckCircle2 className="w-2.5 h-2.5" /> ENV FALLBACK
                            </span>
                          ) : (
                            <span className="text-[9px] font-mono text-[#BE123C] bg-[#FFF1F2] px-1.5 py-0.2 rounded border border-[#FECDD3] flex items-center gap-0.5 font-bold">
                              <XCircle className="w-2.5 h-2.5" /> MISSING
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <input
                          type={isVisible ? 'text' : 'password'}
                          value={isVisible ? val : (val ? maskValue(val) : '')}
                          onChange={(e) => setApiKeyValues(prev => ({ ...prev, [def.key]: e.target.value }))}
                          onFocus={() => setApiKeyVisibility(prev => ({ ...prev, [def.key]: true }))}
                          placeholder={`Paste your ${def.label}...`}
                          className="ag-input flex-1 text-[11px] py-1.5 px-2.5 font-mono"
                        />
                        <button
                          onClick={() => toggleVisibility(def.key)}
                          className="p-1.5 text-[#64748B] hover:text-[#0F172A] rounded-[6px] hover:bg-white transition-colors"
                          title={isVisible ? 'Hide' : 'Show'}
                        >
                          {isVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => saveApiKey(def.key)}
                          disabled={isSaving || !val.trim()}
                          className="p-1.5 text-[#047857] hover:bg-[#ECFDF5] rounded-[6px] transition-colors disabled:opacity-40 disabled:pointer-events-none"
                          title="Save Key"
                        >
                          {justSaved ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
                        </button>
                        {hasValue && (
                          <button
                            onClick={() => deleteApiKey(def.key)}
                            className="p-1.5 text-[#BE123C] hover:bg-[#FFF1F2] rounded-[6px] transition-colors"
                            title="Remove Key"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Gmail Integration */}
        <Card className="ag-card p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
            <h3 className="font-bold text-[13px] text-[#0F172A] flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#4F46E5]" /> Gmail Integration
            </h3>
            {settings?.gmailConnected ? (
              <span className="ag-badge-green">Connected</span>
            ) : (
              <span className="ag-badge">Disconnected</span>
            )}
          </div>
          <p className="text-[12px] text-[#64748B]">Authorize to stage personalized outreach emails as Gmail drafts.</p>
          {settings?.gmailConnected ? (
            <div className="space-y-3">
              <div className="p-3 rounded-[8px] bg-[#F8FAFC] border border-[#E2E8F0] text-[12px] text-[#047857] font-mono font-semibold">
                Authorized: {settings.gmailEmail}
              </div>
              <Button onClick={connectGmail} variant="outline" size="sm" className="w-full">Reconnect Account</Button>
            </div>
          ) : (
            <Button onClick={connectGmail} size="sm" className="w-full">Authorize Gmail</Button>
          )}
        </Card>

        {/* Candidate Profile */}
        <Card className="ag-card p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
            <h3 className="font-bold text-[13px] text-[#0F172A] flex items-center gap-2">
              <User className="w-4 h-4 text-[#4F46E5]" /> Candidate Profile
            </h3>
          </div>
          <div className="grid grid-cols-1 gap-3 text-[12px] text-[#475569]">
            <div className="space-y-0.5">
              <span className="text-[10px] font-semibold text-[#94A3B8] uppercase block">Name & Education</span>
              <p className="text-[#0F172A] font-bold">Saikat Maji</p>
              <p className="text-[11px]">B.Tech CSE (JIS University 2026)</p>
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] font-semibold text-[#94A3B8] uppercase block">Location</span>
              <p className="text-[#0F172A] font-bold">Kolkata, India</p>
              <p className="text-[11px] text-[#047857] font-semibold">India work authorization</p>
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] font-semibold text-[#94A3B8] uppercase block">Tech Stack</span>
              <p className="text-[#0F172A] font-bold">MERN / TypeScript / Next.js</p>
              <p className="text-[11px] text-[#4F46E5]">React, Node, Express, MongoDB, Socket.io, Redis</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Manual Triggers */}
      <Card className="ag-card p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
          <h3 className="font-bold text-[13px] text-[#0F172A] flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-[#4F46E5]" /> Manual Pipeline Triggers
          </h3>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button onClick={() => runPipeline('scrape')} variant="outline" size="sm">Run Daily Job Scraper</Button>
          <Button onClick={() => runPipeline('funding')} variant="outline" size="sm">Sync Funding Leads</Button>
          <Button
            onClick={async () => {
              if (confirm('Delete ALL database records and cached CV files for a fresh start?')) {
                const res = await fetch('/api/database/clear', { method: 'DELETE' });
                const data = await res.json();
                if (data.success) {
                  alert('Database & CV Storage reset completely!');
                  window.location.reload();
                } else {
                  alert('Failed to clear database: ' + data.error);
                }
              }
            }}
            variant="outline" size="sm"
            className="text-[#E11D48] border-[#FECDD3] bg-[#FFF1F2] hover:bg-[#FFE4E6]"
          >
            Fresh Start (Wipe All Data)
          </Button>
        </div>
      </Card>

      {/* Master Resume Template */}
      <Card className="ag-card p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
          <h3 className="font-bold text-[13px] text-[#0F172A] flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#4F46E5]" /> Master LaTeX Resume Template
          </h3>
          <Button onClick={saveCvSettings} disabled={savingSettings} size="sm">
            {savingSettings ? 'Saving...' : 'Save Template'}
          </Button>
        </div>
        <textarea
          value={masterLatex}
          onChange={(e) => setMasterLatex(e.target.value)}
          className="ag-input w-full h-80 font-mono text-[12px] leading-relaxed resize-none"
          spellCheck="false"
        />
      </Card>
    </div>
  );
}
