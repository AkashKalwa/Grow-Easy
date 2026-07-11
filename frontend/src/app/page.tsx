'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { 
  LayoutDashboard, 
  UserCheck, 
  User,
  Database, 
  Users, 
  MessageSquare, 
  PhoneCall, 
  Sliders, 
  FileText, 
  Radio, 
  Import,
  Upload, 
  Loader2, 
  Plus, 
  Search, 
  X,
  RefreshCw,
  Calendar,
  Send,
  CheckCircle,
  AlertTriangle,
  HelpCircle,
  Layers,
  Menu,
  ChevronLeft
} from 'lucide-react';

import ThemeToggle from '../components/ThemeToggle';
import FileUpload from '../components/FileUpload';
import PreviewTable from '../components/PreviewTable';
import ResultsView from '../components/ResultsView';
import CustomDropdown from '../components/CustomDropdown';

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

export default function GrowEasyApp() {
  // Navigation Menu tabs
  // 'dashboard' | 'generate-leads' | 'manage-leads' | 'engage-leads' | 'team' | 'lead-sources' | 'ad-accounts' | 'whatsapp' | 'tele-calling' | 'crm-fields' | 'api-center'
  const [activeMenu, setActiveMenu] = useState<string>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [currentDate, setCurrentDate] = useState<string>('');

  useEffect(() => {
    setCurrentDate(new Date().toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' }));
  }, []);
  
  // Modal & CSV upload states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalStep, setModalStep] = useState<'upload' | 'preview' | 'importing'>('upload');
  const [fileName, setFileName] = useState('');
  const [fileSizeStr, setFileSizeStr] = useState('');
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [csvRows, setCsvRows] = useState<string[][]>([]);
  const [rawCsvText, setRawCsvText] = useState('');
  const [importProgress, setImportProgress] = useState(0);
  const [currentBatchText, setCurrentBatchText] = useState('');

  // Loaded/Imported leads store
  const [importedLeads, setImportedLeads] = useState<GrowEasyLead[]>([]);
  const [skippedLeads, setSkippedLeads] = useState<Record<string, string>[]>([]);
  const [totalCsvRowsProcessed, setTotalCsvRowsProcessed] = useState(0);
  const [failedBatches, setFailedBatches] = useState<{ batchIndex: number; records: Record<string, string>[]; errorMessage: string }[]>([]);

  // Search & Filter state for Lead Management
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedLead, setSelectedLead] = useState<GrowEasyLead | null>(null);

  // Manual Lead Generation form state
  const [manualLeadName, setManualLeadName] = useState('');
  const [manualLeadEmail, setManualLeadEmail] = useState('');
  const [manualLeadPhone, setManualLeadPhone] = useState('');
  const [manualLeadCompany, setManualLeadCompany] = useState('');
  const [manualLeadStatus, setManualLeadStatus] = useState('GOOD_LEAD_FOLLOW_UP');
  const [manualLeadSource, setManualLeadSource] = useState('leads_on_demand');
  const [manualLeadSuccess, setManualLeadSuccess] = useState(false);

  // Campaigns state (Engage Leads)
  const [campaignSubject, setCampaignSubject] = useState('');
  const [campaignBody, setCampaignBody] = useState('Hello {{name}},\n\nThanks for showing interest in our properties. We would love to connect with you soon.');
  const [campaignSuccess, setCampaignSuccess] = useState(false);
  const [campaignChannel, setCampaignChannel] = useState('whatsapp');

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  // Seed sample leads initially so the dashboard has contents
  useEffect(() => {
    const mockInitialLeads: GrowEasyLead[] = [
      {
        created_at: "2026-07-09T10:15:30.000Z",
        name: "Abhraneel Dhar",
        email: "abhraneeldhar@groweasy.ai",
        country_code: "+91",
        mobile_without_country_code: "9051897280",
        company: "GrowEasy",
        city: "Bangalore",
        state: "Karnataka",
        country: "India",
        lead_owner: "varun@groweasy.ai",
        crm_status: "GOOD_LEAD_FOLLOW_UP",
        crm_note: "Client requested WhatsApp follow up with price templates.",
        data_source: "leads_on_demand",
        possession_time: "Immediate",
        description: "Looking for plots near Sarjapur Road."
      },
      {
        created_at: "2026-07-09T14:20:48.000Z",
        name: "John Doe",
        email: "john.doe@example.com",
        country_code: "+91",
        mobile_without_country_code: "9876543210",
        company: "Vercel Inc",
        city: "Mumbai",
        state: "Maharashtra",
        country: "India",
        lead_owner: "varun@groweasy.ai",
        crm_status: "GOOD_LEAD_FOLLOW_UP",
        crm_note: "Client is asking to reschedule demo to next week.",
        data_source: "leads_on_demand",
        possession_time: "Immediate",
        description: "Interested in plots"
      },
      {
        created_at: "2026-07-08T11:25:30.000Z",
        name: "Sarah Johnson",
        email: "sarah.johnson@example.com",
        country_code: "+91",
        mobile_without_country_code: "9876543211",
        company: "Tech Solutions",
        city: "Bangalore",
        state: "Karnataka",
        country: "India",
        lead_owner: "varun@groweasy.ai",
        crm_status: "DID_NOT_CONNECT",
        crm_note: "Person was busy, will try again next week. Dialed twice.",
        data_source: "meridian_tower",
        possession_time: "3-6 months",
        description: "Wants premium apartments"
      },
      {
        created_at: "2026-07-07T12:30:15.000Z",
        name: "Rajesh Patel",
        email: "rajesh.patel@example.com",
        country_code: "+91",
        mobile_without_country_code: "9876543212",
        company: "Startup Inc",
        city: "Delhi",
        state: "Delhi",
        country: "India",
        lead_owner: "varun@groweasy.ai",
        crm_status: "BAD_LEAD",
        crm_note: "Not interested in our services. Please archive lead.",
        data_source: "varah_swamy",
        possession_time: "Immediate",
        description: "Looking for agricultural land"
      },
      {
        created_at: "2026-07-06T15:35:22.000Z",
        name: "Priya Singh",
        email: "priya.singh@example.com",
        country_code: "+91",
        mobile_without_country_code: "9876543213",
        company: "Enterprise Corp",
        city: "Pune",
        state: "Maharashtra",
        country: "India",
        lead_owner: "varun@groweasy.ai",
        crm_status: "SALE_DONE",
        crm_note: "Deal closed. Onboarding in progress.",
        data_source: "eden_park",
        possession_time: "Immediate",
        description: "Purchased commercial flat."
      }
    ];
    setImportedLeads(mockInitialLeads);
  }, []);

  const handleFileLoaded = (
    name: string,
    sizeStr: string,
    headers: string[],
    rows: string[][],
    rawCsv: string
  ) => {
    setFileName(name);
    setFileSizeStr(sizeStr);
    setCsvHeaders(headers);
    setCsvRows(rows);
    setRawCsvText(rawCsv);
    setModalStep('preview');
  };

  const handleConfirmImport = async (failedBatchesToRetry?: typeof failedBatches) => {
    setModalStep('importing');
    setImportProgress(10);
    setCurrentBatchText('Initializing mapper parser...');

    // Simulate batch progress updates
    const interval = setInterval(() => {
      setImportProgress(p => {
        if (p >= 90) {
          clearInterval(interval);
          return 90;
        }
        return p + 15;
      });
      setCurrentBatchText(prev => {
        if (prev.includes('mapper')) return 'Extracting phones and emails...';
        if (prev.includes('Extracting')) return 'Normalizing statuses and sources...';
        return 'Finalizing GrowEasy records...';
      });
    }, 200);

    try {
      const payload: { failedBatchesOnly?: Record<string, string>[][]; csv?: string; batchSize?: number } = {};
      if (failedBatchesToRetry && failedBatchesToRetry.length > 0) {
        payload.failedBatchesOnly = failedBatchesToRetry.map(b => b.records);
      } else {
        payload.csv = rawCsvText;
      }
      payload.batchSize = 10; 

      const response = await fetch(`${API_URL}/api/import`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      clearInterval(interval);

      if (!response.ok) {
        throw new Error(`Server returned error code: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        setImportProgress(100);
        setCurrentBatchText('Sync complete!');
        
        if (failedBatchesToRetry) {
          const newlyImported = result.importedLeads;
          const newlySkipped = result.skippedLeads;

          setImportedLeads(prev => [...newlyImported, ...prev]);
          setSkippedLeads(prev => [...newlySkipped, ...prev]);
          setFailedBatches(result.failedBatches);
        } else {
          setImportedLeads(prev => [...result.importedLeads, ...prev]);
          setSkippedLeads(result.skippedLeads);
          setTotalCsvRowsProcessed(result.summary.totalRows);
          setFailedBatches(result.failedBatches);
        }

        setTimeout(() => {
          setIsModalOpen(false);
          setActiveMenu('results');
        }, 800);
      } else {
        throw new Error(result.error || 'Import failed.');
      }

    } catch (err: unknown) {
      clearInterval(interval);
      console.error(err);
      setModalStep('preview');
      const message = err instanceof Error ? err.message : 'Check if backend server is running.';
      alert(`Import Failed: ${message}`);;
    }
  };

  const handleManualLeadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualLeadName || (!manualLeadEmail && !manualLeadPhone)) {
      alert('A lead must have a Name and at least an Email or Phone number!');
      return;
    }

    const newLead: GrowEasyLead = {
      created_at: new Date().toISOString(),
      name: manualLeadName,
      email: manualLeadEmail,
      country_code: manualLeadPhone.startsWith('+') ? manualLeadPhone.split(' ')[0] : '',
      mobile_without_country_code: manualLeadPhone.startsWith('+') 
        ? manualLeadPhone.split(' ').slice(1).join('') 
        : manualLeadPhone.replace(/\D/g, ''),
      company: manualLeadCompany || 'Self Employed',
      city: 'Local',
      state: '',
      country: '',
      lead_owner: 'varun@groweasy.ai',
      crm_status: manualLeadStatus,
      crm_note: 'Manually added via Quick Lead Generator.',
      data_source: manualLeadSource,
      possession_time: 'Immediate',
      description: 'Manually created lead.'
    };

    setImportedLeads(prev => [newLead, ...prev]);
    setManualLeadName('');
    setManualLeadEmail('');
    setManualLeadPhone('');
    setManualLeadCompany('');
    setManualLeadSuccess(true);
    setTimeout(() => setManualLeadSuccess(false), 3000);
  };

  const handleCampaignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (importedLeads.length === 0) {
      alert('No leads to send campaigns to!');
      return;
    }
    setCampaignSuccess(true);
    setTimeout(() => setCampaignSuccess(false), 3000);
  };

  const handleResetImport = () => {
    setFileName('');
    setFileSizeStr('');
    setCsvHeaders([]);
    setCsvRows([]);
    setRawCsvText('');
    setFailedBatches([]);
    setSkippedLeads([]);
    setTotalCsvRowsProcessed(0);
    setModalStep('upload');
    setIsModalOpen(true);
  };

  // Filtered Leads
  const filteredLeads = importedLeads.filter(lead => {
    const searchMatch = 
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.mobile_without_country_code.includes(searchQuery) ||
      (lead.company && lead.company.toLowerCase().includes(searchQuery.toLowerCase()));

    const statusMatch = statusFilter ? lead.crm_status === statusFilter : true;
    return searchMatch && statusMatch;
  });

  return (
    <div className="flex flex-1 min-h-screen bg-[#f5f5f0] dark:bg-[#131316] text-[#1c1917] dark:text-[#f4f4f5] transition-colors duration-200 font-sans">
      
      {/* Backdrop Overlay for mobile */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* ================= SIDEBAR ================= */}
      <aside className={`fixed inset-y-0 left-0 z-40 bg-(--sidebar-bg) shadow-[0_20px_70px_-40px_rgba(239,90,63,0.35)] border-r border-white/10 dark:border-slate-800/70 flex flex-col shrink-0 justify-between transition-all duration-300 ease-in-out lg:relative lg:translate-x-0 overflow-hidden ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } ${isSidebarCollapsed ? 'lg:w-20 p-3' : 'w-64 p-5'}`}>
        <div className="space-y-6">
          {/* Top logotype + collapse toggle */}
          <div className={`flex items-center px-2 ${isSidebarCollapsed ? 'justify-center' : 'justify-between'}`}>
            {!isSidebarCollapsed && (
              <span className="font-heading text-lg font-black tracking-tight text-slate-800 dark:text-white flex items-center gap-2">
                <Image
                  src="/groweasy-logo.png"
                  alt="GrowEasy"
                  width={28}
                  height={28}
                  className="rounded-md shrink-0"
                  priority
                />
                GrowEasy
              </span>
            )}
            {isSidebarCollapsed ? (
              /* Collapsed: logo icon only, clicking it expands */
              <button
                onClick={() => setIsSidebarCollapsed(false)}
                aria-label="Expand sidebar"
                title="Expand sidebar"
                className="flex items-center justify-center w-10 h-10 rounded-xl hover:bg-white/30 dark:hover:bg-white/10 transition-colors"
              >
                <Image
                  src="/groweasy-logo.png"
                  alt="GrowEasy"
                  width={28}
                  height={28}
                  className="rounded-md"
                />
              </button>
            ) : (
              /* Expanded: CRM badge + collapse arrow button */
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setIsSidebarCollapsed(true)}
                  aria-label="Collapse sidebar"
                  title="Collapse sidebar"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-[#ef5a3f] hover:bg-slate-200/60 dark:hover:bg-white/10 transition-all duration-150"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* User Profile Info card */}
          {isSidebarCollapsed ? (
            <div className="flex justify-center">
              <div className="w-9 h-9 rounded-full bg-[#ef5a3f] text-white flex items-center justify-center font-heading font-black text-sm shrink-0" title="VK Test — Owner">
                VK
              </div>
            </div>
          ) : (
            <div className="p-3 bg-white dark:bg-[#1f1f23] rounded-2xl flex items-center gap-3 no-outline-card transition-colors">
              <div className="w-9 h-9 rounded-full bg-[#ef5a3f] text-white flex items-center justify-center font-heading font-black text-sm shrink-0">
                VK
              </div>
              <div>
                <div className="text-xs font-black text-slate-800 dark:text-white">VK Test</div>
                <div className="text-[9px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-black">Owner</div>
              </div>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {!isSidebarCollapsed && (
              <span className="text-[8px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest px-2 block mb-2 select-none">
                Navigation
              </span>
            )}

            {/* Dashboard */}
            <button 
              onClick={() => { setActiveMenu('dashboard'); setIsSidebarOpen(false); }}
              title={isSidebarCollapsed ? 'Dashboard' : undefined}
              className={`w-full flex items-center gap-3.5 px-3 py-3 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all duration-150 ${isSidebarCollapsed ? 'justify-center' : ''} ${
                activeMenu === 'dashboard'
                  ? 'bg-white dark:bg-[#1f1f23] text-[#ef5a3f] shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-white/40 dark:hover:bg-[#1f1f23]/30 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <LayoutDashboard className={`w-4 h-4 shrink-0 ${activeMenu === 'dashboard' ? 'text-[#ef5a3f]' : 'text-slate-500'}`} />
              {!isSidebarCollapsed && <span>Dashboard</span>}
            </button>

            {/* Lead Sources */}
            <button 
              onClick={() => { setActiveMenu('lead-sources'); setIsSidebarOpen(false); }}
              title={isSidebarCollapsed ? 'Lead Sources' : undefined}
              className={`w-full flex items-center gap-3.5 px-3 py-3 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all duration-150 ${isSidebarCollapsed ? 'justify-center' : ''} ${
                activeMenu === 'lead-sources'
                  ? 'bg-white dark:bg-[#1f1f23] text-[#ef5a3f] shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-white/40 dark:hover:bg-[#1f1f23]/30 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Radio className={`w-4 h-4 shrink-0 ${activeMenu === 'lead-sources' ? 'text-[#ef5a3f]' : 'text-slate-500'}`} />
              {!isSidebarCollapsed && <span>Lead Sources</span>}
            </button>

            {/* Manage Leads */}
            <button 
              onClick={() => { setActiveMenu('manage-leads'); setIsSidebarOpen(false); }}
              title={isSidebarCollapsed ? 'Manage Leads' : undefined}
              className={`w-full flex items-center gap-3.5 px-3 py-3 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all duration-150 ${isSidebarCollapsed ? 'justify-center' : ''} ${
                activeMenu === 'manage-leads'
                  ? 'bg-white dark:bg-[#1f1f23] text-[#ef5a3f] shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-white/40 dark:hover:bg-[#1f1f23]/30 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Users className={`w-4 h-4 shrink-0 ${activeMenu === 'manage-leads' ? 'text-[#ef5a3f]' : 'text-slate-500'}`} />
              {!isSidebarCollapsed && <span>Manage Leads</span>}
            </button>

            {/* Generate Leads */}
            <button 
              onClick={() => { setActiveMenu('generate-leads'); setIsSidebarOpen(false); }}
              title={isSidebarCollapsed ? 'Quick Generator' : undefined}
              className={`w-full flex items-center gap-3.5 px-3 py-3 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all duration-150 ${isSidebarCollapsed ? 'justify-center' : ''} ${
                activeMenu === 'generate-leads'
                  ? 'bg-white dark:bg-[#1f1f23] text-[#ef5a3f] shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-white/40 dark:hover:bg-[#1f1f23]/30 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Plus className={`w-4 h-4 shrink-0 ${activeMenu === 'generate-leads' ? 'text-[#ef5a3f]' : 'text-slate-500'}`} />
              {!isSidebarCollapsed && <span>Quick Generator</span>}
            </button>

            {/* Engage Leads */}
            <button 
              onClick={() => { setActiveMenu('engage-leads'); setIsSidebarOpen(false); }}
              title={isSidebarCollapsed ? 'Engage Leads' : undefined}
              className={`w-full flex items-center gap-3.5 px-3 py-3 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all duration-150 ${isSidebarCollapsed ? 'justify-center' : ''} ${
                activeMenu === 'engage-leads'
                  ? 'bg-white dark:bg-[#1f1f23] text-[#ef5a3f] shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-white/40 dark:hover:bg-[#1f1f23]/30 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <MessageSquare className={`w-4 h-4 shrink-0 ${activeMenu === 'engage-leads' ? 'text-[#ef5a3f]' : 'text-slate-500'}`} />
              {!isSidebarCollapsed && <span>Engage Leads</span>}
            </button>

            {/* Team Members */}
            <button 
              onClick={() => { setActiveMenu('team'); setIsSidebarOpen(false); }}
              title={isSidebarCollapsed ? 'Team Members' : undefined}
              className={`w-full flex items-center gap-3.5 px-3 py-3 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all duration-150 ${isSidebarCollapsed ? 'justify-center' : ''} ${
                activeMenu === 'team'
                  ? 'bg-white dark:bg-[#1f1f23] text-[#ef5a3f] shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-white/40 dark:hover:bg-[#1f1f23]/30 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <UserCheck className={`w-4 h-4 shrink-0 ${activeMenu === 'team' ? 'text-[#ef5a3f]' : 'text-slate-500'}`} />
              {!isSidebarCollapsed && <span>Team Members</span>}
            </button>

            {/* Import Results logs (Only shown if imports done) */}
            {totalCsvRowsProcessed > 0 && (
              <button 
                onClick={() => { setActiveMenu('results'); setIsSidebarOpen(false); }}
                title={isSidebarCollapsed ? 'Import Results' : undefined}
                className={`w-full flex items-center gap-3.5 px-3 py-3 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all duration-150 ${isSidebarCollapsed ? 'justify-center' : ''} ${
                  activeMenu === 'results'
                    ? 'bg-white dark:bg-[#1f1f23] text-[#ef5a3f] shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-white/40 dark:hover:bg-[#1f1f23]/30 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <FileText className={`w-4 h-4 shrink-0 ${activeMenu === 'results' ? 'text-[#ef5a3f]' : 'text-slate-500'}`} />
                {!isSidebarCollapsed && 'Import Results'}
              </button>
            )}

            <div className="pt-3">
              {!isSidebarCollapsed ? (
                <span className="text-[8px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest px-2 block mb-2 select-none">Settings</span>
              ) : (
                <div className="border-t border-slate-200/40 dark:border-slate-800/40 mx-1 mb-2" />
              )}
            </div>

            {/* Ad Accounts */}
            <button 
              onClick={() => { setActiveMenu('ad-accounts'); setIsSidebarOpen(false); }}
              title={isSidebarCollapsed ? 'Ad Channels' : undefined}
              className={`w-full flex items-center gap-3.5 px-3 py-3 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all duration-150 ${isSidebarCollapsed ? 'justify-center' : ''} ${
                activeMenu === 'ad-accounts'
                  ? 'bg-white dark:bg-[#1f1f23] text-[#ef5a3f] shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-white/40 dark:hover:bg-[#1f1f23]/30 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Layers className={`w-4 h-4 shrink-0 ${activeMenu === 'ad-accounts' ? 'text-[#ef5a3f]' : 'text-slate-500'}`} />
              {!isSidebarCollapsed && <span>Ad Channels</span>}
            </button>

            {/* WhatsApp settings */}
            <button 
              onClick={() => { setActiveMenu('whatsapp'); setIsSidebarOpen(false); }}
              title={isSidebarCollapsed ? 'WhatsApp Setup' : undefined}
              className={`w-full flex items-center gap-3.5 px-3 py-3 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all duration-150 ${isSidebarCollapsed ? 'justify-center' : ''} ${
                activeMenu === 'whatsapp'
                  ? 'bg-white dark:bg-[#1f1f23] text-[#ef5a3f] shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-white/40 dark:hover:bg-[#1f1f23]/30 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Sliders className={`w-4 h-4 shrink-0 ${activeMenu === 'whatsapp' ? 'text-[#ef5a3f]' : 'text-slate-500'}`} />
              {!isSidebarCollapsed && <span>WhatsApp Setup</span>}
            </button>

            {/* Tele Calling */}
            <button 
              onClick={() => { setActiveMenu('tele-calling'); setIsSidebarOpen(false); }}
              title={isSidebarCollapsed ? 'Tele Dialer' : undefined}
              className={`w-full flex items-center gap-3.5 px-3 py-3 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all duration-150 ${isSidebarCollapsed ? 'justify-center' : ''} ${
                activeMenu === 'tele-calling'
                  ? 'bg-white dark:bg-[#1f1f23] text-[#ef5a3f] shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-white/40 dark:hover:bg-[#1f1f23]/30 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <PhoneCall className={`w-4 h-4 shrink-0 ${activeMenu === 'tele-calling' ? 'text-[#ef5a3f]' : 'text-slate-500'}`} />
              {!isSidebarCollapsed && <span>Tele Dialer</span>}
            </button>

            {/* API Webhooks */}
            <button 
              onClick={() => { setActiveMenu('api-center'); setIsSidebarOpen(false); }}
              title={isSidebarCollapsed ? 'API & Webhook' : undefined}
              className={`w-full flex items-center gap-3.5 px-3 py-3 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all duration-150 ${isSidebarCollapsed ? 'justify-center' : ''} ${
                activeMenu === 'api-center'
                  ? 'bg-white dark:bg-[#1f1f23] text-[#ef5a3f] shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-white/40 dark:hover:bg-[#1f1f23]/30 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Database className={`w-4 h-4 shrink-0 ${activeMenu === 'api-center' ? 'text-[#ef5a3f]' : 'text-slate-500'}`} />
              {!isSidebarCollapsed && <span>API & Webhook</span>}
            </button>
          </nav>
        </div>

        {/* Bottom date widget */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800/40">
          {isSidebarCollapsed ? (
            <div className="flex justify-center py-1" title={currentDate}>
              <Calendar className="w-4 h-4 text-[#ef5a3f]" />
            </div>
          ) : (
            <div className="px-3.5 py-2.5 bg-white dark:bg-[#1f1f23] rounded-xl flex items-center gap-2.5 no-outline-card select-none">
              <Calendar className="w-4 h-4 text-[#ef5a3f] shrink-0" />
              <span className="text-[10px] font-black uppercase tracking-wide text-slate-700 dark:text-slate-300 truncate">
                {currentDate || 'Loading...'}
              </span>
            </div>
          )}
        </div>

      </aside>

      {/* ================= MAIN CONTENT WINDOW ================= */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#f5f5f0] dark:bg-[#131316] transition-colors overflow-hidden">
        
        {/* Header Bar */}
        <header className="h-20 bg-[#f5f5f0] dark:bg-[#131316] px-4 md:px-8 flex items-center justify-between transition-colors shrink-0">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-white dark:bg-[#1f1f23] text-slate-700 dark:text-slate-200 border border-slate-200/60 dark:border-transparent no-outline-card"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-sm md:text-xl font-heading font-black text-slate-800 dark:text-white capitalize tracking-tight">
              {activeMenu === 'dashboard' && 'Dashboard Overview'}
              {activeMenu === 'lead-sources' && 'Lead Sources'}
              {activeMenu === 'manage-leads' && 'Manage Leads'}
              {activeMenu === 'generate-leads' && 'Quick Lead Generator'}
              {activeMenu === 'engage-leads' && 'Campaign Automation'}
              {activeMenu === 'team' && 'Teammates'}
              {activeMenu === 'results' && 'Import logs'}
              {activeMenu === 'ad-accounts' && 'Ad Channel Integrations'}
              {activeMenu === 'whatsapp' && 'WhatsApp API config'}
              {activeMenu === 'tele-calling' && 'Tele Calling Logger'}
              {activeMenu === 'api-center' && 'Developer webhooks'}
            </h2>
            <p className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-0.5">
              {activeMenu === 'dashboard' && 'Welcome VK Test / Real-time CRM Analytics'}
              {activeMenu === 'lead-sources' && 'Upload CSV files or link advertising feeds'}
              {activeMenu === 'manage-leads' && 'Monitor mapped CRM leads and customer values'}
              {activeMenu === 'generate-leads' && 'Manually generate individual leads instantly'}
              {activeMenu === 'engage-leads' && 'Broadcast messages to imported leads'}
              {activeMenu === 'team' && 'Assign lead owners and roles'}
              {activeMenu === 'results' && 'Examine AI validation statistics'}
              {activeMenu === 'ad-accounts' && 'Configure automated lead flow credentials'}
              {activeMenu === 'whatsapp' && 'Link Meta WhatsApp Business accounts'}
              {activeMenu === 'tele-calling' && 'Manage calling agents and numbers'}
              {activeMenu === 'api-center' && 'Configure inbound webhooks for leads'}
            </p>
          </div>
        </div>

          {/* Header Controls */}
          <div className="flex items-center gap-4">
            {/* Search bar in header */}
            <div className="relative hidden md:block">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Global Search..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="bg-white dark:bg-[#1f1f23] rounded-xl pl-9 pr-4 py-2 text-[10px] uppercase font-bold tracking-wider text-slate-700 dark:text-slate-200 outline-none w-52 focus:w-60 focus:ring-1 focus:ring-[#ef5a3f] transition-all duration-200 no-outline-card"
              />
            </div>
            
            <ThemeToggle />
            
            <button
              onClick={() => {
                setModalStep('upload');
                setIsModalOpen(true);
              }}
              className="flex items-center gap-2 px-4.5 py-2.5 bg-[#ef5a3f] hover:bg-[#d94f35] text-white font-black text-[10px] uppercase tracking-wider rounded-xl shadow-md shadow-[#ef5a3f]/10 transition-colors"
            >
              <Upload className="w-3.5 h-3.5" />
              Import CSV
            </button>
          </div>
        </header>

        {/* Scrollable Contents viewport */}
        <div className="flex-1 px-8 pb-8 overflow-y-auto min-h-0">
          
          {/* ================= MENU 1: DASHBOARD VIEW (Mimicking user's uploaded dashboard style) ================= */}
          {activeMenu === 'dashboard' && (
            <div className="space-y-6">
              
              {/* Category Name widget rows + circular progress */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                
                {/* Center table: Category Name top list widget */}
                <div className="lg:col-span-2 bg-white dark:bg-[#1f1f23] p-6 rounded-3xl no-outline-card space-y-4">
                  <div className="flex justify-between items-center select-none">
                    <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                      Category name
                    </span>
                    <span className="text-[9px] font-black uppercase tracking-wider text-[#ef5a3f] hover:underline cursor-pointer">
                      View all
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800/40 text-[9px] uppercase tracking-wider font-extrabold">
                          <th className="py-2.5">Object name</th>
                          <th className="py-2.5">Date</th>
                          <th className="py-2.5">Object</th>
                          <th className="py-2.5 text-right">Name</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100/50 dark:divide-slate-800/10 text-slate-700 dark:text-slate-200">
                        <tr className="hover:bg-slate-50/50 dark:hover:bg-[#28282f]/30 transition-colors">
                          <td className="py-3 font-bold">Lorem ipsum</td>
                          <td className="py-3 font-mono text-[10px] text-slate-400">04/02/2026</td>
                          <td className="py-3 font-bold text-emerald-600 dark:text-emerald-400">+432</td>
                          <td className="py-3 text-right">
                            <span className="inline-block w-4 h-4 rounded-full border-2 border-[#ef5a3f] border-t-transparent animate-spin-slow" />
                          </td>
                        </tr>
                        <tr className="hover:bg-slate-50/50 dark:hover:bg-[#28282f]/30 transition-colors">
                          <td className="py-3 font-bold">Dolor</td>
                          <td className="py-3 font-mono text-[10px] text-slate-400">03/02/2026</td>
                          <td className="py-3 font-bold text-emerald-600 dark:text-emerald-400">+31</td>
                          <td className="py-3 text-right">
                            <span className="inline-block w-4 h-4 rounded-full border-2 border-emerald-500 border-t-transparent" />
                          </td>
                        </tr>
                        <tr className="hover:bg-slate-50/50 dark:hover:bg-[#28282f]/30 transition-colors">
                          <td className="py-3 font-bold">Sit amet</td>
                          <td className="py-3 font-mono text-[10px] text-slate-400">02/02/2026</td>
                          <td className="py-3 font-bold text-rose-500">-75</td>
                          <td className="py-3 text-right">
                            <span className="inline-block w-4 h-4 rounded-full border-2 border-rose-500 border-t-transparent" />
                          </td>
                        </tr>
                        <tr className="hover:bg-slate-50/50 dark:hover:bg-[#28282f]/30 transition-colors">
                          <td className="py-3 font-bold">Consectetuer</td>
                          <td className="py-3 font-mono text-[10px] text-slate-400">01/02/2026</td>
                          <td className="py-3 font-bold text-emerald-600 dark:text-emerald-400">+35</td>
                          <td className="py-3 text-right">
                            <span className="inline-block w-4 h-4 rounded-full border-2 border-amber-500 border-t-transparent" />
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Right widget: Category Name Progress list share */}
                <div className="bg-white dark:bg-[#1f1f23] p-6 rounded-3xl no-outline-card space-y-4">
                  <div className="flex justify-between items-center select-none">
                    <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                      Category name
                    </span>
                  </div>

                  <div className="space-y-4">
                    {/* Item 1 */}
                    <div>
                      <div className="flex justify-between text-[10px] font-bold text-slate-600 dark:text-slate-400 mb-1.5">
                        <span>Lorem ipsum</span>
                        <span>40%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 dark:bg-[#2b2b34] rounded-full overflow-hidden">
                        <div className="bg-[#ef5a3f] h-full rounded-full" style={{ width: '40%' }} />
                      </div>
                    </div>

                    {/* Item 2 */}
                    <div>
                      <div className="flex justify-between text-[10px] font-bold text-slate-600 dark:text-slate-400 mb-1.5">
                        <span>Dolor</span>
                        <span>35%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 dark:bg-[#2b2b34] rounded-full overflow-hidden">
                        <div className="bg-rose-500 h-full rounded-full" style={{ width: '35%' }} />
                      </div>
                    </div>

                    {/* Item 3 */}
                    <div>
                      <div className="flex justify-between text-[10px] font-bold text-slate-600 dark:text-slate-400 mb-1.5">
                        <span>Sit amet</span>
                        <span>15%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 dark:bg-[#2b2b34] rounded-full overflow-hidden">
                        <div className="bg-amber-500 h-full rounded-full" style={{ width: '15%' }} />
                      </div>
                    </div>

                    {/* Item 4 */}
                    <div>
                      <div className="flex justify-between text-[10px] font-bold text-slate-600 dark:text-slate-400 mb-1.5">
                        <span>Consectetuer</span>
                        <span>10%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 dark:bg-[#2b2b34] rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full rounded-full" style={{ width: '10%' }} />
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Bottom Row widgets (Circular Progress + Category Bar chart) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* 1. Bar Chart JAN */}
                <div className="bg-white dark:bg-[#1f1f23] p-6 rounded-3xl no-outline-card flex flex-col justify-between h-48">
                  <div>
                    <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
                      Category name
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 mt-2 block">JAN</span>
                    <span className="text-2xl font-black block mt-0.5 text-slate-800 dark:text-white">12k</span>
                    <span className="text-[10px] font-bold text-emerald-600 mt-0.5 block">+432</span>
                  </div>
                  {/* Small Bar graph visual */}
                  <div className="flex gap-1.5 items-end h-12 w-fit">
                    <div className="w-2.5 bg-slate-200 dark:bg-[#2b2b34] h-6 rounded-t-sm" />
                    <div className="w-2.5 bg-slate-200 dark:bg-[#2b2b34] h-8 rounded-t-sm" />
                    <div className="w-2.5 bg-[#ef5a3f] h-12 rounded-t-sm" />
                  </div>
                </div>

                {/* 2. Arc Gauge Widget matching reference center 75% indicator */}
                <div className="bg-white dark:bg-[#1f1f23] p-6 rounded-3xl no-outline-card flex flex-col justify-between h-48">
                  <div>
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                        Category name
                      </span>
                      <div className="flex gap-1 text-slate-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-end">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block">Lorem ipsum</span>
                      <span className="text-2xl font-black block mt-0.5 text-slate-800 dark:text-white">25k</span>
                      <span className="text-[10px] font-bold text-emerald-600 mt-0.5 block">+136</span>
                    </div>

                    {/* Circular Arc Ring */}
                    <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle
                          cx="32"
                          cy="32"
                          r="25"
                          className="stroke-slate-100 dark:stroke-[#2b2b34] fill-none"
                          strokeWidth="5"
                        />
                        <circle
                          cx="32"
                          cy="32"
                          r="25"
                          className="stroke-[#ef5a3f] fill-none"
                          strokeWidth="5"
                          strokeDasharray={157}
                          strokeDashoffset={157 - (157 * 75) / 100}
                          strokeLinecap="round"
                        />
                      </svg>
                      <span className="absolute text-xs font-black text-slate-800 dark:text-white">75%</span>
                    </div>
                  </div>
                </div>

                {/* 3. Bar Chart Category Name total volume */}
                <div className="bg-white dark:bg-[#1f1f23] p-6 rounded-3xl no-outline-card flex flex-col justify-between h-48">
                  <div>
                    <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
                      Category name
                    </span>
                    <span className="text-2xl font-black block mt-2 text-slate-800 dark:text-white">$4,751</span>
                    <span className="text-[10px] font-bold text-emerald-600 mt-0.5 block">+3.5%</span>
                  </div>
                  {/* Dynamic Vertical Bar Chart */}
                  <div className="flex items-end justify-between gap-2.5 h-16 pt-2">
                    <div className="flex flex-col items-center gap-1 flex-1">
                      <div className="w-2.5 bg-amber-400 rounded-t-sm h-6" />
                      <span className="text-[8px] text-slate-400 dark:text-slate-500 font-bold font-mono">Jan</span>
                    </div>
                    <div className="flex flex-col items-center gap-1 flex-1">
                      <div className="w-2.5 bg-[#ef5a3f] rounded-t-sm h-12" />
                      <span className="text-[8px] text-slate-400 dark:text-slate-500 font-bold font-mono">Feb</span>
                    </div>
                    <div className="flex flex-col items-center gap-1 flex-1">
                      <div className="w-2.5 bg-emerald-500 rounded-t-sm h-9" />
                      <span className="text-[8px] text-slate-400 dark:text-slate-500 font-bold font-mono">Mar</span>
                    </div>
                    <div className="flex flex-col items-center gap-1 flex-1">
                      <div className="w-2.5 bg-[#ef5a3f] rounded-t-sm h-14" />
                      <span className="text-[8px] text-slate-400 dark:text-slate-500 font-bold font-mono">Apr</span>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* ================= MENU 2: LEAD SOURCES ================= */}
          {activeMenu === 'lead-sources' && (
            <div className="space-y-6">
              {/* Integration Header Panel */}
              <div className="bg-white dark:bg-[#1f1f23] rounded-3xl p-6 no-outline-card flex flex-col md:flex-row justify-between items-start md:items-center gap-5 transition-colors">
                <div className="space-y-1.5 max-w-xl">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#ef5a3f]">
                    CSV Integration Engine
                  </span>
                  <h3 className="text-lg font-black text-slate-800 dark:text-white">
                    Intelligently Map Any Lead Export to GrowEasy CRM
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Upload exports from Facebook, Google Ads, Real Estate CRMs, Excel, or marketing sheets. The backend maps and splits phone numbers dynamically, filters out invalid leads, and saves records into the CRM leads store.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setModalStep('upload');
                    setIsModalOpen(true);
                  }}
                  className="flex items-center gap-2 px-5 py-3 bg-[#ef5a3f] hover:bg-[#d94f35] text-white font-black text-[10px] uppercase tracking-wider rounded-xl transition-all shrink-0"
                >
                  <Upload className="w-4 h-4" />
                  Import Leads via CSV
                </button>
              </div>

              {/* Active Channels Grid */}
              <div className="space-y-3">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-600 block mb-3">
                  Lead Integration Channels
                </span>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {/* Google Ads */}
                  <div className="bg-white dark:bg-[#1f1f23] p-5 rounded-2xl no-outline-card flex flex-col justify-between h-36 transition-colors">
                    <div className="flex justify-between items-start">
                      <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center font-black">
                        G
                      </div>
                      <span className="text-[8px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                        Connected
                      </span>
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-800 dark:text-white">Google Search Leads</h4>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">Direct API synchronization active.</p>
                    </div>
                  </div>

                  {/* Facebook Ads */}
                  <div className="bg-white dark:bg-[#1f1f23] p-5 rounded-2xl no-outline-card flex flex-col justify-between h-36 transition-colors">
                    <div className="flex justify-between items-start">
                      <div className="w-9 h-9 rounded-lg bg-blue-600/10 text-blue-600 flex items-center justify-center font-black text-lg">
                        f
                      </div>
                      <span className="text-[8px] bg-slate-200 dark:bg-[#28282f] text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                        Inactive
                      </span>
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-800 dark:text-white">Facebook Instant Forms</h4>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">Meta integration requires authorization.</p>
                    </div>
                  </div>

                  {/* Excel/CSV */}
                  <div className="bg-[#ef5a3f]/5 dark:bg-[#ef5a3f]/10 p-5 rounded-2xl no-outline-card flex flex-col justify-between h-36 transition-colors">
                    <div className="flex justify-between items-start">
                      <div className="w-9 h-9 rounded-lg bg-[#ef5a3f]/10 text-[#ef5a3f] flex items-center justify-center font-black text-xs">
                        CSV
                      </div>
                      <span className="text-[8px] bg-[#ef5a3f]/15 text-[#ef5a3f] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                        Active Manual
                      </span>
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-800 dark:text-white">CSV Mapper</h4>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">Manual parsing and Gemini mapping.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= MENU 3: MANAGE LEADS ================= */}
          {activeMenu === 'manage-leads' && (
            <div className="space-y-5 bg-white dark:bg-[#1f1f23] rounded-3xl p-6 no-outline-card transition-colors">
              {/* Search & Filter bar */}
              <div className="flex flex-col md:flex-row gap-3 justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800/40">
                <div className="relative w-full md:w-80">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search by name, email, company..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full bg-white dark:bg-[#131316] border border-slate-200/70 dark:border-transparent pl-9 pr-4 py-2 rounded-xl text-xs text-slate-700 dark:text-slate-200 outline-none w-full"
                  />
                </div>

                  <CustomDropdown
                    value={statusFilter}
                    onChange={setStatusFilter}
                    options={[
                      { value: '', label: 'All CRM Statuses' },
                      { value: 'GOOD_LEAD_FOLLOW_UP', label: 'Good Lead Follow Up' },
                      { value: 'DID_NOT_CONNECT', label: 'Did Not Connect' },
                      { value: 'BAD_LEAD', label: 'Bad Lead' },
                      { value: 'SALE_DONE', label: 'Sale Done' }
                    ]}
                    className="w-full md:w-56"
                  />
              </div>

              {/* Table */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                <div className="lg:col-span-2 overflow-x-auto max-h-[500px]">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="sticky top-0 bg-slate-50/50 dark:bg-[#25252b] text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800/40 z-10 select-none">
                      <tr>
                          <th className="px-4 py-3 font-bold uppercase tracking-wider">Lead Name</th>
                          <th className="px-4 py-3 font-bold uppercase tracking-wider">Email</th>
                          <th className="px-4 py-3 font-bold uppercase tracking-wider">Company</th>
                          <th className="px-4 py-3 font-bold uppercase tracking-wider">Contact</th>
                          <th className="px-4 py-3 font-bold uppercase tracking-wider">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100/50 dark:divide-slate-850/10">
                      {filteredLeads.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="text-center py-12 text-slate-400 dark:text-slate-600 font-medium">
                            No leads matching selection.
                          </td>
                        </tr>
                      ) : (
                        filteredLeads.map((lead, idx) => (
                          <tr 
                            key={idx} 
                            onClick={() => setSelectedLead(lead)}
                            className={`hover:bg-slate-50/50 dark:hover:bg-[#28282f]/30 transition-colors cursor-pointer ${selectedLead === lead ? 'bg-[#ef5a3f]/5 dark:bg-[#ef5a3f]/10' : ''}`}
                          >
                            <td className="px-4 py-3 font-black text-slate-800 dark:text-white">
                              {lead.name}
                            </td>
                            <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                              {lead.email || '-'}
                            </td>
                            <td className="px-4 py-3 text-slate-600 dark:text-slate-400 truncate max-w-[220px]">
                              {lead.company || '-'}
                            </td>
                            <td className="px-4 py-3 text-slate-600 dark:text-slate-400 font-mono text-[11px]">
                              {lead.country_code} {lead.mobile_without_country_code || '-'}
                            </td>
                            <td className="px-4 py-3">
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
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Lead Details Drawer Panel */}
                <div className="bg-[#f5f5f0] dark:bg-[#28282f]/40 rounded-2xl p-5 space-y-4 text-xs font-semibold">
                  {selectedLead ? (
                    <div className="space-y-4">
                      <div className="pb-3 border-b border-slate-200/50 dark:border-slate-800/40">
                        <h4 className="font-black text-sm text-slate-800 dark:text-white flex items-center gap-1.5">
                          <User className="w-4 h-4 text-[#ef5a3f]" />
                          {selectedLead.name}
                        </h4>
                        <span className="text-[9px] text-slate-400 font-mono block mt-1">Source: {selectedLead.data_source || 'Manual'}</span>
                      </div>
                      
                      <div className="space-y-2.5">
                        <div className="flex gap-2">
                          <span className="w-20 text-slate-400 shrink-0 uppercase tracking-wider text-[9px] font-black">Email:</span>
                          <span className="text-slate-700 dark:text-slate-300 truncate">{selectedLead.email || 'N/A'}</span>
                        </div>
                        <div className="flex gap-2">
                          <span className="w-20 text-slate-400 shrink-0 uppercase tracking-wider text-[9px] font-black">Phone:</span>
                          <span className="text-slate-700 dark:text-slate-300 font-mono">{selectedLead.country_code} {selectedLead.mobile_without_country_code || 'N/A'}</span>
                        </div>
                        <div className="flex gap-2">
                          <span className="w-20 text-slate-400 shrink-0 uppercase tracking-wider text-[9px] font-black">Company:</span>
                          <span className="text-slate-700 dark:text-slate-300">{selectedLead.company || 'N/A'}</span>
                        </div>
                        <div className="flex gap-2">
                          <span className="w-20 text-slate-400 shrink-0 uppercase tracking-wider text-[9px] font-black">Location:</span>
                          <span className="text-slate-700 dark:text-slate-300">{selectedLead.city || 'N/A'} {selectedLead.country}</span>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-200 dark:border-slate-800/40">
                        <span className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1">Remarks</span>
                        <p className="text-[11px] text-slate-600 dark:text-slate-300 bg-white dark:bg-[#1a1a1e] p-2.5 rounded-xl max-h-24 overflow-y-auto whitespace-pre-line leading-relaxed">
                          {selectedLead.crm_note || 'No notes mapped.'}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-16 text-slate-400 dark:text-slate-500 select-none">
                      <HelpCircle className="w-8 h-8 mx-auto mb-2 opacity-50 stroke-1" />
                      Select a lead row to view profile details.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ================= MENU 4: GENERATE LEADS (Quick Form) ================= */}
          {activeMenu === 'generate-leads' && (
            <div className="max-w-xl mx-auto bg-white dark:bg-[#1f1f23] rounded-3xl p-6 no-outline-card transition-colors">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#ef5a3f] block mb-2">
                Quick Action Form
              </span>
              <h3 className="text-lg font-black text-slate-800 dark:text-white mb-6">
                Add New CRM Lead Instantly
              </h3>

              {manualLeadSuccess && (
                <div className="mb-4 p-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs font-bold flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" /> Lead added successfully! Check "Manage Leads".
                </div>
              )}

              <form onSubmit={handleManualLeadSubmit} className="space-y-4 text-xs font-bold text-slate-700 dark:text-slate-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label>Lead Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Abhraneel Dhar"
                      value={manualLeadName}
                      onChange={e => setManualLeadName(e.target.value)}
                      className="bg-white dark:bg-[#131316] border border-slate-200/70 dark:border-transparent focus:border-[#ef5a3f] rounded-xl px-4 py-3 text-xs text-slate-800 dark:text-white outline-none transition-colors"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label>Company Name</label>
                    <input
                      type="text"
                      placeholder="e.g. GrowEasy"
                      value={manualLeadCompany}
                      onChange={e => setManualLeadCompany(e.target.value)}
                      className="bg-white dark:bg-[#131316] border border-slate-200/70 dark:border-transparent focus:border-[#ef5a3f] rounded-xl px-4 py-3 text-xs text-slate-800 dark:text-white outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label>Primary Email Address</label>
                    <input
                      type="email"
                      placeholder="e.g. contact@domain.com"
                      value={manualLeadEmail}
                      onChange={e => setManualLeadEmail(e.target.value)}
                      className="bg-white dark:bg-[#131316] border border-slate-200/70 dark:border-transparent focus:border-[#ef5a3f] rounded-xl px-4 py-3 text-xs text-slate-800 dark:text-white outline-none transition-colors"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label>Mobile Number (with Country Code) *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. +91 9051897280"
                      value={manualLeadPhone}
                      onChange={e => setManualLeadPhone(e.target.value)}
                      className="bg-white dark:bg-[#131316] border border-slate-200/70 dark:border-transparent focus:border-[#ef5a3f] rounded-xl px-4 py-3 text-xs text-slate-800 dark:text-white outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label>CRM Initial Status</label>
                    <CustomDropdown
                      value={manualLeadStatus}
                      onChange={setManualLeadStatus}
                      options={[
                        { value: 'GOOD_LEAD_FOLLOW_UP', label: 'Good Lead Follow Up' },
                        { value: 'DID_NOT_CONNECT', label: 'Did Not Connect' },
                        { value: 'BAD_LEAD', label: 'Bad Lead' },
                        { value: 'SALE_DONE', label: 'Sale Done' }
                      ]}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label>Lead Data Source</label>
                    <CustomDropdown
                      value={manualLeadSource}
                      onChange={setManualLeadSource}
                      options={[
                        { value: 'leads_on_demand', label: 'leads_on_demand' },
                        { value: 'meridian_tower', label: 'meridian_tower' },
                        { value: 'eden_park', label: 'eden_park' },
                        { value: 'varah_swamy', label: 'varah_swamy' },
                        { value: 'sarjapur_plots', label: 'sarjapur_plots' }
                      ]}
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-3 bg-[#ef5a3f] hover:bg-[#d94f35] text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-colors"
                  >
                    Generate Lead Record
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ================= MENU 5: ENGAGE LEADS (Email/WhatsApp campaigns) ================= */}
          {activeMenu === 'engage-leads' && (
            <div className="max-w-xl mx-auto bg-white dark:bg-[#1f1f23] rounded-3xl p-6 no-outline-card transition-colors space-y-6">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-[#ef5a3f] block mb-2">
                  Campaign Engine
                </span>
                <h3 className="text-lg font-black text-slate-800 dark:text-white">
                  Broadcast Campaign Message
                </h3>
                <p className="text-[10px] text-slate-400 mt-1 font-semibold">
                  Send personalized follow-up campaigns directly to all {importedLeads.length} imported leads.
                </p>
              </div>

              {campaignSuccess && (
                <div className="p-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs font-bold flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" /> Message broadcast sent successfully!
                </div>
              )}

              <form onSubmit={handleCampaignSubmit} className="space-y-4 text-xs font-bold text-slate-700 dark:text-slate-300">
                <div className="flex flex-col gap-1.5">
                  <label>Select Channel</label>
                  <CustomDropdown
                    value={campaignChannel}
                    onChange={setCampaignChannel}
                    options={[
                      { value: 'whatsapp', label: 'WhatsApp Business API (Official)' },
                      { value: 'email', label: 'Primary Registered Email' }
                    ]}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label>Subject / Template Identifier</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Welcome Follow Up template_1"
                    value={campaignSubject}
                    onChange={e => setCampaignSubject(e.target.value)}
                    className="bg-white dark:bg-[#131316] border border-slate-200/70 dark:border-transparent rounded-xl px-4 py-3 text-xs outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label>Message Content (supports {"{{name}}"} variable placeholder)</label>
                  <textarea
                    required
                    rows={4}
                    value={campaignBody}
                    onChange={e => setCampaignBody(e.target.value)}
                    className="bg-white dark:bg-[#131316] border border-slate-200/70 dark:border-transparent rounded-xl px-4 py-3 text-xs outline-none font-medium leading-relaxed font-sans"
                  />
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-6 py-3 bg-[#ef5a3f] hover:bg-[#d94f35] text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Launch Campaign
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ================= MENU 6: TEAM MEMBERS ================= */}
          {activeMenu === 'team' && (
            <div className="bg-white dark:bg-[#1f1f23] rounded-3xl p-6 no-outline-card transition-colors space-y-5">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#ef5a3f] block mb-2 select-none">
                CRM Agents list
              </span>
              <h3 className="text-lg font-black text-slate-800 dark:text-white">
                Active Teammates & Lead Owners
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50/50 dark:bg-[#25252b] text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800/40 select-none">
                    <tr>
                      <th className="px-4 py-3 font-bold uppercase tracking-wider">Teammate</th>
                      <th className="px-4 py-3 font-bold uppercase tracking-wider">Email Address</th>
                      <th className="px-4 py-3 font-bold uppercase tracking-wider">Assigned Role</th>
                      <th className="px-4 py-3 font-bold uppercase tracking-wider">Lead count</th>
                      <th className="px-4 py-3 font-bold uppercase tracking-wider text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100/50 dark:divide-slate-850/10 text-slate-700 dark:text-slate-200">
                    <tr>
                      <td className="px-4 py-3 font-black flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-[#ef5a3f] text-white flex items-center justify-center text-[10px] font-bold">V</div>
                        Varun GrowEasy
                      </td>
                      <td className="px-4 py-3 font-mono">varun@groweasy.ai</td>
                      <td className="px-4 py-3 font-bold text-[#ef5a3f] uppercase text-[9px] tracking-wide">Administrator</td>
                      <td className="px-4 py-3 font-bold">{importedLeads.length} leads</td>
                      <td className="px-4 py-3 text-right">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                          Active Admin
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-black flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-[#ef5a3f] text-white flex items-center justify-center text-[10px] font-bold">A</div>
                        Agent Abhraneel
                      </td>
                      <td className="px-4 py-3 font-mono">abhraneel@groweasy.ai</td>
                      <td className="px-4 py-3 font-bold text-slate-500 dark:text-slate-400 uppercase text-[9px] tracking-wide">Closing Agent</td>
                      <td className="px-4 py-3 font-bold">0 leads</td>
                      <td className="px-4 py-3 text-right">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-slate-200 dark:bg-[#28282f] text-slate-500">
                          Offline
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================= VIEW 7: RESULTS LOG ================= */}
          {activeMenu === 'results' && (
            <ResultsView
              totalRows={totalCsvRowsProcessed}
              importedLeads={importedLeads}
              skippedLeads={skippedLeads}
              failedBatchesCount={failedBatches.length}
              onRetryFailed={() => handleConfirmImport(failedBatches)}
              onReset={handleResetImport}
            />
          )}

          {/* ================= VIEW 8: AD ACCOUNTS ================= */}
          {activeMenu === 'ad-accounts' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-[#1f1f23] p-6 rounded-3xl no-outline-card">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#ef5a3f] block mb-2">
                  Ad channels
                </span>
                <h3 className="text-lg font-black text-slate-800 dark:text-white mb-4">Linked Advertising Networks</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Toggle automatic lead sync flows directly from Google Lead Forms or Meta Lead Center. All new submissions are fed into our AI Mapping router.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Facebook ad account */}
                <div className="bg-white dark:bg-[#1f1f23] p-5 rounded-2xl no-outline-card flex flex-col justify-between h-44">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-xs font-black text-slate-800 dark:text-white">Facebook Ads sync flow</h4>
                      <p className="text-[10px] text-slate-400 mt-1">Status: Ready to link</p>
                    </div>
                    <span className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold text-base">f</span>
                  </div>
                  <button className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] uppercase tracking-wider rounded-xl transition-colors">
                    Link Meta Business Account
                  </button>
                </div>

                {/* Google ad account */}
                <div className="bg-white dark:bg-[#1f1f23] p-5 rounded-2xl no-outline-card flex flex-col justify-between h-44">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-xs font-black text-slate-800 dark:text-white">Google Ads sync flow</h4>
                      <p className="text-[10px] text-slate-400 mt-1">Status: Syncing webhook</p>
                    </div>
                    <span className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold text-base">G</span>
                  </div>
                  <button className="w-full py-2.5 bg-[#f5f5f0] dark:bg-[#28282f] text-slate-700 dark:text-slate-300 font-bold text-[10px] uppercase tracking-wider rounded-xl transition-colors border border-slate-200/50 dark:border-slate-800/40">
                    Syncing: active logs
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ================= VIEW 9: WHATSAPP SETUP ================= */}
          {activeMenu === 'whatsapp' && (
            <div className="max-w-xl mx-auto bg-white dark:bg-[#1f1f23] rounded-3xl p-6 no-outline-card transition-colors space-y-6">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-[#ef5a3f] block mb-2">
                  Meta settings
                </span>
                <h3 className="text-lg font-black text-slate-800 dark:text-white">WhatsApp Business API Link</h3>
                <p className="text-[10px] text-slate-400 mt-1">Sync your official WhatsApp Business templates to GrowEasy for automation.</p>
              </div>

              <div className="p-4 bg-slate-100/60 dark:bg-[#28282f]/30 rounded-2xl space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold">API Profile connection</span>
                  <span className="text-[9px] font-bold bg-[#ef5a3f]/10 text-[#ef5a3f] px-2 py-0.5 rounded-full">Not connected</span>
                </div>
                <p className="text-[10px] text-slate-500 leading-relaxed">
                  Connecting requires pasting your WhatsApp System Token from your Meta Developer Dashboard into the secure API variables space.
                </p>
              </div>

              <div className="space-y-4 text-xs font-bold text-slate-700 dark:text-slate-300">
                <div className="flex flex-col gap-1">
                  <label>WhatsApp Phone ID</label>
                  <input type="text" placeholder="e.g. 102948158102391" className="bg-white dark:bg-[#131316] border border-slate-200/70 dark:border-transparent rounded-xl px-4 py-3 text-xs outline-none" />
                </div>
                <div className="flex flex-col gap-1">
                  <label>System User Access Token</label>
                  <input type="password" placeholder="EAABw..." className="bg-white dark:bg-[#131316] border border-slate-200/70 dark:border-transparent rounded-xl px-4 py-3 text-xs outline-none" />
                </div>
                <button className="w-full py-3 bg-[#ef5a3f] hover:bg-[#d94f35] text-white font-black text-xs uppercase tracking-wider rounded-xl transition-colors">
                  Save API settings
                </button>
              </div>
            </div>
          )}

          {/* ================= VIEW 10: TELE CALLING ================= */}
          {activeMenu === 'tele-calling' && (
            <div className="bg-white dark:bg-[#1f1f23] rounded-3xl p-6 no-outline-card transition-colors space-y-5">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#ef5a3f] block mb-2 select-none">
                Dialer logs
              </span>
              <h3 className="text-lg font-black text-slate-800 dark:text-white">Recent Call Activities</h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50/50 dark:bg-[#25252b] text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800/40 select-none">
                    <tr>
                      <th className="px-4 py-3 font-bold uppercase tracking-wider">Lead Name</th>
                      <th className="px-4 py-3 font-bold uppercase tracking-wider">Number</th>
                      <th className="px-4 py-3 font-bold uppercase tracking-wider">Agent</th>
                      <th className="px-4 py-3 font-bold uppercase tracking-wider">Duration</th>
                      <th className="px-4 py-3 font-bold uppercase tracking-wider text-right">Call Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100/50 dark:divide-slate-850/10 text-slate-700 dark:text-slate-200">
                    <tr>
                      <td className="px-4 py-3 font-bold">John Doe</td>
                      <td className="px-4 py-3 font-mono">+91 9876543210</td>
                      <td className="px-4 py-3">varun@groweasy.ai</td>
                      <td className="px-4 py-3 font-mono">02 min 14 sec</td>
                      <td className="px-4 py-3 text-right">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                          Connected
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-bold">Sarah Johnson</td>
                      <td className="px-4 py-3 font-mono">+91 9876543211</td>
                      <td className="px-4 py-3">varun@groweasy.ai</td>
                      <td className="px-4 py-3 font-mono">00 min 45 sec</td>
                      <td className="px-4 py-3 text-right">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400">
                          No Answer
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================= VIEW 11: API WEBHOOKS ================= */}
          {activeMenu === 'api-center' && (
            <div className="max-w-2xl mx-auto bg-white dark:bg-[#1f1f23] rounded-3xl p-6 no-outline-card transition-colors space-y-6">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-[#ef5a3f] block mb-2">
                  Developer center
                </span>
                <h3 className="text-lg font-black text-slate-800 dark:text-white">API Leads Webhook Integration</h3>
                <p className="text-xs text-slate-400 mt-1">Inbound JSON leads webhook endpoint. Configure this URL in Facebook Forms or Zapier.</p>
              </div>

              <div className="space-y-4">
                <div className="flex flex-col gap-1.5 text-xs font-bold">
                  <label className="text-slate-400 uppercase tracking-widest text-[9px] font-black">Inbound Webhook Url</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      readOnly 
                      value="http://localhost:5000/api/webhook/inbound-lead" 
                      className="bg-white dark:bg-[#131316] border border-slate-200/70 dark:border-transparent rounded-xl px-4 py-3 text-xs outline-none flex-1 font-mono font-medium text-slate-700 dark:text-slate-300" 
                    />
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText('http://localhost:5000/api/webhook/inbound-lead');
                        alert('Webhook URL copied to clipboard!');
                      }}
                      className="px-4 py-3 bg-slate-100 dark:bg-[#28282f] text-slate-700 dark:text-slate-300 rounded-xl hover:opacity-90 font-bold"
                    >
                      Copy
                    </button>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800/40 space-y-3 text-xs">
                  <span className="font-black uppercase tracking-widest text-[9px] text-slate-400">Post Payload Structure</span>
                  <pre className="bg-[#f5f5f0] dark:bg-[#131316] p-4 rounded-2xl text-[10px] font-mono text-[#ef5a3f] leading-relaxed overflow-x-auto">
{`{
  "event": "lead_created",
  "data": {
    "name": "Abhraneel Dhar",
    "email": "abhraneeldhar@groweasy.ai",
    "phone": "+91 9051897280",
    "company": "GrowEasy CRM"
  }
}`}
                  </pre>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* ================= FILE IMPORT MODAL OVERLAY ================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          
          {/* STEP 1: Upload Drop Box */}
          {modalStep === 'upload' && (
            <FileUpload
              onFileLoaded={handleFileLoaded}
              onCancel={() => setIsModalOpen(false)}
            />
          )}

          {/* STEP 2: Preview Grid inside Modal */}
          {modalStep === 'preview' && (
            <div className="w-full max-w-4xl bg-white dark:bg-[#1f1f23] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] transition-colors no-outline-card">
              <div className="px-6 py-5 bg-slate-50/50 dark:bg-[#28282f]/30 flex justify-between items-center border-b border-slate-100 dark:border-slate-800/40">
                <div>
                  <h3 className="text-sm font-black text-slate-800 dark:text-white flex items-center gap-2 uppercase tracking-wider">
                    <Import className="w-4 h-4 text-[#ef5a3f]" />
                    Review Leads Data Schema
                  </h3>
                  <p className="text-[10px] text-slate-400 font-bold font-mono mt-0.5">
                    {fileName} ({fileSizeStr})
                  </p>
                </div>
                <button
                  onClick={() => setModalStep('upload')}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Preview Table Area */}
              <div className="p-6 overflow-y-auto flex-1 min-h-0">
                <PreviewTable headers={csvHeaders} rows={csvRows} maxHeight={350} />
              </div>

              {/* Modal Footer Controls */}
              <div className="flex justify-between items-center px-6 py-4 bg-slate-50/50 dark:bg-[#28282f]/30">
                <button
                  onClick={() => setModalStep('upload')}
                  className="px-4 py-2 bg-slate-100/70 dark:bg-[#28282f] text-[10px] font-bold uppercase tracking-wider rounded-xl text-slate-700 dark:text-slate-300 hover:opacity-90 transition-opacity"
                >
                  Back
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 bg-slate-100/70 dark:bg-[#28282f] text-[10px] font-bold uppercase tracking-wider rounded-xl text-slate-700 dark:text-slate-300 hover:opacity-90 transition-opacity"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleConfirmImport()}
                    className="px-5 py-2 bg-[#ef5a3f] hover:bg-[#d94f35] text-white text-[10px] font-black uppercase tracking-wider rounded-xl shadow-md transition-colors"
                  >
                    Confirm Import
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Mapping Leads Progress Indicator */}
          {modalStep === 'importing' && (
            <div className="w-full max-w-sm bg-white dark:bg-[#1f1f23] p-8 rounded-3xl shadow-2xl flex flex-col items-center justify-center text-center transition-colors no-outline-card">
              <Loader2 className="w-10 h-10 text-[#ef5a3f] animate-spin mb-4" />
              <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider">
                GrowEasy AI Processing
              </h3>
              <p className="text-[10px] text-slate-400 mt-1 font-semibold">
                Normalizing data formats...
              </p>

              {/* Progress Slider */}
              <div className="w-full bg-slate-100 dark:bg-[#28282f] h-2 rounded-full mt-6 overflow-hidden">
                <div 
                  className="bg-[#ef5a3f] h-full rounded-full transition-all duration-200 ease-out" 
                  style={{ width: `${importProgress}%` }}
                />
              </div>

              <div className="flex justify-between w-full mt-2 select-none">
                <span className="text-[10px] font-black text-[#ef5a3f]">
                  {importProgress}%
                </span>
                <span className="text-[9px] text-slate-400 dark:text-slate-500 font-mono">
                  {currentBatchText}
                </span>
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
}



