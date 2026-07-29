'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  FileCheck,
  Zap,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Sparkles,
  Layers,
  ArrowRight,
  RefreshCw,
  Eye,
  Sliders,
  ShieldAlert,
  Cpu,
  FileText,
} from 'lucide-react';

import { N8nWorkflowGraph } from '@/components/n8n-workflow-graph';

export default function AtsSimulatorPage() {
  const [atsSystem, setAtsSystem] = useState<'greenhouse' | 'lever' | 'workday' | 'taleo' | 'ashby'>('greenhouse');
  const [targetRole, setTargetRole] = useState('Full Stack Developer');
  const [simulating, setSimulating] = useState(false);
  const [simStep, setSimStep] = useState<number>(0);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [customResume, setCustomResume] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);
    setValidationError(null);
    setAnalysisResult(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const rawText = (event.target?.result as string) || '';
      
      // Extract clean text tokens if PDF binary
      let extracted = rawText;
      if (rawText.startsWith('%PDF')) {
        const textMatches: string[] = [];
        const parensRegex = /\(([^()]{2,})\)/g;
        let match;
        while ((match = parensRegex.exec(rawText)) !== null) {
          const str = match[1].replace(/\\./g, '').trim();
          if (str.length > 2 && /^[a-zA-Z0-9\s.,@:/\-+_#&()]+$/.test(str)) {
            textMatches.push(str);
          }
        }
        const asciiWords = rawText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}|[a-zA-Z]{3,}/g) || [];
        extracted = [...textMatches, ...asciiWords.slice(0, 300)].join(' ');
      }
      setCustomResume(extracted);
    };
    reader.readAsText(file);
  };

  const runSimulation = async () => {
    setSimulating(true);
    setValidationError(null);
    setSimStep(1);

    // Step 1: Text Extraction & OCR
    await new Promise((r) => setTimeout(r, 500));
    setSimStep(2);

    // Step 2: Bounding Box & Schema Mapping
    await new Promise((r) => setTimeout(r, 600));
    setSimStep(3);

    // Step 3: Scoring & Classification Engine
    await new Promise((r) => setTimeout(r, 500));
    setSimStep(4);

    try {
      const res = await fetch('/api/ats-simulator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeText: customResume,
          fileName: uploadedFileName,
          atsSystem,
          targetRole,
        }),
      });
      const data = await res.json();
      if (!res.ok || data.isValidResume === false) {
        setValidationError(data.error || 'Uploaded file is not a valid professional resume/CV.');
        setAnalysisResult(null);
      } else {
        setAnalysisResult(data);
      }
    } catch {
      setValidationError('Simulation error. Please check uploaded file format.');
    } finally {
      setSimulating(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 page-fade">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0F172A] flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[8px] bg-[#EEF2FF] border border-[#C7D2FE] flex items-center justify-center">
              <FileCheck className="w-4 h-4 text-[#4F46E5]" />
            </div>
            Enterprise ATS Parsing Simulator
          </h1>
          <p className="text-[13px] text-[#64748B] mt-0.5">
            Visual bounding box verification & automated classification into Shortlisted, On-Queued, or Rejected buckets.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="indigo" className="font-mono text-[11px]">
            Visual Graph Active
          </Badge>
        </div>
      </div>

      {/* Control Panel Bar */}
      <Card className="ag-card p-4 grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-3 items-end">
        <div>
          <label className="text-[10px] font-semibold text-[#64748B] uppercase block mb-1.5">Target Enterprise ATS Software</label>
          <select
            value={atsSystem}
            onChange={(e) => setAtsSystem(e.target.value as any)}
            className="ag-input w-full text-xs font-semibold py-1.5"
          >
            <option value="greenhouse">Greenhouse ATS Parsing Engine</option>
            <option value="lever">Lever Job Portal Parser</option>
            <option value="workday">Workday Enterprise Scanner</option>
            <option value="taleo">Oracle Taleo Classic Parser</option>
            <option value="ashby">AshbyHQ Modern ATS Scanner</option>
          </select>
        </div>

        <div>
          <label className="text-[10px] font-semibold text-[#64748B] uppercase block mb-1.5">Target Job Role</label>
          <input
            type="text"
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            placeholder="e.g. SDE 1 / Full Stack Developer"
            className="ag-input w-full text-xs font-semibold py-1.5"
          />
        </div>

        <div>
          <label className="text-[10px] font-semibold text-[#64748B] uppercase block mb-1.5">CV Source / Upload File</label>
          <div className="relative flex items-center">
            <input
              type="file"
              accept=".pdf,.txt,.md,.tex,.doc,.docx"
              onChange={handleFileUpload}
              className="hidden"
              id="ats-cv-upload"
            />
            <label
              htmlFor="ats-cv-upload"
              className="ag-input py-1.5 px-2.5 w-full text-xs cursor-pointer flex items-center justify-between font-semibold bg-[#F8FAFC] hover:bg-[#F1F5F9] border-[#CBD5E1] text-[#0F172A] truncate"
            >
              <span className="truncate">{uploadedFileName || 'Saikat_Maji_Master_CV.tex (Click to upload PDF/text)'}</span>
              <FileText className="w-3.5 h-3.5 text-[#4F46E5] shrink-0 ml-1" />
            </label>
          </div>
        </div>

        <div>
          <Button
            onClick={runSimulation}
            disabled={simulating}
            className="w-full h-9 text-xs bg-[#4F46E5] hover:bg-[#4338CA] text-white font-bold gap-2 cursor-pointer"
          >
            <Zap className={`w-3.5 h-3.5 ${simulating ? 'animate-spin' : ''}`} />
            {simulating ? 'Processing ATS Graph...' : 'Run ATS Scanner Simulation'}
          </Button>
        </div>
      </Card>

      {/* Hidden Resume Validation Check Failure Alert */}
      {validationError && (
        <Card className="ag-card p-4 border-2 border-[#EF4444] bg-[#FEF2F2] flex items-start gap-3 text-xs text-[#991B1B]">
          <AlertTriangle className="w-5 h-5 text-[#DC2626] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold text-sm text-[#991B1B]">ATS Validation Error — Invalid Document Format</h4>
            <p className="text-[12px] text-[#7F1D1D] leading-relaxed">{validationError}</p>
            <p className="text-[10px] text-[#991B1B] font-mono pt-1">
              Hidden Resume Guard Flagged: Uploaded file missing mandatory sections (Experience, Education, Skills, or Contact details).
            </p>
          </div>
        </Card>
      )}

      {/* Interactive n8n-Style Workflow Graph */}
      <N8nWorkflowGraph
        step={simStep}
        simulating={simulating}
        atsSystem={atsSystem}
        targetRole={targetRole}
        result={analysisResult}
      />

      {/* Main Simulation Output Results */}
      {analysisResult && (
        <div className="space-y-6 slide-up">
          {/* 3 Categories Classification Bucket Display */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Category 1: Shortlisted */}
            <Card className={`ag-card p-5 space-y-3 border-2 ${
              analysisResult.category === 'shortlisted' ? 'border-[#10B981] bg-[#ECFDF5]/40 shadow-md' : 'opacity-60'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-[#10B981]" />
                  <h3 className="font-bold text-base text-[#0F172A]">Shortlisted Bucket</h3>
                </div>
                {analysisResult.category === 'shortlisted' && (
                  <Badge variant="emerald" className="font-mono text-[10px]">ACTIVE RESULT</Badge>
                )}
              </div>
              <p className="text-xs text-[#334155] leading-relaxed">
                Fast-tracked directly to human recruiter review. Score 85%+ with zero structural table/column errors.
              </p>
              <div className="pt-2 font-mono text-xs font-bold text-[#047857]">
                Status: FAST-TRACKED TO RECRUITER
              </div>
            </Card>

            {/* Category 2: On-Queued */}
            <Card className={`ag-card p-5 space-y-3 border-2 ${
              analysisResult.category === 'on_queued' ? 'border-[#F59E0B] bg-[#FFFBEB]/40 shadow-md' : 'opacity-60'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-[#F59E0B]" />
                  <h3 className="font-bold text-base text-[#0F172A]">On-Queued Bucket</h3>
                </div>
                {analysisResult.category === 'on_queued' && (
                  <Badge variant="amber" className="font-mono text-[10px]">ACTIVE RESULT</Badge>
                )}
              </div>
              <p className="text-xs text-[#334155] leading-relaxed">
                Candidate backup queue (70-84% score). Will be shortlisted if primary candidate pool is underfilled.
              </p>
              <div className="pt-2 font-mono text-xs font-bold text-[#B45309]">
                Status: BACKUP RECRUITER QUEUE
              </div>
            </Card>

            {/* Category 3: Rejected */}
            <Card className={`ag-card p-5 space-y-3 border-2 ${
              analysisResult.category === 'rejected' ? 'border-[#E11D48] bg-[#FFF1F2]/40 shadow-md' : 'opacity-60'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-[#E11D48]" />
                  <h3 className="font-bold text-base text-[#0F172A]">Rejected Bucket</h3>
                </div>
                {analysisResult.category === 'rejected' && (
                  <Badge variant="rose" className="font-mono text-[10px]">ACTIVE RESULT</Badge>
                )}
              </div>
              <p className="text-xs text-[#334155] leading-relaxed">
                Filtered out by automated ATS rules (&lt;70% match score, missing mandatory degree/skills, or table parsing error).
              </p>
              <div className="pt-2 font-mono text-xs font-bold text-[#BE123C]">
                Status: AUTOMATED REJECTION
              </div>
            </Card>
          </div>

          {/* Visual ATS Bounding Box Verification Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Bounding Box Parsed Fields */}
            <div className="lg:col-span-2 space-y-4">
              <Card className="ag-card p-5 space-y-4">
                <h3 className="font-bold text-xs text-[#0F172A] uppercase tracking-wider flex items-center gap-2">
                  <Eye className="w-4 h-4 text-[#4F46E5]" />
                  Visual ATS Bounding Box Field Parsing Breakdown
                </h3>

                <div className="space-y-3">
                  {analysisResult.sections?.map((sec: any, idx: number) => (
                    <div key={idx} className="p-3.5 rounded-[8px] bg-[#F8FAFC] border border-[#E2E8F0] space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-[#047857]" />
                          <span className="font-bold text-[#0F172A] text-xs">{sec.name}</span>
                        </div>
                        <span className="ag-badge-green font-mono text-[10px]">{sec.confidence}% Confidence</span>
                      </div>
                      <p className="text-[11px] font-mono text-[#334155] bg-white p-2 rounded border border-[#E2E8F0]">
                        {sec.extractedText}
                      </p>
                      <p className="text-[10px] text-[#64748B] italic">{sec.feedback}</p>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Right Col: Detailed Actionable Improvement Feedback */}
            <div className="space-y-4">
              <Card className="ag-card p-5 space-y-4">
                <h3 className="font-bold text-xs text-[#0F172A] uppercase tracking-wider flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-[#B45309]" />
                  Actionable ATS Optimization Fixes
                </h3>

                <div className="space-y-3 text-xs">
                  <div>
                    <span className="text-[10px] font-semibold text-[#64748B] uppercase block mb-1">Target Role Missing Keywords</span>
                    <div className="flex flex-wrap gap-1">
                      {analysisResult.missingKeywords?.map((kw: string) => (
                        <Badge key={kw} variant="amber" className="font-mono text-[10px]">
                          {kw}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#F1F5F9] space-y-2">
                    <span className="text-[10px] font-semibold text-[#64748B] uppercase block">Formatting & Parsing Warnings</span>
                    {analysisResult.formattingWarnings?.map((warn: string, i: number) => (
                      <div key={i} className="p-2 rounded bg-[#FFFBEB] border border-[#FDE68A] text-[11px] text-[#B45309]">
                        • {warn}
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-[#F1F5F9] space-y-1">
                    <span className="text-[10px] font-semibold text-[#047857] uppercase block">To Guarantee &quot;Shortlisted&quot; Status:</span>
                    <p className="text-[11px] text-[#334155]">
                      Inject the missing stack keywords into your master LaTeX template in Resume Studio, then re-run simulation.
                    </p>
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
