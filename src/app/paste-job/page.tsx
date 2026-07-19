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
    <div className="p-12 max-w-3xl mx-auto space-y-6 select-none animate-in fade-in duration-300">
      
      {/* Notion Breadcrumbs */}
      <div className="text-xs text-neutral-500 flex items-center gap-1.5 font-normal">
        <span>Saikat's Workspace</span>
        <span>/</span>
        <span className="text-neutral-400 font-medium">📝 Manual Paste</span>
      </div>

      {/* Page Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight text-neutral-100 flex items-center gap-3">
          <span>📝</span> Manual Job Import
        </h1>
        <p className="text-neutral-400 text-sm">
          Paste unstructured job postings from WhatsApp, Telegram, or email messages here.
        </p>
      </div>

      {/* Paste Card Form */}
      <Card className="border-[#2f2f2f] bg-[#202020] rounded shadow-none">
        <CardHeader className="pb-3 border-b border-[#2f2f2f]">
          <CardTitle className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
            📋 Raw Job Posting Text
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <textarea
              className="w-full h-56 p-4 rounded bg-[#191919] border border-[#2f2f2f] text-neutral-200 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none font-mono text-xs leading-relaxed"
              placeholder="Paste raw text, JD description or message here..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              disabled={loading}
            />
            
            <div className="flex justify-between items-center flex-wrap gap-2 pt-2">
              <div className="text-[11px] text-neutral-500 max-w-md">
                The AI pipeline will extract the job title, company, location, and description, check tech-fit eligibility, and insert it into your workspace database automatically.
              </div>
              <Button type="submit" disabled={loading || text.trim().length === 0} className="h-8 px-5 text-xs bg-blue-650 hover:bg-blue-700 text-white font-medium rounded shadow-none">
                {loading ? 'Processing...' : 'Submit Job'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Result Callouts */}
      {result && (
        <div className="space-y-3">
          {result.error && (
            <div className="notion-callout border-red-900/30 bg-red-950/10 text-red-400 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <div>
                <h4 className="font-semibold mb-0.5">Error processing job posting</h4>
                <p className="text-neutral-400">{result.error}</p>
              </div>
            </div>
          )}

          {result.status === 'rejected' && (
            <div className="notion-callout border-orange-900/30 bg-orange-950/10 text-orange-400 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <div>
                <h4 className="font-semibold mb-1">Job Rejected (Failed Filter Criteria)</h4>
                <p className="text-neutral-400 mb-2 leading-relaxed">{result.reason}</p>
                {result.extracted && (
                  <div className="text-[11px] bg-[#191919] p-3 rounded text-neutral-400 border border-[#2f2f2f]/60 font-mono space-y-1">
                    <p><strong>Title:</strong> {result.extracted.title}</p>
                    <p><strong>Company:</strong> {result.extracted.company}</p>
                    <p><strong>Location:</strong> {result.extracted.location}</p>
                    <p><strong>Salary:</strong> {result.extracted.salary}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {result.status === 'accepted' && (
            <div className="notion-callout border-green-900/30 bg-green-950/10 text-green-400 text-xs">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <div>
                <h4 className="font-semibold mb-1">Job Accepted and Saved!</h4>
                <p className="text-neutral-400 mb-2">Category: {result.category}</p>
                <div className="text-[11px] bg-[#191919] p-3 rounded text-neutral-400 border border-[#2f2f2f]/60 font-mono space-y-1">
                  <p><strong>Title:</strong> {result.job.jobTitle}</p>
                  <p><strong>Company:</strong> {result.job.company}</p>
                  <p><strong>Location:</strong> {result.job.location}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
