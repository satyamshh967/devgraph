import React, { useState } from 'react';
import { 
  X, 
  DownloadCloud, 
  Sparkles, 
  Github, 
  KeyRound, 
  CheckCircle2, 
  AlertCircle,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Cpu
} from 'lucide-react';
import { GraphAPI } from '../services/api';

export default function GitHubImportModal({ isOpen, onClose, onImportSuccess, benchmarks }) {
  const [activeTab, setActiveTab] = useState('connect'); // 'connect' or 'benchmarks'
  const [username, setUsername] = useState('satyamshh967');
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [statusStep, setStatusStep] = useState(null);

  if (!isOpen) return null;

  const handleImport = async (targetUser) => {
    const userToImport = targetUser || username;
    if (!userToImport.trim()) {
      setError('Please enter a GitHub username.');
      return;
    }

    setLoading(true);
    setError(null);

    setStatusStep(`Connecting to GitHub API for @${userToImport}...`);
    setTimeout(() => {
      setStatusStep('Inspecting repositories, language breakdowns, and README manifests...');
    }, 600);

    setTimeout(() => {
      setStatusStep('Scanning package.json, requirements.txt, and build configs...');
    }, 1200);

    setTimeout(() => {
      setStatusStep('Running Python NLP skill extraction & taxonomy ontology...');
    }, 1800);

    setTimeout(() => {
      setStatusStep('Computing cyclomatic complexity & constructing Knowledge Graph...');
    }, 2400);

    try {
      const res = await GraphAPI.importProfile(userToImport, token.trim() || null);
      
      setTimeout(() => {
        setLoading(false);
        setStatusStep(null);
        if (onImportSuccess) {
          onImportSuccess(res.developer);
        }
        onClose();
      }, 1000);
    } catch (err) {
      console.error('Import failed:', err);
      setError(err.response?.data?.error || err.message || 'GitHub import failed.');
      setLoading(false);
      setStatusStep(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-[#111827] border border-slate-800 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 p-0.5 shadow-lg shadow-indigo-500/20">
              <div className="w-full h-full bg-[#0b0f19] rounded-[10px] flex items-center justify-center">
                <DownloadCloud className="w-5 h-5 text-indigo-400" />
              </div>
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Connect GitHub & Ingest Repositories</h2>
              <p className="text-xs text-slate-400">Deep-scan code, manifests, and construct live Knowledge Graph</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="px-6 pt-3 flex space-x-2 border-b border-slate-800/80">
          <button
            onClick={() => setActiveTab('connect')}
            className={`pb-3 text-xs font-semibold px-2 transition-colors relative ${
              activeTab === 'connect' ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Live GitHub Profile
            {activeTab === 'connect' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500"></span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('benchmarks')}
            className={`pb-3 text-xs font-semibold px-2 transition-colors relative ${
              activeTab === 'benchmarks' ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Benchmark Developer Profiles
            {activeTab === 'benchmarks' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500"></span>
            )}
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-500/15 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {statusStep && (
            <div className="p-4 bg-indigo-500/10 border border-indigo-500/30 rounded-2xl space-y-2">
              <div className="flex items-center space-x-2 text-indigo-400 text-xs font-semibold">
                <Sparkles className="w-4 h-4 animate-spin" />
                <span>Deep Ingestion & Graph Construction</span>
              </div>
              <p className="text-xs text-slate-300 font-mono pl-6">{statusStep}</p>
            </div>
          )}

          {activeTab === 'connect' ? (
            <div className="space-y-4">
              {/* Username Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-200 block">
                  GitHub Username <span className="text-indigo-400">*</span>
                </label>
                <div className="flex items-center bg-slate-900 border border-slate-800 focus-within:border-indigo-500 rounded-xl px-3.5 py-2.5 shadow-inner">
                  <Github className="w-4 h-4 text-slate-400 mr-2.5 shrink-0" />
                  <span className="text-xs text-slate-500 select-none mr-1">github.com/</span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. satyamshh967"
                    disabled={loading}
                    className="bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none w-full"
                  />
                </div>
              </div>

              {/* Optional Token Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-200 flex items-center space-x-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-slate-400" />
                    <span>Personal Access Token</span>
                    <span className="text-[10px] text-slate-500 font-normal">(Optional)</span>
                  </label>
                  <a
                    href="https://github.com/settings/tokens"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-indigo-400 hover:underline flex items-center space-x-1"
                  >
                    <span>Generate token</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <input
                  type="password"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="ghp_... (removes rate limits & allows private repos)"
                  disabled={loading}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none font-mono"
                />
                <p className="text-[11px] text-slate-400">
                  Public accounts import automatically. A token grants higher rate limits (5,000 req/hr) and manifest scanning across all repos.
                </p>
              </div>

              {/* Action Button */}
              <button
                disabled={loading || !username.trim()}
                onClick={() => handleImport()}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center space-x-2"
              >
                <span>{loading ? 'Processing GitHub Deep Scan...' : 'Import Profile & Build Knowledge Graph'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-slate-400">
                Or select a pre-configured benchmark profile for immediate graph analytics:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {benchmarks.map(b => (
                  <button
                    key={b.id}
                    disabled={loading}
                    onClick={() => handleImport(b.username)}
                    className="p-3 bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500/50 rounded-2xl flex items-center space-x-3 text-left transition-colors group"
                  >
                    <img
                      src={b.avatar}
                      alt={b.name}
                      className="w-10 h-10 rounded-full object-cover border border-slate-700 group-hover:border-indigo-500 shrink-0"
                    />
                    <div className="truncate">
                      <span className="text-xs font-bold text-white block group-hover:text-indigo-300 truncate">
                        {b.name}
                      </span>
                      <span className="text-[10px] text-indigo-400 block truncate">
                        {b.primaryCategory}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
