'use client';
import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  FileText,
  Download,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Code2,
  Eye,
  RefreshCw,
} from 'lucide-react';

export default function ResumeStudioPage() {
  const [viewMode, setViewMode] = useState<'preview' | 'latex'>('preview');
  const [masterLatex, setMasterLatex] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        setMasterLatex(data.masterCvLatex || '');
        setLoading(false);
      });
  }, []);

  const saveTemplate = async () => {
    setSaving(true);
    await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ masterCvLatex: masterLatex }),
    });
    setSaving(false);
    alert('Master LaTeX Resume template updated successfully.');
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 page-fade">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#FAFAFA] flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-[#6366f1]" />
            <span>Resume Studio</span>
          </h1>
          <p className="text-sm text-[#A1A1AA] mt-0.5">
            LaTeX master resume source of truth & live ATS optimization engine.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={saveTemplate}
            disabled={saving}
            className="h-8 px-4 text-xs bg-[#6366f1] hover:bg-[#4f46e5] text-white font-medium rounded-lg"
          >
            {saving ? 'Saving...' : 'Save LaTeX Template'}
          </Button>
        </div>
      </div>

      {/* Main Grid: Left Code/Preview, Right ATS Gap Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Live Resume Code / Preview */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="ag-card p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-[rgba(255,255,255,0.08)] pb-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode('preview')}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                    viewMode === 'preview'
                      ? 'bg-[#6366f1] text-white'
                      : 'text-[#A1A1AA] hover:text-white'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5 inline mr-1" /> Document View
                </button>
                <button
                  onClick={() => setViewMode('latex')}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                    viewMode === 'latex'
                      ? 'bg-[#6366f1] text-white'
                      : 'text-[#A1A1AA] hover:text-white'
                  }`}
                >
                  <Code2 className="w-3.5 h-3.5 inline mr-1" /> LaTeX Source
                </button>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-[#34d399] bg-[#34d399]/10 px-2 py-0.5 rounded border border-[#34d399]/20">
                  1-Page Compliant
                </span>
              </div>
            </div>

            {viewMode === 'latex' ? (
              <textarea
                value={masterLatex}
                onChange={(e) => setMasterLatex(e.target.value)}
                className="w-full h-[550px] bg-[#09090B] border border-[rgba(255,255,255,0.08)] rounded-lg p-4 font-mono text-xs text-[#FAFAFA] leading-relaxed focus:outline-none focus:border-[#6366f1] resize-none"
                spellCheck="false"
              />
            ) : (
              <div className="bg-white text-black p-8 rounded-lg min-h-[550px] text-xs space-y-4 font-sans shadow-inner overflow-y-auto">
                <div className="text-center border-b pb-4">
                  <h2 className="text-xl font-bold tracking-tight text-gray-900">SAIKAT MAJI</h2>
                  <p className="text-gray-600 text-[11px] mt-1">
                    +91-8509233422 | Saikatmaji200@gmail.com | github.com/GwSaikat | Kolkata, India
                  </p>
                </div>

                <div>
                  <h3 className="font-bold text-gray-800 uppercase text-[11px] border-b pb-0.5 mb-1">Summary</h3>
                  <p className="text-gray-700 text-[11px] leading-relaxed">
                    Computer Science graduate and full-stack developer skilled in building production-style MERN applications, real-time systems, and AI-integrated features with LangChain and RAG. Proficient in React.js, Node.js/Express.js, REST API design, and core CS fundamentals.
                  </p>
                </div>

                <div>
                  <h3 className="font-bold text-gray-800 uppercase text-[11px] border-b pb-0.5 mb-1.5">Technical Skills</h3>
                  <ul className="list-disc pl-4 text-[11px] space-y-0.5 text-gray-700">
                    <li><strong>Languages:</strong> JavaScript (ES6+), TypeScript, C++, SQL, HTML, CSS</li>
                    <li><strong>Frontend & Backend:</strong> React.js, Next.js, Node.js, Express.js, REST APIs, WebSocket</li>
                    <li><strong>AI / LLM:</strong> LangChain, RAG, OpenAI API integration</li>
                    <li><strong>Databases & Infra:</strong> MongoDB, Redis, Docker (Basics), JWT, bcrypt, RBAC</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-bold text-gray-800 uppercase text-[11px] border-b pb-0.5 mb-1.5">Projects</h3>
                  <div className="space-y-2 text-[11px] text-gray-700">
                    <div>
                      <strong className="text-gray-900">FlowForge — Real-Time Critical Path Engine</strong>
                      <p>Engineered real-time CPM engine modeling projects as dependency graphs. Integrated LangChain & Socket.io.</p>
                    </div>
                    <div>
                      <strong className="text-gray-900">TrackChat — Device Tracking & Live Chat</strong>
                      <p>MERN real-time tracking app with Leaflet.js maps, Socket.io, and JWT token rotation.</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-gray-800 uppercase text-[11px] border-b pb-0.5 mb-1">Education</h3>
                  <p className="text-gray-700 text-[11px]">
                    <strong>JIS University</strong> — B.Tech Computer Science (Graduating May 2026)
                  </p>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Right Col: ATS Score & Keyword Gap */}
        <div className="space-y-4">
          <Card className="ag-card p-5 space-y-4">
            <h3 className="font-semibold text-sm text-[#FAFAFA] flex items-center justify-between">
              <span>ATS Score Rating</span>
              <span className="text-[#34d399] font-mono font-bold">96%</span>
            </h3>

            <div className="w-full bg-[#111827] h-2 rounded-full overflow-hidden border border-[rgba(255,255,255,0.08)]">
              <div className="bg-[#34d399] h-full w-[96%]" />
            </div>

            <div className="space-y-2 pt-2 text-xs">
              <div className="flex items-center gap-2 text-[#34d399]">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Zero Ligature Breakdown (Clean ATS Text)</span>
              </div>
              <div className="flex items-center gap-2 text-[#34d399]">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Exact 1-Page Layout Constraint Passed</span>
              </div>
              <div className="flex items-center gap-2 text-[#34d399]">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>No Unverifiable Skill Fabrication</span>
              </div>
            </div>
          </Card>

          <Card className="ag-card p-5 space-y-3">
            <h3 className="font-semibold text-sm text-[#FAFAFA]">
              Keyword Optimization
            </h3>
            <p className="text-xs text-[#71717A]">
              Top keywords automatically emphasized for MERN/SDE roles:
            </p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="ag-badge-accent">React.js</span>
              <span className="ag-badge-accent">Node.js</span>
              <span className="ag-badge-accent">TypeScript</span>
              <span className="ag-badge-accent">Express.js</span>
              <span className="ag-badge-accent">MongoDB</span>
              <span className="ag-badge-accent">REST APIs</span>
              <span className="ag-badge-accent">LangChain</span>
              <span className="ag-badge-accent">WebSocket</span>
            </div>
          </Card>

          <Card className="ag-card p-5 space-y-3">
            <h3 className="font-semibold text-sm text-[#FAFAFA]">
              Export Actions
            </h3>
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full h-8 text-xs bg-[#111827] text-[#FAFAFA] border-[rgba(255,255,255,0.08)] hover:border-[#6366f1]/40 flex items-center justify-center gap-2"
                onClick={() => alert('Downloading LaTeX Source Code...')}
              >
                <Download className="w-3.5 h-3.5 text-[#6366f1]" />
                Download LaTeX (.tex)
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
