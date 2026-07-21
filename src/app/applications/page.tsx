'use client';
import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Kanban,
  Plus,
  MoreHorizontal,
  Calendar,
  Building,
  ExternalLink,
  MessageSquare,
  FileText,
  Clock,
  Trash2,
  X,
} from 'lucide-react';
import { Portal } from '@/components/portal';

const STAGES = [
  { id: 'Applied', title: 'Applied', color: 'border-l-blue-500' },
  { id: 'OA', title: 'OA / Assessment', color: 'border-l-indigo-500' },
  { id: 'Interview', title: 'Interview', color: 'border-l-amber-500' },
  { id: 'Offer', title: 'Offer', color: 'border-l-emerald-500' },
  { id: 'Rejected', title: 'Rejected', color: 'border-l-rose-500' },
  { id: 'Archive', title: 'Archive', color: 'border-l-neutral-600' },
];

export default function ApplicationsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<any | null>(null);
  const [notesInput, setNotesInput] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);

  // Manual Add Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCompany, setNewCompany] = useState('');
  const [newStage, setNewStage] = useState('Applied');
  const [newLocation, setNewLocation] = useState('Remote');

  const fetchJobs = () => {
    setLoading(true);
    fetch('/api/jobs?limit=150')
      .then((res) => res.json())
      .then((data) => {
        setJobs(data.jobs || []);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const moveStage = async (id: number, newStage: string) => {
    setJobs((prev) =>
      prev.map((j) => (j.id === id ? { ...j, applicationStatus: newStage } : j))
    );

    await fetch('/api/jobs', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, applicationStatus: newStage }),
    });
  };

  const openNotes = (job: any) => {
    setSelectedJob(job);
    setNotesInput(job.notes || '');
  };

  const saveNotes = async () => {
    if (!selectedJob) return;
    setSavingNotes(true);
    await fetch('/api/jobs', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: selectedJob.id, notes: notesInput }),
    });
    setSavingNotes(false);
    setSelectedJob(null);
    fetchJobs();
  };

  const handleAddManualJob = async () => {
    if (!newTitle.trim() || !newCompany.trim()) return;
    
    // Create job via manual paste API endpoint
    await fetch('/api/jobs/manual-paste', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jobTitle: newTitle,
        company: newCompany,
        location: newLocation,
        jobDescription: `Manual application logged into stage ${newStage}`,
        jobUrl: `https://${newCompany.toLowerCase().replace(/\s+/g, '')}.com/careers`,
      }),
    });

    setShowAddModal(false);
    setNewTitle('');
    setNewCompany('');
    fetchJobs();
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 page-fade relative">
      {/* Background Ambient Glow */}
      <div className="absolute top-10 left-1/4 w-80 h-80 bg-[#6366f1]/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4 relative z-10">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#FAFAFA] flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#6366f1]/10 flex items-center justify-center">
              <Kanban className="w-4 h-4 text-[#818cf8]" />
            </div>
            <span>Applications Tracker</span>
          </h1>
          <p className="text-sm text-[#A1A1AA] mt-0.5">
            Kanban pipeline tracking every application from staging to offer.
          </p>
        </div>

        <Button
          onClick={() => setShowAddModal(true)}
          className="h-8 px-3.5 text-xs bg-[#6366f1] hover:bg-[#4f46e5] text-white flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Log Application</span>
        </Button>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 overflow-x-auto min-h-[650px] pb-4 relative z-10">
        {STAGES.map((stage) => {
          const stageJobs = jobs.filter(
            (j) => (j.applicationStatus || 'Applied') === stage.id
          );

          return (
            <div key={stage.id} className="flex flex-col space-y-3 bg-[#111827] p-3 rounded-xl border border-[rgba(255,255,255,0.08)] min-w-[200px]">
              {/* Stage Header */}
              <div className="flex items-center justify-between px-1">
                <span className="font-semibold text-xs text-[#FAFAFA]">
                  {stage.title}
                </span>
                <span className="text-[11px] font-mono text-[#71717A] bg-[#18181B] px-2 py-0.5 rounded border border-[rgba(255,255,255,0.08)]">
                  {stageJobs.length}
                </span>
              </div>

              {/* Stage Column List */}
              <div className="flex-1 space-y-3 overflow-y-auto max-h-[600px] pr-0.5">
                {stageJobs.map((job) => (
                  <Card
                    key={job.id}
                    className={`ag-card p-3 space-y-2 border-l-2 ${stage.color} relative group`}
                  >
                    <div className="flex items-start justify-between gap-1">
                      <h4 className="font-semibold text-xs text-[#FAFAFA] truncate">
                        {job.jobTitle}
                      </h4>
                    </div>

                    <div className="text-[11px] text-[#A1A1AA] flex items-center gap-1 truncate">
                      <Building className="w-3 h-3 text-[#71717A]" />
                      <span className="truncate">{job.company}</span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-[#71717A] pt-1">
                      <span>{job.locationType || 'Remote'}</span>
                      {job.overallScore && (
                        <span className="text-[#818cf8] font-mono">
                          {job.overallScore}%
                        </span>
                      )}
                    </div>

                    {/* Stage shift actions */}
                    <div className="flex items-center justify-between pt-2 border-t border-[rgba(255,255,255,0.08)] text-[10px]">
                      <button
                        onClick={() => openNotes(job)}
                        className="text-[#71717A] hover:text-[#FAFAFA] flex items-center gap-1 transition-colors"
                      >
                        <MessageSquare className="w-3 h-3" /> Notes
                      </button>

                      {/* Stage selector dropdown */}
                      <select
                        value={job.applicationStatus || 'Applied'}
                        onChange={(e) => moveStage(job.id, e.target.value)}
                        className="bg-[#09090B] border border-[rgba(255,255,255,0.08)] text-[#A1A1AA] text-[10px] rounded px-1.5 py-0.5 outline-none cursor-pointer"
                      >
                        {STAGES.map((s) => (
                          <option key={s.id} value={s.id}>
                            Move to {s.title}
                          </option>
                        ))}
                      </select>
                    </div>
                  </Card>
                ))}

                {stageJobs.length === 0 && !loading && (
                  <div className="text-center py-8 text-[11px] text-[#71717A] border border-dashed border-[rgba(255,255,255,0.05)] rounded-lg">
                    Empty
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Manual Application Log Modal */}
      {showAddModal && (
        <Portal>
          <div className="fixed inset-0 bg-[#09090B]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 page-fade">
            <div className="bg-[#111827] border border-[rgba(255,255,255,0.08)] rounded-xl w-full max-w-md p-6 space-y-4 shadow-xl">
              <div className="flex justify-between items-start">
                <h3 className="text-base font-semibold text-[#FAFAFA]">Log Application</h3>
                <button onClick={() => setShowAddModal(false)} className="text-[#71717A] hover:text-[#FAFAFA]">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-[#71717A] uppercase font-mono text-[10px] block mb-1">Job Title</label>
                  <input
                    type="text"
                    placeholder="e.g. SDE 1 / Frontend Developer"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full bg-[#18181B] border border-[rgba(255,255,255,0.08)] rounded-lg p-2.5 text-xs text-[#FAFAFA] outline-none"
                  />
                </div>

                <div>
                  <label className="text-[#71717A] uppercase font-mono text-[10px] block mb-1">Company Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Razorpay / CRED"
                    value={newCompany}
                    onChange={(e) => setNewCompany(e.target.value)}
                    className="w-full bg-[#18181B] border border-[rgba(255,255,255,0.08)] rounded-lg p-2.5 text-xs text-[#FAFAFA] outline-none"
                  />
                </div>

                <div>
                  <label className="text-[#71717A] uppercase font-mono text-[10px] block mb-1">Pipeline Stage</label>
                  <select
                    value={newStage}
                    onChange={(e) => setNewStage(e.target.value)}
                    className="w-full bg-[#18181B] border border-[rgba(255,255,255,0.08)] rounded-lg p-2 text-xs text-[#FAFAFA] outline-none"
                  >
                    {STAGES.map((s) => (
                      <option key={s.id} value={s.id}>{s.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => setShowAddModal(false)} className="h-8 text-xs bg-[#18181B] text-[#A1A1AA] border-[rgba(255,255,255,0.08)]">
                  Cancel
                </Button>
                <Button size="sm" onClick={handleAddManualJob} className="h-8 text-xs bg-[#6366f1] hover:bg-[#4f46e5] text-white">
                  Log Application
                </Button>
              </div>
            </div>
          </div>
        </Portal>
      )}

      {/* Notes Modal / Drawer */}
      {selectedJob && (
        <Portal>
          <div className="fixed inset-0 bg-[#09090B]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#111827] border border-[rgba(255,255,255,0.08)] rounded-xl w-full max-w-lg p-6 space-y-4 shadow-xl">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-base font-semibold text-[#FAFAFA]">
                    Interview & Application Notes
                  </h3>
                  <p className="text-xs text-[#A1A1AA]">
                    {selectedJob.jobTitle} at {selectedJob.company}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedJob(null)}
                  className="text-[#71717A] hover:text-[#FAFAFA] text-sm font-bold"
                >
                  ✕
                </button>
              </div>

              <textarea
                value={notesInput}
                onChange={(e) => setNotesInput(e.target.value)}
                placeholder="Log interview questions, recruiter feedback, follow-up dates..."
                className="w-full h-40 bg-[#18181B] border border-[rgba(255,255,255,0.08)] rounded-lg p-3 text-xs text-[#FAFAFA] focus:outline-none focus:border-[#6366f1] resize-none"
              />

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedJob(null)}
                  className="h-8 text-xs bg-[#18181B] text-[#A1A1AA] border-[rgba(255,255,255,0.08)]"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={saveNotes}
                  disabled={savingNotes}
                  className="h-8 text-xs bg-[#6366f1] hover:bg-[#4f46e5] text-[#FAFAFA]"
                >
                  {savingNotes ? 'Saving...' : 'Save Notes'}
                </Button>
              </div>
            </div>
          </div>
        </Portal>
      )}
    </div>
  );
}
