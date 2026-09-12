import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { SMSActivityPanel } from './components/sms/SMSActivityPanel';
import { ToastContainer } from './components/ui/Toast';

import { LandingPage } from './pages/LandingPage';
import { RegisterChoicePage } from './pages/auth/RegisterChoicePage';
import { CustomerRegisterPage } from './pages/auth/CustomerRegisterPage';
import { FreelancerRegisterPage } from './pages/auth/FreelancerRegisterPage';
import { LoginPage } from './pages/auth/LoginPage';
import { HowItWorksPage } from './pages/HowItWorksPage';

import { CustomerDashboard } from './pages/customer/CustomerDashboard';
import { CreateWorkPage } from './pages/customer/CreateWorkPage';
import { JobDetailsPage } from './pages/customer/JobDetailsPage';
import { FindWorkersPage } from './pages/customer/FindWorkersPage';
import { CustomerHistoryPage } from './pages/customer/CustomerHistoryPage';
import { CustomerProfilePage } from './pages/customer/CustomerProfilePage';

import { FreelancerDashboard } from './pages/freelancer/FreelancerDashboard';
import { FreelancerWorkPage } from './pages/freelancer/FreelancerWorkPage';
import { FreelancerHistoryPage } from './pages/freelancer/FreelancerHistoryPage';
import { FreelancerProfilePage } from './pages/freelancer/FreelancerProfilePage';

function RouterShell() {
  const { currentUser } = useAuth();
  const [currentRoute, setCurrentRoute] = useState<string>(() => {
    return window.location.pathname || '/';
  });

  // Keep route synced with browser history
  useEffect(() => {
    const onPopState = () => {
      setCurrentRoute(window.location.pathname || '/');
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const navigate = (route: string) => {
    window.history.pushState({}, '', route);
    setCurrentRoute(route);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Route protection
  const isCustomerRoute = currentRoute.startsWith('/customer');
  const isFreelancerRoute = currentRoute.startsWith('/freelancer');

  useEffect(() => {
    if (isCustomerRoute && (!currentUser || currentUser.role !== 'customer')) {
      if (!currentUser) {
        navigate('/login');
      } else {
        navigate('/freelancer/dashboard');
      }
    } else if (isFreelancerRoute && (!currentUser || currentUser.role !== 'freelancer')) {
      if (!currentUser) {
        navigate('/login');
      } else {
        navigate('/customer/dashboard');
      }
    }
  }, [currentRoute, currentUser]);

  // Determine Page to render
  const renderPage = () => {
    // Public routes
    if (currentRoute === '/') {
      return <LandingPage navigate={navigate} />;
    }
    if (currentRoute === '/register') {
      return <RegisterChoicePage navigate={navigate} />;
    }
    if (currentRoute === '/register/customer') {
      return <CustomerRegisterPage navigate={navigate} />;
    }
    if (currentRoute === '/register/freelancer') {
      return <FreelancerRegisterPage navigate={navigate} />;
    }
    if (currentRoute === '/login') {
      return <LoginPage navigate={navigate} />;
    }
    if (currentRoute === '/how-it-works') {
      return <HowItWorksPage navigate={navigate} />;
    }

    // Route protection enforcement
    if (isCustomerRoute) {
      if (!currentUser) {
        return (
          <LoginPage 
            navigate={navigate} 
            redirectNotice="Authentication Required: Please log in as a Customer to access this page." 
          />
        );
      }
      if (currentUser.role !== 'customer') {
        return (
          <div className="max-w-md mx-auto px-4 py-16 text-center">
            <div className="soft-box p-8 border-2 border-rose-300">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-700 bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
                Access Restricted
              </span>
              <h2 className="text-2xl font-extrabold text-navy-900 mt-3 font-display">
                Customer Role Required
              </h2>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                You are currently signed in as <strong>{currentUser.name}</strong> (Freelancer). Customer workspaces are reserved for customers and contractors.
              </p>
              <button
                onClick={() => navigate('/freelancer/dashboard')}
                className="tactile-btn-primary w-full py-3.5 text-xs font-bold shadow-tactile mt-6"
              >
                Go to Freelancer Workspace
              </button>
            </div>
          </div>
        );
      }
    }

    if (isFreelancerRoute) {
      if (!currentUser) {
        return (
          <LoginPage 
            navigate={navigate} 
            redirectNotice="Authentication Required: Please log in as a Freelancer to access your workspace." 
          />
        );
      }
      if (currentUser.role !== 'freelancer') {
        return (
          <div className="max-w-md mx-auto px-4 py-16 text-center">
            <div className="soft-box p-8 border-2 border-amber-300">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                Access Restricted
              </span>
              <h2 className="text-2xl font-extrabold text-navy-900 mt-3 font-display">
                Freelancer Workspace
              </h2>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                You are currently signed in as <strong>{currentUser.name}</strong> (Customer). This area is reserved for registered freelancers.
              </p>
              <button
                onClick={() => navigate('/customer/dashboard')}
                className="tactile-btn-primary w-full py-3.5 text-xs font-bold shadow-tactile mt-6"
              >
                Go to Customer Dashboard
              </button>
            </div>
          </div>
        );
      }
    }

    // Customer routes
    if (currentRoute === '/customer/dashboard' || currentRoute === '/customer/work') {
      return <CustomerDashboard navigate={navigate} />;
    }
    if (currentRoute === '/customer/create-work') {
      return <CreateWorkPage navigate={navigate} />;
    }
    if (currentRoute.startsWith('/customer/work/')) {
      const jobId = currentRoute.replace('/customer/work/', '');
      return <JobDetailsPage jobId={jobId} navigate={navigate} />;
    }
    if (currentRoute === '/customer/workers') {
      return <FindWorkersPage navigate={navigate} />;
    }
    if (currentRoute === '/customer/history') {
      return <CustomerHistoryPage navigate={navigate} />;
    }
    if (currentRoute === '/customer/profile') {
      return <CustomerProfilePage navigate={navigate} />;
    }

    // Freelancer routes
    if (currentRoute === '/freelancer/dashboard') {
      return <FreelancerDashboard navigate={navigate} />;
    }
    if (currentRoute === '/freelancer/work') {
      return <FreelancerWorkPage navigate={navigate} />;
    }
    if (currentRoute === '/freelancer/history') {
      return <FreelancerHistoryPage navigate={navigate} />;
    }
    if (currentRoute === '/freelancer/profile') {
      return <FreelancerProfilePage navigate={navigate} />;
    }

    // Fallback
    return <LandingPage navigate={navigate} />;
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      <Navbar currentRoute={currentRoute} navigate={navigate} />
      
      <main className="flex-1">
        {renderPage()}
      </main>

      <Footer navigate={navigate} />
      
      {/* Interactive SMS Activity Demo Panel (internal simulation tool) */}
      <SMSActivityPanel />

      {/* Global Toast Notifications */}
      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <RouterShell />
      </AppProvider>
    </AuthProvider>
  );
}
