'use client';
import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, RefreshCw, ExternalLink, Linkedin, Search } from 'lucide-react';

export default function FundingPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLeads = () => {
    setLoading(true);
    fetch('/api/funding-leads')
      .then((res) => res.json())
      .then((data) => {
        setLeads(data.leads || []);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 page-fade">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#FAFAFA] flex items-center gap-2.5">
            <TrendingUp className="w-6 h-6 text-[#6366f1]" />
            <span>Startup Funding Leads</span>
          </h1>
          <p className="text-sm text-[#A1A1AA] mt-0.5">
            Track freshly funded startups to pitch directly to engineering founders before job postings go live.
          </p>
        </div>

        <Button
          onClick={fetchLeads}
          variant="outline"
          className="h-8 px-3 text-xs bg-[#18181B] border-[rgba(255,255,255,0.08)] hover:border-[#6366f1]/40 text-[#FAFAFA]"
        >
          <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
          Sync Leads
        </Button>
      </div>

      {/* Funding Leads Table */}
      <Card className="ag-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-[#A1A1AA]">
            <thead className="text-[11px] text-[#71717A] uppercase tracking-wider bg-[#111827] border-b border-[rgba(255,255,255,0.08)]">
              <tr>
                <th className="px-4 py-3 font-medium">Company</th>
                <th className="px-4 py-3 font-medium">Funding & Stage</th>
                <th className="px-4 py-3 font-medium">Hiring Signals</th>
                <th className="px-4 py-3 font-medium">Hiring Probability</th>
                <th className="px-4 py-3 font-medium text-right">Outreach Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(255,255,255,0.08)]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-[#71717A] text-xs">
                    Fetching latest funding news...
                  </td>
                </tr>
              ) : leads.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-[#71717A] text-xs">
                    No funding leads currently recorded. Click Sync Leads to scan feeds.
                  </td>
                </tr>
              ) : (
                leads.map((lead) => {
                  let signals: string[] = [];
                  try {
                    if (lead.hiringSignals) signals = JSON.parse(lead.hiringSignals);
                  } catch {
                    // ignore
                  }

                  return (
                    <tr key={lead.id} className="hover:bg-[#22222A] transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-[#FAFAFA] text-xs">
                          {lead.company}
                        </div>
                        <div className="text-[11px] text-[#71717A] max-w-xs truncate mt-0.5">
                          {lead.problemSolved}
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-[#34d399] font-mono">
                          {lead.fundingAmount}
                        </div>
                        <div className="text-[11px] text-[#71717A]">
                          {lead.stage || 'Seed / Series A'}
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1 flex-wrap">
                          {signals.length > 0 ? (
                            signals.map((sig, idx) => (
                              <span key={idx} className="ag-badge">
                                🔍 {sig}
                              </span>
                            ))
                          ) : (
                            <span className="text-[11px] text-[#71717A]">Funding Growth Signal</span>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <span className="ag-badge-accent">
                          {lead.hiringProbability || 75}% Hiring Prob
                        </span>
                      </td>

                      <td className="px-4 py-3.5 text-right space-x-2">
                        {lead.linkedinPeopleSearch && (
                          <a href={lead.linkedinPeopleSearch} target="_blank" rel="noreferrer">
                            <Button size="sm" variant="ghost" className="h-7 text-[11px] text-[#6366f1] hover:bg-[#6366f1]/10 px-2">
                              <Linkedin className="w-3 h-3 mr-1" /> Founder
                            </Button>
                          </a>
                        )}
                        {lead.newsLink && (
                          <a href={lead.newsLink} target="_blank" rel="noreferrer">
                            <Button size="sm" variant="ghost" className="h-7 text-[11px] text-[#71717A] hover:text-[#FAFAFA] px-2">
                              <ExternalLink className="w-3 h-3" /> Source
                            </Button>
                          </a>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
