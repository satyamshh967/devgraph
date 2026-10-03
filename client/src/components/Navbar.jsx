import React from 'react';
import { 
  Network, 
  GitBranch, 
  BarChart3, 
  Clock, 
  Users, 
  Code2, 
  Database, 
  DownloadCloud,
  ChevronDown
} from 'lucide-react';

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  developers, 
  selectedDevId, 
  onSelectDeveloper, 
  onOpenImport,
  graphStatus
}) {
  const selectedDev = developers.find(d => d.id === selectedDevId) || developers[0];

  const tabs = [
    { id: 'graph', label: 'Knowledge Graph', icon: Network },
    { id: 'timeline', label: 'Skill Evolution', icon: Clock },
    { id: 'compatibility', label: 'Team Fit & Scoring', icon: Users },
    { id: 'complexity', label: 'Repo Complexity', icon: Code2 },
    { id: 'analytics', label: 'Contributions', icon: BarChart3 },
  ];

  return (
    <header className="h-16 border-b border-slate-800 bg-[#0d1322]/90 backdrop-blur-md px-6 flex items-center justify-between z-30 sticky top-0">
      {/* Brand */}
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 p-0.5 shadow-lg shadow-indigo-500/20">
          <div className="w-full h-full bg-[#0b0f19] rounded-[10px] flex items-center justify-center">
            <Network className="w-5 h-5 text-indigo-400" />
          </div>
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-100 text-sm tracking-wide">Developer Knowledge Graph</span>
            <span className="text-[10px] uppercase font-semibold tracking-wider px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              Platform
            </span>
          </div>
          <p className="text-[11px] text-slate-400">Interactive Skill Growth & Repository Intelligence</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <nav className="flex items-center space-x-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800/80">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Right Controls: Developer Selector, Database Status & Import Button */}
      <div className="flex items-center space-x-3">
        {/* Database Status indicator */}
        <div 
          className="hidden lg:flex items-center space-x-2 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs"
          title={graphStatus?.database?.mode || 'Neo4j Graph Database'}
        >
          <Database className={`w-3.5 h-3.5 ${graphStatus?.database?.active ? 'text-emerald-400' : 'text-amber-400'}`} />
          <span className="text-slate-300 text-[11px] font-mono">
            {graphStatus?.database?.active ? 'Neo4j Aura' : 'In-Memory Graph'}
          </span>
          <span className={`w-2 h-2 rounded-full ${graphStatus?.database?.active ? 'bg-emerald-400 shadow-emerald-500/50' : 'bg-amber-400 shadow-amber-500/50'} shadow-sm`}></span>
        </div>

        {/* Developer Switcher Dropdown */}
        <div className="relative group">
          <select
            value={selectedDevId || ''}
            onChange={(e) => onSelectDeveloper(e.target.value)}
            className="appearance-none bg-slate-900 text-slate-200 text-xs font-medium py-1.5 pl-3 pr-8 rounded-lg border border-slate-800 focus:outline-none focus:border-indigo-500 cursor-pointer hover:bg-slate-800/80 transition-colors"
          >
            <option value="">All Developers (Global Graph)</option>
            {developers.map(dev => (
              <option key={dev.id} value={dev.id}>
                {dev.name} ({dev.primaryCategory})
              </option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Import GitHub Button */}
        <button
          onClick={onOpenImport}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 text-xs font-medium transition-all shadow-sm"
        >
          <DownloadCloud className="w-3.5 h-3.5" />
          <span>Import Profile</span>
        </button>
      </div>
    </header>
  );
}
