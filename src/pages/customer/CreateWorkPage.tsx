import React, { useState } from 'react';
import { 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle2, 
  Briefcase, 
  MapPin, 
  Calendar, 
  Clock, 
  Users, 
  IndianRupee, 
  Sparkles,
  Wrench,
  Globe
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { WorkerSkill, LanguageCode } from '../../types';

export const CreateWorkPage: React.FC<{ navigate: (r: string) => void }> = ({ navigate }) => {
  const { createJob } = useApp();

  const [step, setStep] = useState(1);

  // Form State
  // Step 1
  const [title, setTitle] = useState('Painting Project');
  const [category, setCategory] = useState<WorkerSkill>('Painter');
  const [description, setDescription] = useState('Exterior weather-coat painting and surface waterproofing for a 4-storey residential society in Mapusa. Requires scaffolding setup, primer roll application, and final two coats.');

  // Step 2
  const [location, setLocation] = useState('Mapusa, Goa');
  const [startDate, setStartDate] = useState('18 Sept 2026');
  const [durationDays, setDurationDays] = useState(5);
  const [reportingTime, setReportingTime] = useState('8:00 AM');

  // Step 3
  const [workersRequired, setWorkersRequired] = useState(10);
  const [requiredSkill, setRequiredSkill] = useState('Exterior Weather Coating, Waterproofing');
  const [experienceRequired, setExperienceRequired] = useState(3);
  const [preferredLanguage, setPreferredLanguage] = useState<LanguageCode>('mr');

  // Step 4
  const [paymentType, setPaymentType] = useState<'daily' | 'fixed'>('daily');
  const [paymentAmount, setPaymentAmount] = useState(800);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNext = () => {
    if (step < 5) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
    else navigate('/customer/dashboard');
  };

  const handleCreateWork = async () => {
    setIsSubmitting(true);
    const skills = requiredSkill.split(',').map(s => s.trim()).filter(Boolean);

    const created = await createJob({
      title: title.trim(),
      category,
      description: description.trim(),
      location: location.trim(),
      startDate: startDate.trim(),
      durationDays: Number(durationDays),
      reportingTime: reportingTime.trim(),
      workersRequired: Number(workersRequired),
      skills,
      experienceRequired: Number(experienceRequired),
      preferredLanguage,
      paymentType,
      paymentAmount: Number(paymentAmount)
    });

    setIsSubmitting(false);
    // Redirect to Job Details where matching candidates and 15 SMS dispatch are shown
    navigate(`/customer/work/${created.id}`);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={handleBack}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-navy-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{step === 1 ? 'Cancel' : 'Back'}</span>
        </button>

        <span className="text-xs font-bold uppercase tracking-wider text-shramik-600 bg-shramik-50 px-3 py-1 rounded-full border border-shramik-200">
          Step {step} of 5
        </span>
      </div>

      {/* Stepper Progress Indicator */}
      <div className="flex items-center justify-between gap-2">
        {[
          { num: 1, label: 'Work' },
          { num: 2, label: 'Schedule' },
          { num: 3, label: 'Workers' },
          { num: 4, label: 'Payment' },
          { num: 5, label: 'Review' }
        ].map(s => (
          <div key={s.num} className="flex-1">
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                step === s.num
                  ? 'bg-shramik-600 text-white shadow-tactile'
                  : step > s.num
                  ? 'bg-emerald-500 text-white'
                  : 'bg-slate-200 text-slate-500'
              }`}>
                {step > s.num ? '✓' : s.num}
              </span>
              <span className={`text-xs font-bold hidden sm:inline ${
                step === s.num ? 'text-navy-900' : 'text-slate-400'
              }`}>
                {s.label}
              </span>
            </div>
            <div className={`h-1.5 rounded-full transition-all ${
              step >= s.num ? 'bg-shramik-600' : 'bg-slate-200'
            }`}></div>
          </div>
        ))}
      </div>

      {/* Wizard Card Container */}
      <div className="soft-box p-8 sm:p-10 border-2 border-slate-200 shadow-tactile">
        
        {/* STEP 1: WHAT WORK DO YOU NEED? */}
        {step === 1 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-shramik-600">STEP 1</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-navy-900 font-display mt-1">
                WHAT WORK DO YOU NEED?
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Define the project title and primary trade category
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Work Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Painting Project or House Painting"
                  required
                  className="tactile-input text-base font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Primary Trade Category *
                </label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value as WorkerSkill)}
                  className="tactile-input text-sm font-medium"
                >
                  <option value="Painter">Painting (पेंटर)</option>
                  <option value="Plumber">Plumbing (प्लंबर)</option>
                  <option value="Carpenter">Carpentry (सुतार)</option>
                  <option value="Electrician">Electrical (इलेक्ट्रीशियन)</option>
                  <option value="Mason">Masonry (राजमिस्त्री / गवंडी)</option>
                  <option value="Mechanic">Mechanic (मैकेनिक)</option>
                  <option value="Welder">Welding (वेल्डर)</option>
                  <option value="Cleaner">Cleaning (सफाई)</option>
                  <option value="Agricultural">Agricultural Worker (शेती कामगार)</option>
                  <option value="Construction">Construction (बांधकाम)</option>
                  <option value="Other">Other Skilled Trade</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Work Description
                </label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Describe scope of work, scaffold needs, surface requirements, etc."
                  className="tactile-input text-sm leading-relaxed"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: WHERE AND WHEN? */}
        {step === 2 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-shramik-600">STEP 2</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-navy-900 font-display mt-1">
                WHERE AND WHEN?
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Set location, start dates, and daily work timing
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Work Location / Area *
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
                  <input
                    type="text"
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    placeholder="e.g. Mapusa, Goa"
                    required
                    className="tactile-input pl-11 text-sm font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Start Date *
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
                    <input
                      type="text"
                      value={startDate}
                      onChange={e => setStartDate(e.target.value)}
                      placeholder="e.g. 18 Sept 2026"
                      required
                      className="tactile-input pl-11 text-sm font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Duration (Days) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={durationDays}
                    onChange={e => setDurationDays(Number(e.target.value))}
                    className="tactile-input text-sm font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Reporting Time *
                  </label>
                  <div className="relative">
                    <Clock className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
                    <input
                      type="text"
                      value={reportingTime}
                      onChange={e => setReportingTime(e.target.value)}
                      placeholder="8:00 AM"
                      className="tactile-input pl-11 text-sm font-semibold"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: WHO DO YOU NEED? */}
        {step === 3 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-shramik-600">STEP 3</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-navy-900 font-display mt-1">
                WHO DO YOU NEED?
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Worker crew size, minimum experience, and required techniques
              </p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Number of Workers Needed *
                  </label>
                  <div className="relative">
                    <Users className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={workersRequired}
                      onChange={e => setWorkersRequired(Number(e.target.value))}
                      className="tactile-input pl-11 text-base font-bold text-navy-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Minimum Experience (Years)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="30"
                    value={experienceRequired}
                    onChange={e => setExperienceRequired(Number(e.target.value))}
                    className="tactile-input text-base font-bold text-navy-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Required Specific Techniques / Skills
                </label>
                <input
                  type="text"
                  value={requiredSkill}
                  onChange={e => setRequiredSkill(e.target.value)}
                  placeholder="e.g. Scaffold Work, Exterior Emulsion, Waterproofing"
                  className="tactile-input text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Preferred SMS Language
                </label>
                <div className="relative">
                  <Globe className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
                  <select
                    value={preferredLanguage}
                    onChange={e => setPreferredLanguage(e.target.value as LanguageCode)}
                    className="tactile-input pl-11 text-sm font-medium"
                  >
                    <option value="mr">Marathi (मराठी) - Highly Recommended for North Goa</option>
                    <option value="hi">Hindi (हिंदी)</option>
                    <option value="en">English</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: PAYMENT */}
        {step === 4 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-shramik-600">STEP 4</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-navy-900 font-display mt-1">
                PAYMENT TERMS
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Transparent daily rate or fixed job payment
              </p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setPaymentType('daily')}
                  className={`p-4 rounded-2xl border-2 text-left transition-all ${
                    paymentType === 'daily'
                      ? 'border-shramik-600 bg-shramik-50/70 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="font-bold text-navy-900 text-sm">Daily Wage</div>
                  <div className="text-xs text-slate-500">Per worker per day</div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentType('fixed')}
                  className={`p-4 rounded-2xl border-2 text-left transition-all ${
                    paymentType === 'fixed'
                      ? 'border-shramik-600 bg-shramik-50/70 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="font-bold text-navy-900 text-sm">Fixed Total</div>
                  <div className="text-xs text-slate-500">For entire project completion</div>
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Payment Amount (₹) *
                </label>
                <div className="relative">
                  <IndianRupee className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
                  <input
                    type="number"
                    min="100"
                    step="50"
                    value={paymentAmount}
                    onChange={e => setPaymentAmount(Number(e.target.value))}
                    required
                    className="tactile-input pl-12 text-2xl font-black text-emerald-800"
                  />
                  <span className="absolute right-4 top-4 text-xs font-bold text-slate-400">
                    {paymentType === 'daily' ? '/ worker / day' : 'total'}
                  </span>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs text-slate-600 space-y-1">
                <div className="font-bold text-slate-800">Budget Estimate:</div>
                <div>
                  {workersRequired} workers × {durationDays} days @ ₹{paymentAmount}/day ={' '}
                  <strong className="text-emerald-700 font-bold">
                    ₹{(workersRequired * durationDays * paymentAmount).toLocaleString('en-IN')} Total
                  </strong>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: REVIEW */}
        {step === 5 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                STEP 5 • FINAL REVIEW
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-navy-900 font-display mt-1">
                REVIEW WORK DETAILS
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Check details before matching freelancers and dispatching SMS
              </p>
            </div>

            {/* Clean Review Job Card */}
            <div className="bg-gradient-to-b from-slate-50 to-white rounded-3xl p-6 border-2 border-slate-300 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div>
                  <span className="text-[10px] uppercase font-bold text-shramik-700 bg-shramik-100 px-2 py-0.5 rounded">
                    {category}
                  </span>
                  <h3 className="text-xl font-bold text-navy-900 mt-1">{title}</h3>
                </div>
                <div className="text-right">
                  <div className="text-xl font-black text-emerald-700">₹{paymentAmount}</div>
                  <div className="text-[10px] text-slate-400 uppercase font-bold">per day</div>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">{description}</p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
                <div>
                  <span className="text-slate-400 text-[11px]">Location:</span>
                  <div className="font-bold text-slate-900">{location}</div>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px]">Start Date:</span>
                  <div className="font-bold text-slate-900">{startDate}</div>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px]">Duration:</span>
                  <div className="font-bold text-slate-900">{durationDays} Days</div>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px]">Workers Needed:</span>
                  <div className="font-bold text-shramik-700">{workersRequired} Workers</div>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 text-xs text-amber-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                Next: Shramik will immediately run transparent candidate matching to find suitable local freelancers.
              </span>
            </div>
          </div>
        )}

        {/* Wizard Action Footer */}
        <div className="pt-6 border-t border-slate-200 mt-8 flex items-center justify-between">
          <button
            type="button"
            onClick={handleBack}
            className="tactile-btn-secondary px-6 py-3 text-xs font-bold"
          >
            {step === 1 ? 'Cancel' : 'Previous Step'}
          </button>

          {step < 5 ? (
            <button
              type="button"
              onClick={handleNext}
              className="tactile-btn-primary px-7 py-3 text-xs font-bold shadow-tactile flex items-center gap-2"
            >
              <span>Next Step</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleCreateWork}
              className="tactile-btn-primary px-8 py-3.5 text-sm font-bold shadow-tactile flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? 'Creating Work...' : 'CREATE WORK'}</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
