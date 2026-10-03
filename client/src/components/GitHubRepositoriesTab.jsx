import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Star, 
  GitFork, 
  ChevronDown, 
  Sparkles,
  ExternalLink,
  Code2
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

export default function GitHubRepositoriesTab({ currentDev, onSelectRepo }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('All');
  const [sortBy, setSortBy] = useState('updated');

  const repos = currentDev?.repositories || [];

  // Unique languages
  const languages = useMemo(() => {
    const set = new Set();
    repos.forEach(r => {
      if (r.language) set.add(r.language);
    });
    return ['All', ...Array.from(set)];
  }, [repos]);

  // Filtered and sorted repositories
  const filteredRepos = useMemo(() => {
    return repos.filter(r => {
      const matchesSearch = !searchTerm || 
        r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.description && r.description.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesLang = selectedLanguage === 'All' || r.language === selectedLanguage;
      return matchesSearch && matchesLang;
    }).sort((a, b) => {
      if (sortBy === 'stars') return (b.stars || 0) - (a.stars || 0);
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return (b.lastUpdatedYear || 2026) - (a.lastUpdatedYear || 2026);
    });
  }, [repos, searchTerm, selectedLanguage, sortBy]);

  return (
    <div className="space-y-4">
      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-3 border-b border-[#21262d]">
        {/* Search input */}
        <div className="flex-1 flex items-center bg-[#161b22] border border-[#30363d] focus-within:border-[#58a6ff] rounded-md px-3 py-1.5 shadow-inner">
          <Search className="w-3.5 h-3.5 text-[#8b949e] mr-2 shrink-0" />
          <input
            type="text"
            placeholder="Find a repository..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent text-xs text-[#f0f6fc] placeholder-[#8b949e] focus:outline-none w-full"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-2">
          {/* Language filter */}
          <div className="relative">
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="appearance-none bg-[#21262d] text-[#c9d1d9] text-xs font-semibold py-1.5 pl-3 pr-7 rounded-md border border-[#30363d] hover:bg-[#30363d] cursor-pointer"
            >
              {languages.map(l => (
                <option key={l} value={l} className="bg-[#161b22]">{l}</option>
              ))}
            </select>
            <ChevronDown className="w-3 h-3 text-[#8b949e] absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Sort filter */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none bg-[#21262d] text-[#c9d1d9] text-xs font-semibold py-1.5 pl-3 pr-7 rounded-md border border-[#30363d] hover:bg-[#30363d] cursor-pointer"
            >
              <option value="updated">Last updated</option>
              <option value="name">Name</option>
              <option value="stars">Stars</option>
            </select>
            <ChevronDown className="w-3 h-3 text-[#8b949e] absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Repositories List */}
      <div className="divide-y divide-[#21262d]">
        {filteredRepos.map(repo => {
          const langColor = LANGUAGE_COLORS[repo.language] || '#3178c6';
          return (
            <div key={repo.id} className="py-5 space-y-2 group">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <a
                    href={repo.html_url || `https://github.com/${repo.fullName}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-lg font-bold text-[#58a6ff] hover:underline"
                  >
                    {repo.name}
                  </a>
                  <span className="text-[11px] font-medium text-[#8b949e] border border-[#30363d] px-2 py-0.5 rounded-full bg-[#161b22]">
                    Public
                  </span>
                </div>

                {/* Code Complexity Score Pill */}
                <span 
                  className="text-xs font-semibold px-2.5 py-0.5 rounded-full border flex items-center space-x-1"
                  style={{ 
                    backgroundColor: `${repo.complexityBadgeColor || '#3b82f6'}15`, 
                    color: repo.complexityBadgeColor || '#58a6ff',
                    borderColor: `${repo.complexityBadgeColor || '#3b82f6'}40`
                  }}
                >
                  <Code2 className="w-3 h-3 mr-1" />
                  <span>{repo.complexityTier || 'Modular Service'} ({repo.complexityScore || 45}/100)</span>
                </span>
              </div>

              <p className="text-xs text-[#8b949e] max-w-3xl leading-relaxed">
                {repo.description || "Open source project on GitHub."}
              </p>

              {/* Topics */}
              {repo.topics && repo.topics.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {repo.topics.map(t => (
                    <span 
                      key={t}
                      className="text-[10px] bg-[#161b22] hover:bg-[#21262d] text-[#58a6ff] px-2 py-0.5 rounded-full border border-[#30363d] cursor-pointer"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}

              {/* Meta Stats row */}
              <div className="flex items-center space-x-4 text-xs text-[#8b949e] pt-1">
                {repo.language && (
                  <div className="flex items-center space-x-1.5">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: langColor }}></span>
                    <span className="text-[#c9d1d9]">{repo.language}</span>
                  </div>
                )}

                <div className="flex items-center space-x-1 hover:text-[#58a6ff]">
                  <Star className="w-3.5 h-3.5" />
                  <span>{repo.stars || 0}</span>
                </div>

                <div className="flex items-center space-x-1 hover:text-[#58a6ff]">
                  <GitFork className="w-3.5 h-3.5" />
                  <span>{repo.forks || 0}</span>
                </div>

                <span>Updated in {repo.lastUpdatedYear || 2026}</span>
              </div>
            </div>
          );
        })}

        {filteredRepos.length === 0 && (
          <div className="py-12 text-center text-xs text-[#8b949e]">
            No repositories matched your search.
          </div>
        )}
      </div>
    </div>
  );
}
