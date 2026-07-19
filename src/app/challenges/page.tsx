'use client';
import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Calendar, RefreshCw } from 'lucide-react';

export default function ChallengesPage() {
  const [challenges, setChallenges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchChallenges = () => {
    setLoading(true);
    fetch('/api/challenges')
      .then(res => res.json())
      .then(data => {
        setChallenges(data.challenges || []);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchChallenges();
  }, []);

  return (
    <div className="p-12 max-w-5xl mx-auto space-y-6 select-none animate-in fade-in duration-300">
      
      {/* Notion Breadcrumbs */}
      <div className="text-xs text-neutral-500 flex items-center gap-1.5 font-normal">
        <span>Saikat's Workspace</span>
        <span>/</span>
        <span className="text-neutral-400 font-medium">🏆 SDE Challenges</span>
      </div>

      {/* Page Header */}
      <div className="flex justify-between items-start flex-wrap gap-3">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-neutral-100 flex items-center gap-3">
            <span>🏆</span> SDE Challenges
          </h1>
          <p className="text-neutral-400 text-sm">
            Zero-AI-cost hiring challenges, hackathons, and contests sourced directly from Unstop.
          </p>
        </div>
        <Button onClick={fetchChallenges} variant="outline" className="h-8 text-xs bg-[#202020] border-[#2f2f2f] hover:bg-[#2a2a2a] text-neutral-300 font-normal rounded gap-1.5 shadow-none">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Notion Gallery Board */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <div className="col-span-full text-neutral-500 text-center py-12 text-xs">
            ⏳ Loading challenges...
          </div>
        ) : challenges.length === 0 ? (
          <div className="col-span-full text-neutral-500 text-center py-12 text-xs italic">
            No active challenges found. Run the scraper pipeline from Settings.
          </div>
        ) : (
          challenges.map(challenge => (
            <Card key={challenge.id} className="bg-[#202020] border-[#2f2f2f] flex flex-col rounded shadow-none hover:border-[#3f3f3f] transition-all">
              <div className="p-5 flex-1 space-y-3">
                <div className="flex justify-between items-start">
                  <div className="w-7 h-7 rounded bg-indigo-500/10 flex items-center justify-center text-sm font-semibold">
                    🎯
                  </div>
                  <Badge variant="outline" className="text-[10px] text-neutral-400 bg-neutral-900 border-[#2f2f2f]">
                    {challenge.source}
                  </Badge>
                </div>
                
                <div className="space-y-1">
                  <h3 className="font-semibold text-sm leading-tight text-neutral-100 line-clamp-2">
                    {challenge.challengeName}
                  </h3>
                  <p className="text-[#2eaadc] text-xs font-medium">{challenge.company || 'Unknown Company'}</p>
                </div>
                
                <div className="flex items-center text-[10px] text-neutral-400 bg-[#191919] rounded p-2 border border-[#2f2f2f]/60 font-mono">
                  <Calendar className="w-3.5 h-3.5 mr-2 text-neutral-500" />
                  Deadline: {challenge.deadline ? new Date(challenge.deadline).toLocaleDateString() : 'Open'}
                </div>
              </div>
              
              <div className="p-3.5 border-t border-[#2f2f2f] bg-[#202020]">
                <a href={challenge.applyLink} target="_blank" rel="noreferrer" className="block">
                  <Button className="w-full h-8 bg-indigo-650 hover:bg-indigo-700 text-white text-xs gap-1.5 shadow-none font-medium">
                    View Challenge <ExternalLink className="w-3 h-3" />
                  </Button>
                </a>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
