import React, { useState } from 'react';
import { 
  Menu, 
  X, 
  Globe, 
  Smartphone, 
  User as UserIcon, 
  LogOut, 
  Briefcase, 
  Users, 
  PlusCircle, 
  RotateCcw,
  Sparkles,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { LanguageCode } from '../../types';
import { UI_TRANSLATIONS } from '../../locales/translations';

interface NavbarProps {
  currentRoute: string;
  navigate: (route: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentRoute, navigate }) => {
  const { currentUser, logout, switchDemoUser, users } = useAuth();
  const { language, setLanguage, toggleSMSPanel, smsMessages, resetDemoData } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [demoSwitchOpen, setDemoSwitchOpen] = useState(false);

  const t = UI_TRANSLATIONS[language] || UI_TRANSLATIONS.en;

  const isCustomer = currentUser?.role === 'customer';
  const isFreelancer = currentUser?.role === 'freelancer';

  const handleNav = (route: string) => {
    navigate(route);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleNav('/')}>
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-shramik-700 via-shramik-600 to-shramik-400 p-2 text-white shadow-tactile flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-extrabold tracking-tight text-navy-900 font-display">
                  SHRAMIK<span className="text-shramik-600">-QUOTE</span>
                </span>
                <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-shramik-50 text-shramik-700 border border-shramik-200">
                  Gig Platform
                </span>
              </div>
              <p className="text-[11px] font-medium text-slate-500 leading-none">
                {t.subtitle}
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5 lg:gap-2">
            {!currentUser && (
              <>
                <button
                  onClick={() => handleNav('/')}
                  className={`px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${
                    currentRoute === '/' ? 'text-shramik-600 bg-shramik-50' : 'text-slate-600 hover:text-navy-900'
                  }`}
                >
                  Home
                </button>
                <button
                  onClick={() => handleNav('/how-it-works')}
                  className={`px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${
                    currentRoute === '/how-it-works' ? 'text-shramik-600 bg-shramik-50' : 'text-slate-600 hover:text-navy-900'
                  }`}
                >
                  {t.hero.howItWorks}
                </button>
                <button
                  onClick={() => handleNav('/customers')}
                  className={`px-3 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                    currentRoute === '/customers' ? 'text-shramik-600 bg-shramik-50 font-bold' : 'text-slate-600 hover:text-navy-900'
                  }`}
                >
                  <Users className="w-3.5 h-3.5 text-shramik-600" />
                  <span>Customers & Gigs</span>
                </button>
                <button
                  onClick={() => handleNav('/quotes')}
                  className={`px-3 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                    currentRoute === '/quotes' ? 'text-shramik-600 bg-shramik-50 font-bold' : 'text-slate-600 hover:text-navy-900'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Quotes AI</span>
                </button>
              </>
            )}

            {isCustomer && (
              <>
                <button
                  onClick={() => handleNav('/customer/dashboard')}
                  className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors ${
                    currentRoute.startsWith('/customer/dashboard') ? 'text-shramik-600 bg-shramik-50 font-bold' : 'text-slate-600 hover:text-navy-900'
                  }`}
                >
                  {t.nav.dashboard}
                </button>
                <button
                  onClick={() => handleNav('/customer/create-work')}
                  className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                    currentRoute === '/customer/create-work' ? 'text-shramik-600 bg-shramik-50 font-bold' : 'text-slate-600 hover:text-navy-900'
                  }`}
                >
                  <PlusCircle className="w-4 h-4 text-shramik-600" />
                  <span>{t.nav.createWork}</span>
                </button>
                <button
                  onClick={() => handleNav('/customer/workers')}
                  className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors ${
                    currentRoute === '/customer/workers' ? 'text-shramik-600 bg-shramik-50 font-bold' : 'text-slate-600 hover:text-navy-900'
                  }`}
                >
                  {t.nav.findWorkers}
                </button>
                <button
                  onClick={() => handleNav('/customer/work')}
                  className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors ${
                    currentRoute === '/customer/work' ? 'text-shramik-600 bg-shramik-50 font-bold' : 'text-slate-600 hover:text-navy-900'
                  }`}
                >
                  My Projects
                </button>
                <button
                  onClick={() => handleNav('/customers')}
                  className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                    currentRoute === '/customers' ? 'text-shramik-600 bg-shramik-50 font-bold' : 'text-slate-600 hover:text-navy-900'
                  }`}
                >
                  <Users className="w-3.5 h-3.5 text-shramik-600" />
                  <span>Customers & Gigs</span>
                </button>
                <button
                  onClick={() => handleNav('/customer/history')}
                  className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors ${
                    currentRoute === '/customer/history' ? 'text-shramik-600 bg-shramik-50 font-bold' : 'text-slate-600 hover:text-navy-900'
                  }`}
                >
                  {t.nav.history}
                </button>
              </>
            )}

            {isFreelancer && (
              <>
                <button
                  onClick={() => handleNav('/freelancer/dashboard')}
                  className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors ${
                    currentRoute === '/freelancer/dashboard' ? 'text-shramik-600 bg-shramik-50 font-bold' : 'text-slate-600 hover:text-navy-900'
                  }`}
                >
                  {t.nav.dashboard}
                </button>
                <button
                  onClick={() => handleNav('/freelancer/work')}
                  className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors ${
                    currentRoute === '/freelancer/work' ? 'text-shramik-600 bg-shramik-50 font-bold' : 'text-slate-600 hover:text-navy-900'
                  }`}
                >
                  {t.nav.myWork}
                </button>
                <button
                  onClick={() => handleNav('/customers')}
                  className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                    currentRoute === '/customers' ? 'text-shramik-600 bg-shramik-50 font-bold' : 'text-slate-600 hover:text-navy-900'
                  }`}
                >
                  <Users className="w-3.5 h-3.5 text-shramik-600" />
                  <span>Customers & Gigs</span>
                </button>
                <button
                  onClick={() => handleNav('/freelancer/history')}
                  className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors ${
                    currentRoute === '/freelancer/history' ? 'text-shramik-600 bg-shramik-50 font-bold' : 'text-slate-600 hover:text-navy-900'
                  }`}
                >
                  {t.nav.history}
                </button>
                <button
                  onClick={() => handleNav('/freelancer/profile')}
                  className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors ${
                    currentRoute === '/freelancer/profile' ? 'text-shramik-600 bg-shramik-50 font-bold' : 'text-slate-600 hover:text-navy-900'
                  }`}
                >
                  {t.nav.profile}
                </button>
              </>
            )}
          </nav>

          {/* Right Action Tools */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Language Switcher */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
              {(['en', 'hi', 'mr'] as LanguageCode[]).map((langCode) => (
                <button
                  key={langCode}
                  onClick={() => setLanguage(langCode)}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    language === langCode
                      ? 'bg-white text-navy-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {langCode === 'en' ? 'ENG' : langCode === 'hi' ? 'हिंदी' : 'मराठी'}
                </button>
              ))}
            </div>

            {/* Messages Drawer Toggle */}
            <button
              onClick={toggleSMSPanel}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-navy-900 text-white hover:bg-navy-800 active:scale-95 transition-all shadow-sm"
              title="Open Messages & SMS Gateway"
            >
              <Smartphone className="w-3.5 h-3.5 text-amber-400" />
              <span>Messages</span>
              {smsMessages.length > 0 && (
                <span className="bg-emerald-500 text-white px-1.5 py-0.2 rounded-full text-[10px] font-extrabold">
                  {smsMessages.length}
                </span>
              )}
            </button>

            {/* Quick Demo Role Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setDemoSwitchOpen(!demoSwitchOpen)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100 transition-colors"
                title="Quick Switch Demo Persona"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Demo Persona</span>
                <ChevronDown className="w-3 h-3" />
              </button>

              {demoSwitchOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 text-xs">
                  <div className="p-2 border-b border-slate-100 font-bold text-slate-500 uppercase text-[10px]">
                    Switch Active Persona:
                  </div>
                  <button
                    onClick={() => {
                      switchDemoUser('SQ-C-201');
                      setDemoSwitchOpen(false);
                      handleNav('/customer/dashboard');
                    }}
                    className="w-full text-left p-2 rounded-xl hover:bg-slate-50 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-slate-900">Rajesh Sharma</div>
                      <div className="text-[10px] text-slate-500">Customer / Contractor (Goa)</div>
                    </div>
                    {isCustomer && <span className="text-emerald-600 font-bold">✓</span>}
                  </button>

                  <button
                    onClick={() => {
                      switchDemoUser('SQ-F-1042');
                      setDemoSwitchOpen(false);
                      handleNav('/freelancer/dashboard');
                    }}
                    className="w-full text-left p-2 rounded-xl hover:bg-slate-50 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-slate-900">Ramesh Naik</div>
                      <div className="text-[10px] text-slate-500">Freelancer (Painter / Mapusa)</div>
                    </div>
                    {isFreelancer && <span className="text-emerald-600 font-bold">✓</span>}
                  </button>

                  <div className="p-1 border-t border-slate-100 mt-1">
                    <button
                      onClick={() => {
                        resetDemoData();
                        setDemoSwitchOpen(false);
                        handleNav('/');
                      }}
                      className="w-full flex items-center gap-1.5 p-2 text-slate-600 hover:text-rose-600 rounded-xl hover:bg-rose-50"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reset Demo Dataset</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Auth Buttons */}
            {currentUser ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <button
                  onClick={() => handleNav(isCustomer ? '/customer/profile' : '/freelancer/profile')}
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
                  title="View Profile"
                >
                  <div className="w-8 h-8 rounded-full bg-shramik-100 text-shramik-700 flex items-center justify-center font-bold text-xs">
                    {currentUser.name.charAt(0)}
                  </div>
                  <div className="text-left text-xs hidden xl:block">
                    <div className="font-bold text-slate-900 leading-tight">{currentUser.name}</div>
                    <div className="text-[10px] text-slate-500 capitalize">{currentUser.role}</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    logout();
                    handleNav('/');
                  }}
                  className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleNav('/login')}
                  className="px-4 py-2 text-sm font-bold text-slate-700 hover:text-navy-900 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  {t.nav.login}
                </button>
                <button
                  onClick={() => handleNav('/register')}
                  className="tactile-btn-primary px-4 py-2 text-sm font-bold shadow-tactile"
                >
                  {t.nav.register}
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={toggleSMSPanel}
              className="p-2 text-navy-900 bg-slate-100 rounded-xl"
              title="SMS Log"
            >
              <Smartphone className="w-5 h-5 text-amber-500" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-700 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white p-4 space-y-3 animate-fade-in shadow-xl">
          {/* Language selector mobile */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <span className="text-xs font-bold text-slate-500">Language:</span>
            <div className="flex gap-1">
              {(['en', 'hi', 'mr'] as LanguageCode[]).map((l) => (
                <button
                  key={l}
                  onClick={() => setLanguage(l)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                    language === l ? 'bg-shramik-600 text-white' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {l === 'en' ? 'ENG' : l === 'hi' ? 'हिंदी' : 'मराठी'}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            {!currentUser && (
              <>
                <button
                  onClick={() => handleNav('/')}
                  className="w-full text-left px-3 py-2 rounded-xl text-sm font-semibold text-slate-800 hover:bg-slate-50"
                >
                  Home
                </button>
                <button
                  onClick={() => handleNav('/how-it-works')}
                  className="w-full text-left px-3 py-2 rounded-xl text-sm font-semibold text-slate-800 hover:bg-slate-50"
                >
                  {t.hero.howItWorks}
                </button>
                <button
                  onClick={() => handleNav('/customers')}
                  className="w-full text-left px-3 py-2 rounded-xl text-sm font-semibold text-slate-800 hover:bg-slate-50 flex items-center gap-2"
                >
                  <Users className="w-4 h-4 text-shramik-600" />
                  <span>Customers & Gigs</span>
                </button>
                <button
                  onClick={() => handleNav('/quotes')}
                  className="w-full text-left px-3 py-2 rounded-xl text-sm font-semibold text-shramik-700 bg-shramik-50 hover:bg-shramik-100 flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Semantic Quotes AI</span>
                </button>
                <button
                  onClick={() => handleNav('/login')}
                  className="w-full text-left px-3 py-2 rounded-xl text-sm font-semibold text-slate-800 hover:bg-slate-50"
                >
                  {t.nav.login}
                </button>
                <button
                  onClick={() => handleNav('/register')}
                  className="tactile-btn-primary w-full mt-2"
                >
                  {t.nav.register}
                </button>
              </>
            )}

            {isCustomer && (
              <>
                <button
                  onClick={() => handleNav('/customer/dashboard')}
                  className="w-full text-left px-3 py-2 rounded-xl text-sm font-semibold text-slate-800 hover:bg-slate-50"
                >
                  {t.nav.dashboard}
                </button>
                <button
                  onClick={() => handleNav('/customer/create-work')}
                  className="w-full text-left px-3 py-2 rounded-xl text-sm font-semibold text-slate-800 hover:bg-slate-50"
                >
                  {t.nav.createWork}
                </button>
                <button
                  onClick={() => handleNav('/customer/workers')}
                  className="w-full text-left px-3 py-2 rounded-xl text-sm font-semibold text-slate-800 hover:bg-slate-50"
                >
                  {t.nav.findWorkers}
                </button>
                <button
                  onClick={() => handleNav('/customer/work')}
                  className="w-full text-left px-3 py-2 rounded-xl text-sm font-semibold text-slate-800 hover:bg-slate-50"
                >
                  My Projects
                </button>
                <button
                  onClick={() => handleNav('/customers')}
                  className="w-full text-left px-3 py-2 rounded-xl text-sm font-semibold text-slate-800 hover:bg-slate-50 flex items-center gap-2"
                >
                  <Users className="w-4 h-4 text-shramik-600" />
                  <span>Customers & Gigs</span>
                </button>
                <button
                  onClick={() => handleNav('/customer/history')}
                  className="w-full text-left px-3 py-2 rounded-xl text-sm font-semibold text-slate-800 hover:bg-slate-50"
                >
                  {t.nav.history}
                </button>
                <button
                  onClick={() => handleNav('/customer/profile')}
                  className="w-full text-left px-3 py-2 rounded-xl text-sm font-semibold text-slate-800 hover:bg-slate-50"
                >
                  {t.nav.profile}
                </button>
              </>
            )}

            {isFreelancer && (
              <>
                <button
                  onClick={() => handleNav('/freelancer/dashboard')}
                  className="w-full text-left px-3 py-2 rounded-xl text-sm font-semibold text-slate-800 hover:bg-slate-50"
                >
                  {t.nav.dashboard}
                </button>
                <button
                  onClick={() => handleNav('/freelancer/work')}
                  className="w-full text-left px-3 py-2 rounded-xl text-sm font-semibold text-slate-800 hover:bg-slate-50"
                >
                  {t.nav.myWork}
                </button>
                <button
                  onClick={() => handleNav('/customers')}
                  className="w-full text-left px-3 py-2 rounded-xl text-sm font-semibold text-slate-800 hover:bg-slate-50 flex items-center gap-2"
                >
                  <Users className="w-4 h-4 text-shramik-600" />
                  <span>Customers & Gigs</span>
                </button>
                <button
                  onClick={() => handleNav('/freelancer/history')}
                  className="w-full text-left px-3 py-2 rounded-xl text-sm font-semibold text-slate-800 hover:bg-slate-50"
                >
                  {t.nav.history}
                </button>
                <button
                  onClick={() => handleNav('/freelancer/profile')}
                  className="w-full text-left px-3 py-2 rounded-xl text-sm font-semibold text-slate-800 hover:bg-slate-50"
                >
                  {t.nav.profile}
                </button>
              </>
            )}

            {currentUser && (
              <button
                onClick={() => {
                  logout();
                  handleNav('/');
                }}
                className="w-full text-left px-3 py-2 rounded-xl text-sm font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2 pt-2 border-t border-slate-100"
              >
                <LogOut className="w-4 h-4" />
                <span>{t.nav.logout}</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
