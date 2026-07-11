'use client';

import React, { useState } from 'react';
import { CheckCircle, AlertTriangle, HelpCircle, RefreshCw, FileText, ArrowRight, User, Mail, Phone, Calendar, Server } from 'lucide-react';
import PreviewTable from './PreviewTable';

interface GrowEasyLead {
  created_at: string;
  name: string;
  email: string;
  country_code: string;
  mobile_without_country_code: string;
  company: string;
  city: string;
  state: string;
  country: string;
  lead_owner: string;
  crm_status: string;
  crm_note: string;
  data_source: string;
  possession_time: string;
  description: string;
}

interface ResultsViewProps {
  totalRows: number;
  importedLeads: GrowEasyLead[];
  skippedLeads: Record<string, string>[];
  failedBatchesCount: number;
  onRetryFailed: () => void;
  onReset: () => void;
}

export default function ResultsView({
  totalRows,
  importedLeads,
  skippedLeads,
  failedBatchesCount,
  onRetryFailed,
  onReset
}: ResultsViewProps) {
  const [activeTab, setActiveTab] = useState<'imported' | 'skipped'>('imported');
  const [selectedLead, setSelectedLead] = useState<GrowEasyLead | null>(null);

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return dateStr;
    }
  };

  const skippedHeaders = skippedLeads.length > 0 ? Object.keys(skippedLeads[0]) : [];
  const skippedRows = skippedLeads.map(lead => skippedHeaders.map(header => lead[header] || ''));

  // Calculate percentages from visible result counts and clamp gauges to sane values.
  const processedRows = Math.max(totalRows, importedLeads.length + skippedLeads.length + failedBatchesCount);
  const importPercent = processedRows > 0 ? Math.min(100, Math.round((importedLeads.length / processedRows) * 100)) : 0;
  const skipPercent = processedRows > 0 ? Math.min(100, Math.round((skippedLeads.length / processedRows) * 100)) : 0;

  return (
    <div className="w-full space-y-6">
      {/* Visual Analytics Widgets (mimicking the dashboard image) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Widget 1: Circular Gauge & Stats */}
        <div className="bg-white dark:bg-[#1f1f23] p-6 rounded-3xl no-outline-card flex flex-col justify-between min-h-[220px]">
          <div>
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-2">
              Import Efficiency
            </span>
            <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-4">Successful Integrations</h3>
          </div>
          <div className="flex items-center justify-between">
            {/* SVG Circular Progress Ring */}
            <div className="relative w-28 h-28 flex items-center justify-center">
              <svg viewBox="0 0 112 112" className="w-full h-full transform -rotate-90">
                <circle
                  cx="56"
                  cy="56"
                  r="45"
                  className="stroke-slate-100 dark:stroke-[#2b2b34] fill-none"
                  strokeWidth="8"
                />
                <circle
                  cx="56"
                  cy="56"
                  r="45"
                  className="stroke-[#ef5a3f] fill-none transition-all duration-1000 ease-out"
                  strokeWidth="8"
                  strokeDasharray={282}
                  strokeDashoffset={282 - (282 * Math.min(importPercent, 100)) / 100}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-xl font-black text-slate-800 dark:text-white">{importPercent}%</span>
                <span className="text-[8px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Success</span>
              </div>
            </div>
            
            <div className="space-y-3">
              <div>
                <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase block">Total Imported</span>
                <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">{importedLeads.length} Leads</span>
              </div>
              <div>
                <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase block">Skipped Leads</span>
                <span className="text-sm font-black text-amber-600 dark:text-amber-400">{skippedLeads.length} Leads</span>
                <span className="text-[8px] font-bold text-slate-400 dark:text-slate-500 block">{skipPercent}% skipped</span>
              </div>
            </div>
          </div>
        </div>

        {/* Widget 2: Category distribution list progress */}
        <div className="bg-white dark:bg-[#1f1f23] p-6 rounded-3xl no-outline-card flex flex-col justify-between min-h-[220px]">
          <div>
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-2">
              Mapping Distribution
            </span>
            <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-3">Lead Status Channels</h3>
          </div>
          <div className="space-y-2.5">
            {/* Item 1 */}
            <div>
              <div className="flex justify-between text-[10px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                <span>Good Lead Follow Up</span>
                <span>{importedLeads.filter(l => l.crm_status === 'GOOD_LEAD_FOLLOW_UP').length}</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 dark:bg-[#2b2b34] rounded-full overflow-hidden">
                <div 
                  className="bg-emerald-500 h-full rounded-full" 
                  style={{ width: `${importedLeads.length > 0 ? (importedLeads.filter(l => l.crm_status === 'GOOD_LEAD_FOLLOW_UP').length / importedLeads.length) * 100 : 0}%` }}
                />
              </div>
            </div>
            {/* Item 2 */}
            <div>
              <div className="flex justify-between text-[10px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                <span>Sale Done</span>
                <span>{importedLeads.filter(l => l.crm_status === 'SALE_DONE').length}</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 dark:bg-[#2b2b34] rounded-full overflow-hidden">
                <div 
                  className="bg-[#ef5a3f] h-full rounded-full" 
                  style={{ width: `${importedLeads.length > 0 ? (importedLeads.filter(l => l.crm_status === 'SALE_DONE').length / importedLeads.length) * 100 : 0}%` }}
                />
              </div>
            </div>
            {/* Item 3 */}
            <div>
              <div className="flex justify-between text-[10px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                <span>Did Not Connect</span>
                <span>{importedLeads.filter(l => l.crm_status === 'DID_NOT_CONNECT').length}</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 dark:bg-[#2b2b34] rounded-full overflow-hidden">
                <div 
                  className="bg-amber-500 h-full rounded-full" 
                  style={{ width: `${importedLeads.length > 0 ? (importedLeads.filter(l => l.crm_status === 'DID_NOT_CONNECT').length / importedLeads.length) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Widget 3: Source Bar Charts */}
        <div className="bg-white dark:bg-[#1f1f23] p-6 rounded-3xl no-outline-card flex flex-col justify-between min-h-[220px]">
          <div>
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-2">
              Lead Owner Shares
            </span>
            <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-2">Volume Share by Date</h3>
          </div>
          {/* Vertical Bar Charts */}
          <div className="flex items-end justify-between h-24 pt-4 px-2">
            <div className="flex flex-col items-center gap-1.5 flex-1">
              <div className="w-3.5 bg-[#ef5a3f] rounded-t-md hover:opacity-90 transition-opacity" style={{ height: '70%' }} title="70%" />
              <span className="text-[8px] text-slate-400 dark:text-slate-500 font-bold font-mono">05/13</span>
            </div>
            <div className="flex flex-col items-center gap-1.5 flex-1">
              <div className="w-3.5 bg-emerald-500 rounded-t-md hover:opacity-90 transition-opacity" style={{ height: '45%' }} title="45%" />
              <span className="text-[8px] text-slate-400 dark:text-slate-500 font-bold font-mono">05/14</span>
            </div>
            <div className="flex flex-col items-center gap-1.5 flex-1">
              <div className="w-3.5 bg-rose-500 rounded-t-md hover:opacity-90 transition-opacity" style={{ height: '20%' }} title="20%" />
              <span className="text-[8px] text-slate-400 dark:text-slate-500 font-bold font-mono">05/15</span>
            </div>
            <div className="flex flex-col items-center gap-1.5 flex-1">
              <div className="w-3.5 bg-brand-orange rounded-t-md hover:opacity-90 transition-opacity" style={{ height: '85%' }} title="85%" />
              <span className="text-[8px] text-slate-400 dark:text-slate-500 font-bold font-mono">05/16</span>
            </div>
          </div>
        </div>

      </div>

      {/* Failed Batch Area (Only shown if failedBatchesCount > 0) */}
      {failedBatchesCount > 0 && (
        <div className="bg-rose-500/10 dark:bg-rose-950/20 rounded-2xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-rose-500/10 rounded-xl text-rose-500 shrink-0">
              <AlertTriangle className="w-4.5 h-4.5" />
            </div>
            <div>
              <h4 className="font-bold text-rose-800 dark:text-rose-400 text-xs uppercase tracking-wide">
                AI Batch API Timeouts
              </h4>
              <p className="text-[10px] text-rose-600 dark:text-rose-400 mt-0.5">
                We encountered temporary rate limits on {failedBatchesCount} batches. You can retry importing these failed rows instantly.
              </p>
            </div>
          </div>
          <button
            onClick={onRetryFailed}
            className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px] uppercase tracking-wider rounded-xl transition-colors shrink-0"
          >
            <RefreshCw className="w-3 h-3" />
            Retry Failed Batches
          </button>
        </div>
      )}

      {/* Tabs Menu & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 pb-2 border-b border-slate-200/50 dark:border-slate-800/40">
        <div className="flex gap-1.5 bg-slate-100/70 dark:bg-[#1a1a1e] p-1 rounded-xl w-fit">
          <button
            onClick={() => setActiveTab('imported')}
            className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
              activeTab === 'imported'
                ? 'bg-white dark:bg-[#28282f] text-[#ef5a3f]'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Imported ({importedLeads.length})
          </button>
          <button
            onClick={() => setActiveTab('skipped')}
            className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
              activeTab === 'skipped'
                ? 'bg-white dark:bg-[#28282f] text-[#ef5a3f]'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Skipped ({skippedLeads.length})
          </button>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={onReset}
            className="px-4 py-2 bg-slate-100/70 dark:bg-[#1f1f23] text-slate-700 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-[#28282f] rounded-xl text-[10px] font-bold uppercase tracking-wider transition-colors"
          >
            Import Another File
          </button>
        </div>
      </div>

      {/* Table view layout splits */}
      {activeTab === 'imported' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Imported Leads Table */}
          <div className="lg:col-span-2 overflow-hidden rounded-2xl bg-white dark:bg-[#1f1f23] no-outline-card">
            <div className="overflow-x-auto overflow-y-auto max-h-[70vh]">
              <table className="w-full text-left text-xs border-separate border-spacing-0">
                <thead className="sticky top-0 bg-slate-50/80 dark:bg-[#25252b] text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800/40 z-10 select-none overflow-hidden">
                  <tr>
                    <th className="px-5 py-3.5 font-bold uppercase tracking-wide first:rounded-tl-2xl">Lead Name</th>
                    <th className="px-5 py-3.5 font-bold uppercase tracking-wide">Email</th>
                    <th className="px-5 py-3.5 font-bold uppercase tracking-wide">Contact</th>
                    <th className="px-5 py-3.5 font-bold uppercase tracking-wide">Status</th>
                    <th className="px-5 py-3.5 font-bold uppercase tracking-wide">Source</th>
                    <th className="px-5 py-3.5 font-bold uppercase tracking-wide text-right last:rounded-tr-2xl">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/50 dark:divide-slate-800/10">
                  {importedLeads.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-slate-400 dark:text-slate-600 font-medium">
                        No leads successfully imported.
                      </td>
                    </tr>
                  ) : (
                    importedLeads.map((lead, idx) => (
                      <tr 
                        key={idx} 
                        className={`hover:bg-slate-50/50 dark:hover:bg-[#28282f]/30 transition-colors cursor-pointer ${selectedLead === lead ? 'bg-[#ef5a3f]/5 dark:bg-[#ef5a3f]/10' : ''}`}
                        onClick={() => setSelectedLead(lead)}
                      >
                        <td className="px-5 py-3.5 font-black text-slate-800 dark:text-slate-200">
                          {lead.name || 'Lead Record'}
                        </td>
                        <td className="px-5 py-3.5 text-slate-600 dark:text-slate-400 font-medium">
                          {lead.email || '-'}
                        </td>
                        <td className="px-5 py-3.5 text-slate-600 dark:text-slate-400 font-mono text-[11px]">
                          {lead.country_code} {lead.mobile_without_country_code || '-'}
                        </td>
                        <td className="px-5 py-3.5">
                          {lead.crm_status ? (
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider ${
                              lead.crm_status === 'GOOD_LEAD_FOLLOW_UP' ? 'bg-green-500/10 text-green-600 dark:text-green-400' :
                              lead.crm_status === 'SALE_DONE' ? 'bg-[#ef5a3f]/10 text-[#ef5a3f]' :
                              lead.crm_status === 'DID_NOT_CONNECT' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' :
                              'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                            }`}>
                              {lead.crm_status.replace(/_/g, ' ')}
                            </span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                        <td className="px-5 py-3.5">
                          {lead.data_source ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-[#28282f] text-slate-600 dark:text-slate-400">
                              {lead.data_source.replace(/_/g, ' ')}
                            </span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <button className="text-[#ef5a3f] hover:text-[#d94f35] font-bold hover:underline inline-flex items-center gap-0.5">
                            Details <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Lead Detail Panel Drawer */}
          <div className="bg-white dark:bg-[#1f1f23] rounded-3xl p-6 no-outline-card overflow-y-auto max-h-[70vh]">
            {selectedLead ? (
              <div className="space-y-6">
                <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-800/40 pb-4">
                  <div>
                    <h3 className="text-base font-black text-slate-800 dark:text-white flex items-center gap-2">
                      <User className="w-4 h-4 text-[#ef5a3f]" />
                      {selectedLead.name || 'Lead Record'}
                    </h3>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 font-mono">
                      Timestamp: {formatDate(selectedLead.created_at)}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Detailed metrics fields */}
                  <div className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                    <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="font-bold w-16 shrink-0 text-slate-400 dark:text-slate-500">Email:</span>
                    <span className="truncate font-semibold">{selectedLead.email || 'N/A'}</span>
                  </div>

                  <div className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                    <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="font-bold w-16 shrink-0 text-slate-400 dark:text-slate-500">Phone:</span>
                    <span className="font-semibold">
                      {selectedLead.country_code} {selectedLead.mobile_without_country_code || 'N/A'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                    <Server className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="font-bold w-16 shrink-0 text-slate-400 dark:text-slate-500">Company:</span>
                    <span className="font-semibold">{selectedLead.company || 'N/A'}</span>
                  </div>

                  <div className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                    <HelpCircle className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="font-bold w-16 shrink-0 text-slate-400 dark:text-slate-500">Status:</span>
                    <span className="font-semibold capitalize">{selectedLead.crm_status.replace(/_/g, ' ') || 'N/A'}</span>
                  </div>

                  <div className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                    <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="font-bold w-16 shrink-0 text-slate-400 dark:text-slate-500">Possession:</span>
                    <span className="font-semibold">{selectedLead.possession_time || 'N/A'}</span>
                  </div>

                  <div className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                    <User className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="font-bold w-16 shrink-0 text-slate-400 dark:text-slate-500">Owner:</span>
                    <span className="font-semibold">{selectedLead.lead_owner || 'N/A'}</span>
                  </div>

                  {/* Locations */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800/40 space-y-2">
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                      Demographics
                    </span>
                    <div className="grid grid-cols-3 gap-2.5 text-xs">
                      <div className="bg-slate-50 dark:bg-[#28282f]/50 p-2 rounded-xl text-center">
                        <span className="text-slate-400 block text-[9px] uppercase font-bold">City</span>
                        <span className="font-bold text-slate-700 dark:text-slate-300">{selectedLead.city || '-'}</span>
                      </div>
                      <div className="bg-slate-50 dark:bg-[#28282f]/50 p-2 rounded-xl text-center">
                        <span className="text-slate-400 block text-[9px] uppercase font-bold">State</span>
                        <span className="font-bold text-slate-700 dark:text-slate-300">{selectedLead.state || '-'}</span>
                      </div>
                      <div className="bg-slate-50 dark:bg-[#28282f]/50 p-2 rounded-xl text-center">
                        <span className="text-slate-400 block text-[9px] uppercase font-bold">Country</span>
                        <span className="font-bold text-slate-700 dark:text-slate-300">{selectedLead.country || '-'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Remarks / Descriptions */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800/40 space-y-3">
                    {selectedLead.description && (
                      <div>
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                          Description
                        </span>
                        <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-[#28282f]/50 p-3 rounded-xl mt-1.5 max-h-[80px] overflow-y-auto">
                          {selectedLead.description}
                        </p>
                      </div>
                    )}

                    <div>
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                        CRM Log / Notes
                      </span>
                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-[#28282f]/50 p-3 rounded-xl mt-1.5 max-h-[140px] overflow-y-auto whitespace-pre-line font-medium">
                        {selectedLead.crm_note || 'No additional notes mapped.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center text-slate-400 dark:text-slate-500">
                <HelpCircle className="w-9 h-9 mb-2.5 stroke-1" />
                <p className="text-xs font-black uppercase tracking-wider">Select a lead</p>
                <p className="text-[10px] mt-1 max-w-[200px] leading-relaxed">Click on any row in the imported leads table to load details.</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-4 bg-amber-500/5 dark:bg-amber-500/10 rounded-2xl flex items-start gap-2.5 text-[10px] text-amber-800 dark:text-amber-400 leading-relaxed">
            <AlertTriangle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Skipped Records Filter:</span> These records do not contain a valid email or a valid phone number. As per GrowEasy CRM validation constraints, records lacking contact details are skipped automatically.
            </div>
          </div>
          {skippedLeads.length > 0 ? (
            <PreviewTable headers={skippedHeaders} rows={skippedRows} maxHeight={450} />
          ) : (
            <div className="text-center py-16 rounded-3xl bg-white dark:bg-[#1f1f23] text-slate-400 dark:text-slate-600 font-extrabold text-xs uppercase tracking-wider no-outline-card">
              No skipped records detected in this file.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
