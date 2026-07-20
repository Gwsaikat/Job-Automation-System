'use client';
import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, RefreshCw, Trash2, AlertCircle, Search, Mail, Linkedin, Globe, FileText } from 'lucide-react';

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
  }, [status]);

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
    setTimeout(fetchJobs, 2500);
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
    <div className="p-12 max-w-6xl mx-auto space-y-8 select-none relative animate-in fade-in duration-500">
      
      {/* Background Aura Glows */}
      <div className="absolute top-0 right-1/3 w-80 h-80 bg-indigo-600/5 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Notion Breadcrumbs */}
      <div className="text-[11px] text-neutral-500 flex items-center gap-1.5 font-mono uppercase tracking-wider relative z-10">
        <span>Cosmic Hub</span>
        <span>/</span>
        <span className="text-indigo-400 font-medium">💼 Job Pipeline</span>
      </div>

      {/* Page Header */}
      <div className="flex justify-between items-start flex-wrap gap-4 relative z-10">
        <div className="space-y-1">
          <h1 className="text-4xl font-extrabold tracking-tight text-neutral-100 flex items-center gap-3">
            <span>💼</span> <span className="gradient-text-cosmic">Job Database</span>
          </h1>
          <p className="text-neutral-400 text-[14.5px] font-light leading-relaxed max-w-xl">
            Sleek database console to view, filter, tailor, and dispatch applications.
          </p>
        </div>
        
        <div className="flex gap-2 items-center">
          <Button onClick={fetchJobs} variant="outline" className="h-9 px-4 text-xs bg-[#0d0d12]/60 border-white/5 hover:border-indigo-500/25 hover:bg-[#20202d]/20 text-neutral-300 font-medium rounded-xl gap-2 shadow-none transition-all duration-300">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Sync Database
          </Button>
          <Button
            onClick={clearDatabase}
            variant="outline"
            className="h-9 px-4 text-xs bg-red-950/5 border border-red-900/20 text-red-400 hover:bg-red-950/20 hover:text-red-300 font-medium rounded-xl gap-2 shadow-none transition-all duration-300"
            disabled={clearing}
          >
            <Trash2 className="w-3.5 h-3.5" />
            {clearing ? 'Clearing...' : 'Wipe Database'}
          </Button>
        </div>
      </div>

      {/* Notifications */}
      {clearResult && (
        <div className="glass-panel p-4 rounded-xl border-green-800 bg-green-950/10 text-green-400 text-xs flex justify-between items-center relative z-10">
          <span>{clearResult}</span>
          <button className="opacity-60 hover:opacity-100 font-bold" onClick={() => setClearResult(null)}>✕</button>
        </div>
      )}

      {/* Premium Database Toolbar Filter */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-[#0d0d12]/50 backdrop-blur-md rounded-2xl border border-white/5 text-xs relative z-10">
        <div className="flex flex-wrap items-center gap-3">
          {/* Text Search */}
          <div className="flex items-center bg-[#050508]/85 border border-white/5 focus-within:border-indigo-500/50 rounded-xl px-3 py-2 w-72 transition-all">
            <Search className="w-3.5 h-3.5 text-neutral-500 mr-2" />
            <input
              type="text"
              placeholder="Search roles, companies, keywords..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleSearchKeyPress}
              className="bg-transparent border-none text-neutral-200 outline-none w-full text-xs font-light"
            />
          </div>
          <Button onClick={fetchJobs} className="h-8 px-4 text-xs bg-indigo-650 hover:bg-indigo-700 text-white font-medium rounded-xl shadow-none">
            Query
          </Button>
        </div>

        {/* Status Select */}
        <div className="flex items-center gap-2 text-neutral-400">
          <span className="font-mono uppercase text-[10px] tracking-wider text-neutral-500">Filter status:</span>
          <select
            className="bg-[#050508]/80 border border-white/5 text-neutral-200 text-xs rounded-xl px-3 py-1.5 outline-none cursor-pointer hover:border-white/10 transition-colors"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="all">All listings</option>
            <option value="Pending">⏳ Pending Sync</option>
            <option value="Applied">✅ Applied</option>
            <option value="Interview">📞 Interviewing</option>
            <option value="Rejected">❌ Rejected</option>
            <option value="Offer">🎉 Offered</option>
          </select>
        </div>
      </div>

      {/* Database Table layout */}
      <Card className="glass-panel bg-[#0d0d12]/55 border-white/5 overflow-hidden rounded-2xl shadow-xl relative z-10">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-neutral-300">
            <thead className="text-[11px] text-neutral-500 uppercase tracking-widest bg-[#0a0a0f]/80 border-b border-white/5">
              <tr>
                <th className="px-6 py-4 font-semibold">Job Information</th>
                <th className="px-6 py-4 font-semibold">Location / Compensation</th>
                <th className="px-6 py-4 font-semibold">Hiring Details</th>
                <th className="px-6 py-4 font-semibold">ATS Score</th>
                <th className="px-6 py-4 font-semibold">Pipeline State</th>
                <th className="px-6 py-4 font-semibold text-right">Console Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {jobs.length === 0 && !loading && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-neutral-500 italic font-light">
                    No active job listings query matches in cosmic registry.
                  </td>
                </tr>
              )}
              {jobs.map(job => (
                <tr key={job.id} className="hover:bg-[#12121b]/30 transition-all duration-300">
                  {/* Job Details */}
                  <td className="px-6 py-5 align-top">
                    <div className="font-bold text-[13.5px] text-neutral-100 leading-snug hover:text-indigo-300 cursor-pointer transition-colors max-w-sm truncate">{job.jobTitle || 'Unknown Role'}</div>
                    <div className="text-neutral-400 mt-1 flex items-center gap-2 flex-wrap text-[11px] font-light">
                      <span className="font-medium text-neutral-300">{job.company || 'Unknown Company'}</span>
                      <span className="text-[9px] bg-indigo-500/5 text-indigo-400 border border-indigo-500/10 px-1.5 py-0.2 rounded font-mono uppercase">
                        {job.source}
                      </span>
                    </div>
                    {/* Error Box */}
                    {job.processingError && (
                      <div
                        className="mt-2.5 flex items-start gap-1.5 bg-red-950/20 border border-red-900/30 rounded-lg px-2.5 py-1.5 text-red-400 text-[10px] max-w-xs"
                        title={job.processingError}
                      >
                        <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-400 mt-0.5" />
                        <span className="line-clamp-2 leading-tight">{job.processingError}</span>
                      </div>
                    )}
                  </td>

                  {/* Location & Salary */}
                  <td className="px-6 py-5 align-top text-neutral-400">
                    <div className="text-neutral-200 font-semibold">{job.locationType || 'Remote'}</div>
                    <div className="text-neutral-500 text-[11px] mt-0.5 font-light">{job.salaryDisplay || 'Not specified'}</div>
                  </td>

                  {/* Hiring Contact / Searches */}
                  <td className="px-6 py-5 align-top">
                    {job.hrName || job.hrEmail ? (
                      <div className="space-y-1.5">
                        {job.hrName && (
                          <div className="text-neutral-200 font-semibold flex items-center gap-1.5">
                            <span className="text-[11px]">👤</span> {job.hrName}
                          </div>
                        )}
                        {job.hrEmail && <div className="text-neutral-400 font-mono text-[10.5px] select-all bg-[#050508]/65 px-2 py-0.5 border border-white/5 rounded inline-block">{job.hrEmail}</div>}
                        {job.linkedinContactUrl && (
                          <div className="mt-1">
                            <a href={job.linkedinContactUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[10px] text-blue-400 hover:text-blue-300 hover:underline">
                              <Linkedin className="w-3 h-3" /> Recruiter LinkedIn
                            </a>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col gap-1.5">
                        <span className="text-neutral-600 block text-[10px] italic">No direct profile</span>
                        <div className="flex items-center gap-1 flex-wrap">
                          <a href={job.linkedinPeopleSearch || `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent((job.company || '') + ' recruiter India')}`} target="_blank" rel="noreferrer">
                            <button className="h-5.5 px-2 bg-[#050508] hover:bg-neutral-900 border border-white/5 text-[9.5px] text-neutral-400 rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors">
                              <Linkedin className="w-2.5 h-2.5 text-blue-400" /> Search HR
                            </button>
                          </a>
                          <a href={job.googleLinkedinSearch || `https://www.google.com/search?q=site:linkedin.com+"${encodeURIComponent(job.company || '')}"+recruiter`} target="_blank" rel="noreferrer">
                            <button className="h-5.5 px-2 bg-[#050508] hover:bg-neutral-900 border border-white/5 text-[9.5px] text-neutral-400 rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors">
                              <Globe className="w-2.5 h-2.5 text-neutral-400" /> Google
                            </button>
                          </a>
                        </div>
                      </div>
                    )}
                  </td>

                  {/* Score */}
                  <td className="px-6 py-5 align-top">
                    {job.atsScore ? (
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border font-mono ${
                        job.atsScore >= 85 ? 'bg-green-500/10 text-green-400 border-green-500/20' : 
                        job.atsScore >= 65 ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' : 
                        'bg-red-500/10 text-red-400 border-red-500/20'
                      }`}>
                        {job.atsScore}% MATCH
                      </span>
                    ) : (
                      <span className="text-neutral-600 font-mono">—</span>
                    )}
                  </td>

                  {/* Status Select */}
                  <td className="px-6 py-5 align-top">
                    <select
                      className="bg-[#050508]/85 border border-white/5 hover:border-white/10 text-neutral-300 text-xs rounded-xl p-1.5 outline-none cursor-pointer transition-colors"
                      value={job.applicationStatus}
                      onChange={(e) => updateStatus(job.id, e.target.value)}
                    >
                      <option value="Pending">Pending Sync</option>
                      <option value="Applied">Applied</option>
                      <option value="Interview">Interview</option>
                      <option value="Rejected">Rejected</option>
                      <option value="Offer">Offer</option>
                    </select>
                  </td>

                  {/* Actions Column */}
                  <td className="px-6 py-5 align-top text-right space-x-1.5 whitespace-nowrap">
                    {/* Link */}
                    <a href={job.jobUrl} target="_blank" rel="noreferrer">
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0 bg-[#050508]/80 hover:bg-[#12121b] border border-white/5 text-neutral-400 hover:text-neutral-200 transition-colors" title="View Original Posting">
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Button>
                    </a>

                    {/* CV rendering */}
                    {job.cvPdfPath ? (
                      <a href={`/api/jobs/cv?id=${job.id}`} target="_blank" rel="noreferrer">
                        <Button variant="outline" size="sm" className="h-7 px-3 bg-green-950/15 hover:bg-green-900/20 border border-green-800/20 rounded-xl text-green-400 text-[10px] gap-1 shadow-none transition-colors" title="Open PDF CV in New Tab">
                          <FileText className="w-3 h-3" /> View CV
                        </Button>
                      </a>
                    ) : (
                      <Button variant="ghost" size="sm" className="h-7 px-3 bg-[#050508]/80 hover:bg-[#12121b] border border-indigo-500/10 rounded-xl text-indigo-400 hover:text-indigo-300 text-[10px] shadow-none transition-colors" title="Process tailored CV and outreach hooks" onClick={() => processJob(job.id)}>
                        ⚙️ Process
                      </Button>
                    )}

                    {/* Gmail Draft */}
                    {job.coldMailDraftId ? (
                      <a href={`https://mail.google.com/mail/u/0/#drafts/${job.coldMailDraftId}`} target="_blank" rel="noreferrer">
                        <Button variant="outline" size="sm" className="h-7 px-3 bg-purple-950/15 hover:bg-purple-900/20 border border-purple-800/20 rounded-xl text-purple-400 text-[10px] gap-1 shadow-none transition-colors" title="Open Gmail Draft">
                          ✉️ Open Draft
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
