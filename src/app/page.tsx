'use client';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Briefcase, Clock, FileCheck, Mail, AlertCircle } from 'lucide-react';
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
    return <div className="p-8 flex items-center justify-center min-h-screen text-neutral-400">Loading dashboard...</div>;
  }

  if (data?.error) {
    return <div className="p-8 text-red-400 flex items-center gap-2"><AlertCircle /> {data.error}</div>;
  }

  const { summary, charts, recentJobs, lastRuns } = data;
  const PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Dashboard</h1>
          <p className="text-neutral-400">Overview of your job application pipeline.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-neutral-900 to-neutral-800 border-neutral-700/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-neutral-400">Jobs Found Today</CardTitle>
            <Briefcase className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{summary.jobsToday}</div>
            <p className="text-xs text-neutral-500 mt-1">Total jobs in DB: {summary.totalJobs}</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-neutral-900 to-neutral-800 border-neutral-700/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-neutral-400">Pending Applications</CardTitle>
            <Clock className="h-4 w-4 text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{summary.pendingApplications}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-neutral-900 to-neutral-800 border-neutral-700/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-neutral-400">Avg ATS Score</CardTitle>
            <FileCheck className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{summary.avgAtsScore}/100</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-neutral-900 to-neutral-800 border-neutral-700/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-neutral-400">Drafts Pending Review</CardTitle>
            <Mail className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{summary.coldEmailsPending}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-neutral-800 bg-neutral-900/50">
          <CardHeader>
            <CardTitle className="text-lg">Jobs by Source</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.jobsBySource} layout="vertical" margin={{ left: 20 }}>
                <XAxis type="number" stroke="#525252" fontSize={12} />
                <YAxis dataKey="name" type="category" stroke="#a3a3a3" fontSize={11} width={100} />
                <Tooltip cursor={{ fill: '#262626' }} contentStyle={{ backgroundColor: '#171717', border: 'none', borderRadius: '8px' }} />
                <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-neutral-800 bg-neutral-900/50">
          <CardHeader>
            <CardTitle className="text-lg">Application Status</CardTitle>
          </CardHeader>
          <CardContent className="h-72 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts.statusBreakdown.filter((d: any) => d.count > 0)}
                  cx="50%" cy="50%"
                  innerRadius={60} outerRadius={90}
                  paddingAngle={5}
                  dataKey="count"
                >
                  {charts.statusBreakdown.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#171717', border: 'none', borderRadius: '8px' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-2 ml-4">
              {charts.statusBreakdown.map((status: any, idx: number) => (
                <div key={status.name} className="flex items-center gap-2 text-sm text-neutral-300">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}></div>
                  <span>{status.name} ({status.count})</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-neutral-800 bg-neutral-900/50 md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Recent Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentJobs.length === 0 ? (
                <p className="text-neutral-500 text-sm">No jobs found yet.</p>
              ) : (
                recentJobs.map((job: any) => (
                  <div key={job.id} className="flex items-center justify-between p-4 rounded-lg bg-neutral-800/50 border border-neutral-800">
                    <div>
                      <h4 className="font-medium text-blue-400">{job.jobTitle}</h4>
                      <p className="text-sm text-neutral-400">{job.company} &bull; {job.locationType}</p>
                    </div>
                    <div className="text-right">
                      <div className={`text-xs px-2 py-1 rounded-full inline-block mb-1 ${
                        job.applicationStatus === 'Pending' ? 'bg-orange-500/10 text-orange-400' :
                        job.applicationStatus === 'Applied' ? 'bg-blue-500/10 text-blue-400' :
                        'bg-neutral-500/10 text-neutral-400'
                      }`}>
                        {job.applicationStatus}
                      </div>
                      <div className="text-xs text-neutral-500">{job.source}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-neutral-800 bg-neutral-900/50">
          <CardHeader>
            <CardTitle className="text-lg">Pipeline Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm">
              <div className="flex justify-between items-center border-b border-neutral-800 pb-2">
                <span className="text-neutral-400">Job Scraper</span>
                <span className="text-neutral-200">{new Date(lastRuns.last_scrape_run || 0).toLocaleDateString() || 'Never'}</span>
              </div>
              <div className="flex justify-between items-center border-b border-neutral-800 pb-2">
                <span className="text-neutral-400">Funding News</span>
                <span className="text-neutral-200">{new Date(lastRuns.last_funding_run || 0).toLocaleDateString() || 'Never'}</span>
              </div>
              <div className="flex justify-between items-center border-b border-neutral-800 pb-2">
                <span className="text-neutral-400">Follow-up Check</span>
                <span className="text-neutral-200">{new Date(lastRuns.last_followup_run || 0).toLocaleDateString() || 'Never'}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
