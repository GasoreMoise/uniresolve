'use client';

import React, { useState } from 'react';
import { FileText, Send, Upload, Loader2 } from 'lucide-react';

interface ProcedureProps {
  cleanService: string;
  isSubmitting: boolean;
  onSubmit: (formData: { description: string; files: File[] }) => void;
}

export default function GenericProcedureForm({ cleanService, isSubmitting, onSubmit }: ProcedureProps) {
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState<File[]>([]);

  const handleFilePicker = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setFiles(Array.from(e.target.files));
  };

  const handleSubmitWrapper = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ description, files });
  };

  return (
    <form onSubmit={handleSubmitWrapper} className="space-y-5 text-xs animate-in fade-in duration-200">
      <div className="space-y-1.5">
        <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400">
          Official Claim Justification Narrative *
        </label>
        <textarea
          required
          rows={6}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Provide a clear, detailed, and chronological account supporting this administrative request..."
          className="w-full text-sm p-3 border border-slate-300 rounded focus:outline-none focus:border-[#2B35AF] bg-white text-slate-800 transition"
        />
      </div>

      <div className="space-y-1.5">
        <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400">
          Supporting Proof Document Attachments
        </label>
        <div className="border-2 border-dashed border-slate-200 rounded p-5 text-center bg-slate-50 hover:bg-slate-100/50 transition relative">
          <input type="file" multiple onChange={handleFilePicker} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10" />
          <Upload size={24} className="mx-auto text-slate-300 mb-1" />
          <span className="text-[11px] text-slate-500 block font-medium">Drag files here or click to browse</span>
        </div>

        {files.length > 0 && (
          <div className="mt-2 space-y-1">
            {files.map((file, idx) => (
              <div key={idx} className="flex items-center gap-2 text-[10px] text-slate-600 bg-slate-50 p-2 rounded border border-slate-100 truncate">
                <FileText size={12} className="text-[#2B35AF] shrink-0" />
                <span className="truncate">{file.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="pt-4 border-t border-slate-100 flex justify-end">
        <button type="submit" disabled={isSubmitting} className="w-full sm:w-auto bg-[#2B35AF] hover:bg-blue-800 disabled:bg-slate-300 text-white font-bold py-3 px-8 rounded uppercase tracking-wider text-xs flex items-center justify-center gap-2 transition shadow-none border-none cursor-pointer">
          {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <>Submit Case File <Send size={12} /></>}
        </button>
      </div>
    </form>
  );
}