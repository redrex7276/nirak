import React, { useState } from 'react';
import { 
  ArrowRight, 
  CheckCircle2, 
  Smartphone, 
  Briefcase, 
  Users, 
  MessageSquare, 
  ShieldCheck, 
  Star, 
  MapPin, 
  Clock, 
  Sparkles,
  Zap
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { UI_TRANSLATIONS, SMS_TEMPLATES } from '../locales/translations';
import { LanguageCode } from '../types';

export const LandingPage: React.FC<{ navigate: (r: string) => void }> = ({ navigate }) => {
  const { language } = useApp();
  const t = UI_TRANSLATIONS[language] || UI_TRANSLATIONS.en;
  const [activePreviewLang, setActivePreviewLang] = useState<LanguageCode>(language);

  const sampleSMSParams = {
    title: activePreviewLang === 'mr' ? 'पेंटिंगचे काम' : activePreviewLang === 'hi' ? 'पेंटिंग का काम' : 'Painting Project',
    location: 'Mapusa',
    date: '18 Sept',
    duration: 5,
    rate: 800,
    workers: 10
  };

  const sampleTemplates = SMS_TEMPLATES[activePreviewLang];

  return (
    <div className="space-y-24 py-6">
      
      {/* 1. HERO SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Hero Text */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-shramik-100 text-shramik-800 text-xs font-bold border border-shramik-200 shadow-sm">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>Two-Sided Gig Work Platform • Web for Customers • SMS for Workers</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-navy-900 tracking-tight leading-[1.1] font-display">
              WORK SHOULD <span className="text-shramik-600 underline decoration-amber-400 decoration-wavy decoration-2">REACH</span> THE WORKER.
            </h1>

            <p className="text-lg sm:text-xl text-slate-600 leading-relaxed max-w-2xl font-normal">
              Shramik connects customers with skilled local freelancers and delivers work opportunities directly to workers through the web and SMS — even when mobile internet is unavailable.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
              <button
                onClick={() => navigate('/register')}
                className="tactile-btn-primary text-base px-8 py-4 flex items-center justify-center gap-2 shadow-tactile-hover"
              >
                <span>{t.hero.getStarted}</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <button
                onClick={() => navigate('/how-it-works')}
                className="tactile-btn-secondary text-base px-6 py-4 flex items-center justify-center gap-2"
              >
                <span>{t.hero.howItWorks}</span>
              </button>
            </div>

            {/* Micro Highlights */}
            <div className="pt-6 grid grid-cols-3 gap-4 border-t border-slate-200/80 max-w-xl text-xs font-semibold text-slate-600">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Zero Apps Required for Workers</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Simple 1 / 0 SMS Responses</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Verified Work History</span>
              </div>
            </div>
          </div>

          {/* Right Hero Visual Composition (2D Elegant Flow Diagram) */}
          <div className="lg:col-span-5">
            <div className="soft-box-navy p-6 sm:p-8 rounded-card-lg relative shadow-2xl border-slate-800">
              <div className="flex items-center justify-between pb-4 border-b border-navy-800 mb-6">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  The Shramik Opportunity Bridge
                </span>
                <span className="text-[11px] font-mono text-slate-400">Deterministic 2D Flow</span>
              </div>

              {/* 5-Stage Diagram */}
              <div className="space-y-3 relative">
                {/* Node 1 */}
                <div className="bg-navy-900/90 border border-slate-700/80 p-3.5 rounded-2xl flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-shramik-600/30 text-shramik-400 flex items-center justify-center font-bold text-sm shrink-0">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-bold text-white">1. Customer Creates Work</div>
                    <div className="text-[11px] text-slate-400">Painting Project • Mapusa • ₹800/day</div>
                  </div>
                  <span className="text-[10px] uppercase font-bold text-shramik-300 bg-shramik-950 px-2 py-0.5 rounded">Web Portal</span>
                </div>

                <div className="flex justify-center -my-1 text-slate-500">
                  <div className="w-0.5 h-4 bg-slate-700"></div>
                </div>

                {/* Node 2 */}
                <div className="bg-navy-900/90 border border-slate-700/80 p-3.5 rounded-2xl flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center font-bold text-sm shrink-0">
                    <Users className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-bold text-white">2. Shramik Matching Engine</div>
                    <div className="text-[11px] text-slate-400">27 Verified Local Painters Matched</div>
                  </div>
                  <span className="text-[10px] uppercase font-bold text-teal-300 bg-teal-950 px-2 py-0.5 rounded">Scored Match</span>
                </div>

                <div className="flex justify-center -my-1 text-slate-500">
                  <div className="w-0.5 h-4 bg-slate-700"></div>
                </div>

                {/* Node 3 (SMS Dispatch) */}
                <div className="bg-amber-400/10 border-2 border-amber-400/40 p-3.5 rounded-2xl flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-400 text-navy-950 flex items-center justify-center font-bold text-sm shrink-0">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-bold text-amber-300">3. Direct SMS To Freelancers</div>
                    <div className="text-[11px] text-slate-300">Delivered over cellular network</div>
                  </div>
                  <span className="text-[10px] uppercase font-bold text-amber-300 bg-amber-950 px-2 py-0.5 rounded">Zero Data</span>
                </div>

                <div className="flex justify-center -my-1 text-slate-500">
                  <div className="w-0.5 h-4 bg-slate-700"></div>
                </div>

                {/* Node 4 (Reply) */}
                <div className="bg-navy-900/90 border border-slate-700/80 p-3.5 rounded-2xl flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold text-sm shrink-0">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-bold text-white">4. Worker Numeric Replies</div>
                    <div className="text-[11px] text-slate-400">Reply 1 = Details • Reply 1 = Accept</div>
                  </div>
                  <span className="text-[10px] uppercase font-bold text-emerald-300 bg-emerald-950 px-2 py-0.5 rounded">Instant</span>
                </div>

                <div className="flex justify-center -my-1 text-slate-500">
                  <div className="w-0.5 h-4 bg-slate-700"></div>
                </div>

                {/* Node 5 */}
                <div className="bg-navy-900/90 border border-slate-700/80 p-3.5 rounded-2xl flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-300 flex items-center justify-center font-bold text-sm shrink-0">
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-bold text-white">5. Assignment & Work History</div>
                    <div className="text-[11px] text-slate-400">Experience & verified ratings recorded</div>
                  </div>
                  <span className="text-[10px] uppercase font-bold text-blue-300 bg-blue-950 px-2 py-0.5 rounded">Reputation</span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-navy-800 text-center">
                <p className="text-xs text-amber-300 font-bold">
                  "Your skills should not depend on your internet connection."
                </p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 2. WHO ARE YOU? TWO LARGE CHOICES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-shramik-600 bg-shramik-50 px-3 py-1 rounded-full border border-shramik-200">
            {t.hero.rolePromptTitle}
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-navy-900 font-display">
            {t.hero.rolePromptDesc}
          </h2>
          <p className="text-slate-600 text-sm">
            Whether you are organizing work or providing skilled services, Shramik has a dedicated experience for you.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Choice 1: CUSTOMER */}
          <div className="soft-box soft-box-hover p-8 sm:p-10 flex flex-col justify-between border-2 border-slate-200 hover:border-shramik-500 transition-all group">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-shramik-100 text-shramik-700 flex items-center justify-center group-hover:scale-105 transition-transform shadow-tactile">
                <Briefcase className="w-7 h-7" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-shramik-700 bg-shramik-50 px-2.5 py-1 rounded-lg">
                Role 1 • Organizer
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-navy-900 font-display">
                {t.hero.customerCardTitle}
              </h3>
              <p className="text-base text-slate-600 leading-relaxed font-medium">
                "{t.hero.customerCardDesc}"
              </p>
              
              <div className="pt-3 pb-4 space-y-2 border-t border-slate-100 text-xs text-slate-500">
                <div className="font-bold text-slate-700 uppercase tracking-wide">Common Work Needs:</div>
                <div className="flex flex-wrap gap-1.5">
                  {['House Painting', 'Plumbing Repair', 'Electrician Conduit', 'Carpentry', 'Civil Masonry'].map(tag => (
                    <span key={tag} className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg font-medium">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate('/register/customer')}
              className="tactile-btn-primary w-full py-4 text-base mt-6 shadow-tactile"
            >
              <span>{t.hero.customerCardBtn}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Choice 2: FREELANCER */}
          <div className="soft-box soft-box-hover p-8 sm:p-10 flex flex-col justify-between border-2 border-slate-200 hover:border-amber-400 transition-all group">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center group-hover:scale-105 transition-transform shadow-tactile">
                <Users className="w-7 h-7" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg">
                Role 2 • Skilled Worker
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-navy-900 font-display">
                {t.hero.freelancerCardTitle}
              </h3>
              <p className="text-base text-slate-600 leading-relaxed font-medium">
                "{t.hero.freelancerCardDesc}"
              </p>

              <div className="pt-3 pb-4 space-y-2 border-t border-slate-100 text-xs text-slate-500">
                <div className="font-bold text-slate-700 uppercase tracking-wide">Key Benefits for You:</div>
                <div className="flex flex-wrap gap-1.5">
                  {['Receive Jobs via SMS', 'Accept with Reply 1', 'No App Needed', 'Verified Work History', 'Direct Daily Pay'].map(tag => (
                    <span key={tag} className="bg-amber-50 text-amber-900 px-2.5 py-1 rounded-lg font-medium border border-amber-200/50">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate('/register/freelancer')}
              className="tactile-btn-saffron w-full py-4 text-base mt-6 shadow-tactile"
            >
              <span>{t.hero.freelancerCardBtn}</span>
              <ArrowRight className="w-4 h-4 text-slate-900" />
            </button>
          </div>

        </div>
      </section>

      {/* 3. PROBLEM SECTION */}
      <section className="bg-slate-100/80 py-16 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            <div className="lg:col-span-5 space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
                {t.problem.tag}
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-navy-900 font-display leading-tight">
                {t.problem.title}
              </h2>
            </div>

            <div className="lg:col-span-7 space-y-4 text-slate-700 leading-relaxed text-base">
              <div className="soft-box p-6 bg-white border border-slate-200">
                <p className="font-medium text-slate-800 mb-2">
                  {t.problem.desc1}
                </p>
                <p className="text-slate-600 text-sm">
                  {t.problem.desc2}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
                  <div className="font-bold text-navy-900 text-sm mb-1">Traditional Job Platforms:</div>
                  <p className="text-xs text-slate-500">Require smartphones, 4G/5G, app downloads, complex logins, and ongoing data packs.</p>
                </div>
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 shadow-sm">
                  <div className="font-bold text-emerald-900 text-sm mb-1">The Shramik Difference:</div>
                  <p className="text-xs text-emerald-800">Direct carrier SMS. Works on any basic feature phone. Reply 1 to get details, 1 to accept.</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4. HOW IT WORKS (6 STEPS) */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-warm bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
            {t.howItWorksSection.tag}
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-navy-900 font-display">
            {t.howItWorksSection.title}
          </h2>
          <p className="text-slate-600 text-sm">
            Six straightforward steps connecting customer requirements to worker completion.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { num: '01', title: t.howItWorksSection.step1Title, desc: t.howItWorksSection.step1Desc, badge: 'Onboarding' },
            { num: '02', title: t.howItWorksSection.step2Title, desc: t.howItWorksSection.step2Desc, badge: 'Job Post' },
            { num: '03', title: t.howItWorksSection.step3Title, desc: t.howItWorksSection.step3Desc, badge: 'Matching' },
            { num: '04', title: t.howItWorksSection.step4Title, desc: t.howItWorksSection.step4Desc, badge: 'SMS Dispatch' },
            { num: '05', title: t.howItWorksSection.step5Title, desc: t.howItWorksSection.step5Desc, badge: 'Instant Reply' },
            { num: '06', title: t.howItWorksSection.step6Title, desc: t.howItWorksSection.step6Desc, badge: 'Experience' }
          ].map((step, idx) => (
            <div 
              key={step.num}
              className="soft-box p-6 border-2 border-slate-200/90 flex flex-col justify-between hover:border-shramik-400 transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-black text-shramik-600 font-display">{step.num}</span>
                  <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                    {step.badge}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-navy-900 mb-2">{step.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. SMS FEATURE SECTION (CLEAN 2D MESSAGE VISUALIZATION) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="soft-box-navy p-8 sm:p-12 rounded-card-lg relative overflow-hidden border-slate-800">
          <div className="max-w-3xl mb-10 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/30">
              {t.smsFeature.tag}
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-display">
              {t.smsFeature.title}
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              {t.smsFeature.desc}
            </p>
          </div>

          {/* Language selector for SMS showcase */}
          <div className="flex items-center gap-2 mb-6">
            <span className="text-xs font-bold text-slate-400 uppercase">Preview SMS in:</span>
            {(['en', 'hi', 'mr'] as LanguageCode[]).map(l => (
              <button
                key={l}
                onClick={() => setActivePreviewLang(l)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  activePreviewLang === l
                    ? 'bg-amber-400 text-navy-950 font-extrabold'
                    : 'bg-navy-900 text-slate-300 hover:text-white border border-slate-700'
                }`}
              >
                {l === 'en' ? 'English' : l === 'hi' ? 'हिंदी (Hindi)' : 'मराठी (Marathi)'}
              </button>
            ))}
          </div>

          {/* 2D Chat Timeline Showcase */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Step 1 SMS */}
            <div className="bg-navy-900 border border-slate-800 p-5 rounded-2xl space-y-3">
              <div className="flex items-center justify-between text-[11px] text-amber-400 font-bold uppercase">
                <span>Step 1 • Initial SMS</span>
                <span>Cellular</span>
              </div>
              <div className="bg-slate-950/80 text-white font-mono text-xs p-3.5 rounded-xl border border-slate-800 whitespace-pre-line leading-relaxed">
                {sampleTemplates.opportunity(sampleSMSParams)}
              </div>
              <div className="text-[11px] text-slate-400">
                Worker replies with <strong className="text-white">1</strong> to inspect details.
              </div>
            </div>

            {/* Step 2 SMS */}
            <div className="bg-navy-900 border border-slate-800 p-5 rounded-2xl space-y-3">
              <div className="flex items-center justify-between text-[11px] text-teal-400 font-bold uppercase">
                <span>Step 2 • Terms Delivered</span>
                <span>Cellular</span>
              </div>
              <div className="bg-slate-950/80 text-white font-mono text-xs p-3.5 rounded-xl border border-slate-800 whitespace-pre-line leading-relaxed">
                {sampleTemplates.details(sampleSMSParams)}
              </div>
              <div className="text-[11px] text-slate-400">
                Worker replies <strong className="text-emerald-400">1</strong> to accept, or <strong className="text-rose-400">0</strong> to reject.
              </div>
            </div>

            {/* Step 3 SMS */}
            <div className="bg-navy-900 border border-slate-800 p-5 rounded-2xl space-y-3">
              <div className="flex items-center justify-between text-[11px] text-emerald-400 font-bold uppercase">
                <span>Step 3 • Acceptance</span>
                <span>Cellular</span>
              </div>
              <div className="bg-slate-950/80 text-white font-mono text-xs p-3.5 rounded-xl border border-slate-800 whitespace-pre-line leading-relaxed">
                {sampleTemplates.accepted(sampleSMSParams)}
              </div>
              <div className="text-[11px] text-emerald-400 font-semibold">
                ✓ Customer dashboard instantly updates to ACCEPTED.
              </div>
            </div>

          </div>

          {/* Banner bottom */}
          <div className="mt-8 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
            <div>
              <strong>One Mobile Number. More Opportunities.</strong> Works on standard Nokia 105, JioBharat, Samsung Guru, or any smartphone.
            </div>
            <button
              onClick={() => navigate('/register')}
              className="tactile-btn-saffron px-6 py-3 text-xs uppercase tracking-wider font-bold shrink-0"
            >
              Get Started with Shramik
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};
