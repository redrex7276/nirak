import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Building2, 
  Briefcase, 
  MapPin, 
  Phone, 
  Mail, 
  CheckCircle2, 
  IndianRupee, 
  Sparkles, 
  Search, 
  ArrowRight, 
  ShieldCheck, 
  Send, 
  Clock, 
  Calendar, 
  Cloud,
  X,
  ExternalLink,
  Tag
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { CustomerType, WorkerSkill } from '../types';
import { firebaseService } from '../services/firebaseService';

interface CustomerDirectoryPageProps {
  navigate: (route: string) => void;
}

export const CustomerDirectoryPage: React.FC<CustomerDirectoryPageProps> = ({ navigate }) => {
  const { users, currentUser } = useAuth();
  const { jobs, addToast } = useApp();

  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'customers' | 'gigs'>('customers');

  // Proposal Modal State
  const [proposalModalOpen, setProposalModalOpen] = useState(false);
  const [selectedCustomerForProposal, setSelectedCustomerForProposal] = useState<any>(null);
  const [proposedTrade, setProposedTrade] = useState<WorkerSkill>('Painter');
  const [proposedRate, setProposedRate] = useState<number>(850);
  const [proposedMessage, setProposedMessage] = useState<string>('');
  const [isSubmittingProposal, setIsSubmittingProposal] = useState(false);

  // Extract all customers
  const customers = useMemo(() => {
    return users.filter(u => u.role === 'customer');
  }, [users]);

  // Customer Type Badges
  const getCustomerTypeBadge = (type?: CustomerType) => {
    switch (type) {
      case 'contractor':
        return { label: 'General Contractor', bg: 'bg-amber-100 text-amber-900 border-amber-300' };
      case 'interior_designer':
        return { label: 'Interior Design Studio', bg: 'bg-purple-100 text-purple-900 border-purple-300' };
      case 'facility_manager':
        return { label: 'Commercial Facility', bg: 'bg-blue-100 text-blue-900 border-blue-300' };
      case 'homeowner':
        return { label: 'Heritage Homeowner', bg: 'bg-emerald-100 text-emerald-900 border-emerald-300' };
      case 'resort_manager':
        return { label: 'Beach Resort & Hospitality', bg: 'bg-teal-100 text-teal-900 border-teal-300' };
      default:
        return { label: 'Verified Client', bg: 'bg-slate-100 text-slate-800 border-slate-300' };
    }
  };

  // Filtered Customers
  const filteredCustomers = useMemo(() => {
    return customers.filter(c => {
      const typeMatch = selectedType === 'all' || c.customerProfile?.customerType === selectedType;
      const searchLower = searchQuery.toLowerCase();
      const textMatch = 
        !searchQuery ||
        c.name.toLowerCase().includes(searchLower) ||
        (c.customerProfile?.businessName || '').toLowerCase().includes(searchLower) ||
        c.location.toLowerCase().includes(searchLower) ||
        (c.customerProfile?.frequentGigsNeeded || []).some(g => g.toLowerCase().includes(searchLower));
      return typeMatch && textMatch;
    });
  }, [customers, selectedType, searchQuery]);

  // Filtered Gigs
  const filteredGigs = useMemo(() => {
    return jobs.filter(j => {
      const searchLower = searchQuery.toLowerCase();
      return (
        !searchQuery ||
        j.title.toLowerCase().includes(searchLower) ||
        j.category.toLowerCase().includes(searchLower) ||
        j.location.toLowerCase().includes(searchLower) ||
        j.customerName.toLowerCase().includes(searchLower) ||
        (j.skills || []).some(s => s.toLowerCase().includes(searchLower))
      );
    });
  }, [jobs, searchQuery]);

  const handleOpenProposal = (customer: any) => {
    setSelectedCustomerForProposal(customer);
    setProposedMessage(`Hello ${customer.name}, I am a skilled craftsman offering reliable ${proposedTrade} services for your upcoming projects in ${customer.location}.`);
    setProposalModalOpen(true);
  };

  const handleSubmitProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerForProposal) return;

    setIsSubmittingProposal(true);

    try {
      // Sync proposal to Firebase as an offer
      const newOffer = {
        id: `OFFER-${Date.now()}`,
        customerId: selectedCustomerForProposal.id,
        customerName: selectedCustomerForProposal.name,
        freelancerId: currentUser?.id || 'SQ-F-1042',
        freelancerName: currentUser?.name || 'Ramesh Naik',
        trade: proposedTrade,
        rate: proposedRate,
        message: proposedMessage,
        createdAt: new Date().toISOString()
      };

      // Save to Firebase and notify
      await firebaseService.syncSMSMessage({
        id: `SMS-${Date.now()}`,
        workerPhone: selectedCustomerForProposal.mobile,
        workerName: selectedCustomerForProposal.name,
        direction: 'outgoing',
        content: `[Shramik-Quote] New Gig Offer: ${newOffer.freelancerName} offered ${proposedTrade} services at ₹${proposedRate}/day for ${selectedCustomerForProposal.customerProfile?.businessName || selectedCustomerForProposal.name}.`,
        status: 'sent',
        step: 'info',
        timestamp: new Date().toISOString()
      });

      addToast(
        'Gig Offer Submitted!',
        `Your proposal has been dispatched to ${selectedCustomerForProposal.name} and saved to Cloud Firestore.`,
        'success'
      );

      setProposalModalOpen(false);
    } catch (err) {
      addToast('Submission Error', 'Failed to dispatch proposal. Please try again.', 'error');
    } finally {
      setIsSubmittingProposal(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Hero Banner with Firebase Cloud Sync Badge */}
      <div className="max-w-7xl mx-auto">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-navy-950 via-navy-900 to-shramik-900 text-white p-8 sm:p-12 shadow-2xl border border-slate-800">
          <div className="absolute -right-12 -top-12 w-64 h-64 bg-shramik-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 space-y-4 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-amber-300">
              <Cloud className="w-4 h-4 text-amber-400 animate-pulse" />
              <span>Synced with Firebase Cloud Firestore (shramik-quote)</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black font-display tracking-tight text-white leading-tight">
              Customer Directory & Gigs Marketplace
            </h1>
            <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
              Explore the diverse kinds of customers registered on Shramik-Quote—from commercial contractors and interior design studios to facility managers and heritage villa owners. Discover exactly what trades they need and offer them your services.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-bold text-slate-200">
              <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl">
                <Users className="w-4 h-4 text-shramik-400" />
                <span>{customers.length} Verified Customers</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl">
                <Briefcase className="w-4 h-4 text-amber-400" />
                <span>{jobs.length} Active Gigs Open</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Direct SMS & Contract Guarantees</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Controls: Search, View Switcher & Type Filters */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-tactile border border-slate-200/80 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Tab Switcher */}
            <div className="flex bg-slate-100 p-1.5 rounded-2xl text-sm font-bold">
              <button
                onClick={() => setActiveTab('customers')}
                className={`px-5 py-2 rounded-xl transition-all flex items-center gap-2 ${
                  activeTab === 'customers'
                    ? 'bg-white text-navy-900 shadow-md font-extrabold'
                    : 'text-slate-600 hover:text-navy-900'
                }`}
              >
                <Users className="w-4 h-4 text-shramik-600" />
                <span>Who Are The Customers? ({customers.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('gigs')}
                className={`px-5 py-2 rounded-xl transition-all flex items-center gap-2 ${
                  activeTab === 'gigs'
                    ? 'bg-white text-navy-900 shadow-md font-extrabold'
                    : 'text-slate-600 hover:text-navy-900'
                }`}
              >
                <Briefcase className="w-4 h-4 text-amber-600" />
                <span>Gigs You Can Offer ({jobs.length})</span>
              </button>
            </div>

            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={activeTab === 'customers' ? "Search customer name, business, trade..." : "Search gigs by title, skill, location..."}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-navy-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-shramik-500"
              />
            </div>
          </div>

          {/* Industry Type Pills (for customers tab) */}
          {activeTab === 'customers' && (
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5" /> Customer Segments:
              </span>
              {[
                { id: 'all', label: 'All Segments' },
                { id: 'contractor', label: 'Civil Contractors' },
                { id: 'interior_designer', label: 'Interior Designers' },
                { id: 'facility_manager', label: 'Commercial Facilities' },
                { id: 'homeowner', label: 'Heritage Homeowners' },
                { id: 'resort_manager', label: 'Resorts & Hotels' }
              ].map(type => (
                <button
                  key={type.id}
                  onClick={() => setSelectedType(type.id)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors border ${
                    selectedType === type.id
                      ? 'bg-shramik-600 text-white border-shramik-600 shadow-sm'
                      : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Tab 1: Customer Directory */}
        {activeTab === 'customers' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCustomers.map(customer => {
              const badge = getCustomerTypeBadge(customer.customerProfile?.customerType);
              const customerJobs = jobs.filter(j => j.customerId === customer.id || j.customerName === customer.name);

              return (
                <div 
                  key={customer.id} 
                  className="bg-white rounded-3xl p-6 shadow-tactile border border-slate-200/90 flex flex-col justify-between hover:shadow-xl transition-all space-y-5"
                >
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${badge.bg}`}>
                          {badge.label}
                        </span>
                        <h3 className="text-xl font-extrabold text-navy-900 mt-2.5 font-display">
                          {customer.name}
                        </h3>
                        {customer.customerProfile?.businessName && (
                          <p className="text-xs font-semibold text-shramik-700 flex items-center gap-1 mt-0.5">
                            <Building2 className="w-3.5 h-3.5" />
                            {customer.customerProfile.businessName}
                          </p>
                        )}
                      </div>
                      <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-700 font-extrabold text-sm border border-slate-200">
                        {customer.name.substring(0, 2).toUpperCase()}
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                      {customer.customerProfile?.description || 'Registered client hiring trade professionals on Shramik-Quote.'}
                    </p>

                    {/* Location & Contact Details */}
                    <div className="bg-slate-50 rounded-2xl p-3 space-y-1.5 text-xs text-slate-600 border border-slate-100">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{customer.location}</span>
                      </div>
                      <div className="flex items-center gap-2 font-mono">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{customer.mobile}</span>
                      </div>
                      {customer.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate text-slate-500">{customer.email}</span>
                        </div>
                      )}
                    </div>

                    {/* Frequent Gigs Needed */}
                    {customer.customerProfile?.frequentGigsNeeded && customer.customerProfile.frequentGigsNeeded.length > 0 && (
                      <div className="space-y-2">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                          Gigs They Frequently Hire For:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {customer.customerProfile.frequentGigsNeeded.map((gigName, idx) => (
                            <span 
                              key={idx} 
                              className="text-[11px] font-medium bg-amber-50 text-amber-900 border border-amber-200 px-2.5 py-0.5 rounded-lg"
                            >
                              {gigName}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Budget & Team Size */}
                    {(customer.customerProfile?.budgetRange || customer.customerProfile?.typicalWorkerCount) && (
                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-[11px]">
                        {customer.customerProfile?.budgetRange && (
                          <div>
                            <span className="text-slate-400 block font-medium">Budget Range:</span>
                            <span className="font-bold text-navy-900">{customer.customerProfile.budgetRange}</span>
                          </div>
                        )}
                        {customer.customerProfile?.typicalWorkerCount && (
                          <div>
                            <span className="text-slate-400 block font-medium">Team Scale:</span>
                            <span className="font-bold text-navy-900">{customer.customerProfile.typicalWorkerCount}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions Footer */}
                  <div className="pt-4 border-t border-slate-100 flex items-center gap-2">
                    <button
                      onClick={() => handleOpenProposal(customer)}
                      className="flex-1 bg-shramik-600 hover:bg-shramik-700 text-white text-xs font-bold py-2.5 px-3 rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Offer Gig / Quote</span>
                    </button>
                    {customerJobs.length > 0 && (
                      <button
                        onClick={() => {
                          setSearchQuery(customer.name);
                          setActiveTab('gigs');
                        }}
                        className="bg-slate-100 hover:bg-slate-200 text-navy-900 text-xs font-bold py-2.5 px-3 rounded-xl transition-colors border border-slate-200 flex items-center gap-1"
                        title={`${customerJobs.length} open gigs`}
                      >
                        <Briefcase className="w-3.5 h-3.5 text-amber-600" />
                        <span>{customerJobs.length}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Tab 2: Available Gigs You Can Offer */}
        {activeTab === 'gigs' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGigs.map(gig => {
              return (
                <div 
                  key={gig.id} 
                  className="bg-white rounded-3xl p-6 shadow-tactile border border-slate-200/90 flex flex-col justify-between hover:shadow-xl transition-all space-y-4"
                >
                  <div className="space-y-3">
                    {/* Trade Category & Budget */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-shramik-50 text-shramik-700 border border-shramik-200">
                        {gig.category}
                      </span>
                      <div className="text-right">
                        <span className="text-lg font-black text-navy-900">
                          ₹{gig.paymentAmount}
                        </span>
                        <span className="text-[11px] text-slate-500 font-medium">/{gig.paymentType}</span>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-base font-extrabold text-navy-900 font-display line-clamp-2">
                      {gig.title}
                    </h3>

                    {/* Description */}
                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                      {gig.description}
                    </p>

                    {/* Metadata Grid */}
                    <div className="bg-slate-50 rounded-2xl p-3 space-y-1.5 text-xs text-slate-600 border border-slate-100">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Customer:</span>
                        <span className="font-bold text-navy-900 truncate">{gig.customerName}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Location:</span>
                        <span className="font-semibold text-slate-700 truncate">{gig.location}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Duration:</span>
                        <span className="font-semibold text-slate-700">{gig.durationDays} days ({gig.reportingTime || '8:00 AM'})</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Workers Needed:</span>
                        <span className="font-bold text-shramik-600">{gig.workersRequired} workers</span>
                      </div>
                    </div>

                    {/* Required Skills */}
                    {gig.skills && gig.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {gig.skills.map((skill, i) => (
                          <span 
                            key={i} 
                            className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Apply / Offer Services Button */}
                  <div className="pt-3 border-t border-slate-100">
                    <button
                      onClick={() => {
                        addToast(
                          'Applied for Gig!',
                          `Application for "${gig.title}" submitted to ${gig.customerName}. SMS notification simulated.`,
                          'success'
                        );
                      }}
                      className="w-full bg-amber-500 hover:bg-amber-600 text-navy-950 font-extrabold text-xs py-3 px-4 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
                    >
                      <Sparkles className="w-4 h-4 text-navy-900" />
                      <span>Offer My Services / Apply</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Interactive Proposal Modal */}
      {proposalModalOpen && selectedCustomerForProposal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-shramik-700 bg-shramik-50 px-2.5 py-1 rounded-full border border-shramik-200">
                  Custom Gig Proposal
                </span>
                <h2 className="text-2xl font-black text-navy-900 mt-2 font-display">
                  Offer a Gig to {selectedCustomerForProposal.name}
                </h2>
                <p className="text-xs text-slate-500">
                  {selectedCustomerForProposal.customerProfile?.businessName || selectedCustomerForProposal.location}
                </p>
              </div>
              <button 
                onClick={() => setProposalModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitProposal} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-navy-900 uppercase tracking-wider mb-1.5">
                  Trade / Service Category
                </label>
                <select
                  value={proposedTrade}
                  onChange={(e) => setProposedTrade(e.target.value as WorkerSkill)}
                  className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold text-navy-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-shramik-500"
                >
                  <option value="Painter">Painter (Exterior/Interior/Waterproofing)</option>
                  <option value="Plumber">Plumber (Sanitary/PPR/Leak Detection)</option>
                  <option value="Carpenter">Carpenter (Modular/Doors/Polishing)</option>
                  <option value="Mechanic">Mechanic / Electrician (DG/3-Phase/HVAC)</option>
                  <option value="Mason">Mason (Laterite Stone/Plastering)</option>
                  <option value="Welder">Welder (Structural Fabrication)</option>
                  <option value="Cleaner">Deep Cleaning Specialist</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-navy-900 uppercase tracking-wider mb-1.5">
                  Proposed Daily Rate (₹ / Day)
                </label>
                <div className="relative">
                  <IndianRupee className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="number"
                    min={500}
                    max={5000}
                    step={50}
                    value={proposedRate}
                    onChange={(e) => setProposedRate(Number(e.target.value))}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm font-bold text-navy-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-shramik-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-navy-900 uppercase tracking-wider mb-1.5">
                  Offer Note / Pitch
                </label>
                <textarea
                  rows={3}
                  value={proposedMessage}
                  onChange={(e) => setProposedMessage(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-sm text-navy-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-shramik-500"
                  required
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setProposalModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingProposal}
                  className="px-5 py-2.5 rounded-xl text-xs font-extrabold text-white bg-shramik-600 hover:bg-shramik-700 transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmittingProposal ? 'Dispatching...' : 'Dispatch Offer to Customer'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
