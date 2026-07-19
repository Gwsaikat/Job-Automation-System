'use client';
import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, RefreshCw, Trash2, AlertCircle, Search, Mail, Linkedin, Globe } from 'lucide-react';

export default function JobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);
  const [clearResult, setClearResult] = useState<string | null>(null);
  
  // Filters
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');

  const fetchJobs = () => {
    setLoading(true);
    let url = `/api/jobs?limit=150`;
    if (status !== 'all') url += `&status=${status}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;

    fetch(url)
      .then(res => res.json())
      .then(data => {
        setJobs(data.jobs || []);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchJobs();
  }, [status]); // refetch when status dropdown changes

  // Trigger search on enter or button click
  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      fetchJobs();
    }
  };

  const updateStatus = async (id: number, newStatus: string) => {
    await fetch('/api/jobs', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, applicationStatus: newStatus })
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
    // Give a short delay and fetch status to show in-progress updates
    setTimeout(fetchJobs, 2000);
  };

  const clearDatabase = async () => {
    const confirmed = window.confirm(
      '⚠️ WARNING: This will permanently delete ALL data from the database.\n\n' +
      'This includes all jobs, rejected jobs, SDE challenges, funding leads, and app state.\n\n' +
      'Are you absolutely sure?'
    );
    if (!confirmed) return;

    setClearing(true);
    setClearResult(null);
    try {
      const res = await fetch('/api/database/clear', { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setClearResult(`✅ Database cleared successfully.`);
        fetchJobs();
      } else {
        setClearResult(`❌ Error: ${data.error}`);
      }
    } catch (err) {
      setClearResult(`❌ Network error: ${err}`);
    } finally {
      setClearing(false);
    }
  };

  return (
    <div className="p-12 max-w-5xl mx-auto space-y-6 select-none animate-in fade-in duration-300">
      
      {/* Notion Breadcrumbs */}
      <div className="text-xs text-neutral-500 flex items-center gap-1.5 font-normal">
        <span>Saikat's Workspace</span>
        <span>/</span>
        <span className="text-neutral-400 font-medium">💼 Jobs</span>
      </div>

      {/* Page Title */}
      <div className="flex justify-between items-start flex-wrap gap-3">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-neutral-100 flex items-center gap-3">
            <span>💼</span> Jobs Database
          </h1>
          <p className="text-neutral-400 text-sm">
            Manage your scraped job opportunities, ATS matching, and outreach status.
          </p>
        </div>
        
        <div className="flex gap-2 items-center">
          <Button onClick={fetchJobs} variant="outline" className="h-8 text-xs bg-[#202020] border-[#2f2f2f] hover:bg-[#2a2a2a] text-neutral-300 font-normal rounded gap-1.5 shadow-none">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            onClick={clearDatabase}
            variant="outline"
            className="h-8 text-xs bg-[#202020] border-red-900/30 text-red-400 hover:bg-red-950/20 hover:text-red-300 font-normal rounded gap-1.5 shadow-none"
            disabled={clearing}
          >
            <Trash2 className="w-3.5 h-3.5" />
            {clearing ? 'Clearing...' : 'Clear DB'}
          </Button>
        </div>
      </div>

      {/* Clear result notification */}
      {clearResult && (
        <div className="notion-callout border-green-800 bg-green-950/15 text-green-400 text-xs py-2.5 flex justify-between items-center">
          <span>{clearResult}</span>
          <button className="opacity-60 hover:opacity-100 font-bold" onClick={() => setClearResult(null)}>✕</button>
        </div>
      )}

      {/* Database Toolbar Filter */}
      <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-[#2f2f2f]/60 text-xs">
        {/* Text Search */}
        <div className="flex items-center bg-[#202020] border border-[#2f2f2f] rounded px-2.5 py-1 w-64">
          <span className="text-neutral-500 mr-2 text-xs">🔍</span>
          <input
            type="text"
            placeholder="Search by title, company, location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleSearchKeyPress}
            className="bg-transparent border-none text-neutral-200 outline-none w-full text-xs"
          />
        </div>
        <Button onClick={fetchJobs} variant="outline" className="h-7 text-xs bg-[#2a2a2a] border-[#2f2f2f] text-neutral-300 font-normal hover:bg-[#333] shadow-none">
          Search
        </Button>

        {/* Separator */}
        <div className="h-4 w-[1px] bg-[#2f2f2f] mx-2"></div>

        {/* Status Select */}
        <div className="flex items-center gap-1.5 text-neutral-400">
          <span>Status:</span>
          <select
            className="bg-[#202020] border border-[#2f2f2f] text-neutral-200 text-xs rounded px-2 py-0.5 outline-none cursor-pointer"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="all">All statuses</option>
            <option value="Pending">Pending</option>
            <option value="Applied">Applied</option>
            <option value="Interview">Interview</option>
            <option value="Rejected">Rejected</option>
            <option value="Offer">Offer</option>
          </select>
        </div>
      </div>

      {/* Database Table view */}
      <Card className="border-[#2f2f2f] bg-[#191919] overflow-hidden rounded shadow-none">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-neutral-300">
            <thead className="text-[11px] text-neutral-500 uppercase bg-[#202020]/60 border-b border-[#2f2f2f]">
              <tr>
                <th className="px-5 py-3 font-semibold tracking-wider">Job Role &amp; Company</th>
                <th className="px-5 py-3 font-semibold tracking-wider">Location / Salary</th>
                <th className="px-5 py-3 font-semibold tracking-wider">Hiring Contacts</th>
                <th className="px-5 py-3 font-semibold tracking-wider">Score</th>
                <th className="px-5 py-3 font-semibold tracking-wider">Status</th>
                <th className="px-5 py-3 font-semibold tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2f2f2f]/60">
              {jobs.length === 0 && !loading && (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-neutral-500 italic">
                    No matching jobs found in workspace database.
                  </td>
                </tr>
              )}
              {jobs.map(job => (
                <tr key={job.id} className="hover:bg-[#202020]/30 transition-colors">
                  {/* Title & Company */}
                  <td className="px-5 py-4.5 align-top">
                    <div className="font-semibold text-neutral-100 hover:underline cursor-pointer max-w-sm truncate text-[13px]">{job.jobTitle || 'Unknown Role'}</div>
                    <div className="text-neutral-400 mt-1 flex items-center gap-1.5 flex-wrap">
                      <span>{job.company || 'Unknown Company'}</span>
                      <span className="text-[10px] bg-[#202020] text-neutral-400 border border-[#2f2f2f] px-1.5 py-0.2 rounded font-mono">
                        {job.source}
                      </span>
                    </div>
                    {/* Error Badge */}
                    {job.processingError && (
                      <div
                        className="mt-2 flex items-start gap-1.5 bg-red-950/20 border border-red-900/30 rounded px-2.5 py-1 text-red-400 text-[10px] max-w-xs"
                        title={job.processingError}
                      >
                        <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-400" />
                        <span className="line-clamp-2 leading-tight">{job.processingError}</span>
                      </div>
                    )}
                  </td>

                  {/* Location & Salary */}
                  <td className="px-5 py-4.5 align-top text-neutral-400">
                    <div className="text-neutral-300 font-medium">{job.locationType || 'Remote'}</div>
                    <div className="text-neutral-500 mt-0.5">{job.salaryDisplay || 'Not specified'}</div>
                  </td>

                  {/* Recruiter Details / Fallbacks */}
                  <td className="px-5 py-4.5 align-top">
                    {job.hrName || job.hrEmail ? (
                      <div className="space-y-1">
                        {job.hrName && (
                          <div className="text-neutral-300 font-medium flex items-center gap-1">
                            👤 {job.hrName}
                          </div>
                        )}
                        {job.hrEmail && <div className="text-neutral-400 font-mono text-[11px] select-all">{job.hrEmail}</div>}
                        {job.linkedinContactUrl && (
                          <a href={job.linkedinContactUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[10px] text-blue-400 hover:underline">
                            <Linkedin className="w-3 h-3" /> Profile
                          </a>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col gap-1">
                        <span className="text-neutral-600 block mb-0.5">None found</span>
                        {/* Fallback search options */}
                        <div className="flex items-center gap-1 flex-wrap">
                          <a href={job.linkedinPeopleSearch || `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent((job.company || '') + ' recruiter India')}`} target="_blank" rel="noreferrer">
                            <button className="h-5 px-1.5 bg-[#202020] hover:bg-[#2c2c2c] border border-[#2f2f2f] text-[10px] text-neutral-400 rounded flex items-center gap-1 cursor-pointer">
                              <Linkedin className="w-2.5 h-2.5 text-blue-400" /> Find HR
                            </button>
                          </a>
                          <a href={job.googleLinkedinSearch || `https://www.google.com/search?q=site:linkedin.com+"${encodeURIComponent(job.company || '')}"+recruiter`} target="_blank" rel="noreferrer">
                            <button className="h-5 px-1.5 bg-[#202020] hover:bg-[#2c2c2c] border border-[#2f2f2f] text-[10px] text-neutral-400 rounded flex items-center gap-1 cursor-pointer">
                              <Globe className="w-2.5 h-2.5 text-neutral-400" /> Google
                            </button>
                          </a>
                        </div>
                      </div>
                    )}
                  </td>

                  {/* ATS Score */}
                  <td className="px-5 py-4.5 align-top">
                    {job.atsScore ? (
                      <span className={`text-[10px] px-2 py-0.5 rounded font-semibold border ${
                        job.atsScore >= 85 ? 'bg-green-500/10 text-green-400 border-green-500/20' : 
                        job.atsScore >= 65 ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' : 
                        'bg-red-500/10 text-red-400 border-red-500/20'
                      }`}>
                        {job.atsScore}/100
                      </span>
                    ) : (
                      <span className="text-neutral-600">—</span>
                    )}
                  </td>

                  {/* Status Dropdown */}
                  <td className="px-5 py-4.5 align-top">
                    <select
                      className="bg-[#202020] border border-[#2f2f2f] text-neutral-300 text-xs rounded p-1 outline-none cursor-pointer"
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

                  {/* Actions Column */}
                  <td className="px-5 py-4.5 align-top text-right space-x-1.5 whitespace-nowrap">
                    {/* View Posting */}
                    <a href={job.jobUrl} target="_blank" rel="noreferrer">
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0 bg-[#202020] hover:bg-[#2c2c2c] border border-[#2f2f2f] rounded shadow-none text-neutral-400 hover:text-neutral-200" title="View Original Posting">
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Button>
                    </a>

                    {/* CV rendering */}
                    {job.cvPdfPath ? (
                      <a href={`/api/jobs/cv?id=${job.id}`} target="_blank" rel="noreferrer">
                        <Button variant="outline" size="sm" className="h-7 px-2 bg-green-950/20 hover:bg-green-900/30 border border-green-800/40 rounded text-green-400 text-[10px] gap-1 shadow-none" title="Open PDF CV in New Tab">
                          📄 View CV
                        </Button>
                      </a>
                    ) : (
                      <Button variant="ghost" size="sm" className="h-7 px-2 bg-[#202020] hover:bg-[#2c2c2c] border border-[#2f2f2f] rounded text-neutral-400 hover:text-[#2eaadc] text-[10px] shadow-none" title="Process tailored CV and outreach hooks" onClick={() => processJob(job.id)}>
                        ⚙️ Process
                      </Button>
                    )}

                    {/* Gmail Draft */}
                    {job.coldMailDraftId ? (
                      <a href={`https://mail.google.com/mail/u/0/#drafts/${job.coldMailDraftId}`} target="_blank" rel="noreferrer">
                        <Button variant="outline" size="sm" className="h-7 px-2 bg-purple-950/20 hover:bg-purple-900/30 border border-purple-800/40 rounded text-purple-400 text-[10px] gap-1 shadow-none" title="Open Gmail Draft">
                          ✉️ Email
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
