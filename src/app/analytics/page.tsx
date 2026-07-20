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
} from 'recharts';
import { BarChart3, TrendingUp, Award, PhoneCall, CheckCircle2 } from 'lucide-react';

export default function AnalyticsPage() {
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

  const monthlyData = [
    { month: 'May', applications: 12, interviews: 1, offers: 0 },
    { month: 'Jun', applications: 24, interviews: 3, offers: 1 },
    { month: 'Jul', applications: 45, interviews: 6, offers: 2 },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 page-fade">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#FAFAFA] flex items-center gap-2.5">
            <BarChart3 className="w-6 h-6 text-[#6366f1]" />
            <span>Career Analytics</span>
          </h1>
          <p className="text-sm text-[#A1A1AA] mt-0.5">
            Metrics tracking response rates, interview conversion, and monthly pipeline growth.
          </p>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="ag-card p-5">
          <div className="text-xs text-[#71717A] mb-1">Total Applications</div>
          <div className="text-3xl font-bold text-[#FAFAFA]">45</div>
          <div className="text-[11px] text-[#34d399] mt-1 font-mono">+18 this month</div>
        </Card>

        <Card className="ag-card p-5">
          <div className="text-xs text-[#71717A] mb-1">Recruiter Response Rate</div>
          <div className="text-3xl font-bold text-[#818cf8]">24.4%</div>
          <div className="text-[11px] text-[#71717A] mt-1 font-mono">Industry Avg: ~8%</div>
        </Card>

        <Card className="ag-card p-5">
          <div className="text-xs text-[#71717A] mb-1">Interview Conversion</div>
          <div className="text-3xl font-bold text-[#34d399]">13.3%</div>
          <div className="text-[11px] text-[#34d399] mt-1 font-mono">6 Total Interviews</div>
        </Card>

        <Card className="ag-card p-5">
          <div className="text-xs text-[#71717A] mb-1">Offer Rate</div>
          <div className="text-3xl font-bold text-[#FAFAFA]">4.4%</div>
          <div className="text-[11px] text-[#71717A] mt-1 font-mono">2 Active Offers</div>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="ag-card p-5 space-y-3">
          <h3 className="font-semibold text-sm text-[#FAFAFA] flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#818cf8]" />
            <span>Monthly Application & Interview Progress</span>
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="month" stroke="#71717A" fontSize={11} />
                <YAxis stroke="#71717A" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: 'rgba(255,255,255,0.08)', borderRadius: '8px', color: '#FAFAFA', fontSize: '11px' }} />
                <Bar dataKey="applications" fill="#6366f1" radius={[4, 4, 0, 0]} name="Applications" />
                <Bar dataKey="interviews" fill="#34d399" radius={[4, 4, 0, 0]} name="Interviews" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="ag-card p-5 space-y-3">
          <h3 className="font-semibold text-sm text-[#FAFAFA] flex items-center gap-2">
            <Award className="w-4 h-4 text-[#818cf8]" />
            <span>Application Outcome Breakdown</span>
          </h3>
          <div className="h-64 flex items-center justify-center">
            <div className="space-y-3 w-full text-xs text-[#A1A1AA]">
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>Interviewing (6)</span>
                  <span className="font-mono text-[#34d399]">13.3%</span>
                </div>
                <div className="w-full bg-[#111827] h-2 rounded-full overflow-hidden">
                  <div className="bg-[#34d399] h-full w-[13.3%]" />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>Applied / In Review (28)</span>
                  <span className="font-mono text-[#6366f1]">62.2%</span>
                </div>
                <div className="w-full bg-[#111827] h-2 rounded-full overflow-hidden">
                  <div className="bg-[#6366f1] h-full w-[62.2%]" />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>Offers Received (2)</span>
                  <span className="font-mono text-[#818cf8]">4.4%</span>
                </div>
                <div className="w-full bg-[#111827] h-2 rounded-full overflow-hidden">
                  <div className="bg-[#818cf8] h-full w-[4.4%]" />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>Rejected / Archived (9)</span>
                  <span className="font-mono text-[#71717A]">20.1%</span>
                </div>
                <div className="w-full bg-[#111827] h-2 rounded-full overflow-hidden">
                  <div className="bg-[#71717A] h-full w-[20.1%]" />
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
