'use client';
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Send,
  Copy,
  Check,
  Sparkles,
  User,
  Building,
  Linkedin,
  Mail,
  RefreshCw,
  Brain,
  Search,
  ExternalLink,
  ShieldCheck,
  Globe,
  Briefcase,
  Users,
} from 'lucide-react';

interface Job {
  id: number;
  jobTitle: string;
  company: string;
  jobUrl: string;
  hrName?: string;
  hrEmail?: string;
  hrTitle?: string;
  contactSource?: string;
  contactConfidence?: string;
  companyIntel?: string;
  companyStage?: string;
  psychProfile?: string;
  linkedinNote?: string;
  founderMessage?: string;
  hrMessage?: string;
  referralMessage?: string;
  employeeReferral?: string;
  followUpScheduled?: string;
  linkedinPeopleSearch?: string;
  googleLinkedinSearch?: string;
}

export default function OutreachHubPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);

  // Target role toggle: 'founder' | 'recruiter' | 'referral' | 'linkedin'
  const [targetRole, setTargetRole] = useState<'founder' | 'recruiter' | 'referral' | 'linkedin'>('founder');

  // Generated email/note states
  const [generating, setGenerating] = useState(false);
  const [discovering, setDiscovering] = useState(false);
  const [copiedNote, setCopiedNote] = useState(false);
  const [copiedSubject, setCopiedSubject] = useState(false);

  // Editable generated fields
  const [currentSubject, setCurrentSubject] = useState('');
  const [currentBody, setCurrentBody] = useState('');

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/jobs?limit=50');
      const data = await res.json();
      if (data.jobs && data.jobs.length > 0) {
        setJobs(data.jobs);
        setSelectedJobId(data.jobs[0].id);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const selectedJob = jobs.find((j) => j.id === selectedJobId) || jobs[0];

  const handleDiscoverContact = async () => {
    if (!selectedJob) return;
    setDiscovering(true);
    try {
      const res = await fetch('/api/outreach/discover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId: selectedJob.id }),
      });
      const data = await res.json();
      if (data.success) {
        setJobs((prev) =>
          prev.map((j) =>
            j.id === selectedJob.id
              ? {
                  ...j,
                  hrName: data.contact.name,
                  hrTitle: data.contact.title,
                  hrEmail: data.contact.email,
                  contactSource: data.contact.source,
                  contactConfidence: data.contact.confidence,
                }
              : j
          )
        );
      }
    } catch {
      alert('Failed to discover decision maker contact.');
    } finally {
      setDiscovering(false);
    }
  };

  const handleGenerateOutreach = async () => {
    if (!selectedJob) return;
    setGenerating(true);
    try {
      const res = await fetch('/api/outreach/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId: selectedJob.id, targetRole }),
      });
      const data = await res.json();
      if (data.success && data.messages) {
        let text = '';
        if (targetRole === 'founder') text = data.messages.founderMessage;
        else if (targetRole === 'recruiter') text = data.messages.hrMessage;
        else if (targetRole === 'referral') text = data.messages.referralMessage;
        else text = data.messages.linkedinNote;

        parseAndSetMessage(text);
      }
    } catch {
      alert('Failed to generate outreach pitch.');
    } finally {
      setGenerating(false);
    }
  };

  const parseAndSetMessage = (text: string) => {
    if (!text) {
      setCurrentSubject('');
      setCurrentBody('');
      return;
    }
    const lines = text.split('\n');
    let subj = '';
    let bodyLines: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      if (lines[i].toLowerCase().startsWith('subject:')) {
        subj = lines[i].replace(/^subject:\s*/i, '').trim();
      } else {
        bodyLines.push(lines[i]);
      }
    }

    setCurrentSubject(subj || `Application for ${selectedJob?.jobTitle || 'SDE Role'} at ${selectedJob?.company || 'Company'}`);
    setCurrentBody(bodyLines.join('\n').trim());
  };

  useEffect(() => {
    if (selectedJob) {
      let text = selectedJob.founderMessage;
      if (targetRole === 'recruiter') text = selectedJob.hrMessage;
      else if (targetRole === 'referral') text = selectedJob.referralMessage;
      else if (targetRole === 'linkedin') text = selectedJob.linkedinNote;

      if (text) {
        parseAndSetMessage(text);
      } else {
        handleGenerateOutreach();
      }
    }
  }, [selectedJobId, targetRole]);

  const copyToClipboard = (text: string, isSubject: boolean) => {
    navigator.clipboard.writeText(text);
    if (isSubject) {
      setCopiedSubject(true);
      setTimeout(() => setCopiedSubject(false), 2000);
    } else {
      setCopiedNote(true);
      setTimeout(() => setCopiedNote(false), 2000);
    }
  };

  if (loading) {
    return <div className="p-6 text-[#64748B] text-xs font-mono">Loading Outreach Hub...</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 page-fade">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0F172A] flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[8px] bg-[#FFF1F2] border border-[#FECDD3] flex items-center justify-center">
              <Send className="w-4 h-4 text-[#E11D48]" />
            </div>
            Outreach Hub
          </h1>
          <p className="text-[13px] text-[#64748B] mt-0.5">
            Psychology-backed cold emails and LinkedIn connection pitches for founders and recruiters.
          </p>
        </div>

        {/* Target Job Selector */}
        {selectedJob && (
          <div className="flex items-center gap-2">
            <select
              value={selectedJob.id}
              onChange={(e) => setSelectedJobId(Number(e.target.value))}
              className="bg-white border border-[#E2E8F0] rounded-[8px] px-3 py-1.5 text-xs text-[#0F172A] outline-none focus:border-[#4F46E5] max-w-xs font-medium"
            >
              {jobs.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.company} — {j.jobTitle}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Intelligence & Contacts */}
        <div className="space-y-4">
          {/* Target Company & Contact Intel */}
          <Card className="ag-card p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-2">
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-[#4F46E5]" />
                <h3 className="text-sm font-bold text-[#0F172A]">{selectedJob?.company}</h3>
              </div>
              <a href={selectedJob?.jobUrl} target="_blank" rel="noreferrer" className="text-[#4F46E5] hover:underline text-[11px] font-medium flex items-center gap-1">
                Posting <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="space-y-2 text-xs text-[#334155]">
              <div className="flex items-center justify-between">
                <span className="text-[#64748B]">Target Role:</span>
                <span className="font-semibold text-[#0F172A]">{selectedJob?.jobTitle}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#64748B]">Decision Maker:</span>
                <span className="font-semibold text-[#0F172A]">{selectedJob?.hrName || 'Hiring Team'}</span>
              </div>
              {selectedJob?.hrEmail && (
                <div className="flex items-center justify-between">
                  <span className="text-[#64748B]">Email:</span>
                  <span className="font-mono text-[11px] text-[#047857]">{selectedJob.hrEmail}</span>
                </div>
              )}
            </div>

            <Button
              onClick={handleDiscoverContact}
              disabled={discovering}
              variant="outline"
              size="sm"
              className="w-full text-[#4F46E5] border-[#C7D2FE] bg-[#EEF2FF] hover:bg-[#E0E7FF] font-semibold"
            >
              <Search className="w-3.5 h-3.5" />
              {discovering ? 'Searching Intel...' : 'Discover Decision Maker Contact'}
            </Button>
          </Card>

          {/* Quick Search External Links */}
          <Card className="ag-card p-4 space-y-2.5">
            <h3 className="font-bold text-xs text-[#0F172A] uppercase font-mono">External Outreach Links</h3>
            {selectedJob?.linkedinPeopleSearch && (
              <a href={selectedJob.linkedinPeopleSearch} target="_blank" rel="noreferrer" className="block">
                <Button variant="outline" size="sm" className="w-full justify-start text-[#4F46E5] border-[#C7D2FE]">
                  <Linkedin className="w-3.5 h-3.5 mr-2 text-[#4F46E5]" /> Search Founders on LinkedIn
                </Button>
              </a>
            )}
            {selectedJob?.googleLinkedinSearch && (
              <a href={selectedJob.googleLinkedinSearch} target="_blank" rel="noreferrer" className="block">
                <Button variant="outline" size="sm" className="w-full justify-start text-[#475569]">
                  <Globe className="w-3.5 h-3.5 mr-2 text-[#64748B]" /> Search Emails via Google
                </Button>
              </a>
            )}
          </Card>
        </div>

        {/* Right 2 Columns: Email Pitch Generator & Preview */}
        <div className="lg:col-span-2 space-y-4">
          {/* Angle Tabs */}
          <div className="flex items-center gap-2 bg-[#F1F5F9] p-1 rounded-[8px]">
            <button
              onClick={() => setTargetRole('founder')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-[6px] transition-all cursor-pointer ${
                targetRole === 'founder' ? 'bg-[#4F46E5] text-white shadow-xs' : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              Founder / CTO Angle
            </button>
            <button
              onClick={() => setTargetRole('recruiter')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-[6px] transition-all cursor-pointer ${
                targetRole === 'recruiter' ? 'bg-[#4F46E5] text-white shadow-xs' : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              Recruiter / HR Angle
            </button>
            <button
              onClick={() => setTargetRole('referral')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-[6px] transition-all cursor-pointer ${
                targetRole === 'referral' ? 'bg-[#4F46E5] text-white shadow-xs' : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              Employee Referral Angle
            </button>
            <button
              onClick={() => setTargetRole('linkedin')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-[6px] transition-all cursor-pointer ${
                targetRole === 'linkedin' ? 'bg-[#4F46E5] text-white shadow-xs' : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              300-Char LinkedIn Connection
            </button>
          </div>

          {/* Email Subject & Body Box */}
          <Card className="ag-card p-4 space-y-4">
            {targetRole !== 'linkedin' && (
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[11px] font-bold text-[#0F172A] uppercase font-mono">Email Subject Line</label>
                  <Button size="sm" variant="ghost" onClick={() => copyToClipboard(currentSubject, true)} className="h-6 text-[10px] px-2 text-[#4F46E5]">
                    {copiedSubject ? <Check className="w-3 h-3 text-[#10B981]" /> : <Copy className="w-3 h-3" />} Copy Subject
                  </Button>
                </div>
                <input
                  type="text"
                  value={currentSubject}
                  onChange={(e) => setCurrentSubject(e.target.value)}
                  className="ag-input w-full font-medium text-xs text-[#0F172A]"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[11px] font-bold text-[#0F172A] uppercase font-mono">Message Pitch Content</label>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="ghost" onClick={handleGenerateOutreach} disabled={generating} className="h-6 text-[10px] px-2 text-[#4F46E5]">
                    <RefreshCw className={`w-3 h-3 ${generating ? 'animate-spin' : ''}`} /> Regenerate
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => copyToClipboard(currentBody, false)} className="h-6 text-[10px] px-2 text-[#4F46E5]">
                    {copiedNote ? <Check className="w-3 h-3 text-[#10B981]" /> : <Copy className="w-3 h-3" />} Copy Message
                  </Button>
                </div>
              </div>

              <textarea
                value={currentBody}
                onChange={(e) => setCurrentBody(e.target.value)}
                className="w-full h-72 bg-[#F8FAFC] border border-[#E2E8F0] rounded-[8px] p-4 font-mono text-xs text-[#0F172A] whitespace-pre-wrap leading-relaxed outline-none focus:border-[#4F46E5] resize-none"
              />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
