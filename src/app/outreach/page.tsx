'use client';
import { useState } from 'react';
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
} from 'lucide-react';

export default function OutreachHubPage() {
  const [targetRole, setTargetRole] = useState<'founder' | 'recruiter' | 'engineering'>('founder');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const sampleData = {
    founder: {
      title: 'Founder / CTO Angle',
      psychology: 'Competence & Speed (Reciprocity)',
      style: 'Direct, concise, builder-focused',
      bestTime: 'Tuesday / Thursday 8:30 AM',
      hook: "I built FlowForge, a real-time CPM engine using LangChain and WebSocket that models project dependencies as live graphs — the kind of systems-level thinking I'd bring to your early team.",
      email: `Subject: Full-Stack Builder for Engineering at Startup

Hi Founder,

I noticed your team is scaling fast. As a full-stack engineer who recently built FlowForge (a real-time critical path orchestration engine using LangChain, OpenAI, and Redis), I specialize in building event-driven web applications from scratch.

I also designed and deployed production management systems for two freelance clients end-to-end. I'd love to bring that speed and ownership to your technical roadmap.

Would you be open to a 10-minute chat this week?

Best regards,
Saikat Maji`,
      linkedin: `Hi! I built real-time systems (FlowForge — LangChain + WebSocket CPM engine) and delivered full-stack freelance projects. Interested in software engineering at your startup. Would love to connect!`,
    },
    recruiter: {
      title: 'Recruiter / Talent Angle',
      psychology: 'Social Proof & Reliability',
      style: 'Structured, polite, culture-fit focused',
      bestTime: 'Monday / Wednesday 9:30 AM',
      hook: 'I am a Computer Science graduate with hands-on client delivery experience in full-stack MERN development and production CI/CD deployments.',
      email: `Subject: Application: Software Engineer — Saikat Maji

Hi Talent Acquisition Team,

I recently submitted my application for the Software Engineer role. My technical background spans the MERN stack (MongoDB, Express.js, React.js, Node.js), TypeScript, Next.js, and REST API design.

Beyond my CS coursework at JIS University, I have delivered full-stack production systems for two freelance clients and built TrackChat, a real-time chat and device tracking app using Socket.io and Leaflet.js.

I look forward to discussing how my technical skills align with your hiring goals.

Best regards,
Saikat Maji`,
      linkedin: `Hi! I applied for the Software Engineer role. I bring full-stack MERN, TypeScript, and real-time WebSocket experience with proven client project delivery. Would love to connect!`,
    },
    engineering: {
      title: 'Engineering Manager Angle',
      psychology: 'Technical Depth & Specificity',
      style: 'Systems design focus, code-quality oriented',
      bestTime: 'Tuesday 10:00 AM',
      hook: 'I engineered topological sort and cycle detection algorithms from scratch for a real-time CPM graph engine with Socket.io and Redis broadcasting.',
      email: `Subject: Engineering Inquiry: SDE Role — Saikat Maji

Hi Engineering Lead,

I wanted to reach out regarding engineering positions on your team. I work primarily in TypeScript, Node.js, Express.js, and React.js, with a strong focus on real-time architectures and AI integrations.

In my recent project FlowForge, I built a CPM graph algorithm engine from scratch and integrated LangChain for automated dependency detection. I focus heavily on clean REST design, WebSocket event handling, and core CS fundamentals.

I'd welcome the opportunity to share code samples or discuss your current engineering challenges.

Best regards,
Saikat Maji`,
      linkedin: `Hi! I built a real-time CPM graph engine with Socket.io, Redis, and LangChain from scratch. I work deeply with TypeScript, Node.js, and React. Would love to connect with your engineering team!`,
    },
  };

  const current = sampleData[targetRole];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 page-fade">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#FAFAFA] flex items-center gap-2.5">
            <Send className="w-6 h-6 text-[#6366f1]" />
            <span>Outreach Hub</span>
          </h1>
          <p className="text-sm text-[#A1A1AA] mt-0.5">
            Psychology-based cold outreach & LinkedIn connection note generator.
          </p>
        </div>
      </div>

      {/* Target Angle Selector */}
      <div className="flex items-center gap-2 border-b border-[rgba(255,255,255,0.08)] pb-4">
        <button
          onClick={() => setTargetRole('founder')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
            targetRole === 'founder'
              ? 'bg-[#6366f1] text-white shadow-sm'
              : 'bg-[#18181B] text-[#A1A1AA] hover:text-white border border-[rgba(255,255,255,0.08)]'
          }`}
        >
          🚀 Founder / CTO Angle
        </button>
        <button
          onClick={() => setTargetRole('recruiter')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
            targetRole === 'recruiter'
              ? 'bg-[#6366f1] text-white shadow-sm'
              : 'bg-[#18181B] text-[#A1A1AA] hover:text-white border border-[rgba(255,255,255,0.08)]'
          }`}
        >
          👤 HR / Recruiter Angle
        </button>
        <button
          onClick={() => setTargetRole('engineering')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
            targetRole === 'engineering'
              ? 'bg-[#6366f1] text-white shadow-sm'
              : 'bg-[#18181B] text-[#A1A1AA] hover:text-white border border-[rgba(255,255,255,0.08)]'
          }`}
        >
          💻 Engineering Lead Angle
        </button>
      </div>

      {/* Main Grid: Left Psychology Profile, Right Copy Hub */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Psychology Summary */}
        <div className="space-y-4">
          <Card className="ag-card p-5 space-y-4">
            <h3 className="font-semibold text-sm text-[#FAFAFA] flex items-center gap-2">
              <Brain className="w-4 h-4 text-[#818cf8]" />
              <span>Psychology Strategy</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[#71717A] text-[11px] font-mono uppercase block">Target Angle</span>
                <span className="text-[#FAFAFA] font-medium">{current.title}</span>
              </div>
              <div>
                <span className="text-[#71717A] text-[11px] font-mono uppercase block">Core Influence Lever</span>
                <span className="text-[#34d399] font-medium">{current.psychology}</span>
              </div>
              <div>
                <span className="text-[#71717A] text-[11px] font-mono uppercase block">Communication Tone</span>
                <span className="text-[#A1A1AA]">{current.style}</span>
              </div>
              <div>
                <span className="text-[#71717A] text-[11px] font-mono uppercase block flex items-center gap-1">
                  <Clock className="w-3 h-3 text-[#818cf8]" /> Recommended Dispatch Window
                </span>
                <span className="text-[#818cf8] font-mono">{current.bestTime}</span>
              </div>
            </div>
          </Card>

          <Card className="ag-card p-5 space-y-3">
            <h3 className="font-semibold text-sm text-[#FAFAFA]">
              Project Hook Referenced
            </h3>
            <p className="text-xs text-[#A1A1AA] bg-[#111827] p-3 rounded-lg border border-[rgba(255,255,255,0.08)] font-mono leading-relaxed">
              "{current.hook}"
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
                <span>Cold Email Message</span>
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(current.email, 'email')}
                className="h-7 text-xs bg-[#111827] text-[#FAFAFA] border-[rgba(255,255,255,0.08)] gap-1.5"
              >
                {copiedField === 'email' ? <Check className="w-3.5 h-3.5 text-[#34d399]" /> : <Copy className="w-3.5 h-3.5 text-[#71717A]" />}
                <span>{copiedField === 'email' ? 'Copied' : 'Copy'}</span>
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
                <Linkedin className="w-4 h-4 text-[#818cf8]" />
                <span>LinkedIn Connection Note (&lt; 280 chars)</span>
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(current.linkedin, 'linkedin')}
                className="h-7 text-xs bg-[#111827] text-[#FAFAFA] border-[rgba(255,255,255,0.08)] gap-1.5"
              >
                {copiedField === 'linkedin' ? <Check className="w-3.5 h-3.5 text-[#34d399]" /> : <Copy className="w-3.5 h-3.5 text-[#71717A]" />}
                <span>{copiedField === 'linkedin' ? 'Copied' : 'Copy'}</span>
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
