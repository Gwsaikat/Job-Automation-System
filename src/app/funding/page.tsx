'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, RefreshCw, ExternalLink, Sparkles, Building2 } from 'lucide-react';

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
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6 page-fade">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#0F172A] flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[8px] bg-[#ECFDF5] border border-[#A7F3D0] flex items-center justify-center shrink-0">
              <TrendingUp className="w-4 h-4 text-[#047857]" />
            </div>
            Startup Funding Radar
          </h1>
          <p className="text-xs sm:text-[13px] text-[#475569] mt-1 leading-relaxed">
            Track freshly funded high-growth tech startups to pitch directly to founders before job posts go public.
          </p>
        </div>
        <Button onClick={fetchLeads} variant="outline" size="sm" className="h-9 px-3 gap-2 text-xs font-semibold rounded-[8px] border-[#E2E8F0] hover:bg-[#F8FAFC]">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#4F46E5]' : 'text-[#64748B]'}`} />
          Sync Fresh Leads
        </Button>
      </div>

      {/* MOBILE CARD VIEW (visible < 768px) */}
      <div className="md:hidden space-y-3">
        {loading ? (
          <div className="p-8 text-center text-[#64748B] text-xs bg-white rounded-xl border border-[#E2E8F0]">
            <RefreshCw className="w-5 h-5 animate-spin mx-auto text-[#4F46E5] mb-2" />
            Scanning funding feeds...
          </div>
        ) : leads.length === 0 ? (
          <div className="p-8 text-center text-[#64748B] text-xs bg-white rounded-xl border border-[#E2E8F0]">
            No funding leads found. Click "Sync Fresh Leads".
          </div>
        ) : (
          leads.map((lead) => {
            let signals: string[] = [];
            try {
              if (lead.hiringSignals) signals = JSON.parse(lead.hiringSignals);
            } catch {
              /* ignore */
            }

            return (
              <Card key={lead.id} className="p-4 bg-white border border-[#E2E8F0] rounded-xl space-y-3 shadow-2xs">
                {/* Header: Company & Stage */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-md bg-[#F1F5F9] border border-[#CBD5E1] flex items-center justify-center font-bold text-xs text-[#0F172A] shrink-0">
                      {lead.company?.charAt(0) || 'C'}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-sm text-[#0F172A] truncate">{lead.company}</h3>
                      <p className="text-[11px] text-[#64748B] truncate">{lead.sector || 'AI & Software'}</p>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0] shrink-0">
                    {lead.hiringProbability || 75}% Match
                  </span>
                </div>

                {/* Amount & Stage */}
                <div className="flex items-center justify-between text-xs bg-[#F8FAFC] p-2.5 rounded-lg border border-[#E2E8F0]">
                  <div>
                    <span className="text-[10px] text-[#64748B] uppercase block font-semibold">Funding Round</span>
                    <span className="font-bold text-[#047857] font-mono text-sm">{lead.fundingAmount}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-[#64748B] uppercase block font-semibold">Stage</span>
                    <span className="font-semibold text-[#0F172A]">{lead.stage || 'Series A'}</span>
                  </div>
                </div>

                {/* Hiring Signals Stack */}
                {signals.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] font-semibold uppercase text-[#64748B] block">Hiring & Scale Signals:</span>
                    <div className="flex flex-col gap-1.5">
                      {signals.map((sig, idx) => (
                        <div key={idx} className="flex items-start gap-1.5 text-[11px] bg-[#EFF6FF] text-[#1D4ED8] p-2 rounded-md border border-[#BFDBFE] leading-snug">
                          <Sparkles className="w-3 h-3 text-[#2563EB] shrink-0 mt-0.5" />
                          <span>{sig}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                {lead.newsLink && (
                  <div className="pt-2 border-t border-[#F1F5F9] flex justify-end">
                    <a href={lead.newsLink} target="_blank" rel="noreferrer" className="w-full">
                      <Button size="sm" variant="outline" className="w-full h-8 text-xs font-semibold gap-1.5 rounded-lg border-[#E2E8F0] text-[#0F172A] hover:bg-[#F1F5F9]">
                        <ExternalLink className="w-3.5 h-3.5 text-[#64748B]" /> Read Source News
                      </Button>
                    </a>
                  </div>
                )}
              </Card>
            );
          })
        )}
      </div>

      {/* DESKTOP TABLE VIEW (visible >= 768px) */}
      <Card className="hidden md:block bg-white border border-[#E2E8F0] rounded-[12px] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[11px] font-bold uppercase tracking-wider text-[#475569]">
                <th className="py-3 px-4">Company & Domain</th>
                <th className="py-3 px-4">Funding & Stage</th>
                <th className="py-3 px-4">Hiring & Growth Signals</th>
                <th className="py-3 px-4">Match Probability</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] text-xs">
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center text-[#64748B] text-[13px] py-12">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto text-[#4F46E5] mb-2" />
                    Scanning funding feeds & recruiter signals...
                  </td>
                </tr>
              ) : leads.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center text-[#64748B] text-[13px] py-12">
                    No funding leads found. Click "Sync Fresh Leads" to pull recent startup rounds.
                  </td>
                </tr>
              ) : (
                leads.map((lead) => {
                  let signals: string[] = [];
                  try {
                    if (lead.hiringSignals) signals = JSON.parse(lead.hiringSignals);
                  } catch {
                    /* ignore */
                  }

                  return (
                    <tr key={lead.id} className="hover:bg-[#F8FAFC] transition-colors duration-150">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-[6px] bg-[#F1F5F9] border border-[#CBD5E1] flex items-center justify-center font-bold text-xs text-[#0F172A] shrink-0">
                            {lead.company?.charAt(0) || 'C'}
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-sm text-[#0F172A] truncate flex items-center gap-1.5">
                              {lead.company}
                              {lead.domain && (
                                <a
                                  href={`https://${lead.domain}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-[#94A3B8] hover:text-[#4F46E5] transition-colors"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              )}
                            </div>
                            <div className="text-[11px] text-[#64748B] font-medium truncate mt-0.5">
                              {lead.sector || lead.problemSolved || 'Software & AI Platform'}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-[#047857] font-mono text-[13px]">
                          {lead.fundingAmount}
                        </div>
                        <div className="text-[11px] text-[#64748B] font-medium mt-0.5">
                          {lead.stage || 'Series A'}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 flex-wrap max-w-md">
                          {signals.length > 0 ? (
                            signals.map((sig, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-[5px] bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE]"
                              >
                                <Sparkles className="w-2.5 h-2.5 text-[#2563EB] shrink-0" />
                                {sig}
                              </span>
                            ))
                          ) : (
                            <span className="text-[11px] text-[#64748B] font-mono">Series A Scale-up Hiring Signal</span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center font-mono font-bold text-xs px-2.5 py-1 rounded-[6px] bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0]">
                          {lead.hiringProbability || 75}% Match
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {lead.newsLink && (
                            <a href={lead.newsLink} target="_blank" rel="noreferrer">
                              <Button size="sm" variant="outline" className="h-7 text-[11px] font-semibold gap-1 px-2.5 rounded-[6px] border-[#E2E8F0] hover:bg-[#F1F5F9] text-[#0F172A]">
                                <ExternalLink className="w-3 h-3 text-[#64748B]" /> Source News
                              </Button>
                            </a>
                          )}
                        </div>
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
