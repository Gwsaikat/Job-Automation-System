'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Briefcase,
  Send,
  Target,
  FileCheck,
  PhoneCall,
  Zap,
  ExternalLink,
  ChevronRight,
  Trophy,
  TrendingUp,
  FileText,
  Clock,
  Sparkles,
  ArrowUpRight,
  Building,
} from 'lucide-react';

export default function MissionControlPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard')
      .then((res) => res.json())
      .then((data) => {
        setData(data);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="p-8 space-y-6 max-w-7xl mx-auto">
        <div className="h-8 w-64 bg-[#141419] rounded-lg animate-pulse" />
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-24 bg-[#141419] rounded-xl animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 bg-[#141419] rounded-xl animate-pulse" />
          <div className="h-96 bg-[#141419] rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  const { summary, recentJobs, recentActivity } = data || {};

  // Helper: relative time display
  function timeAgo(isoString: string): string {
    if (!isoString) return '';
    const diff = Date.now() - new Date(isoString).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 page-fade relative">
      {/* Background Subtle Ambient Glows */}
      <div className="absolute -top-12 left-1/3 w-96 h-96 bg-[#6366f1]/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/2 right-10 w-80 h-80 bg-[#a855f7]/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Hero Header */}
      <div className="flex justify-between items-start flex-wrap gap-4 relative z-10">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-[#FAFAFA]">
            Good Morning, <span className="gradient-text-indigo">Saikat</span>
          </h1>
          <p className="text-sm text-[#A1A1AA]">
            Your career is running on autopilot.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-[#141419] px-3.5 py-1.5 rounded-lg border border-[rgba(255,255,255,0.08)] text-xs text-[#A1A1AA] shadow-sm">
            <Zap className="w-3.5 h-3.5 text-[#818cf8] fill-[#818cf8]" />
            <span className="font-mono text-[11px] text-[#FAFAFA]">AI Engine Online</span>
          </div>
        </div>
      </div>

      {/* KPI Row — 6 Compact Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 relative z-10">
        <Card className="ag-card p-4">
          <div className="flex items-center justify-between text-[#71717A] text-xs mb-2">
            <span>Jobs Found</span>
            <div className="w-6 h-6 rounded-md bg-[#6366f1]/10 flex items-center justify-center">
              <Briefcase className="w-3.5 h-3.5 text-[#818cf8]" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#FAFAFA]">{summary?.jobsToday || 0}</div>
          <div className="text-[11px] text-[#71717A] mt-1 font-mono">{summary?.totalJobs || 0} Total DB</div>
        </Card>

        <Card className="ag-card p-4">
          <div className="flex items-center justify-between text-[#71717A] text-xs mb-2">
            <span>Applications</span>
            <div className="w-6 h-6 rounded-md bg-[#34d399]/10 flex items-center justify-center">
              <Send className="w-3.5 h-3.5 text-[#34d399]" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#FAFAFA]">{summary?.qualifiedCount || 0}</div>
          <div className="text-[11px] text-[#34d399] mt-1 font-mono">Qualified ≥85%</div>
        </Card>

        <Card className="ag-card p-4">
          <div className="flex items-center justify-between text-[#71717A] text-xs mb-2">
            <span>ATS Match</span>
            <div className="w-6 h-6 rounded-md bg-[#22d3ee]/10 flex items-center justify-center">
              <Target className="w-3.5 h-3.5 text-[#22d3ee]" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#34d399]">
            {summary?.avgOverallScore ? `${summary.avgOverallScore}%` : '—'}
          </div>
          <div className="text-[11px] text-[#71717A] mt-1 font-mono">Target Stack</div>
        </Card>

        <Card className="ag-card p-4">
          <div className="flex items-center justify-between text-[#71717A] text-xs mb-2">
            <span>Resume Score</span>
            <div className="w-6 h-6 rounded-md bg-[#c084fc]/10 flex items-center justify-center">
              <FileCheck className="w-3.5 h-3.5 text-[#c084fc]" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#c084fc]">{summary?.avgTailoredAtsScore || 0}<span className="text-xs text-[#71717A]">/100</span></div>
          <div className="text-[11px] text-[#71717A] mt-1 font-mono">{summary?.avgTailoredAtsScore ? 'LaTeX Tailored' : 'No CVs yet'}</div>
        </Card>

        <Card className="ag-card p-4">
          <div className="flex items-center justify-between text-[#71717A] text-xs mb-2">
            <span>Interviews</span>
            <div className="w-6 h-6 rounded-md bg-[#fbbf24]/10 flex items-center justify-center">
              <PhoneCall className="w-3.5 h-3.5 text-[#fbbf24]" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#FAFAFA]">{summary?.interviewCount || 0}</div>
          <div className="text-[11px] text-[#34d399] mt-1 font-mono">{summary?.activePipelineCount || 0} Active Pipeline</div>
        </Card>

        <Card className="ag-card p-4">
          <div className="flex items-center justify-between text-[#71717A] text-xs mb-2">
            <span>Outreach</span>
            <div className="w-6 h-6 rounded-md bg-[#6366f1]/10 flex items-center justify-center">
              <Send className="w-3.5 h-3.5 text-[#818cf8]" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#FAFAFA]">{summary?.coldEmailsSent || 0}</div>
          <div className="text-[11px] text-[#71717A] mt-1 font-mono">{summary?.coldEmailsPending || 0} Drafts Pending</div>
        </Card>
      </div>

      {/* Main Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
        {/* Left (2 Cols): Top Job Matches */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[#FAFAFA]">
              Top Job Matches
            </h2>
            <Link
              href="/jobs"
              className="text-xs text-[#818cf8] hover:text-[#a5b4fc] font-medium flex items-center gap-1 transition-colors"
            >
              View All <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <Card className="ag-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left text-[#A1A1AA]">
                <thead className="text-[11px] text-[#71717A] uppercase tracking-wider bg-[#111827] border-b border-[rgba(255,255,255,0.08)]">
                  <tr>
                    <th className="px-4 py-3.5 font-medium">Role & Company</th>
                    <th className="px-4 py-3.5 font-medium">Location</th>
                    <th className="px-4 py-3.5 font-medium">Match Score</th>
                    <th className="px-4 py-3.5 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgba(255,255,255,0.08)]">
                  {recentJobs && recentJobs.length > 0 ? (
                    recentJobs.map((job: any) => (
                      <tr key={job.id} className="hover:bg-[#1c1c24] transition-colors">
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-[#111827] border border-[rgba(255,255,255,0.08)] flex items-center justify-center font-bold text-xs text-[#818cf8] shrink-0">
                              {job.company ? job.company[0].toUpperCase() : 'C'}
                            </div>
                            <div className="min-w-0">
                              <a
                                href={job.jobUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="font-semibold text-[#FAFAFA] hover:text-[#818cf8] hover:underline transition-colors flex items-center gap-1 text-xs group"
                                title="Open original job posting"
                              >
                                <span className="truncate">{job.jobTitle}</span>
                                <ExternalLink className="w-3 h-3 text-[#71717A] group-hover:text-[#818cf8] shrink-0" />
                              </a>
                              <div className="text-[11px] text-[#71717A] truncate">
                                {job.company}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="text-xs text-[#FAFAFA]">{job.locationType || 'Remote'}</div>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="ag-badge-accent">
                            {job.overallScore || 90}%
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-right space-x-2">
                          <a href={job.jobUrl} target="_blank" rel="noreferrer">
                            <Button size="sm" className="h-7 text-[11px] bg-[#6366f1] hover:bg-[#4f46e5] text-white px-2.5 font-medium">
                              Open Job <ExternalLink className="w-3 h-3 ml-1" />
                            </Button>
                          </a>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-[#71717A] text-xs">
                        No recent jobs. Sync pipeline to load listings.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Right Column (1 Col): Today's Activity & AI Status */}
        <div className="space-y-6">
          {/* Today's Activity */}
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-[#FAFAFA]">
              Today's Activity
            </h2>
            <Card className="ag-card p-4 space-y-3">
              {recentActivity && recentActivity.length > 0 ? (
                recentActivity.map((activity: any, idx: number) => (
                  <div
                    key={idx}
                    className={`flex items-start gap-3 text-xs ${idx > 0 ? 'border-t border-[rgba(255,255,255,0.08)] pt-3' : ''}`}
                  >
                    <div
                      className="w-2 h-2 rounded-full mt-1.5 shrink-0"
                      style={{ backgroundColor: activity.color }}
                    />
                    <div>
                      <p className="text-[#FAFAFA] font-medium">{activity.label}</p>
                      <p className="text-[11px] text-[#71717A]">{timeAgo(activity.timestamp)}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-xs text-[#71717A] text-center py-4">
                  No pipeline runs yet. Trigger a scrape to see activity.
                </div>
              )}
            </Card>
          </div>

          {/* AI Status */}
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-[#FAFAFA] flex items-center justify-between">
              <span>AI Engine Status</span>
              <span className="text-[11px] text-[#34d399] font-mono font-normal">Active</span>
            </h2>
            <Card className="ag-card p-4 space-y-2.5 text-xs text-[#A1A1AA]">
              <div className="flex justify-between items-center">
                <span>Model Chain:</span>
                <span className="text-[#FAFAFA] font-mono text-[11px]">Groq (Llama-3.3-70b)</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Rate Limits:</span>
                <span className="text-[#34d399] font-mono text-[11px]">Healthy (25 rpm)</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Gmail Staging:</span>
                <span className={`font-mono text-[11px] ${summary?.gmailConnected ? 'text-[#34d399]' : 'text-[#fbbf24]'}`}>
                  {summary?.gmailConnected ? 'Connected' : 'Not Connected'}
                </span>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Bottom Row — 4 Equal Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
        <Link href="/challenges">
          <Card className="ag-card p-5 space-y-2 group cursor-pointer h-full border hover:border-[#818cf8]/40">
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-lg bg-[#6366f1]/10 flex items-center justify-center">
                <Trophy className="w-4 h-4 text-[#818cf8]" />
              </div>
              <ArrowUpRight className="w-4 h-4 text-[#71717A] group-hover:text-[#FAFAFA] transition-colors" />
            </div>
            <h3 className="font-semibold text-sm text-[#FAFAFA]">Hiring Challenges</h3>
            <p className="text-xs text-[#71717A] leading-relaxed">
              Zero-AI-cost hackathons and coding contests.
            </p>
          </Card>
        </Link>

        <Link href="/funding">
          <Card className="ag-card p-5 space-y-2 group cursor-pointer h-full border hover:border-[#34d399]/40">
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-lg bg-[#34d399]/10 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-[#34d399]" />
              </div>
              <ArrowUpRight className="w-4 h-4 text-[#71717A] group-hover:text-[#FAFAFA] transition-colors" />
            </div>
            <h3 className="font-semibold text-sm text-[#FAFAFA]">Funding Leads</h3>
            <p className="text-xs text-[#71717A] leading-relaxed">
              Track freshly funded startups hiring early engineering teams.
            </p>
          </Card>
        </Link>

        <Link href="/outreach">
          <Card className="ag-card p-5 space-y-2 group cursor-pointer h-full border hover:border-[#c084fc]/40">
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-lg bg-[#c084fc]/10 flex items-center justify-center">
                <Send className="w-4 h-4 text-[#c084fc]" />
              </div>
              <ArrowUpRight className="w-4 h-4 text-[#71717A] group-hover:text-[#FAFAFA] transition-colors" />
            </div>
            <h3 className="font-semibold text-sm text-[#FAFAFA]">Founder Outreach</h3>
            <p className="text-xs text-[#71717A] leading-relaxed">
              Psychology-based cold emails & LinkedIn connection notes.
            </p>
          </Card>
        </Link>

        <Link href="/resume-studio">
          <Card className="ag-card p-5 space-y-2 group cursor-pointer h-full border hover:border-[#22d3ee]/40">
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-lg bg-[#22d3ee]/10 flex items-center justify-center">
                <FileText className="w-4 h-4 text-[#22d3ee]" />
              </div>
              <ArrowUpRight className="w-4 h-4 text-[#71717A] group-hover:text-[#FAFAFA] transition-colors" />
            </div>
            <h3 className="font-semibold text-sm text-[#FAFAFA]">Resume Studio</h3>
            <p className="text-xs text-[#71717A] leading-relaxed">
              LaTeX live preview, ATS keyword gap analysis, and PDF export.
            </p>
          </Card>
        </Link>
      </div>
    </div>
  );
}
