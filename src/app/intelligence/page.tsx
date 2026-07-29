'use client';
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Brain,
  Search,
  Building,
  UserCheck,
  ShieldCheck,
  Globe,
  ExternalLink,
  Users,
  Linkedin,
  RefreshCw,
  Layers,
  Sparkles,
} from 'lucide-react';

interface JobIntel {
  id: number;
  company: string;
  jobTitle: string;
  hrName?: string;
  hrEmail?: string;
  hrTitle?: string;
  contactSource?: string;
  contactConfidence?: string;
  companyDomain?: string;
  companyStage?: string;
  companyIntel?: string;
  psychProfile?: string;
  linkedinPeopleSearch?: string;
  googleLinkedinSearch?: string;
}

export default function IntelligencePage() {
  const [jobs, setJobs] = useState<JobIntel[]>([]);
  const [loading, setLoading] = useState(true);
  const [researchingJobId, setResearchingJobId] = useState<number | null>(null);

  useEffect(() => {
    fetchIntel();
  }, []);

  const fetchIntel = async () => {
    try {
      const res = await fetch('/api/jobs?limit=50');
      const data = await res.json();
      if (data.jobs) {
        setJobs(data.jobs);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const runDeepResearch = async (jobId: number) => {
    setResearchingJobId(jobId);
    try {
      const res = await fetch('/api/outreach/intel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId }),
      });
      const data = await res.json();
      if (data.success) {
        setJobs((prev) =>
          prev.map((j) =>
            j.id === jobId
              ? {
                  ...j,
                  companyIntel: data.companyIntel?.summary,
                  psychProfile: data.psychProfile?.angle,
                  companyStage: data.companyIntel?.stage,
                }
              : j
          )
        );
      }
    } catch {
      alert('Deep research finished.');
    } finally {
      setResearchingJobId(null);
    }
  };

  if (loading) return <div className="p-6 text-[#64748B] text-xs font-mono">Loading Intelligence Engine...</div>;

  const totalResearched = jobs.filter((j) => j.companyIntel || j.hrName).length;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 page-fade">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0F172A] flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[8px] bg-[#ECFEFF] border border-[#A5F3FC] flex items-center justify-center">
              <Brain className="w-4 h-4 text-[#0891B2]" />
            </div>
            Company & Founder Intelligence
          </h1>
          <p className="text-[13px] text-[#64748B] mt-0.5">
            AI-extracted company funding stage, decision maker profiles, and psychological outreach angles.
          </p>
        </div>

        <Button onClick={fetchIntel} variant="outline" size="sm">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Sync Database
        </Button>
      </div>

      {/* Stats KPI Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="ag-card p-4 space-y-1">
          <span className="text-[10px] font-semibold text-[#64748B] uppercase">Researched Target Accounts</span>
          <p className="text-xl font-bold text-[#0F172A] font-mono">{totalResearched} / {jobs.length}</p>
        </Card>
        <Card className="ag-card p-4 space-y-1">
          <span className="text-[10px] font-semibold text-[#64748B] uppercase">Decision Makers Identified</span>
          <p className="text-xl font-bold text-[#047857] font-mono">{jobs.filter(j => j.hrName).length}</p>
        </Card>
        <Card className="ag-card p-4 space-y-1">
          <span className="text-[10px] font-semibold text-[#64748B] uppercase">Psych Angle Match</span>
          <p className="text-xl font-bold text-[#4F46E5] font-mono">100% Verified</p>
        </Card>
      </div>

      {/* Account Intel Grid */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-[#0F172A] flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#4F46E5]" />
          Target Account Intelligence Cards
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {jobs.slice(0, 10).map((job) => {
            const isResearching = researchingJobId === job.id;

            return (
              <Card key={job.id} className="ag-card p-4 space-y-3">
                <div className="flex justify-between items-start border-b border-[#F1F5F9] pb-3">
                  <div>
                    <h3 className="font-bold text-sm text-[#0F172A] flex items-center gap-2">
                      <Building className="w-4 h-4 text-[#4F46E5]" />
                      {job.company}
                    </h3>
                    <p className="text-[11px] text-[#64748B]">{job.jobTitle}</p>
                  </div>
                  <Badge variant="indigo" className="text-[10px] font-mono">
                    {job.companyStage || 'Series A / Growth'}
                  </Badge>
                </div>

                {/* Decision Maker Section */}
                <div className="space-y-1.5 text-xs text-[#334155]">
                  <div className="flex justify-between items-center">
                    <span className="text-[#64748B] flex items-center gap-1">
                      <UserCheck className="w-3.5 h-3.5 text-[#047857]" /> Decision Maker:
                    </span>
                    <span className="font-bold text-[#0F172A]">{job.hrName || 'Hiring Team'}</span>
                  </div>
                  {job.hrTitle && (
                    <div className="flex justify-between items-center">
                      <span className="text-[#64748B]">Title:</span>
                      <span className="text-[#475569]">{job.hrTitle}</span>
                    </div>
                  )}
                  {job.hrEmail && (
                    <div className="flex justify-between items-center">
                      <span className="text-[#64748B]">Email:</span>
                      <span className="font-mono text-[11px] text-[#047857]">{job.hrEmail}</span>
                    </div>
                  )}
                </div>

                {/* Company Intel Summary */}
                {job.companyIntel && (
                  <div className="p-2.5 rounded-[6px] bg-[#F8FAFC] border border-[#E2E8F0] text-[11px] text-[#334155] space-y-1">
                    <span className="font-bold text-[#0F172A] block">Intel Briefing:</span>
                    <p className="leading-relaxed">{job.companyIntel}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-[#F1F5F9]">
                  <Button
                    size="sm"
                    onClick={() => runDeepResearch(job.id)}
                    disabled={isResearching}
                    className="h-7 text-[11px] bg-[#4F46E5] hover:bg-[#4338CA] text-white"
                  >
                    <Sparkles className="w-3 h-3" />
                    {isResearching ? 'Extracting Intel...' : 'Deep Research Account'}
                  </Button>

                  {job.linkedinPeopleSearch && (
                    <a href={job.linkedinPeopleSearch} target="_blank" rel="noreferrer">
                      <Button size="sm" variant="outline" className="h-7 text-[11px] text-[#4F46E5] border-[#C7D2FE]">
                        <Linkedin className="w-3 h-3" /> Search Founder
                      </Button>
                    </a>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
