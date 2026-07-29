'use client';
import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, RefreshCw, ExternalLink, ShieldCheck } from 'lucide-react';

export default function ChallengesPage() {
  const [challenges, setChallenges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchChallenges = () => {
    setLoading(true);
    fetch('/api/challenges')
      .then((res) => res.json())
      .then((data) => {
        setChallenges(data.challenges || []);
        setLoading(false);
      });
  };

  useEffect(() => { fetchChallenges(); }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-5 page-fade">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0F172A] flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[8px] bg-[#FFFBEB] border border-[#FDE68A] flex items-center justify-center">
              <Trophy className="w-4 h-4 text-[#B45309]" />
            </div>
            Hiring Challenges
          </h1>
          <p className="text-[13px] text-[#64748B] mt-0.5">Verified hackathons, coding contests, and SDE hiring challenges.</p>
        </div>
        <Button onClick={fetchChallenges} variant="outline" size="sm">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Sync Contests
        </Button>
      </div>

      <Card className="ag-card overflow-hidden">
        <table className="ag-table">
          <thead>
            <tr>
              <th className="min-w-[240px]">Challenge Name</th>
              <th>Company / Host</th>
              <th>Platform</th>
              <th>Deadline</th>
              <th>Type</th>
              <th className="text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="text-center text-[#64748B] text-[12px] py-8">Fetching active contests...</td></tr>
            ) : challenges.length === 0 ? (
              <tr><td colSpan={6} className="text-center text-[#64748B] text-[12px] py-8">No active challenges found. Click Sync Contests to pull listings.</td></tr>
            ) : (
              challenges.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className="font-semibold text-[#0F172A] text-[12px] flex items-center gap-1.5">
                      <span>{item.challengeName}</span>
                      <span title="Verified"><ShieldCheck className="w-3.5 h-3.5 text-[#047857]" /></span>
                    </div>
                  </td>
                  <td className="text-[12px] text-[#334155] font-medium">{item.company || 'Unknown'}</td>
                  <td><span className="ag-badge-accent">{item.platform || item.source}</span></td>
                  <td className="font-mono text-[11px] text-[#334155] font-medium">{item.deadline ? new Date(item.deadline).toLocaleDateString() : 'Open'}</td>
                  <td><span className="ag-badge">{item.challengeType === 'hiring' ? 'HIRING' : 'COMPETITION'}</span></td>
                  <td className="text-right">
                    <a href={item.applyLink} target="_blank" rel="noreferrer">
                      <Button size="sm" className="h-7 text-[11px] px-3">
                        Apply <ExternalLink className="w-3 h-3" />
                      </Button>
                    </a>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
