import React, { useState } from 'react';
import { ArrowLeft, Calendar, MapPin, IndianRupee, Clock, Briefcase, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';

export const FreelancerWorkPage: React.FC<{ navigate: (r: string) => void }> = ({ navigate }) => {
  const { currentUser } = useAuth();
  const { jobs, applications } = useApp();

  const workerId = currentUser?.id || 'SQ-F-1042';
  const myApplications = applications.filter(a => a.workerId === workerId);

  const [filterTab, setFilterTab] = useState<'all' | 'assigned' | 'completed'>('all');

  const filteredApps = myApplications.filter(a => {
    if (filterTab === 'assigned') return a.status === 'assigned';
    if (filterTab === 'completed') return a.status === 'completed';
    return true;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <button
        onClick={() => navigate('/freelancer/dashboard')}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-navy-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Dashboard</span>
      </button>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-800 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
            Assigned Work
          </span>
          <h1 className="text-3xl font-extrabold text-navy-900 mt-2 font-display">
            My Work Opportunities
          </h1>
          <p className="text-sm text-slate-500">
            Active assignments, reporting timings, and completed gigs
          </p>
        </div>

        {/* Tab Filters */}
        <div className="flex bg-slate-100 p-1 rounded-2xl text-xs font-bold self-start sm:self-auto">
          <button
            onClick={() => setFilterTab('all')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              filterTab === 'all' ? 'bg-white text-navy-900 shadow-sm' : 'text-slate-500'
            }`}
          >
            All Work ({myApplications.length})
          </button>
          <button
            onClick={() => setFilterTab('assigned')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              filterTab === 'assigned' ? 'bg-white text-navy-900 shadow-sm' : 'text-slate-500'
            }`}
          >
            Active Assigned
          </button>
          <button
            onClick={() => setFilterTab('completed')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              filterTab === 'completed' ? 'bg-white text-navy-900 shadow-sm' : 'text-slate-500'
            }`}
          >
            Completed
          </button>
        </div>
      </div>

      {filteredApps.length === 0 ? (
        <div className="soft-box p-12 text-center text-slate-500 space-y-3">
          <Briefcase className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-700">No work in this category</h3>
          <p className="text-xs text-slate-400">
            Opportunities sent to your phone via SMS will appear here once accepted.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredApps.map(app => {
            const job = jobs.find(j => j.id === app.jobId);
            const isAssigned = app.status === 'assigned';
            const isCompleted = app.status === 'completed';

            return (
              <div key={app.id} className="soft-box p-6 border-2 border-slate-200 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-shramik-700 bg-shramik-50 px-2.5 py-0.5 rounded">
                        {app.jobId}
                      </span>
                      <span className={`text-xs font-bold uppercase px-2.5 py-0.5 rounded-full ${
                        isCompleted
                          ? 'bg-teal-100 text-teal-800'
                          : isAssigned
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-shramik-100 text-shramik-800'
                      }`}>
                        {app.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-navy-900 mt-1">
                      {job?.title || 'Painting Project'}
                    </h3>
                  </div>

                  <div className="text-left sm:text-right">
                    <div className="text-xl font-black text-emerald-800">
                      ₹{job?.paymentAmount || 800} / day
                    </div>
                    <div className="text-[10px] text-slate-400 uppercase font-bold">
                      {job?.durationDays || 5} Days Project
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 text-[10px] block">Location:</span>
                    <strong className="text-slate-800">{job?.location || 'Mapusa, Goa'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Start Date:</span>
                    <strong className="text-slate-800">{job?.startDate || '18 Sept 2026'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Reporting Time:</span>
                    <strong className="text-slate-800">{job?.reportingTime || '8:00 AM'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Customer:</span>
                    <strong className="text-navy-900">{job?.customerName || 'Rajesh Sharma'}</strong>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                  {job?.description}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
