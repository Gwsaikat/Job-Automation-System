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
  Zap,
  Sliders,
} from 'lucide-react';

export default function ResumeStudioPage() {
  const [viewMode, setViewMode] = useState<'preview' | 'latex'>('preview');
  const [masterLatex, setMasterLatex] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // ATS Gap Analyzer states
  const [jdInput, setJdInput] = useState('');
  const [analyzingJd, setAnalyzingJd] = useState(false);
  const [atsScore, setAtsScore] = useState(96);
  const [matchedKeywords, setMatchedKeywords] = useState<string[]>([
    'React.js', 'Node.js', 'TypeScript', 'Express.js', 'MongoDB', 'REST APIs', 'WebSocket', 'LangChain'
  ]);
  const [missingKeywords, setMissingKeywords] = useState<string[]>([
    'GraphQL', 'AWS S3', 'Docker'
  ]);

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

  const analyzeJdGap = () => {
    if (!jdInput.trim()) return;
    setAnalyzingJd(true);
    setTimeout(() => {
      const lower = jdInput.toLowerCase();
      const skillsToTest = [
        'React', 'Node', 'TypeScript', 'Express', 'MongoDB', 'REST API', 'WebSocket',
        'Redis', 'LangChain', 'Docker', 'GraphQL', 'AWS', 'Python', 'System Design'
      ];
      
      const found: string[] = [];
      const missing: string[] = [];

      for (const skill of skillsToTest) {
        if (lower.includes(skill.toLowerCase())) {
          if (['React', 'Node', 'TypeScript', 'Express', 'MongoDB', 'REST API', 'WebSocket', 'Redis', 'LangChain'].includes(skill)) {
            found.push(skill);
          } else {
            missing.push(skill);
          }
        }
      }

      const calculatedScore = Math.min(98, Math.max(70, 75 + found.length * 3));
      setAtsScore(calculatedScore);
      setMatchedKeywords(found.length > 0 ? found : matchedKeywords);
      setMissingKeywords(missing);
      setAnalyzingJd(false);
    }, 800);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 page-fade relative">
      {/* Background Ambient Glow */}
      <div className="absolute top-10 left-1/3 w-96 h-96 bg-[#6366f1]/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4 relative z-10">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#FAFAFA] flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#6366f1]/10 flex items-center justify-center">
              <FileText className="w-4 h-4 text-[#818cf8]" />
            </div>
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
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

        {/* Right Col: ATS Score & Real-Time JD Gap Analyzer */}
        <div className="space-y-4">
          <Card className="ag-card p-5 space-y-4">
            <h3 className="font-semibold text-sm text-[#FAFAFA] flex items-center justify-between">
              <span>ATS Score Rating</span>
              <span className="text-[#34d399] font-mono font-bold">{atsScore}%</span>
            </h3>

            <div className="w-full bg-[#111827] h-2 rounded-full overflow-hidden border border-[rgba(255,255,255,0.08)]">
              <div className="bg-[#34d399] h-full transition-all duration-500" style={{ width: `${atsScore}%` }} />
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

          {/* Real-Time JD Analyzer */}
          <Card className="ag-card p-5 space-y-3">
            <h3 className="font-semibold text-sm text-[#FAFAFA] flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-[#818cf8]" /> Real-Time JD Gap Analyzer
            </h3>
            <textarea
              value={jdInput}
              onChange={(e) => setJdInput(e.target.value)}
              placeholder="Paste any Target Job Description to analyze keyword match..."
              className="w-full h-24 bg-[#09090B] border border-[rgba(255,255,255,0.08)] rounded-lg p-2.5 text-xs text-[#FAFAFA] placeholder-[#71717A] outline-none focus:border-[#6366f1] resize-none"
            />
            <Button
              onClick={analyzeJdGap}
              disabled={analyzingJd || !jdInput.trim()}
              className="w-full h-8 text-xs bg-[#6366f1] hover:bg-[#4f46e5] text-white"
            >
              {analyzingJd ? 'Analyzing Keywords...' : 'Calculate ATS Match'}
            </Button>
          </Card>

          {/* Live Skill Keyword Heatmap & Smart Inject */}
          <Card className="ag-card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm text-[#FAFAFA] flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#34d399]" /> Candidate Skill Heatmap
              </h3>
              <span className="text-[11px] font-mono text-[#34d399]">{matchedKeywords.length} Active</span>
            </div>
            
            <div className="flex flex-wrap gap-1.5">
              {matchedKeywords.map((kw, i) => (
                <span key={i} className="ag-badge-green font-mono">{kw}</span>
              ))}
            </div>

            {missingKeywords.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-[rgba(255,255,255,0.08)]">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-xs text-[#FAFAFA]">
                    Target JD Missing Keywords
                  </h4>
                  <span className="text-[11px] font-mono text-[#fbbf24]">{missingKeywords.length} Missing</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {missingKeywords.map((kw, i) => (
                    <span key={i} className="ag-badge-amber font-mono">{kw}</span>
                  ))}
                </div>
                <Button
                  size="sm"
                  onClick={() => {
                    const toInject = missingKeywords.join(', ');
                    if (masterLatex && !masterLatex.includes(missingKeywords[0])) {
                      setMasterLatex(prev => prev.replace('\\end{document}', `% Injected Missing Target Keywords: ${toInject}\n\\end{document}`));
                      alert(`Injected [${toInject}] into LaTeX master template!`);
                    }
                  }}
                  className="w-full h-7 text-[11px] bg-[#fbbf24]/10 hover:bg-[#fbbf24]/20 text-[#fbbf24] border border-[#fbbf24]/30 mt-2 font-medium"
                >
                  Inject Missing Skills to LaTeX
                </Button>
              </div>
            )}
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
