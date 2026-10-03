import React from 'react';
import { 
  Users, 
  MapPin, 
  Building, 
  Link as LinkIcon, 
  Calendar, 
  Star, 
  Sparkles,
  RefreshCw,
  FolderGit2,
  ExternalLink
} from 'lucide-react';

export default function GitHubProfileSidebar({ currentDev, onOpenImport, onSelectTab }) {
  if (!currentDev) return null;

  return (
    <aside className="w-full md:w-72 shrink-0 space-y-4">
      {/* Profile Avatar & Names */}
      <div className="flex flex-col">
        <div className="relative group w-48 h-48 md:w-64 md:h-64 mx-auto md:mx-0 mb-4">
          <img
            src={currentDev.avatar || "https://avatars.githubusercontent.com/u/304974628?v=4"}
            alt={currentDev.name}
            className="w-full h-full rounded-full border border-[#30363d] object-cover shadow-lg"
          />
          <span 
            className="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-[#161b22] border border-[#30363d] flex items-center justify-center text-sm shadow-md"
            title="Active Knowledge Graph Profile"
          >
            🎯
          </span>
        </div>

        <h1 className="text-2xl font-bold text-[#f0f6fc] leading-tight">
          {currentDev.name}
        </h1>
        <p className="text-base text-[#8b949e] font-light">
          {currentDev.username}
        </p>
      </div>

      {/* Bio */}
      <p className="text-sm text-[#c9d1d9] leading-relaxed">
        {currentDev.bio || "Building software systems through real-world projects."}
      </p>

      {/* Sync / Connect GitHub Button */}
      <button
        onClick={onOpenImport}
        className="w-full py-1.5 px-3 bg-[#21262d] hover:bg-[#30363d] text-[#c9d1d9] hover:text-white border border-[#30363d] rounded-md text-xs font-semibold flex items-center justify-center space-x-2 transition-colors shadow-sm"
      >
        <RefreshCw className="w-3.5 h-3.5" />
        <span>Sync / Connect GitHub</span>
      </button>

      {/* Social / Meta Stats */}
      <div className="flex items-center space-x-3 text-xs text-[#8b949e]">
        <div className="flex items-center space-x-1 hover:text-[#58a6ff] cursor-pointer">
          <Users className="w-3.5 h-3.5" />
          <strong className="text-[#f0f6fc]">{currentDev.followers || 1}</strong>
          <span>followers</span>
        </div>
        <span>•</span>
        <div className="hover:text-[#58a6ff] cursor-pointer">
          <strong className="text-[#f0f6fc]">{currentDev.following || 1}</strong>
          <span> following</span>
        </div>
        <span>•</span>
        <div className="flex items-center space-x-1">
          <Star className="w-3.5 h-3.5 text-[#d29922]" />
          <strong className="text-[#f0f6fc]">{currentDev.totalStars || 0}</strong>
        </div>
      </div>

      {/* Meta Information List */}
      <div className="space-y-2 text-xs text-[#8b949e] pt-2 border-t border-[#21262d]">
        {currentDev.company && (
          <div className="flex items-center space-x-2">
            <Building className="w-4 h-4 shrink-0 text-[#8b949e]" />
            <span className="text-[#c9d1d9] truncate">{currentDev.company}</span>
          </div>
        )}
        {currentDev.location && (
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4 shrink-0 text-[#8b949e]" />
            <span className="text-[#c9d1d9]">{currentDev.location}</span>
          </div>
        )}
        {currentDev.html_url && (
          <div className="flex items-center space-x-2">
            <LinkIcon className="w-4 h-4 shrink-0 text-[#8b949e]" />
            <a 
              href={currentDev.html_url} 
              target="_blank" 
              rel="noreferrer"
              className="text-[#58a6ff] hover:underline truncate"
            >
              github.com/{currentDev.username}
            </a>
          </div>
        )}
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4 shrink-0 text-[#8b949e]" />
          <span>Joined GitHub</span>
        </div>
      </div>

      {/* Graph Verification Badge */}
      <div className="p-3 bg-[#161b22] border border-[#30363d] rounded-md space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold text-[#f0f6fc]">
          <span className="flex items-center space-x-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#58a6ff]" />
            <span>Knowledge Graph</span>
          </span>
          <span className="text-[10px] text-[#3fb950] font-mono bg-[#238636]/20 px-1.5 py-0.5 rounded border border-[#238636]/30">
            Verified
          </span>
        </div>
        <p className="text-[11px] text-[#8b949e]">
          Analyzed from {currentDev.reposCount || 12} repositories using NLP code and dependency extraction.
        </p>
        <button
          onClick={() => onSelectTab('graph')}
          className="text-xs text-[#58a6ff] hover:underline font-medium flex items-center space-x-1 pt-1"
        >
          <span>Open Full Knowledge Graph</span>
          <ExternalLink className="w-3 h-3" />
        </button>
      </div>
    </aside>
  );
}
