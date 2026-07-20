'use client';
import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, Linkedin, Mail, ExternalLink, Globe, RefreshCw } from 'lucide-react';

export default function FundingLeadsPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLeads = () => {
    setLoading(true);
    fetch('/api/funding-leads')
      .then(res => res.json())
      .then(data => {
        setLeads(data.leads || []);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  return (
    <div className="p-12 max-w-6xl mx-auto space-y-8 select-none relative animate-in fade-in duration-500">
      
      {/* Background Aura Glows */}
      <div className="absolute top-0 right-1/4 w-80 h-80 bg-indigo-600/5 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Notion Breadcrumbs */}
      <div className="text-[11px] text-neutral-500 flex items-center gap-1.5 font-mono uppercase tracking-wider relative z-10">
        <span>Cosmic Hub</span>
        <span>/</span>
        <span className="text-indigo-400 font-medium">📈 Funding Leads</span>
      </div>

      {/* Page Header */}
      <div className="flex justify-between items-start flex-wrap gap-4 relative z-10">
        <div className="space-y-1">
          <h1 className="text-4xl font-extrabold tracking-tight text-neutral-100 flex items-center gap-3">
            <span>📈</span> <span className="gradient-text-cosmic">Funding Leads</span>
          </h1>
          <p className="text-neutral-400 text-[14.5px] font-light leading-relaxed max-w-xl">
            Track startups securing funding to pitch directly to engineering teams.
          </p>
        </div>
        <Button onClick={fetchLeads} variant="outline" className="h-9 px-4 text-xs bg-[#0d0d12]/60 border-white/5 hover:border-indigo-500/25 hover:bg-[#20202d]/20 text-neutral-300 font-medium rounded-xl gap-2 shadow-none transition-all duration-300">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Sync Leads
        </Button>
      </div>

      {/* Leads List */}
      <div className="space-y-4 relative z-10">
        {loading ? (
          <div className="text-indigo-400 text-center py-12 text-xs flex flex-col items-center justify-center gap-2">
            <div className="w-6 h-6 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin"></div>
            <span>Fetching funding data...</span>
          </div>
        ) : leads.length === 0 ? (
          <div className="text-neutral-500 text-center py-12 text-xs italic font-light">
            No funding records stored in the workspace registry.
          </div>
        ) : (
          leads.map(lead => {
            const emails = lead.emailsFound ? JSON.parse(lead.emailsFound) : [];
            
            return (
              <Card key={lead.id} className="glass-panel bg-[#0d0d12]/65 border-white/5 p-6 flex flex-col md:flex-row gap-6 rounded-2xl shadow-xl hover:-translate-y-0.5 transition-all duration-300">
                {/* Left col: Details */}
                <div className="flex-1 space-y-3.5">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
                        <h3 className="text-xl font-bold text-neutral-100">{lead.company}</h3>
                        {lead.isIndian === 1 && (
                          <span className="text-[9.5px] font-mono border border-orange-500/30 text-orange-400 bg-orange-500/10 px-2 py-0.2 rounded-full font-semibold uppercase">Indian</span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <Badge variant="outline" className="text-green-400 border-green-500/20 bg-green-500/10 text-[10.5px] py-0 px-2.5 font-mono font-semibold">
                          {lead.fundingAmount}
                        </Badge>
                        <Badge variant="secondary" className="bg-[#050508]/80 border border-white/5 text-neutral-400 text-[10px] py-0 px-2.5 font-normal rounded-full">
                          {lead.stage || 'Unknown Stage'}
                        </Badge>
                        <Badge variant="secondary" className="bg-[#050508]/80 border border-white/5 text-neutral-400 text-[10px] py-0 px-2.5 font-normal rounded-full">
                          {lead.sector || 'Unknown Sector'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-xs text-neutral-400 max-w-3xl leading-relaxed font-light">
                    {lead.problemSolved}
                  </p>
                  
                  <div className="flex gap-4 items-center pt-1.5 text-[10.5px] text-neutral-500 font-mono">
                    <span>Recorded: {new Date(lead.dateFound).toLocaleDateString()}</span>
                    {lead.newsLink && (
                      <a href={lead.newsLink} target="_blank" rel="noreferrer" className="text-indigo-400 hover:text-indigo-300 hover:underline flex items-center gap-1">
                        <ExternalLink className="w-3.5 h-3.5" /> Source Link
                      </a>
                    )}
                  </div>
                </div>

                {/* Right col: Actions / Emails */}
                <div className="md:w-64 md:border-l border-white/5 md:pl-6 space-y-4 flex flex-col justify-between">
                  <div>
                    <h4 className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-2.5 font-mono">Found Contacts</h4>
                    
                    {emails.length > 0 ? (
                      <div className="space-y-1.5">
                        {emails.map((email: string, i: number) => (
                          <div key={i} className="flex items-center gap-2 text-xs bg-[#050508]/90 px-2.5 py-1.5 rounded-xl border border-white/5 font-mono select-all text-neutral-300">
                            <Mail className="w-3.5 h-3.5 text-neutral-500" />
                            <span className="truncate">{email}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-[10.5px] text-neutral-500 font-light italic">No direct email found. Use searches below:</div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 pt-2.5">
                    {lead.linkedinPeopleSearch && (
                      <a href={lead.linkedinPeopleSearch} target="_blank" rel="noreferrer">
                        <Button variant="outline" size="sm" className="w-full h-8 justify-start gap-2 text-[10px] bg-[#050508] border-white/5 hover:border-indigo-500/20 hover:bg-[#12121b] text-neutral-400 shadow-none font-normal rounded-xl transition-all">
                          <Search className="w-3.5 h-3.5 text-blue-400" /> Seek Recruiter
                        </Button>
                      </a>
                    )}
                    {lead.linkedinCompanyPage && (
                      <a href={lead.linkedinCompanyPage} target="_blank" rel="noreferrer">
                        <Button variant="outline" size="sm" className="w-full h-8 justify-start gap-2 text-[10px] bg-[#050508] border-white/5 hover:border-indigo-500/20 hover:bg-[#12121b] text-neutral-400 shadow-none font-normal rounded-xl transition-all">
                          <Linkedin className="w-3.5 h-3.5 text-blue-400" /> Company LinkedIn
                        </Button>
                      </a>
                    )}
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
