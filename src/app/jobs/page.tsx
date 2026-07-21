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
  Bookmark,
  CheckCircle2,
  AlertCircle,
  Building,
  MapPin,
  DollarSign,
  Sparkles,
  Info,
} from 'lucide-react';
import { Portal } from '@/components/portal';

export default function JobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [matchTierFilter, setMatchTierFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  // Selected job for Two-Column Details Modal/Drawer
  const [selectedJob, setSelectedJob] = useState<any | null>(null);

  // Filter state values
  const [locationFilter, setLocationFilter] = useState('');
  const [remoteFilter, setRemoteFilter] = useState('all');
  const [experienceFilter, setExperienceFilter] = useState('all');

  const fetchJobs = () => {
    setLoading(true);
    let url = `/api/jobs?limit=150`;
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
  }, [matchTierFilter, statusFilter]);

  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      fetchJobs();
    }
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

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 page-fade">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#FAFAFA] flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#6366f1]/10 flex items-center justify-center">
              <Briefcase className="w-4 h-4 text-[#818cf8]" />
            </div>
            <span>Qualified Job Pipeline</span>
          </h1>
          <div className="text-sm text-[#A1A1AA] mt-0.5 flex items-center gap-2">
            <span>Showing qualified roles tailored specifically for your candidate profile.</span>
            <Badge className="bg-[#34d399]/10 text-[#34d399] text-[10px] font-mono border-[#34d399]/30">
              🎓 Fresh Graduate Only (&lt; 1 Yr Exp)
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={async () => {
              alert('Syncing Gmail inbox for recruiter responses...');
              const res = await fetch('/api/settings/gmail/sync', { method: 'POST' });
              const data = await res.json();
              if (data.success) {
                alert(`Gmail Sync complete! Checked ${data.checkedCount} messages. ${data.updatedCount} job statuses auto-updated.`);
                fetchJobs();
              } else {
                alert(data.error || 'Failed to sync Gmail responses.');
              }
            }}
            variant="outline"
            className="h-8 px-3 text-xs bg-[#111827] border-[rgba(255,255,255,0.08)] hover:border-[#34d399]/40 text-[#34d399]"
          >
            <Send className="w-3.5 h-3.5 mr-1.5" />
            Auto-Sync Gmail Replies
          </Button>

          <Button
            onClick={fetchJobs}
            variant="outline"
            className="h-8 px-3 text-xs bg-[#18181B] border-[rgba(255,255,255,0.08)] hover:border-[#6366f1]/40 text-[#FAFAFA]"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            Sync Database
          </Button>
        </div>
      </div>

      {/* Large Search Bar & Filter Bar */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#71717A] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search with natural language (e.g. 'React developer Kolkata', 'Remote Node.js')..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchKeyPress}
              className="w-full bg-[#111827] border border-[rgba(255,255,255,0.08)] rounded-xl pl-10 pr-24 py-2.5 text-xs text-[#FAFAFA] placeholder-[#71717A] focus:outline-none focus:border-[#6366f1] transition-colors shadow-sm"
            />
            <Button
              onClick={fetchJobs}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 h-7 px-3 text-xs bg-[#6366f1] hover:bg-[#4f46e5] text-white font-medium rounded-lg"
            >
              Search
            </Button>
          </div>

          <Button
            onClick={() => setShowFilters(!showFilters)}
            variant="outline"
            className="h-10 px-3.5 text-xs bg-[#111827] border-[rgba(255,255,255,0.08)] text-[#A1A1AA] hover:text-[#FAFAFA] flex items-center gap-1.5"
          >
            <Filter className="w-3.5 h-3.5 text-[#71717A]" />
            <span>Filters</span>
            {showFilters ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </Button>
        </div>

        {/* Expandable Filter Panel */}
        {showFilters && (
          <Card className="ag-card p-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div>
              <label className="text-[11px] font-mono text-[#71717A] uppercase block mb-1">Match Tier</label>
              <select
                value={matchTierFilter}
                onChange={(e) => setMatchTierFilter(e.target.value)}
                className="w-full bg-[#09090B] border border-[rgba(255,255,255,0.08)] rounded-lg p-2 text-xs text-[#FAFAFA] outline-none"
              >
                <option value="all">All Match Tiers</option>
                <option value="qualified">Qualified (≥85%)</option>
                <option value="below_threshold">Below Threshold (70-84%)</option>
                <option value="rejected">Rejected (&lt;70%)</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-mono text-[#71717A] uppercase block mb-1">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full bg-[#09090B] border border-[rgba(255,255,255,0.08)] rounded-lg p-2 text-xs text-[#FAFAFA] outline-none"
              >
                <option value="all">All Application Statuses</option>
                <option value="Pending">Pending Sync</option>
                <option value="Applied">Applied</option>
                <option value="Interview">Interview</option>
                <option value="Offer">Offer</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-mono text-[#71717A] uppercase block mb-1">Remote Preference</label>
              <select
                value={remoteFilter}
                onChange={(e) => setRemoteFilter(e.target.value)}
                className="w-full bg-[#09090B] border border-[rgba(255,255,255,0.08)] rounded-lg p-2 text-xs text-[#FAFAFA] outline-none"
              >
                <option value="all">Any Location</option>
                <option value="remote">Remote Only</option>
                <option value="kolkata">Kolkata</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-mono text-[#71717A] uppercase block mb-1">Work Auth</label>
              <div className="p-2 bg-[#09090B] border border-[rgba(255,255,255,0.08)] rounded-lg text-[11px] text-[#34d399] font-mono">
                India (No Visa Req)
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Modern Results Table */}
      <Card className="ag-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-[#A1A1AA]">
            <thead className="text-[11px] text-[#71717A] uppercase tracking-wider bg-[#111827] border-b border-[rgba(255,255,255,0.08)] sticky top-0">
              <tr>
                <th className="px-4 py-3.5 font-medium">Role & Company</th>
                <th className="px-4 py-3.5 font-medium">Location</th>
                <th className="px-4 py-3.5 font-medium">Salary</th>
                <th className="px-4 py-3.5 font-medium">Match %</th>
                <th className="px-4 py-3.5 font-medium">Status</th>
                <th className="px-4 py-3.5 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(255,255,255,0.08)]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-[#71717A] text-xs">
                    Loading job registry...
                  </td>
                </tr>
              ) : jobs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-[#71717A] text-xs">
                    No jobs found matching your criteria.
                  </td>
                </tr>
              ) : (
                jobs.map((job) => (
                  <tr
                    key={job.id}
                    className="hover:bg-[#22222A] transition-colors"
                  >
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        {/* Direct Link to Job */}
                        <a
                          href={job.jobUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="font-semibold text-[#FAFAFA] text-xs hover:text-[#818cf8] hover:underline transition-colors flex items-center gap-1 group"
                          title="Open original job posting in new tab"
                        >
                          <span>{job.jobTitle}</span>
                          <ExternalLink className="w-3 h-3 text-[#71717A] group-hover:text-[#818cf8] shrink-0" />
                        </a>
                      </div>
                      <div className="text-[11px] text-[#71717A] flex items-center gap-1.5 mt-0.5">
                        <span>{job.company}</span>
                        <span>•</span>
                        <span className="font-mono text-[10px] text-[#6366f1]">{job.source}</span>
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="text-xs text-[#FAFAFA] flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#71717A]" />
                        <span>{job.locationType || 'Remote'}</span>
                      </div>
                    </td>

                    <td className="px-4 py-3.5 font-mono text-xs text-[#FAFAFA]">
                      {job.salaryDisplay || 'TBD'}
                    </td>

                    <td className="px-4 py-3.5">
                      <span className={`ag-badge-${(job.overallScore || 90) >= 85 ? 'accent' : 'green'}`}>
                        {job.overallScore || 90}%
                      </span>
                    </td>

                    <td className="px-4 py-3.5">
                      <span className="ag-badge">
                        {job.applicationStatus || 'Pending'}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 text-right space-x-1.5 whitespace-nowrap">
                      {/* Direct Open Job Posting Button */}
                      <a href={job.jobUrl} target="_blank" rel="noreferrer">
                        <Button size="sm" className="h-7 text-[11px] bg-[#6366f1] hover:bg-[#4f46e5] text-white px-2.5 font-medium">
                          Open Job <ExternalLink className="w-3 h-3 ml-1" />
                        </Button>
                      </a>

                      {/* View Details Modal Button */}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelectedJob(job)}
                        className="h-7 text-[11px] text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-[#111827] px-2"
                        title="Inspect full description & breakdown"
                      >
                        <Info className="w-3 h-3 mr-1" /> Details
                      </Button>

                      {job.cvPdfPath ? (
                        <a href={`/api/jobs/cv?id=${job.id}`} target="_blank" rel="noreferrer">
                          <Button size="sm" variant="ghost" className="h-7 text-[11px] text-[#34d399] hover:bg-[#34d399]/10 px-2">
                            <FileText className="w-3 h-3 mr-1" /> CV
                          </Button>
                        </a>
                      ) : (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => processJob(job.id)}
                          className="h-7 text-[11px] text-[#818cf8] hover:bg-[#6366f1]/10 px-2"
                        >
                          Tailor
                        </Button>
                      )}

                      {job.coldMailDraftId && (
                        <a href={`https://mail.google.com/mail/u/0/#drafts/${job.coldMailDraftId}`} target="_blank" rel="noreferrer">
                          <Button size="sm" variant="ghost" className="h-7 text-[11px] text-[#c084fc] hover:bg-[#c084fc]/10 px-2">
                            Draft
                          </Button>
                        </a>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Two-Column Job Details Modal */}
      {selectedJob && (
        <Portal>
          <div className="fixed inset-0 bg-[#09090B]/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#111827] border border-[rgba(255,255,255,0.08)] rounded-xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl">
              {/* Modal Header */}
              <div className="p-5 border-b border-[rgba(255,255,255,0.08)] flex justify-between items-start bg-[#18181B]">
                <div>
                  <h3 className="text-lg font-bold text-[#FAFAFA]">
                    {selectedJob.jobTitle}
                  </h3>
                  <p className="text-xs text-[#A1A1AA] flex items-center gap-2 mt-0.5">
                    <Building className="w-3.5 h-3.5 text-[#71717A]" /> {selectedJob.company}
                    <span>•</span>
                    <MapPin className="w-3.5 h-3.5 text-[#71717A]" /> {selectedJob.locationType || 'Remote'}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedJob(null)}
                  className="text-[#71717A] hover:text-[#FAFAFA] font-bold text-base px-2"
                >
                  ✕
                </button>
              </div>

              {/* Modal Body: Two Columns */}
              <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[rgba(255,255,255,0.08)]">
                {/* Left Column (2 Cols): Job Description & Interview Prep */}
                <div className="md:col-span-2 p-6 space-y-5 text-xs text-[#A1A1AA] leading-relaxed">
                  <div>
                    <h4 className="font-semibold text-xs text-[#FAFAFA] uppercase font-mono mb-2 flex items-center justify-between">
                      <span>Job Description</span>
                      <a href={selectedJob.jobUrl} target="_blank" rel="noreferrer" className="text-[#818cf8] hover:underline text-[11px] font-normal lowercase flex items-center gap-1">
                        <span>view original</span> <ExternalLink className="w-3 h-3" />
                      </a>
                    </h4>
                    <p className="whitespace-pre-line bg-[#09090B]/50 p-3 rounded-lg border border-[rgba(255,255,255,0.04)]">
                      {selectedJob.jobDescription || 'No description provided.'}
                    </p>
                  </div>

                  {/* AI Interview Prep Pack Section */}
                  <div className="pt-4 border-t border-[rgba(255,255,255,0.08)] space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-xs text-[#FAFAFA] uppercase font-mono flex items-center gap-2">
                        <Sparkles className="w-3.5 h-3.5 text-[#34d399]" />
                        <span>AI Company Interview Prep Pack</span>
                      </h4>
                      <Button
                        size="sm"
                        onClick={async () => {
                          const res = await fetch('/api/jobs/interview-prep', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ jobId: selectedJob.id }),
                          });
                          const data = await res.json();
                          if (data.success) {
                            setSelectedJob({ ...selectedJob, notes: JSON.stringify(data.prepPack) });
                          } else {
                            alert('Failed to generate interview prep pack.');
                          }
                        }}
                        className="h-7 text-[11px] bg-[#34d399]/10 hover:bg-[#34d399]/20 text-[#34d399] border border-[#34d399]/30"
                      >
                        Generate Interview Pack
                      </Button>
                    </div>

                    {selectedJob.notes && selectedJob.notes.includes('"overallStrategy"') ? (
                      (() => {
                        try {
                          const pack = JSON.parse(selectedJob.notes);
                          return (
                            <div className="space-y-3 bg-[#09090B] p-4 rounded-xl border border-[rgba(255,255,255,0.08)]">
                              <div className="p-3 bg-[#6366f1]/10 rounded-lg border border-[#6366f1]/20">
                                <span className="font-semibold text-[#FAFAFA] text-xs block mb-1">Company Interview Strategy:</span>
                                <p className="text-[11px] text-[#A1A1AA]">{pack.overallStrategy}</p>
                              </div>

                              <div className="space-y-2">
                                <span className="font-semibold text-[#FAFAFA] text-xs block">Technical Focus Areas:</span>
                                <div className="flex flex-wrap gap-1.5">
                                  {pack.technicalFocusAreas?.map((topic: string, i: number) => (
                                    <span key={i} className="ag-badge-accent font-mono">{topic}</span>
                                  ))}
                                </div>
                              </div>

                              <div className="space-y-2 pt-2">
                                <span className="font-semibold text-[#FAFAFA] text-xs block">Target Interview Questions:</span>
                                {pack.questions?.slice(0, 5).map((q: any, i: number) => (
                                  <div key={i} className="p-3 bg-[#111827] rounded-lg border border-[rgba(255,255,255,0.05)] space-y-1">
                                    <div className="flex justify-between items-start">
                                      <span className="font-semibold text-[#FAFAFA] text-xs">Q{i + 1}: {q.question}</span>
                                      <span className="ag-badge-purple text-[9px] uppercase font-mono">{q.category}</span>
                                    </div>
                                    <p className="text-[10px] font-mono text-[#34d399]">Evaluating: {q.keyConcept}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        } catch {
                          return null;
                        }
                      })()
                    ) : (
                      <p className="text-[11px] text-[#71717A]">
                        Click "Generate Interview Pack" to create role-specific technical, coding/DSA, system design, and behavioral questions tailored for {selectedJob.company}.
                      </p>
                    )}
                  </div>
                </div>

                {/* Right Column (1 Col Sticky Panel): Scores & Quick Actions */}
                <div className="p-6 space-y-4 bg-[#18181B]/50">
                  <div className="space-y-3">
                    <div>
                      <span className="text-[10px] font-mono text-[#71717A] uppercase block">Overall Match</span>
                      <span className="text-xl font-bold text-[#34d399]">
                        {selectedJob.overallScore || 90}%
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-mono text-[#71717A] uppercase block">Salary Compensation</span>
                      <span className="text-sm font-semibold text-[#FAFAFA] font-mono">
                        {selectedJob.salaryDisplay || 'Not Specified'}
                      </span>
                    </div>

                    {/* Discovered Decision-Maker Section */}
                    <div className="pt-3 border-t border-[rgba(255,255,255,0.08)] space-y-1">
                      <span className="text-[10px] font-mono text-[#71717A] uppercase block">Decision Maker Found</span>
                      <p className="text-xs font-semibold text-[#FAFAFA]">
                        {selectedJob.hrName || 'Hiring Team'}
                      </p>
                      <p className="text-[11px] text-[#A1A1AA]">
                        {selectedJob.hrTitle || 'HR / Talent Acquisition'}
                      </p>
                      {selectedJob.contactSource && (
                        <Badge className="bg-[#6366f1]/10 text-[#818cf8] text-[9px] font-mono border-none mt-1">
                          via {selectedJob.contactSource} ({selectedJob.contactConfidence || 'medium'})
                        </Badge>
                      )}
                    </div>

                    <div>
                      <span className="text-[10px] font-mono text-[#71717A] uppercase block">Job Source</span>
                      <span className="text-xs text-[#818cf8]">
                        {selectedJob.source}
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-[rgba(255,255,255,0.08)] pt-4 space-y-2">
                    <a href={selectedJob.jobUrl} target="_blank" rel="noreferrer" className="block">
                      <Button className="w-full h-8 text-xs bg-[#6366f1] hover:bg-[#4f46e5] text-white flex items-center justify-center gap-1.5">
                        <span>Open Original Job Posting</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Button>
                    </a>

                    <Button
                      onClick={() => processJob(selectedJob.id)}
                      variant="outline"
                      className="w-full h-8 text-xs bg-[#111827] text-[#FAFAFA] border-[rgba(255,255,255,0.08)]"
                    >
                      Generate Customized Resume
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Portal>
      )}
    </div>
  );
}
