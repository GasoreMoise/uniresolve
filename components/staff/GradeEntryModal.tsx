'use client';

import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Calculator, Save, AlertCircle } from 'lucide-react';
import { api } from '../../config/api';

interface Assessment {
  name: string;
  score: number | '';
  max: number | '';
}

interface GradeEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentId: string;
  studentName: string;
  moduleId: string;
  moduleCode: string;
  existingGrade?: any; // To prepopulate if they are editing existing marks
  onSaved: () => void; // Function to trigger a refresh of the table
}

export default function GradeEntryModal({ isOpen, onClose, studentId, studentName, moduleId, moduleCode, existingGrade, onSaved }: GradeEntryModalProps) {
  const [cats, setCats] = useState<Assessment[]>(existingGrade?.cats || [{ name: 'CAT 1', score: '', max: 20 }]);
  const [assignments, setAssignments] = useState<Assessment[]>(existingGrade?.assignments || []);
  const [examScore, setExamScore] = useState<number | ''>(existingGrade?.examScore || '');
  const [examMax, setExamMax] = useState<number | ''>(existingGrade?.examMax || 50);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewCA, setPreviewCA] = useState(0);
  const [previewExam, setPreviewExam] = useState(0);

  // Live calculation preview
  useEffect(() => {
    let earnedCA = 0;
    let maxCA = 0;
    
    [...cats, ...assignments].forEach(a => {
      if (a.score !== '' && a.max !== '') {
        earnedCA += Number(a.score);
        maxCA += Number(a.max);
      }
    });

    setPreviewCA(maxCA > 0 ? (earnedCA / maxCA) * 50 : 0);

    if (examScore !== '' && examMax !== '' && Number(examMax) > 0) {
      setPreviewExam((Number(examScore) / Number(examMax)) * 50);
    } else {
      setPreviewExam(0);
    }
  }, [cats, assignments, examScore, examMax]);

  if (!isOpen) return null;

  const handleAssessmentChange = (type: 'cats' | 'assignments', index: number, field: keyof Assessment, value: string) => {
    const numericValue = value === '' ? '' : Number(value);
    if (type === 'cats') {
      const newCats = [...cats];
      newCats[index] = { ...newCats[index], [field]: numericValue };
      setCats(newCats);
    } else {
      const newAssignments = [...assignments];
      newAssignments[index] = { ...newAssignments[index], [field]: numericValue };
      setAssignments(newAssignments);
    }
  };

  const addAssessment = (type: 'cats' | 'assignments') => {
    if (type === 'cats') {
      setCats([...cats, { name: `CAT ${cats.length + 1}`, score: '', max: 20 }]);
    } else {
      setAssignments([...assignments, { name: `Assignment ${assignments.length + 1}`, score: '', max: 10 }]);
    }
  };

  const removeAssessment = (type: 'cats' | 'assignments', index: number) => {
    if (type === 'cats') setCats(cats.filter((_, i) => i !== index));
    else setAssignments(assignments.filter((_, i) => i !== index));
  };

  const handleCommit = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        cats: cats.filter(c => c.score !== '' && c.max !== ''),
        assignments: assignments.filter(a => a.score !== '' && a.max !== ''),
        examScore: examScore === '' ? null : Number(examScore),
        examMax: examMax === '' ? 50 : Number(examMax),
      };

      await api.grades.updateStudentMarks(moduleId, studentId, payload);
      onSaved();
      onClose();
    } catch (error) {
      alert("Failed to commit ledger scores. Check system logs.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-[#2B35AF] p-5 text-white flex justify-between items-center shrink-0">
          <div>
            <h2 className="font-bold text-lg tracking-wide">Academic Ledger Entry</h2>
            <p className="text-xs text-white/70 font-mono mt-0.5">{moduleCode} | {studentName}</p>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white transition bg-transparent border-none cursor-pointer">
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto grow space-y-8 bg-slate-50">
          
          {/* Continuous Assessments (CATs) */}
          <div className="space-y-3">
            <div className="flex justify-between items-center border-b border-slate-200 pb-2">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Continuous Assessment Tests</h3>
              <button onClick={() => addAssessment('cats')} className="flex items-center gap-1 text-[10px] bg-blue-50 text-blue-700 font-bold px-2 py-1 rounded border border-blue-200 hover:bg-blue-100 transition cursor-pointer">
                <Plus size={12} /> ADD CAT
              </button>
            </div>
            {cats.map((cat, idx) => (
              <div key={idx} className="flex gap-3 items-end bg-white p-3 rounded border border-slate-200 shadow-sm">
                <div className="flex-1 space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase">Label</label>
                  <input type="text" value={cat.name} onChange={(e) => handleAssessmentChange('cats', idx, 'name', e.target.value)} className="w-full p-2 border border-slate-200 rounded text-xs focus:border-[#2B35AF] outline-none font-medium text-slate-700" />
                </div>
                <div className="w-24 space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase">Score</label>
                  <input type="number" min="0" value={cat.score} onChange={(e) => handleAssessmentChange('cats', idx, 'score', e.target.value)} className="w-full p-2 border border-slate-200 rounded text-xs focus:border-[#2B35AF] outline-none text-slate-900 font-mono font-bold" />
                </div>
                <div className="w-24 space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase">Max</label>
                  <input type="number" min="1" value={cat.max} onChange={(e) => handleAssessmentChange('cats', idx, 'max', e.target.value)} className="w-full p-2 border border-slate-200 rounded text-xs focus:border-[#2B35AF] outline-none text-slate-500 font-mono" />
                </div>
                <button onClick={() => removeAssessment('cats', idx)} className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition cursor-pointer bg-transparent border-none">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            {cats.length === 0 && <p className="text-[10px] text-slate-400 italic">No CATs recorded.</p>}
          </div>

          {/* Assignments */}
          <div className="space-y-3">
            <div className="flex justify-between items-center border-b border-slate-200 pb-2">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Assignments / Labs</h3>
              <button onClick={() => addAssessment('assignments')} className="flex items-center gap-1 text-[10px] bg-blue-50 text-blue-700 font-bold px-2 py-1 rounded border border-blue-200 hover:bg-blue-100 transition cursor-pointer">
                <Plus size={12} /> ADD ASSIGNMENT
              </button>
            </div>
            {assignments.map((ass, idx) => (
              <div key={idx} className="flex gap-3 items-end bg-white p-3 rounded border border-slate-200 shadow-sm">
                <div className="flex-1 space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase">Label</label>
                  <input type="text" value={ass.name} onChange={(e) => handleAssessmentChange('assignments', idx, 'name', e.target.value)} className="w-full p-2 border border-slate-200 rounded text-xs focus:border-[#2B35AF] outline-none font-medium text-slate-700" />
                </div>
                <div className="w-24 space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase">Score</label>
                  <input type="number" min="0" value={ass.score} onChange={(e) => handleAssessmentChange('assignments', idx, 'score', e.target.value)} className="w-full p-2 border border-slate-200 rounded text-xs focus:border-[#2B35AF] outline-none text-slate-900 font-mono font-bold" />
                </div>
                <div className="w-24 space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase">Max</label>
                  <input type="number" min="1" value={ass.max} onChange={(e) => handleAssessmentChange('assignments', idx, 'max', e.target.value)} className="w-full p-2 border border-slate-200 rounded text-xs focus:border-[#2B35AF] outline-none text-slate-500 font-mono" />
                </div>
                <button onClick={() => removeAssessment('assignments', idx)} className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition cursor-pointer bg-transparent border-none">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            {assignments.length === 0 && <p className="text-[10px] text-slate-400 italic">No Assignments recorded.</p>}
          </div>

          {/* Final Examination */}
          <div className="space-y-3">
            <div className="border-b border-slate-200 pb-2">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Final Examination</h3>
            </div>
            <div className="flex gap-3 items-end bg-white p-3 rounded border border-emerald-200 shadow-sm bg-emerald-50/30">
              <div className="flex-1">
                <span className="block text-[11px] font-bold text-emerald-800 uppercase tracking-wider">Exam Registry</span>
                <span className="text-[9px] text-slate-500 leading-tight">Input the raw exam script score here. The system will automatically scale it.</span>
              </div>
              <div className="w-24 space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase">Score</label>
                <input type="number" min="0" value={examScore} onChange={(e) => setExamScore(e.target.value === '' ? '' : Number(e.target.value))} className="w-full p-2 border border-slate-200 rounded text-xs focus:border-emerald-600 outline-none text-emerald-700 font-mono font-bold bg-white" placeholder="--" />
              </div>
              <div className="w-24 space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase">Max (Raw)</label>
                <input type="number" min="1" value={examMax} onChange={(e) => setExamMax(e.target.value === '' ? '' : Number(e.target.value))} className="w-full p-2 border border-slate-200 rounded text-xs focus:border-emerald-600 outline-none text-slate-500 font-mono bg-white" />
              </div>
            </div>
          </div>

        </div>

        {/* Footer with Live Preview */}
        <div className="bg-slate-100 p-5 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <Calculator size={18} className="text-slate-400" />
            <div className="flex gap-4 text-xs font-mono">
              <div>
                <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">CA Scaled</span>
                <span className="font-bold text-slate-700">{previewCA.toFixed(1)} / 50</span>
              </div>
              <div className="border-l border-slate-300 pl-4">
                <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">Exam Scaled</span>
                <span className="font-bold text-slate-700">{previewExam.toFixed(1)} / 50</span>
              </div>
              <div className="border-l border-slate-300 pl-4">
                <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">Final Grade</span>
                <span className={`font-black text-lg ${previewCA + previewExam >= 50 ? 'text-emerald-600' : 'text-red-500'}`}>
                  {(previewCA + previewExam).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          <button 
            onClick={handleCommit}
            disabled={isSubmitting}
            className="w-full sm:w-auto bg-[#2B35AF] hover:bg-blue-800 disabled:bg-slate-300 text-white font-bold py-2.5 px-6 rounded text-xs uppercase tracking-widest transition cursor-pointer flex items-center justify-center gap-2 border-none shadow-sm"
          >
            {isSubmitting ? 'Committing...' : <><Save size={14} /> Commit to Ledger</>}
          </button>
        </div>

      </div>
    </div>
  );
}