import React from 'react';
import { 
  BookOpen, 
  Network, 
  FolderGit2, 
  Clock, 
  Users, 
  BarChart3,
  Code2
} from 'lucide-react';

export default function GitHubSubNav({ activeTab, setActiveTab, reposCount, skillsCount }) {
  const tabs = [
    { id: 'overview', label: 'Overview', icon: BookOpen, count: null },
    { id: 'graph', label: 'Knowledge Graph', icon: Network, count: skillsCount || null },
    { id: 'repositories', label: 'Repositories', icon: FolderGit2, count: reposCount || null },
    { id: 'timeline', label: 'Skill Evolution', icon: Clock, count: null },
    { id: 'compatibility', label: 'Team Compatibility', icon: Users, count: null },
    { id: 'complexity', label: 'Repo Complexity', icon: Code2, count: null },
    { id: 'analytics', label: 'Contribution Analytics', icon: BarChart3, count: null },
  ];

  return (
    <div className="bg-[#010409] border-b border-[#21262d] px-6 select-none sticky top-16 z-30">
      <nav className="flex items-center space-x-1 overflow-x-auto max-w-7xl mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 py-3 px-3 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
                isActive
                  ? 'border-[#f78166] text-[#f0f6fc]'
                  : 'border-transparent text-[#8b949e] hover:text-[#f0f6fc] hover:border-[#8b949e]'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-[#f0f6fc]' : 'text-[#8b949e]'}`} />
              <span>{tab.label}</span>
              {tab.count !== null && (
                <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                  isActive ? 'bg-[#30363d] text-[#f0f6fc]' : 'bg-[#21262d] text-[#8b949e]'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
