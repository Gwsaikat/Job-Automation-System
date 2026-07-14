'use client';
import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Trophy, Calendar } from 'lucide-react';

export default function ChallengesPage() {
  const [challenges, setChallenges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/challenges')
      .then(res => res.json())
      .then(data => {
        setChallenges(data.challenges || []);
        setLoading(false);
      });
  }, []);

  return (
    <div className="p-8 max-w-[1400px] mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">SDE Challenges</h1>
          <p className="text-neutral-400">Zero-AI-cost hiring challenges and hackathons.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <div className="col-span-full text-neutral-500 text-center py-12">Loading challenges...</div>
        ) : challenges.length === 0 ? (
          <div className="col-span-full text-neutral-500 text-center py-12">No challenges found. Run the scraper pipeline first.</div>
        ) : (
          challenges.map(challenge => (
            <Card key={challenge.id} className="bg-neutral-900/50 border-neutral-800 flex flex-col">
              <div className="p-6 flex-1">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-indigo-500/10 rounded-lg">
                    <Trophy className="w-5 h-5 text-indigo-400" />
                  </div>
                  <Badge variant="outline" className="text-xs text-neutral-400 bg-neutral-900">
                    {challenge.source}
                  </Badge>
                </div>
                
                <h3 className="font-semibold text-lg mb-1 leading-tight text-white">
                  {challenge.challengeName}
                </h3>
                <p className="text-indigo-400 text-sm font-medium mb-4">{challenge.company || 'Unknown Company'}</p>
                
                <div className="flex items-center text-xs text-neutral-400 bg-neutral-800/50 rounded p-2 border border-neutral-800">
                  <Calendar className="w-4 h-4 mr-2" />
                  Deadline: {challenge.deadline ? new Date(challenge.deadline).toLocaleDateString() : 'Not specified'}
                </div>
              </div>
              
              <div className="p-4 border-t border-neutral-800 bg-neutral-900/80">
                <a href={challenge.applyLink} target="_blank" rel="noreferrer" className="block">
                  <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white gap-2">
                    View Challenge <ExternalLink className="w-4 h-4" />
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
