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
  Clock,
  Zap,
  Search,
  ExternalLink,
  ShieldCheck,
  TrendingUp,
  Globe,
  Briefcase,
  Users,
  Target,
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
  const [targetRole, setTargetRole] = useState<'founder' | 'recruiter' | 'engineering' | 'employee'>('founder');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Job selection state
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
  const [loadingJobs, setLoadingJobs] = useState(true);

  // Custom Generator Inputs
  const [customCompany, setCustomCompany] = useState('');
  const [customRole, setCustomRole] = useState('');
  const [customRecipient, setCustomRecipient] = useState('');
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await fetch('/api/jobs');
      const data = await res.json();
      const jobsList = Array.isArray(data) ? data : data.jobs || [];
      if (Array.isArray(jobsList)) {
        setJobs(jobsList);
        if (jobsList.length > 0) {
          setSelectedJobId(jobsList[0].id);
        }
      }
    } catch (err) {
      console.error('Failed fetching jobs for outreach:', err);
    } finally {
      setLoadingJobs(false);
    }
  };

  const copyToClipboard = (text: string, field: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const selectedJob = jobs.find((j) => j.id === selectedJobId);

  // Parse JSON blobs if available
  const parsedIntel = selectedJob?.companyIntel ? JSON.parse(selectedJob.companyIntel) : null;
  const parsedPsych = selectedJob?.psychProfile ? JSON.parse(selectedJob.psychProfile) : null;

  const triggerFullGeneration = async () => {
    if (!selectedJobId) return;
    setGenerating(true);
    try {
      const res = await fetch('/api/outreach/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId: selectedJobId }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchJobs();
      }
    } catch (err) {
      console.error('Failed generating outreach:', err);
    } finally {
      setGenerating(false);
    }
  };

  // Fallback sample data if no job selected or input custom
  const sampleData = {
    founder: {
      title: 'Founder / CTO Angle',
      psychology: 'Competence & Speed (Reciprocity)',
      style: 'Direct, concise, builder-focused',
      bestTime: 'Tuesday / Thursday 8:30 AM',
      hook: selectedJob?.jobTitle
        ? `I built FlowForge, a real-time CPM engine using LangChain and WebSocket — the kind of systems-level thinking I'd bring to the ${selectedJob.jobTitle} role at ${selectedJob.company}.`
        : "I built FlowForge, a real-time CPM engine using LangChain and WebSocket that models project dependencies as live graphs — the kind of systems-level thinking I'd bring to your early team.",
      email: selectedJob?.referralMessage || `Subject: Full-Stack Builder for Engineering at ${customCompany || selectedJob?.company || 'Startup'}

Hi ${customRecipient || selectedJob?.hrName || 'Founder'},

I noticed your team at ${customCompany || selectedJob?.company || 'your company'} is scaling fast. As a full-stack engineer who recently built FlowForge (a real-time critical path orchestration engine using LangChain, OpenAI, and Redis), I specialize in building event-driven web applications from scratch.

I also designed and deployed production management systems for two freelance clients end-to-end. I'd love to bring that speed and ownership to your technical roadmap.

Would you be open to a 10-minute chat this week?

Best regards,
Saikat Maji`,
      linkedin: selectedJob?.linkedinNote || `Hi ${customRecipient || selectedJob?.hrName || 'there'}! I built real-time systems (FlowForge — LangChain + WebSocket CPM engine) and delivered full-stack freelance projects. Interested in ${customRole || selectedJob?.jobTitle || 'software engineering'} at ${customCompany || selectedJob?.company || 'your startup'}. Would love to connect!`,
    },
    recruiter: {
      title: 'Recruiter / Talent Angle',
      psychology: 'Social Proof & Reliability',
      style: 'Structured, polite, culture-fit focused',
      bestTime: 'Monday / Wednesday 9:30 AM',
      hook: 'I am a Computer Science graduate with hands-on client delivery experience in full-stack MERN development and production CI/CD deployments.',
      email: selectedJob?.hrMessage || `Subject: Application: ${customRole || selectedJob?.jobTitle || 'Software Engineer'} — Saikat Maji

Hi ${customRecipient || selectedJob?.hrName || 'Talent Acquisition Team'},

I recently submitted my application for the ${customRole || selectedJob?.jobTitle || 'Software Engineer'} role at ${customCompany || selectedJob?.company || 'your company'}. My technical background spans the MERN stack (MongoDB, Express.js, React.js, Node.js), TypeScript, Next.js, and REST API design.

Beyond my CS coursework at JIS University, I have delivered full-stack production systems for two freelance clients and built TrackChat, a real-time chat and device tracking app using Socket.io and Leaflet.js.

I look forward to discussing how my technical skills align with your hiring goals.

Best regards,
Saikat Maji`,
      linkedin: selectedJob?.linkedinNote || `Hi ${customRecipient || selectedJob?.hrName || 'there'}! I applied for the ${customRole || selectedJob?.jobTitle || 'Software Engineer'} role at ${customCompany || selectedJob?.company || 'your company'}. I bring full-stack MERN, TypeScript, and real-time WebSocket experience. Would love to connect!`,
    },
    engineering: {
      title: 'Engineering Manager Angle',
      psychology: 'Technical Depth & Specificity',
      style: 'Systems design focus, code-quality oriented',
      bestTime: 'Tuesday 10:00 AM',
      hook: 'I engineered topological sort and cycle detection algorithms from scratch for a real-time CPM graph engine with Socket.io and Redis broadcasting.',
      email: selectedJob?.founderMessage || `Subject: Engineering Inquiry: ${customRole || selectedJob?.jobTitle || 'SDE Role'} — Saikat Maji

Hi ${customRecipient || selectedJob?.hrName || 'Engineering Lead'},

I wanted to reach out regarding engineering positions at ${customCompany || selectedJob?.company || 'your company'}. I work primarily in TypeScript, Node.js, Express.js, and React.js, with a strong focus on real-time architectures and AI integrations.

In my recent project FlowForge, I built a CPM graph algorithm engine from scratch and integrated LangChain for automated dependency detection. I focus heavily on clean REST design, WebSocket event handling, and core CS fundamentals.

I'd welcome the opportunity to share code samples or discuss your current engineering challenges.

Best regards,
Saikat Maji`,
      linkedin: selectedJob?.linkedinNote || `Hi ${customRecipient || selectedJob?.hrName || 'there'}! I built a real-time CPM graph engine with Socket.io, Redis, and LangChain from scratch. I work deeply with TypeScript, Node.js, and React. Would love to connect with your engineering team at ${customCompany || selectedJob?.company || 'your company'}!`,
    },
    employee: {
      title: 'Employee Referral Angle',
      psychology: 'Liking & Shared Tech Alignment',
      style: 'Peer-to-peer, low pressure, casual',
      bestTime: 'Wednesday / Thursday 2:00 PM',
      hook: 'I work with the same tech stack (React, Node, TypeScript) and built real-time WebSocket systems from scratch.',
      email: selectedJob?.employeeReferral || `Hi ${customRecipient || 'there'},

I noticed ${customCompany || selectedJob?.company || 'your company'} is hiring for ${customRole || selectedJob?.jobTitle || 'Software Engineer'}, and my background in full-stack MERN and real-time systems lines up closely with the role.

I built FlowForge (a real-time CPM engine using Socket.io and LangChain) and delivered production apps for two freelance clients. 

Would you be open to passing my resume along or connecting me with the hiring team? Appreciate your time!

Thanks,
Saikat Maji`,
      linkedin: `Hey ${customRecipient || 'there'}! Saw ${customCompany || selectedJob?.company || 'your team'} is hiring for ${customRole || selectedJob?.jobTitle || 'SDE'}. I build full-stack MERN/TS apps with real-time WebSockets (FlowForge). Would love to connect and ask a quick question about engineering there!`,
    },
  };

  const current = sampleData[targetRole];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 page-fade relative">
      {/* Background Subtle Ambient Glows */}
      <div className="absolute top-10 right-1/4 w-80 h-80 bg-[#c084fc]/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4 relative z-10">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#FAFAFA] flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#c084fc]/10 flex items-center justify-center">
              <Send className="w-4 h-4 text-[#c084fc]" />
            </div>
            <span>Outreach Hub v2.0</span>
          </h1>
          <p className="text-sm text-[#A1A1AA] mt-0.5">
            Autonomous contact discovery, company intelligence & psychological outreach suite.
          </p>
        </div>

        {/* Job selector dropdown */}
        <div className="flex items-center gap-3">
          <select
            value={selectedJobId || ''}
            onChange={(e) => setSelectedJobId(Number(e.target.value))}
            className="bg-[#141419] border border-[rgba(255,255,255,0.08)] rounded-xl px-3 py-2 text-xs text-[#FAFAFA] outline-none focus:border-[#6366f1] max-w-xs"
          >
            {jobs.map((j) => (
              <option key={j.id} value={j.id}>
                {j.company} — {j.jobTitle}
              </option>
            ))}
          </select>

          <Button
            onClick={triggerFullGeneration}
            disabled={generating || !selectedJobId}
            className="bg-[#6366f1] hover:bg-[#4f46e5] text-white text-xs px-3.5 py-2 rounded-xl gap-2 shadow-lg shadow-[#6366f1]/20 font-medium"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${generating ? 'animate-spin' : ''}`} />
            <span>{generating ? 'Researching...' : 'Re-Run Outreach Engine'}</span>
          </Button>
        </div>
      </div>

      {/* Contact Discovery Banner */}
      {selectedJob && (
        <Card className="ag-card p-4 space-y-3 relative z-10 border-l-4 border-l-[#818cf8]">
          <div className="flex justify-between items-center flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#6366f1]/10 flex items-center justify-center">
                <User className="w-5 h-5 text-[#818cf8]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-[#FAFAFA]">
                    {selectedJob.hrName || 'Hiring Manager / Team'}
                  </h3>
                  {selectedJob.contactConfidence && (
                    <Badge
                      className={`text-[10px] uppercase font-mono ${
                        selectedJob.contactConfidence === 'high'
                          ? 'bg-[#10b981]/10 text-[#34d399] border-[#10b981]/30'
                          : selectedJob.contactConfidence === 'medium'
                          ? 'bg-[#818cf8]/10 text-[#818cf8] border-[#818cf8]/30'
                          : 'bg-[#f59e0b]/10 text-[#fbbf24] border-[#f59e0b]/30'
                      }`}
                    >
                      {selectedJob.contactConfidence} confidence
                    </Badge>
                  )}
                  {selectedJob.contactSource && (
                    <Badge className="bg-[#141419] text-[#A1A1AA] text-[10px] font-mono border-[rgba(255,255,255,0.08)]">
                      via {selectedJob.contactSource}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-[#A1A1AA] mt-0.5">
                  {selectedJob.hrTitle || 'Decision Maker'} • {selectedJob.hrEmail || 'No direct email (LinkedIn search available)'}
                </p>
              </div>
            </div>

            {/* Quick search links */}
            <div className="flex items-center gap-2">
              {selectedJob.googleLinkedinSearch && (
                <a
                  href={selectedJob.googleLinkedinSearch}
                  target="_blank"
                  rel="noreferrer"
                  className="px-2.5 py-1.5 bg-[#141419] border border-[rgba(255,255,255,0.08)] hover:border-[#6366f1] rounded-lg text-xs text-[#A1A1AA] hover:text-[#FAFAFA] flex items-center gap-1.5 transition-all"
                >
                  <Search className="w-3 h-3 text-[#818cf8]" /> Google Dork
                </a>
              )}
              {selectedJob.linkedinPeopleSearch && (
                <a
                  href={selectedJob.linkedinPeopleSearch}
                  target="_blank"
                  rel="noreferrer"
                  className="px-2.5 py-1.5 bg-[#0077b5]/10 border border-[#0077b5]/30 hover:border-[#0077b5] rounded-lg text-xs text-[#38bdf8] flex items-center gap-1.5 transition-all"
                >
                  <Linkedin className="w-3 h-3 text-[#0077b5]" /> Find Recruiter
                </a>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Target Angle Selector */}
      <div className="flex items-center gap-2 border-b border-[rgba(255,255,255,0.08)] pb-4 relative z-10">
        <button
          onClick={() => setTargetRole('founder')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
            targetRole === 'founder'
              ? 'bg-[#6366f1] text-white shadow-sm'
              : 'bg-[#141419] text-[#A1A1AA] hover:text-white border border-[rgba(255,255,255,0.08)]'
          }`}
        >
          🚀 Founder / CTO Angle
        </button>
        <button
          onClick={() => setTargetRole('recruiter')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
            targetRole === 'recruiter'
              ? 'bg-[#6366f1] text-white shadow-sm'
              : 'bg-[#141419] text-[#A1A1AA] hover:text-white border border-[rgba(255,255,255,0.08)]'
          }`}
        >
          👤 HR / Recruiter Angle
        </button>
        <button
          onClick={() => setTargetRole('engineering')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
            targetRole === 'engineering'
              ? 'bg-[#6366f1] text-white shadow-sm'
              : 'bg-[#141419] text-[#A1A1AA] hover:text-white border border-[rgba(255,255,255,0.08)]'
          }`}
        >
          💻 Engineering Lead Angle
        </button>
        <button
          onClick={() => setTargetRole('employee')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
            targetRole === 'employee'
              ? 'bg-[#6366f1] text-white shadow-sm'
              : 'bg-[#141419] text-[#A1A1AA] hover:text-white border border-[rgba(255,255,255,0.08)]'
          }`}
        >
          🤝 Employee Referral Angle
        </button>
      </div>

      {/* Main Grid: Left Intelligence & Psychology, Right Copy Hub */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
        {/* Left Col: Company Intel + Psychology */}
        <div className="space-y-4">
          {/* Company Intel Card */}
          {parsedIntel && (
            <Card className="ag-card p-5 space-y-4">
              <h3 className="font-semibold text-sm text-[#FAFAFA] flex items-center gap-2">
                <Building className="w-4 h-4 text-[#38bdf8]" />
                <span>Company Intelligence</span>
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-[#71717A] text-[11px] font-mono uppercase block">Stage & Size</span>
                  <span className="text-[#FAFAFA] font-medium capitalize">
                    {parsedIntel.stage} • {parsedIntel.companySize || 'Unknown size'}
                  </span>
                </div>
                {parsedIntel.culture && parsedIntel.culture.length > 0 && (
                  <div>
                    <span className="text-[#71717A] text-[11px] font-mono uppercase block">Culture Trait</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {parsedIntel.culture.map((c: string, idx: number) => (
                        <Badge key={idx} className="bg-[#38bdf8]/10 text-[#38bdf8] text-[10px] font-mono border-none">
                          {c}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {parsedIntel.techStack && parsedIntel.techStack.length > 0 && (
                  <div>
                    <span className="text-[#71717A] text-[11px] font-mono uppercase block">Tech Stack Overlap</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {parsedIntel.techStack.slice(0, 6).map((t: string, idx: number) => (
                        <Badge key={idx} className="bg-[#6366f1]/10 text-[#818cf8] text-[10px] font-mono border-none">
                          {t}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {parsedIntel.recentNews && parsedIntel.recentNews.length > 0 && (
                  <div>
                    <span className="text-[#71717A] text-[11px] font-mono uppercase block">Recent Signal</span>
                    <p className="text-[#A1A1AA] italic line-clamp-2 mt-0.5">
                      "{parsedIntel.recentNews[0]}"
                    </p>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Psychology Strategy Card */}
          <Card className="ag-card p-5 space-y-4">
            <h3 className="font-semibold text-sm text-[#FAFAFA] flex items-center gap-2">
              <Brain className="w-4 h-4 text-[#c084fc]" />
              <span>Psychology Strategy</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[#71717A] text-[11px] font-mono uppercase block">Target Angle</span>
                <span className="text-[#FAFAFA] font-medium">{parsedPsych?.angle || current.title}</span>
              </div>
              <div>
                <span className="text-[#71717A] text-[11px] font-mono uppercase block">Influence Principle</span>
                <span className="text-[#34d399] font-medium">{parsedPsych?.influencePrinciple || current.psychology}</span>
              </div>
              {parsedPsych?.psychologicalRationale && (
                <div>
                  <span className="text-[#71717A] text-[11px] font-mono uppercase block">Psychological Rationale</span>
                  <p className="text-[#A1A1AA] mt-0.5 leading-relaxed">
                    {parsedPsych.psychologicalRationale}
                  </p>
                </div>
              )}
              <div>
                <span className="text-[#71717A] text-[11px] font-mono uppercase block flex items-center gap-1">
                  <Clock className="w-3 h-3 text-[#818cf8]" /> Recommended Window
                </span>
                <span className="text-[#818cf8] font-mono">{parsedPsych?.bestSendTime || current.bestTime}</span>
              </div>
            </div>
          </Card>

          <Card className="ag-card p-5 space-y-3">
            <h3 className="font-semibold text-sm text-[#FAFAFA]">
              Project Hook Referenced
            </h3>
            <p className="text-xs text-[#A1A1AA] bg-[#09090B] p-3 rounded-lg border border-[rgba(255,255,255,0.08)] font-mono leading-relaxed">
              "{parsedPsych?.hook || current.hook}"
            </p>
          </Card>
        </div>

        {/* Right 2 Cols: Message Templates */}
        <div className="lg:col-span-2 space-y-4">
          {/* Cold Email */}
          <Card className="ag-card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm text-[#FAFAFA] flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#818cf8]" />
                <span>Cold Email / Detailed Pitch</span>
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(current.email, 'email')}
                className="h-7 text-xs bg-[#111827] text-[#FAFAFA] border-[rgba(255,255,255,0.08)] gap-1.5"
              >
                {copiedField === 'email' ? <Check className="w-3.5 h-3.5 text-[#34d399]" /> : <Copy className="w-3.5 h-3.5 text-[#71717A]" />}
                <span>{copiedField === 'email' ? 'Copied' : 'Copy Email'}</span>
              </Button>
            </div>
            <pre className="w-full bg-[#09090B] border border-[rgba(255,255,255,0.08)] rounded-lg p-4 font-mono text-xs text-[#FAFAFA] whitespace-pre-wrap leading-relaxed">
              {current.email}
            </pre>
          </Card>

          {/* LinkedIn Message */}
          <Card className="ag-card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm text-[#FAFAFA] flex items-center gap-2">
                <Linkedin className="w-4 h-4 text-[#0077b5]" />
                <span>LinkedIn Connection Note (&lt; 280 chars)</span>
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(current.linkedin, 'linkedin')}
                className="h-7 text-xs bg-[#111827] text-[#FAFAFA] border-[rgba(255,255,255,0.08)] gap-1.5"
              >
                {copiedField === 'linkedin' ? <Check className="w-3.5 h-3.5 text-[#34d399]" /> : <Copy className="w-3.5 h-3.5 text-[#71717A]" />}
                <span>{copiedField === 'linkedin' ? 'Copied' : 'Copy Note'}</span>
              </Button>
            </div>
            <p className="w-full bg-[#09090B] border border-[rgba(255,255,255,0.08)] rounded-lg p-3 font-mono text-xs text-[#FAFAFA] leading-relaxed">
              {current.linkedin}
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
