'use client';

import React, { useState, useRef } from 'react';
import { Upload, FileText, X, Download, AlertTriangle } from 'lucide-react';
import { parseCSV } from '@/utils/csvParser';

interface FileUploadProps {
  onFileLoaded: (filename: string, sizeStr: string, headers: string[], rows: string[][], rawCsv: string) => void;
  onCancel: () => void;
}

export default function FileUpload({ onFileLoaded, onCancel }: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const downloadSampleTemplate = () => {
    const csvContent = `created_at,name,email,country_code,mobile_without_country_code,company,city,state,country,lead_owner,crm_status,crm_note,data_source,possession_time,description
2026-05-13 14:20:48,John Doe,john.doe@example.com,+91,9876543210,GrowEasy,Mumbai,Maharashtra,India,test@gmail.com,GOOD_LEAD_FOLLOW_UP,Client is asking to reschedule demo,leads_on_demand,immediate,Interested in properties
2026-05-13 14:25:30,Sarah Johnson,sarah.johnson@example.com,+91,9876543211,Tech Solutions,Bangalore,Karnataka,India,test@gmail.com,DID_NOT_CONNECT,"Person was busy, will try again next week",meridian_tower,,
2026-05-13 14:30:15,Rajesh Patel,rajesh.patel@example.com,+91,9876543212,Startup Inc,Delhi,Delhi,India,test@gmail.com,BAD_LEAD,Not interested in our services,sarjapur_plots,,`;
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "groweasy_crm_sample_leads.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFile = (file: File) => {
    setError(null);

    const isCsv = file.name.endsWith('.csv') || file.type === 'text/csv' || file.type === 'application/vnd.ms-excel';
    if (!isCsv) {
      setError('Invalid file type. Please upload a CSV file (.csv).');
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('File is too large. Maximum size allowed is 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        if (!text) {
          setError('Could not read file contents.');
          return;
        }

        const parsedRows = parseCSV(text);
        if (parsedRows.length === 0) {
          setError('The uploaded CSV file is empty.');
          return;
        }

        const headers = parsedRows[0];
        const dataRows = parsedRows.slice(1);

        const sizeStr = file.size < 1024 * 1024
          ? `${(file.size / 1024).toFixed(2)} KB`
          : `${(file.size / (1024 * 1024)).toFixed(2)} MB`;

        onFileLoaded(file.name, sizeStr, headers, dataRows, text);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(`Error parsing CSV: ${message}`);
      }
    };

    reader.onerror = () => {
      setError('Error reading file.');
    };

    reader.readAsText(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto bg-white dark:bg-[#1f1f23] rounded-3xl shadow-2xl overflow-hidden transition-all duration-200 no-outline-card">
      {/* Header */}
      <div className="flex justify-between items-center px-6 py-5 bg-slate-50/50 dark:bg-[#28282f]/30">
        <h3 className="text-sm font-black text-slate-800 dark:text-white flex items-center gap-2 tracking-wide uppercase">
          <Upload className="w-4 h-4 text-[#ef5a3f]" />
          Import Leads via CSV
        </h3>
        <button 
          onClick={onCancel}
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Upload Zone */}
      <div className="p-6 space-y-6">
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all duration-150 min-h-[200px] ${
            dragActive
              ? 'bg-[#ef5a3f]/8 dark:bg-[#ef5a3f]/10 scale-[0.99] ring-2 ring-[#ef5a3f]'
              : 'bg-slate-100/70 hover:bg-[#ef5a3f]/5 dark:bg-[#28282f] dark:hover:bg-[#ef5a3f]/5'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".csv"
            onChange={handleChange}
          />

          <div className="w-10 h-10 rounded-xl bg-[#ef5a3f]/10 dark:bg-[#ef5a3f]/15 flex items-center justify-center mb-3">
            <Upload className="w-5 h-5 text-[#ef5a3f]" />
          </div>

          <p className="text-xs font-bold text-slate-700 dark:text-slate-200 mb-0.5 text-center">
            Drop your CSV file here
          </p>
          <p className="text-[10px] text-slate-400 dark:text-slate-400 mb-4 text-center">
            or click to browse files
          </p>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[9px] font-extrabold uppercase bg-slate-200/80 dark:bg-[#33333c] text-slate-600 dark:text-slate-400">
            CSV File Max 5MB
          </span>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 rounded-xl flex items-start gap-2.5 text-xs animate-shake">
            <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Dynamic description & instructions */}
        <div className="text-[10px] text-slate-500 dark:text-slate-400 space-y-1.5 pt-1">
          <p className="font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500">
            Dynamic Mapping System
          </p>
          <p className="leading-relaxed">
            CSV column headers can be in any name or language. The AI maps them automatically to standard fields: 
            <code className="text-[#ef5a3f] ml-1">name</code>,{' '}
            <code className="text-[#ef5a3f]">email</code>,{' '}
            <code className="text-[#ef5a3f]">country_code</code>,{' '}
            <code className="text-[#ef5a3f]">mobile_without_country_code</code>,{' '}
            <code className="text-[#ef5a3f]">company</code>,{' '}
            <code className="text-[#ef5a3f]">city</code>,{' '}
            <code className="text-[#ef5a3f]">state</code>,{' '}
            <code className="text-[#ef5a3f]">country</code>,{' '}
            <code className="text-[#ef5a3f]">crm_status</code>,{' '}
            <code className="text-[#ef5a3f]">data_source</code>, and others.
          </p>
        </div>

        {/* Template download */}
        <div className="flex justify-center pt-2">
          <button
            onClick={downloadSampleTemplate}
            className="inline-flex items-center gap-1.5 text-xs text-[#ef5a3f] hover:text-[#d94f35] font-bold transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Download Sample CSV Template
          </button>
        </div>
      </div>

      {/* Footer Buttons */}
      <div className="flex justify-end items-center gap-3 px-6 py-4 bg-slate-50/50 dark:bg-[#28282f]/30">
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-[#28282f] dark:hover:bg-[#2d2d34] text-xs font-bold rounded-xl text-slate-700 dark:text-slate-300 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="px-4 py-2 bg-[#ef5a3f] hover:bg-[#d94f35] text-white text-xs font-bold rounded-xl shadow-sm transition-colors"
        >
          Browse Files
        </button>
      </div>
    </div>
  );
}
