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
  Zap,
  Globe,
  ExternalLink,
  Users,
  Linkedin,
  RefreshCw,
  Clock,
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
      const res = await fetch('/api/jobs');
      const data = await res.json();
      const jobsList = Array.isArray(data) ? data : data.jobs || [];
      if (Array.isArray(jobsList)) {
        setJobs(jobsList);
      }
    } catch (err) {
      console.error('Failed fetching job intel:', err);
    } finally {
      setLoading(false);
    }
  };

  const reRunDiscovery = async (jobId: number) => {
    setResearchingJobId(jobId);
    try {
      await fetch('/api/outreach/discover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId }),
      });
      await fetch('/api/outreach/intel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId }),
      });
      await fetchIntel();
    } catch (err) {
      console.error('Failed re-running discovery:', err);
    } finally {
      setResearchingJobId(null);
    }
  };

  // Stats computation
  const totalResearched = jobs.filter(j => j.contactSource || j.companyIntel).length;
  const highConfidence = jobs.filter(j => j.contactConfidence === 'high').length;
  const apolloCount = jobs.filter(j => j.contactSource === 'apollo').length;
  const dorkingCount = jobs.filter(j => j.contactSource === 'serper-dorking').length;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 page-fade relative">
      {/* Background Glow */}
      <div className="absolute top-10 right-1/4 w-80 h-80 bg-[#38bdf8]/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4 relative z-10">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#FAFAFA] flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#38bdf8]/10 flex items-center justify-center">
              <Brain className="w-4 h-4 text-[#38bdf8]" />
            </div>
            <span>Intelligence Control Center</span>
          </h1>
          <p className="text-sm text-[#A1A1AA] mt-0.5">
            Autonomous decision-maker discovery, company intelligence & psychological profiling engine.
          </p>
        </div>
      </div>

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative z-10">
        <Card className="ag-card p-4 space-y-1">
          <span className="text-[#71717A] text-[11px] font-mono uppercase">Researched Companies</span>
          <p className="text-2xl font-bold text-[#FAFAFA] font-mono">{totalResearched} / {jobs.length}</p>
          <span className="text-[11px] text-[#34d399] font-mono">100% Autonomous</span>
        </Card>
        <Card className="ag-card p-4 space-y-1">
          <span className="text-[#71717A] text-[11px] font-mono uppercase">High Confidence Contacts</span>
          <p className="text-2xl font-bold text-[#34d399] font-mono">{highConfidence}</p>
          <span className="text-[11px] text-[#A1A1AA] font-mono">Verified email / LinkedIn</span>
        </Card>
        <Card className="ag-card p-4 space-y-1">
          <span className="text-[#71717A] text-[11px] font-mono uppercase">Apollo API Discovered</span>
          <p className="text-2xl font-bold text-[#818cf8] font-mono">{apolloCount}</p>
          <span className="text-[11px] text-[#818cf8] font-mono">Direct API lookup</span>
        </Card>
        <Card className="ag-card p-4 space-y-1">
          <span className="text-[#71717A] text-[11px] font-mono uppercase">Google Dork Discovered</span>
          <p className="text-2xl font-bold text-[#38bdf8] font-mono">{dorkingCount}</p>
          <span className="text-[11px] text-[#38bdf8] font-mono">Serper organic search</span>
        </Card>
      </div>

      {/* Intelligence Cards Grid */}
      <div className="space-y-4 relative z-10">
        <h2 className="text-lg font-semibold text-[#FAFAFA] flex items-center gap-2">
          <Building className="w-4 h-4 text-[#818cf8]" />
          <span>Researched Companies & Contacts</span>
        </h2>

        {loading ? (
          <div className="p-8 text-center text-[#A1A1AA] text-xs font-mono">Loading intelligence repository...</div>
        ) : jobs.length === 0 ? (
          <div className="p-8 text-center text-[#A1A1AA] text-xs font-mono">No target companies in pipeline yet. Trigger a scrape to populate.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {jobs.map((job) => {
              const intel = job.companyIntel ? JSON.parse(job.companyIntel) : null;
              const psych = job.psychProfile ? JSON.parse(job.psychProfile) : null;
              const isResearching = researchingJobId === job.id;

              return (
                <Card key={job.id} className="ag-card p-5 space-y-4 relative">
                  {/* Company Header */}
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-base text-[#FAFAFA] flex items-center gap-2">
                        <span>{job.company}</span>
                        {job.companyStage && (
                          <Badge className="bg-[#6366f1]/10 text-[#818cf8] text-[10px] font-mono border-none capitalize">
                            {job.companyStage}
                          </Badge>
                        )}
                      </h3>
                      <p className="text-xs text-[#A1A1AA] mt-0.5">{job.jobTitle}</p>
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => reRunDiscovery(job.id)}
                      disabled={isResearching}
                      className="h-7 text-xs bg-[#141419] border-[rgba(255,255,255,0.08)] text-[#A1A1AA] hover:text-[#FAFAFA] gap-1"
                    >
                      <RefreshCw className={`w-3 h-3 ${isResearching ? 'animate-spin' : ''}`} />
                      <span>{isResearching ? 'Researching...' : 'Refresh Intel'}</span>
                    </Button>
                  </div>

                  {/* Decision Maker Info */}
                  <div className="bg-[#09090B] p-3 rounded-lg border border-[rgba(255,255,255,0.08)] space-y-1.5 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-[#71717A] font-mono text-[11px] uppercase flex items-center gap-1">
                        <UserCheck className="w-3 h-3 text-[#34d399]" /> Decision Maker
                      </span>
                      {job.contactConfidence && (
                        <Badge className="bg-[#34d399]/10 text-[#34d399] text-[9px] font-mono border-none uppercase">
                          {job.contactConfidence}
                        </Badge>
                      )}
                    </div>
                    <p className="font-semibold text-[#FAFAFA]">
                      {job.hrName || 'Hiring Manager / Team'}
                    </p>
                    <p className="text-[#A1A1AA] text-[11px]">
                      {job.hrTitle || 'HR / Recruiting'} • {job.hrEmail || 'No direct email found'}
                    </p>
                    {job.contactSource && (
                      <span className="text-[10px] text-[#71717A] font-mono block">
                        Discovered via: {job.contactSource}
                      </span>
                    )}
                  </div>

                  {/* Company Intel Details */}
                  {intel && (
                    <div className="space-y-2 text-xs">
                      {intel.description && (
                        <p className="text-[#A1A1AA] text-[11px] line-clamp-2 italic">
                          "{intel.description}"
                        </p>
                      )}
                      <div className="flex flex-wrap gap-1">
                        {intel.culture?.map((c: string, idx: number) => (
                          <Badge key={idx} className="bg-[#38bdf8]/10 text-[#38bdf8] text-[9px] font-mono border-none">
                            {c}
                          </Badge>
                        ))}
                        {intel.techStack?.slice(0, 4).map((t: string, idx: number) => (
                          <Badge key={idx} className="bg-[#6366f1]/10 text-[#818cf8] text-[9px] font-mono border-none">
                            {t}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Psychology Principle */}
                  {psych && (
                    <div className="pt-2 border-t border-[rgba(255,255,255,0.08)] flex justify-between items-center text-xs">
                      <span className="text-[#71717A] text-[11px] font-mono">Influence Lever:</span>
                      <span className="text-[#c084fc] font-medium font-mono text-[11px]">{psych.influencePrinciple}</span>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
