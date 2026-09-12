import React, { useState } from 'react';
import { ArrowLeft, User, Phone, MapPin, Wrench, Globe, Star, CheckCircle2, Save, Edit3, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { WorkerSkill, LanguageCode, WorkerAvailability } from '../../types';

export const FreelancerProfilePage: React.FC<{ navigate: (r: string) => void }> = ({ navigate }) => {
  const { currentUser, updateFreelancerProfile } = useAuth();
  const { addToast } = useApp();

  const profile = currentUser?.freelancerProfile || {
    freelancerId: 'SQ-F-1042',
    primarySkill: 'Painter' as WorkerSkill,
    additionalSkills: ['Exterior Weather Coating', 'Waterproof Membrane'],
    experienceYears: 8,
    location: 'Mapusa, Goa',
    preferredLanguage: 'mr' as LanguageCode,
    availability: 'available' as WorkerAvailability,
    rating: 4.8,
    jobsCompleted: 126,
    dailyRate: 800,
    bio: 'Experienced master painter with 8+ years across North Goa.'
  };

  const [name, setName] = useState(currentUser?.name || 'Ramesh Naik');
  const [primarySkill, setPrimarySkill] = useState<WorkerSkill>(profile.primarySkill);
  const [additionalSkillsStr, setAdditionalSkillsStr] = useState(profile.additionalSkills.join(', '));
  const [experienceYears, setExperienceYears] = useState(profile.experienceYears);
  const [location, setLocation] = useState(profile.location);
  const [preferredLanguage, setPreferredLanguage] = useState<LanguageCode>(profile.preferredLanguage);
  const [availability, setAvailability] = useState<WorkerAvailability>(profile.availability);
  const [dailyRate, setDailyRate] = useState(profile.dailyRate);
  const [bio, setBio] = useState(profile.bio);

  const [isEditing, setIsEditing] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const skills = additionalSkillsStr.split(',').map(s => s.trim()).filter(Boolean);

    updateFreelancerProfile(
      {
        primarySkill,
        additionalSkills: skills,
        experienceYears: Number(experienceYears),
        location,
        preferredLanguage,
        availability,
        dailyRate: Number(dailyRate),
        bio
      },
      name,
      location
    );

    setIsEditing(false);
    addToast('Freelancer Profile Saved', 'Your skills and availability have been updated.', 'success');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <button
        onClick={() => navigate('/freelancer/dashboard')}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-navy-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Dashboard</span>
      </button>

      {/* Header Profile Card */}
      <div className="soft-box p-8 border-2 border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-slate-200">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-500 to-amber-600 text-white font-black text-3xl flex items-center justify-center shadow-tactile shrink-0">
              {name.charAt(0)}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-black font-mono text-shramik-700 bg-shramik-50 px-3 py-0.5 rounded-lg">
                  {profile.freelancerId}
                </span>
                <span className="flex items-center gap-1 text-xs font-bold text-amber-500 bg-amber-50 px-2.5 py-0.5 rounded-lg border border-amber-200">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span>★ {profile.rating}</span>
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-900 font-display">
                {name}
              </h1>
              <p className="text-xs text-slate-500 flex items-center gap-2">
                <span>{primarySkill}</span>
                <span>•</span>
                <span>{experienceYears} Years Experience</span>
                <span>•</span>
                <span className="text-emerald-700 font-bold uppercase">{availability}</span>
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsEditing(!isEditing)}
            className="tactile-btn-secondary text-xs font-bold px-4 py-2.5 flex items-center gap-2 self-start sm:self-auto"
          >
            <Edit3 className="w-4 h-4" />
            <span>{isEditing ? 'Cancel Edit' : 'Edit Profile'}</span>
          </button>
        </div>

        {/* View mode or Edit mode */}
        {isEditing ? (
          <form onSubmit={handleSave} className="space-y-4 pt-6 animate-fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="tactile-input text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Primary Trade / Skill
                </label>
                <select
                  value={primarySkill}
                  onChange={e => setPrimarySkill(e.target.value as WorkerSkill)}
                  className="tactile-input text-sm"
                >
                  <option value="Painter">Painter</option>
                  <option value="Plumber">Plumber</option>
                  <option value="Carpenter">Carpenter</option>
                  <option value="Electrician">Electrician</option>
                  <option value="Mason">Mason</option>
                  <option value="Mechanic">Mechanic</option>
                  <option value="Welder">Welder</option>
                  <option value="Cleaner">Cleaner</option>
                  <option value="Agricultural">Agricultural Worker</option>
                  <option value="Other">Other Skilled Trade</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Additional Skills (Comma Separated)
              </label>
              <input
                type="text"
                value={additionalSkillsStr}
                onChange={e => setAdditionalSkillsStr(e.target.value)}
                className="tactile-input text-sm"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Experience (Years)
                </label>
                <input
                  type="number"
                  value={experienceYears}
                  onChange={e => setExperienceYears(Number(e.target.value))}
                  className="tactile-input text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Location / Area
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  className="tactile-input text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Preferred SMS Language
                </label>
                <select
                  value={preferredLanguage}
                  onChange={e => setPreferredLanguage(e.target.value as LanguageCode)}
                  className="tactile-input text-sm"
                >
                  <option value="mr">Marathi (मराठी)</option>
                  <option value="hi">Hindi (हिंदी)</option>
                  <option value="en">English</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Availability Status
                </label>
                <select
                  value={availability}
                  onChange={e => setAvailability(e.target.value as WorkerAvailability)}
                  className="tactile-input text-sm"
                >
                  <option value="available">Available (खुला)</option>
                  <option value="busy">Busy on Project (व्यस्त)</option>
                  <option value="on_leave">On Leave (रजेवर)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Standard Daily Wage Rate (₹)
                </label>
                <input
                  type="number"
                  value={dailyRate}
                  onChange={e => setDailyRate(Number(e.target.value))}
                  className="tactile-input text-sm font-bold text-emerald-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Work Bio / Summary
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={e => setBio(e.target.value)}
                className="tactile-input text-sm leading-relaxed"
              />
            </div>

            <div className="pt-4 border-t border-slate-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="tactile-btn-secondary px-5 py-2.5 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="tactile-btn-saffron px-6 py-2.5 text-xs font-bold shadow-tactile flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                <span>Save Profile Changes</span>
              </button>
            </div>
          </form>
        ) : (
          <div className="pt-6 space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-slate-400 text-[10px] block">Primary Trade:</span>
                <strong className="text-shramik-700 text-sm">{primarySkill}</strong>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">Experience:</span>
                <strong className="text-slate-800 text-sm">{experienceYears} Years</strong>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">Registered Location:</span>
                <strong className="text-slate-800 text-sm">{location}</strong>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">SMS Preferred Language:</span>
                <strong className="text-slate-800 text-sm uppercase">{preferredLanguage}</strong>
              </div>
            </div>

            <div>
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                Specialized Trade Skills:
              </span>
              <div className="flex flex-wrap gap-2">
                {profile.additionalSkills.map(skill => (
                  <span key={skill} className="bg-slate-100 text-slate-700 font-semibold px-3 py-1 rounded-xl text-xs border border-slate-200">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs text-slate-600 space-y-1">
              <div className="font-bold text-slate-800">Professional Bio:</div>
              <p className="leading-relaxed">{bio}</p>
            </div>

            <div className="flex items-center gap-2 text-xs text-emerald-800 bg-emerald-50 p-3 rounded-xl border border-emerald-200 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Verified Shramik Worker Identity • Mobile Number: {currentUser?.mobile || '+91 98201 44521'}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
