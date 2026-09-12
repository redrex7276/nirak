import React from 'react';
import { 
  MessageSquare, 
  Send, 
  ArrowDownLeft, 
  ArrowUpRight, 
  ChevronDown, 
  ChevronUp, 
  X, 
  CheckCircle2, 
  Clock, 
  Smartphone,
  Info
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
    setSelectedWorkerForDemo 
  } = useApp();

  const { users } = useAuth();

  // Find active job for demo context (defaults to first open/sms_sent job)
  const activeJob = jobs.find(j => j.status === 'sms_sent' || j.status === 'responses_received' || j.status === 'assigned') || jobs[0];

  // Candidates who have received SMS
  const activeWorkerCandidates = applications
    .filter(a => activeJob && a.jobId === activeJob.id)
    .map(a => {
      const u = users.find(user => user.id === a.workerId || user.freelancerProfile?.freelancerId === a.workerId);
      return {
        id: a.workerId,
        name: u?.name || 'Worker',
        status: a.status
      };
    });

  // Target worker
  const currentWorkerId = selectedWorkerForDemo || (activeWorkerCandidates[0]?.id || 'SQ-F-1042');
  const currentWorkerUser = users.find(u => u.id === currentWorkerId || u.freelancerProfile?.freelancerId === currentWorkerId);
  const currentApplication = activeJob ? applications.find(a => a.jobId === activeJob.id && a.workerId === currentWorkerId) : null;

  const [customReply, setCustomReply] = React.useState('');

  const handleSimulateOne = () => {
    if (activeJob) {
      simulateWorkerReply(activeJob.id, currentWorkerId, '1');
    }
  };

  const handleSimulateZero = () => {
    if (activeJob) {
      simulateWorkerReply(activeJob.id, currentWorkerId, '0');
    }
  };

  const handleSimulateCustom = (textToSend?: string) => {
    const text = (textToSend !== undefined ? textToSend : customReply).trim();
    if (activeJob && text) {
      simulateWorkerReply(activeJob.id, currentWorkerId, text);
      if (textToSend === undefined) {
        setCustomReply('');
      }
    }
  };

  if (!isSMSPanelOpen) {
    return (
      <aside 
        aria-label="SMS Activity Drawer"
        className="fixed bottom-4 left-4 z-40"
      >
        <button
          onClick={() => setIsSMSPanelOpen(true)}
          className="tactile-btn-primary shadow-tactile-hover flex items-center gap-2 px-5 py-3 rounded-full text-sm font-semibold"
          title="Open Live SMS Activity Panel"
        >
          <Smartphone className="w-4 h-4" />
          <span>SMS Activity Log</span>
          {smsMessages.length > 0 && (
            <span className="bg-amber-400 text-navy-950 text-xs font-bold px-2 py-0.5 rounded-full">
              {smsMessages.length}
            </span>
          )}
        </button>
      </aside>
    );
  }

  return (
    <aside 
      aria-label="SMS Activity Panel"
      className="fixed bottom-0 left-0 right-0 md:right-auto md:left-6 md:bottom-6 md:w-[480px] max-h-[85vh] z-50 flex flex-col bg-white border-2 border-slate-300 rounded-t-card md:rounded-card shadow-2xl overflow-hidden transition-all duration-300"
    >
      {/* Header */}
      <div className="bg-navy-900 text-white p-4 flex items-center justify-between border-b border-navy-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-shramik-500/20 text-shramik-400 flex items-center justify-center">
            <Smartphone className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="font-bold text-sm tracking-wide">SMS ACTIVITY PANEL</h3>
              <span className="text-[10px] uppercase font-bold bg-teal-warm/20 text-teal-300 px-2 py-0.5 rounded-full">
                Live Gateway
              </span>
              <span className="text-[10px] uppercase font-bold bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                Firebase: shramik-quote
              </span>
            </div>
            <p className="text-xs text-slate-300">Carrier Dispatch & Worker Replies</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsSMSPanelOpen(false)}
            className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-navy-800 transition-colors"
            title="Minimize Panel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Simulator Toolbar */}
      <div className="bg-slate-50 border-b border-slate-200 p-3 space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
            Simulate Worker:
          </label>
          <select
            value={currentWorkerId}
            onChange={(e) => setSelectedWorkerForDemo(e.target.value)}
            className="text-xs font-semibold bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-shramik-500"
          >
            {activeWorkerCandidates.length > 0 ? (
              activeWorkerCandidates.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.status.replace('_', ' ').toUpperCase()})
                </option>
              ))
            ) : (
              <option value="SQ-F-1042">Ramesh Naik (SQ-F-1042)</option>
            )}
          </select>
        </div>

        {/* Action Buttons for Worker Reply */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleSimulateOne}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-900 bg-emerald-400 hover:bg-emerald-500 active:bg-emerald-600 shadow-[0_3px_0_0_#059669] active:shadow-none active:translate-y-0.5 transition-all"
            title="Simulate Worker Replying 1 (Details / Accept)"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Simulate Reply: 1</span>
          </button>

          <button
            onClick={handleSimulateZero}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 bg-rose-100 hover:bg-rose-200 active:bg-rose-300 border border-rose-200 shadow-[0_2px_0_0_#FDA4AF] active:shadow-none active:translate-y-0.5 transition-all"
            title="Simulate Worker Replying 0 (Reject)"
          >
            <X className="w-3.5 h-3.5" />
            <span>Simulate Reply: 0</span>
          </button>
        </div>

        {/* Custom SMS Test Form & QA Edge-Case Inputs */}
        <div className="space-y-1.5 pt-1">
          <div className="flex gap-1.5">
            <input
              type="text"
              value={customReply}
              onChange={(e) => setCustomReply(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSimulateCustom();
                }
              }}
              placeholder="Test reply (e.g. 2, yes, 1 1, 00)..."
              className="flex-1 text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-shramik-500 placeholder:text-slate-400"
            />
            <button
              onClick={() => handleSimulateCustom()}
              disabled={!customReply.trim()}
              className="px-3 py-1.5 text-xs font-bold bg-slate-800 text-white hover:bg-slate-900 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition-colors"
            >
              Send
            </button>
          </div>

          <div className="flex items-center gap-1 overflow-x-auto pb-0.5 text-[10px] text-slate-600">
            <span className="font-semibold text-slate-500 shrink-0">QA Edge:</span>
            {['2', 'yes', 'no', 'accept', '1 1', '00', '10'].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => handleSimulateCustom(preset)}
                className="px-1.5 py-0.5 rounded bg-slate-200 hover:bg-slate-300 text-slate-700 font-mono font-bold transition-colors shrink-0"
                title={`Send "${preset}" to test validation`}
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        {currentApplication && (
          <div className="text-[11px] text-slate-600 bg-white p-2 rounded-xl border border-slate-200 flex items-center justify-between">
            <span>
              Target: <strong className="text-slate-900">{currentWorkerUser?.name || 'Ramesh Naik'}</strong>
            </span>
            <span className="font-semibold text-shramik-700 bg-shramik-50 px-2 py-0.5 rounded-md">
              State: {currentApplication.status.replace('_', ' ').toUpperCase()}
            </span>
          </div>
        )}
      </div>

      {/* Message Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-100/70 max-h-[380px]">
        {smsMessages.length === 0 ? (
          <div className="text-center py-10 px-4 text-slate-500">
            <MessageSquare className="w-10 h-10 mx-auto text-slate-400 mb-2" />
            <p className="font-semibold text-slate-700 text-sm">No SMS Activity Yet</p>
            <p className="text-xs text-slate-500 mt-1">
              When the customer dispatches opportunities to freelancers, outgoing SMS logs and incoming replies appear here in real-time.
            </p>
          </div>
        ) : (
          smsMessages.map((msg) => {
            const isOutgoing = msg.direction === 'outgoing';
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isOutgoing ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-center gap-1.5 mb-1 px-1 text-[11px] text-slate-500 font-medium">
                  {isOutgoing ? (
                    <>
                      <ArrowUpRight className="w-3 h-3 text-shramik-600" />
                      <span>SHRAMIK → {msg.workerName} ({msg.workerPhone})</span>
                    </>
                  ) : (
                    <>
                      <ArrowDownLeft className="w-3 h-3 text-emerald-600" />
                      <span className="text-emerald-800 font-bold">{msg.workerName} → SHRAMIK</span>
                    </>
                  )}
                  <span>•</span>
                  <span>{msg.timestamp}</span>
                </div>

                <div
                  className={`max-w-[90%] p-3.5 rounded-2xl whitespace-pre-line text-xs leading-relaxed font-sans shadow-sm ${
                    isOutgoing
                      ? 'bg-navy-900 text-white rounded-tr-none border border-navy-800'
                      : 'bg-emerald-50 text-slate-900 border-2 border-emerald-300 rounded-tl-none font-medium'
                  }`}
                >
                  {msg.content}
                </div>

                <div className="flex items-center gap-1 mt-1 px-1 text-[10px] text-slate-400 font-medium">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                  <span>{msg.status.toUpperCase()}</span>
                  {isOutgoing && msg.step && (
                    <span className="text-slate-500 uppercase bg-slate-200/70 px-1.5 py-0.2 rounded text-[9px]">
                      {msg.step}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Info */}
      <div className="bg-slate-50 p-2.5 border-t border-slate-200 text-center text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
        <Info className="w-3.5 h-3.5 text-shramik-600 shrink-0" />
        <span>Workers reply via standard SMS without internet or web access.</span>
      </div>
    </aside>
  );
};
