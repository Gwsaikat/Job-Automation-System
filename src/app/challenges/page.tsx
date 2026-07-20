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
    <div className="p-12 max-w-6xl mx-auto space-y-8 select-none relative animate-in fade-in duration-500">
      
      {/* Background Aura Glows */}
      <div className="absolute top-0 right-1/4 w-80 h-80 bg-indigo-600/5 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Notion Breadcrumbs */}
      <div className="text-[11px] text-neutral-500 flex items-center gap-1.5 font-mono uppercase tracking-wider relative z-10">
        <span>Cosmic Hub</span>
        <span>/</span>
        <span className="text-indigo-400 font-medium">🏆 SDE Challenges</span>
      </div>

      {/* Page Header */}
      <div className="flex justify-between items-start flex-wrap gap-4 relative z-10">
        <div className="space-y-1">
          <h1 className="text-4xl font-extrabold tracking-tight text-neutral-100 flex items-center gap-3">
            <span>🏆</span> <span className="gradient-text-cosmic">SDE Challenges</span>
          </h1>
          <p className="text-neutral-400 text-[14.5px] font-light leading-relaxed max-w-xl">
            Zero-AI-cost hackathons and coding challenges to unlock hiring fast-tracks.
          </p>
        </div>
        <Button onClick={fetchChallenges} variant="outline" className="h-9 px-4 text-xs bg-[#0d0d12]/60 border-white/5 hover:border-indigo-500/25 hover:bg-[#20202d]/20 text-neutral-300 font-medium rounded-xl gap-2 shadow-none transition-all duration-300">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Sync Contests
        </Button>
      </div>

      {/* Notion Gallery Board */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 relative z-10">
        {loading ? (
          <div className="col-span-full text-indigo-400 text-center py-12 text-xs flex flex-col items-center justify-center gap-2">
            <div className="w-6 h-6 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin"></div>
            <span>Fetching active challenges...</span>
          </div>
        ) : challenges.length === 0 ? (
          <div className="col-span-full text-neutral-500 text-center py-12 text-xs italic font-light">
            No active challenges found in register. Run scraper to pull.
          </div>
        ) : (
          challenges.map(challenge => (
            <Card key={challenge.id} className="animated-gradient-border bg-[#0d0d12]/85 flex flex-col rounded-2xl shadow-xl overflow-hidden hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300 border-none">
              <div className="p-6 flex-1 space-y-4 relative z-10">
                <div className="flex justify-between items-start">
                  <div className="w-8 h-8 rounded-xl bg-indigo-500/10 flex items-center justify-center text-sm font-semibold shadow-inner">
                    🎯
                  </div>
                  <Badge variant="outline" className="text-[9.5px] font-mono text-neutral-400 bg-neutral-900 border-white/5">
                    {challenge.source}
                  </Badge>
                </div>
                
                <div className="space-y-1.5">
                  <h3 className="font-bold text-[14.5px] leading-snug text-neutral-100 line-clamp-2">
                    {challenge.challengeName}
                  </h3>
                  <p className="text-indigo-300 text-xs font-semibold">{challenge.company || 'Unknown Company'}</p>
                </div>
                
                <div className="flex items-center text-[10px] text-neutral-400 bg-[#050508]/85 rounded-xl p-2.5 border border-white/5 font-mono">
                  <Calendar className="w-3.5 h-3.5 mr-2 text-neutral-500" />
                  Deadline: <span className="text-neutral-200 font-semibold ml-1">{challenge.deadline ? new Date(challenge.deadline).toLocaleDateString() : 'Open'}</span>
                </div>
              </div>
              
              <div className="p-4 border-t border-white/5 bg-[#0d0d12] relative z-10">
                <a href={challenge.applyLink} target="_blank" rel="noreferrer" className="block">
                  <Button className="w-full h-8 bg-gradient-to-r from-indigo-650 to-indigo-550 hover:from-indigo-600 hover:to-indigo-500 text-white text-xs gap-1.5 shadow-md font-semibold rounded-xl border-none">
                    Register Challenge <ExternalLink className="w-3 h-3" />
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
