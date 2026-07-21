'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  AreaChart,
  Area,
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  Award,
  PhoneCall,
  CheckCircle2,
  Zap,
  Target,
  Layers,
  Sparkles,
  Send,
  Briefcase,
  PieChart as PieIcon,
  Activity,
  Code,
} from 'lucide-react';

interface AnalyticsData {
  summary: {
    totalScraped: number;
    totalJobs: number;
    totalApplications: number;
    coldMailSentCount: number;
    interviewCount: number;
    offerCount: number;
    recruiterResponseRate: number;
    interviewConversion: number;
    offerRate: number;
  };
  monthlyData: Array<{
    month: string;
    applications: number;
    interviews: number;
    offers: number;
    qualified: number;
  }>;
  outcomeBreakdown: Array<{
    name: string;
    count: number;
    percentage: number;
    color: string;
  }>;
  topSkills: Array<{
    skill: string;
    count: number;
  }>;
  sourcePerformance: Array<{
    source: string;
    total: number;
    qualified: number;
    passRate: number;
  }>;
  locationDistribution: Array<{
    name: string;
    count: number;
  }>;
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/analytics')
      .then((res) => res.json())
      .then((resData) => {
        setData(resData);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load analytics:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto space-y-6">
        <div className="h-10 w-72 bg-[#111116] rounded-xl animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-[#111116] rounded-xl animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 bg-[#111116] rounded-xl animate-pulse" />
          <div className="h-80 bg-[#111116] rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  const { summary, monthlyData, outcomeBreakdown, topSkills, sourcePerformance } = data || {
    summary: {
      totalScraped: 0,
      totalJobs: 0,
      totalApplications: 0,
      coldMailSentCount: 0,
      interviewCount: 0,
      offerCount: 0,
      recruiterResponseRate: 0,
      interviewConversion: 0,
      offerRate: 0,
    },
    monthlyData: [],
    outcomeBreakdown: [],
    topSkills: [],
    sourcePerformance: [],
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 page-fade relative">
      {/* Background Ambient Glows */}
      <div className="absolute -top-20 left-1/4 w-[500px] h-[500px] bg-[#6366f1]/8 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[450px] h-[450px] bg-[#a855f7]/6 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 left-1/3 w-[400px] h-[400px] bg-[#34d399]/5 rounded-full blur-[150px] pointer-events-none" />

      {/* Header */}
      <div className="flex justify-between items-start flex-wrap gap-4 relative z-10">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-[#818cf8]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>REAL-TIME PERFORMANCE METRICS</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-[#FAFAFA] flex items-center gap-3">
            <BarChart3 className="w-7 h-7 text-[#6366f1]" />
            <span>Career Analytics</span>
          </h1>
          <p className="text-sm text-[#A1A1AA]">
            Live telemetry tracking application conversion rates, outreach yield, and skill demand.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-[#111116] px-4 py-2 rounded-xl border border-[rgba(255,255,255,0.08)] text-xs text-[#A1A1AA] shadow-lg">
            <Activity className="w-4 h-4 text-[#34d399] animate-pulse" />
            <span className="font-mono text-xs text-[#FAFAFA]">{summary.totalJobs} Jobs Analyzed</span>
          </div>
        </div>
      </div>

      {/* Primary KPI Cards (4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 relative z-10">
        {/* Total Applications */}
        <Card className="ag-card p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#6366f1]/10 rounded-full blur-2xl group-hover:bg-[#6366f1]/20 transition-all" />
          <div className="flex items-center justify-between text-[#71717A] text-xs font-medium mb-3">
            <span>Total Applications</span>
            <div className="w-8 h-8 rounded-lg bg-[#6366f1]/10 flex items-center justify-center">
              <Briefcase className="w-4 h-4 text-[#818cf8]" />
            </div>
          </div>
          <div className="text-3xl font-bold text-[#FAFAFA] font-mono tracking-tight">
            {summary.totalApplications}
          </div>
          <div className="text-xs text-[#71717A] mt-2 font-mono flex items-center gap-1.5">
            <span className="text-[#818cf8] font-semibold">{summary.totalJobs}</span>
            <span>Total Active in DB</span>
          </div>
        </Card>

        {/* Recruiter Response Rate */}
        <Card className="ag-card p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#34d399]/10 rounded-full blur-2xl group-hover:bg-[#34d399]/20 transition-all" />
          <div className="flex items-center justify-between text-[#71717A] text-xs font-medium mb-3">
            <span>Recruiter Response Rate</span>
            <div className="w-8 h-8 rounded-lg bg-[#34d399]/10 flex items-center justify-center">
              <Send className="w-4 h-4 text-[#34d399]" />
            </div>
          </div>
          <div className="text-3xl font-bold text-[#34d399] font-mono tracking-tight">
            {summary.recruiterResponseRate}%
          </div>
          <div className="text-xs text-[#71717A] mt-2 font-mono flex items-center gap-1.5">
            <span className="text-[#34d399] font-semibold">{summary.coldMailSentCount}</span>
            <span>Outreach Drafts Sent</span>
          </div>
        </Card>

        {/* Interview Conversion */}
        <Card className="ag-card p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#a855f7]/10 rounded-full blur-2xl group-hover:bg-[#a855f7]/20 transition-all" />
          <div className="flex items-center justify-between text-[#71717A] text-xs font-medium mb-3">
            <span>Interview Conversion</span>
            <div className="w-8 h-8 rounded-lg bg-[#a855f7]/10 flex items-center justify-center">
              <PhoneCall className="w-4 h-4 text-[#c084fc]" />
            </div>
          </div>
          <div className="text-3xl font-bold text-[#c084fc] font-mono tracking-tight">
            {summary.interviewConversion}%
          </div>
          <div className="text-xs text-[#71717A] mt-2 font-mono flex items-center gap-1.5">
            <span className="text-[#c084fc] font-semibold">{summary.interviewCount}</span>
            <span>Total Interviews</span>
          </div>
        </Card>

        {/* Offer Rate */}
        <Card className="ag-card p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#fbbf24]/10 rounded-full blur-2xl group-hover:bg-[#fbbf24]/20 transition-all" />
          <div className="flex items-center justify-between text-[#71717A] text-xs font-medium mb-3">
            <span>Offer Conversion Rate</span>
            <div className="w-8 h-8 rounded-lg bg-[#fbbf24]/10 flex items-center justify-center">
              <Award className="w-4 h-4 text-[#fbbf24]" />
            </div>
          </div>
          <div className="text-3xl font-bold text-[#FAFAFA] font-mono tracking-tight">
            {summary.offerRate}%
          </div>
          <div className="text-xs text-[#71717A] mt-2 font-mono flex items-center gap-1.5">
            <span className="text-[#fbbf24] font-semibold">{summary.offerCount}</span>
            <span>Offers Received</span>
          </div>
        </Card>
      </div>

      {/* Main Charts Row 1: Monthly Progress & Outcome Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-10">
        {/* Monthly Application & Interview Growth */}
        <Card className="ag-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm text-[#FAFAFA] flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#818cf8]" />
              <span>Monthly Application & Conversion Velocity</span>
            </h3>
            <span className="text-[11px] font-mono text-[#71717A]">Last 6 Months</span>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="month" stroke="#71717A" fontSize={11} tickLine={false} />
                <YAxis stroke="#71717A" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0c0c10',
                    borderColor: 'rgba(255,255,255,0.12)',
                    borderRadius: '10px',
                    color: '#FAFAFA',
                    fontSize: '12px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                  }}
                />
                <Bar dataKey="applications" fill="#6366f1" radius={[4, 4, 0, 0]} name="Applications" />
                <Bar dataKey="qualified" fill="#818cf8" radius={[4, 4, 0, 0]} name="Qualified Jobs" />
                <Bar dataKey="interviews" fill="#34d399" radius={[4, 4, 0, 0]} name="Interviews" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Application Outcome Breakdown */}
        <Card className="ag-card p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm text-[#FAFAFA] flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-[#c084fc]" />
              <span>Application Pipeline Outcome Distribution</span>
            </h3>
            <span className="text-[11px] font-mono text-[#71717A]">Live Status</span>
          </div>

          <div className="space-y-4 pt-2">
            {outcomeBreakdown.map((item, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-[#A1A1AA] flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span>{item.name}</span>
                  </span>
                  <span className="font-mono text-[#FAFAFA] font-semibold">
                    {item.count} <span className="text-[#71717A] font-normal">({item.percentage}%)</span>
                  </span>
                </div>
                <div className="w-full bg-[#111116] h-2 rounded-full overflow-hidden border border-[rgba(255,255,255,0.05)]">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(item.percentage, 2)}%`, backgroundColor: item.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Main Charts Row 2: Tech Stack Demand & Source Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-10">
        {/* Tech Stack Skill Frequency */}
        <Card className="ag-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm text-[#FAFAFA] flex items-center gap-2">
              <Code className="w-4 h-4 text-[#34d399]" />
              <span>Target Tech Stack Frequency in Listings</span>
            </h3>
            <span className="text-[11px] font-mono text-[#34d399]">Candidate Match</span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topSkills.slice(0, 8)} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                <XAxis type="number" stroke="#71717A" fontSize={11} hide />
                <YAxis dataKey="skill" type="category" stroke="#A1A1AA" fontSize={11} tickLine={false} axisLine={false} width={80} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0c0c10',
                    borderColor: 'rgba(255,255,255,0.12)',
                    borderRadius: '10px',
                    color: '#FAFAFA',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" fill="#34d399" radius={[0, 4, 4, 0]} name="Mentions" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Source Scraping Yield */}
        <Card className="ag-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm text-[#FAFAFA] flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#818cf8]" />
              <span>Scraping Source Yield & Qualification Rate</span>
            </h3>
            <span className="text-[11px] font-mono text-[#71717A]">Quality &gt; Quantity</span>
          </div>

          <div className="space-y-3 pt-1">
            {sourcePerformance.slice(0, 5).map((src, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-[#111116]/80 border border-[rgba(255,255,255,0.06)] hover:border-[#6366f1]/30 transition-all">
                <div className="space-y-0.5">
                  <div className="text-xs font-semibold text-[#FAFAFA]">{src.source}</div>
                  <div className="text-[11px] text-[#71717A] font-mono">
                    {src.qualified} qualified / {src.total} total
                  </div>
                </div>
                <div className="text-right">
                  <span className="ag-badge-accent font-mono">
                    {src.passRate}% Yield
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
