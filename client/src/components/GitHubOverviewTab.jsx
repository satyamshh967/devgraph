import React, { useMemo } from 'react';
import { 
  FolderGit2, 
  Star, 
  GitFork, 
  Sparkles, 
  Layers, 
  Network, 
  ArrowRight,
  Code2,
  ExternalLink
} from 'lucide-react';

const LANGUAGE_COLORS = {
  "Python": "#3572A5",
  "JavaScript": "#f1e05a",
  "TypeScript": "#3178c6",
  "Java": "#b07219",
  "Go": "#00ADD8",
  "HTML": "#e34c26",
  "CSS": "#563d7c",
  "Shell": "#89e051",
  "Rust": "#dea584",
  "Other": "#8b949e"
};

export default function GitHubOverviewTab({ 
  currentDev, 
  onSelectTab, 
  onSelectRepo,
  graphData 
}) {
  const repos = currentDev?.repositories || [];
  const pinnedRepos = repos.slice(0, 6);

  // Generate 52 weeks of GitHub contribution grid
  const contributionWeeks = useMemo(() => {
    const weeks = [];
    for (let w = 0; w < 52; w++) {
      const days = [];
      for (let d = 0; d < 7; d++) {
        // Pseudo-random realistic activity with clusters
        const seed = (w * 7 + d * 13) % 20;
        let level = 0;
        if (seed > 15) level = 4;
        else if (seed > 11) level = 3;
        else if (seed > 6) level = 2;
        else if (seed > 2) level = 1;
        days.push(level);
      }
      weeks.push(days);
    }
    return weeks;
  }, []);

  // Top extracted skills for overview
  const topSkills = useMemo(() => {
    if (!graphData || !graphData.nodes) return [];
    return graphData.nodes
      .filter(n => n.label === 'Skill')
      .slice(0, 12);
  }, [graphData]);

  const levelColor = (lvl) => {
    switch (lvl) {
      case 4: return 'bg-[#39d353]';
      case 3: return 'bg-[#26a641]';
      case 2: return 'bg-[#006d32]';
      case 1: return 'bg-[#0e4429]';
      default: return 'bg-[#161b22]';
    }
  };

  return (
    <div className="space-y-6">

      {/* Pinned Repositories Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-[#f0f6fc]">
            Pinned Repositories & Knowledge Entities
          </h2>
          <button 
            onClick={() => onSelectTab('repositories')} 
            className="text-xs text-[#58a6ff] hover:underline flex items-center space-x-1"
          >
            <span>View all {repos.length} repositories</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pinnedRepos.map(repo => {
            const langColor = LANGUAGE_COLORS[repo.language] || '#3178c6';
            return (
              <div 
                key={repo.id}
                className="p-4 bg-[#161b22] border border-[#30363d] rounded-md flex flex-col justify-between hover:border-[#8b949e] transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <a
                      href={repo.html_url || `https://github.com/${repo.fullName}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm font-semibold text-[#58a6ff] hover:underline flex items-center space-x-1.5 truncate"
                    >
                      <FolderGit2 className="w-4 h-4 shrink-0 text-[#8b949e]" />
                      <span className="truncate">{repo.name}</span>
                    </a>
                    <span className="text-[11px] text-[#8b949e] border border-[#30363d] px-1.5 py-0.2 rounded-full">
                      Public
                    </span>
                  </div>

                  <p className="text-xs text-[#8b949e] line-clamp-2 mb-4 leading-relaxed">
                    {repo.description || "Open source project on GitHub."}
                  </p>
                </div>

                <div className="flex items-center justify-between text-xs text-[#8b949e] pt-2 border-t border-[#21262d]">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-1.5">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: langColor }}></span>
                      <span className="text-[#c9d1d9]">{repo.language || 'Code'}</span>
                    </div>

                    <div className="flex items-center space-x-1 hover:text-[#58a6ff]">
                      <Star className="w-3.5 h-3.5" />
                      <span>{repo.stars || 0}</span>
                    </div>

                    <div className="flex items-center space-x-1 hover:text-[#58a6ff]">
                      <GitFork className="w-3.5 h-3.5" />
                      <span>{repo.forks || 0}</span>
                    </div>
                  </div>

                  {/* Complexity Badge */}
                  <span 
                    className="text-[10px] font-medium px-2 py-0.5 rounded-full border"
                    style={{ 
                      backgroundColor: `${repo.complexityBadgeColor || '#3b82f6'}15`, 
                      color: repo.complexityBadgeColor || '#58a6ff',
                      borderColor: `${repo.complexityBadgeColor || '#3b82f6'}30`
                    }}
                  >
                    {repo.complexityTier || 'Modular'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* GitHub Contribution Heatmap Activity Grid */}
      <div className="p-4 bg-[#161b22] border border-[#30363d] rounded-md space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[#f0f6fc]">
            1,248 contributions in 2026
          </h3>
          <span className="text-xs text-[#8b949e]">Contribution settings ▾</span>
        </div>

        {/* Heatmap Grid */}
        <div className="overflow-x-auto pb-2">
          <div className="flex gap-[3px] min-w-[700px]">
            {contributionWeeks.map((week, wIdx) => (
              <div key={wIdx} className="flex flex-col gap-[3px]">
                {week.map((lvl, dIdx) => (
                  <div
                    key={dIdx}
                    className={`w-[10px] h-[10px] rounded-[2px] ${levelColor(lvl)} border border-[#1b1f24] hover:ring-1 hover:ring-white cursor-pointer transition-all`}
                    title={`Activity level ${lvl} on week ${wIdx + 1}`}
                  ></div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between text-[11px] text-[#8b949e] pt-1">
          <a 
            href="https://docs.github.com/en/account-and-profile/setting-up-and-managing-your-github-profile/managing-contribution-settings-on-your-profile/why-are-my-contributions-not-showing-up-on-my-profile" 
            target="_blank" 
            rel="noreferrer"
            className="hover:text-[#58a6ff]"
          >
            Learn how we count contributions
          </a>
          <div className="flex items-center space-x-1.5">
            <span>Less</span>
            <div className="w-[10px] h-[10px] rounded-[2px] bg-[#161b22] border border-[#1b1f24]"></div>
            <div className="w-[10px] h-[10px] rounded-[2px] bg-[#0e4429] border border-[#1b1f24]"></div>
            <div className="w-[10px] h-[10px] rounded-[2px] bg-[#006d32] border border-[#1b1f24]"></div>
            <div className="w-[10px] h-[10px] rounded-[2px] bg-[#26a641] border border-[#1b1f24]"></div>
            <div className="w-[10px] h-[10px] rounded-[2px] bg-[#39d353] border border-[#1b1f24]"></div>
            <span>More</span>
          </div>
        </div>
      </div>

      {/* Extracted Knowledge Graph Skills Card */}
      <div className="p-4 bg-[#161b22] border border-[#30363d] rounded-md space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Network className="w-4 h-4 text-[#58a6ff]" />
            <h3 className="text-sm font-semibold text-[#f0f6fc]">
              Extracted Knowledge Graph Skills ({topSkills.length})
            </h3>
          </div>
          <button 
            onClick={() => onSelectTab('graph')}
            className="text-xs text-[#58a6ff] hover:underline flex items-center space-x-1 font-medium"
          >
            <span>Explore Full 2D Graph</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <p className="text-xs text-[#8b949e]">
          Technologies identified through NLP dependency scanning across ingested repositories:
        </p>

        <div className="flex flex-wrap gap-2 pt-1">
          {topSkills.map(skill => (
            <div
              key={skill.id}
              onClick={() => onSelectTab('graph')}
              className="flex items-center space-x-2 px-3 py-1.5 bg-[#0d1117] hover:bg-[#21262d] border border-[#30363d] hover:border-[#58a6ff] rounded-full text-xs cursor-pointer transition-colors"
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: skill.color || '#3fb950' }}></span>
              <span className="font-medium text-[#f0f6fc]">{skill.name}</span>
              <span className="text-[10px] text-[#8b949e] font-mono">
                {skill.score ? `${skill.score}%` : skill.category}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
