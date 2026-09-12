import React, { useState } from 'react';
import { ArrowLeft, Lock, Phone, Mail, ArrowRight, UserCheck, Sparkles, KeyRound, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ConfirmationResult } from 'firebase/auth';

type LoginTab = 'email' | 'phone';

export const LoginPage: React.FC<{ navigate: (r: string) => void; redirectNotice?: string }> = ({ navigate, redirectNotice }) => {
  const { login, loginWithGoogle, sendPhoneOtp, verifyPhoneOtp } = useAuth();

  const [activeTab, setActiveTab] = useState<LoginTab>('email');
  
  // Email state
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  
  // Phone state
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [otpSent, setOtpSent] = useState(false);

  const [error, setError] = useState(redirectNotice || '');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Email / Password / ID Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
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

  // Google Sign-In
  const handleGoogleLogin = async () => {
    setError('');
    setSuccessMsg('');
    setLoading(true);

    const res = await loginWithGoogle('customer');
    setLoading(false);

    if (res.success && res.user) {
      if (res.user.role === 'customer') {
        navigate('/customer/dashboard');
      } else {
        navigate('/freelancer/dashboard');
      }
    } else {
      setError(res.error || 'Google Sign-In failed. Please try again.');
    }
  };

  // Send Phone SMS OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    
    const cleanNum = phoneNumber.trim().replace(/\D/g, '');
    if (cleanNum.length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    setLoading(true);
    const res = await sendPhoneOtp(phoneNumber, 'recaptcha-container');
    setLoading(false);

    if (res.success && res.confirmationResult) {
      setConfirmationResult(res.confirmationResult);
      setOtpSent(true);
      setSuccessMsg('SMS verification code sent to your phone.');
    } else {
      setError(res.error || 'Failed to send SMS OTP. Check your phone number and console settings.');
    }
  };

  // Verify Phone SMS OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmationResult) {
      setError('Session expired. Please request a new OTP code.');
      return;
    }
    if (!otpCode || otpCode.trim().length < 6) {
      setError('Please enter the 6-digit verification code.');
      return;
    }

    setError('');
    setLoading(true);
    const res = await verifyPhoneOtp(confirmationResult, otpCode, 'customer');
    setLoading(false);

    if (res.success && res.user) {
      if (res.user.role === 'customer') {
        navigate('/customer/dashboard');
      } else {
        navigate('/freelancer/dashboard');
      }
    } else {
      setError(res.error || 'Invalid verification code.');
    }
  };

  // Demo shortcuts
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
      {/* Invisible container for Firebase Phone Auth reCAPTCHA */}
      <div id="recaptcha-container"></div>

      <button
        onClick={() => navigate('/')}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-navy-900 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Home</span>
      </button>

      <div className="soft-box p-8 sm:p-10 border-2 border-slate-200 shadow-sm rounded-3xl bg-white">
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

        {/* Notifications */}
        {error && (
          <div className="mb-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700">
            {error}
          </div>
        )}
        {successMsg && (
          <div className="mb-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-700 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Google Sign-In Button */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full py-3 px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-sm font-bold flex items-center justify-center gap-3 transition-colors shadow-sm mb-5"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        {/* Divider */}
        <div className="relative flex items-center justify-center mb-5">
          <div className="border-t border-slate-200 w-full"></div>
          <span className="bg-white px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            or continue with
          </span>
          <div className="border-t border-slate-200 w-full"></div>
        </div>

        {/* Tab Selection */}
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-xl mb-5">
          <button
            type="button"
            onClick={() => { setActiveTab('email'); setError(''); }}
            className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'email'
                ? 'bg-white text-navy-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Email / ID</span>
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('phone'); setError(''); }}
            className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'phone'
                ? 'bg-white text-navy-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Phone OTP</span>
          </button>
        </div>

        {/* Tab 1: Email & Password */}
        {activeTab === 'email' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Email / Mobile / User ID
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
                <input
                  type="text"
                  value={identifier}
                  onChange={e => setIdentifier(e.target.value)}
                  placeholder="name@example.com or +91..."
                  required
                  className="tactile-input pl-11 text-sm w-full"
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
                  className="tactile-input pl-11 text-sm w-full"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="tactile-btn-primary w-full py-3.5 text-sm font-bold shadow-tactile mt-2 flex items-center justify-center gap-2"
            >
              <span>{loading ? 'Logging in...' : 'LOGIN WITH CREDENTIALS'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Tab 2: Phone Number & SMS OTP */}
        {activeTab === 'phone' && (
          <div className="space-y-4">
            {!otpSent ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Mobile Number
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={e => setPhoneNumber(e.target.value)}
                      placeholder="+91 98221 55432"
                      required
                      className="tactile-input pl-11 text-sm w-full"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Enter with +91 country code. We will send an SMS OTP code.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="tactile-btn-primary w-full py-3.5 text-sm font-bold shadow-tactile mt-2 flex items-center justify-center gap-2"
                >
                  <span>{loading ? 'Sending OTP...' : 'SEND VERIFICATION CODE'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Enter 6-Digit SMS Code
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
                    <input
                      type="text"
                      maxLength={6}
                      value={otpCode}
                      onChange={e => setOtpCode(e.target.value)}
                      placeholder="123456"
                      required
                      className="tactile-input pl-11 text-sm tracking-widest text-center font-mono font-bold w-full"
                    />
                  </div>
                  <div className="flex justify-between items-center text-[11px] text-slate-500 mt-1.5">
                    <span>Sent to {phoneNumber}</span>
                    <button
                      type="button"
                      onClick={() => { setOtpSent(false); setOtpCode(''); }}
                      className="text-shramik-600 font-bold hover:underline"
                    >
                      Change number
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="tactile-btn-primary w-full py-3.5 text-sm font-bold shadow-tactile mt-2 flex items-center justify-center gap-2"
                >
                  <span>{loading ? 'Verifying...' : 'VERIFY & LOG IN'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>
        )}

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
