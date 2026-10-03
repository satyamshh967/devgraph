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
  HelpCircle,
  ExternalLink
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
      setStatusStep('Harvesting repositories, languages, and README manifests...');
    }, 700);

    setTimeout(() => {
      setStatusStep('Executing Python NLP skill extraction & taxonomy matching...');
    }, 1400);

    setTimeout(() => {
      setStatusStep('Computing cyclomatic complexity & building knowledge graph...');
    }, 2100);

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
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#161b22] border border-[#30363d] rounded-xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-4 px-6 border-b border-[#21262d] flex items-center justify-between bg-[#0d1117]">
          <div className="flex items-center space-x-2.5">
            <svg height="24" viewBox="0 0 16 16" version="1.1" width="24" fill="#f0f6fc">
              <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"></path>
            </svg>
            <div>
              <h2 className="text-sm font-bold text-[#f0f6fc]">Connect with GitHub</h2>
              <p className="text-[11px] text-[#8b949e]">Ingest your profile, repositories, & skills</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[#21262d]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab selection */}
        <div className="flex border-b border-[#21262d] bg-[#0d1117] px-6 text-xs">
          <button
            onClick={() => setActiveTab('connect')}
            className={`py-2.5 px-3 font-semibold border-b-2 transition-all ${
              activeTab === 'connect' 
                ? 'border-[#f78166] text-[#f0f6fc]' 
                : 'border-transparent text-[#8b949e] hover:text-[#f0f6fc]'
            }`}
          >
            Connect GitHub Account
          </button>
          <button
            onClick={() => setActiveTab('benchmarks')}
            className={`py-2.5 px-3 font-semibold border-b-2 transition-all ${
              activeTab === 'benchmarks' 
                ? 'border-[#f78166] text-[#f0f6fc]' 
                : 'border-transparent text-[#8b949e] hover:text-[#f0f6fc]'
            }`}
          >
            Benchmark Developer Personas
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-[#f85149]/15 border border-[#f85149]/40 rounded-md text-[#f85149] text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {statusStep && (
            <div className="p-3.5 bg-[#1f2937]/70 border border-[#388bfd]/40 rounded-md space-y-1.5">
              <div className="flex items-center space-x-2 text-[#58a6ff] text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
                <span>Knowledge Graph Ingestion Pipeline</span>
              </div>
              <p className="text-xs text-[#c9d1d9] font-mono pl-5">{statusStep}</p>
            </div>
          )}

          {activeTab === 'connect' ? (
            <div className="space-y-4">
              {/* Username Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#f0f6fc] block">
                  GitHub Username <span className="text-[#f85149]">*</span>
                </label>
                <div className="flex items-center bg-[#0d1117] border border-[#30363d] focus-within:border-[#58a6ff] rounded-md px-3 py-1.5">
                  <span className="text-xs text-[#8b949e] mr-1 select-none">github.com/</span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. satyamshh967"
                    disabled={loading}
                    className="bg-transparent text-xs text-[#f0f6fc] placeholder-[#8b949e] focus:outline-none w-full"
                  />
                </div>
              </div>

              {/* Optional Token Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-[#f0f6fc] flex items-center space-x-1">
                    <KeyRound className="w-3.5 h-3.5 text-[#8b949e]" />
                    <span>Personal Access Token</span>
                    <span className="text-[10px] text-[#8b949e] font-normal">(Optional)</span>
                  </label>
                  <a
                    href="https://github.com/settings/tokens"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] text-[#58a6ff] hover:underline flex items-center space-x-1"
                  >
                    <span>Generate token</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
                <input
                  type="password"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="ghp_... (avoids API rate limits)"
                  disabled={loading}
                  className="w-full bg-[#0d1117] border border-[#30363d] focus:border-[#58a6ff] rounded-md px-3 py-1.5 text-xs text-[#f0f6fc] placeholder-[#8b949e] focus:outline-none font-mono"
                />
                <p className="text-[11px] text-[#8b949e]">
                  Public accounts work without a token. Providing a token lifts GitHub's rate limits and enables private repo scanning.
                </p>
              </div>

              {/* Submit Button */}
              <button
                disabled={loading || !username.trim()}
                onClick={() => handleImport()}
                className="w-full py-2 px-4 rounded-md bg-[#238636] hover:bg-[#2ea043] disabled:opacity-50 text-white text-xs font-bold shadow-sm transition-all flex items-center justify-center space-x-2"
              >
                <span>{loading ? 'Ingesting Repositories & Building Graph...' : 'Sync GitHub & Build Knowledge Graph'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-[#8b949e]">
                Or select an instant pre-analyzed benchmark developer profile:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {benchmarks.map(b => (
                  <button
                    key={b.id}
                    disabled={loading}
                    onClick={() => handleImport(b.username)}
                    className="p-2.5 bg-[#0d1117] hover:bg-[#21262d] border border-[#30363d] hover:border-[#58a6ff] rounded-md flex items-center space-x-3 text-left transition-colors"
                  >
                    <img
                      src={b.avatar}
                      alt={b.name}
                      className="w-9 h-9 rounded-full object-cover border border-[#30363d]"
                    />
                    <div className="truncate">
                      <span className="text-xs font-bold text-[#f0f6fc] block truncate">
                        {b.name}
                      </span>
                      <span className="text-[10px] text-[#8b949e] block truncate">
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
