import React from 'react';
import { ArrowLeft, Star, Briefcase, Award, CheckCircle2, IndianRupee, Calendar, MapPin } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';

export const FreelancerHistoryPage: React.FC<{ navigate: (r: string) => void }> = ({ navigate }) => {
  const { currentUser } = useAuth();
  const { workHistory } = useApp();

  const workerId = currentUser?.id || 'SQ-F-1042';
  const profile = currentUser?.freelancerProfile;
  const myHistory = workHistory.filter(h => h.workerId === workerId);
  const jobsCompletedCount = profile?.jobsCompleted ?? myHistory.length;

  const totalEarned = myHistory.reduce((acc, h) => acc + h.earnedAmount, 0);
  const avgRating = myHistory.length > 0 
    ? (myHistory.reduce((acc, h) => acc + h.rating, 0) / myHistory.length).toFixed(1)
    : (profile?.rating ? profile.rating.toFixed(1) : '5.0');

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <button
        onClick={() => navigate('/freelancer/dashboard')}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-navy-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Dashboard</span>
      </button>

      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-amber-800 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
          Verified Track Record
        </span>
        <h1 className="text-3xl font-extrabold text-navy-900 mt-2 font-display">
          Work Experience & Ratings
        </h1>
        <p className="text-sm text-slate-500">
          "Every job becomes experience." Verified proof of work recorded permanently.
        </p>
      </div>

      {/* Highlights Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="soft-box p-6 border-l-4 border-l-shramik-600">
          <span className="text-xs font-bold uppercase text-slate-400">TOTAL JOBS RECORDED</span>
          <div className="text-3xl font-black text-navy-900 font-display mt-1">
            {jobsCompletedCount}
          </div>
          <p className="text-xs text-slate-500 mt-1">Assignments completed with customer reviews</p>
        </div>

        <div className="soft-box p-6 border-l-4 border-l-emerald-500">
          <span className="text-xs font-bold uppercase text-slate-400">RECORDED EARNINGS</span>
          <div className="text-3xl font-black text-emerald-800 font-display mt-1">
            ₹{totalEarned.toLocaleString('en-IN')}
          </div>
          <p className="text-xs text-slate-500 mt-1">Total pay from recorded gig contracts</p>
        </div>

        <div className="soft-box p-6 border-l-4 border-l-amber-500">
          <span className="text-xs font-bold uppercase text-slate-400">CLIENT SATISFACTION</span>
          <div className="text-3xl font-black text-amber-900 font-display mt-1 flex items-center gap-1.5">
            <Star className="w-6 h-6 fill-amber-400 text-amber-400" />
            <span>★ {avgRating}</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Verified average rating from customers</p>
        </div>
      </div>

      {/* History Timeline Cards */}
      <div className="space-y-4">
        <h2 className="text-xl font-extrabold text-navy-900 font-display">
          Verified Project Timeline
        </h2>

        {myHistory.map(item => (
          <div key={item.id} className="soft-box p-6 border-2 border-slate-200 hover:border-slate-300 transition-all space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-bold font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                  {item.completedDate}
                </span>
                <span className="text-xs font-bold uppercase px-2 py-0.5 rounded bg-teal-50 text-teal-800">
                  {item.category}
                </span>
                <h3 className="text-lg font-bold text-navy-900">{item.jobTitle}</h3>
              </div>

              <div className="flex items-center gap-1 text-sm font-bold text-amber-500 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 self-start sm:self-auto">
                <Star className="w-4 h-4 fill-amber-400" />
                <span>★ {item.rating}.0</span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-slate-600">
              <div className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{item.location}</span>
              </div>
              <div className="flex items-center gap-1 font-bold text-emerald-700">
                <IndianRupee className="w-3.5 h-3.5" />
                <span>₹{item.earnedAmount.toLocaleString('en-IN')} Earned</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{item.durationDays} Days Duration</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-slate-400">Customer:</span>
                <strong className="text-navy-900">{item.customerName}</strong>
              </div>
            </div>

            {item.feedback && (
              <p className="text-xs text-slate-600 italic bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                "{item.feedback}"
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
