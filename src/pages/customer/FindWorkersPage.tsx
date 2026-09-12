import React, { useState, useEffect } from 'react';
import { Search, Filter, Star, MapPin, CheckCircle2, ArrowLeft, Wrench, Globe, Phone, Loader2 } from 'lucide-react';
import { apiClient } from '../../services/apiClient';

export const FindWorkersPage: React.FC<{ navigate: (r: string) => void }> = ({ navigate }) => {
  const [search, setSearch] = useState('');
  const [selectedSkill, setSelectedSkill] = useState<string>('All');
  const [selectedLocation, setSelectedLocation] = useState<string>('All');
  const [freelancers, setFreelancers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Database-backed search query
  useEffect(() => {
    let active = true;
    async function fetchWorkers() {
      setLoading(true);
      try {
        const res = await apiClient.getFreelancers({
          search: search.trim() || undefined,
          category: selectedSkill !== 'All' ? selectedSkill : undefined,
          location: selectedLocation !== 'All' ? selectedLocation : undefined
        });
        if (active && res.freelancers) {
          setFreelancers(res.freelancers);
        }
      } catch (err) {
        console.error('Error querying freelancers from database:', err);
      } finally {
        if (active) setLoading(false);
      }
    }
    const timer = setTimeout(fetchWorkers, 200);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [search, selectedSkill, selectedLocation]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      <button
        onClick={() => navigate('/customer/dashboard')}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-navy-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Dashboard</span>
      </button>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-shramik-600 bg-shramik-50 px-3 py-1 rounded-full border border-shramik-200">
            Worker Directory
          </span>
          <h1 className="text-3xl font-extrabold text-navy-900 mt-2 font-display">
            Find Skilled Freelancers
          </h1>
          <p className="text-sm text-slate-500">
            Browse verified local tradespeople across North & South Goa
          </p>
        </div>

        <button
          onClick={() => navigate('/customer/create-work')}
          className="tactile-btn-primary text-xs font-bold px-5 py-3 shadow-tactile self-start md:self-auto"
        >
          Post Work Request
        </button>
      </div>

      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by worker name, trade skill or ID (e.g. Ramesh, Plumber)..."
            className="tactile-input pl-11 text-sm"
          />
        </div>

        <div className="flex gap-2">
          <select
            value={selectedSkill}
            onChange={e => setSelectedSkill(e.target.value)}
            className="tactile-input text-xs font-semibold w-36"
          >
            <option value="All">All Trades</option>
            <option value="Painter">Painter</option>
            <option value="Plumber">Plumber</option>
            <option value="Carpenter">Carpenter</option>
            <option value="Electrician">Electrician</option>
            <option value="Mason">Mason</option>
            <option value="Mechanic">Mechanic</option>
          </select>

          <select
            value={selectedLocation}
            onChange={e => setSelectedLocation(e.target.value)}
            className="tactile-input text-xs font-semibold w-36"
          >
            <option value="All">All Locations</option>
            <option value="Mapusa">Mapusa</option>
            <option value="Porvorim">Porvorim</option>
            <option value="Panjim">Panjim</option>
            <option value="Assagao">Assagao</option>
            <option value="Siolim">Siolim</option>
          </select>
        </div>
      </div>

      {/* Loading & Results Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-shramik-600" />
          <p className="text-xs font-semibold">Querying SQLite database for verified freelancers...</p>
        </div>
      ) : freelancers.length === 0 ? (
        <div className="soft-box p-12 text-center text-slate-500 border-2 border-dashed border-slate-200">
          <Wrench className="w-10 h-10 mx-auto text-slate-300 mb-3" />
          <h3 className="font-extrabold text-navy-900 text-base">No Matching Freelancers Found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search keyword, category, or location filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {freelancers.map(worker => (
            <div key={worker.id || worker.freelancerId} className="soft-box p-6 border-2 border-slate-200 flex flex-col justify-between hover:border-shramik-400 transition-all">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-shramik-600 to-indigo-700 text-white font-bold flex items-center justify-center text-sm shadow-sm">
                      {worker.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-navy-900 text-base leading-tight">
                        {worker.name}
                      </h3>
                      <span className="text-[11px] font-mono text-slate-400 font-bold">
                        {worker.freelancerId}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-xs font-bold text-amber-500 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{worker.rating || 4.8}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                  {worker.bio || 'Verified tradesperson ready for dispatch across Goa.'}
                </p>

                <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-100">
                  <div>
                    <span className="text-slate-400 text-[10px] block">Primary Trade:</span>
                    <strong className="text-shramik-700">{worker.tradeCategory || worker.primarySkill}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Experience:</span>
                    <strong className="text-slate-800">{worker.experienceYears || 1} Years</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Location:</span>
                    <strong className="text-slate-800">{worker.location}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Daily Rate:</span>
                    <strong className="text-slate-900">₹{worker.dailyRate || 800}/day</strong>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 pt-1">
                  {(worker.skills || worker.additionalSkills || []).slice(0, 3).map((skill: string) => (
                    <span key={skill} className="bg-slate-100 text-slate-600 text-[10px] font-medium px-2 py-0.5 rounded-md">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-semibold">
                  {worker.completedJobs !== undefined ? worker.completedJobs : (worker.jobsCompleted || 0)} Jobs Completed
                </span>

                <button
                  onClick={() => navigate('/customer/create-work')}
                  className="tactile-btn-secondary text-xs font-bold px-3 py-1.5"
                >
                  Hire Worker
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
