import React, { useEffect, useState } from 'react';
import { 
  X, 
  User, 
  GitFork, 
  Star, 
  FileCode, 
  ExternalLink, 
  Layers, 
  TrendingUp, 
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Sparkles
} from 'lucide-react';
import { GraphAPI } from '../services/api';

export default function NodeDetailDrawer({ nodeId, onClose, onSelectConnectedNode }) {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!nodeId) return;
    let isMounted = true;
    setLoading(true);

    GraphAPI.getNodeDetails(nodeId)
      .then(res => {
        if (isMounted) {
          setDetails(res);
          setLoading(false);
        }
      })
      .catch(err => {
        console.error('Failed to load node details:', err);
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, [nodeId]);

  if (!nodeId) return null;

  const node = details?.node;
  const connections = details?.connections || [];

  return (
    <div className="fixed top-16 right-0 bottom-0 w-96 bg-[#0f172a]/95 backdrop-blur-xl border-l border-slate-800 shadow-2xl z-40 flex flex-col transition-all duration-300">
      {/* Header */}
      <div className="p-5 border-b border-slate-800 flex items-start justify-between">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
              node?.label === 'Developer' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
              node?.label === 'Repository' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
              node?.label === 'Skill' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
              'bg-pink-500/20 text-pink-300 border border-pink-500/30'
            }`}>
              {node?.label || 'Node'}
            </span>
            {node?.category && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                {node.category}
              </span>
            )}
          </div>
          <h2 className="text-base font-bold text-white tracking-tight break-all">
            {node?.name || node?.username || node?.id}
          </h2>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Content Scroll Area */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-slate-400 text-xs">
            Loading node details...
          </div>
        ) : !node ? (
          <div className="text-center py-16 text-slate-500 text-xs">
            No details available for this node.
          </div>
        ) : (
          <>
            {/* Developer Specific Details */}
            {node.label === 'Developer' && (
              <div className="space-y-4">
                <div className="flex items-center space-x-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
                  <img
                    src={node.avatar || 'https://avatars.githubusercontent.com/u/9919?v=4'}
                    alt={node.name}
                    className="w-12 h-12 rounded-full border border-amber-500/40 object-cover"
                  />
                  <div>
                    <h3 className="font-semibold text-sm text-slate-100">{node.name}</h3>
                    <p className="text-xs text-slate-400">@{node.username}</p>
                    <p className="text-[11px] text-amber-400 font-medium">{node.primaryCategory}</p>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/40 p-3 rounded-lg border border-slate-800/50">
                  {node.bio}
                </p>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Total Stars</span>
                    <span className="text-base font-bold text-amber-400 flex items-center mt-0.5">
                      <Star className="w-3.5 h-3.5 mr-1 fill-amber-400" />
                      {node.totalStars?.toLocaleString()}
                    </span>
                  </div>
                  <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Total Commits</span>
                    <span className="text-base font-bold text-indigo-400 flex items-center mt-0.5">
                      <FileCode className="w-3.5 h-3.5 mr-1" />
                      {node.totalCommits?.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Repository Specific Details */}
            {node.label === 'Repository' && (
              <div className="space-y-4">
                <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-3 rounded-lg border border-slate-800/80">
                  {node.description || 'No description provided.'}
                </p>

                {/* Complexity Score Card */}
                <div className="bg-gradient-to-br from-slate-900 to-indigo-950/30 p-3.5 rounded-xl border border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-300 flex items-center">
                      <Sparkles className="w-3.5 h-3.5 mr-1.5 text-indigo-400" />
                      Codebase Complexity
                    </span>
                    <span 
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: `${node.complexityBadgeColor || '#3b82f6'}25`, color: node.complexityBadgeColor || '#3b82f6' }}
                    >
                      {node.complexityTier || 'Modular Service'}
                    </span>
                  </div>

                  <div className="flex items-baseline space-x-2">
                    <span className="text-2xl font-black text-white">{node.complexityScore || 45}</span>
                    <span className="text-xs text-slate-400">/ 100 Composite Score</span>
                  </div>

                  <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-indigo-500" 
                      style={{ width: `${node.complexityScore || 45}%` }}
                    ></div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Primary Language</span>
                    <span className="text-xs font-semibold text-slate-200 mt-1 block">{node.language || 'Unknown'}</span>
                  </div>
                  <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Stars / Forks</span>
                    <span className="text-xs font-semibold text-slate-200 mt-1 block">
                      ★ {node.stars || 0} / ⑂ {node.forks || 0}
                    </span>
                  </div>
                </div>

                {node.topics && node.topics.length > 0 && (
                  <div>
                    <span className="text-[11px] font-medium text-slate-400 block mb-1.5">Repository Topics</span>
                    <div className="flex flex-wrap gap-1">
                      {node.topics.map(t => (
                        <span key={t} className="text-[10px] bg-slate-900 text-indigo-300 px-2 py-0.5 rounded border border-slate-800">
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Skill Specific Details */}
            {node.label === 'Skill' && (
              <div className="space-y-4">
                <div className="bg-slate-900/70 p-4 rounded-xl border border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-400">Proficiency Rating</span>
                    <span className="text-xs font-bold text-emerald-400">{node.level || 'Advanced'}</span>
                  </div>

                  <div className="flex items-baseline space-x-2">
                    <span className="text-3xl font-extrabold text-white">{node.score || 75}</span>
                    <span className="text-xs text-slate-400">/ 100</span>
                  </div>

                  <div className="w-full bg-slate-800 h-2 rounded-full mt-2.5 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full" 
                      style={{ width: `${node.score || 75}%` }}
                    ></div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Category</span>
                    <span className="text-xs font-semibold text-slate-200 mt-1 block">{node.category}</span>
                  </div>
                  <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">First Unlocked</span>
                    <span className="text-xs font-semibold text-slate-200 mt-1 block">
                      {node.firstUsedYear ? `Year ${node.firstUsedYear}` : '2023'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Connected Graph Neighbors (1-Hop Subgraph) */}
            <div className="pt-2 border-t border-slate-800/80">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold text-slate-200 flex items-center">
                  <Layers className="w-3.5 h-3.5 mr-1.5 text-indigo-400" />
                  Connected Graph Nodes ({connections.length})
                </h4>
              </div>

              <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                {connections.map((conn, idx) => {
                  const target = conn.targetNode;
                  if (!target) return null;
                  return (
                    <button
                      key={idx}
                      onClick={() => onSelectConnectedNode && onSelectConnectedNode(target.id)}
                      className="w-full flex items-center justify-between p-2 rounded-lg bg-slate-900/50 hover:bg-slate-800/80 border border-slate-800 text-left text-xs transition-colors group"
                    >
                      <div className="flex items-center space-x-2 overflow-hidden">
                        <span className={`w-2 h-2 rounded-full shrink-0 ${
                          target.label === 'Developer' ? 'bg-amber-400' :
                          target.label === 'Repository' ? 'bg-blue-400' :
                          target.label === 'Skill' ? 'bg-emerald-400' : 'bg-pink-400'
                        }`}></span>
                        <div className="truncate">
                          <span className="text-slate-200 font-medium group-hover:text-indigo-300 block truncate">
                            {target.name || target.username || target.id}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {conn.edgeType}
                          </span>
                        </div>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300 shrink-0" />
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
