'use client';

import { useState } from 'react';
import { Cpu, FileText, Search, ShieldCheck, GitBranch, CheckCircle2, AlertTriangle, XCircle, Terminal, Play, Check } from 'lucide-react';

interface N8nNodeProps {
  id: string;
  title: string;
  subtitle: string;
  icon: any;
  status: 'idle' | 'running' | 'success' | 'warning' | 'error';
  active: boolean;
  score?: number;
  outputSummary?: string;
  onClick: () => void;
}

function N8nNode({ id, title, subtitle, icon: Icon, status, active, score, outputSummary, onClick }: N8nNodeProps) {
  const getStatusBadge = () => {
    switch (status) {
      case 'running':
        return <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-mono bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A] animate-pulse"><Play className="w-2.5 h-2.5 fill-current" /> Running</span>;
      case 'success':
        return <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-mono bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0]"><Check className="w-2.5 h-2.5" /> Executed</span>;
      case 'warning':
        return <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-mono bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A]">Queued</span>;
      case 'error':
        return <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-mono bg-[#FEF2F2] text-[#DC2626] border border-[#FCA5A5]">Rejected</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-mono bg-[#F1F5F9] text-[#64748B] border border-[#E2E8F0]">Idle</span>;
    }
  };

  return (
    <div
      onClick={onClick}
      className={`relative w-full md:w-56 rounded-[12px] bg-[#FFFFFF] border transition-all cursor-pointer shadow-sm hover:shadow-md ${
        active ? 'border-[#4F46E5] ring-2 ring-[#4F46E5]/20 scale-[1.02]' : 'border-[#E2E8F0] hover:border-[#CBD5E1]'
      }`}
    >
      {/* Input Port Handle (Left) */}
      <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#3B82F6] border-2 border-white shadow-xs z-10" />

      {/* Output Port Handle (Right) */}
      <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#10B981] border-2 border-white shadow-xs z-10" />

      {/* Node Header */}
      <div className="p-3 border-b border-[#F1F5F9] flex items-center justify-between bg-linear-to-r from-[#F8FAFC] to-[#FFFFFF] rounded-t-[11px]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-[8px] bg-[#EEF2FF] border border-[#C7D2FE] flex items-center justify-center">
            <Icon className="w-3.5 h-3.5 text-[#4F46E5]" />
          </div>
          <div>
            <div className="text-xs font-bold text-[#0F172A] leading-tight">{title}</div>
            <div className="text-[10px] text-[#64748B]">{subtitle}</div>
          </div>
        </div>
      </div>

      {/* Node Body */}
      <div className="p-3 space-y-2 text-[11px]">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-[#64748B]">Node Status</span>
          {getStatusBadge()}
        </div>

        {score !== undefined && (
          <div className="flex items-center justify-between pt-1 border-t border-[#F8FAFC]">
            <span className="text-[10px] text-[#64748B]">Confidence Score</span>
            <span className="font-mono font-bold text-[#047857]">{score}%</span>
          </div>
        )}

        {outputSummary && (
          <div className="text-[10px] text-[#475569] bg-[#F8FAFC] p-1.5 rounded border border-[#E2E8F0] font-mono truncate">
            {outputSummary}
          </div>
        )}
      </div>
    </div>
  );
}

interface N8nWorkflowGraphProps {
  step: number;
  simulating: boolean;
  atsSystem: string;
  targetRole: string;
  result: any;
}

export function N8nWorkflowGraph({ step, simulating, atsSystem, targetRole, result }: N8nWorkflowGraphProps) {
  const [selectedNode, setSelectedNode] = useState<string>('node1');

  const nodes = [
    {
      id: 'node1',
      title: 'PDF & Text Parser',
      subtitle: `${atsSystem.toUpperCase()} OCR Module`,
      icon: FileText,
      status: step >= 1 ? 'success' : 'idle',
      score: result ? 98 : undefined,
      outputSummary: 'Resume layout & text extracted',
      details: 'Converts unstructured PDF/LaTeX into standardized plaintext. Validates document flow without multi-column parsing errors.',
    },
    {
      id: 'node2',
      title: 'Taxonomy Matcher',
      subtitle: 'Skill & Keyword Scanner',
      icon: Search,
      status: step >= 2 ? 'success' : 'idle',
      score: result ? 96 : undefined,
      outputSummary: `${targetRole} taxonomy scanned`,
      details: 'Cross-references developer experience against target role requirements (DSA, Node.js, React, Architecture, SQL).',
    },
    {
      id: 'node3',
      title: 'Gate & Filter Engine',
      subtitle: 'Rules & Criteria Guard',
      icon: ShieldCheck,
      status: step >= 3 ? 'success' : 'idle',
      score: result ? 95 : undefined,
      outputSummary: 'Visa & Location gates passed',
      details: 'Verifies strict knock-out questions: Work Authorization, Citizenship, Years of Experience, and Degree Level.',
    },
    {
      id: 'node4',
      title: 'Decision Router',
      subtitle: '3-Bucket Classifier',
      icon: GitBranch,
      status: step >= 4 ? 'success' : 'idle',
      score: result ? result.overallScore : undefined,
      outputSummary: result ? `Bucket: ${result.category.toUpperCase()}` : 'Awaiting classification',
      details: 'Directs candidate to Shortlisted, On-Queued, or Rejected queue based on aggregated threshold confidence score.',
    },
  ];

  const currentNode = nodes.find((n) => n.id === selectedNode) || nodes[0];

  return (
    <div className="space-y-4">
      {/* Visual Canvas Box */}
      <div className="relative p-6 bg-[#0F172A] rounded-[16px] border border-[#1E293B] overflow-x-auto shadow-xl text-white">
        {/* Top Controls Bar */}
        <div className="relative z-10 flex justify-between items-center mb-6 pb-4 border-b border-[#1E293B]">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#EF4444]" />
            <div className="w-3 h-3 rounded-full bg-[#F59E0B]" />
            <div className="w-3 h-3 rounded-full bg-[#10B981]" />
            <span className="text-xs font-mono text-[#94A3B8] ml-2">n8n Workflow Execution Graph — {atsSystem.toUpperCase()} Engine</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-[#38BDF8] bg-[#0284C7]/20 px-2 py-0.5 rounded border border-[#0369A1]">
              Target: {targetRole}
            </span>
          </div>
        </div>

        {/* Nodes Flow Container */}
        <div className="relative z-10 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-6 md:min-w-[900px] py-4">
          {nodes.map((node, index) => (
            <div key={node.id} className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
              <N8nNode
                id={node.id}
                title={node.title}
                subtitle={node.subtitle}
                icon={node.icon}
                status={node.status as any}
                active={selectedNode === node.id}
                score={node.score}
                outputSummary={node.outputSummary}
                onClick={() => setSelectedNode(node.id)}
              />

              {index < nodes.length - 1 && (
                <div className="flex items-center justify-center text-[#64748B]">
                  <div className={`w-2 h-2 rounded-full ${simulating ? 'bg-[#38BDF8] shadow-[0_0_8px_#38BDF8] animate-ping' : 'bg-[#475569]'}`} />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Classification Outcome Display (Output Nodes) */}
        {result && (
          <div className="relative z-10 mt-6 pt-4 border-t border-[#1E293B] grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`p-3 rounded-[10px] border transition-all ${result.category === 'shortlisted' ? 'bg-[#065F46]/30 border-[#10B981] ring-2 ring-[#10B981]/30' : 'bg-[#1E293B]/40 border-[#334155] opacity-50'}`}>
              <div className="flex items-center justify-between text-xs font-bold text-[#34D399]">
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> SHORTLISTED</span>
                <span className="font-mono">{result.category === 'shortlisted' ? `${result.overallScore}%` : '—'}</span>
              </div>
              <p className="text-[10px] text-[#94A3B8] mt-1">Directly fast-tracked to recruiter phone interview queue.</p>
            </div>

            <div className={`p-3 rounded-[10px] border transition-all ${result.category === 'on_queued' ? 'bg-[#92400E]/30 border-[#F59E0B] ring-2 ring-[#F59E0B]/30' : 'bg-[#1E293B]/40 border-[#334155] opacity-50'}`}>
              <div className="flex items-center justify-between text-xs font-bold text-[#FBBF24]">
                <span className="flex items-center gap-1.5"><AlertTriangle className="w-4 h-4" /> ON-QUEUED</span>
                <span className="font-mono">{result.category === 'on_queued' ? `${result.overallScore}%` : '—'}</span>
              </div>
              <p className="text-[10px] text-[#94A3B8] mt-1">Stored in secondary applicant pool for shortlist backup.</p>
            </div>

            <div className={`p-3 rounded-[10px] border transition-all ${result.category === 'rejected' ? 'bg-[#991B1B]/30 border-[#EF4444] ring-2 ring-[#EF4444]/30' : 'bg-[#1E293B]/40 border-[#334155] opacity-50'}`}>
              <div className="flex items-center justify-between text-xs font-bold text-[#F87171]">
                <span className="flex items-center gap-1.5"><XCircle className="w-4 h-4" /> REJECTED</span>
                <span className="font-mono">{result.category === 'rejected' ? `${result.overallScore}%` : '—'}</span>
              </div>
              <p className="text-[10px] text-[#94A3B8] mt-1">Filtered out by automated rule or insufficient score.</p>
            </div>
          </div>
        )}
      </div>

      {/* Node Details Inspector Box */}
      <div className="p-4 bg-[#FFFFFF] rounded-[12px] border border-[#E2E8F0] shadow-xs flex items-start gap-3">
        <div className="w-8 h-8 rounded-[8px] bg-[#EEF2FF] border border-[#C7D2FE] flex items-center justify-center shrink-0 mt-0.5">
          <Terminal className="w-4 h-4 text-[#4F46E5]" />
        </div>
        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-xs text-[#0F172A]">{currentNode.title} Inspector</h4>
            <span className="text-[10px] font-mono text-[#64748B]">Click any node above to inspect its execution specs</span>
          </div>
          <p className="text-xs text-[#475569] leading-relaxed">{currentNode.details}</p>
        </div>
      </div>
    </div>
  );
}
