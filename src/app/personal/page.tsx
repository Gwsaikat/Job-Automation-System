'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  User,
  Github,
  Code2,
  Trophy,
  BookOpen,
  ExternalLink,
  Sparkles,
  Search,
  CheckCircle2,
  GitBranch,
  Star,
  Zap,
  Target,
  Award,
  Layers,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';

interface StarStory {
  id: string;
  title: string;
  category: 'Leadership' | 'Conflict' | 'Technical Failure' | 'Tight Deadline' | 'System Architecture';
  situation: string;
  task: string;
  action: string;
  result: string;
  keyReflection: string;
  technologies: string[];
}

const MASTER_STAR_STORIES: StarStory[] = [
  {
    id: 'cpm-engine-deadlock',
    title: 'Resolving Cyclic Deadlocks in FlowForge Topological Scheduler',
    category: 'System Architecture',
    situation: 'During stress testing of FlowForge with 500+ dynamic node dependencies, the topological scheduler encountered circular dependency deadlocks.',
    task: 'Redesign cycle detection using Kahn\'s Algorithm with Tarjan\'s Strongly Connected Components to isolate recursive loops without blocking the main event loop.',
    action: 'Implemented a multi-stage DFS pass in TypeScript with Redis caching for cycle paths. Added a non-blocking queue worker that isolates deadlocks before execution.',
    result: 'Reduced graph cycle resolution time by 84% (from 450ms to 72ms) and prevented system-wide pipeline deadlocks.',
    keyReflection: 'Decoupling cycle validation from execution scheduling guarantees linear algorithmic safety in graph orchestrators.',
    technologies: ['TypeScript', 'Node.js', 'Redis', 'Algorithms', 'Graph Theory'],
  },
  {
    id: 'cropai-tfjs-memory',
    title: 'Fixing In-Browser Memory Leaks in Mobile TensorFlow.js Inference',
    category: 'Technical Failure',
    situation: 'CropAI crashed on low-end mobile devices after analyzing more than 3 consecutive high-resolution crop photos.',
    task: 'Diagnose memory leaks in WebGL GPU tensors and optimize image preprocessing memory footprint.',
    action: 'Wrapped all neural network tensor operations inside `tf.tidy()` disposal blocks and downsampled image canvas elements prior to GPU memory allocation.',
    result: 'Eliminated 100% of WebGL memory leaks, reducing peak RAM consumption from 680MB to 42MB on mobile Chrome.',
    keyReflection: 'In-browser ML requires strict manual WebGL memory lifecycle management to survive embedded environments.',
    technologies: ['TensorFlow.js', 'React.js', 'WebGL', 'Performance Optimization'],
  },
  {
    id: 'trackchat-socket-scale',
    title: 'Scaling WebSocket Heartbeat Connections for Real-Time Location Tracking',
    category: 'Leadership',
    situation: 'TrackChat experienced intermittent message drops and socket disconnection sprees during live multi-user location streaming.',
    task: 'Stabilize WebSocket persistent connections across fluctuating mobile network states.',
    action: 'Architected a heartbeat ACK protocol with automatic exponential backoff reconnection logic and Redis Pub/Sub backplane for socket message persistence.',
    result: 'Achieved 99.9% uptime across 1,000+ concurrent simulated geolocation streams with zero message loss.',
    keyReflection: 'Resilient real-time applications must assume unreliable client connections and leverage message queues for state sync.',
    technologies: ['Socket.io', 'Node.js', 'Express.js', 'Redis', 'MongoDB'],
  },
];

import { DevHeatmap } from '@/components/dev-heatmap';

function PersonalStudioContent() {
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get('tab') as 'stats' | 'opensource' | 'star-bank') || 'stats';
  const [activeTab, setActiveTab] = useState<'stats' | 'opensource' | 'star-bank'>(initialTab);

  // Coding stats state
  const [statsData, setStatsData] = useState<any>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Open source state
  const [osData, setOsData] = useState<any>(null);
  const [osLoading, setOsLoading] = useState(true);

  // STAR Bank state
  const [starSearch, setStarSearch] = useState('');
  const [starCategory, setStarCategory] = useState('All');
  const [selectedStory, setSelectedStory] = useState<StarStory>(MASTER_STAR_STORIES[0]);

  useEffect(() => {
    fetch('/api/personal/stats')
      .then((r) => r.json())
      .then((d) => {
        setStatsData(d);
        setStatsLoading(false);
      });

    fetch('/api/personal/opensource')
      .then((r) => r.json())
      .then((d) => {
        setOsData(d);
        setOsLoading(false);
      });
  }, []);

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && ['stats', 'opensource', 'star-bank'].includes(tabParam)) {
      setActiveTab(tabParam as any);
    }
  }, [searchParams]);

  const filteredStories = MASTER_STAR_STORIES.filter((s) => {
    const matchCat = starCategory === 'All' || s.category === starCategory;
    const matchSearch =
      s.title.toLowerCase().includes(starSearch.toLowerCase()) ||
      s.technologies.some((t) => t.toLowerCase().includes(starSearch.toLowerCase()));
    return matchCat && matchSearch;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 page-fade">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0F172A] flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[8px] bg-[#EEF2FF] border border-[#C7D2FE] flex items-center justify-center">
              <User className="w-4 h-4 text-[#4F46E5]" />
            </div>
            Personal Studio & Developer Stats
          </h1>
          <p className="text-[13px] text-[#64748B] mt-0.5">
            Track your live coding profiles, AI open-source contribution matches, and behavioral STAR story bank.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 bg-[#F1F5F9] p-1 rounded-[8px]">
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-[6px] transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'stats' ? 'bg-[#4F46E5] text-white shadow-xs' : 'text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            Coding Profiles
          </button>
          <button
            onClick={() => setActiveTab('opensource')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-[6px] transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'opensource' ? 'bg-[#4F46E5] text-white shadow-xs' : 'text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5" />
            AI Open-Source Matcher
          </button>
          <button
            onClick={() => setActiveTab('star-bank')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-[6px] transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'star-bank' ? 'bg-[#4F46E5] text-white shadow-xs' : 'text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            STAR Story Bank
          </button>
        </div>
      </div>

      {/* TAB 1: CODING PROFILES */}
      {activeTab === 'stats' && (
        <div className="space-y-6">
          {statsLoading ? (
            <div className="p-6 text-[#64748B] text-xs font-mono">Loading developer profiles...</div>
          ) : (
            <>
              {/* Top Summary Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* GitHub Summary */}
                <Card className="ag-card p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-2">
                    <div className="flex items-center gap-2">
                      <Github className="w-4 h-4 text-[#0F172A]" />
                      <h3 className="font-bold text-sm text-[#0F172A]">GitHub Profile</h3>
                    </div>
                    <a href="https://github.com/GwSaikat" target="_blank" rel="noreferrer" className="text-[#4F46E5] text-[11px] font-semibold flex items-center gap-0.5">
                      @GwSaikat <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] text-[#64748B] block">Public Repos</span>
                      <span className="text-lg font-bold text-[#0F172A] font-mono">{statsData?.github?.publicRepos}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#64748B] block">Stars Earned</span>
                      <span className="text-lg font-bold text-[#047857] font-mono">{statsData?.github?.totalStars}</span>
                    </div>
                  </div>
                  <div className="pt-1">
                    <span className="text-[10px] text-[#64748B] block mb-1 font-semibold uppercase">Top Stack Languages</span>
                    <div className="flex flex-wrap gap-1">
                      {statsData?.github?.topLanguages?.map((lang: string) => (
                        <span key={lang} className="text-[10px] font-mono bg-[#F1F5F9] text-[#334155] px-1.5 py-0.2 rounded border border-[#E2E8F0]">
                          {lang}
                        </span>
                      ))}
                    </div>
                  </div>
                </Card>

                {/* LeetCode Summary */}
                <Card className="ag-card p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-2">
                    <div className="flex items-center gap-2">
                      <Code2 className="w-4 h-4 text-[#B45309]" />
                      <h3 className="font-bold text-sm text-[#0F172A]">LeetCode Stats</h3>
                    </div>
                    <a href="https://leetcode.com/u/Alpha7679" target="_blank" rel="noreferrer" className="text-[#B45309] text-[11px] font-semibold flex items-center gap-0.5">
                      @Alpha7679 <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <div className="grid grid-cols-3 gap-1 text-center">
                    <div className="bg-[#ECFDF5] p-2 rounded-[6px] border border-[#A7F3D0]">
                      <span className="text-[9px] font-semibold text-[#047857] uppercase block">Easy</span>
                      <span className="text-sm font-bold text-[#047857] font-mono">{statsData?.leetcode?.solvedEasy}</span>
                    </div>
                    <div className="bg-[#FFFBEB] p-2 rounded-[6px] border border-[#FDE68A]">
                      <span className="text-[9px] font-semibold text-[#B45309] uppercase block">Medium</span>
                      <span className="text-sm font-bold text-[#B45309] font-mono">{statsData?.leetcode?.solvedMedium}</span>
                    </div>
                    <div className="bg-[#FFF1F2] p-2 rounded-[6px] border border-[#FECDD3]">
                      <span className="text-[9px] font-semibold text-[#BE123C] uppercase block">Hard</span>
                      <span className="text-sm font-bold text-[#BE123C] font-mono">{statsData?.leetcode?.solvedHard}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-xs pt-1">
                    <span className="text-[#64748B]">Total Solved: <strong className="text-[#0F172A] font-mono">{statsData?.leetcode?.solvedTotal}</strong></span>
                    <span className="text-[#047857] font-mono font-semibold">Acceptance: {statsData?.leetcode?.acceptanceRate}</span>
                  </div>
                </Card>

                {/* Codeforces Summary */}
                <Card className="ag-card p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-2">
                    <div className="flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-[#0891B2]" />
                      <h3 className="font-bold text-sm text-[#0F172A]">Codeforces Rating</h3>
                    </div>
                    <Badge variant="cyan" className="font-mono text-[10px]">
                      {statsData?.codeforces?.rank}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] text-[#64748B] block">Current Rating</span>
                      <span className="text-lg font-bold text-[#0891B2] font-mono">{statsData?.codeforces?.rating}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#64748B] block">Max Rating</span>
                      <span className="text-lg font-bold text-[#4F46E5] font-mono">{statsData?.codeforces?.maxRating}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-xs pt-1">
                    <span className="text-[#64748B]">Contests: <strong className="text-[#0F172A] font-mono">{statsData?.codeforces?.contestsCount}</strong></span>
                    <span className="text-[#64748B]">Problems: <strong className="text-[#0F172A] font-mono">{statsData?.codeforces?.problemsSolved}</strong></span>
                  </div>
                </Card>
              </div>

              {/* Dev Contribution Heatmap */}
              <DevHeatmap
                githubUsername={statsData?.github?.username || 'GwSaikat'}
                leetcodeUsername={statsData?.leetcode?.username || 'Alpha7679'}
                leetcodeData={statsData?.leetcode}
                githubData={statsData?.github}
              />

              {/* Recent Accepted Submissions */}
              <Card className="ag-card p-5 space-y-4">
                <h3 className="font-bold text-xs text-[#0F172A] uppercase tracking-wider flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#047857]" />
                  Recent Accepted DSA & Competitive Submissions
                </h3>
                <div className="space-y-2">
                  {statsData?.leetcode?.recentSubmissions?.map((sub: any, idx: number) => (
                    <div key={idx} className="p-3 rounded-[8px] bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5">
                        <span className="ag-badge-green font-mono text-[10px]">{sub.status}</span>
                        <span className="font-semibold text-[#0F172A]">{sub.title}</span>
                      </div>
                      <div className="flex items-center gap-3 text-[11px]">
                        <span className={`font-mono text-[10px] ${sub.difficulty === 'Hard' ? 'text-[#BE123C]' : 'text-[#B45309]'}`}>
                          {sub.difficulty}
                        </span>
                        <span className="text-[#94A3B8] font-mono">{sub.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </>
          )}
        </div>
      )}

      {/* TAB 2: AI OPEN-SOURCE MATCHER */}
      {activeTab === 'opensource' && (
        <div className="space-y-5">
          {osLoading ? (
            <div className="p-6 text-[#64748B] text-xs font-mono">Finding open-source repos matching candidate stack...</div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-[#0F172A] flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#4F46E5]" />
                    AI-Matched Open-Source Repositories to Contribute
                  </h2>
                  <p className="text-[12px] text-[#64748B]">
                    Matched specifically against your MERN, TypeScript, Next.js & LangChain skillset with open Good First Issues.
                  </p>
                </div>
                <Badge variant="indigo" className="font-mono text-[11px]">
                  {osData?.totalMatchedRepos} Repos Found
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {osData?.projects?.map((proj: any) => (
                  <Card key={proj.id} className="ag-card p-4 space-y-3">
                    <div className="flex justify-between items-start border-b border-[#F1F5F9] pb-2.5">
                      <div>
                        <div className="flex items-center gap-2">
                          <GitBranch className="w-4 h-4 text-[#4F46E5]" />
                          <a href={proj.repoUrl} target="_blank" rel="noreferrer" className="font-bold text-sm text-[#0F172A] hover:text-[#4F46E5] flex items-center gap-1">
                            {proj.owner}/{proj.repoName} <ExternalLink className="w-3 h-3 text-[#94A3B8]" />
                          </a>
                        </div>
                        <p className="text-[11px] text-[#64748B] mt-0.5 line-clamp-2">{proj.description}</p>
                      </div>
                      <Badge variant="emerald" className="font-mono text-[11px] shrink-0">
                        {proj.matchScore}% Stack Match
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1 text-[#B45309] font-mono text-[11px]">
                        <Star className="w-3.5 h-3.5 fill-[#FBBF24]" />
                        <span>{proj.stars.toLocaleString()} stars</span>
                      </div>
                      <span className="ag-badge-cyan font-mono text-[10px]">{proj.difficulty}</span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-semibold text-[#94A3B8] uppercase block">Matched Technologies</span>
                      <div className="flex flex-wrap gap-1">
                        {proj.matchedSkills.map((sk: string) => (
                          <span key={sk} className="text-[10px] font-mono bg-[#EEF2FF] text-[#4338CA] px-1.5 py-0.2 rounded border border-[#C7D2FE]">
                            {sk}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-[#F1F5F9] flex items-center justify-between">
                      <span className="text-[11px] text-[#047857] font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {proj.goodFirstIssuesCount} Good First Issues Open
                      </span>
                      <a href={proj.issuesUrl} target="_blank" rel="noreferrer">
                        <Button size="sm" className="h-7 text-[11px] bg-[#4F46E5] hover:bg-[#4338CA] text-white">
                          View Contribution Issues <ExternalLink className="w-3 h-3" />
                        </Button>
                      </a>
                    </div>
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* TAB 3: STAR STORY BANK */}
      {activeTab === 'star-bank' && (
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-3.5 h-3.5 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search stories by topic, architecture problem, or technology..."
                value={starSearch}
                onChange={(e) => setStarSearch(e.target.value)}
                className="ag-input w-full pl-9 py-2 text-xs"
              />
            </div>

            <div className="flex items-center gap-1.5 bg-[#F1F5F9] p-1 rounded-[8px]">
              {['All', 'System Architecture', 'Technical Failure', 'Leadership'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setStarCategory(cat)}
                  className={`px-3 py-1 text-xs font-semibold rounded-[6px] transition-all cursor-pointer ${
                    starCategory === cat ? 'bg-[#4F46E5] text-white shadow-xs' : 'text-[#64748B] hover:text-[#0F172A]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Main STAR Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Story List */}
            <div className="space-y-3">
              {filteredStories.map((story) => (
                <Card
                  key={story.id}
                  onClick={() => setSelectedStory(story)}
                  className={`ag-card p-4 space-y-2 cursor-pointer transition-all ${
                    selectedStory.id === story.id ? 'border-[#4F46E5] ring-2 ring-[#4F46E5]/10 bg-[#EEF2FF]/30' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Badge variant="violet" className="text-[9px] font-mono uppercase">
                      {story.category}
                    </Badge>
                    <ChevronRight className="w-4 h-4 text-[#94A3B8]" />
                  </div>
                  <h3 className="text-sm font-bold text-[#0F172A] leading-snug">{story.title}</h3>
                  <div className="flex flex-wrap gap-1 pt-1">
                    {story.technologies.slice(0, 3).map((tech) => (
                      <span key={tech} className="text-[9px] font-mono bg-[#F1F5F9] text-[#475569] px-1.5 py-0.2 rounded border border-[#E2E8F0]">
                        {tech}
                      </span>
                    ))}
                  </div>
                </Card>
              ))}
            </div>

            {/* Story Detail View */}
            <div className="lg:col-span-2">
              <Card className="ag-card p-6 space-y-5">
                <div className="border-b border-[#F1F5F9] pb-4 space-y-2">
                  <Badge variant="violet" className="text-[10px] font-mono uppercase">
                    {selectedStory.category}
                  </Badge>
                  <h2 className="text-xl font-bold text-[#0F172A]">{selectedStory.title}</h2>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {selectedStory.technologies.map((t) => (
                      <Badge key={t} variant="indigo" className="font-mono text-[10px]">
                        {t}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-4 text-xs text-[#334155] leading-relaxed">
                  <div className="p-3.5 bg-[#F8FAFC] rounded-[8px] border border-[#E2E8F0] space-y-1">
                    <span className="font-bold text-[#0F172A] text-xs uppercase font-mono block">Situation:</span>
                    <p>{selectedStory.situation}</p>
                  </div>

                  <div className="p-3.5 bg-[#F8FAFC] rounded-[8px] border border-[#E2E8F0] space-y-1">
                    <span className="font-bold text-[#0F172A] text-xs uppercase font-mono block">Task:</span>
                    <p>{selectedStory.task}</p>
                  </div>

                  <div className="p-3.5 bg-[#EEF2FF] rounded-[8px] border border-[#C7D2FE] space-y-1">
                    <span className="font-bold text-[#4338CA] text-xs uppercase font-mono block">Action:</span>
                    <p className="font-medium text-[#0F172A]">{selectedStory.action}</p>
                  </div>

                  <div className="p-3.5 bg-[#ECFDF5] rounded-[8px] border border-[#A7F3D0] space-y-1">
                    <span className="font-bold text-[#047857] text-xs uppercase font-mono block">Result:</span>
                    <p className="font-bold text-[#047857]">{selectedStory.result}</p>
                  </div>

                  <div className="p-3.5 bg-[#FFFBEB] rounded-[8px] border border-[#FDE68A] space-y-1">
                    <span className="font-bold text-[#B45309] text-xs uppercase font-mono block">Key Architectural Takeaway:</span>
                    <p className="text-[#334155] italic">{selectedStory.keyReflection}</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PersonalStudioPage() {
  return (
    <Suspense fallback={<div className="p-6 text-[#64748B] text-xs font-mono">Loading Personal Studio...</div>}>
      <PersonalStudioContent />
    </Suspense>
  );
}
