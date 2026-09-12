import React, { useState } from 'react';
import { ArrowLeft, User, Phone, Mail, MapPin, Building, CheckCircle2, Save } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';

export const CustomerProfilePage: React.FC<{ navigate: (r: string) => void }> = ({ navigate }) => {
  const { currentUser, updateCustomerProfile } = useAuth();
  const { addToast } = useApp();

  const [name, setName] = useState(currentUser?.name || 'Rajesh Sharma');
  const [location, setLocation] = useState(currentUser?.location || 'Mapusa, Goa');
  const [businessName, setBusinessName] = useState(currentUser?.customerProfile?.businessName || 'Goa Civil & Infra Projects');
  const [cityArea, setCityArea] = useState(currentUser?.customerProfile?.cityArea || 'Mapusa Industrial Area');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateCustomerProfile(
      {
        businessName,
        cityArea
      },
      name,
      location
    );
    addToast('Profile Updated', 'Your customer profile changes have been saved.', 'success');
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <button
        onClick={() => navigate('/customer/dashboard')}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-navy-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Dashboard</span>
      </button>

      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-shramik-600 bg-shramik-50 px-3 py-1 rounded-full border border-shramik-200">
          Account Settings
        </span>
        <h1 className="text-3xl font-extrabold text-navy-900 mt-2 font-display">
          Customer Profile
        </h1>
        <p className="text-sm text-slate-500">
          Manage your contractor details, business name, and contact settings
        </p>
      </div>

      <div className="soft-box p-8 border-2 border-slate-200">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="flex items-center gap-4 pb-6 border-b border-slate-200">
            <div className="w-16 h-16 rounded-2xl bg-shramik-600 text-white font-black text-xl flex items-center justify-center shadow-tactile">
              {name.charAt(0)}
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-navy-900">{name}</h3>
              <p className="text-xs text-slate-500 capitalize">
                Customer • {currentUser?.customerProfile?.customerType || 'Contractor'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="tactile-input text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Mobile Number (Read-only)
              </label>
              <input
                type="text"
                disabled
                value={currentUser?.mobile || '+91 98221 55432'}
                className="tactile-input text-sm bg-slate-100 text-slate-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Business / Firm Name
              </label>
              <input
                type="text"
                value={businessName}
                onChange={e => setBusinessName(e.target.value)}
                className="tactile-input text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Primary City / Area
              </label>
              <input
                type="text"
                value={location}
                onChange={e => setLocation(e.target.value)}
                className="tactile-input text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Operating Office / Site Location
            </label>
            <input
              type="text"
              value={cityArea}
              onChange={e => setCityArea(e.target.value)}
              className="tactile-input text-sm"
            />
          </div>

          <div className="pt-4 border-t border-slate-200 flex justify-end">
            <button
              type="submit"
              className="tactile-btn-primary px-6 py-3 text-xs font-bold shadow-tactile flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>Save Profile Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
