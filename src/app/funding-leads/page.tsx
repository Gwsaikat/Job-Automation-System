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
    <div className="p-12 max-w-5xl mx-auto space-y-6 select-none animate-in fade-in duration-300">
      
      {/* Notion Breadcrumbs */}
      <div className="text-xs text-neutral-500 flex items-center gap-1.5 font-normal">
        <span>Saikat's Workspace</span>
        <span>/</span>
        <span className="text-neutral-400 font-medium">📈 Funding Leads</span>
      </div>

      {/* Page Header */}
      <div className="flex justify-between items-start flex-wrap gap-3">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-neutral-100 flex items-center gap-3">
            <span>📈</span> Funding Leads
          </h1>
          <p className="text-neutral-400 text-sm">
            Recently funded startups that are likely to expand engineering teams. Sourced via funding RSS feeds.
          </p>
        </div>
        <Button onClick={fetchLeads} variant="outline" className="h-8 text-xs bg-[#202020] border-[#2f2f2f] hover:bg-[#2a2a2a] text-neutral-300 font-normal rounded gap-1.5 shadow-none">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Leads List */}
      <div className="space-y-3">
        {loading ? (
          <div className="text-neutral-500 text-center py-12 text-xs">
            ⏳ Loading funding leads...
          </div>
        ) : leads.length === 0 ? (
          <div className="text-neutral-500 text-center py-12 text-xs italic">
            No leads found. Run the funding pipeline from Settings.
          </div>
        ) : (
          leads.map(lead => {
            const emails = lead.emailsFound ? JSON.parse(lead.emailsFound) : [];
            
            return (
              <Card key={lead.id} className="bg-[#202020] border-[#2f2f2f] p-5 flex flex-col md:flex-row gap-6 rounded shadow-none hover:border-[#3f3f3f] transition-all">
                {/* Left col: Details */}
                <div className="flex-1 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <h3 className="text-lg font-bold text-neutral-100">{lead.company}</h3>
                        {lead.isIndian === 1 && (
                          <span className="text-[9px] font-mono border border-orange-500/30 text-orange-400 bg-orange-500/10 px-1.5 py-0.2 rounded">Indian</span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        <Badge variant="outline" className="text-green-400 border-green-500/20 bg-green-500/10 text-[10px] py-0 px-2 font-mono">
                          {lead.fundingAmount}
                        </Badge>
                        <Badge variant="secondary" className="bg-[#191919] border border-[#2f2f2f] text-neutral-400 text-[10px] py-0 px-2 font-normal">
                          {lead.stage || 'Unknown Stage'}
                        </Badge>
                        <Badge variant="secondary" className="bg-[#191919] border border-[#2f2f2f] text-neutral-400 text-[10px] py-0 px-2 font-normal">
                          {lead.sector || 'Unknown Sector'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-xs text-neutral-400 max-w-3xl leading-relaxed">
                    {lead.problemSolved}
                  </p>
                  
                  <div className="flex gap-4 items-center pt-1 text-[10px] text-neutral-500 font-mono">
                    <span>Found: {new Date(lead.dateFound).toLocaleDateString()}</span>
                    {lead.newsLink && (
                      <a href={lead.newsLink} target="_blank" rel="noreferrer" className="text-[#2eaadc] hover:underline flex items-center gap-1">
                        <ExternalLink className="w-3 h-3" /> News Article
                      </a>
                    )}
                  </div>
                </div>

                {/* Right col: Actions / Emails */}
                <div className="md:w-64 md:border-l border-[#2f2f2f] md:pl-5 space-y-3 flex flex-col justify-between">
                  <div>
                    <h4 className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-2">Outreach Contacts</h4>
                    
                    {emails.length > 0 ? (
                      <div className="space-y-1">
                        {emails.map((email: string, i: number) => (
                          <div key={i} className="flex items-center gap-1.5 text-xs bg-[#191919] px-2 py-1 rounded border border-[#2f2f2f]/60 font-mono select-all">
                            <Mail className="w-3 h-3 text-neutral-500" />
                            <span className="text-neutral-300 truncate">{email}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-[11px] text-neutral-500 italic">No direct email found. Use quick search links below:</div>
                    )}
                  </div>

                  <div className="flex flex-col gap-1.5 pt-2">
                    {lead.linkedinPeopleSearch && (
                      <a href={lead.linkedinPeopleSearch} target="_blank" rel="noreferrer">
                        <Button variant="outline" size="sm" className="w-full h-7 justify-start gap-2 text-[10px] bg-[#191919] border-[#2f2f2f] hover:bg-[#202020] text-neutral-400 shadow-none font-normal">
                          <Search className="w-3 h-3 text-blue-400" /> Find Recruiters
                        </Button>
                      </a>
                    )}
                    {lead.linkedinCompanyPage && (
                      <a href={lead.linkedinCompanyPage} target="_blank" rel="noreferrer">
                        <Button variant="outline" size="sm" className="w-full h-7 justify-start gap-2 text-[10px] bg-[#191919] border-[#2f2f2f] hover:bg-[#202020] text-neutral-400 shadow-none font-normal">
                          <Linkedin className="w-3 h-3 text-blue-400" /> Company LinkedIn
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
