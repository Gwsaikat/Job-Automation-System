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
} from 'lucide-react';

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
            <Briefcase className="w-6 h-6 text-[#6366f1]" />
            <span>Job Explorer</span>
          </h1>
          <p className="text-sm text-[#A1A1AA] mt-0.5">
            Real-time scraped software engineering roles matched against your profile.
          </p>
        </div>

        <div className="flex items-center gap-2">
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
                    className="hover:bg-[#22222A] transition-colors cursor-pointer"
                    onClick={() => setSelectedJob(job)}
                  >
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-[#FAFAFA] text-xs hover:text-[#818cf8] transition-colors">
                        {job.jobTitle}
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
                        {job.overallScore || 90}% Match
                      </span>
                    </td>

                    <td className="px-4 py-3.5">
                      <span className="ag-badge">
                        {job.applicationStatus || 'Pending'}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 text-right space-x-2" onClick={(e) => e.stopPropagation()}>
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
                          className="h-7 text-[11px] text-[#6366f1] hover:bg-[#6366f1]/10 px-2"
                        >
                          Tailor
                        </Button>
                      )}

                      {job.coldMailDraftId && (
                        <a href={`https://mail.google.com/mail/u/0/#drafts/${job.coldMailDraftId}`} target="_blank" rel="noreferrer">
                          <Button size="sm" variant="ghost" className="h-7 text-[11px] text-[#818cf8] hover:bg-[#818cf8]/10 px-2">
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
              {/* Left Column (2 Cols): Job Description */}
              <div className="md:col-span-2 p-6 space-y-4 text-xs text-[#A1A1AA] leading-relaxed">
                <div>
                  <h4 className="font-semibold text-xs text-[#FAFAFA] uppercase font-mono mb-2">
                    Job Description
                  </h4>
                  <p className="whitespace-pre-line">
                    {selectedJob.jobDescription || 'No description provided.'}
                  </p>
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

                  <div>
                    <span className="text-[10px] font-mono text-[#71717A] uppercase block">Job Source</span>
                    <span className="text-xs text-[#818cf8]">
                      {selectedJob.source}
                    </span>
                  </div>
                </div>

                <div className="border-t border-[rgba(255,255,255,0.08)] pt-4 space-y-2">
                  <a href={selectedJob.jobUrl} target="_blank" rel="noreferrer" className="block">
                    <Button className="w-full h-8 text-xs bg-[#6366f1] hover:bg-[#4f46e5] text-white">
                      Apply via Source <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
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
      )}
    </div>
  );
}
