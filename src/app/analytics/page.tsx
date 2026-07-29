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
  Zap,
  Target,
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
  }>;
  outcomeBreakdown?: Array<{
    name: string;
    count: number;
    percentage: number;
    color: string;
  }>;
  sourcePerformance?: Array<{
    source: string;
    total: number;
    qualified: number;
    passRate: number;
  }>;
  topSkills?: Array<{
    skill: string;
    count: number;
  }>;
  locationDistribution?: Array<{
    name: string;
    count: number;
  }>;
}

const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#0891B2', '#7C3AED', '#E11D48'];

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/analytics')
      .then((res) => res.json())
      .then((data) => {
        setData(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  if (loading || !data || !data.summary) {
    return <div className="p-6 text-[#64748B] text-xs font-mono">Loading Analytics Dashboard...</div>;
  }

  const { summary } = data;
  const monthlyData = data.monthlyData || [];
  const outcomeBreakdown = data.outcomeBreakdown || [];
  const sourcePerformance = data.sourcePerformance || [];
  const topSkills = data.topSkills || [];
  const locationDistribution = data.locationDistribution || [];

  const metrics = [
    { label: 'Scraped & Processed', value: summary.totalJobs || 0, sub: 'Qualified Jobs', icon: Briefcase, color: '#4F46E5', bg: '#EEF2FF' },
    { label: 'Applications Sent', value: summary.totalApplications || 0, sub: 'Portal & Direct', icon: Send, color: '#0891B2', bg: '#ECFEFF' },
    { label: 'Cold Emails Sent', value: summary.coldMailSentCount || 0, sub: 'Staged Drafts', icon: Zap, color: '#7C3AED', bg: '#F5F3FF' },
    { label: 'Interviews Landed', value: summary.interviewCount || 0, sub: `${summary.interviewConversion || 0}% Conversion`, icon: PhoneCall, color: '#F59E0B', bg: '#FFFBEB' },
    { label: 'Offers Received', value: summary.offerCount || 0, sub: 'Final Stage', icon: Award, color: '#10B981', bg: '#ECFDF5' },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 page-fade">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0F172A] flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[8px] bg-[#EEF2FF] border border-[#C7D2FE] flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-[#4F46E5]" />
            </div>
            Career Analytics & Metrics
          </h1>
          <p className="text-[13px] text-[#64748B] mt-0.5">
            Real-time pipeline analytics, recruiter response rates, and conversion funnels.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-[8px] border border-[#E2E8F0] text-[11px] text-[#475569] shadow-2xs font-mono">
          <Activity className="w-3.5 h-3.5 text-[#10B981]" />
          <span>{summary.totalJobs || 0} Jobs Analyzed</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <Card key={m.label} className="ag-card p-3.5 space-y-2">
              <div className="flex items-center justify-between text-[#64748B] text-[11px]">
                <span className="font-semibold">{m.label}</span>
                <div className="w-6 h-6 rounded-[6px] flex items-center justify-center" style={{ backgroundColor: m.bg }}>
                  <Icon className="w-3.5 h-3.5" style={{ color: m.color }} />
                </div>
              </div>
              <div className="text-xl font-bold text-[#0F172A] font-mono">{m.value}</div>
              <div className="text-[10px] text-[#94A3B8] font-mono">{m.sub}</div>
            </Card>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Application & Interview Trend */}
        <Card className="ag-card p-5 space-y-4">
          <h3 className="font-bold text-xs text-[#0F172A] uppercase tracking-wider flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#4F46E5]" />
            Monthly Pipeline Progression
          </h3>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorInterviews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="month" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#E2E8F0',
                    borderRadius: '8px',
                    color: '#0F172A',
                    fontSize: '11px',
                  }}
                />
                <Area type="monotone" dataKey="applications" stroke="#4F46E5" fillOpacity={1} fill="url(#colorApps)" name="Applications" />
                <Area type="monotone" dataKey="interviews" stroke="#10B981" fillOpacity={1} fill="url(#colorInterviews)" name="Interviews" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Application Outcome Breakdown */}
        <Card className="ag-card p-5 space-y-4">
          <h3 className="font-bold text-xs text-[#0F172A] uppercase tracking-wider flex items-center gap-2">
            <PieIcon className="w-4 h-4 text-[#0891B2]" />
            Application Outcome Funnel
          </h3>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={outcomeBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="count"
                  nameKey="name"
                >
                  {outcomeBreakdown.map((item, index) => (
                    <Cell key={`cell-${index}`} fill={item.color || COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#E2E8F0',
                    borderRadius: '8px',
                    color: '#0F172A',
                    fontSize: '11px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            <div className="space-y-1.5 pl-2 text-xs font-medium min-w-[140px]">
              {outcomeBreakdown.map((item) => (
                <div key={item.name} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="text-[#0F172A] truncate text-[11px]">{item.name}</span>
                  </div>
                  <span className="font-mono text-[#475569] text-[11px] font-bold">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Top Skills Demand */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="ag-card p-5 space-y-4">
          <h3 className="font-bold text-xs text-[#0F172A] uppercase tracking-wider flex items-center gap-2">
            <Code className="w-4 h-4 text-[#7C3AED]" />
            Tech Stack Demand in Pipeline
          </h3>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topSkills.slice(0, 8)} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="skill" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#E2E8F0',
                    borderRadius: '8px',
                    color: '#0F172A',
                    fontSize: '11px',
                  }}
                />
                <Bar dataKey="count" fill="#4F46E5" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Source Performance */}
        <Card className="ag-card p-5 space-y-4">
          <h3 className="font-bold text-xs text-[#0F172A] uppercase tracking-wider flex items-center gap-2">
            <Target className="w-4 h-4 text-[#10B981]" />
            Job Board Channel Yield
          </h3>

          <div className="space-y-2 text-xs">
            {sourcePerformance.map((src) => (
              <div key={src.source} className="p-2.5 rounded-[8px] bg-[#F8FAFC] border border-[#E2E8F0] flex justify-between items-center">
                <div>
                  <span className="font-bold text-[#0F172A] text-[12px]">{src.source}</span>
                  <span className="text-[11px] text-[#64748B] block">{src.qualified} qualified of {src.total} scraped</span>
                </div>
                <span className="ag-badge-green font-mono text-[11px]">{src.passRate}% Yield</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
