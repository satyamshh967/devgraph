import React, { useState } from 'react';
import { 
  X, 
  DownloadCloud, 
  Sparkles, 
  Github, 
  CheckCircle2, 
  AlertCircle,
  ArrowRight,
  UserCheck
} from 'lucide-react';
import { GraphAPI } from '../services/api';

export default function GitHubImportModal({ isOpen, onClose, onImportSuccess, benchmarks }) {
  const [activeTab, setActiveTab] = useState('benchmarks'); // 'benchmarks' or 'custom'
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [statusStep, setStatusStep] = useState(null);

  if (!isOpen) return null;

  const handleImport = async (targetUser) => {
    const userToImport = targetUser || username;
    if (!userToImport) {
      setError('Please enter a GitHub username.');
      return;
    }

    setLoading(true);
    setError(null);

    // Simulate multi-step pipeline feedback
    setStatusStep('Fetching GitHub developer & repository metadata...');
    setTimeout(() => {
      setStatusStep('Running Python NLP extraction on READMEs & manifests...');
    }, 700);

    setTimeout(() => {
      setStatusStep('Calculating cyclomatic & codebase complexity scores...');
    }, 1400);

    try {
      const res = await GraphAPI.importProfile(userToImport);
      setStatusStep('Building Knowledge Graph nodes & dependency edges...');
      
      setTimeout(() => {
        setLoading(false);
        setStatusStep(null);
        if (onImportSuccess) {
          onImportSuccess(res.developer);
        }
        onClose();
      }, 800);
    } catch (err) {
      console.error('Import failed:', err);
      setError(err.response?.data?.error || err.message || 'Import failed.');
      setLoading(false);
      setStatusStep(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#111827] border border-slate-800 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <DownloadCloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Ingest GitHub Profile & Repos</h2>
              <p className="text-xs text-slate-400">Extract skills, build graph ontology, and calculate complexity</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="px-6 pt-4 flex space-x-2 border-b border-slate-800/80">
          <button
            onClick={() => setActiveTab('benchmarks')}
            className={`pb-3 text-xs font-semibold px-2 transition-colors relative ${
              activeTab === 'benchmarks' ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Benchmark Profiles (Instant Demo)
            {activeTab === 'benchmarks' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500"></span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('custom')}
            className={`pb-3 text-xs font-semibold px-2 transition-colors relative ${
              activeTab === 'custom' ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Custom GitHub Handle
            {activeTab === 'custom' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500"></span>
            )}
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-500/15 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {statusStep && (
            <div className="p-4 bg-indigo-500/10 border border-indigo-500/30 rounded-xl space-y-2">
              <div className="flex items-center space-x-2 text-indigo-400 text-xs font-semibold">
                <Sparkles className="w-4 h-4 animate-spin" />
                <span>Knowledge Graph Ingestion Pipeline</span>
              </div>
              <p className="text-xs text-slate-300 font-mono pl-6">{statusStep}</p>
            </div>
          )}

          {activeTab === 'benchmarks' ? (
            <div className="space-y-3">
              <p className="text-xs text-slate-400">
                Choose a pre-configured developer profile to immediately explore the knowledge graph, skill evolution timeline, and team fit scoring:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                {benchmarks.map(b => (
                  <button
                    key={b.id}
                    disabled={loading}
                    onClick={() => handleImport(b.username)}
                    className="p-3 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500/50 text-left transition-all group flex items-center space-x-3"
                  >
                    <img
                      src={b.avatar}
                      alt={b.name}
                      className="w-10 h-10 rounded-full object-cover border border-slate-700 group-hover:border-indigo-500"
                    />
                    <div className="overflow-hidden">
                      <span className="text-xs font-bold text-white block group-hover:text-indigo-300 truncate">
                        {b.name}
                      </span>
                      <span className="text-[10px] text-indigo-400 block truncate">
                        {b.primaryCategory}
                      </span>
                      <span className="text-[10px] text-slate-500 block">
                        ★ {b.stars} • {b.commits} commits
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-xs text-slate-400">
                Enter any public GitHub username to import their repositories, trigger NLP skill extraction, and build their knowledge graph:
              </p>

              <div className="flex items-center bg-slate-900 border border-slate-800 focus-within:border-indigo-500 rounded-xl px-3.5 py-2.5 shadow-inner">
                <Github className="w-4 h-4 text-slate-400 mr-2.5 shrink-0" />
                <span className="text-xs text-slate-500 select-none mr-1">github.com/</span>
                <input
                  type="text"
                  placeholder="e.g. torvalds or your-username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={loading}
                  className="bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none w-full"
                />
              </div>

              <button
                disabled={loading || !username.trim()}
                onClick={() => handleImport(username)}
                className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all"
              >
                <span>{loading ? 'Processing Pipeline...' : 'Run Ingestion & Build Graph'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
