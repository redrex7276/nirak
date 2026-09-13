import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  MessageSquare, 
  Send, 
  ArrowLeft,
  X, 
  CheckCircle2, 
  Smartphone,
  Info,
  UserCheck,
  Search,
  CheckCheck,
  ChevronRight,
  Maximize2,
  Minimize2,
  Briefcase
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';

export const SMSActivityPanel: React.FC = () => {
  const { 
    smsMessages, 
    isSMSPanelOpen, 
    setIsSMSPanelOpen, 
    simulateWorkerReply, 
    jobs, 
    applications,
    selectedWorkerForDemo,
    setSelectedWorkerForDemo,
    selectedJobIdForDemo,
    setSelectedJobIdForDemo,
    assignWorker,
    sendOpportunities
  } = useApp();

  const { users } = useAuth();

  const [activeTab, setActiveTab] = useState<'all' | 'accepted' | 'pending'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [customReply, setCustomReply] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [viewMode, setViewMode] = useState<'threads' | 'chat'>('chat');

  // Resolve active job dynamically: prioritized by selectedJobIdForDemo, recent SMS, recent application, or open/sms_sent status
  const activeJob = useMemo(() => {
    if (selectedJobIdForDemo) {
      const found = jobs.find(j => j.id === selectedJobIdForDemo);
      if (found) return found;
    }
    const latestMsg = [...smsMessages].sort((a, b) => (b.id > a.id ? 1 : -1))[0];
    if (latestMsg?.jobId) {
      const found = jobs.find(j => j.id === latestMsg.jobId);
      if (found) return found;
    }
    const latestApp = [...applications].reverse()[0];
    if (latestApp?.jobId) {
      const found = jobs.find(j => j.id === latestApp.jobId);
      if (found) return found;
    }
    return jobs.find(j => j.status === 'sms_sent' || j.status === 'responses_received' || j.status === 'assigned') || jobs[0];
  }, [jobs, selectedJobIdForDemo, smsMessages, applications]);

  // Candidates who have received SMS or have active applications across jobs
  const candidateWorkers = useMemo(() => {
    const list: Array<{
      id: string;
      jobId: string;
      jobTitle: string;
      name: string;
      mobile: string;
      skill: string;
      location: string;
      status: string;
      lastMessage: string;
      lastTime: string;
      unread: boolean;
      messageCount: number;
    }> = [];

    const seen = new Set<string>();

    // 1. Applications for the activeJob
    if (activeJob) {
      const activeApps = applications.filter(a => a.jobId === activeJob.id);
      for (const app of activeApps) {
        seen.add(`${activeJob.id}-${app.workerId}`);
        const u = users.find(user => user.id === app.workerId || user.freelancerProfile?.freelancerId === app.workerId);
        const msgs = smsMessages.filter(m => 
          (m.jobId === activeJob.id || !m.jobId) &&
          (m.workerId === app.workerId || m.workerId === u?.id || m.workerId === u?.freelancerProfile?.freelancerId || (u?.mobile && m.workerPhone && m.workerPhone.replace(/\D/g, '').endsWith(u.mobile.replace(/\D/g, '').slice(-8))))
        );
        const lastMsg = msgs[msgs.length - 1];

        list.push({
          id: app.workerId,
          jobId: activeJob.id,
          jobTitle: activeJob.title,
          name: u?.name || lastMsg?.workerName || 'Worker',
          mobile: u?.mobile || lastMsg?.workerPhone || '+91 98220 12345',
          skill: u?.freelancerProfile?.primarySkill || 'Craftsman',
          location: u?.location || 'Goa',
          status: app.status,
          lastMessage: lastMsg?.content || 'Opportunity sent via SMS',
          lastTime: lastMsg?.timestamp || 'Recently',
          unread: lastMsg?.direction === 'incoming',
          messageCount: msgs.length
        });
      }
    }

    // 2. Applications from other jobs
    const otherApps = applications.filter(a => !activeJob || a.jobId !== activeJob.id);
    for (const app of otherApps) {
      const key = `${app.jobId}-${app.workerId}`;
      if (seen.has(key)) continue;
      seen.add(key);

      const j = jobs.find(job => job.id === app.jobId);
      const u = users.find(user => user.id === app.workerId || user.freelancerProfile?.freelancerId === app.workerId);
      const msgs = smsMessages.filter(m => 
        (m.jobId === app.jobId || !m.jobId) &&
        (m.workerId === app.workerId || m.workerId === u?.id || m.workerId === u?.freelancerProfile?.freelancerId || (u?.mobile && m.workerPhone && m.workerPhone.replace(/\D/g, '').endsWith(u.mobile.replace(/\D/g, '').slice(-8))))
      );
      const lastMsg = msgs[msgs.length - 1];

      list.push({
        id: app.workerId,
        jobId: app.jobId,
        jobTitle: j?.title || 'Work Opportunity',
        name: u?.name || lastMsg?.workerName || 'Worker',
        mobile: u?.mobile || lastMsg?.workerPhone || '+91 98220 12345',
        skill: u?.freelancerProfile?.primarySkill || 'Craftsman',
        location: u?.location || 'Goa',
        status: app.status,
        lastMessage: lastMsg?.content || 'Opportunity sent via SMS',
        lastTime: lastMsg?.timestamp || 'Recently',
        unread: lastMsg?.direction === 'incoming',
        messageCount: msgs.length
      });
    }

    // 3. Workers with SMS messages but no explicit application record
    for (const msg of smsMessages) {
      if (!msg.workerId) continue;
      const msgJobId = msg.jobId || activeJob?.id || 'job-1';
      const key = `${msgJobId}-${msg.workerId}`;
      if (seen.has(key)) continue;
      seen.add(key);

      const j = jobs.find(job => job.id === msgJobId);
      const u = users.find(user => user.id === msg.workerId || user.freelancerProfile?.freelancerId === msg.workerId);

      list.push({
        id: msg.workerId,
        jobId: msgJobId,
        jobTitle: j?.title || 'Work Opportunity',
        name: u?.name || msg.workerName || 'Worker',
        mobile: u?.mobile || msg.workerPhone || '+91 98000 00000',
        skill: u?.freelancerProfile?.primarySkill || 'Craftsman',
        location: u?.location || 'Goa',
        status: 'sent',
        lastMessage: msg.content,
        lastTime: msg.timestamp,
        unread: msg.direction === 'incoming',
        messageCount: 1
      });
    }

    if (list.length > 0) return list;

    // 4. Default fallback persona
    return [{
      id: 'SQ-F-1042',
      jobId: activeJob?.id || 'job-1',
      jobTitle: activeJob?.title || 'Painting Project',
      name: 'Ramesh Naik',
      mobile: '+91 98221 54321',
      skill: 'Painter',
      location: 'Mapusa, Goa',
      status: 'sent',
      lastMessage: 'Ready for opportunities',
      lastTime: 'Now',
      unread: false,
      messageCount: 0
    }];
  }, [applications, activeJob, users, smsMessages, jobs]);

  // Target worker selection
  const currentWorker = useMemo(() => {
    if (selectedWorkerForDemo) {
      const found = candidateWorkers.find(c => 
        c.id === selectedWorkerForDemo || 
        users.some(u => 
          (u.id === selectedWorkerForDemo || u.freelancerProfile?.freelancerId === selectedWorkerForDemo) && 
          (u.id === c.id || u.freelancerProfile?.freelancerId === c.id)
        )
      );
      if (found) return found;
    }
    const withMsgs = candidateWorkers.find(c => c.messageCount > 0);
    return withMsgs || candidateWorkers[0];
  }, [candidateWorkers, selectedWorkerForDemo, users]);

  const currentWorkerId = currentWorker?.id || selectedWorkerForDemo || 'SQ-F-1042';
  const currentWorkerUser = users.find(u => u.id === currentWorkerId || u.freelancerProfile?.freelancerId === currentWorkerId);
  const currentApplication = activeJob ? applications.find(a => 
    a.jobId === activeJob.id && 
    (a.workerId === currentWorkerId || (currentWorkerUser && (a.workerId === currentWorkerUser.id || a.workerId === currentWorkerUser.freelancerProfile?.freelancerId)))
  ) : null;

  // Messages for currently selected worker (sorted chronologically oldest -> newest for chat thread)
  const workerMessages = useMemo(() => {
    const list = smsMessages.filter(m => {
      const matchesWorker = 
        m.workerId === currentWorkerId ||
        (currentWorkerUser && (m.workerId === currentWorkerUser.id || m.workerId === currentWorkerUser.freelancerProfile?.freelancerId)) ||
        (currentWorker?.mobile && m.workerPhone && (
          m.workerPhone.replace(/\D/g, '').endsWith(currentWorker.mobile.replace(/\D/g, '').slice(-8))
        ));

      if (!matchesWorker) return false;

      if (activeJob && m.jobId) {
        return m.jobId === activeJob.id;
      }
      return true;
    });
    return [...list].reverse();
  }, [smsMessages, currentWorkerId, currentWorkerUser, currentWorker, activeJob]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [workerMessages.length]);

  // Other workers with active messages
  const otherWorkersWithMessages = useMemo(() => {
    return candidateWorkers.filter(w => w.id !== currentWorkerId && w.messageCount > 0);
  }, [candidateWorkers, currentWorkerId]);

  // Status mapping
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'accepted':
        return { label: 'Accepted Terms (1)', bg: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
      case 'details_requested':
        return { label: 'Viewed Details (1)', bg: 'bg-amber-100 text-amber-800 border-amber-300' };
      case 'assigned':
        return { label: 'Assigned to Crew', bg: 'bg-teal-100 text-teal-800 border-teal-300' };
      case 'rejected':
        return { label: 'Declined (0)', bg: 'bg-rose-100 text-rose-800 border-rose-300' };
      case 'completed':
        return { label: 'Work Completed', bg: 'bg-purple-100 text-purple-800 border-purple-300' };
      default:
        return { label: 'Awaiting Reply', bg: 'bg-slate-100 text-slate-700 border-slate-200' };
    }
  };

  // Filtered workers list for Inbox
  const filteredCandidates = candidateWorkers.filter(w => {
    const matchesSearch = 
      w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.skill.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.mobile.includes(searchQuery);

    if (activeTab === 'accepted') {
      return matchesSearch && (w.status === 'accepted' || w.status === 'assigned');
    }
    if (activeTab === 'pending') {
      return matchesSearch && (w.status === 'sent' || w.status === 'details_requested');
    }
    return matchesSearch;
  });

  const handleSendCustom = async (textToSend?: string) => {
    const text = (textToSend !== undefined ? textToSend : customReply).trim();
    if (text) {
      const targetJobId = activeJob?.id || selectedJobIdForDemo || 'SQ-J-3001';
      await simulateWorkerReply(targetJobId, currentWorkerId, text);
      if (textToSend === undefined) {
        setCustomReply('');
      }
    }
  };

  const handleAssignCurrent = async () => {
    if (activeJob && currentWorkerId) {
      await assignWorker(activeJob.id, currentWorkerId);
    }
  };

  // Closed Floating Launcher
  if (!isSMSPanelOpen) {
    const incomingCount = smsMessages.filter(m => m.direction === 'incoming').length;
    return (
      <aside 
        aria-label="SMS Messages Drawer"
        className="fixed bottom-5 left-5 z-40"
      >
        <button
          onClick={() => setIsSMSPanelOpen(true)}
          className="group relative flex items-center gap-2.5 px-4 py-3 bg-navy-950 hover:bg-navy-900 text-white rounded-full shadow-2xl border border-navy-800 hover:scale-105 active:scale-95 transition-all cursor-pointer"
          title="Open Messages & SMS Gateway"
        >
          <div className="w-8 h-8 rounded-full bg-shramik-500/20 text-shramik-400 flex items-center justify-center font-bold">
            <Smartphone className="w-4 h-4" />
          </div>
          
          <div className="text-left pr-1">
            <span className="block text-xs font-bold font-display tracking-tight text-white leading-tight">
              Messages
            </span>
            <span className="block text-[10px] text-slate-300 font-medium">
              SMS Gateway
            </span>
          </div>

          {incomingCount > 0 && (
            <span className="bg-emerald-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm">
              {incomingCount} new
            </span>
          )}
        </button>
      </aside>
    );
  }

  const badge = getStatusBadge(currentApplication?.status || currentWorker?.status || 'sent');
  const isAccepted = (currentApplication?.status === 'accepted') || (currentWorker?.status === 'accepted');
  const isAssigned = (currentApplication?.status === 'assigned') || (currentWorker?.status === 'assigned');

  return (
    <aside 
      aria-label="Messages & SMS Center"
      className={`fixed bottom-0 left-0 right-0 sm:right-auto sm:left-6 sm:bottom-6 z-50 flex flex-col bg-white border border-slate-300 sm:rounded-3xl shadow-2xl overflow-hidden transition-all duration-300 ${
        isExpanded 
          ? 'w-full sm:w-[680px] h-[90vh]' 
          : 'w-full sm:w-[480px] h-[600px] max-h-[85vh]'
      }`}
    >
      {/* Top Header */}
      <div className="bg-gradient-to-r from-navy-950 via-navy-900 to-slate-900 text-white px-4 py-3 flex items-center justify-between border-b border-navy-800 select-none">
        <div className="flex items-center gap-3">
          {viewMode === 'chat' && candidateWorkers.length > 1 && (
            <button
              onClick={() => setViewMode('threads')}
              className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors mr-0.5"
              title="View all conversations"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}

          <div className="w-8 h-8 rounded-xl bg-shramik-500/20 text-shramik-400 flex items-center justify-center font-bold">
            <Smartphone className="w-4 h-4" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display font-extrabold text-sm tracking-tight text-white">
                {viewMode === 'threads' ? 'Messages & SMS Inbox' : currentWorker?.name || 'SMS Messenger'}
              </h3>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.2 rounded-full font-bold">
                Zero-Data SMS
              </span>
            </div>
            <p className="text-[11px] text-slate-300">
              {viewMode === 'threads' 
                ? `${candidateWorkers.length} active worker conversation${candidateWorkers.length === 1 ? '' : 's'}`
                : `${currentWorker?.skill} • ${currentWorker?.mobile}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-slate-300">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg hover:bg-white/10 hover:text-white transition-colors"
            title={isExpanded ? 'Compact view' : 'Expand view'}
          >
            {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setIsSMSPanelOpen(false)}
            className="p-1.5 rounded-lg hover:bg-white/10 hover:text-white transition-colors"
            title="Close Messages"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Project Switcher Bar */}
      <div className="bg-navy-950 text-slate-300 px-3.5 py-2 flex items-center justify-between text-xs border-b border-navy-800">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <Briefcase className="w-3.5 h-3.5 text-shramik-400 shrink-0" />
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider shrink-0">Job:</span>
          <select
            value={activeJob?.id || ''}
            onChange={(e) => {
              const newJobId = e.target.value;
              setSelectedJobIdForDemo(newJobId);
              const jobWorker = candidateWorkers.find(c => c.jobId === newJobId);
              if (jobWorker) {
                setSelectedWorkerForDemo(jobWorker.id);
              }
            }}
            className="bg-navy-900 hover:bg-navy-850 text-white font-bold text-xs px-2.5 py-1 rounded-xl border border-navy-700 focus:outline-none focus:ring-1 focus:ring-shramik-500 truncate max-w-[210px] sm:max-w-[300px] cursor-pointer"
          >
            {jobs.map(j => (
              <option key={j.id} value={j.id}>
                {j.title} ({j.location}) {j.status === 'sms_sent' ? '• Dispatched' : ''}
              </option>
            ))}
          </select>
        </div>
        
        {activeJob && (
          <span className="text-[11px] font-semibold text-shramik-300 shrink-0 pl-2">
            ₹{activeJob.paymentAmount}/day
          </span>
        )}
      </div>

      {/* VIEW 1: CONVERSATIONS LIST (INBOX) */}
      {viewMode === 'threads' ? (
        <div className="flex-1 flex flex-col bg-slate-50 overflow-hidden">
          {/* Search & Tabs */}
          <div className="p-3 bg-white border-b border-slate-200 space-y-2.5">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search worker by name, trade, gig or phone..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-shramik-500/30"
              />
            </div>

            <div className="flex gap-1.5 text-xs font-bold">
              {[
                { id: 'all', label: `All (${candidateWorkers.length})` },
                { id: 'accepted', label: 'Accepted (1)' },
                { id: 'pending', label: 'Awaiting' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3 py-1 rounded-lg text-[11px] transition-colors ${
                    activeTab === tab.id
                      ? 'bg-navy-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Conversations Thread List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
            {filteredCandidates.length === 0 ? (
              <div className="text-center py-12 px-4 text-slate-500">
                <MessageSquare className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                <p className="font-semibold text-slate-700 text-xs">No conversations found</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Opportunities sent to workers will automatically show up here.
                </p>
              </div>
            ) : (
              filteredCandidates.map(w => {
                const wBadge = getStatusBadge(w.status);
                const isSelected = w.id === currentWorkerId;
                return (
                  <button
                    key={`${w.jobId}-${w.id}`}
                    onClick={() => {
                      if (w.jobId) setSelectedJobIdForDemo(w.jobId);
                      setSelectedWorkerForDemo(w.id || 'SQ-F-1042');
                      setViewMode('chat');
                    }}
                    className={`w-full text-left p-3 rounded-2xl transition-all border flex items-center justify-between gap-3 ${
                      isSelected 
                        ? 'bg-shramik-50/70 border-shramik-300 shadow-sm' 
                        : 'bg-white hover:bg-slate-100/80 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-2xl bg-navy-900 text-white font-bold text-xs flex items-center justify-center shrink-0">
                        {w.name.charAt(0)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-900 text-xs truncate">{w.name}</h4>
                          <span className={`text-[9px] font-extrabold uppercase px-2 py-0.2 rounded-full border ${wBadge.bg}`}>
                            {w.status.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">
                          {w.lastMessage}
                        </p>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-1">
                          <span className="font-semibold text-shramik-700">{w.jobTitle}</span>
                          <span>•</span>
                          <span>{w.skill}</span>
                          <span>•</span>
                          <span>{w.lastTime}</span>
                        </div>
                      </div>
                    </div>

                    <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                  </button>
                );
              })
            )}
          </div>
        </div>
      ) : (
        /* VIEW 2: 1-ON-1 SMS CHAT VIEW */
        <div className="flex-1 flex flex-col bg-slate-50 overflow-hidden">
          
          {/* Worker Subheader with Quick Assignment */}
          <div className="bg-white border-b border-slate-200 p-3 flex flex-wrap items-center justify-between gap-2 shadow-2xs">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-navy-900 text-white text-xs font-bold flex items-center justify-center">
                {currentWorker?.name.charAt(0) || 'W'}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-xs text-slate-900">{currentWorker?.name}</span>
                  <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border ${badge.bg}`}>
                    {badge.label}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-slate-500">
                  <span>{currentWorker?.mobile}</span>
                  <span>•</span>
                  <span>{activeJob ? activeJob.title : 'Current Gig'}</span>
                </div>
              </div>
            </div>

            {/* Quick Assign Button */}
            <div className="flex items-center gap-1.5">
              {isAccepted && !isAssigned && (
                <button
                  onClick={handleAssignCurrent}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm active:scale-95 transition-all"
                  title="Directly assign worker to this project"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Assign to Crew</span>
                </button>
              )}

              {isAssigned && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                  <span>Assigned</span>
                </span>
              )}

              {candidateWorkers.length > 1 && (
                <button
                  onClick={() => setViewMode('threads')}
                  className="text-xs font-semibold text-slate-500 hover:text-navy-900 px-2 py-1 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  All Inbox
                </button>
              )}
            </div>
          </div>

          {/* Quick Candidate Switching Strip */}
          {candidateWorkers.length > 1 && (
            <div className="bg-white/90 backdrop-blur-xs px-3 py-1.5 border-b border-slate-200 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              <span className="text-[10px] font-bold text-slate-400 uppercase shrink-0">Candidates:</span>
              {candidateWorkers.map(w => {
                const isSelected = w.id === currentWorkerId;
                return (
                  <button
                    key={`${w.jobId}-${w.id}`}
                    onClick={() => {
                      if (w.jobId) setSelectedJobIdForDemo(w.jobId);
                      setSelectedWorkerForDemo(w.id);
                    }}
                    className={`shrink-0 text-xs px-2.5 py-1 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      isSelected
                        ? 'bg-navy-900 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <span>{w.name}</span>
                    {w.messageCount > 0 && (
                      <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-black ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-800'}`}>
                        {w.messageCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* SMS Feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-100/60">
            {workerMessages.length === 0 ? (
              <div className="text-center py-10 px-4 text-slate-500">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 border border-amber-200 flex items-center justify-center mx-auto mb-3">
                  <Smartphone className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-slate-800 text-sm">No Opportunity Dispatched Yet</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                  {currentWorker?.name} has not received an SMS opportunity for <strong>{activeJob?.title || 'this job'}</strong> yet.
                </p>

                {activeJob && (
                  <div className="mt-4">
                    <button
                      onClick={() => {
                        sendOpportunities(activeJob.id, [currentWorkerId]);
                      }}
                      className="tactile-btn-primary bg-amber-500 hover:bg-amber-600 shadow-[0_4px_0_0_#d97706] text-xs font-bold px-4 py-2.5 inline-flex items-center gap-2 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Send Opportunity to {currentWorker?.name} Now</span>
                    </button>
                  </div>
                )}

                {otherWorkersWithMessages.length > 0 && (
                  <div className="mt-6 pt-4 border-t border-slate-200">
                    <span className="text-[11px] font-bold text-slate-400 block mb-2 uppercase tracking-wide">
                      Workers with Active SMS Conversations:
                    </span>
                    <div className="flex flex-wrap gap-1.5 justify-center">
                      {otherWorkersWithMessages.map(w => (
                        <button
                          key={`${w.jobId}-${w.id}`}
                          onClick={() => {
                            if (w.jobId) setSelectedJobIdForDemo(w.jobId);
                            setSelectedWorkerForDemo(w.id);
                          }}
                          className="text-xs font-bold text-navy-900 bg-white hover:bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <span>{w.name}</span>
                          <span className="text-[10px] text-slate-400">({w.jobTitle})</span>
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              workerMessages.map((msg) => {
                const isOutgoing = msg.direction === 'outgoing';
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isOutgoing ? 'items-end' : 'items-start'}`}
                  >
                    {/* Direction label & timestamp */}
                    <div className="flex items-center gap-1.5 mb-1 px-1 text-[10px] text-slate-400 font-medium">
                      {isOutgoing ? (
                        <span>Shramik System → {msg.workerName}</span>
                      ) : (
                        <span className="text-emerald-700 font-bold">{msg.workerName} (SMS)</span>
                      )}
                      <span>•</span>
                      <span>{msg.timestamp}</span>
                    </div>

                    {/* Chat Bubble */}
                    <div
                      className={`max-w-[85%] p-3.5 rounded-2xl whitespace-pre-line text-xs leading-relaxed font-sans shadow-sm ${
                        isOutgoing
                          ? 'bg-navy-900 text-white rounded-tr-none border border-navy-800 shadow-navy-900/10'
                          : 'bg-emerald-50 text-slate-900 border-2 border-emerald-300 rounded-tl-none font-medium'
                      }`}
                    >
                      {msg.content}
                    </div>

                    {/* Delivery indicator */}
                    <div className="flex items-center gap-1 mt-1 px-1 text-[10px] text-slate-400">
                      {isOutgoing ? (
                        <>
                          <CheckCheck className="w-3 h-3 text-emerald-500" />
                          <span className="uppercase text-[9px] font-bold">Delivered</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span className="uppercase text-[9px] font-bold text-emerald-700">SMS Received</span>
                        </>
                      )}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Action Response Chips */}
          <div className="bg-white border-t border-slate-200 p-2.5 space-y-2">
            <div className="flex items-center justify-between text-[11px] text-slate-500 px-1 font-semibold">
              <span>Quick Worker Responses:</span>
              <span className="text-slate-400 text-[10px]">Click to simulate SMS reply</span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => handleSendCustom('1')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-900 bg-emerald-100 hover:bg-emerald-200 active:bg-emerald-300 border border-emerald-300 transition-all cursor-pointer"
                title="Simulate worker sending '1'"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>Reply: 1 (Interested / Accept)</span>
              </button>

              <button
                type="button"
                onClick={() => handleSendCustom('0')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-rose-800 bg-rose-50 hover:bg-rose-100 active:bg-rose-200 border border-rose-200 transition-all cursor-pointer"
                title="Simulate worker sending '0'"
              >
                <span className="w-2 h-2 rounded-full bg-rose-400"></span>
                <span>Reply: 0 (Decline)</span>
              </button>

              <button
                type="button"
                onClick={() => handleSendCustom('2')}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-all cursor-pointer"
                title="Simulate asking for help / information"
              >
                <span>Reply: 2 (Help)</span>
              </button>
            </div>

            {/* Custom Input Bar */}
            <div className="flex gap-1.5 pt-1">
              <input
                type="text"
                value={customReply}
                onChange={(e) => setCustomReply(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSendCustom();
                  }
                }}
                placeholder="Type SMS reply (e.g. 1, 0, or message)..."
                className="flex-1 text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-shramik-500/30"
              />
              <button
                onClick={() => handleSendCustom()}
                disabled={!customReply.trim()}
                className="px-4 py-2 text-xs font-bold bg-navy-900 text-white hover:bg-navy-800 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send</span>
              </button>
            </div>
          </div>

          {/* Clean Footer Note */}
          <div className="bg-slate-50 px-3 py-2 border-t border-slate-200 text-center text-[10px] text-slate-500 flex items-center justify-center gap-1.5">
            <Info className="w-3 h-3 text-shramik-600 shrink-0" />
            <span>Workers send & receive these via regular telecom SMS. Internet is not required.</span>
          </div>

        </div>
      )}
    </aside>
  );
};
