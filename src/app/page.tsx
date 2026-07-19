'use client';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard')
      .then(res => res.json())
      .then(data => {
        setData(data);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="p-12 flex items-center justify-center min-h-screen text-neutral-400 text-sm font-medium">
        ⏳ Loading Workspace Dashboard...
      </div>
    );
  }

  if (data?.error) {
    return (
      <div className="p-12 text-red-400 flex items-center gap-2 text-sm">
        ⚠️ Error: {data.error}
      </div>
    );
  }

  const { summary, charts, recentJobs, lastRuns } = data;
  const PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="p-12 max-w-5xl mx-auto space-y-8 select-none animate-in fade-in duration-300">
      
      {/* Notion Breadcrumbs */}
      <div className="text-xs text-neutral-500 flex items-center gap-1.5 font-normal">
        <span>Saikat's Workspace</span>
        <span>/</span>
        <span className="text-neutral-400 font-medium">📊 Dashboard</span>
      </div>

      {/* Notion Page Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-neutral-100 flex items-center gap-3">
          <span>📊</span> Dashboard
        </h1>
        <p className="text-neutral-400 text-[14px]">
          Overview of your automated job hunting and outreach pipeline.
        </p>
      </div>

      {/* Notion Callout Banner */}
      <div className="notion-callout bg-[#202020]/50">
        <span className="text-lg">💡</span>
        <div className="text-neutral-300 text-xs leading-relaxed">
          <strong>Pro-Tip:</strong> The background worker is running. Check your <strong>Settings</strong> page to manual-trigger a database scrape, or connect your Gmail account to start generating automated draft emails.
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-[#202020] border-[#2f2f2f] rounded shadow-none">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[12px] font-bold text-neutral-400 uppercase tracking-wider">Jobs Found Today</CardTitle>
            <span className="text-sm">💼</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-neutral-100">{summary.jobsToday}</div>
            <p className="text-[10px] text-neutral-500 mt-1">Total in database: {summary.totalJobs}</p>
          </CardContent>
        </Card>
        
        <Card className="bg-[#202020] border-[#2f2f2f] rounded shadow-none">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[12px] font-bold text-neutral-400 uppercase tracking-wider">Pending Applications</CardTitle>
            <span className="text-sm">⏳</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-neutral-100">{summary.pendingApplications}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-[#202020] border-[#2f2f2f] rounded shadow-none">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[12px] font-bold text-neutral-400 uppercase tracking-wider">Avg ATS Score</CardTitle>
            <span className="text-sm">📝</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-neutral-100">{summary.avgAtsScore || 'N/A'}/100</div>
          </CardContent>
        </Card>

        <Card className="bg-[#202020] border-[#2f2f2f] rounded shadow-none">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[12px] font-bold text-neutral-400 uppercase tracking-wider">Drafts Pending</CardTitle>
            <span className="text-sm">✉️</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-neutral-100">{summary.coldEmailsPending}</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-[#202020] border-[#2f2f2f] rounded shadow-none">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-neutral-200">Jobs by Source</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.jobsBySource} layout="vertical" margin={{ left: 10, right: 10 }}>
                <XAxis type="number" stroke="#4a4a4a" fontSize={11} />
                <YAxis dataKey="name" type="category" stroke="#8a8a8a" fontSize={11} width={80} />
                <Tooltip cursor={{ fill: '#252525' }} contentStyle={{ backgroundColor: '#202020', border: '1px solid #2f2f2f', borderRadius: '4px' }} />
                <Bar dataKey="count" fill="#2eaadc" radius={[0, 2, 2, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-[#202020] border-[#2f2f2f] rounded shadow-none">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-neutral-200">Application Status</CardTitle>
          </CardHeader>
          <CardContent className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="60%" height="100%">
              <PieChart>
                <Pie
                  data={charts.statusBreakdown.filter((d: any) => d.count > 0)}
                  cx="50%" cy="50%"
                  innerRadius={50} outerRadius={75}
                  paddingAngle={4}
                  dataKey="count"
                >
                  {charts.statusBreakdown.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#202020', border: '1px solid #2f2f2f', borderRadius: '4px' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-1.5 ml-4 w-[40%]">
              {charts.statusBreakdown.map((status: any, idx: number) => (
                <div key={status.name} className="flex items-center gap-2 text-xs text-neutral-400">
                  <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}></div>
                  <span>{status.name} ({status.count})</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom section: Recent jobs & pipeline runs */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-[#202020] border-[#2f2f2f] rounded shadow-none md:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-neutral-200">Recent Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentJobs.length === 0 ? (
                <p className="text-neutral-500 text-xs">No jobs found yet.</p>
              ) : (
                recentJobs.map((job: any) => (
                  <div key={job.id} className="flex items-center justify-between p-3 rounded bg-[#191919] border border-[#2f2f2f]/60 hover:bg-[#202020] transition-colors">
                    <div>
                      <h4 className="font-medium text-xs text-[#2eaadc]">{job.jobTitle}</h4>
                      <p className="text-[11px] text-neutral-400">{job.company} &bull; {job.locationType || 'Remote'}</p>
                    </div>
                    <div className="text-right">
                      <div className={`text-[10px] px-2 py-0.5 rounded inline-block font-medium mb-1 ${
                        job.applicationStatus === 'Pending' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' :
                        job.applicationStatus === 'Applied' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                        'bg-neutral-500/10 text-neutral-400 border border-neutral-800'
                      }`}>
                        {job.applicationStatus}
                      </div>
                      <div className="text-[10px] text-neutral-500">{job.source}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#202020] border-[#2f2f2f] rounded shadow-none">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-neutral-200">Pipeline Runs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center border-b border-[#2f2f2f] pb-2">
                <span className="text-neutral-400">Job Scraper</span>
                <span className="text-neutral-300 font-mono">{lastRuns.last_scrape_run ? new Date(lastRuns.last_scrape_run).toLocaleDateString() : 'Never'}</span>
              </div>
              <div className="flex justify-between items-center border-b border-[#2f2f2f] pb-2">
                <span className="text-neutral-400">Funding News</span>
                <span className="text-neutral-300 font-mono">{lastRuns.last_funding_run ? new Date(lastRuns.last_funding_run).toLocaleDateString() : 'Never'}</span>
              </div>
              <div className="flex justify-between items-center border-b border-[#2f2f2f] pb-2">
                <span className="text-neutral-400">Follow-up Check</span>
                <span className="text-neutral-300 font-mono">{lastRuns.last_followup_run ? new Date(lastRuns.last_followup_run).toLocaleDateString() : 'Never'}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
