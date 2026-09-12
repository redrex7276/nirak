import React from 'react';
import { 
  PlusCircle, 
  Users, 
  Briefcase, 
  Clock, 
  CheckCircle2, 
  ArrowRight, 
  MapPin, 
  Calendar, 
  IndianRupee, 
  Smartphone,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';

export const CustomerDashboard: React.FC<{ navigate: (r: string) => void }> = ({ navigate }) => {
  const { currentUser } = useAuth();
  const { jobs, applications, toggleSMSPanel, smsMessages } = useApp();

  const customerJobs = jobs.filter(j => j.customerId === currentUser?.id || currentUser?.id === 'SQ-C-201');

  // Stats calculation
  const activeJobsCount = customerJobs.filter(j => j.status !== 'completed' && j.status !== 'cancelled').length;
  const completedJobsCount = customerJobs.filter(j => j.status === 'completed').length;
  
  const allCustomerJobIds = customerJobs.map(j => j.id);
  const relevantApps = applications.filter(a => allCustomerJobIds.includes(a.jobId));
  
  const assignedCount = relevantApps.filter(a => a.status === 'assigned' || a.status === 'completed').length;
  const pendingCount = relevantApps.filter(a => a.status === 'sent' || a.status === 'details_requested').length;
  const acceptedCount = relevantApps.filter(a => a.status === 'accepted').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-shramik-600 bg-shramik-50 px-3 py-1 rounded-full border border-shramik-200">
            Customer Workspace
          </span>
          <h1 className="text-3xl font-extrabold text-navy-900 mt-2 font-display">
            Good morning, {currentUser?.name || 'Rajesh Sharma'}
          </h1>
          <p className="text-sm text-slate-500">
            Find the right person for the work. Organize projects and reach workers directly via SMS.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/customer/workers')}
            className="tactile-btn-secondary text-sm font-semibold flex items-center gap-1.5"
          >
            <Users className="w-4 h-4 text-slate-600" />
            <span>Worker Directory</span>
          </button>

          <button
            onClick={() => navigate('/customer/create-work')}
            className="tactile-btn-primary text-sm font-bold flex items-center gap-2 shadow-tactile"
          >
            <PlusCircle className="w-4 h-4" />
            <span>CREATE WORK</span>
          </button>
        </div>
      </div>

      {/* 4 Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        <div className="soft-box p-6 border-l-4 border-l-shramik-600">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase text-slate-400">ACTIVE WORK</span>
            <Briefcase className="w-5 h-5 text-shramik-600" />
          </div>
          <div className="text-3xl font-black text-navy-900 font-display">{activeJobsCount}</div>
          <p className="text-[11px] text-slate-500 mt-1">Projects currently recruiting or in progress</p>
        </div>

        <div className="soft-box p-6 border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase text-slate-400">WORKERS ASSIGNED</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-3xl font-black text-emerald-900 font-display">{assignedCount}</div>
          <p className="text-[11px] text-slate-500 mt-1">Confirmed workers on active job sites</p>
        </div>

        <div className="soft-box p-6 border-l-4 border-l-amber-400">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase text-slate-400">PENDING RESPONSES</span>
            <Clock className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-3xl font-black text-amber-900 font-display">{pendingCount}</div>
          <p className="text-[11px] text-slate-500 mt-1">Opportunities awaiting worker reply</p>
        </div>

        <div className="soft-box p-6 border-l-4 border-l-teal-warm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase text-slate-400">COMPLETED</span>
            <ShieldCheck className="w-5 h-5 text-teal-600" />
          </div>
          <div className="text-3xl font-black text-navy-900 font-display">{completedJobsCount}</div>
          <p className="text-[11px] text-slate-500 mt-1">Verified projects successfully completed</p>
        </div>

      </div>

      {/* Main Section: My Work Projects */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-navy-900 font-display">
              Active Projects & Work Requests
            </h2>
            <p className="text-xs text-slate-500">
              Track SMS dispatches, incoming acceptance responses, and worker crew assignments
            </p>
          </div>

          <button
            onClick={() => navigate('/customer/work')}
            className="text-xs font-bold text-shramik-600 hover:text-shramik-800 flex items-center gap-1"
          >
            <span>View All ({customerJobs.length})</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {customerJobs.length === 0 ? (
          <div className="soft-box p-12 text-center space-y-4 border-dashed border-2 border-slate-300">
            <Briefcase className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-lg font-bold text-navy-900">No active work requests</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              Create your first project to match skilled local freelancers and dispatch opportunities directly over cellular SMS.
            </p>
            <button
              onClick={() => navigate('/customer/create-work')}
              className="tactile-btn-primary px-6 py-3 text-sm font-bold shadow-tactile"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create Work Request</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {customerJobs.map(job => {
              const jobApps = applications.filter(a => a.jobId === job.id);
              const sentCount = jobApps.filter(a => a.status === 'sent').length;
              const detailsCount = jobApps.filter(a => a.status === 'details_requested').length;
              const accepted = jobApps.filter(a => a.status === 'accepted').length;
              const assigned = jobApps.filter(a => a.status === 'assigned').length;
              const rejected = jobApps.filter(a => a.status === 'rejected').length;

              const isCompleted = job.status === 'completed';

              return (
                <div 
                  key={job.id}
                  className="soft-box p-6 hover:border-shramik-400 transition-all border-2 border-slate-200"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    
                    {/* Job Details Left */}
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="text-xs font-black text-shramik-700 bg-shramik-100 px-2.5 py-0.5 rounded-lg font-mono">
                          {job.id}
                        </span>
                        <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-lg">
                          {job.category}
                        </span>
                        <span className={`text-xs font-bold uppercase px-3 py-0.5 rounded-full ${
                          isCompleted
                            ? 'bg-teal-100 text-teal-800'
                            : assigned > 0
                            ? 'bg-emerald-100 text-emerald-800'
                            : accepted > 0
                            ? 'bg-shramik-100 text-shramik-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {isCompleted ? 'COMPLETED' : assigned > 0 ? 'WORKERS ASSIGNED' : accepted > 0 ? 'RESPONSES RECEIVED' : 'OPEN / DISPATCHED'}
                        </span>
                      </div>

                      <h3 className="text-xl font-bold text-navy-900 font-display">
                        {job.title}
                      </h3>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
                        <span className="flex items-center gap-1 font-medium">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {job.location}
                        </span>
                        <span className="flex items-center gap-1 font-medium">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          Start: {job.startDate} ({job.durationDays} Days)
                        </span>
                        <span className="flex items-center gap-1 font-medium text-emerald-700 font-bold">
                          <IndianRupee className="w-3.5 h-3.5" />
                          ₹{job.paymentAmount} / day
                        </span>
                        <span className="flex items-center gap-1 font-medium text-slate-500">
                          <Users className="w-3.5 h-3.5" />
                          {job.workersRequired} Workers Needed
                        </span>
                      </div>
                    </div>

                    {/* Response Chips Stats */}
                    <div className="flex flex-wrap lg:flex-nowrap items-center gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-200 shrink-0">
                      <div className="text-center px-3 py-1">
                        <div className="text-base font-black text-navy-900">{jobApps.length}</div>
                        <div className="text-[10px] uppercase font-bold text-slate-400">Sent</div>
                      </div>
                      <div className="h-7 w-px bg-slate-200 hidden sm:block"></div>

                      <div className="text-center px-3 py-1">
                        <div className="text-base font-black text-emerald-600">{accepted}</div>
                        <div className="text-[10px] uppercase font-bold text-emerald-700">Accepted</div>
                      </div>
                      <div className="h-7 w-px bg-slate-200 hidden sm:block"></div>

                      <div className="text-center px-3 py-1">
                        <div className="text-base font-black text-amber-600">{detailsCount + sentCount}</div>
                        <div className="text-[10px] uppercase font-bold text-amber-700">Waiting</div>
                      </div>
                      <div className="h-7 w-px bg-slate-200 hidden sm:block"></div>

                      <div className="text-center px-3 py-1">
                        <div className="text-base font-black text-rose-600">{rejected}</div>
                        <div className="text-[10px] uppercase font-bold text-rose-700">Rejected</div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="shrink-0 flex items-center gap-2">
                      <button
                        onClick={() => navigate(`/customer/work/${job.id}`)}
                        className="tactile-btn-primary px-5 py-3 text-xs font-bold shadow-tactile flex items-center gap-1.5"
                      >
                        <span>Manage Responses</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Live Gateway Activity Callout Banner */}
      <div className="soft-box-navy p-6 rounded-card flex flex-col sm:flex-row items-center justify-between gap-4 border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-400 text-navy-950 flex items-center justify-center font-bold shrink-0">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-white text-sm">SMS Gateway Simulation Panel</h4>
            <p className="text-xs text-slate-300">
              Judges can simulate worker replies (1 to accept, 0 to reject) and watch customer state update live.
            </p>
          </div>
        </div>

        <button
          onClick={toggleSMSPanel}
          className="tactile-btn-saffron px-5 py-2.5 text-xs font-bold uppercase tracking-wider shrink-0"
        >
          Open SMS Panel ({smsMessages.length})
        </button>
      </div>

    </div>
  );
};
