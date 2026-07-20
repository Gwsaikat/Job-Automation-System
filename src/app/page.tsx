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
      <div className="p-12 flex flex-col items-center justify-center min-h-screen text-indigo-400 text-sm font-medium gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin"></div>
        <span>Syncing Cosmic Workspace...</span>
      </div>
    );
  }

  if (data?.error) {
    return (
      <div className="p-12 text-red-400 flex items-center gap-2 text-sm">
        ⚠️ Workspace Error: {data.error}
      </div>
    );
  }

  const { summary, charts, recentJobs, lastRuns } = data;
  const PIE_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="p-12 max-w-6xl mx-auto space-y-8 select-none relative animate-in fade-in duration-500">
      {/* Background Aura Glows */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-600/5 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 left-1/4 w-[500px] h-[500px] bg-indigo-600/5 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Breadcrumbs */}
      <div className="text-[11px] text-neutral-500 flex items-center gap-1.5 font-mono uppercase tracking-wider relative z-10">
        <span>Cosmic Hub</span>
        <span>/</span>
        <span className="text-indigo-400 font-medium">📊 Overview</span>
      </div>

      {/* Header */}
      <div className="space-y-2 relative z-10">
        <h1 className="text-4xl font-extrabold tracking-tight text-neutral-100 flex items-center gap-3">
          <span className="animate-bounce">📊</span> 
          <span className="gradient-text-cosmic">Workspace Dashboard</span>
        </h1>
        <p className="text-neutral-400 text-[14.5px] leading-relaxed max-w-2xl font-light">
          Real-time tracking of job scraping, custom CV generation, and AI outreach execution.
        </p>
      </div>

      {/* Glassmorphism Alert Callout Banner */}
      <div className="glass-panel p-5 rounded-2xl flex items-start gap-4 border-l-4 border-l-indigo-500 bg-indigo-950/10 relative z-10">
        <span className="text-xl">✨</span>
        <div className="text-neutral-300 text-xs leading-relaxed">
          <strong className="text-neutral-100 font-semibold">Automated Pipeline Operational:</strong> Scrapers are scheduled globally. Run manual syncs on demand in <strong className="text-indigo-400 font-medium">Settings</strong>, or connect your Gmail account to dispatch crafted emails.
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4 relative z-10">
        <Card className="glass-panel bg-[#0d0d12]/60 rounded-2xl shadow-lg border-white/5 flex flex-col justify-between group overflow-hidden relative">
          <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-all"></div>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest">Jobs Found Today</CardTitle>
            <span className="text-lg">💼</span>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-white tracking-tight group-hover:scale-105 transition-transform duration-300 origin-left">{summary.jobsToday}</div>
            <p className="text-[10px] text-neutral-500 mt-2 font-mono">Total DB entries: {summary.totalJobs}</p>
          </CardContent>
        </Card>
        
        <Card className="glass-panel bg-[#0d0d12]/60 rounded-2xl shadow-lg border-white/5 flex flex-col justify-between group overflow-hidden relative">
          <div className="absolute top-0 right-0 w-20 h-20 bg-orange-500/5 rounded-full blur-2xl group-hover:bg-orange-500/10 transition-all"></div>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest">Pending Sync</CardTitle>
            <span className="text-lg">⏳</span>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-white tracking-tight group-hover:scale-105 transition-transform duration-300 origin-left">{summary.pendingApplications}</div>
            <p className="text-[10px] text-neutral-500 mt-2 font-mono">Awaiting AI tailoring</p>
          </CardContent>
        </Card>
        
        <Card className="glass-panel bg-[#0d0d12]/60 rounded-2xl shadow-lg border-white/5 flex flex-col justify-between group overflow-hidden relative">
          <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/5 rounded-full blur-2xl group-hover:bg-green-500/10 transition-all"></div>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest">Average ATS Score</CardTitle>
            <span className="text-lg">📈</span>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-green-400 tracking-tight group-hover:scale-105 transition-transform duration-300 origin-left">
              {summary.avgAtsScore ? `${summary.avgAtsScore}` : 'N/A'}<span className="text-sm font-normal text-neutral-500">/100</span>
            </div>
            <p className="text-[10px] text-neutral-500 mt-2 font-mono">Matched to targeted keywords</p>
          </CardContent>
        </Card>

        <Card className="glass-panel bg-[#0d0d12]/60 rounded-2xl shadow-lg border-white/5 flex flex-col justify-between group overflow-hidden relative">
          <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/5 rounded-full blur-2xl group-hover:bg-purple-500/10 transition-all"></div>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest">Outreach Drafts</CardTitle>
            <span className="text-lg">✉️</span>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-purple-400 tracking-tight group-hover:scale-105 transition-transform duration-300 origin-left">{summary.coldEmailsPending}</div>
            <p className="text-[10px] text-neutral-500 mt-2 font-mono">Ready in Gmail drafts</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid gap-5 md:grid-cols-2 relative z-10">
        <Card className="glass-panel bg-[#0d0d12]/65 border-white/5 rounded-2xl shadow-xl p-3">
          <CardHeader className="pb-1">
            <CardTitle className="text-sm font-bold text-neutral-200 flex items-center gap-2">
              <span className="text-indigo-400">📊</span> Jobs by Platform Source
            </CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.jobsBySource} layout="vertical" margin={{ left: 10, right: 10, top: 10 }}>
                <XAxis type="number" stroke="#2a2a35" fontSize={10} className="font-mono" />
                <YAxis dataKey="name" type="category" stroke="#8a8ab0" fontSize={11} width={80} />
                <Tooltip cursor={{ fill: 'rgba(99,102,241,0.04)' }} contentStyle={{ backgroundColor: '#0d0d12', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', color: '#fff', fontSize: '11px' }} />
                <Bar dataKey="count" fill="url(#indigo-gradient)" radius={[0, 4, 4, 0]} barSize={14}>
                  <defs>
                    <linearGradient id="indigo-gradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#4f46e5" />
                      <stop offset="100%" stopColor="#818cf8" />
                    </linearGradient>
                  </defs>
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="glass-panel bg-[#0d0d12]/65 border-white/5 rounded-2xl shadow-xl p-3">
          <CardHeader className="pb-1">
            <CardTitle className="text-sm font-bold text-neutral-200 flex items-center gap-2">
              <span className="text-green-400">🍩</span> Application Status Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="60%" height="100%">
              <PieChart>
                <Pie
                  data={charts.statusBreakdown.filter((d: any) => d.count > 0)}
                  cx="50%" cy="50%"
                  innerRadius={46} outerRadius={68}
                  paddingAngle={5}
                  dataKey="count"
                >
                  {charts.statusBreakdown.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0d0d12', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', color: '#fff', fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-2 ml-4 w-[40%] text-xs">
              {charts.statusBreakdown.map((status: any, idx: number) => (
                <div key={status.name} className="flex items-center gap-2 text-neutral-400 hover:text-neutral-200 transition-colors">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}></div>
                  <span className="truncate">{status.name} ({status.count})</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Grid */}
      <div className="grid gap-5 md:grid-cols-3 relative z-10">
        <Card className="glass-panel bg-[#0d0d12]/65 border-white/5 rounded-2xl shadow-xl md:col-span-2 p-3">
          <CardHeader>
            <CardTitle className="text-sm font-bold text-neutral-200 flex items-center gap-2">
              <span>⚡</span> Recent Job Ingestions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentJobs.length === 0 ? (
                <p className="text-neutral-500 text-xs italic">No jobs found yet.</p>
              ) : (
                recentJobs.map((job: any) => (
                  <div key={job.id} className="flex items-center justify-between p-3.5 rounded-xl bg-[#09090c]/50 border border-white/5 hover:border-indigo-500/20 hover:bg-[#0d0d12] transition-all duration-300">
                    <div className="space-y-0.5">
                      <h4 className="font-bold text-[12.5px] text-indigo-300 group-hover:text-indigo-200">{job.jobTitle}</h4>
                      <p className="text-[11px] text-neutral-400 font-light">{job.company} &bull; <span className="font-medium text-neutral-300">{job.locationType || 'Remote'}</span></p>
                    </div>
                    <div className="text-right">
                      <div className={`text-[9px] px-2 py-0.5 rounded-full font-mono uppercase tracking-wider ${
                        job.applicationStatus === 'Pending' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/10' :
                        job.applicationStatus === 'Applied' ? 'bg-green-500/10 text-green-400 border border-green-500/10' :
                        'bg-neutral-500/10 text-neutral-400 border border-neutral-800'
                      }`}>
                        {job.applicationStatus}
                      </div>
                      <div className="text-[10px] text-neutral-500 font-mono mt-1">{job.source}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="glass-panel bg-[#0d0d12]/65 border-white/5 rounded-2xl shadow-xl p-3">
          <CardHeader>
            <CardTitle className="text-sm font-bold text-neutral-200 flex items-center gap-2">
              <span>⏰</span> Pipeline Execution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3.5 text-xs font-light">
              <div className="flex justify-between items-center border-b border-white/5 pb-2.5">
                <span className="text-neutral-400">Job Scraper</span>
                <span className="text-neutral-200 font-mono bg-[#09090c] px-2 py-0.5 rounded border border-white/5">
                  {lastRuns.last_scrape_run ? new Date(lastRuns.last_scrape_run).toLocaleDateString() : 'Never'}
                </span>
              </div>
              <div className="flex justify-between items-center border-b border-white/5 pb-2.5">
                <span className="text-neutral-400">Funding News</span>
                <span className="text-neutral-200 font-mono bg-[#09090c] px-2 py-0.5 rounded border border-white/5">
                  {lastRuns.last_funding_run ? new Date(lastRuns.last_funding_run).toLocaleDateString() : 'Never'}
                </span>
              </div>
              <div className="flex justify-between items-center border-b border-white/5 pb-2.5">
                <span className="text-neutral-400">Follow-up Check</span>
                <span className="text-neutral-200 font-mono bg-[#09090c] px-2 py-0.5 rounded border border-white/5">
                  {lastRuns.last_followup_run ? new Date(lastRuns.last_followup_run).toLocaleDateString() : 'Never'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
