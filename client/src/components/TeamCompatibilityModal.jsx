import React, { useState, useEffect } from 'react';
import { 
  Users, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  HelpCircle, 
  Briefcase, 
  ArrowRight,
  TrendingUp,
  Award
} from 'lucide-react';
import { GraphAPI } from '../services/api';

export default function TeamCompatibilityModal({ selectedDevId, developers }) {
  const [benchmarks, setBenchmarks] = useState({});
  const [selectedRole, setSelectedRole] = useState("Senior Full Stack & Cloud Architect");
  const [scoreResult, setScoreResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // Load benchmarks
  useEffect(() => {
    GraphAPI.getRoleBenchmarks()
      .then(res => {
        setBenchmarks(res);
        if (Object.keys(res).length > 0 && !selectedRole) {
          setSelectedRole(Object.keys(res)[0]);
        }
      })
      .catch(console.error);
  }, []);

  // Run compatibility scoring whenever candidate or target role changes
  useEffect(() => {
    if (!selectedRole) return;
    setLoading(true);
    GraphAPI.scoreTeamCompatibility({
      developerId: selectedDevId || (developers[0]?.id),
      targetRole: selectedRole
    })
      .then(res => {
        setScoreResult(res);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error scoring team compatibility:', err);
        setLoading(false);
      });
  }, [selectedDevId, selectedRole, developers]);

  const currentDev = developers.find(d => d.id === selectedDevId) || developers[0];

  return (
    <div className="w-full h-[calc(100vh-4rem)] bg-[#0b0f19] p-8 overflow-y-auto">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Top Header Card */}
        <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="p-2 rounded-xl bg-pink-500/20 text-pink-400 border border-pink-500/30">
                <Users className="w-5 h-5" />
              </span>
              <div>
                <h1 className="text-xl font-bold text-white">Team Compatibility & Role Fit Scoring</h1>
                <p className="text-xs text-slate-400">
                  Graph vector alignment evaluating candidate skills against team requirements, identifying core matches and skill gaps.
                </p>
              </div>
            </div>
          </div>

          {/* Benchmark Selector Dropdown */}
          <div className="flex items-center space-x-2 bg-slate-900 p-2 rounded-xl border border-slate-800">
            <Briefcase className="w-4 h-4 text-indigo-400 ml-1" />
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="bg-transparent text-xs text-slate-200 font-medium focus:outline-none cursor-pointer pr-4"
            >
              {Object.keys(benchmarks).map(role => (
                <option key={role} value={role} className="bg-slate-900 text-slate-100">
                  {role}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Score & Recommendation Banner */}
        {scoreResult && (
          <div className="bg-gradient-to-r from-slate-900 via-[#151c2e] to-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center space-x-5">
              {/* Circular Gauge */}
              <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-slate-800"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className={`${
                      scoreResult.compatibility_percentage >= 75 ? 'text-emerald-500' :
                      scoreResult.compatibility_percentage >= 50 ? 'text-amber-500' : 'text-rose-500'
                    }`}
                    strokeDasharray={`${scoreResult.compatibility_percentage}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute text-center">
                  <span className="text-xl font-black text-white">{scoreResult.compatibility_percentage}%</span>
                  <span className="block text-[9px] uppercase tracking-wider text-slate-400">Match</span>
                </div>
              </div>

              <div>
                <div className="flex items-center space-x-2">
                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                    scoreResult.compatibility_percentage >= 75 ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' :
                    scoreResult.compatibility_percentage >= 50 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                    'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  }`}>
                    {scoreResult.badge}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    Candidate: {currentDev?.name}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-white mt-1">
                  {scoreResult.recommendation}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5 max-w-xl">
                  {scoreResult.benchmarkDescription}
                </p>
              </div>
            </div>

            {/* Quick Metrics Cards */}
            <div className="grid grid-cols-3 gap-2 w-full md:w-auto">
              <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 text-center min-w-[90px]">
                <span className="text-[10px] text-emerald-400 font-semibold block">Matches</span>
                <span className="text-xl font-bold text-white mt-0.5 block">
                  {scoreResult.breakdown?.matched_count || 0}
                </span>
              </div>
              <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 text-center min-w-[90px]">
                <span className="text-[10px] text-amber-400 font-semibold block">Upskill</span>
                <span className="text-xl font-bold text-white mt-0.5 block">
                  {scoreResult.breakdown?.growth_needed_count || 0}
                </span>
              </div>
              <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 text-center min-w-[90px]">
                <span className="text-[10px] text-rose-400 font-semibold block">Missing</span>
                <span className="text-xl font-bold text-white mt-0.5 block">
                  {scoreResult.breakdown?.missing_count || 0}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Detailed Breakdown Sections */}
        {scoreResult && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Matched Skills Card */}
            <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <h3 className="font-bold text-sm text-white">
                    Core Skill Matches ({scoreResult.matched_skills?.length || 0})
                  </h3>
                </div>
                <span className="text-[11px] text-emerald-400 font-medium bg-emerald-500/10 px-2 py-0.5 rounded">
                  Validated in Repos
                </span>
              </div>

              <div className="space-y-2.5">
                {scoreResult.matched_skills?.map((item, idx) => (
                  <div key={idx} className="bg-slate-900/70 p-3 rounded-xl border border-slate-800/80 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold text-slate-200 block">{item.name}</span>
                      <span className="text-[10px] text-slate-400">{item.status}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-emerald-400">{item.candidate_score} / 100</span>
                      <span className="text-[10px] text-slate-500 block">Req: {item.required_score}</span>
                    </div>
                  </div>
                ))}
                {(!scoreResult.matched_skills || scoreResult.matched_skills.length === 0) && (
                  <p className="text-xs text-slate-500 py-4 text-center">No direct skill matches found.</p>
                )}
              </div>
            </div>

            {/* Missing & Upskilling Gap Card */}
            <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-amber-400" />
                  <h3 className="font-bold text-sm text-white">
                    Gaps & Upskilling Needed
                  </h3>
                </div>
                <span className="text-[11px] text-amber-400 font-medium bg-amber-500/10 px-2 py-0.5 rounded">
                  Hiring Focus
                </span>
              </div>

              <div className="space-y-2.5">
                {/* Growth needed */}
                {scoreResult.growth_needed?.map((item, idx) => (
                  <div key={`growth-${idx}`} className="bg-amber-950/20 p-3 rounded-xl border border-amber-800/40 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold text-amber-200 block">{item.name}</span>
                      <span className="text-[10px] text-amber-400/80">Partial match (Gap: -{item.gap} pts)</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-amber-300">{item.candidate_score} / 100</span>
                      <span className="text-[10px] text-slate-400 block">Req: {item.required_score}</span>
                    </div>
                  </div>
                ))}

                {/* Missing required */}
                {scoreResult.missing_skills?.map((item, idx) => (
                  <div key={`missing-${idx}`} className="bg-rose-950/20 p-3 rounded-xl border border-rose-800/40 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold text-rose-200 block">{item.name}</span>
                      <span className="text-[10px] text-rose-400/80">Skill missing from ingested repos</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-rose-400">0 / 100</span>
                      <span className="text-[10px] text-slate-400 block">Req: {item.required_score}</span>
                    </div>
                  </div>
                ))}

                {(!scoreResult.missing_skills?.length && !scoreResult.growth_needed?.length) && (
                  <p className="text-xs text-emerald-400 py-4 text-center">
                    Outstanding! Candidate satisfies 100% of required technical proficiencies.
                  </p>
                )}
              </div>
            </div>

            {/* Complementary Skills (Unique Value Add) */}
            {scoreResult.complementary_skills && scoreResult.complementary_skills.length > 0 && (
              <div className="md:col-span-2 bg-[#111827] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-3">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <h3 className="font-bold text-sm text-white">
                    Complementary Value Adds (Bonus Proficiencies)
                  </h3>
                </div>
                <p className="text-xs text-slate-400">
                  High-proficiency skills the candidate brings that weren't strictly requested, adding cross-functional depth to your engineering team.
                </p>
                <div className="flex flex-wrap gap-2 pt-2">
                  {scoreResult.complementary_skills.map((c, i) => (
                    <div key={i} className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-purple-900/30 border border-purple-500/30 text-purple-200 text-xs font-medium">
                      <span>{c.name}</span>
                      <span className="text-[10px] bg-purple-500/40 px-1.5 py-0.5 rounded font-bold text-white">
                        {c.score}/100
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}
