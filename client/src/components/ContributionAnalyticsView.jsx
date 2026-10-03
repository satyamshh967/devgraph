import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  GitCommit, 
  Star, 
  FileCode2, 
  FolderGit2, 
  PieChart,
  TrendingUp,
  UserCheck
} from 'lucide-react';
import { GraphAPI } from '../services/api';

const LANGUAGE_COLORS = {
  "TypeScript": "#3178c6",
  "JavaScript": "#f7df1e",
  "Python": "#3572A5",
  "Go": "#00ADD8",
  "Rust": "#dea584",
  "Java": "#b07219",
  "React": "#61dafb",
  "Terraform": "#7B42BC",
  "HTML/CSS": "#e34c26",
  "Other": "#8b5cf6"
};

export default function ContributionAnalyticsView({ selectedDevId, developers }) {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    GraphAPI.getContributionAnalytics(selectedDevId)
      .then(res => {
        setAnalytics(res);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching contribution analytics:', err);
        setLoading(false);
      });
  }, [selectedDevId]);

  const metrics = analytics?.metrics || {
    totalRepositories: 0,
    totalLinesOfCode: 0,
    totalStars: 0,
    totalCommits: 0
  };

  const languageDist = analytics?.languageDistribution || [];
  const yearlyCommits = analytics?.yearlyCommits || [];
  const maxCommits = Math.max(...yearlyCommits.map(y => y.commits), 1);

  return (
    <div className="w-full h-[calc(100vh-4rem)] bg-[#0b0f19] p-8 overflow-y-auto">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header */}
        <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6 shadow-xl flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <BarChart3 className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-xl font-bold text-white">Contribution & Codebase Analytics</h1>
              <p className="text-xs text-slate-400">
                Detailed metrics on code ownership, language allocation, commit frequency, and repository scale.
              </p>
            </div>
          </div>
          {analytics?.developer && (
            <span className="text-xs text-slate-300 font-medium bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800 flex items-center">
              <UserCheck className="w-3.5 h-3.5 text-indigo-400 mr-1.5" />
              {analytics.developer.name}
            </span>
          )}
        </div>

        {/* 4 Summary Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-[#111827] border border-slate-800 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium">Total Commits</span>
              <GitCommit className="w-4 h-4 text-indigo-400" />
            </div>
            <span className="text-2xl font-black text-white">{metrics.totalCommits?.toLocaleString()}</span>
            <span className="text-[10px] text-slate-500 block mt-1">Verified git author activity</span>
          </div>

          <div className="bg-[#111827] border border-slate-800 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium">Lines of Code</span>
              <FileCode2 className="w-4 h-4 text-emerald-400" />
            </div>
            <span className="text-2xl font-black text-white">{metrics.totalLinesOfCode?.toLocaleString()}</span>
            <span className="text-[10px] text-slate-500 block mt-1">Across managed repos</span>
          </div>

          <div className="bg-[#111827] border border-slate-800 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium">GitHub Stars</span>
              <Star className="w-4 h-4 text-amber-400" />
            </div>
            <span className="text-2xl font-black text-white">{metrics.totalStars?.toLocaleString()}</span>
            <span className="text-[10px] text-slate-500 block mt-1">Open source community signal</span>
          </div>

          <div className="bg-[#111827] border border-slate-800 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium">Repositories</span>
              <FolderGit2 className="w-4 h-4 text-purple-400" />
            </div>
            <span className="text-2xl font-black text-white">{metrics.totalRepositories}</span>
            <span className="text-[10px] text-slate-500 block mt-1">Connected knowledge entities</span>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Language Breakdown */}
          <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <PieChart className="w-4 h-4 text-indigo-400" />
                <h3 className="font-bold text-sm text-white">Language Distribution</h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">By Lines of Code</span>
            </div>

            {/* Stacked Progress Bar */}
            <div className="h-3 rounded-full overflow-hidden flex bg-slate-800">
              {languageDist.map(item => (
                <div
                  key={item.name}
                  style={{
                    width: `${item.percentage}%`,
                    backgroundColor: LANGUAGE_COLORS[item.name] || '#8b5cf6'
                  }}
                  title={`${item.name}: ${item.percentage}%`}
                ></div>
              ))}
            </div>

            {/* Language list */}
            <div className="space-y-2 pt-2">
              {languageDist.map(item => (
                <div key={item.name} className="flex items-center justify-between text-xs bg-slate-900/60 p-2 rounded-lg border border-slate-800/80">
                  <div className="flex items-center space-x-2">
                    <span 
                      className="w-2.5 h-2.5 rounded-full" 
                      style={{ backgroundColor: LANGUAGE_COLORS[item.name] || '#8b5cf6' }}
                    ></span>
                    <span className="font-medium text-slate-200">{item.name}</span>
                  </div>
                  <div className="flex items-center space-x-3 text-slate-400">
                    <span>{item.bytes?.toLocaleString()} LOC</span>
                    <span className="font-bold text-white w-10 text-right">{item.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Yearly Commit Velocity */}
          <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <h3 className="font-bold text-sm text-white">Yearly Commit Velocity</h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">2021 – 2026</span>
            </div>

            <div className="h-56 flex items-end justify-between gap-3 pt-6 px-2">
              {yearlyCommits.map(yc => {
                const heightPct = Math.max(12, Math.round((yc.commits / maxCommits) * 100));
                return (
                  <div key={yc.year} className="flex-1 flex flex-col items-center group h-full justify-end">
                    <span className="text-[10px] text-slate-400 font-mono mb-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      {yc.commits}
                    </span>
                    <div 
                      className="w-full max-w-[42px] bg-gradient-to-t from-indigo-600 to-purple-500 rounded-t-lg group-hover:from-indigo-500 group-hover:to-purple-400 transition-all shadow-md shadow-indigo-600/20"
                      style={{ height: `${heightPct}%` }}
                    ></div>
                    <span className="text-xs font-semibold text-slate-300 mt-2 block">
                      {yc.year}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
