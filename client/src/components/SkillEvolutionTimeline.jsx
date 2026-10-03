import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  ChevronRight, 
  ChevronLeft, 
  Sparkles, 
  Calendar, 
  TrendingUp, 
  Award,
  Layers
} from 'lucide-react';
import { GraphAPI } from '../services/api';

const YEARS = [2021, 2022, 2023, 2024, 2025, 2026];

export default function SkillEvolutionTimeline({ selectedDevId, developers }) {
  const [currentYearIndex, setCurrentYearIndex] = useState(YEARS.length - 1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [evolutionData, setEvolutionData] = useState(null);
  const [loading, setLoading] = useState(false);

  const selectedYear = YEARS[currentYearIndex];

  useEffect(() => {
    setLoading(true);
    GraphAPI.getSkillEvolution(selectedDevId)
      .then(res => {
        setEvolutionData(res);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching evolution:', err);
        setLoading(false);
      });
  }, [selectedDevId]);

  // Auto-play timeline animation
  useEffect(() => {
    let interval = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentYearIndex(prev => {
          if (prev >= YEARS.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const timelineMilestones = evolutionData?.timeline || [];

  // Filter milestones up to current selected year
  const activeMilestones = timelineMilestones.filter(m => m.year <= selectedYear);
  const currentMilestone = timelineMilestones.find(m => m.year === selectedYear) || activeMilestones[activeMilestones.length - 1];

  // Cumulative skills unlocked up to selectedYear
  const unlockedSkillsSet = new Set();
  activeMilestones.forEach(m => {
    (m.unlockedSkills || []).forEach(s => unlockedSkillsSet.add(s));
  });

  return (
    <div className="w-full h-[calc(100vh-4rem)] bg-[#0b0f19] p-8 overflow-y-auto">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header and Controls */}
        <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
                <TrendingUp className="w-5 h-5" />
              </span>
              <div>
                <h1 className="text-xl font-bold text-white">Skill Evolution Timeline</h1>
                <p className="text-xs text-slate-400">
                  Observe developer skill emergence, codebase complexity growth, and career trajectory across years.
                </p>
              </div>
            </div>
          </div>

          {/* Timeline Playback Controls */}
          <div className="flex items-center space-x-3 bg-slate-900 p-2 rounded-xl border border-slate-800">
            <button
              onClick={() => setCurrentYearIndex(Math.max(0, currentYearIndex - 1))}
              disabled={currentYearIndex === 0}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isPlaying ? 'Pause' : 'Play Timeline'}</span>
            </button>

            <button
              onClick={() => setCurrentYearIndex(Math.min(YEARS.length - 1, currentYearIndex + 1))}
              disabled={currentYearIndex === YEARS.length - 1}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => { setCurrentYearIndex(0); setIsPlaying(false); }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              title="Reset Timeline"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Year Progress Bar / Stepper */}
        <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between relative mb-6">
            <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-slate-800 z-0"></div>
            <div 
              className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 z-0 transition-all duration-300"
              style={{ width: `${(currentYearIndex / (YEARS.length - 1)) * 100}%` }}
            ></div>

            {YEARS.map((year, idx) => {
              const isPastOrCurrent = idx <= currentYearIndex;
              const isCurrent = idx === currentYearIndex;
              return (
                <button
                  key={year}
                  onClick={() => setCurrentYearIndex(idx)}
                  className="relative z-10 flex flex-col items-center group focus:outline-none"
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                    isCurrent 
                      ? 'bg-purple-600 text-white ring-4 ring-purple-500/30 scale-110 shadow-lg' 
                      : isPastOrCurrent 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}>
                    {year.toString().slice(2)}
                  </div>
                  <span className={`text-[11px] font-medium mt-2 transition-colors ${
                    isCurrent ? 'text-purple-400 font-bold' : isPastOrCurrent ? 'text-slate-200' : 'text-slate-500'
                  }`}>
                    {year}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Current Year Milestone Details */}
          {currentMilestone && (
            <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-4 flex items-start space-x-4">
              <div className="p-2.5 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-bold text-white">Year {currentMilestone.year} Milestone</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold">
                    +{(currentMilestone.unlockedSkills || []).length} New Technologies
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {currentMilestone.milestone}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Unlocked Technologies Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Active Skills Card */}
          <div className="md:col-span-2 bg-[#111827] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Layers className="w-4 h-4 text-indigo-400" />
                <h3 className="font-bold text-sm text-white">
                  Active Skills in Knowledge Graph ({unlockedSkillsSet.size})
                </h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                Year {selectedYear} Snapshot
              </span>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              {Array.from(unlockedSkillsSet).map(skill => {
                const isNewlyUnlocked = currentMilestone?.unlockedSkills?.includes(skill);
                return (
                  <div
                    key={skill}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
                      isNewlyUnlocked
                        ? 'bg-gradient-to-r from-purple-900/60 to-indigo-900/60 border-purple-500/50 text-purple-200 shadow-md animate-pulse'
                        : 'bg-slate-900/80 border-slate-800 text-slate-300'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${isNewlyUnlocked ? 'bg-purple-400' : 'bg-emerald-400'}`}></span>
                    <span>{skill}</span>
                    {isNewlyUnlocked && (
                      <span className="text-[9px] bg-purple-500 text-white font-bold px-1 rounded">NEW</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Career Velocity Summary Card */}
          <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center space-x-2">
              <Award className="w-4 h-4 text-amber-400" />
              <h3 className="font-bold text-sm text-white">Trajectory Stats</h3>
            </div>

            <div className="space-y-3">
              <div className="bg-slate-900/70 p-3 rounded-xl border border-slate-800">
                <span className="text-[11px] text-slate-400 block">Total Skills Acquired</span>
                <span className="text-2xl font-black text-white mt-1 block">
                  {unlockedSkillsSet.size}
                </span>
                <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-500 to-indigo-500" 
                    style={{ width: `${Math.min(100, (unlockedSkillsSet.size / 20) * 100)}%` }}
                  ></div>
                </div>
              </div>

              <div className="bg-slate-900/70 p-3 rounded-xl border border-slate-800">
                <span className="text-[11px] text-slate-400 block">Current Seniority Phase</span>
                <span className="text-sm font-bold text-indigo-400 mt-1 block">
                  {selectedYear <= 2022 ? 'Junior / Mid Core Foundations' : selectedYear <= 2024 ? 'Senior System & Architecture' : 'Staff / Principal Platform'}
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
