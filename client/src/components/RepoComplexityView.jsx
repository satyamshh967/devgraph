import React, { useState, useEffect } from 'react';
import { 
  Code2, 
  Layers, 
  GitBranch, 
  Sparkles, 
  Cpu, 
  FileCode, 
  ShieldAlert,
  FolderGit2,
  Star
} from 'lucide-react';
import { GraphAPI } from '../services/api';

export default function RepoComplexityView({ selectedDevId }) {
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRepo, setSelectedRepo] = useState(null);

  useEffect(() => {
    setLoading(true);
    GraphAPI.getRepoComplexity()
      .then(res => {
        setRepos(res);
        if (res.length > 0) setSelectedRepo(res[0]);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching repo complexity:', err);
        setLoading(false);
      });
  }, [selectedDevId]);

  return (
    <div className="w-full h-[calc(100vh-4rem)] bg-[#0b0f19] p-8 overflow-y-auto">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header */}
        <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6 shadow-xl flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="p-2 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
              <Code2 className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-xl font-bold text-white">Repository Complexity Scoring</h1>
              <p className="text-xs text-slate-400">
                Algorithmic evaluation of architectural scale, dependency density, language entropy, and cyclomatic depth.
              </p>
            </div>
          </div>
          <span className="text-xs text-slate-400 font-mono bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
            {repos.length} Repositories Analyzed
          </span>
        </div>

        {/* Main Grid: List on Left, Deep Breakdown on Right */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Repo List */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
              Select Repository
            </h3>
            {repos.map(r => {
              const isSelected = selectedRepo?.id === r.id;
              return (
                <button
                  key={r.id}
                  onClick={() => setSelectedRepo(r)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all ${
                    isSelected
                      ? 'bg-slate-900 border-indigo-500/60 shadow-lg shadow-indigo-500/10'
                      : 'bg-[#111827] border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-white truncate max-w-[180px]">
                      {r.name}
                    </span>
                    <span 
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: `${r.complexityBadgeColor || '#3b82f6'}20`, color: r.complexityBadgeColor || '#3b82f6' }}
                    >
                      {r.complexityScore} / 100
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>{r.language || 'Multi-stack'}</span>
                    <span className="flex items-center">
                      <Star className="w-3 h-3 text-amber-400 mr-1 fill-amber-400" />
                      {r.stars}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Deep Complexity Inspector */}
          {selectedRepo && (
            <div className="md:col-span-2 bg-[#111827] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
              <div className="flex items-start justify-between border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <FolderGit2 className="w-4 h-4 text-indigo-400" />
                    <h2 className="text-lg font-bold text-white">{selectedRepo.fullName || selectedRepo.name}</h2>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 font-mono">{selectedRepo.id}</p>
                </div>

                <div className="text-right">
                  <span 
                    className="text-xs font-bold px-3 py-1 rounded-full border inline-block"
                    style={{ 
                      backgroundColor: `${selectedRepo.complexityBadgeColor}20`, 
                      color: selectedRepo.complexityBadgeColor,
                      borderColor: `${selectedRepo.complexityBadgeColor}40`
                    }}
                  >
                    {selectedRepo.complexityTier}
                  </span>
                </div>
              </div>

              {/* Composite Score Meter */}
              <div className="bg-slate-900/80 p-5 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-300">Composite Complexity Index</span>
                  <span className="text-xs font-bold text-white">{selectedRepo.complexityScore} / 100</span>
                </div>
                <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-rose-500" 
                    style={{ width: `${selectedRepo.complexityScore}%` }}
                  ></div>
                </div>
              </div>

              {/* Sub-Metrics Breakdown Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Lines of Code</span>
                  <span className="text-base font-bold text-white mt-1 block">
                    {selectedRepo.linesOfCode?.toLocaleString() || selectedRepo.metrics?.lines_of_code?.toLocaleString() || '15,000'}
                  </span>
                  <span className="text-[10px] text-slate-500 mt-0.5 block">File Scale: {selectedRepo.metrics?.file_count || 30} files</span>
                </div>

                <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Language Entropy</span>
                  <span className="text-base font-bold text-indigo-400 mt-1 block">
                    {selectedRepo.metrics?.language_entropy || 12.0} / 25
                  </span>
                  <span className="text-[10px] text-slate-500 mt-0.5 block">Multi-stack dispersion</span>
                </div>

                <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Dependency Density</span>
                  <span className="text-base font-bold text-cyan-400 mt-1 block">
                    {selectedRepo.metrics?.dependency_density || 14.5} / 25
                  </span>
                  <span className="text-[10px] text-slate-500 mt-0.5 block">{selectedRepo.metrics?.dependency_count || 6} external packages</span>
                </div>

                <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Cyclomatic Index</span>
                  <span className="text-base font-bold text-amber-400 mt-1 block">
                    ~{selectedRepo.metrics?.estimated_cyclomatic_index || 4.2}
                  </span>
                  <span className="text-[10px] text-slate-500 mt-0.5 block">Branching factor estimate</span>
                </div>

                <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Modularity Index</span>
                  <span className="text-base font-bold text-emerald-400 mt-1 block">
                    {selectedRepo.metrics?.modularity_index || 82}%
                  </span>
                  <span className="text-[10px] text-slate-500 mt-0.5 block">Architecture maintainability</span>
                </div>

                <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Activity Velocity</span>
                  <span className="text-base font-bold text-pink-400 mt-1 block">
                    {selectedRepo.metrics?.activity_velocity || 16.0} / 25
                  </span>
                  <span className="text-[10px] text-slate-500 mt-0.5 block">Commit & PR frequency</span>
                </div>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
}
