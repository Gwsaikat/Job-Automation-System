'use client';
import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, Linkedin, Mail, ExternalLink, Globe } from 'lucide-react';

export default function FundingLeadsPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/funding-leads')
      .then(res => res.json())
      .then(data => {
        setLeads(data.leads || []);
        setLoading(false);
      });
  }, []);

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Funding Leads</h1>
          <p className="text-neutral-400">Recently funded companies likely to hire engineers soon.</p>
        </div>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="text-neutral-500 text-center py-12">Loading funding leads...</div>
        ) : leads.length === 0 ? (
          <div className="text-neutral-500 text-center py-12">No leads found. Run the funding pipeline.</div>
        ) : (
          leads.map(lead => {
            const emails = lead.emailsFound ? JSON.parse(lead.emailsFound) : [];
            
            return (
              <Card key={lead.id} className="bg-neutral-900/50 border-neutral-800 p-6 flex flex-col md:flex-row gap-6">
                {/* Left col: Details */}
                <div className="flex-1 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-xl font-bold text-white">{lead.company}</h3>
                        {lead.isIndian === 1 && (
                          <span className="text-xs border border-orange-500/30 text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded">Indian</span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <Badge variant="outline" className="text-green-400 border-green-400/20 bg-green-400/10">
                          {lead.fundingAmount}
                        </Badge>
                        <Badge variant="secondary" className="bg-neutral-800 text-neutral-300">
                          {lead.stage || 'Unknown Stage'}
                        </Badge>
                        <Badge variant="secondary" className="bg-neutral-800 text-neutral-300">
                          {lead.sector || 'Unknown Sector'}
                        </Badge>
                        <Badge variant="secondary" className="bg-neutral-800 text-neutral-300">
                          {lead.domain || 'Tech'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-sm text-neutral-400 max-w-3xl leading-relaxed">
                    {lead.problemSolved}
                  </p>
                  
                  <div className="flex gap-4 items-center pt-2">
                    <span className="text-xs text-neutral-500">Found {new Date(lead.dateFound).toLocaleDateString()}</span>
                    {lead.newsLink && (
                      <a href={lead.newsLink} target="_blank" rel="noreferrer" className="text-xs text-blue-400 hover:underline flex items-center gap-1">
                        <ExternalLink className="w-3 h-3" /> Source Article
                      </a>
                    )}
                  </div>
                </div>

                {/* Right col: Actions / Emails */}
                <div className="md:w-72 md:border-l border-neutral-800 md:pl-6 space-y-4">
                  <h4 className="text-sm font-medium text-neutral-300">Outreach Contacts</h4>
                  
                  {emails.length > 0 ? (
                    <div className="space-y-2">
                      {emails.map((email: string, i: number) => (
                        <div key={i} className="flex items-center gap-2 text-sm bg-neutral-800/50 p-2 rounded border border-neutral-800">
                          <Mail className="w-4 h-4 text-neutral-400" />
                          <span className="text-neutral-300 truncate">{email}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-neutral-500 italic mb-2">No direct emails found.</div>
                  )}

                  <div className="flex flex-col gap-2 pt-2">
                    {lead.linkedinPeopleSearch && (
                      <a href={lead.linkedinPeopleSearch} target="_blank" rel="noreferrer">
                        <Button variant="outline" size="sm" className="w-full justify-start gap-2 text-xs h-8">
                          <Search className="w-3 h-3 text-blue-400" /> Find Recruiters
                        </Button>
                      </a>
                    )}
                    {lead.linkedinCompanyPage && (
                      <a href={lead.linkedinCompanyPage} target="_blank" rel="noreferrer">
                        <Button variant="outline" size="sm" className="w-full justify-start gap-2 text-xs h-8">
                          <Linkedin className="w-3 h-3 text-blue-400" /> Company LinkedIn
                        </Button>
                      </a>
                    )}
                    {lead.googleLinkedinSearch && (
                      <a href={lead.googleLinkedinSearch} target="_blank" rel="noreferrer">
                        <Button variant="outline" size="sm" className="w-full justify-start gap-2 text-xs h-8">
                          <Globe className="w-3 h-3 text-blue-400" /> Google Search
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
