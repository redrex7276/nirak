import React, { useState } from 'react';
import { Search, Filter, Star, MapPin, CheckCircle2, ArrowLeft, Wrench, Globe, Phone } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { WorkerSkill } from '../../types';

export const FindWorkersPage: React.FC<{ navigate: (r: string) => void }> = ({ navigate }) => {
  const { users } = useAuth();
  const { jobs } = useApp();

  const [search, setSearch] = useState('');
  const [selectedSkill, setSelectedSkill] = useState<string>('All');
  const [selectedLocation, setSelectedLocation] = useState<string>('All');

  const freelancers = users
    .filter(u => u.role === 'freelancer' && u.freelancerProfile)
    .map(u => ({
      ...u.freelancerProfile!,
      id: u.id,
      name: u.name,
      mobile: u.mobile
    }));

  const filtered = freelancers.filter(f => {
    const q = search.toLowerCase();
    const matchQ = f.name.toLowerCase().includes(q) ||
      f.primarySkill.toLowerCase().includes(q) ||
      f.location.toLowerCase().includes(q) ||
      f.freelancerId.toLowerCase().includes(q);

    const matchSkill = selectedSkill === 'All' || f.primarySkill === selectedSkill;
    const matchLoc = selectedLocation === 'All' || f.location.toLowerCase().includes(selectedLocation.toLowerCase());

    return matchQ && matchSkill && matchLoc;
  });

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

      {/* Grid of workers */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(worker => (
          <div key={worker.id} className="soft-box p-6 border-2 border-slate-200 flex flex-col justify-between hover:border-shramik-400 transition-all">
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
                  <span>{worker.rating}</span>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                {worker.bio}
              </p>

              <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-100">
                <div>
                  <span className="text-slate-400 text-[10px] block">Primary Trade:</span>
                  <strong className="text-shramik-700">{worker.primarySkill}</strong>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Experience:</span>
                  <strong className="text-slate-800">{worker.experienceYears} Years</strong>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Location:</span>
                  <strong className="text-slate-800">{worker.location}</strong>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Availability:</span>
                  <strong className="text-emerald-700 uppercase">{worker.availability}</strong>
                </div>
              </div>

              <div className="flex flex-wrap gap-1 pt-1">
                {worker.additionalSkills.slice(0, 3).map(skill => (
                  <span key={skill} className="bg-slate-100 text-slate-600 text-[10px] font-medium px-2 py-0.5 rounded-md">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-semibold">
                {worker.jobsCompleted} Jobs Completed
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

    </div>
  );
};
