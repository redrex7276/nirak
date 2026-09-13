import React, { useState, useMemo } from 'react';
import { 
  MessageSquare, 
  Send, 
  ArrowLeft,
  X, 
  CheckCircle2, 
  Clock, 
  Smartphone,
  Info,
  UserCheck,
  Search,
  CheckCheck,
  Phone,
  Briefcase,
  MapPin,
  Sparkles,
  ChevronRight,
  Maximize2,
  Minimize2
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
    assignWorker
  } = useApp();

  const { users } = useAuth();

  const [activeTab, setActiveTab] = useState<'all' | 'accepted' | 'pending'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [customReply, setCustomReply] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [viewMode, setViewMode] = useState<'threads' | 'chat'>('chat');

  // Find active job for demo context (defaults to first open/sms_sent job)
  const activeJob = jobs.find(j => j.status === 'sms_sent' || j.status === 'responses_received' || j.status === 'assigned') || jobs[0];

  // Candidates who have received SMS or are eligible workers
  const candidateWorkers = useMemo(() => {
    // 1. Workers with active applications
    const appWorkers = applications
      .filter(a => !activeJob || a.jobId === activeJob.id)
      .map(a => {
        const u = users.find(user => user.id === a.workerId || user.freelancerProfile?.freelancerId === a.workerId);
        const lastMsg = [...smsMessages]
          .filter(m => m.workerId === a.workerId)
          .sort((x, y) => (y.id > x.id ? 1 : -1))[0];

        return {
          id: a.workerId,
          name: u?.name || 'Worker',
          mobile: u?.mobile || '+91 98220 12345',
          skill: u?.freelancerProfile?.primarySkill || 'Craftsman',
          location: u?.location || 'Goa',
          status: a.status,
          lastMessage: lastMsg?.content || 'Opportunity sent via SMS',
          lastTime: lastMsg?.timestamp || 'Recently',
          unread: lastMsg?.direction === 'incoming'
        };
      });

    if (appWorkers.length > 0) return appWorkers;

    // Fallback: extract distinct workers from smsMessages
    const workerIds = Array.from(new Set(smsMessages.map(m => m.workerId)));
    if (workerIds.length > 0) {
      return workerIds.map(wid => {
        const u = users.find(user => user.id === wid || user.freelancerProfile?.freelancerId === wid);
        const lastMsg = [...smsMessages]
          .filter(m => m.workerId === wid)
          .sort((x, y) => (y.id > x.id ? 1 : -1))[0];
        const app = applications.find(a => a.workerId === wid);

        return {
          id: wid,
          name: u?.name || lastMsg?.workerName || 'Worker',
          mobile: u?.mobile || lastMsg?.workerPhone || '+91 98000 00000',
          skill: u?.freelancerProfile?.primarySkill || 'Craftsman',
          location: u?.location || 'Goa',
          status: app?.status || 'sent',
          lastMessage: lastMsg?.content || 'SMS thread started',
          lastTime: lastMsg?.timestamp || 'Recently',
          unread: lastMsg?.direction === 'incoming'
        };
      });
    }

    // Default persona if completely empty
    return [{
      id: 'SQ-F-1042',
      name: 'Ramesh Naik',
      mobile: '+91 98221 54321',
      skill: 'Painter',
      location: 'Mapusa, Goa',
      status: 'sent',
      lastMessage: 'Ready for opportunities',
      lastTime: 'Now',
      unread: false
    }];
  }, [applications, activeJob, users, smsMessages]);

  // Target worker
  const currentWorkerId = selectedWorkerForDemo || candidateWorkers[0]?.id || 'SQ-F-1042';
  const currentWorker = candidateWorkers.find(c => c.id === currentWorkerId) || candidateWorkers[0];
  const currentWorkerUser = users.find(u => u.id === currentWorkerId || u.freelancerProfile?.freelancerId === currentWorkerId);
  const currentApplication = activeJob ? applications.find(a => a.jobId === activeJob.id && a.workerId === currentWorkerId) : null;

  // Messages for currently selected worker
  const workerMessages = useMemo(() => {
    return smsMessages.filter(m => m.workerId === currentWorkerId);
  }, [smsMessages, currentWorkerId]);

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

  // Filtered workers list
  const filteredCandidates = candidateWorkers.filter(w => {
    const matchesSearch = 
      w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.skill.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.mobile.includes(searchQuery);

    if (activeTab === 'accepted') {
      return matchesSearch && (w.status === 'accepted' || w.status === 'assigned');
    }
    if (activeTab === 'pending') {
      return matchesSearch && (w.status === 'sent' || w.status === 'details_requested');
    }
    return matchesSearch;
  });

  const handleSendCustom = (textToSend?: string) => {
    const text = (textToSend !== undefined ? textToSend : customReply).trim();
    if (activeJob && text) {
      simulateWorkerReply(activeJob.id, currentWorkerId, text);
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
          : 'w-full sm:w-[460px] h-[580px] max-h-[85vh]'
      }`}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-navy-950 via-navy-900 to-slate-900 text-white px-4 py-3.5 flex items-center justify-between border-b border-navy-800 select-none">
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
                ? `${candidateWorkers.length} active worker conversations`
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
                placeholder="Search worker by name, trade or phone..."
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
                    key={w.id}
                    onClick={() => {
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
                          <span>{w.skill}</span>
                          <span>•</span>
                          <span>{w.mobile}</span>
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
                  Switch Worker
                </button>
              )}
            </div>
          </div>

          {/* SMS Feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-100/60">
            {workerMessages.length === 0 ? (
              <div className="text-center py-12 px-4 text-slate-500">
                <Smartphone className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                <h4 className="font-bold text-slate-700 text-sm">No SMS messages yet</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                  When you dispatch job opportunities to {currentWorker?.name || 'this worker'}, outgoing SMS and their replies appear here.
                </p>
                <div className="mt-4">
                  <button
                    onClick={() => handleSendCustom('1')}
                    className="tactile-btn-primary text-xs font-bold px-4 py-2"
                  >
                    Simulate Worker Reply (1)
                  </button>
                </div>
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
          </div>

          {/* Quick Action Response Chips ("Simple & Easy to use") */}
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
