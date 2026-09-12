import React, { useState, useMemo } from 'react';
import { 
  ArrowLeft, 
  CheckCircle2, 
  Send, 
  Users, 
  MapPin, 
  Calendar, 
  IndianRupee, 
  Clock, 
  Star, 
  Search, 
  Filter, 
  Check, 
  Smartphone, 
  ShieldCheck, 
  UserCheck, 
  AlertCircle,
  MessageSquare,
  Sparkles
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { findMatchingWorkers } from '../../services/matchingService';
import { ApplicationStatus } from '../../types';

export const JobDetailsPage: React.FC<{ jobId: string; navigate: (r: string) => void }> = ({ jobId, navigate }) => {
  const { 
    jobs, 
    applications, 
    sendOpportunities, 
    assignWorker, 
    completeJob, 
    toggleSMSPanel, 
    setSelectedWorkerForDemo 
  } = useApp();

  const { users } = useAuth();

  const job = jobs.find(j => j.id === jobId);

  const [activeTab, setActiveTab] = useState<'match' | 'responses'>('match');
  const [searchQuery, setSearchQuery] = useState('');
  const [skillFilter, setSkillFilter] = useState('All');
  const [selectedWorkerIds, setSelectedWorkerIds] = useState<string[]>([]);
  const [isSending, setIsSending] = useState(false);

  // Compute matching workers using transparent algorithm
  const matchedWorkers = useMemo(() => {
    if (!job) return [];
    return findMatchingWorkers(job, users);
  }, [job, users]);

  // If applications already sent, auto-switch tab or allow toggling
  const jobApplications = applications.filter(a => a.jobId === job?.id);
  const hasSentSMS = jobApplications.length > 0;

  // Filter matched workers
  const filteredCandidates = matchedWorkers.filter(m => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = 
      m.worker.name.toLowerCase().includes(q) ||
      m.worker.primarySkill.toLowerCase().includes(q) ||
      m.worker.location.toLowerCase().includes(q) ||
      m.worker.freelancerId.toLowerCase().includes(q);

    const matchesSkill = skillFilter === 'All' || m.worker.primarySkill === skillFilter;

    return matchesSearch && matchesSkill;
  });

  // Toggle selection
  const toggleSelectWorker = (id: string) => {
    if (selectedWorkerIds.includes(id)) {
      setSelectedWorkerIds(selectedWorkerIds.filter(i => i !== id));
    } else {
      setSelectedWorkerIds([...selectedWorkerIds, id]);
    }
  };

  // Helper to pre-select 15 workers (as in the hackathon scenario: "Customer selects 15 freelancers")
  const handleSelectFirst15 = () => {
    const first15 = filteredCandidates.slice(0, 15).map(c => c.worker.id);
    setSelectedWorkerIds(first15);
  };

  // Dispatch opportunities
  const handleSendOpportunities = async () => {
    if (!job || selectedWorkerIds.length === 0) return;
    setIsSending(true);
    await sendOpportunities(job.id, selectedWorkerIds);
    setIsSending(false);
    setActiveTab('responses');
  };

  // Metrics for response tracking
  const countSent = jobApplications.length;
  const countDetails = jobApplications.filter(a => a.status === 'details_requested').length;
  const countAccepted = jobApplications.filter(a => a.status === 'accepted').length;
  const countAssigned = jobApplications.filter(a => a.status === 'assigned' || a.status === 'completed').length;
  const countRejected = jobApplications.filter(a => a.status === 'rejected').length;
  const countWaiting = jobApplications.filter(a => a.status === 'sent' || a.status === 'details_requested').length;

  if (!job) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold">Job Not Found</h2>
        <button onClick={() => navigate('/customer/dashboard')} className="tactile-btn-primary mt-4">
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Back Button */}
      <button
        onClick={() => navigate('/customer/dashboard')}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-navy-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Customer Dashboard</span>
      </button>

      {/* Top Job Overview Card */}
      <div className="soft-box p-6 sm:p-8 border-2 border-slate-200">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="text-xs font-black text-shramik-700 bg-shramik-100 px-3 py-1 rounded-lg font-mono">
                {job.id}
              </span>
              <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-lg">
                {job.category}
              </span>
              <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-shramik-100 text-shramik-800">
                {job.status.replace('_', ' ').toUpperCase()}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-900 font-display">
              {job.title}
            </h1>

            <p className="text-sm text-slate-600 max-w-3xl leading-relaxed">
              {job.description}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 text-xs">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-slate-400" />
                <div>
                  <span className="text-slate-400 text-[10px] block">Location</span>
                  <strong className="text-slate-800">{job.location}</strong>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-400" />
                <div>
                  <span className="text-slate-400 text-[10px] block">Schedule</span>
                  <strong className="text-slate-800">{job.startDate} ({job.durationDays} Days)</strong>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <IndianRupee className="w-4 h-4 text-emerald-600" />
                <div>
                  <span className="text-slate-400 text-[10px] block">Daily Payment</span>
                  <strong className="text-emerald-700 font-bold">₹{job.paymentAmount} / day</strong>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-shramik-600" />
                <div>
                  <span className="text-slate-400 text-[10px] block">Crew Status</span>
                  <strong className="text-navy-900">
                    {job.assignedWorkerIds.length} / {job.workersRequired} Assigned
                  </strong>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Action Top Right */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
            {job.status !== 'completed' ? (
              <button
                onClick={() => completeJob(job.id)}
                className="tactile-btn-primary bg-emerald-600 hover:bg-emerald-700 shadow-[0_4px_0_0_#059669] text-xs font-bold px-6 py-3.5"
                title="Mark all assigned workers completed and log official work history"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>MARK WORK COMPLETED</span>
              </button>
            ) : (
              <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-teal-50 text-teal-800 border border-teal-200 text-xs font-bold">
                <CheckCircle2 className="w-4 h-4 text-teal-600" />
                <span>Project Completed & History Logged</span>
              </div>
            )}

            <button
              onClick={toggleSMSPanel}
              className="tactile-btn-secondary text-xs font-bold flex items-center justify-center gap-2"
            >
              <Smartphone className="w-4 h-4 text-amber-500" />
              <span>Open SMS Activity Panel</span>
            </button>
          </div>

        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center justify-between border-b border-slate-200">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('match')}
            className={`pb-3 px-2 text-sm font-extrabold transition-all border-b-2 ${
              activeTab === 'match'
                ? 'border-shramik-600 text-shramik-600'
                : 'border-transparent text-slate-500 hover:text-navy-900'
            }`}
          >
            Find & Select Freelancers ({matchedWorkers.length})
          </button>

          <button
            onClick={() => setActiveTab('responses')}
            className={`pb-3 px-2 text-sm font-extrabold transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'responses'
                ? 'border-shramik-600 text-shramik-600'
                : 'border-transparent text-slate-500 hover:text-navy-900'
            }`}
          >
            <span>Live Responses & Assignments</span>
            {hasSentSMS && (
              <span className="bg-emerald-100 text-emerald-800 text-xs px-2 py-0.5 rounded-full font-bold">
                {countAccepted} Accepted
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: FIND & SELECT FREELANCERS */}
      {/* ========================================================================= */}
      {activeTab === 'match' && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Matching Engine Explanation Header */}
          <div className="bg-gradient-to-r from-shramik-50 to-teal-50 p-5 rounded-3xl border border-shramik-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-shramik-600" />
                <h3 className="text-base font-extrabold text-navy-900 font-display">
                  {matchedWorkers.length} MATCHING FREELANCERS FOUND
                </h3>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                Calculated using transparent formula: Skill (40%) • Location (20%) • Experience (15%) • Availability (15%) • Language (10%)
              </p>
            </div>

            <button
              onClick={handleSelectFirst15}
              className="tactile-btn-secondary text-xs font-bold px-4 py-2 shrink-0"
            >
              Select Top 15 Freelancers
            </button>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search by worker name, skill or location (e.g. Ramesh, Mapusa)..."
                className="tactile-input pl-11 text-xs"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400 shrink-0" />
              <select
                value={skillFilter}
                onChange={e => setSkillFilter(e.target.value)}
                className="tactile-input text-xs font-semibold w-40"
              >
                <option value="All">All Trades</option>
                <option value="Painter">Painters</option>
                <option value="Plumber">Plumbers</option>
                <option value="Carpenter">Carpenters</option>
                <option value="Mason">Masons</option>
                <option value="Electrician">Electricians</option>
              </select>
            </div>
          </div>

          {/* Candidate Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredCandidates.map(({ worker, matchScore, breakdown }) => {
              const isSelected = selectedWorkerIds.includes(worker.id);
              const alreadyNotified = jobApplications.some(a => a.workerId === worker.id);

              return (
                <div
                  key={worker.id}
                  onClick={() => toggleSelectWorker(worker.id)}
                  className={`soft-box p-5 cursor-pointer border-2 transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'border-shramik-600 bg-shramik-50/50 shadow-md ring-2 ring-shramik-500/20'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-shramik-600 to-indigo-700 text-white font-bold flex items-center justify-center text-sm shadow-sm">
                          {worker.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-extrabold text-navy-900 text-base leading-tight">
                            {worker.name}
                          </h4>
                          <span className="text-[11px] font-mono text-slate-400 font-bold">
                            {worker.freelancerId}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-xs font-black text-shramik-700 bg-shramik-100 px-2 py-0.5 rounded-lg inline-block">
                          {matchScore}% Match
                        </div>
                        <div className="flex items-center gap-1 text-xs font-bold text-amber-500 mt-1 justify-end">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span>{worker.rating}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-xs">
                      <div className="flex items-center justify-between text-slate-700 font-semibold">
                        <span>{worker.primarySkill}</span>
                        <span className="text-slate-500 font-normal">{worker.experienceYears} Years Exp</span>
                      </div>

                      <div className="flex items-center justify-between text-slate-500 text-[11px]">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          {worker.location}
                        </span>
                        <span className="text-emerald-700 font-bold uppercase">
                          {worker.availability}
                        </span>
                      </div>

                      {/* Additional skill tags */}
                      <div className="flex flex-wrap gap-1 pt-1">
                        {worker.additionalSkills.slice(0, 2).map(s => (
                          <span key={s} className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px]">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Footer card select action */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 font-medium">
                      {worker.jobsCompleted} Jobs Completed
                    </span>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSelectWorker(worker.id);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-shramik-600 text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {isSelected ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Selected</span>
                        </>
                      ) : (
                        <span>Select</span>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Sticky Bottom Dispatch Bar */}
          <div className="sticky bottom-4 z-20 bg-navy-950 text-white p-4 rounded-3xl shadow-2xl border-2 border-navy-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-400 text-navy-950 flex items-center justify-center font-bold">
                {selectedWorkerIds.length}
              </div>
              <div>
                <div className="font-extrabold text-sm">
                  {selectedWorkerIds.length} Freelancers Selected
                </div>
                <div className="text-xs text-slate-400">
                  Direct cellular SMS will be sent in each worker's preferred language.
                </div>
              </div>
            </div>

            <button
              disabled={selectedWorkerIds.length === 0 || isSending}
              onClick={handleSendOpportunities}
              className="tactile-btn-saffron w-full sm:w-auto px-8 py-3.5 text-xs uppercase tracking-wider font-extrabold shadow-tactile flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4 text-slate-950" />
              <span>
                {isSending 
                  ? 'Dispatching SMS...' 
                  : `SEND OPPORTUNITY TO ${selectedWorkerIds.length} FREELANCERS`}
              </span>
            </button>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: LIVE RESPONSES & ASSIGNMENTS */}
      {/* ========================================================================= */}
      {activeTab === 'responses' && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Response Metrics Banner */}
          <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <div>
                <span className="text-xs font-bold uppercase text-slate-400">STATUS BREAKDOWN</span>
                <h3 className="text-lg font-extrabold text-navy-900 font-display">
                  Live Worker Responses for {job.title}
                </h3>
              </div>

              <button
                onClick={toggleSMSPanel}
                className="text-xs font-bold text-shramik-600 bg-shramik-50 px-3 py-1.5 rounded-xl border border-shramik-200 hover:bg-shramik-100 flex items-center gap-1.5"
              >
                <Smartphone className="w-3.5 h-3.5 text-amber-500" />
                <span>Simulate Worker Reply (1 / 0)</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
              <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
                <div className="text-2xl font-black text-navy-900">{countSent}</div>
                <div className="text-[11px] font-bold text-slate-500 uppercase">Opportunities Sent</div>
              </div>

              <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
                <div className="text-2xl font-black text-amber-600">{countDetails}</div>
                <div className="text-[11px] font-bold text-amber-700 uppercase">Viewed Details</div>
              </div>

              <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
                <div className="text-2xl font-black text-emerald-600">{countAccepted}</div>
                <div className="text-[11px] font-bold text-emerald-700 uppercase">Accepted (Reply 1)</div>
              </div>

              <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
                <div className="text-2xl font-black text-rose-600">{countRejected}</div>
                <div className="text-[11px] font-bold text-rose-700 uppercase">Rejected (Reply 0)</div>
              </div>

              <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
                <div className="text-2xl font-black text-shramik-600">{countWaiting}</div>
                <div className="text-[11px] font-bold text-shramik-700 uppercase">Waiting</div>
              </div>
            </div>
          </div>

          {/* Worker Applications List */}
          {jobApplications.length === 0 ? (
            <div className="soft-box p-12 text-center space-y-3">
              <Users className="w-10 h-10 text-slate-300 mx-auto" />
              <h4 className="font-bold text-slate-700">No opportunities sent yet</h4>
              <p className="text-xs text-slate-500">
                Switch to the "Find & Select Freelancers" tab to dispatch SMS opportunities.
              </p>
              <button
                onClick={() => setActiveTab('match')}
                className="tactile-btn-primary text-xs font-bold px-5 py-2.5 mt-2"
              >
                Find Freelancers
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {jobApplications.map((app) => {
                const workerUser = users.find(u => u.id === app.workerId || u.freelancerProfile?.freelancerId === app.workerId);
                const workerProfile = workerUser?.freelancerProfile;
                const isAccepted = app.status === 'accepted';
                const isAssigned = app.status === 'assigned';
                const isCompleted = app.status === 'completed';
                const isRejected = app.status === 'rejected';
                const isDetails = app.status === 'details_requested';
                const isWaiting = app.status === 'sent';

                return (
                  <div
                    key={app.id}
                    className="soft-box p-5 border-2 border-slate-200 hover:border-slate-300 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    {/* Worker Info */}
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-navy-900 text-white flex items-center justify-center font-bold text-sm shrink-0">
                        {workerUser?.name.charAt(0) || 'W'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-extrabold text-navy-900 text-base">
                            {workerUser?.name}
                          </h4>
                          <span className="text-[11px] font-mono text-slate-400 font-bold">
                            {workerProfile?.freelancerId}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                          <span>{workerProfile?.primarySkill}</span>
                          <span>•</span>
                          <span>{workerProfile?.location}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1 text-amber-500 font-bold">
                            <Star className="w-3 h-3 fill-amber-400" />
                            {workerProfile?.rating}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Status Chip */}
                    <div className="flex items-center gap-3 self-stretch sm:self-auto justify-between sm:justify-end">
                      <div>
                        {isCompleted && (
                          <span className="tactile-chip bg-teal-100 text-teal-800 border border-teal-200">
                            ✓ COMPLETED
                          </span>
                        )}
                        {isAssigned && (
                          <span className="tactile-chip bg-emerald-100 text-emerald-800 border border-emerald-300">
                            ✓ ASSIGNED
                          </span>
                        )}
                        {isAccepted && (
                          <span className="tactile-chip bg-emerald-500 text-white shadow-sm">
                            ACCEPTED (REPLY 1)
                          </span>
                        )}
                        {isDetails && (
                          <span className="tactile-chip bg-amber-100 text-amber-900 border border-amber-300">
                            DETAILS VIEWED (REPLY 1)
                          </span>
                        )}
                        {isWaiting && (
                          <span className="tactile-chip bg-blue-50 text-blue-800 border border-blue-200">
                            SMS SENT (WAITING)
                          </span>
                        )}
                        {isRejected && (
                          <span className="tactile-chip bg-rose-100 text-rose-800 border border-rose-200">
                            DECLINED (REPLY 0)
                          </span>
                        )}
                      </div>

                      {/* Action: Assign or Simulate */}
                      <div className="flex items-center gap-2">
                        {isAccepted && (
                          (job.assignedWorkerIds.length >= job.workersRequired && !job.assignedWorkerIds.includes(app.workerId)) ? (
                            <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
                              CREW FULL ({job.assignedWorkerIds.length}/{job.workersRequired})
                            </span>
                          ) : (
                            <button
                              onClick={() => assignWorker(job.id, app.workerId)}
                              className="tactile-btn-primary px-4 py-2 text-xs font-bold shadow-tactile"
                            >
                              <UserCheck className="w-3.5 h-3.5" />
                              <span>ASSIGN WORK</span>
                            </button>
                          )
                        )}

                        <button
                          onClick={() => {
                            setSelectedWorkerForDemo(app.workerId);
                            toggleSMSPanel();
                          }}
                          className="p-2 text-slate-400 hover:text-navy-900 rounded-xl hover:bg-slate-100"
                          title="Open in SMS Activity Panel"
                        >
                          <Smartphone className="w-4 h-4 text-amber-500" />
                        </button>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

    </div>
  );
};
