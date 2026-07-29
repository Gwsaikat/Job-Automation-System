'use client';
import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Kanban,
  Plus,
  Building,
  MessageSquare,
  X,
  GripVertical,
} from 'lucide-react';
import { Portal } from '@/components/portal';

const STAGES = [
  { id: 'Applied', title: 'Applied', color: 'border-l-[#4F46E5]', dot: '#4F46E5', bg: 'bg-[#EEF2FF]' },
  { id: 'OA', title: 'OA / Assessment', color: 'border-l-[#6366F1]', dot: '#6366F1', bg: 'bg-[#EEF2FF]' },
  { id: 'Interview', title: 'Interview', color: 'border-l-[#F59E0B]', dot: '#F59E0B', bg: 'bg-[#FFFBEB]' },
  { id: 'Offer', title: 'Offer', color: 'border-l-[#10B981]', dot: '#10B981', bg: 'bg-[#ECFDF5]' },
  { id: 'Rejected', title: 'Rejected', color: 'border-l-[#E11D48]', dot: '#E11D48', bg: 'bg-[#FFF1F2]' },
  { id: 'Archive', title: 'Archive', color: 'border-l-[#64748B]', dot: '#64748B', bg: 'bg-[#F1F5F9]' },
];

export default function ApplicationsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<any | null>(null);
  const [notesInput, setNotesInput] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCompany, setNewCompany] = useState('');
  const [newStage, setNewStage] = useState('Applied');

  // Drag and drop state
  const [draggedJobId, setDraggedJobId] = useState<number | null>(null);
  const [dragOverStage, setDragOverStage] = useState<string | null>(null);

  const fetchJobs = () => {
    setLoading(true);
    fetch('/api/jobs?limit=150')
      .then((res) => res.json())
      .then((data) => {
        setJobs(data.jobs || []);
        setLoading(false);
      });
  };

  useEffect(() => { fetchJobs(); }, []);

  const moveStage = async (id: number, newStage: string) => {
    setJobs((prev) => prev.map((j) => (j.id === id ? { ...j, applicationStatus: newStage } : j)));
    await fetch('/api/jobs', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, applicationStatus: newStage }),
    });
  };

  const handleDragStart = (e: React.DragEvent, id: number) => {
    setDraggedJobId(id);
    e.dataTransfer.setData('text/plain', id.toString());
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, stageId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverStage !== stageId) {
      setDragOverStage(stageId);
    }
  };

  const handleDragLeave = () => {
    setDragOverStage(null);
  };

  const handleDrop = async (e: React.DragEvent, targetStageId: string) => {
    e.preventDefault();
    setDragOverStage(null);
    const idStr = e.dataTransfer.getData('text/plain');
    const id = Number(idStr) || draggedJobId;
    if (id) {
      await moveStage(id, targetStageId);
      setDraggedJobId(null);
    }
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
    await fetch('/api/jobs/manual-paste', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jobTitle: newTitle,
        company: newCompany,
        location: 'Remote',
        jobDescription: `Manual application logged into stage ${newStage}`,
        jobUrl: `https://${newCompany.toLowerCase().replace(/\s+/g, '')}.com/careers`,
      }),
    });
    setShowAddModal(false);
    setNewTitle('');
    setNewCompany('');
    fetchJobs();
  };

  // Mobile column filter state
  const [mobileStage, setMobileStage] = useState<string>('ALL');

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-5 page-fade">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0F172A] flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[8px] bg-[#ECFEFF] border border-[#A5F3FC] flex items-center justify-center">
              <Kanban className="w-4 h-4 text-[#0891B2]" />
            </div>
            Applications Drag & Drop Kanban
          </h1>
          <p className="text-[13px] text-[#64748B] mt-0.5">
            Drag cards between columns to update pipeline status instantly.
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)} size="sm" className="h-9 px-4 text-xs font-semibold gap-1.5 rounded-[8px] bg-[#4F46E5] text-white hover:bg-[#4338CA]">
          <Plus className="w-4 h-4" /> Log Application
        </Button>
      </div>

      {/* Mobile Stage Filter Bar (visible md:hidden) */}
      <div className="md:hidden flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none border-b border-[#E2E8F0]">
        <button
          onClick={() => setMobileStage('ALL')}
          className={`px-3 py-1 rounded-[6px] text-xs font-semibold whitespace-nowrap transition-all ${
            mobileStage === 'ALL'
              ? 'bg-[#0F172A] text-white shadow-xs'
              : 'bg-white border border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A]'
          }`}
        >
          All Stages ({jobs.length})
        </button>
        {STAGES.map((stg) => {
          const cnt = jobs.filter((j) => (j.applicationStatus || 'Applied') === stg.id).length;
          return (
            <button
              key={stg.id}
              onClick={() => setMobileStage(stg.id)}
              className={`px-3 py-1 rounded-[6px] text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                mobileStage === stg.id
                  ? 'bg-[#4F46E5] text-white shadow-xs'
                  : 'bg-white border border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: stg.dot }} />
              {stg.title} ({cnt})
            </button>
          );
        })}
      </div>

      {/* Drag & Drop Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3 overflow-x-auto min-h-[600px] pb-4">
        {STAGES.filter((stg) => mobileStage === 'ALL' || mobileStage === stg.id).map((stage) => {
          const stageJobs = jobs.filter((j) => (j.applicationStatus || 'Applied') === stage.id);
          const isOver = dragOverStage === stage.id;

          return (
            <div
              key={stage.id}
              onDragOver={(e) => handleDragOver(e, stage.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, stage.id)}
              className={`flex flex-col space-y-2 p-2.5 rounded-[12px] border transition-all duration-150 min-w-[180px] ${
                isOver
                  ? 'bg-[#EEF2FF] border-[#4F46E5] ring-2 ring-[#4F46E5]/20 shadow-md'
                  : 'bg-[#F8FAFC] border-[#E2E8F0]'
              }`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between px-1 py-1">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: stage.dot }} />
                  <span className="font-bold text-[12px] text-[#0F172A]">{stage.title}</span>
                </div>
                <span className="text-[10px] font-mono text-[#64748B] bg-white px-1.5 py-0.5 rounded-[4px] border border-[#E2E8F0] font-bold">
                  {stageJobs.length}
                </span>
              </div>

              {/* Column Drop Area */}
              <div className="flex-1 space-y-2 overflow-y-auto max-h-[560px] pr-0.5">
                {stageJobs.map((job) => (
                  <div
                    key={job.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, job.id)}
                    className="cursor-grab active:cursor-grabbing group"
                  >
                    <Card className={`ag-card p-3 space-y-2 border-l-3 ${stage.color} hover:shadow-md transition-all group-hover:border-[#CBD5E1]`}>
                      <div className="flex items-start justify-between">
                        <h4 className="font-bold text-[12px] text-[#0F172A] truncate pr-1 flex-1">{job.jobTitle}</h4>
                        <GripVertical className="hidden md:block w-3.5 h-3.5 text-[#CBD5E1] group-hover:text-[#64748B] shrink-0" />
                      </div>
                      <div className="text-[11px] text-[#64748B] flex items-center gap-1 truncate">
                        <Building className="w-3 h-3 text-[#94A3B8]" />
                        <span className="truncate">{job.company}</span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-[#64748B] pt-0.5">
                        <span>{job.locationType || 'Remote'}</span>
                        {job.overallScore && <span className="text-[#4F46E5] font-mono font-semibold">{job.overallScore}%</span>}
                      </div>

                      {/* Mobile Stage Quick Switch Dropdown */}
                      <div className="md:hidden pt-1.5 border-t border-[#F1F5F9] flex items-center justify-between gap-1">
                        <span className="text-[10px] text-[#64748B] font-medium">Move Stage:</span>
                        <select
                          value={job.applicationStatus || 'Applied'}
                          onChange={(e) => moveStage(job.id, e.target.value)}
                          className="text-[10px] font-semibold bg-[#F8FAFC] border border-[#E2E8F0] rounded-[5px] px-2 py-1 text-[#0F172A] focus:outline-none"
                        >
                          {STAGES.map((s) => (
                            <option key={s.id} value={s.id}>{s.title}</option>
                          ))}
                        </select>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-[#F1F5F9] text-[10px]">
                        <button onClick={() => openNotes(job)} className="text-[#64748B] hover:text-[#0F172A] flex items-center gap-1 font-medium transition-colors cursor-pointer">
                          <MessageSquare className="w-3 h-3" /> Notes
                        </button>
                        <span className="text-[9px] font-mono text-[#94A3B8]">Drag to move</span>
                      </div>
                    </Card>
                  </div>
                ))}

                {stageJobs.length === 0 && !loading && (
                  <div className="text-center py-8 text-[11px] text-[#94A3B8] border border-dashed border-[#CBD5E1] rounded-[8px]">
                    Drag cards here
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Application Modal */}
      {showAddModal && (
        <Portal>
          <div className="fixed inset-0 ag-overlay z-50 flex items-center justify-center p-4" onClick={() => setShowAddModal(false)}>
            <div className="bg-white border border-[#E2E8F0] rounded-[14px] w-full max-w-md p-5 space-y-4 shadow-2xl slide-up" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-start">
                <h3 className="text-[15px] font-bold text-[#0F172A]">Log Application</h3>
                <button onClick={() => setShowAddModal(false)} className="p-1 text-[#94A3B8] hover:text-[#0F172A] rounded-[6px] hover:bg-[#F1F5F9] transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-3 text-[12px]">
                <div>
                  <label className="text-[10px] font-semibold text-[#64748B] uppercase block mb-1.5">Job Title</label>
                  <input type="text" placeholder="e.g. SDE 1 / Frontend Developer" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} className="ag-input w-full" />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-[#64748B] uppercase block mb-1.5">Company Name</label>
                  <input type="text" placeholder="e.g. Razorpay / CRED" value={newCompany} onChange={(e) => setNewCompany(e.target.value)} className="ag-input w-full" />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-[#64748B] uppercase block mb-1.5">Pipeline Stage</label>
                  <select value={newStage} onChange={(e) => setNewStage(e.target.value)} className="ag-input w-full">
                    {STAGES.map((s) => (<option key={s.id} value={s.id}>{s.title}</option>))}
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => setShowAddModal(false)}>Cancel</Button>
                <Button size="sm" onClick={handleAddManualJob}>Log Application</Button>
              </div>
            </div>
          </div>
        </Portal>
      )}

      {/* Notes Modal */}
      {selectedJob && (
        <Portal>
          <div className="fixed inset-0 ag-overlay z-50 flex items-center justify-center p-4" onClick={() => setSelectedJob(null)}>
            <div className="bg-white border border-[#E2E8F0] rounded-[14px] w-full max-w-lg p-5 space-y-4 shadow-2xl slide-up" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-[15px] font-bold text-[#0F172A]">Notes</h3>
                  <p className="text-[12px] text-[#64748B]">{selectedJob.jobTitle} at {selectedJob.company}</p>
                </div>
                <button onClick={() => setSelectedJob(null)} className="p-1 text-[#94A3B8] hover:text-[#0F172A] rounded-[6px] hover:bg-[#F1F5F9] transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <textarea
                value={notesInput}
                onChange={(e) => setNotesInput(e.target.value)}
                placeholder="Log interview questions, recruiter feedback, follow-up dates..."
                className="ag-input w-full h-36 resize-none"
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => setSelectedJob(null)}>Cancel</Button>
                <Button size="sm" onClick={saveNotes} disabled={savingNotes}>
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
