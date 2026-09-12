import React, { useState } from 'react';
import { ArrowLeft, CheckCircle2, Briefcase, Lock, User, Phone, Mail, MapPin, Building } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { CustomerType } from '../../types';

export const CustomerRegisterPage: React.FC<{ navigate: (r: string) => void }> = ({ navigate }) => {
  const { registerCustomer } = useAuth();

  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [location, setLocation] = useState('Mapusa, Goa');
  const [customerType, setCustomerType] = useState<CustomerType>('contractor');
  const [businessName, setBusinessName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdUser, setCreatedUser] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || name.trim().length < 2) {
      setError('Please provide your full name (at least 2 characters).');
      return;
    }

    const cleanMobile = mobile.replace(/\D/g, '');
    if (cleanMobile.length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    if (email.trim()) {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(email.trim())) {
        setError('Please enter a valid email address.');
        return;
      }
    }

    if (password && password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password && confirmPassword && password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    const res = await registerCustomer({
      name: name.trim(),
      mobile: mobile.trim(),
      email: email.trim() || undefined,
      location: location.trim(),
      customerType,
      businessName: businessName.trim() || undefined,
      password
    });

    if (res.success && res.user) {
      setCreatedUser(res.user);
      setIsSuccess(true);
    } else {
      setError(res.error || 'Registration failed. Please try again.');
    }
  };

  if (isSuccess) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center animate-fade-in">
        <div className="soft-box p-8 border-2 border-emerald-300">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4 shadow-tactile">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
            Success
          </span>
          <h2 className="text-2xl font-extrabold text-navy-900 mt-3 mb-2 font-display">
            ACCOUNT CREATED
          </h2>
          <p className="text-sm text-slate-600 mb-6">
            Your Shramik customer account for <strong>{createdUser?.name}</strong> is ready. You can now post work requests and find skilled local freelancers.
          </p>

          <button
            onClick={() => navigate('/customer/dashboard')}
            className="tactile-btn-primary w-full py-4 text-sm font-bold shadow-tactile"
          >
            Enter Customer Dashboard
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
          <div className="w-12 h-12 rounded-2xl bg-shramik-100 text-shramik-700 flex items-center justify-center">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-navy-900 font-display">
              Customer Registration
            </h1>
            <p className="text-xs text-slate-500">Hire skilled local workers & contractors</p>
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
                placeholder="e.g. Rajesh Sharma"
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
                  placeholder="+91 98221 00000"
                  required
                  className="tactile-input pl-11 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Address (Optional)
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="tactile-input pl-11 text-sm"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Customer Type
              </label>
              <select
                value={customerType}
                onChange={e => setCustomerType(e.target.value as CustomerType)}
                className="tactile-input text-sm"
              >
                <option value="individual">Individual Customer</option>
                <option value="contractor">Contractor / Builder</option>
                <option value="business">Business / Shop Owner</option>
                <option value="other">Other Organization</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Location / Area *
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
                <input
                  type="text"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  placeholder="e.g. Mapusa, Goa"
                  required
                  className="tactile-input pl-11 text-sm"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Business / Firm Name (Optional)
            </label>
            <div className="relative">
              <Building className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
              <input
                type="text"
                value={businessName}
                onChange={e => setBusinessName(e.target.value)}
                placeholder="e.g. Goa Infrastructure Projects"
                className="tactile-input pl-11 text-sm"
              />
            </div>
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
            className="tactile-btn-primary w-full py-4 text-sm font-bold mt-4 shadow-tactile"
          >
            Create Customer Account
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
