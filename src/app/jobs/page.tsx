'use client';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, FileText, Mail, RefreshCw } from 'lucide-react';

export default function JobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchJobs = () => {
    setLoading(true);
    fetch('/api/jobs?limit=100')
      .then(res => res.json())
      .then(data => {
        setJobs(data.jobs || []);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const updateStatus = async (id: number, status: string) => {
    await fetch('/api/jobs', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, applicationStatus: status })
    });
    fetchJobs();
  };

  const processJob = async (id: number) => {
    alert('Processing started in background (CV Tailoring + Outreach drafts). Check back in a few minutes.');
    await fetch('/api/pipeline/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pipeline: 'job', jobId: id })
    });
  };

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">Jobs</h1>
          <p className="text-neutral-400">Manage your scraped jobs and applications.</p>
        </div>
        <Button onClick={fetchJobs} variant="outline" className="gap-2" disabled={loading}>
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <Card className="border-neutral-800 bg-neutral-900/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-neutral-400 uppercase bg-neutral-800/50 border-b border-neutral-800">
              <tr>
                <th className="px-6 py-4 font-medium">Job Title & Company</th>
                <th className="px-6 py-4 font-medium">Location & Salary</th>
                <th className="px-6 py-4 font-medium">HR Contact</th>
                <th className="px-6 py-4 font-medium">Score</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobs.length === 0 && !loading && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-neutral-500">
                    No jobs found. Run the scraper pipeline first.
                  </td>
                </tr>
              )}
              {jobs.map(job => (
                <tr key={job.id} className="border-b border-neutral-800/50 hover:bg-neutral-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-blue-400 mb-1">{job.jobTitle || 'Unknown Role'}</div>
                    <div className="text-neutral-400 text-xs flex items-center gap-2">
                      {job.company || 'Unknown Company'}
                      <Badge variant="outline" className="text-[10px] py-0 px-1.5 h-4 bg-neutral-800 border-neutral-700">
                        {job.source}
                      </Badge>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-neutral-300">{job.locationType}</div>
                    <div className="text-neutral-500 text-xs">{job.salaryDisplay}</div>
                  </td>
                  <td className="px-6 py-4">
                    {job.hrName || job.hrEmail ? (
                      <div className="text-xs">
                        {job.hrName && <div className="text-neutral-300 font-medium">{job.hrName}</div>}
                        {job.hrEmail && <div className="text-neutral-400">{job.hrEmail}</div>}
                      </div>
                    ) : (
                      <span className="text-neutral-600 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {job.atsScore ? (
                      <Badge variant={job.atsScore >= 90 ? 'success' : job.atsScore >= 70 ? 'warning' : 'outline'}>
                        {job.atsScore} / 100
                      </Badge>
                    ) : (
                      <span className="text-neutral-600 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <select 
                      className="bg-neutral-800 border border-neutral-700 text-neutral-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2 outline-none"
                      value={job.applicationStatus}
                      onChange={(e) => updateStatus(job.id, e.target.value)}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Applied">Applied</option>
                      <option value="Interview">Interview</option>
                      <option value="Rejected">Rejected</option>
                      <option value="Offer">Offer</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <a href={job.jobUrl} target="_blank" rel="noreferrer">
                      <Button variant="ghost" size="icon" title="View Original Posting">
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </a>
                    
                    {job.cvPdfPath ? (
                      <Button variant="outline" size="icon" title="View CV">
                        <FileText className="w-4 h-4 text-green-400" />
                      </Button>
                    ) : (
                      <Button variant="ghost" size="icon" title="Process CV & Outreach" onClick={() => processJob(job.id)}>
                        <FileText className="w-4 h-4 text-neutral-500 hover:text-blue-400" />
                      </Button>
                    )}

                    {job.coldMailDraftId ? (
                      <a href={`https://mail.google.com/mail/u/0/#drafts/${job.coldMailDraftId}`} target="_blank" rel="noreferrer">
                        <Button variant="outline" size="icon" title="View Gmail Draft">
                          <Mail className="w-4 h-4 text-purple-400" />
                        </Button>
                      </a>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
