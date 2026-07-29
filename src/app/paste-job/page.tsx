'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle2, ClipboardPaste, Sparkles, FileText, ArrowRight } from 'lucide-react';

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
        setText('');
      }
    } catch {
      setResult({ error: 'Failed to connect to server' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 page-fade">
      {/* Page Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-[#0F172A] flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-[8px] bg-[#EEF2FF] border border-[#C7D2FE] flex items-center justify-center">
            <ClipboardPaste className="w-4 h-4 text-[#4F46E5]" />
          </div>
          Manual Job Import Studio
        </h1>
        <p className="text-[13px] text-[#475569]">
          Instantly ingest raw job descriptions, email copy, or recruiter messages. AI extracts company structure and technical criteria automatically.
        </p>
      </div>

      {/* Paste Card Form */}
      <Card className="bg-white border border-[#E2E8F0] rounded-[12px] shadow-xs overflow-hidden">
        <CardHeader className="py-3.5 px-5 border-b border-[#E2E8F0] bg-[#F8FAFC]">
          <CardTitle className="text-[11px] font-bold text-[#475569] uppercase tracking-wider flex items-center gap-2 font-mono">
            <FileText className="w-3.5 h-3.5 text-[#4F46E5]" />
            Raw Job Description Text Input
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <textarea
              className="w-full h-56 p-4 rounded-[8px] bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:ring-1 focus:ring-[#4F46E5] focus:border-[#4F46E5] resize-none font-mono text-[12px] leading-relaxed transition-all"
              placeholder="Paste raw job description, email body, or candidate criteria text here..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              disabled={loading}
            />

            <div className="flex justify-between items-center flex-wrap gap-4 pt-1">
              <div className="text-[11px] text-[#64748B] max-w-md leading-normal">
                AI extraction parses title, company, salary, location, tech-stack criteria, and evaluates candidate eligibility dynamically.
              </div>
              <Button
                type="submit"
                disabled={loading || text.trim().length === 0}
                className="h-9 px-5 text-xs font-semibold rounded-[8px] bg-[#4F46E5] text-white hover:bg-[#4338CA] transition-all shadow-xs cursor-pointer"
              >
                {loading ? 'Ingesting Job Description...' : 'Submit to Pipeline'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Result Callouts */}
      {result && (
        <div className="space-y-3">
          {result.error && (
            <div className="p-4 rounded-[10px] border border-[#FCA5A5] bg-[#FEF2F2] text-[#991B1B] text-xs flex items-start gap-3">
              <AlertCircle className="w-4 h-4 shrink-0 text-[#DC2626] mt-0.5" />
              <div>
                <h4 className="font-bold text-xs text-[#991B1B]">Extraction Error</h4>
                <p className="text-[#B91C1C] leading-relaxed mt-0.5">{result.error}</p>
              </div>
            </div>
          )}

          {result.status === 'rejected' && (
            <div className="p-4 rounded-[10px] border border-[#FDBA74] bg-[#FFF7ED] text-[#9A3412] text-xs flex items-start gap-3">
              <AlertCircle className="w-4 h-4 shrink-0 text-[#EA580C] mt-0.5" />
              <div>
                <h4 className="font-bold text-xs text-[#9A3412]">Listing Filtered (Criteria Unmet)</h4>
                <p className="text-[#C2410C] mb-2 leading-relaxed">{result.reason}</p>
                {result.extracted && (
                  <div className="text-[11px] bg-white p-3 rounded-[6px] text-[#475569] border border-[#FED7AA] font-mono space-y-1">
                    <p><strong>Detected Title:</strong> <span className="text-[#0F172A]">{result.extracted.title}</span></p>
                    <p><strong>Company Name:</strong> <span className="text-[#0F172A]">{result.extracted.company}</span></p>
                    <p><strong>Job Location:</strong> <span className="text-[#0F172A]">{result.extracted.location}</span></p>
                  </div>
                )}
              </div>
            </div>
          )}

          {result.status === 'accepted' && (
            <div className="p-4 rounded-[10px] border border-[#A7F3D0] bg-[#ECFDF5] text-[#065F46] text-xs flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-[#059669] mt-0.5" />
              <div>
                <h4 className="font-bold text-xs text-[#065F46]">Job Ingestion Successful!</h4>
                <p className="text-[#047857] mb-2">Category: {result.category}</p>
                <div className="text-[11px] bg-white p-3 rounded-[6px] text-[#475569] border border-[#6EE7B7] font-mono space-y-1">
                  <p><strong>Title:</strong> <span className="text-[#0F172A]">{result.job.jobTitle}</span></p>
                  <p><strong>Company:</strong> <span className="text-[#0F172A]">{result.job.company}</span></p>
                  <p><strong>Location:</strong> <span className="text-[#0F172A]">{result.job.location}</span></p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
