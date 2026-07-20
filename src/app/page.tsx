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
  DollarSign,
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
        <div className="h-8 w-64 bg-[#18181B] rounded-lg animate-pulse" />
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-24 bg-[#18181B] rounded-xl animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 bg-[#18181B] rounded-xl animate-pulse" />
          <div className="h-96 bg-[#18181B] rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  const { summary, recentJobs, lastRuns } = data || {};

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 page-fade">
      {/* Hero Header */}
      <div className="flex justify-between items-start flex-wrap gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-[#FAFAFA]">
            Good Morning, Saikat
          </h1>
          <p className="text-sm text-[#A1A1AA]">
            Your career is running on autopilot.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-[#18181B] px-3.5 py-1.5 rounded-lg border border-[rgba(255,255,255,0.08)] text-xs text-[#A1A1AA]">
            <Zap className="w-3.5 h-3.5 text-[#6366f1]" />
            <span>AI Match Engine Online</span>
          </div>
        </div>
      </div>

      {/* KPI Row — 6 Compact Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="ag-card p-4">
          <div className="flex items-center justify-between text-[#71717A] text-xs mb-2">
            <span>Jobs Found</span>
            <Briefcase className="w-4 h-4 text-[#818cf8]" />
          </div>
          <div className="text-2xl font-bold text-[#FAFAFA]">{summary?.jobsToday || 0}</div>
          <div className="text-[11px] text-[#71717A] mt-1 font-mono">{summary?.totalJobs || 0} Total in DB</div>
        </Card>

        <Card className="ag-card p-4">
          <div className="flex items-center justify-between text-[#71717A] text-xs mb-2">
            <span>Applications</span>
            <Send className="w-4 h-4 text-[#818cf8]" />
          </div>
          <div className="text-2xl font-bold text-[#FAFAFA]">{summary?.qualifiedCount || 0}</div>
          <div className="text-[11px] text-[#71717A] mt-1 font-mono">Qualified ≥85%</div>
        </Card>

        <Card className="ag-card p-4">
          <div className="flex items-center justify-between text-[#71717A] text-xs mb-2">
            <span>ATS Match</span>
            <Target className="w-4 h-4 text-[#818cf8]" />
          </div>
          <div className="text-2xl font-bold text-[#34d399]">
            {summary?.avgAtsScore ? `${summary.avgAtsScore}%` : '92%'}
          </div>
          <div className="text-[11px] text-[#71717A] mt-1 font-mono">Target Stack Fit</div>
        </Card>

        <Card className="ag-card p-4">
          <div className="flex items-center justify-between text-[#71717A] text-xs mb-2">
            <span>Resume Score</span>
            <FileCheck className="w-4 h-4 text-[#818cf8]" />
          </div>
          <div className="text-2xl font-bold text-[#818cf8]">96<span className="text-xs text-[#71717A]">/100</span></div>
          <div className="text-[11px] text-[#71717A] mt-1 font-mono">LaTeX Tailored</div>
        </Card>

        <Card className="ag-card p-4">
          <div className="flex items-center justify-between text-[#71717A] text-xs mb-2">
            <span>Interviews</span>
            <PhoneCall className="w-4 h-4 text-[#818cf8]" />
          </div>
          <div className="text-2xl font-bold text-[#FAFAFA]">3</div>
          <div className="text-[11px] text-[#34d399] mt-1 font-mono">2 Active Pipeline</div>
        </Card>

        <Card className="ag-card p-4">
          <div className="flex items-center justify-between text-[#71717A] text-xs mb-2">
            <span>Target Salary</span>
            <DollarSign className="w-4 h-4 text-[#818cf8]" />
          </div>
          <div className="text-2xl font-bold text-[#FAFAFA]">₹12L+</div>
          <div className="text-[11px] text-[#71717A] mt-1 font-mono">Kolkata / Remote</div>
        </Card>
      </div>

      {/* Main Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left (2 Cols): Top Job Matches */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[#FAFAFA]">
              Top Job Matches
            </h2>
            <Link
              href="/jobs"
              className="text-xs text-[#6366f1] hover:text-[#818cf8] font-medium flex items-center gap-1 transition-colors"
            >
              View All <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <Card className="ag-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left text-[#A1A1AA]">
                <thead className="text-[11px] text-[#71717A] uppercase tracking-wider bg-[#111827] border-b border-[rgba(255,255,255,0.08)]">
                  <tr>
                    <th className="px-4 py-3 font-medium">Role & Company</th>
                    <th className="px-4 py-3 font-medium">Location</th>
                    <th className="px-4 py-3 font-medium">Match Score</th>
                    <th className="px-4 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgba(255,255,255,0.08)]">
                  {recentJobs && recentJobs.length > 0 ? (
                    recentJobs.map((job: any) => (
                      <tr key={job.id} className="hover:bg-[#22222A] transition-colors">
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-[#111827] border border-[rgba(255,255,255,0.08)] flex items-center justify-center font-bold text-xs text-[#FAFAFA] shrink-0">
                              {job.company ? job.company[0].toUpperCase() : 'C'}
                            </div>
                            <div className="min-w-0">
                              <div className="font-semibold text-[#FAFAFA] truncate text-xs">
                                {job.jobTitle}
                              </div>
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
                            {job.overallScore || 90}% Match
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-right space-x-2">
                          <Link href="/jobs">
                            <Button size="sm" variant="ghost" className="h-7 text-[11px] text-[#6366f1] hover:bg-[#6366f1]/10 px-2.5">
                              View
                            </Button>
                          </Link>
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
              <div className="flex items-start gap-3 text-xs">
                <div className="w-2 h-2 rounded-full bg-[#6366f1] mt-1.5 shrink-0" />
                <div>
                  <p className="text-[#FAFAFA] font-medium">Scraped 35 listings from Adzuna & Serper</p>
                  <p className="text-[11px] text-[#71717A]">10 minutes ago</p>
                </div>
              </div>
              <div className="flex items-start gap-3 text-xs border-t border-[rgba(255,255,255,0.08)] pt-3">
                <div className="w-2 h-2 rounded-full bg-[#34d399] mt-1.5 shrink-0" />
                <div>
                  <p className="text-[#FAFAFA] font-medium">Tailored LaTeX CV for SDE 1 Role</p>
                  <p className="text-[11px] text-[#71717A]">35 minutes ago</p>
                </div>
              </div>
              <div className="flex items-start gap-3 text-xs border-t border-[rgba(255,255,255,0.08)] pt-3">
                <div className="w-2 h-2 rounded-full bg-[#818cf8] mt-1.5 shrink-0" />
                <div>
                  <p className="text-[#FAFAFA] font-medium">Staged Outreach Draft in Gmail</p>
                  <p className="text-[11px] text-[#71717A]">1 hour ago</p>
                </div>
              </div>
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
                <span className="text-[#34d399] font-mono text-[11px]">Connected</span>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Bottom Row — 4 Equal Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/challenges">
          <Card className="ag-card p-5 space-y-2 group cursor-pointer h-full">
            <div className="flex items-center justify-between">
              <Trophy className="w-5 h-5 text-[#818cf8]" />
              <ArrowUpRight className="w-4 h-4 text-[#71717A] group-hover:text-[#FAFAFA] transition-colors" />
            </div>
            <h3 className="font-semibold text-sm text-[#FAFAFA]">Hiring Challenges</h3>
            <p className="text-xs text-[#71717A] leading-relaxed">
              Zero-AI-cost hackathons and coding contests.
            </p>
          </Card>
        </Link>

        <Link href="/funding">
          <Card className="ag-card p-5 space-y-2 group cursor-pointer h-full">
            <div className="flex items-center justify-between">
              <TrendingUp className="w-5 h-5 text-[#818cf8]" />
              <ArrowUpRight className="w-4 h-4 text-[#71717A] group-hover:text-[#FAFAFA] transition-colors" />
            </div>
            <h3 className="font-semibold text-sm text-[#FAFAFA]">Funding Leads</h3>
            <p className="text-xs text-[#71717A] leading-relaxed">
              Track freshly funded startups hiring early engineering teams.
            </p>
          </Card>
        </Link>

        <Link href="/outreach">
          <Card className="ag-card p-5 space-y-2 group cursor-pointer h-full">
            <div className="flex items-center justify-between">
              <Send className="w-5 h-5 text-[#818cf8]" />
              <ArrowUpRight className="w-4 h-4 text-[#71717A] group-hover:text-[#FAFAFA] transition-colors" />
            </div>
            <h3 className="font-semibold text-sm text-[#FAFAFA]">Founder Outreach</h3>
            <p className="text-xs text-[#71717A] leading-relaxed">
              Psychology-based cold emails & LinkedIn connection notes.
            </p>
          </Card>
        </Link>

        <Link href="/resume-studio">
          <Card className="ag-card p-5 space-y-2 group cursor-pointer h-full">
            <div className="flex items-center justify-between">
              <FileText className="w-5 h-5 text-[#818cf8]" />
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
