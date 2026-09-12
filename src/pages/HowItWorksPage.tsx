import React from 'react';
import { ArrowLeft, CheckCircle2, Smartphone, ArrowRight, MessageSquare, ShieldCheck, Zap } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { UI_TRANSLATIONS } from '../locales/translations';

export const HowItWorksPage: React.FC<{ navigate: (r: string) => void }> = ({ navigate }) => {
  const { language } = useApp();
  const t = UI_TRANSLATIONS[language] || UI_TRANSLATIONS.en;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      <button
        onClick={() => navigate('/')}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-navy-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Home</span>
      </button>

      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-teal-warm bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
          The Two-Sided Platform
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-navy-900 font-display">
          How Shramik Connects Work
        </h1>
        <p className="text-base text-slate-600">
          Bridging modern digital project organization with direct cellular SMS access for skilled local gig workers.
        </p>
      </div>

      {/* Deep Dive Steps */}
      <div className="space-y-8">
        {[
          {
            step: '01',
            title: 'Customer Creates Work Request Online',
            desc: 'A customer or contractor specifies trade requirements, location, duration, number of workers, and wage terms (e.g. Painting Project, Mapusa, 10 workers, 5 days, ₹800/day).',
            detail: 'The customer has an organized web workspace to manage projects, verify requirements, and coordinate dates.'
          },
          {
            step: '02',
            title: 'Shramik Matches Nearby Skilled Freelancers',
            desc: 'The matching engine scans registered local freelancers using a transparent weighted scoring model (Skill: 40%, Location: 20%, Experience: 15%, Availability: 15%, Language: 10%).',
            detail: 'Matches are sorted by relevance and proximity, preventing spam and targeting available tradespeople.'
          },
          {
            step: '03',
            title: 'Automated Carrier SMS Dispatched',
            desc: 'Customer selects freelancers and clicks "Send Opportunity". Instant SMS messages are sent to each worker\'s phone in their preferred language (English, Hindi, Marathi).',
            detail: 'Workers do not need an active internet connection, app, or smartphone.'
          },
          {
            step: '04',
            title: 'Worker Replies 1 For Full Terms',
            desc: 'The worker receives a concise teaser SMS and simply replies with the single digit "1". The system identifies the worker and delivers complete start dates, duration, reporting times, and wage specifics.',
            detail: 'Zero complicated text commands. Extremely simple for low digital literacy users.'
          },
          {
            step: '05',
            title: 'Worker Replies 1 to Accept (or 0 to Reject)',
            desc: 'Replying "1" registers immediate acceptance. The customer dashboard updates in real-time with green "ACCEPTED" status chips. The customer can then click "ASSIGN WORK" to confirm the crew.',
            detail: 'Customer receives verified, willing workers within minutes without hundreds of phone calls.'
          },
          {
            step: '06',
            title: 'Work Completed & History Recorded',
            desc: 'Upon job completion, the customer marks work completed. The job and verified 5-star rating are permanently recorded in the freelancer\'s digital work history.',
            detail: 'Every job becomes verified experience. A plumber or painter builds digital reputation without needing web access.'
          }
        ].map((item) => (
          <div key={item.step} className="soft-box p-8 border-2 border-slate-200 flex flex-col md:flex-row gap-6 items-start">
            <span className="text-3xl font-black text-shramik-600 font-display shrink-0 bg-shramik-50 w-14 h-14 rounded-2xl flex items-center justify-center border border-shramik-200">
              {item.step}
            </span>
            <div className="flex-1 space-y-2">
              <h3 className="text-xl font-bold text-navy-900">{item.title}</h3>
              <p className="text-sm text-slate-700 leading-relaxed">{item.desc}</p>
              <p className="text-xs text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                💡 <strong className="text-slate-700">Platform Impact:</strong> {item.detail}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* CTA Box */}
      <div className="soft-box-navy p-10 rounded-card-lg text-center space-y-6">
        <h2 className="text-3xl font-extrabold text-white font-display">
          Ready to Experience Shramik?
        </h2>
        <p className="text-slate-300 text-sm max-w-xl mx-auto">
          Start as a customer to post work, or register as a freelancer to receive job opportunities on your mobile.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => navigate('/register/customer')}
            className="tactile-btn-primary px-8 py-3.5 text-sm font-bold shadow-tactile"
          >
            Register as Customer
          </button>
          <button
            onClick={() => navigate('/register/freelancer')}
            className="tactile-btn-saffron px-8 py-3.5 text-sm font-bold shadow-tactile"
          >
            Register as Freelancer
          </button>
        </div>
      </div>
    </div>
  );
};
