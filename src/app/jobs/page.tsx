'use client';
import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Briefcase,
  Search,
  Filter,
  RefreshCw,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  FileText,
  Send,
  AlertCircle,
  Building,
  MapPin,
  Sparkles,
  Info,
  X,
  Eye,
  Trash2,
  SlidersHorizontal,
  UserCheck,
  RotateCcw,
} from 'lucide-react';
import { Portal } from '@/components/portal';

function sanitizeString(str: string): string {
  if (!str) return '';
  return str
    .replace(/[ââ\u0080-\u00FF]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [matchTierFilter, setMatchTierFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [expLevelFilter, setExpLevelFilter] = useState('fresh_graduate');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedJob, setSelectedJob] = useState<any | null>(null);

  const fetchJobs = () => {
    setLoading(true);
    let url = `/api/jobs?limit=150&expLevel=${expLevelFilter}`;
    if (statusFilter !== 'all') url += `&status=${statusFilter}`;
    if (matchTierFilter !== 'all') url += `&matchTier=${matchTierFilter}`;
    if (searchQuery) url += `&search=${encodeURIComponent(searchQuery)}`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setJobs(data.jobs || []);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchJobs();
  }, [matchTierFilter, statusFilter, expLevelFilter]);

  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') fetchJobs();
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setMatchTierFilter('all');
    setStatusFilter('all');
    setExpLevelFilter('fresh_graduate');
  };

  const processJob = async (id: number) => {
    alert('Started tailoring CV & staging outreach drafts in background.');
    await fetch('/api/pipeline/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pipeline: 'job', jobId: id }),
    });
    setTimeout(fetchJobs, 2000);
  };

  const handleFreshStart = async () => {
    if (confirm('Are you sure you want to delete ALL jobs, funding leads, and storage files for a fresh start?')) {
      const res = await fetch('/api/database/clear', { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        alert('Database & CV Storage reset completely!');
        fetchJobs();
      } else {
        alert('Failed to clear database: ' + (data.error || 'Unknown error'));
      }
    }
  };

  const handleAutoApply = async (id: number) => {
    alert('Launching browser automation for ATS form filling...');
    const res = await fetch('/api/jobs/auto-apply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobId: id, dryRun: false }),
    });
    const data = await res.json();
    if (data.success) {
      alert(`Auto-Apply: ${data.result?.message || 'Completed successfully.'}`);
      fetchJobs();
    } else {
      alert(`Auto-Apply: ${data.error || data.result?.message || 'Check logs for details.'}`);
      fetchJobs();
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-5 page-fade">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0F172A] flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[8px] bg-[#EEF2FF] border border-[#C7D2FE] flex items-center justify-center">
              <Briefcase className="w-4 h-4 text-[#4F46E5]" />
            </div>
            Qualified Job Pipeline
          </h1>
          <div className="text-[13px] text-[#64748B] mt-0.5 flex items-center gap-2">
            <span>Filtered for SDE 1 / Entry-Level / Graduate Software Engineer.</span>
            <Badge variant="emerald" className="text-[10px]">Senior / DevOps Filtered Out</Badge>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button onClick={handleFreshStart} variant="outline" size="sm" className="text-[#E11D48] border-[#FECDD3] bg-[#FFF1F2] hover:bg-[#FFE4E6]">
            <Trash2 className="w-3.5 h-3.5" /> Reset Database
          </Button>
          <Button
            onClick={async () => {
              alert('Syncing Gmail inbox for recruiter responses...');
              const res = await fetch('/api/settings/gmail/sync', { method: 'POST' });
              const data = await res.json();
              if (data.success) {
                alert(`Gmail Sync complete! Checked ${data.checkedCount} messages.`);
                fetchJobs();
              }
            }}
            variant="outline" size="sm"
            className="text-[#047857] border-[#A7F3D0] bg-[#ECFDF5] hover:bg-[#D1FAE5]"
          >
            <Send className="w-3.5 h-3.5" /> Sync Gmail
          </Button>
          <Button onClick={fetchJobs} variant="outline" size="sm">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#4F46E5]' : 'text-[#64748B]'}`} /> Refresh
          </Button>
        </div>
      </div>

      {/* Redesigned Clean Search & Filters System */}
      <Card className="ag-card p-4 space-y-3">
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Main Search Input */}
          <div className="relative flex-1 min-w-[280px]">
            <Search className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search jobs by keyword, tech stack, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchKeyPress}
              className="ag-input w-full pl-10 pr-20 py-2 text-xs"
            />
            <Button onClick={fetchJobs} size="sm" className="absolute right-1.5 top-1/2 -translate-y-1/2 h-7 px-3 text-[11px]">
              Search
            </Button>
          </div>

          {/* Experience Filter Toggle */}
          <div className="flex items-center gap-1 bg-[#F1F5F9] p-1 rounded-[8px]">
            <button
              onClick={() => setExpLevelFilter('fresh_graduate')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-[6px] transition-all cursor-pointer ${
                expLevelFilter === 'fresh_graduate' ? 'bg-[#4F46E5] text-white shadow-xs' : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              Fresh Graduate / SDE 1 Only
            </button>
            <button
              onClick={() => setExpLevelFilter('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-[6px] transition-all cursor-pointer ${
                expLevelFilter === 'all' ? 'bg-[#4F46E5] text-white shadow-xs' : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              All Roles (Incl. Senior)
            </button>
          </div>

          {/* Toggle Advanced Filters */}
          <Button onClick={() => setShowFilters(!showFilters)} variant="outline" size="sm" className="h-9 px-3 gap-1.5 font-semibold">
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#4F46E5]" />
            <span>Filters</span>
            {showFilters ? <ChevronUp className="w-3.5 h-3.5 text-[#64748B]" /> : <ChevronDown className="w-3.5 h-3.5 text-[#64748B]" />}
          </Button>
        </div>

        {/* Collapsible Advanced Filter Panel */}
        {showFilters && (
          <div className="pt-3 border-t border-[#F1F5F9] grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-3 text-xs slide-up">
            <div>
              <label className="text-[10px] font-semibold text-[#64748B] uppercase block mb-1">Match Tier</label>
              <select value={matchTierFilter} onChange={(e) => setMatchTierFilter(e.target.value)} className="ag-input w-full text-xs py-1.5 font-medium">
                <option value="all">All Tiers</option>
                <option value="qualified">Qualified (85%+)</option>
                <option value="below_threshold">Below (70-84%)</option>
                <option value="rejected">Low (&lt;70%)</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-semibold text-[#64748B] uppercase block mb-1">Pipeline Status</label>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="ag-input w-full text-xs py-1.5 font-medium">
                <option value="all">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Draft Ready">Draft Ready</option>
                <option value="Applied">Applied</option>
                <option value="Interview">Interview</option>
                <option value="Offer">Offer</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-semibold text-[#64748B] uppercase block mb-1">Work Authorization</label>
              <div className="ag-input py-1.5 text-xs text-[#047857] font-semibold bg-[#ECFDF5] border-[#A7F3D0] flex items-center justify-between">
                <span>India (No Visa)</span>
                <Badge variant="emerald" className="text-[9px]">Verified</Badge>
              </div>
            </div>

            <div className="flex items-end">
              <Button onClick={clearAllFilters} variant="ghost" size="sm" className="w-full h-8 text-[11px] text-[#64748B] hover:text-[#0F172A] gap-1 font-medium">
                <RotateCcw className="w-3 h-3" /> Clear Filters
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Results Table */}
      <Card className="ag-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="ag-table">
            <thead>
              <tr>
                <th className="min-w-[260px]">Role & Company</th>
                <th className="w-[140px]">Location</th>
                <th className="w-[100px] whitespace-nowrap">Salary</th>
                <th className="w-[80px]">Match</th>
                <th className="w-[100px]">Status</th>
                <th className="w-[220px] text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center text-[#64748B] text-[12px] py-8">Loading qualified SDE 1 roles...</td></tr>
              ) : jobs.length === 0 ? (
                <tr><td colSpan={6} className="text-center text-[#64748B] text-[12px] py-8">No roles found matching your criteria. Try adjusting filters.</td></tr>
              ) : (
                jobs.map((job) => {
                  const cleanTitle = sanitizeString(job.jobTitle);
                  const cleanCompany = sanitizeString(job.company);
                  const cleanLocation = sanitizeString(job.locationType || 'Remote');
                  const cleanSalary = job.salaryDisplay && !job.salaryDisplay.includes('Not Mentioned') && !job.salaryDisplay.includes('TBD')
                    ? job.salaryDisplay
                    : 'TBD';

                  return (
                    <tr key={job.id}>
                      <td>
                        <a href={job.jobUrl} target="_blank" rel="noreferrer" className="font-semibold text-[#0F172A] text-[12px] hover:text-[#4F46E5] transition-colors duration-150 flex items-center gap-1 group">
                          <span className="truncate max-w-sm">{cleanTitle}</span>
                          <ExternalLink className="w-3 h-3 text-[#94A3B8] group-hover:text-[#4F46E5] shrink-0" />
                        </a>
                        <div className="text-[11px] text-[#64748B] flex items-center gap-1.5 mt-0.5">
                          <span className="font-medium text-[#334155]">{cleanCompany}</span>
                          <span className="text-[#CBD5E1]">•</span>
                          <span className="text-[#4F46E5] font-mono text-[10px] bg-[#EEF2FF] px-1.5 py-0.2 rounded-[4px]">{job.source}</span>
                        </div>
                      </td>
                      <td>
                        <div className="text-[11px] text-[#334155] flex items-center gap-1 whitespace-nowrap">
                          <MapPin className="w-3 h-3 text-[#94A3B8] shrink-0" />
                          <span className="truncate max-w-[120px]">{cleanLocation}</span>
                        </div>
                      </td>
                      <td className="font-mono text-[11px] text-[#334155] whitespace-nowrap font-medium">
                        {cleanSalary}
                      </td>
                      <td>
                        <span className={`ag-badge-${(job.overallScore || 90) >= 85 ? 'accent' : (job.overallScore || 90) >= 70 ? 'green' : 'rose'}`}>
                          {job.overallScore || 90}%
                        </span>
                      </td>
                      <td>
                        {job.processingError ? (
                          <div className="group relative">
                            <span className="ag-badge-rose flex items-center gap-1 cursor-help">
                              <AlertCircle className="w-3 h-3" /> Error
                            </span>
                            <div className="absolute z-50 bottom-full left-0 mb-2 hidden group-hover:block w-60 p-2.5 bg-white border border-[#FECDD3] rounded-[8px] shadow-lg text-[10px] text-[#475569] font-mono leading-relaxed">
                              <span className="text-[#BE123C] font-semibold block mb-1">Pipeline Error:</span>
                              {job.processingError}
                            </div>
                          </div>
                        ) : (
                          <span className="ag-badge">{job.applicationStatus || 'Pending'}</span>
                        )}
                      </td>
                      <td className="text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <a href={job.jobUrl} target="_blank" rel="noreferrer">
                            <Button size="sm" variant="outline" className="h-7 text-[11px] px-2 text-[#4F46E5] border-[#C7D2FE] bg-[#EEF2FF] hover:bg-[#E0E7FF]">
                              Open <ExternalLink className="w-3 h-3" />
                            </Button>
                          </a>
                          <Button size="sm" variant="ghost" onClick={() => setSelectedJob(job)} className="h-7 text-[11px] px-2 text-[#475569]">
                            <Info className="w-3 h-3" /> Details
                          </Button>
                          {job.cvPdfPath ? (
                            <a href={`/api/jobs/cv?id=${job.id}`} target="_blank" rel="noreferrer">
                              <Button size="sm" variant="ghost" className="h-7 text-[11px] px-2 text-[#047857]">
                                <FileText className="w-3 h-3" /> CV
                              </Button>
                            </a>
                          ) : (
                            <Button size="sm" variant="ghost" onClick={() => processJob(job.id)} className="h-7 text-[11px] px-2 text-[#4F46E5]">
                              Tailor
                            </Button>
                          )}
                          <Button
                            size="sm"
                            onClick={() => handleAutoApply(job.id)}
                            className="h-7 text-[11px] bg-[#10B981] hover:bg-[#059669] text-white px-2.5 font-semibold"
                          >
                            <Sparkles className="w-3 h-3" /> Apply
                          </Button>
                          {job.notes?.includes('Auto-Apply') && (
                            <a href={`/api/jobs/screenshot?id=${job.id}`} target="_blank" rel="noreferrer">
                              <Button size="sm" variant="ghost" className="h-7 text-[11px] px-2 text-[#B45309]">
                                <Eye className="w-3 h-3" /> Proof
                              </Button>
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Details Modal */}
      {selectedJob && (
        <Portal>
          <div className="fixed inset-0 ag-overlay z-50 flex items-center justify-center p-4" onClick={() => setSelectedJob(null)}>
            <div className="bg-white border border-[#E2E8F0] rounded-[14px] w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl slide-up" onClick={(e) => e.stopPropagation()}>
              <div className="p-4 border-b border-[#F1F5F9] flex justify-between items-start bg-[#F8FAFC]">
                <div>
                  <h3 className="text-base font-bold text-[#0F172A]">{sanitizeString(selectedJob.jobTitle)}</h3>
                  <p className="text-[12px] text-[#64748B] flex items-center gap-2 mt-0.5">
                    <Building className="w-3.5 h-3.5 text-[#94A3B8]" /> {sanitizeString(selectedJob.company)}
                    <span className="text-[#CBD5E1]">|</span>
                    <MapPin className="w-3.5 h-3.5 text-[#94A3B8]" /> {sanitizeString(selectedJob.locationType || 'Remote')}
                  </p>
                </div>
                <button onClick={() => setSelectedJob(null)} className="p-1 text-[#94A3B8] hover:text-[#0F172A] rounded-[6px] hover:bg-[#E2E8F0] transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5 text-xs leading-relaxed text-[#334155]">
                <h4 className="font-bold text-[#0F172A] uppercase mb-2">Description</h4>
                <p className="whitespace-pre-line bg-[#F8FAFC] p-3 rounded border border-[#E2E8F0]">
                  {selectedJob.jobDescription || 'No description available.'}
                </p>
              </div>
            </div>
          </div>
        </Portal>
      )}
    </div>
  );
}
