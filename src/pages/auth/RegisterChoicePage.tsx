import React from 'react';
import { Briefcase, Users, ArrowRight, ArrowLeft } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UI_TRANSLATIONS } from '../../locales/translations';

export const RegisterChoicePage: React.FC<{ navigate: (r: string) => void }> = ({ navigate }) => {
  const { language } = useApp();
  const t = UI_TRANSLATIONS[language] || UI_TRANSLATIONS.en;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <button
        onClick={() => navigate('/')}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-navy-900 mb-8 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Home</span>
      </button>

      <div className="text-center max-w-xl mx-auto mb-12 space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-shramik-600 bg-shramik-50 px-3 py-1 rounded-full border border-shramik-200">
          Registration
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-navy-900 font-display">
          Choose Your Account Type
        </h1>
        <p className="text-slate-600 text-sm">
          Select whether you are here to hire skilled talent or accept gig work opportunities.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Customer Choice Card */}
        <div className="soft-box soft-box-hover p-8 flex flex-col justify-between border-2 border-slate-200 hover:border-shramik-500 transition-all">
          <div className="space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-shramik-100 text-shramik-700 flex items-center justify-center shadow-tactile">
              <Briefcase className="w-7 h-7" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-shramik-700 bg-shramik-50 px-2.5 py-1 rounded-lg">
              Customer / Organizer
            </span>
            <h2 className="text-2xl font-bold text-navy-900 font-display">
              I Need To Assign Work
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Post jobs, match verified local workers by trade skill and proximity, send instant opportunities via SMS, and coordinate crews.
            </p>

            <ul className="text-xs text-slate-600 space-y-1.5 pt-2">
              <li className="flex items-center gap-1.5">✓ Post projects in under 2 minutes</li>
              <li className="flex items-center gap-1.5">✓ Transparent candidate matching</li>
              <li className="flex items-center gap-1.5">✓ Real-time SMS response tracking</li>
            </ul>
          </div>

          <button
            onClick={() => navigate('/register/customer')}
            className="tactile-btn-primary w-full py-3.5 mt-8 shadow-tactile"
          >
            <span>Register as Customer</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Freelancer Choice Card */}
        <div className="soft-box soft-box-hover p-8 flex flex-col justify-between border-2 border-slate-200 hover:border-amber-400 transition-all">
          <div className="space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shadow-tactile">
              <Users className="w-7 h-7" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg">
              Freelancer / Skilled Worker
            </span>
            <h2 className="text-2xl font-bold text-navy-900 font-display">
              I Want To Accept Work
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Create a free worker profile, get matched to nearby assignments, receive job details over cellular SMS, and build a verified work history.
            </p>

            <ul className="text-xs text-slate-600 space-y-1.5 pt-2">
              <li className="flex items-center gap-1.5">✓ No internet required for jobs (SMS based)</li>
              <li className="flex items-center gap-1.5">✓ Reply 1 to view details, 1 to accept</li>
              <li className="flex items-center gap-1.5">✓ Verified digital identity & ratings</li>
            </ul>
          </div>

          <button
            onClick={() => navigate('/register/freelancer')}
            className="tactile-btn-saffron w-full py-3.5 mt-8 shadow-tactile"
          >
            <span>Register as Freelancer</span>
            <ArrowRight className="w-4 h-4 text-slate-900" />
          </button>
        </div>

      </div>

      {/* Login link */}
      <div className="text-center mt-10 text-sm text-slate-600">
        Already have an account?{' '}
        <button
          onClick={() => navigate('/login')}
          className="font-bold text-shramik-600 hover:underline"
        >
          Login to Shramik
        </button>
      </div>
    </div>
  );
};
