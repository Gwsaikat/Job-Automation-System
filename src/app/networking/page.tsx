'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  MessageSquare,
  Gift,
  Lightbulb,
  Plus,
  ThumbsUp,
  Building,
  Send,
  CheckCircle2,
  X,
  ExternalLink,
  Sparkles,
  Search,
  MessageCircle,
} from 'lucide-react';
import { Portal } from '@/components/portal';

function NetworkingHubContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  
  const [activeTab, setActiveTab] = useState<'discussions' | 'referrals' | 'market_gaps'>('discussions');

  useEffect(() => {
    if (tabParam === 'gaps' || tabParam === 'market_gaps') {
      setActiveTab('market_gaps');
    } else if (tabParam === 'referrals') {
      setActiveTab('referrals');
    } else if (tabParam === 'discussions') {
      setActiveTab('discussions');
    }
  }, [tabParam]);
  const [loading, setLoading] = useState(true);

  // Data states
  const [discussions, setDiscussions] = useState<any[]>([]);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [marketGaps, setMarketGaps] = useState<any[]>([]);

  // Post Modals
  const [showNewPostModal, setShowNewPostModal] = useState(false);
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [postCategory, setPostCategory] = useState('Interview Exp');
  const [postType, setPostType] = useState<'discussion' | 'market_gap'>('discussion');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/networking');
      const data = await res.json();
      setDiscussions(data.discussions || []);
      setReferrals(data.referrals || []);
      setMarketGaps(data.marketGaps || []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async () => {
    if (!postTitle.trim() || !postContent.trim()) return;
    await fetch('/api/networking', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: postType,
        title: postTitle,
        content: postContent,
        category: postCategory,
      }),
    });
    setShowNewPostModal(false);
    setPostTitle('');
    setPostContent('');
    fetchData();
  };

  const requestReferral = (company: string, referrer: string) => {
    alert(`Referral request sent to ${referrer} at ${company}! Candidate profile attached.`);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 page-fade">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0F172A] flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[8px] bg-[#ECFDF5] border border-[#A7F3D0] flex items-center justify-center">
              <Users className="w-4 h-4 text-[#047857]" />
            </div>
            Networking & Community Hub
          </h1>
          <p className="text-[13px] text-[#64748B] mt-0.5">
            Developer discussion threads, peer referral marketplace, and software market gap ideas.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={() => setShowNewPostModal(true)} size="sm">
            <Plus className="w-4 h-4" /> Create Post / Market Gap
          </Button>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="flex items-center gap-1 bg-[#F1F5F9] p-1 rounded-[8px] overflow-x-auto scrollbar-none max-w-full sm:max-w-md">
        <button
          onClick={() => setActiveTab('discussions')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-[6px] transition-all flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 sm:flex-1 cursor-pointer ${
            activeTab === 'discussions' ? 'bg-[#4F46E5] text-white shadow-xs' : 'text-[#64748B] hover:text-[#0F172A]'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          Discussion Hub
        </button>
        <button
          onClick={() => setActiveTab('referrals')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-[6px] transition-all flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 sm:flex-1 cursor-pointer ${
            activeTab === 'referrals' ? 'bg-[#4F46E5] text-white shadow-xs' : 'text-[#64748B] hover:text-[#0F172A]'
          }`}
        >
          <Gift className="w-3.5 h-3.5" />
          Referral Market
        </button>
        <button
          onClick={() => setActiveTab('market_gaps')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-[6px] transition-all flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 sm:flex-1 cursor-pointer ${
            activeTab === 'market_gaps' ? 'bg-[#4F46E5] text-white shadow-xs' : 'text-[#64748B] hover:text-[#0F172A]'
          }`}
        >
          <Lightbulb className="w-3.5 h-3.5" />
          Idea & Market Gap
        </button>
      </div>

      {/* TAB 1: DISCUSSION HUB */}
      {activeTab === 'discussions' && (
        <div className="space-y-4">
          {discussions.map((disc) => (
            <Card key={disc.id} className="ag-card p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-[8px] bg-[#EEF2FF] border border-[#C7D2FE] flex items-center justify-center font-bold text-xs text-[#4F46E5]">
                    {disc.avatar}
                  </div>
                  <div>
                    <span className="font-bold text-xs text-[#0F172A]">{disc.author}</span>
                    <span className="text-[11px] text-[#64748B] block">{disc.companyOrRole}</span>
                  </div>
                </div>
                <Badge variant="indigo" className="text-[10px] font-mono">{disc.category}</Badge>
              </div>

              <h3 className="font-bold text-sm text-[#0F172A]">{disc.title}</h3>
              <p className="text-xs text-[#334155] leading-relaxed">{disc.content}</p>

              <div className="pt-2 border-t border-[#F1F5F9] flex items-center justify-between text-xs text-[#64748B]">
                <div className="flex items-center gap-4">
                  <button className="flex items-center gap-1.5 text-[#4F46E5] font-semibold hover:underline cursor-pointer">
                    <ThumbsUp className="w-3.5 h-3.5" /> {disc.upvotes} Upvotes
                  </button>
                  <button className="flex items-center gap-1.5 text-[#64748B] hover:text-[#0F172A] cursor-pointer">
                    <MessageCircle className="w-3.5 h-3.5" /> {disc.commentsCount} Comments
                  </button>
                </div>
                <span className="text-[10px] font-mono text-[#94A3B8]">{disc.timestamp}</span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* TAB 2: REFERRAL MARKETPLACE */}
      {activeTab === 'referrals' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {referrals.map((ref) => (
            <Card key={ref.id} className="ag-card p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-[8px] bg-[#EEF2FF] border border-[#C7D2FE] flex items-center justify-center font-bold text-sm text-[#4F46E5]">
                    {ref.companyLogo}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-[#0F172A]">{ref.company}</h3>
                    <span className="text-[10px] text-[#64748B] block">{ref.referrerName} ({ref.referrerTitle})</span>
                  </div>
                </div>
                <Badge variant="emerald" className="font-mono text-[10px]">{ref.matchedScore}% Profile Match</Badge>
              </div>

              <div className="space-y-1.5 text-xs text-[#334155]">
                <span className="text-[10px] font-semibold text-[#94A3B8] uppercase block">Open Roles for Referral</span>
                <div className="flex flex-wrap gap-1">
                  {ref.openRoles?.map((r: string) => (
                    <span key={r} className="text-[10px] font-mono bg-[#F1F5F9] text-[#334155] px-1.5 py-0.2 rounded border border-[#E2E8F0]">
                      {r}
                    </span>
                  ))}
                </div>
              </div>

              <p className="text-[11px] text-[#64748B] bg-[#F8FAFC] p-2.5 rounded border border-[#E2E8F0]">
                <strong className="text-[#0F172A]">Requirement:</strong> {ref.requirements}
              </p>

              <div className="pt-2 flex items-center justify-between">
                <span className="text-[11px] text-[#047857] font-semibold">{ref.spotsLeft} Referral Spots Left</span>
                <Button size="sm" onClick={() => requestReferral(ref.company, ref.referrerName)} className="h-7 text-[11px] bg-[#10B981] hover:bg-[#059669] text-white">
                  Request Referral <Send className="w-3 h-3" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* TAB 3: IDEA & MARKET GAP POSTS */}
      {activeTab === 'market_gaps' && (
        <div className="space-y-4">
          {marketGaps.map((gap) => (
            <Card key={gap.id} className="ag-card p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-[#B45309]" />
                  <h3 className="font-bold text-sm text-[#0F172A]">{gap.title}</h3>
                </div>
                <Badge variant="amber" className="font-mono text-[10px]">{gap.status}</Badge>
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-[8px] bg-[#FFFBEB] border border-[#FDE68A] text-[#B45309] space-y-1">
                  <span className="font-bold text-[11px] uppercase font-mono block">Identified Market Pain Point / Gap:</span>
                  <p>{gap.painPoint}</p>
                </div>

                {gap.suggestedSaasSolution && (
                  <div className="p-3 rounded-[8px] bg-[#EEF2FF] border border-[#C7D2FE] text-[#4338CA] space-y-1">
                    <span className="font-bold text-[11px] uppercase font-mono block">Suggested SaaS Product Solution:</span>
                    <p>{gap.suggestedSaasSolution}</p>
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-[#F1F5F9] flex items-center justify-between text-xs text-[#64748B]">
                <span>Posted by {gap.author} • {gap.timestamp}</span>
                <button className="flex items-center gap-1.5 text-[#4F46E5] font-semibold hover:underline cursor-pointer">
                  <ThumbsUp className="w-3.5 h-3.5" /> {gap.upvotes} Interested
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create New Post Modal */}
      {showNewPostModal && (
        <Portal>
          <div className="fixed inset-0 ag-overlay z-50 flex items-center justify-center p-4" onClick={() => setShowNewPostModal(false)}>
            <div className="bg-white border border-[#E2E8F0] rounded-[14px] w-full max-w-lg p-5 space-y-4 shadow-2xl slide-up" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-start">
                <h3 className="text-base font-bold text-[#0F172A]">Create Community Post / Market Gap</h3>
                <button onClick={() => setShowNewPostModal(false)} className="p-1 text-[#94A3B8] hover:text-[#0F172A] rounded hover:bg-[#F1F5F9]">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-[10px] font-semibold text-[#64748B] uppercase block mb-1.5">Post Category Type</label>
                  <select value={postType} onChange={(e) => setPostType(e.target.value as any)} className="ag-input w-full">
                    <option value="discussion">Developer Discussion / Interview Exp</option>
                    <option value="market_gap">New Software Market Gap / SaaS Idea</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-semibold text-[#64748B] uppercase block mb-1.5">Post Title</label>
                  <input
                    type="text"
                    value={postTitle}
                    onChange={(e) => setPostTitle(e.target.value)}
                    placeholder="e.g. Razorpay SDE 1 Round 2 Experience..."
                    className="ag-input w-full"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-semibold text-[#64748B] uppercase block mb-1.5">Content Details</label>
                  <textarea
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                    placeholder="Share interview questions, system architecture notes, or software market gaps..."
                    className="ag-input w-full h-32 resize-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => setShowNewPostModal(false)}>Cancel</Button>
                <Button size="sm" onClick={handleCreatePost}>Publish Post</Button>
              </div>
            </div>
          </div>
        </Portal>
      )}
    </div>
  );
}

export default function NetworkingHubPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-[#64748B]">Loading Networking Hub...</div>}>
      <NetworkingHubContent />
    </Suspense>
  );
}
