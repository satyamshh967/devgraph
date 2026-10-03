import React from 'react';
import { 
  Database, 
  Search, 
  GitPullRequest, 
  AlertCircle, 
  Terminal, 
  Layers, 
  DownloadCloud,
  ChevronDown,
  Bell,
  Sparkles
} from 'lucide-react';

export default function GitHubNavbar({ 
  currentDev, 
  developers, 
  onSelectDeveloper, 
  onOpenImport, 
  graphStatus,
  onSearchFocus
}) {
  return (
    <header className="h-16 bg-[#010409] border-b border-[#21262d] px-6 flex items-center justify-between text-xs select-none sticky top-0 z-40">
      {/* Left: GitHub Octocat & Breadcrumb */}
      <div className="flex items-center space-x-4">
        {/* GitHub Logo SVG */}
        <a 
          href={currentDev?.html_url || "https://github.com"} 
          target="_blank" 
          rel="noreferrer"
          className="text-white hover:opacity-80 transition-opacity"
          title="GitHub"
        >
          <svg height="32" viewBox="0 0 16 16" version="1.1" width="32" fill="currentColor">
            <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"></path>
          </svg>
        </a>

        {/* Breadcrumb */}
        <div className="flex items-center space-x-1.5 text-sm font-semibold">
          <a 
            href={currentDev?.html_url || `https://github.com/${currentDev?.username}`} 
            target="_blank" 
            rel="noreferrer"
            className="text-[#58a6ff] hover:underline"
          >
            {currentDev?.username || 'satyamshh967'}
          </a>
          <span className="text-[#8b949e]">/</span>
          <span className="text-[#f0f6fc] font-bold">Developer-Knowledge-Platform</span>
          <span className="ml-2 text-[11px] font-medium px-2 py-0.5 rounded-full border border-[#30363d] text-[#8b949e] bg-[#161b22]">
            Public
          </span>
        </div>
      </div>

      {/* Center: GitHub Search Input */}
      <div className="hidden md:flex items-center w-72">
        <div className="w-full flex items-center bg-[#161b22] border border-[#30363d] hover:border-[#58a6ff] focus-within:border-[#58a6ff] rounded-md px-2.5 py-1.5 transition-colors">
          <Search className="w-3.5 h-3.5 text-[#8b949e] mr-2 shrink-0" />
          <input
            type="text"
            placeholder="Search knowledge graph & repos..."
            onChange={(e) => onSearchFocus && onSearchFocus(e.target.value)}
            className="bg-transparent text-xs text-[#f0f6fc] placeholder-[#8b949e] focus:outline-none w-full"
          />
          <kbd className="text-[10px] text-[#8b949e] bg-[#21262d] border border-[#30363d] px-1.5 py-0.5 rounded ml-1 font-mono">
            /
          </kbd>
        </div>
      </div>

      {/* Right: Actions, Database indicator, Connect Button & Persona Switcher */}
      <div className="flex items-center space-x-3">
        {/* Database Mode indicator */}
        <div 
          className="hidden lg:flex items-center space-x-2 px-2.5 py-1 rounded-md bg-[#161b22] border border-[#30363d]"
          title={graphStatus?.database?.mode || 'Neo4j Graph Database'}
        >
          <Database className={`w-3.5 h-3.5 ${graphStatus?.database?.active ? 'text-[#3fb950]' : 'text-[#d29922]'}`} />
          <span className="text-[#8b949e] font-mono text-[11px]">
            {graphStatus?.database?.active ? 'Neo4j Aura' : 'In-Memory Graph'}
          </span>
          <span className={`w-2 h-2 rounded-full ${graphStatus?.database?.active ? 'bg-[#3fb950]' : 'bg-[#d29922]'}`}></span>
        </div>

        {/* Connect GitHub Button (GitHub Green) */}
        <button
          onClick={onOpenImport}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md bg-[#238636] hover:bg-[#2ea043] text-white text-xs font-semibold shadow-sm transition-all"
        >
          <DownloadCloud className="w-3.5 h-3.5" />
          <span>Connect with GitHub</span>
        </button>

        {/* Persona Switcher Dropdown */}
        <div className="relative flex items-center">
          <select
            value={currentDev?.id || ''}
            onChange={(e) => onSelectDeveloper(e.target.value)}
            className="appearance-none bg-[#161b22] text-[#f0f6fc] text-xs font-medium py-1.5 pl-2.5 pr-7 rounded-md border border-[#30363d] hover:border-[#8b949e] focus:outline-none focus:border-[#58a6ff] cursor-pointer"
          >
            {developers.map(d => (
              <option key={d.id} value={d.id} className="bg-[#161b22] text-white">
                {d.name} (@{d.username})
              </option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-[#8b949e] absolute right-2 pointer-events-none" />
        </div>

        {/* Profile Avatar */}
        <img
          src={currentDev?.avatar || "https://avatars.githubusercontent.com/u/304974628?v=4"}
          alt={currentDev?.name || "User Avatar"}
          className="w-7 h-7 rounded-full border border-[#30363d] object-cover"
        />
      </div>
    </header>
  );
}
