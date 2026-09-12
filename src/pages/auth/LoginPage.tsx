import React, { useState } from 'react';
import { ArrowLeft, Lock, Phone, Mail, ArrowRight, UserCheck, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const LoginPage: React.FC<{ navigate: (r: string) => void; redirectNotice?: string }> = ({ navigate, redirectNotice }) => {
  const { login } = useAuth();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(redirectNotice || '');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await login(identifier, password);
    setLoading(false);

    if (res.success && res.user) {
      if (res.user.role === 'customer') {
        navigate('/customer/dashboard');
      } else {
        navigate('/freelancer/dashboard');
      }
    } else {
      setError(res.error || 'Login failed. Please check your credentials.');
    }
  };

  const handleQuickCustomer = async () => {
    setIdentifier('+91 98221 55432');
    setPassword('demo123');
    const res = await login('+91 98221 55432', 'demo123');
    if (res.success) {
      navigate('/customer/dashboard');
    }
  };

  const handleQuickFreelancer = async () => {
    setIdentifier('+91 98201 44521');
    setPassword('demo123');
    const res = await login('+91 98201 44521', 'demo123');
    if (res.success) {
      navigate('/freelancer/dashboard');
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <button
        onClick={() => navigate('/')}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-navy-900 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Home</span>
      </button>

      <div className="soft-box p-8 sm:p-10 border-2 border-slate-200">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-shramik-600 text-white flex items-center justify-center mx-auto mb-3 shadow-tactile">
            <UserCheck className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-navy-900 font-display">
            SHRAMIK LOGIN
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Access your Customer or Freelancer dashboard
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Mobile Number / Email / ID
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
              <input
                type="text"
                value={identifier}
                onChange={e => setIdentifier(e.target.value)}
                placeholder="+91 98221 55432 or SQ-F-1042"
                required
                className="tactile-input pl-11 text-sm"
              />
            </div>
          </div>

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

          <button
            type="submit"
            disabled={loading}
            className="tactile-btn-primary w-full py-4 text-sm font-bold shadow-tactile mt-2"
          >
            <span>{loading ? 'Logging in...' : 'LOGIN TO SHRAMIK'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Hackathon Quick Fill helper */}
        <div className="mt-8 pt-6 border-t border-slate-200 space-y-2.5">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center flex items-center justify-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Quick Demo 1-Click Login
          </div>

          <button
            type="button"
            onClick={handleQuickCustomer}
            className="w-full py-2.5 px-3 rounded-xl border border-shramik-200 bg-shramik-50 hover:bg-shramik-100 text-shramik-800 text-xs font-bold text-left flex items-center justify-between transition-colors"
          >
            <div>
              <div>Customer: Rajesh Sharma</div>
              <div className="text-[10px] text-shramik-600 font-normal">Contractor • Mapusa, Goa</div>
            </div>
            <span className="text-xs bg-white px-2 py-0.5 rounded-lg border border-shramik-200">Log In →</span>
          </button>

          <button
            type="button"
            onClick={handleQuickFreelancer}
            className="w-full py-2.5 px-3 rounded-xl border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold text-left flex items-center justify-between transition-colors"
          >
            <div>
              <div>Freelancer: Ramesh Naik (SQ-F-1042)</div>
              <div className="text-[10px] text-amber-700 font-normal">Master Painter • 126 Jobs • Marathi</div>
            </div>
            <span className="text-xs bg-white px-2 py-0.5 rounded-lg border border-amber-200">Log In →</span>
          </button>
        </div>

        <div className="text-center mt-6 text-xs text-slate-500">
          Don't have an account?{' '}
          <button
            onClick={() => navigate('/register')}
            className="font-bold text-shramik-600 hover:underline"
          >
            CREATE ACCOUNT
          </button>
        </div>
      </div>
    </div>
  );
};
