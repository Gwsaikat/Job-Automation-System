'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  BookOpen,
  Sparkles,
  Search,
  Copy,
  Check,
  Layers,
  Code2,
  Award,
  Zap,
  ChevronRight,
  ShieldCheck,
  MessageSquare,
} from 'lucide-react';
import { CANDIDATE } from '@/lib/candidate-profile';

interface STARStory {
  id: string;
  title: string;
  projectOrCompany: string;
  category: 'Technical Challenge' | 'System Architecture' | 'Client / Deadline' | 'Conflict / Problem Solving' | 'Leadership / Ownership';
  situation: string;
  task: string;
  action: string;
  result: string;
  keyReflection: string;
  applicableQuestions: string[];
}

const MASTER_STAR_STORIES: STARStory[] = [
  {
    id: '1',
    title: 'Optimizing Real-Time Critical Path Computation (FlowForge)',
    projectOrCompany: 'FlowForge (CPM Engine)',
    category: 'System Architecture',
    situation: 'Project management graphs with hundreds of task dependencies suffered performance lag when computing critical paths dynamically.',
    task: 'Architect a low-latency graph algorithm pipeline in Node.js & React capable of topological sorting, cycle detection, and forward/backward passes in real-time.',
    action: 'Implemented Kahn\'s Algorithm for topological sorting and depth-first search (DFS) for cycle detection. Utilized WebSocket for real-time state synchronization and Redis caching for computed graph paths.',
    result: 'Reduced path recalculation time from 850ms to under 35ms, allowing instantaneous graph rendering upon dependency edits.',
    keyReflection: 'Decoupling compute-heavy graph algorithms from main looper threads prevents UI freezes in real-time applications.',
    applicableQuestions: [
      'Tell me about a complex technical problem you solved.',
      'How do you optimize application performance?',
      'Describe a project where you implemented data structures & algorithms in production.',
    ],
  },
  {
    id: '2',
    title: 'Building Real-Time Device Tracking & Geolocation Sync (TrackChat)',
    projectOrCompany: 'TrackChat',
    category: 'Technical Challenge',
    situation: 'Mobile and web clients experienced battery drain and out-of-sync location markers during continuous GPS tracking.',
    task: 'Design an efficient client-server protocol for live location streaming with minimal data overhead and battery consumption.',
    action: 'Leveraged HTML5 Geolocation API with distance thresholding. Emitted location deltas over Socket.io WebSockets instead of polling, rendering markers on Leaflet.js maps with smooth interpolation.',
    result: 'Maintained continuous 60fps map marker updates while cutting network payload size by 65% and reducing device battery consumption by 40%.',
    keyReflection: 'Event-driven WebSocket streaming is far superior to HTTP polling for real-time spatial applications.',
    applicableQuestions: [
      'How do you choose between WebSockets and HTTP REST APIs?',
      'Tell me about a real-time feature you designed.',
      'How do you optimize network payload and battery usage?',
    ],
  },
  {
    id: '3',
    title: 'End-to-End Client System Digitization for Diagnostic Center',
    projectOrCompany: 'Freelance Client Project',
    category: 'Client / Deadline',
    situation: 'A local diagnostic center managed patient records and test appointments manually on paper ledgers, causing booking conflicts and lost records.',
    task: 'Sole developer responsible for gathering requirements, building, and deploying a secure digital management platform within a strict 3-week deadline.',
    action: 'Designed a responsive React & Node.js web portal with role-based access control (RBAC), JWT authentication, automated patient record generation, and daily appointment scheduling.',
    result: 'Successfully deployed on Render with zero downtime. Digitized 100% of daily operations and eliminated booking conflicts.',
    keyReflection: 'Translating non-technical client requirements into clean database schemas is critical for successful software delivery.',
    applicableQuestions: [
      'Describe a project where you owned the full development lifecycle.',
      'How do you handle tight deadlines or client constraints?',
      'Tell me about a time you communicated technical concepts to non-technical stakeholders.',
    ],
  },
  {
    id: '4',
    title: 'Virtual Internship E-Commerce Platform Architecture',
    projectOrCompany: 'Thiranex Virtual Internship',
    category: 'Leadership / Ownership',
    situation: 'Assigned to develop a full-featured E-Commerce system with product catalog, cart persistence, and order workflows.',
    task: 'Implement clean modular architecture ensuring high code quality and testable API endpoints.',
    action: 'Built RESTful API endpoints using Express.js and MongoDB with Mongoose schema validation. Structured frontend state management with React hooks and persistent local storage fallback.',
    result: 'Completed ahead of schedule with 98% test coverage, receiving top evaluation marks among intern cohort.',
    keyReflection: 'Modular code structure makes features easier to test, debug, and scale as team size grows.',
    applicableQuestions: [
      'How do you structure backend API endpoints?',
      'Tell me about a time you exceeded expectations on a project.',
      'How do you ensure code quality and maintainability?',
    ],
  },
];

export default function InterviewBankPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const categories = ['all', 'Technical Challenge', 'System Architecture', 'Client / Deadline', 'Leadership / Ownership'];

  const filteredStories = MASTER_STAR_STORIES.filter((story) => {
    const matchesCategory = selectedCategory === 'all' || story.category === selectedCategory;
    const matchesSearch =
      story.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      story.applicableQuestions.some((q) => q.toLowerCase().includes(searchQuery.toLowerCase())) ||
      story.projectOrCompany.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const copyStory = (story: STARStory) => {
    const formatted = `STAR STORY: ${story.title} (${story.projectOrCompany})
Category: ${story.category}

Situation: ${story.situation}
Task: ${story.task}
Action: ${story.action}
Result: ${story.result}
Reflection: ${story.keyReflection}`;

    navigator.clipboard.writeText(formatted);
    setCopiedId(story.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 page-fade relative">
      {/* Background Ambient Glow */}
      <div className="absolute top-10 right-1/4 w-96 h-96 bg-[#34d399]/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Header */}
      <div className="flex justify-between items-start flex-wrap gap-4 relative z-10">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-[#34d399]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>BEHAVIORAL INTERVIEW MASTERY</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-[#FAFAFA] flex items-center gap-3">
            <BookOpen className="w-7 h-7 text-[#34d399]" />
            <span>Master STAR Story Bank</span>
          </h1>
          <p className="text-sm text-[#A1A1AA]">
            Curated Situation-Task-Action-Result (STAR) proof stories to answer any behavioral or architectural interview question.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-[#111116] px-4 py-2 rounded-xl border border-[rgba(255,255,255,0.08)] text-xs text-[#A1A1AA]">
            <ShieldCheck className="w-4 h-4 text-[#34d399]" />
            <span className="font-mono text-xs text-[#FAFAFA]">{MASTER_STAR_STORIES.length} Master Stories</span>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex items-center gap-3 flex-wrap relative z-10">
        <div className="relative flex-1 min-w-[280px]">
          <Search className="w-4 h-4 text-[#71717A] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search stories by question, project, or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#111827] border border-[rgba(255,255,255,0.08)] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#FAFAFA] placeholder-[#71717A] outline-none focus:border-[#34d399]"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-[#34d399] text-black font-semibold'
                  : 'bg-[#111827] text-[#A1A1AA] hover:text-[#FAFAFA] border border-[rgba(255,255,255,0.08)]'
              }`}
            >
              {cat === 'all' ? 'All Categories' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Stories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
        {filteredStories.map((story) => (
          <Card key={story.id} className="ag-card p-6 space-y-4 relative flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="ag-badge-green font-mono text-[10px] uppercase">{story.category}</span>
                  <h3 className="text-base font-bold text-[#FAFAFA] mt-1.5 leading-snug">
                    {story.title}
                  </h3>
                  <p className="text-xs font-mono text-[#818cf8] mt-0.5">{story.projectOrCompany}</p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyStory(story)}
                  className="h-8 px-2.5 text-xs text-[#A1A1AA] hover:text-white hover:bg-[#111827] shrink-0"
                  title="Copy formatted STAR story to clipboard"
                >
                  {copiedId === story.id ? (
                    <Check className="w-4 h-4 text-[#34d399]" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>

              {/* STAR Breakdown */}
              <div className="space-y-2.5 pt-2 text-xs text-[#A1A1AA]">
                <div className="bg-[#09090B]/60 p-3 rounded-lg border border-[rgba(255,255,255,0.04)] space-y-1">
                  <span className="font-mono text-[10px] text-[#fbbf24] uppercase block font-semibold">Situation & Task</span>
                  <p className="leading-relaxed">{story.situation} {story.task}</p>
                </div>

                <div className="bg-[#09090B]/60 p-3 rounded-lg border border-[rgba(255,255,255,0.04)] space-y-1">
                  <span className="font-mono text-[10px] text-[#6366f1] uppercase block font-semibold">Action Taken</span>
                  <p className="leading-relaxed text-[#FAFAFA]">{story.action}</p>
                </div>

                <div className="bg-[#09090B]/60 p-3 rounded-lg border border-[rgba(255,255,255,0.04)] space-y-1">
                  <span className="font-mono text-[10px] text-[#34d399] uppercase block font-semibold">Quantified Result</span>
                  <p className="leading-relaxed text-[#34d399] font-medium">{story.result}</p>
                </div>

                <div className="p-3 bg-[#6366f1]/10 rounded-lg border border-[#6366f1]/20">
                  <span className="font-mono text-[10px] text-[#a5b4fc] uppercase block font-semibold">Key Reflection</span>
                  <p className="text-[11px] text-[#FAFAFA] italic">{story.keyReflection}</p>
                </div>
              </div>
            </div>

            {/* Applicable Questions */}
            <div className="pt-3 border-t border-[rgba(255,255,255,0.08)] space-y-1.5">
              <span className="text-[10px] font-mono text-[#71717A] uppercase block">Answers Questions:</span>
              <div className="space-y-1">
                {story.applicableQuestions.map((q, i) => (
                  <div key={i} className="text-[11px] text-[#A1A1AA] flex items-center gap-1.5">
                    <ChevronRight className="w-3 h-3 text-[#34d399] shrink-0" />
                    <span>"{q}"</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
