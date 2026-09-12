import React, { useState } from 'react';
import { ArrowLeft, CheckCircle2, Users, User, Phone, MapPin, Wrench, Globe, Clock, Lock, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { WorkerSkill, LanguageCode, WorkerAvailability } from '../../types';

export const FreelancerRegisterPage: React.FC<{ navigate: (r: string) => void }> = ({ navigate }) => {
  const { registerFreelancer } = useAuth();

  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [primarySkill, setPrimarySkill] = useState<WorkerSkill>('Painter');
  const [additionalSkillsStr, setAdditionalSkillsStr] = useState('Interior Emulsion, Wall Putty');
  const [experienceYears, setExperienceYears] = useState(5);
  const [location, setLocation] = useState('Mapusa, Goa');
  const [preferredLanguage, setPreferredLanguage] = useState<LanguageCode>('mr');
  const [availability, setAvailability] = useState<WorkerAvailability>('available');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdUser, setCreatedUser] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !mobile.trim()) {
      setError('Please provide your full name and mobile number.');
      return;
    }

    if (password && confirmPassword && password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    const additionalSkills = additionalSkillsStr
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    const res = await registerFreelancer({
      name: name.trim(),
      mobile: mobile.trim(),
      primarySkill,
      additionalSkills,
      experienceYears: Number(experienceYears),
      location: location.trim(),
      preferredLanguage,
      availability,
      password
    });

    if (res.success && res.user) {
      setCreatedUser(res.user);
      setIsSuccess(true);
    } else {
      setError(res.error || 'Registration failed. Please try again.');
    }
  };

  if (isSuccess && createdUser) {
    const profile = createdUser.freelancerProfile;
    return (
      <div className="max-w-lg mx-auto px-4 py-12 animate-fade-in">
        <div className="soft-box p-8 border-2 border-emerald-400 text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4 shadow-tactile">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
            Profile Created
          </span>

          <h2 className="text-2xl font-extrabold text-navy-900 mt-3 mb-1 font-display">
            FREELANCER PROFILE CREATED
          </h2>
          <p className="text-xs text-slate-500 mb-6">
            Your worker identity is active and ready to receive SMS opportunities.
          </p>

          {/* Profile Card Summary */}
          <div className="bg-slate-50 rounded-2xl p-5 text-left border border-slate-200 mb-6 space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Freelancer ID</span>
                <div className="text-lg font-black text-shramik-700 font-mono tracking-wide">
                  {profile.freelancerId}
                </div>
              </div>
              <span className="text-xs font-bold uppercase px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
                {profile.availability.toUpperCase()}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-400 text-[11px]">Full Name:</span>
                <div className="font-bold text-slate-900">{createdUser.name}</div>
              </div>
              <div>
                <span className="text-slate-400 text-[11px]">Mobile Number:</span>
                <div className="font-bold text-slate-900">{createdUser.mobile}</div>
              </div>
              <div>
                <span className="text-slate-400 text-[11px]">Primary Skill:</span>
                <div className="font-bold text-shramik-700">{profile.primarySkill}</div>
              </div>
              <div>
                <span className="text-slate-400 text-[11px]">Experience:</span>
                <div className="font-bold text-slate-900">{profile.experienceYears} Years</div>
              </div>
              <div>
                <span className="text-slate-400 text-[11px]">Location:</span>
                <div className="font-bold text-slate-900">{profile.location}</div>
              </div>
              <div>
                <span className="text-slate-400 text-[11px]">SMS Language:</span>
                <div className="font-bold text-slate-900 uppercase">{profile.preferredLanguage}</div>
              </div>
            </div>
          </div>

          <button
            onClick={() => navigate('/freelancer/dashboard')}
            className="tactile-btn-saffron w-full py-4 text-sm font-bold shadow-tactile"
          >
            Enter Freelancer Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-10">
      <button
        onClick={() => navigate('/register')}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-navy-900 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Account Selection</span>
      </button>

      <div className="soft-box p-8 sm:p-10 border-2 border-slate-200">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-navy-900 font-display">
              Freelancer Registration
            </h1>
            <p className="text-xs text-slate-500">Receive work opportunities directly via cellular SMS</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Full Name *
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Ramesh Naik"
                required
                className="tactile-input pl-11 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Mobile Number *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
                <input
                  type="tel"
                  value={mobile}
                  onChange={e => setMobile(e.target.value)}
                  placeholder="+91 98201 00000"
                  required
                  className="tactile-input pl-11 text-sm"
                />
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">
                Used to deliver job opportunities via SMS
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Primary Trade / Skill *
              </label>
              <div className="relative">
                <Wrench className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
                <select
                  value={primarySkill}
                  onChange={e => setPrimarySkill(e.target.value as WorkerSkill)}
                  className="tactile-input pl-11 text-sm"
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
                  <option value="Construction">Construction</option>
                  <option value="Other">Other Skilled Trade</option>
                </select>
              </div>
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
              placeholder="e.g. Waterproofing, Scaffold Work, Texture Paint"
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
                min="0"
                max="50"
                value={experienceYears}
                onChange={e => setExperienceYears(Number(e.target.value))}
                className="tactile-input text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Location / City
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
                <input
                  type="text"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  placeholder="e.g. Mapusa"
                  className="tactile-input pl-11 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                SMS Language
              </label>
              <div className="relative">
                <Globe className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
                <select
                  value={preferredLanguage}
                  onChange={e => setPreferredLanguage(e.target.value as LanguageCode)}
                  className="tactile-input pl-11 text-sm"
                >
                  <option value="mr">Marathi (मराठी)</option>
                  <option value="hi">Hindi (हिंदी)</option>
                  <option value="en">English</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Availability
            </label>
            <select
              value={availability}
              onChange={e => setAvailability(e.target.value as WorkerAvailability)}
              className="tactile-input text-sm"
            >
              <option value="available">Available for Work</option>
              <option value="busy">Currently Busy</option>
              <option value="on_leave">On Leave</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="tactile-input pl-11 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="tactile-input pl-11 text-sm"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="tactile-btn-saffron w-full py-4 text-sm font-bold mt-4 shadow-tactile"
          >
            Create Freelancer Profile
          </button>
        </form>

        <div className="text-center mt-6 text-xs text-slate-500">
          Already registered?{' '}
          <button
            onClick={() => navigate('/login')}
            className="text-shramik-600 font-bold hover:underline"
          >
            Login to Shramik
          </button>
        </div>
      </div>
    </div>
  );
};
