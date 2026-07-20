'use client';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

export default function PasteJobPage() {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim().length < 20) {
      alert('Please paste at least a full sentence or two.');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/jobs/manual-paste', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      setResult(data);
      if (data.status === 'accepted') {
        setText(''); // Clear on success
      }
    } catch (err) {
      setResult({ error: 'Failed to connect to server' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-12 max-w-4xl mx-auto space-y-8 select-none relative animate-in fade-in duration-500">
      
      {/* Background Aura Glows */}
      <div className="absolute top-0 right-1/4 w-80 h-80 bg-indigo-600/5 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Notion Breadcrumbs */}
      <div className="text-[11px] text-neutral-500 flex items-center gap-1.5 font-mono uppercase tracking-wider relative z-10">
        <span>Cosmic Hub</span>
        <span>/</span>
        <span className="text-indigo-400 font-medium">📝 Manual Paste</span>
      </div>

      {/* Page Header */}
      <div className="space-y-1 relative z-10">
        <h1 className="text-4xl font-extrabold tracking-tight text-neutral-100 flex items-center gap-3">
          <span>📝</span> <span className="gradient-text-cosmic">Manual Import</span>
        </h1>
        <p className="text-neutral-400 text-[14.5px] font-light leading-relaxed max-w-xl">
          Instantly ingest raw job descriptions, emails, or chat messages. Our AI extracts structure and verifies tech-fit automatically.
        </p>
      </div>

      {/* Paste Card Form */}
      <Card className="glass-panel bg-[#0d0d12]/65 border-white/5 rounded-2xl shadow-xl overflow-hidden relative z-10">
        <CardHeader className="pb-3 border-b border-white/5">
          <CardTitle className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-2 font-mono">
            📋 RAW JOB DETAILS TEXT
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <textarea
              className="w-full h-56 p-4 rounded-xl bg-[#050508]/85 border border-white/5 text-neutral-300 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 resize-none font-mono text-[11.5px] leading-relaxed transition-all"
              placeholder="Paste raw JD descriptions, email copy, WhatsApp/Telegram screenshots text here..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              disabled={loading}
            />
            
            <div className="flex justify-between items-center flex-wrap gap-4 pt-2.5">
              <div className="text-[10.5px] text-neutral-500 max-w-md font-light leading-normal">
                AI extraction parses title, company, salary, location, tech-stack criteria, and evaluates candidates dynamically before saving to the database registry.
              </div>
              <Button type="submit" disabled={loading || text.trim().length === 0} className="button-premium h-9 px-6 text-xs font-semibold rounded-xl transition-all shadow-lg border-none">
                {loading ? 'Processing Workspace...' : 'Submit to Pipeline'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Result Callouts */}
      {result && (
        <div className="space-y-3.5 relative z-10">
          {result.error && (
            <div className="glass-panel p-4.5 rounded-xl border-red-900/30 bg-red-950/10 text-red-400 text-xs flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 text-red-400" />
              <div>
                <h4 className="font-semibold mb-0.5 text-xs text-red-300">Extraction Error</h4>
                <p className="text-neutral-400 leading-relaxed font-light">{result.error}</p>
              </div>
            </div>
          )}

          {result.status === 'rejected' && (
            <div className="glass-panel p-4.5 rounded-xl border-orange-900/30 bg-orange-950/10 text-orange-400 text-xs flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 text-orange-400" />
              <div>
                <h4 className="font-semibold mb-1 text-xs text-orange-300">Listing Filtered (Rejected)</h4>
                <p className="text-neutral-400 mb-3 leading-relaxed font-light">{result.reason}</p>
                {result.extracted && (
                  <div className="text-[10.5px] bg-[#050508]/85 p-3 rounded-xl text-neutral-400 border border-white/5 font-mono space-y-1.5">
                    <p><strong>Detected Title:</strong> <span className="text-neutral-200">{result.extracted.title}</span></p>
                    <p><strong>Company Name:</strong> <span className="text-neutral-200">{result.extracted.company}</span></p>
                    <p><strong>Job Location:</strong> <span className="text-neutral-200">{result.extracted.location}</span></p>
                  </div>
                )}
              </div>
            </div>
          )}

          {result.status === 'accepted' && (
            <div className="glass-panel p-4.5 rounded-xl border-green-900/30 bg-green-950/10 text-green-400 text-xs flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 shrink-0 text-green-400" />
              <div>
                <h4 className="font-semibold mb-1 text-xs text-green-300">Job Registry Ingestion Successful!</h4>
                <p className="text-neutral-400 mb-3">Workspace category: {result.category}</p>
                <div className="text-[10.5px] bg-[#050508]/85 p-3 rounded-xl text-neutral-400 border border-white/5 font-mono space-y-1.5">
                  <p><strong>Title:</strong> <span className="text-neutral-200">{result.job.jobTitle}</span></p>
                  <p><strong>Company:</strong> <span className="text-neutral-200">{result.job.company}</span></p>
                  <p><strong>Location Type:</strong> <span className="text-neutral-200">{result.job.location}</span></p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
