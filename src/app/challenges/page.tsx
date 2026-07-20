'use client';
import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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

  useEffect(() => {
    fetchChallenges();
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 page-fade">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#FAFAFA] flex items-center gap-2.5">
            <Trophy className="w-6 h-6 text-[#6366f1]" />
            <span>Hiring Challenges</span>
          </h1>
          <p className="text-sm text-[#A1A1AA] mt-0.5">
            Verified hackathons, coding contests, and SDE hiring challenges across platforms.
          </p>
        </div>

        <Button
          onClick={fetchChallenges}
          variant="outline"
          className="h-8 px-3 text-xs bg-[#18181B] border-[rgba(255,255,255,0.08)] hover:border-[#6366f1]/40 text-[#FAFAFA]"
        >
          <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
          Sync Contests
        </Button>
      </div>

      {/* Minimal Table */}
      <Card className="ag-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-[#A1A1AA]">
            <thead className="text-[11px] text-[#71717A] uppercase tracking-wider bg-[#111827] border-b border-[rgba(255,255,255,0.08)]">
              <tr>
                <th className="px-4 py-3 font-medium">Challenge Name</th>
                <th className="px-4 py-3 font-medium">Company / Host</th>
                <th className="px-4 py-3 font-medium">Platform</th>
                <th className="px-4 py-3 font-medium">Deadline</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(255,255,255,0.08)]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-[#71717A] text-xs">
                    Fetching active contests...
                  </td>
                </tr>
              ) : challenges.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-[#71717A] text-xs">
                    No active challenges found. Click Sync Contests to pull listings.
                  </td>
                </tr>
              ) : (
                challenges.map((item) => (
                  <tr key={item.id} className="hover:bg-[#22222A] transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-[#FAFAFA] text-xs flex items-center gap-1.5">
                        <span>{item.challengeName}</span>
                        <span title="Verified Hiring Challenge"><ShieldCheck className="w-3.5 h-3.5 text-[#34d399]" /></span>
                      </div>
                    </td>

                    <td className="px-4 py-3.5 text-xs text-[#FAFAFA]">
                      {item.company || 'Unknown Company'}
                    </td>

                    <td className="px-4 py-3.5">
                      <span className="ag-badge-accent">
                        {item.platform || item.source}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 font-mono text-[11px] text-[#FAFAFA]">
                      {item.deadline ? new Date(item.deadline).toLocaleDateString() : 'Open'}
                    </td>

                    <td className="px-4 py-3.5">
                      <span className="ag-badge">
                        {item.challengeType === 'hiring' ? '🎯 HIRING' : 'COMPETITION'}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 text-right">
                      <a href={item.applyLink} target="_blank" rel="noreferrer">
                        <Button size="sm" className="h-7 text-[11px] bg-[#6366f1] hover:bg-[#4f46e5] text-white px-3">
                          Apply <ExternalLink className="w-3 h-3 ml-1" />
                        </Button>
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
