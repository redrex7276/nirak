import React from 'react';
import { 
  Star, 
  MapPin, 
  Calendar, 
  IndianRupee, 
  Clock, 
  CheckCircle2, 
  Briefcase, 
  Smartphone, 
  ArrowRight,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { WorkerAvailability } from '../../types';

export const FreelancerDashboard: React.FC<{ navigate: (r: string) => void }> = ({ navigate }) => {
  const { currentUser } = useAuth();
  const { jobs, applications, workHistory, updateWorkerAvailability, toggleSMSPanel, smsMessages } = useApp();

  const workerId = currentUser?.id || 'SQ-F-1042';
  const profile = currentUser?.freelancerProfile || {
    freelancerId: 'SQ-F-1042',
    primarySkill: 'Painter',
    additionalSkills: ['Exterior Weather Coating', 'Waterproof Membrane'],
    experienceYears: 8,
    location: 'Mapusa, Goa',
    preferredLanguage: 'mr',
    availability: 'available' as WorkerAvailability,
    rating: 4.8,
    jobsCompleted: 126,
    dailyRate: 800,
    bio: 'Experienced master painter with 8+ years across North Goa.'
  };

  const myApplications = applications.filter(a => a.workerId === workerId);
  const myWorkHistory = workHistory.filter(h => h.workerId === workerId);

  // Group applications into statuses
  const newOpportunities = myApplications.filter(a => a.status === 'sent' || a.status === 'details_requested');
  const activeWork = myApplications.filter(a => a.status === 'assigned');
  const completedWork = myApplications.filter(a => a.status === 'completed');

  // Total earnings estimate
  const totalEarned = myWorkHistory.reduce((acc, curr) => acc + curr.earnedAmount, 0);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Welcome Bar */}
      <div className="soft-box p-6 sm:p-8 border-2 border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 text-white font-black text-2xl flex items-center justify-center shadow-tactile shrink-0">
              {currentUser?.name.charAt(0) || 'R'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-shramik-700 bg-shramik-50 px-2.5 py-0.5 rounded-lg">
                  {profile.freelancerId}
                </span>
                <span className="flex items-center gap-1 text-xs font-bold text-amber-500 bg-amber-50 px-2.5 py-0.5 rounded-lg border border-amber-200">
                  <Star className="w-3 h-3 fill-amber-400" />
                  <span>★ {profile.rating}</span>
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-900 font-display mt-1">
                Hello, {currentUser?.name || 'Ramesh Naik'}
              </h1>
              <p className="text-xs text-slate-500">
                {profile.primarySkill} • {profile.experienceYears} Years Experience • {profile.location}
              </p>
            </div>
          </div>

          {/* Availability Switch */}
          <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200 self-start md:self-auto">
            <span className="text-xs font-bold text-slate-500 uppercase">Availability:</span>
            <select
              value={profile.availability}
              onChange={e => updateWorkerAvailability(workerId, e.target.value as WorkerAvailability)}
              className={`text-xs font-black px-3 py-1.5 rounded-xl border focus:outline-none ${
                profile.availability === 'available'
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                  : profile.availability === 'busy'
                  ? 'bg-amber-100 text-amber-900 border-amber-300'
                  : 'bg-slate-200 text-slate-700 border-slate-300'
              }`}
            >
              <option value="available">AVAILABLE (खुला)</option>
              <option value="busy">BUSY ON WORK (व्यस्त)</option>
              <option value="on_leave">ON LEAVE (रजेवर)</option>
            </select>
          </div>

        </div>
      </div>

      {/* Summary KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="soft-box p-6 border-l-4 border-l-shramik-600">
          <span className="text-xs font-bold uppercase text-slate-400">JOBS COMPLETED</span>
          <div className="text-3xl font-black text-navy-900 font-display mt-1">
            {profile.jobsCompleted}
          </div>
          <p className="text-xs text-slate-500 mt-1">Verified work assignments completed</p>
        </div>

        <div className="soft-box p-6 border-l-4 border-l-emerald-500">
          <span className="text-xs font-bold uppercase text-slate-400">TOTAL RECORDED EARNINGS</span>
          <div className="text-3xl font-black text-emerald-800 font-display mt-1">
            ₹{totalEarned > 0 ? totalEarned.toLocaleString('en-IN') : '10,400'}
          </div>
          <p className="text-xs text-slate-500 mt-1">Disbursed for completed assignments</p>
        </div>

        <div className="soft-box p-6 border-l-4 border-l-amber-500">
          <span className="text-xs font-bold uppercase text-slate-400">AVERAGE CLIENT RATING</span>
          <div className="text-3xl font-black text-amber-900 font-display mt-1 flex items-center gap-2">
            <span>★ {profile.rating}</span>
            <span className="text-xs font-normal text-slate-400">/ 5.0</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Based on client completion evaluations</p>
        </div>
      </div>

      {/* Low-network SMS Reminder Box */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-5 rounded-3xl border-2 border-amber-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-400 text-navy-950 flex items-center justify-center font-bold shrink-0">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-extrabold text-navy-900 text-sm">Offline SMS Access Enabled</h4>
            <p className="text-xs text-slate-600">
              When working on site without internet, you will continue receiving job opportunities via SMS. Simply reply <strong className="text-slate-900">1 for details</strong> and <strong className="text-slate-900">1 to accept</strong>.
            </p>
          </div>
        </div>

        <button
          onClick={toggleSMSPanel}
          className="tactile-btn-secondary text-xs font-bold px-4 py-2 shrink-0 bg-white"
        >
          View SMS Activity Log
        </button>
      </div>

      {/* Section 1: Active & Upcoming Work */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-navy-900 font-display">
            Assigned Work & Active Projects
          </h2>
          <button
            onClick={() => navigate('/freelancer/work')}
            className="text-xs font-bold text-shramik-600 hover:underline"
          >
            View All Work
          </button>
        </div>

        {activeWork.length === 0 ? (
          <div className="soft-box p-8 text-center text-slate-500 space-y-2">
            <Briefcase className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-700">No active assigned jobs right now</p>
            <p className="text-xs text-slate-400">
              When customers accept your profile and confirm assignments, they appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {activeWork.map(app => {
              const targetJob = jobs.find(j => j.id === app.jobId);
              return (
                <div key={app.id} className="soft-box p-6 border-2 border-emerald-300 bg-emerald-50/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <span className="tactile-chip bg-emerald-100 text-emerald-800">
                      ✓ ASSIGNED & CONFIRMED
                    </span>
                    <h3 className="text-lg font-bold text-navy-900">
                      {targetJob?.title || 'Painting Project'}
                    </h3>
                    <div className="flex flex-wrap gap-3 text-xs text-slate-600">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {targetJob?.location || 'Mapusa'}
                      </span>
                      <span className="flex items-center gap-1 font-bold text-emerald-700">
                        <IndianRupee className="w-3.5 h-3.5" />
                        ₹{targetJob?.paymentAmount || 800}/day
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        Start: {targetJob?.startDate || '18 Sept'} ({targetJob?.durationDays || 5} Days)
                      </span>
                      <span className="flex items-center gap-1 font-medium text-slate-700">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        Report: {targetJob?.reportingTime || '8:00 AM'}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => navigate('/freelancer/work')}
                    className="tactile-btn-primary px-5 py-2.5 text-xs font-bold shrink-0"
                  >
                    View Details
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Section 2: Recent Verified Work History */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-navy-900 font-display">
              Recent Verified Work History
            </h2>
            <p className="text-xs text-slate-500">Every completed job becomes part of your digital track record</p>
          </div>

          <button
            onClick={() => navigate('/freelancer/history')}
            className="text-xs font-bold text-shramik-600 hover:underline"
          >
            Complete History ({myWorkHistory.length})
          </button>
        </div>

        <div className="space-y-3">
          {myWorkHistory.slice(0, 3).map(item => (
            <div key={item.id} className="soft-box p-5 border-2 border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-slate-400">{item.completedDate}</span>
                  <span className="text-[10px] uppercase font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
                    {item.category}
                  </span>
                </div>
                <h4 className="font-extrabold text-navy-900 text-base">{item.jobTitle}</h4>
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span>{item.location}</span>
                  <span>•</span>
                  <span>Customer: {item.customerName}</span>
                  <span>•</span>
                  <span className="font-bold text-emerald-700">₹{item.earnedAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="flex items-center gap-1 text-sm font-bold text-amber-500 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200">
                <Star className="w-4 h-4 fill-amber-400" />
                <span>★ {item.rating}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
