'use client';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ClipboardPaste, AlertCircle, CheckCircle2 } from 'lucide-react';

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
    <div className="p-8 max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Manual Paste</h1>
        <p className="text-neutral-400">Paste job postings from WhatsApp, Telegram, or email here.</p>
      </div>

      <Card className="border-neutral-800 bg-neutral-900/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardPaste className="w-5 h-5 text-blue-400" />
            Paste Job Posting
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <textarea
              className="w-full h-64 p-4 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-200 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none font-mono text-sm"
              placeholder="Paste the full text of the message here..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              disabled={loading}
            />
            
            <div className="flex justify-between items-center">
              <div className="text-xs text-neutral-500">
                The AI will extract the details, run the location/salary filter, and add it to the database if it passes.
              </div>
              <Button type="submit" disabled={loading || text.trim().length === 0} className="px-8">
                {loading ? 'Processing...' : 'Submit Job'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {result && (
        <div className="mt-8">
          {result.error && (
            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold mb-1">Error processing job</h4>
                <p className="text-sm">{result.error}</p>
              </div>
            </div>
          )}

          {result.status === 'rejected' && (
            <div className="p-4 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold mb-1">Job Rejected (Failed Filter)</h4>
                <p className="text-sm mb-2">{result.reason}</p>
                {result.extracted && (
                  <div className="text-xs bg-neutral-950 p-3 rounded text-neutral-400 border border-neutral-800/50 mt-2">
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
            <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold mb-1">Job Accepted and Saved!</h4>
                <p className="text-sm mb-2">Category: {result.category}</p>
                <div className="text-xs bg-neutral-950 p-3 rounded text-neutral-400 border border-neutral-800/50 mt-2">
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
