'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Briefcase,
  Send,
  Target,
  FileCheck,
  PhoneCall,
  ExternalLink,
  ChevronRight,
  Trophy,
  TrendingUp,
  FileText,
  ArrowUpRight,
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
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        <div className="h-8 w-64 bg-[#E2E8F0] animate-pulse rounded-lg" />
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-[88px] bg-[#E2E8F0] animate-pulse rounded-lg" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 h-80 bg-[#E2E8F0] animate-pulse rounded-lg" />
          <div className="h-80 bg-[#E2E8F0] animate-pulse rounded-lg" />
        </div>
      </div>
    );
  }

  const { summary, recentJobs, recentActivity } = data || {};

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

  const kpiCards = [
    {
      label: 'Jobs Found',
      value: summary?.jobsToday || 0,
      sub: `${summary?.totalJobs || 0} Total`,
      icon: Briefcase,
      iconColor: '#4F46E5',
      iconBg: '#EEF2FF',
    },
    {
      label: 'Qualified',
      value: summary?.qualifiedCount || 0,
      sub: 'Score 85%+',
      icon: Send,
      iconColor: '#10B981',
      iconBg: '#ECFDF5',
      valueColor: '#059669',
    },
    {
      label: 'ATS Match',
      value: summary?.avgOverallScore ? `${summary.avgOverallScore}%` : '--',
      sub: 'Avg Score',
      icon: Target,
      iconColor: '#0891B2',
      iconBg: '#ECFEFF',
      valueColor: '#0891B2',
    },
    {
      label: 'Resume Score',
      value: summary?.avgTailoredAtsScore || 0,
      sub: summary?.avgTailoredAtsScore ? 'LaTeX Tailored' : 'No CVs',
      icon: FileCheck,
      iconColor: '#7C3AED',
      iconBg: '#F5F3FF',
      valueColor: '#7C3AED',
    },
    {
      label: 'Interviews',
      value: summary?.interviewCount || 0,
      sub: `${summary?.activePipelineCount || 0} Pipeline`,
      icon: PhoneCall,
      iconColor: '#F59E0B',
      iconBg: '#FFFBEB',
    },
    {
      label: 'Outreach',
      value: summary?.coldEmailsSent || 0,
      sub: `${summary?.coldEmailsPending || 0} Drafts`,
      icon: Send,
      iconColor: '#E11D48',
      iconBg: '#FFF1F2',
    },
  ];

  const quickLinks = [
    { title: 'Hiring Challenges', desc: 'Zero-AI-cost hackathons and coding contests.', href: '/challenges', icon: Trophy, borderColor: 'hover:border-[#FDE68A]', iconColor: '#B45309', iconBg: '#FFFBEB' },
    { title: 'Funding Radar', desc: 'Track freshly funded startups hiring early teams.', href: '/funding', icon: TrendingUp, borderColor: 'hover:border-[#A7F3D0]', iconColor: '#047857', iconBg: '#ECFDF5' },
    { title: 'Founder Outreach', desc: 'Psychology-based cold emails and LinkedIn notes.', href: '/outreach', icon: Send, borderColor: 'hover:border-[#FECDD3]', iconColor: '#BE123C', iconBg: '#FFF1F2' },
    { title: 'Resume Studio', desc: 'LaTeX live preview, ATS gap analysis, PDF export.', href: '/resume-studio', icon: FileText, borderColor: 'hover:border-[#DDD6FE]', iconColor: '#6D28D9', iconBg: '#F5F3FF' },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 page-fade">
      {/* Header */}
      <div className="flex justify-between items-start flex-wrap gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-[#0F172A]">
            Good Morning, <span className="text-[#4F46E5]">Saikat</span>
          </h1>
          <p className="text-[13px] text-[#64748B]">
            Your career pipeline is running on autopilot.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-[8px] border border-[#E2E8F0] text-[11px] text-[#475569] shadow-2xs">
          <span className="status-dot status-dot-active" />
          <span className="font-semibold text-[#0F172A]">AI Engine Online</span>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {kpiCards.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.label} className="ag-card p-3.5 space-y-2">
              <div className="flex items-center justify-between text-[#64748B] text-[11px]">
                <span className="font-semibold">{kpi.label}</span>
                <div className="w-6 h-6 rounded-[6px] flex items-center justify-center" style={{ backgroundColor: kpi.iconBg }}>
                  <Icon className="w-3.5 h-3.5" style={{ color: kpi.iconColor }} />
                </div>
              </div>
              <div className="text-xl font-bold" style={{ color: kpi.valueColor || '#0F172A' }}>
                {kpi.value}
              </div>
              <div className="text-[10px] text-[#94A3B8] font-mono">{kpi.sub}</div>
            </Card>
          );
        })}
      </div>

      {/* Main Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Job Matches Table */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-[15px] font-bold text-[#0F172A]">Top Job Matches</h2>
            <Link href="/jobs" className="text-[11px] text-[#4F46E5] hover:underline font-semibold flex items-center gap-1">
              View All <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          <Card className="ag-card overflow-hidden">
            <table className="ag-table">
              <thead>
                <tr>
                  <th>Role & Company</th>
                  <th>Location</th>
                  <th>Match</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentJobs && recentJobs.length > 0 ? (
                  recentJobs.map((job: any) => (
                    <tr key={job.id}>
                      <td>
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-[6px] bg-[#F1F5F9] border border-[#E2E8F0] flex items-center justify-center font-bold text-[10px] text-[#4F46E5] shrink-0">
                            {job.company ? job.company[0].toUpperCase() : 'C'}
                          </div>
                          <div className="min-w-0">
                            <a href={job.jobUrl} target="_blank" rel="noreferrer" className="font-semibold text-[#0F172A] hover:text-[#4F46E5] transition-colors duration-150 flex items-center gap-1 text-[12px] group">
                              <span className="truncate">{job.jobTitle}</span>
                              <ExternalLink className="w-3 h-3 text-[#94A3B8] group-hover:text-[#4F46E5] shrink-0" />
                            </a>
                            <div className="text-[10px] text-[#64748B] truncate">{job.company}</div>
                          </div>
                        </div>
                      </td>
                      <td className="text-[12px] text-[#334155]">{job.locationType || 'Remote'}</td>
                      <td><span className="ag-badge-accent">{job.overallScore || 90}%</span></td>
                      <td className="text-right">
                        <a href={job.jobUrl} target="_blank" rel="noreferrer">
                          <Button size="sm" variant="outline" className="h-7 text-[11px] px-2.5">
                            Open <ExternalLink className="w-3 h-3" />
                          </Button>
                        </a>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="text-center text-[#64748B] text-[12px] py-8">
                      No recent jobs. Run the scraping pipeline to discover listings.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-5">
          {/* Activity Feed */}
          <div className="space-y-3">
            <h2 className="text-[15px] font-bold text-[#0F172A]">Today&apos;s Activity</h2>
            <Card className="ag-card p-4 space-y-2.5">
              {recentActivity && recentActivity.length > 0 ? (
                recentActivity.map((activity: any, idx: number) => (
                  <div key={idx} className={`flex items-start gap-2.5 text-[12px] ${idx > 0 ? 'border-t border-[#F1F5F9] pt-2.5' : ''}`}>
                    <div className="w-[6px] h-[6px] rounded-full mt-1.5 shrink-0" style={{ backgroundColor: activity.color || '#4F46E5' }} />
                    <div>
                      <p className="text-[#0F172A] font-semibold text-[12px]">{activity.label}</p>
                      <p className="text-[10px] text-[#64748B]">{timeAgo(activity.timestamp)}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-[12px] text-[#64748B] text-center py-4">
                  No pipeline runs yet. Trigger a scrape to see activity.
                </div>
              )}
            </Card>
          </div>

          {/* AI Engine Status */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-[13px] font-bold text-[#0F172A]">AI Engine Status</h2>
              <span className="text-[10px] text-[#047857] font-mono font-semibold">Active</span>
            </div>
            <Card className="ag-card p-4 space-y-2 text-[12px] text-[#475569]">
              <div className="flex justify-between items-center">
                <span>Model:</span>
                <span className="text-[#0F172A] font-mono text-[11px] font-semibold">Groq (Llama-3.3-70b)</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Rate Limits:</span>
                <span className="text-[#047857] font-mono text-[11px] font-semibold">Healthy (25 rpm)</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Gmail:</span>
                <span className={`font-mono text-[11px] font-semibold ${summary?.gmailConnected ? 'text-[#047857]' : 'text-[#B45309]'}`}>
                  {summary?.gmailConnected ? 'Connected' : 'Not Connected'}
                </span>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {quickLinks.map((link) => {
          const Icon = link.icon;
          return (
            <Link key={link.href} href={link.href}>
              <Card className={`ag-card p-4 space-y-2.5 group cursor-pointer h-full ${link.borderColor}`}>
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-[8px] flex items-center justify-center" style={{ backgroundColor: link.iconBg }}>
                    <Icon className="w-4 h-4" style={{ color: link.iconColor }} />
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-[#94A3B8] group-hover:text-[#0F172A] transition-colors duration-150" />
                </div>
                <h3 className="font-bold text-[13px] text-[#0F172A]">{link.title}</h3>
                <p className="text-[11px] text-[#64748B] leading-relaxed">{link.desc}</p>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
