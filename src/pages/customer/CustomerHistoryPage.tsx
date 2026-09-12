import React from 'react';
import { ArrowLeft, CheckCircle2, Calendar, MapPin, IndianRupee, Users, Star } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';

export const CustomerHistoryPage: React.FC<{ navigate: (r: string) => void }> = ({ navigate }) => {
  const { currentUser } = useAuth();
  const { jobs, workHistory } = useApp();

  const customerJobs = jobs.filter(j => j.customerId === currentUser?.id);
  const completedJobs = customerJobs.filter(j => j.status === 'completed');

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <button
        onClick={() => navigate('/customer/dashboard')}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-navy-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Dashboard</span>
      </button>

      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-shramik-600 bg-shramik-50 px-3 py-1 rounded-full border border-shramik-200">
          Work History
        </span>
        <h1 className="text-3xl font-extrabold text-navy-900 mt-2 font-display">
          Customer Work History
        </h1>
        <p className="text-sm text-slate-500">
          Past completed assignments, hired crews, and verified expenditure logs
        </p>
      </div>

      {completedJobs.length === 0 ? (
        <div className="soft-box p-12 text-center space-y-3">
          <CheckCircle2 className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-700 text-lg">No completed projects yet</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Once you mark an active project as completed, the summary and worker ratings are permanently archived here.
          </p>
          <button
            onClick={() => navigate('/customer/dashboard')}
            className="tactile-btn-primary text-xs font-bold px-5 py-2.5 mt-2"
          >
            View Active Projects
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {completedJobs.map(job => (
            <div key={job.id} className="soft-box p-6 border-2 border-slate-200 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-shramik-700 bg-shramik-50 px-2.5 py-0.5 rounded">
                      {job.id}
                    </span>
                    <span className="text-xs font-bold uppercase px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800">
                      ✓ Completed
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-navy-900 mt-1">{job.title}</h3>
                </div>

                <div className="text-right">
                  <div className="text-xl font-black text-emerald-800">
                    ₹{(job.paymentAmount * job.durationDays * job.workersRequired).toLocaleString('en-IN')}
                  </div>
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Total Disbursed</div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 text-[10px] block">Location:</span>
                  <strong className="text-slate-800">{job.location}</strong>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Duration:</span>
                  <strong className="text-slate-800">{job.durationDays} Days</strong>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Workers Hired:</span>
                  <strong className="text-navy-900">{job.workersRequired} Workers</strong>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Daily Rate:</span>
                  <strong className="text-emerald-700">₹{job.paymentAmount} / day</strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
