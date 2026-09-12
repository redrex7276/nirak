import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Search, 
  Briefcase, 
  UserCheck, 
  HelpCircle, 
  MapPin, 
  Clock, 
  IndianRupee, 
  Star, 
  CheckCircle2, 
  Phone, 
  Zap, 
  TrendingUp, 
  RefreshCw,
  Database,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { quoteService, ShramikKnowledgeItem } from '../services/quoteService';

export const QuotesPage: React.FC<{ navigate: (r: string) => void }> = ({ navigate }) => {
  const [query, setQuery] = useState('Need 10 painters in Mapusa for 5 days');
  const [results, setResults] = useState<ShramikKnowledgeItem[]>([]);
  const [aiSummary, setAiSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [seedProgress, setSeedProgress] = useState<{ current: number; total: number } | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    handleSearch('Need 10 painters in Mapusa for 5 days');
  }, []);

  const handleSearch = async (overrideQuery?: string) => {
    const searchText = overrideQuery !== undefined ? overrideQuery : query;
    if (!searchText.trim()) return;

    setLoading(true);
    setHasSearched(true);

    try {
      const { matches, aiSummary: summary } = await quoteService.searchShramikKnowledge(searchText.trim(), 5);
      setResults(matches);
      setAiSummary(summary);
    } catch (err) {
      console.error('Shramik AI search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSeed = async () => {
    setSeeding(true);
    try {
      await quoteService.seedShramikQuotes((cur, tot) => {
        setSeedProgress({ current: cur, total: tot });
      });
      setSeedProgress(null);
      handleSearch();
    } catch (err) {
      console.error('Seeding error:', err);
    } finally {
      setSeeding(false);
    }
  };

  const handlePresetClick = (q: string) => {
    setQuery(q);
    handleSearch(q);
  };

  // Real Shramik-Quote platform prompts
  const samplePrompts = [
    { label: '🎨 10 Painters in Mapusa', query: 'Need 10 painters in Mapusa for 5 days exterior coating' },
    { label: '🔧 Emergency Pipe Leak', query: 'Emergency bathroom pipe leak in Porvorim' },
    { label: '🪚 Artisan Carpenter', query: 'Looking for artisan carpenter in Panjim for wooden door frame' },
    { label: '🚜 Concrete Mixer Mechanic', query: 'Diesel generator and concrete mixer repair mechanic in Mapusa' },
    { label: '📱 How SMS Works', query: 'How does SMS job dispatch work without mobile internet?' },
    { label: '💰 Daily Wages & Rates', query: 'What are the standard daily wage rates across Goa?' }
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Header Banner */}
      <div className="text-center max-w-3xl mx-auto mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-shramik-50 text-shramik-700 border border-shramik-200 text-xs font-bold mb-3 shadow-sm">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>Trained on Shramik-Quote Platform & Seed Data</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-navy-900 font-display tracking-tight">
          Shramik AI Assistant & Quote Matcher
        </h1>
        <p className="text-sm sm:text-base text-slate-600 mt-2">
          Ask any question or describe a work requirement. The AI instantly matches <strong>verified job quotes, fair wage estimates, and qualified local freelancers</strong> across Goa.
        </p>

        {/* Feature Badges */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs font-semibold text-slate-600">
          <span className="flex items-center gap-1 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Verified Workers in Mapusa, Porvorim & Panjim
          </span>
          <span className="flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-200">
            <Zap className="w-3.5 h-3.5 text-blue-600" />
            Semantic Work & Wage Estimates
          </span>
          <span className="flex items-center gap-1 bg-amber-50 text-amber-800 px-3 py-1 rounded-full border border-amber-200">
            <Phone className="w-3.5 h-3.5 text-amber-600" />
            Direct SMS Dispatch
          </span>
        </div>
      </div>

      {/* Search Input Box */}
      <div className="soft-box p-6 sm:p-8 border-2 border-slate-200 bg-white rounded-3xl shadow-sm mb-8">
        <form 
          onSubmit={e => { e.preventDefault(); handleSearch(); }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-4" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="e.g. Need 10 exterior painters in Mapusa for 5 days, or How does SMS dispatch work?..."
              className="tactile-input pl-12 pr-4 py-3.5 text-sm sm:text-base w-full shadow-inner"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="tactile-btn-primary py-3.5 px-7 text-sm font-bold shadow-tactile flex items-center justify-center gap-2 whitespace-nowrap"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Searching...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 text-amber-300" />
                <span>Ask Shramik AI</span>
              </>
            )}
          </button>
        </form>

        {/* Website-Trained Preset Questions */}
        <div className="mt-4">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Ask Questions Based on Website:
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {samplePrompts.map(p => (
              <button
                key={p.label}
                type="button"
                onClick={() => handlePresetClick(p.query)}
                className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-shramik-50 hover:border-shramik-300 hover:text-shramik-700 text-slate-700 transition-colors flex items-center gap-1.5"
              >
                <span>{p.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* AI Intelligence Summary Banner */}
      {aiSummary && !loading && (
        <div className="mb-8 p-5 rounded-2xl bg-gradient-to-r from-shramik-900 via-navy-900 to-indigo-950 text-white shadow-lg border border-shramik-700">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-shramik-500 text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-md">
              <Sparkles className="w-4 h-4 text-amber-300" />
            </div>
            <div>
              <div className="text-xs font-bold text-shramik-300 uppercase tracking-wider">
                Shramik Platform Intelligence
              </div>
              <p className="text-sm font-medium text-slate-100 mt-1 leading-relaxed">
                {aiSummary}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Results Section */}
      {hasSearched && !loading && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-extrabold text-navy-900 font-display flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-shramik-600" />
              <span>Matching Platform Results for: "{query}"</span>
            </h2>
            <span className="text-xs font-semibold text-slate-500">
              {results.length} result{results.length === 1 ? '' : 's'} ranked by relevance
            </span>
          </div>

          {results.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-3xl border border-slate-200 p-8">
              <HelpCircle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-navy-900">No direct matches found</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Try asking about painting, plumbing, carpentry, mechanics, daily rates, or SMS dispatch.
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {results.map((item, idx) => (
                <div
                  key={item.id || idx}
                  className={`p-6 rounded-2xl bg-white border shadow-sm transition-all hover:shadow-md ${
                    item.type === 'job_quote' 
                      ? 'border-blue-200 hover:border-blue-400' 
                      : item.type === 'freelancer' 
                      ? 'border-emerald-200 hover:border-emerald-400' 
                      : 'border-amber-200 hover:border-amber-400'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                    
                    {/* Left Icon & Information */}
                    <div className="flex items-start gap-4 flex-1">
                      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm ${
                        item.type === 'job_quote' 
                          ? 'bg-blue-50 text-blue-600' 
                          : item.type === 'freelancer' 
                          ? 'bg-emerald-50 text-emerald-600' 
                          : 'bg-amber-50 text-amber-600'
                      }`}>
                        {item.type === 'job_quote' && <Briefcase className="w-5 h-5" />}
                        {item.type === 'freelancer' && <UserCheck className="w-5 h-5" />}
                        {item.type === 'platform_faq' && <HelpCircle className="w-5 h-5" />}
                      </div>

                      <div className="space-y-1.5 flex-1">
                        {/* Type & Category Badge */}
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                            item.type === 'job_quote'
                              ? 'bg-blue-100 text-blue-800'
                              : item.type === 'freelancer'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {item.type === 'job_quote' ? 'Work Quote / Job' : item.type === 'freelancer' ? 'Verified Freelancer' : 'Platform Architecture'}
                          </span>
                          <span className="text-xs font-bold text-slate-600">
                            {item.category}
                          </span>
                          {item.location && (
                            <span className="text-xs text-slate-500 flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              {item.location}
                            </span>
                          )}
                        </div>

                        {/* Title */}
                        <h3 className="text-base font-bold text-navy-900 leading-snug">
                          {item.title}
                        </h3>

                        {/* Description */}
                        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                          {item.description}
                        </p>

                        {/* Metadata Pills: Wage, Duration, Rating, Contact */}
                        <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-700 font-semibold">
                          {item.wage && (
                            <span className="flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                              <IndianRupee className="w-3.5 h-3.5" />
                              {item.wage}
                            </span>
                          )}
                          {item.duration && (
                            <span className="flex items-center gap-1 text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              {item.duration}
                            </span>
                          )}
                          {item.rating && (
                            <span className="flex items-center gap-1 text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md">
                              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                              {item.rating} Rating
                            </span>
                          )}
                          {item.authorOrContact && (
                            <span className="text-slate-500 font-normal">
                              Contact: <strong>{item.authorOrContact}</strong>
                            </span>
                          )}
                        </div>

                        {/* Skills / Badges */}
                        {item.skills && item.skills.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {item.skills.map((s, i) => (
                              <span key={i} className="text-[10px] font-medium bg-slate-50 border border-slate-200 text-slate-600 px-2 py-0.5 rounded-md">
                                {s}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right Side: Similarity Score & Actions */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100 flex-shrink-0">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-shramik-50 text-shramik-700 border border-shramik-200 text-xs font-bold shadow-sm">
                        <Zap className="w-3.5 h-3.5 text-shramik-600" />
                        <span>{item.similarityScore}% Match</span>
                      </div>
                      
                      <div className="mt-3">
                        {item.type === 'job_quote' && (
                          <button
                            onClick={() => navigate('/customer/create-work')}
                            className="text-xs font-bold text-white bg-shramik-600 hover:bg-shramik-700 px-3 py-1.5 rounded-xl shadow-sm transition-colors flex items-center gap-1"
                          >
                            <span>Create Similar Job</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )}
                        {item.type === 'freelancer' && (
                          <button
                            onClick={() => navigate('/customer/workers')}
                            className="text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 rounded-xl shadow-sm transition-colors flex items-center gap-1"
                          >
                            <span>Dispatch via SMS</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )}
                        {item.type === 'platform_faq' && (
                          <button
                            onClick={() => navigate('/how-it-works')}
                            className="text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1"
                          >
                            <span>How It Works</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>

                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Cloud Seeder Section */}
      <div className="mt-12 p-6 rounded-3xl bg-slate-50 border border-slate-200 text-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold flex items-center gap-2">
            <Database className="w-4 h-4 text-shramik-600" />
            Sync Shramik Knowledge to Firestore Quotes Collection
          </h3>
          <p className="text-xs text-slate-600 mt-1">
            Store these verified Shramik job quotes, contractor estimates, and trade records as native 768-dimension vectors in Firestore.
          </p>
        </div>
        <button
          type="button"
          onClick={handleSeed}
          disabled={seeding}
          className="px-4 py-2.5 rounded-xl bg-shramik-600 hover:bg-shramik-700 text-white text-xs font-bold shadow-sm flex items-center gap-2 whitespace-nowrap"
        >
          {seeding ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>
                {seedProgress ? `Seeding ${seedProgress.current}/${seedProgress.total}...` : 'Seeding...'}
              </span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Seed Quotes into Firestore</span>
            </>
          )}
        </button>
      </div>

    </div>
  );
};
