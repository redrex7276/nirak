import React from 'react';
import { Smartphone, Heart, ShieldCheck, Zap } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UI_TRANSLATIONS } from '../../locales/translations';

export const Footer: React.FC<{ navigate: (r: string) => void }> = ({ navigate }) => {
  const { language } = useApp();
  const t = UI_TRANSLATIONS[language] || UI_TRANSLATIONS.en;

  return (
    <footer className="bg-navy-950 text-slate-400 border-t border-navy-900 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          
          {/* Col 1: Brand */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-shramik-600 p-2 text-white flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <span className="text-xl font-extrabold text-white tracking-tight font-display">
                SHRAMIK<span className="text-shramik-400">-QUOTE</span>
              </span>
            </div>

            <p className="text-sm text-slate-400 max-w-md leading-relaxed">
              A simplified, human-centered two-sided gig platform bridging organized customers with skilled local freelancers. Opportunities delivered directly over SMS — no smartphone or app required for workers.
            </p>

            <div className="flex items-center gap-3 text-xs font-semibold text-slate-300">
              <span className="flex items-center gap-1.5 bg-navy-900 px-3 py-1.5 rounded-full border border-navy-800">
                <Smartphone className="w-3.5 h-3.5 text-amber-400" />
                SMS Enabled
              </span>
              <span className="flex items-center gap-1.5 bg-navy-900 px-3 py-1.5 rounded-full border border-navy-800">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                Verified Workers
              </span>
              <span className="flex items-center gap-1.5 bg-navy-900 px-3 py-1.5 rounded-full border border-navy-800">
                <Zap className="w-3.5 h-3.5 text-shramik-400" />
                Instant Dispatch
              </span>
            </div>
          </div>

          {/* Col 2: For Customers */}
          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-3">For Customers</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button onClick={() => navigate('/customer/create-work')} className="hover:text-white transition-colors">
                  Create Work Request
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/customer/workers')} className="hover:text-white transition-colors">
                  Find Local Freelancers
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/register/customer')} className="hover:text-white transition-colors">
                  Customer Registration
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/how-it-works')} className="hover:text-white transition-colors">
                  How Matching Works
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: For Freelancers */}
          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-3">For Freelancers</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button onClick={() => navigate('/register/freelancer')} className="hover:text-white transition-colors">
                  Join as Freelancer
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/login')} className="hover:text-white transition-colors">
                  Freelancer Login
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/how-it-works')} className="hover:text-white transition-colors">
                  SMS Opportunity Guide
                </button>
              </li>
              <li>
                <span className="text-slate-500 text-xs">Reply 1 for details, 1 to accept</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-navy-900/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 SHRAMIK-QUOTE. Built with dignity for India's skilled workforce.</p>
          <p className="flex items-center gap-1.5">
            <span>Work Should Reach The Worker</span>
            <span>•</span>
            <span className="text-amber-400 font-bold">1 Mobile Number. More Opportunities.</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
