import React, { useRef, useEffect, useState, useMemo } from 'react';
import * as d3Force from 'd3-force';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Search, 
  SlidersHorizontal,
  Info,
  Layers,
  Sparkles
} from 'lucide-react';

const CATEGORY_COLORS = {
  "Frontend": "#8b5cf6",
  "Backend": "#10b981",
  "Database": "#f59e0b",
  "Cloud & DevOps": "#06b6d4",
  "AI & Data": "#ec4899",
  "Architecture & Core": "#3b82f6"
};

export default function KnowledgeGraph({ 
  graphData, 
  onSelectNode, 
  selectedNodeId, 
  loading 
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const simulationRef = useRef(null);

  // Viewport transform (pan & zoom)
  const transformRef = useRef({ x: 0, y: 0, k: 1 });
  const [transformState, setTransformState] = useState({ x: 0, y: 0, k: 1 });

  // Filtering & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [minProficiency, setMinProficiency] = useState(0);

  // Interaction tracking
  const hoveredNodeRef = useRef(null);
  const draggedNodeRef = useRef(null);
  const isPanningRef = useRef(false);
  const panStartRef = useRef({ x: 0, y: 0 });

  // Filter nodes & edges based on category, search, and min proficiency
  const { filteredNodes, filteredEdges } = useMemo(() => {
    if (!graphData || !graphData.nodes) return { filteredNodes: [], filteredEdges: [] };

    let nodes = graphData.nodes.filter(node => {
      // Category filter
      if (selectedCategory !== 'All' && node.label === 'Skill' && node.category !== selectedCategory) {
        return false;
      }
      // Min score filter for skills
      if (node.label === 'Skill' && node.score && node.score < minProficiency) {
        return false;
      }
      return true;
    });

    const activeNodeIds = new Set(nodes.map(n => n.id));
    let edges = (graphData.edges || []).filter(e => {
      const sId = typeof e.source === 'object' ? e.source.id : e.source;
      const tId = typeof e.target === 'object' ? e.target.id : e.target;
      return activeNodeIds.has(sId) && activeNodeIds.has(tId);
    });

    return { filteredNodes: nodes, filteredEdges: edges };
  }, [graphData, selectedCategory, minProficiency]);

  // Initialize or update D3 force simulation
  useEffect(() => {
    if (!filteredNodes.length) return;

    // Deep clone nodes and edges for simulation so D3 doesn't mutate props directly
    const simNodes = filteredNodes.map(d => ({ ...d }));
    const nodeMap = new Map(simNodes.map(d => [d.id, d]));

    const simEdges = filteredEdges.map(e => ({
      ...e,
      source: nodeMap.get(typeof e.source === 'object' ? e.source.id : e.source) || e.source,
      target: nodeMap.get(typeof e.target === 'object' ? e.target.id : e.target) || e.target,
    })).filter(e => typeof e.source === 'object' && typeof e.target === 'object');

    if (simulationRef.current) {
      simulationRef.current.stop();
    }

    const width = containerRef.current ? containerRef.current.clientWidth : 800;
    const height = containerRef.current ? containerRef.current.clientHeight : 600;

    const simulation = d3Force.forceSimulation(simNodes)
      .force('link', d3Force.forceLink(simEdges).id(d => d.id).distance(d => {
        if (d.type === 'AUTHORED') return 70;
        if (d.type === 'IN_REPO') return 60;
        if (d.type === 'HAS_SKILL') return 90;
        if (d.type === 'REQUIRES_SKILL') return 80;
        return 110;
      }).strength(0.3))
      .force('charge', d3Force.forceManyBody().strength(d => {
        if (d.label === 'Developer') return -600;
        if (d.label === 'Repository') return -350;
        if (d.label === 'Skill') return -180;
        return -80;
      }))
      .force('center', d3Force.forceCenter(width / 2, height / 2))
      .force('collision', d3Force.forceCollide().radius(d => {
        if (d.label === 'Developer') return 45;
        if (d.label === 'Repository') return 35;
        if (d.label === 'Skill') return 25;
        return 15;
      }))
      .alphaDecay(0.025);

    simulationRef.current = simulation;

    // Trigger redraw on each tick
    simulation.on('tick', () => {
      drawCanvas();
    });

    return () => {
      simulation.stop();
    };
  }, [filteredNodes, filteredEdges]);

  // Canvas rendering function
  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const sim = simulationRef.current;
    if (!sim) return;

    const nodes = sim.nodes();
    const edges = sim.force('link') ? sim.force('link').links() : [];

    const dpr = window.devicePixelRatio || 1;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
      canvas.width = width * dpr;
      canvas.height = height * dpr;
    }

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    // Apply viewport pan and zoom
    const { x, y, k } = transformRef.current;
    ctx.translate(x, y);
    ctx.scale(k, k);

    // 1. Draw Edges
    edges.forEach(edge => {
      const source = edge.source;
      const target = edge.target;
      if (!source || !target || source.x == null || target.x == null) return;

      ctx.beginPath();
      ctx.moveTo(source.x, source.y);
      ctx.lineTo(target.x, target.y);

      // Edge styling by type
      if (edge.type === 'HAS_SKILL') {
        const score = edge.score || 60;
        ctx.strokeStyle = `rgba(16, 185, 129, ${Math.min(0.7, 0.2 + (score / 150))})`;
        ctx.lineWidth = Math.max(1.2, (score / 35));
        ctx.setLineDash([]);
      } else if (edge.type === 'REQUIRES_SKILL') {
        ctx.strokeStyle = 'rgba(139, 92, 246, 0.45)';
        ctx.lineWidth = 1.4;
        ctx.setLineDash([4, 4]);
      } else if (edge.type === 'AUTHORED') {
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.6)';
        ctx.lineWidth = 2.0;
        ctx.setLineDash([]);
      } else if (edge.type === 'IN_REPO') {
        ctx.strokeStyle = 'rgba(59, 130, 246, 0.5)';
        ctx.lineWidth = 1.6;
        ctx.setLineDash([]);
      } else {
        ctx.strokeStyle = 'rgba(100, 116, 139, 0.25)';
        ctx.lineWidth = 1.0;
        ctx.setLineDash([2, 2]);
      }

      ctx.stroke();
      ctx.setLineDash([]); // reset dash
    });

    // 2. Draw Nodes
    const query = searchQuery.trim().toLowerCase();

    nodes.forEach(node => {
      if (node.x == null || node.y == null) return;

      const isSelected = selectedNodeId === node.id;
      const isHovered = hoveredNodeRef.current && hoveredNodeRef.current.id === node.id;
      const matchesSearch = query && (
        (node.name && node.name.toLowerCase().includes(query)) ||
        (node.label && node.label.toLowerCase().includes(query)) ||
        (node.category && node.category.toLowerCase().includes(query))
      );

      let radius = 16;
      let fillColor = '#64748b';
      let strokeColor = '#334155';
      let textColor = '#f1f5f9';

      if (node.label === 'Developer') {
        radius = 28;
        fillColor = '#f59e0b';
        strokeColor = '#fbbf24';
      } else if (node.label === 'Repository') {
        radius = 20;
        fillColor = '#3b82f6';
        strokeColor = '#60a5fa';
      } else if (node.label === 'Skill') {
        radius = 16;
        fillColor = CATEGORY_COLORS[node.category] || node.color || '#10b981';
        strokeColor = '#ffffff';
      } else if (node.label === 'Contribution') {
        radius = 10;
        fillColor = '#ec4899';
        strokeColor = '#f472b6';
      }

      // Outer glow for selected, hovered, or search-matched nodes
      if (isSelected || isHovered || matchesSearch) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius + 8, 0, Math.PI * 2);
        ctx.fillStyle = isSelected 
          ? 'rgba(99, 102, 241, 0.35)' 
          : isHovered 
          ? 'rgba(255, 255, 255, 0.2)' 
          : 'rgba(234, 179, 8, 0.4)';
        ctx.fill();
      }

      // Main node body
      ctx.beginPath();
      ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
      ctx.fillStyle = fillColor;
      ctx.fill();
      ctx.lineWidth = isSelected ? 3 : 1.8;
      ctx.strokeStyle = isSelected ? '#ffffff' : strokeColor;
      ctx.stroke();

      // Skill proficiency progress ring
      if (node.label === 'Skill' && node.score) {
        const angle = ((node.score || 50) / 100) * (Math.PI * 2);
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius + 3, -Math.PI / 2, -Math.PI / 2 + angle);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2.2;
        ctx.stroke();
      }

      // Node Label Text
      ctx.font = node.label === 'Developer' 
        ? 'bold 12px Inter, sans-serif' 
        : node.label === 'Repository' 
        ? 'bold 10px Inter, sans-serif' 
        : '10px Inter, sans-serif';
      ctx.fillStyle = matchesSearch ? '#fef08a' : textColor;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';

      const labelText = node.name || node.username || node.id;
      // Draw background pill for text readability
      const textWidth = ctx.measureText(labelText).width;
      ctx.fillStyle = 'rgba(11, 15, 25, 0.85)';
      ctx.fillRect(node.x - textWidth / 2 - 3, node.y + radius + 4, textWidth + 6, 14);

      ctx.fillStyle = matchesSearch ? '#fde047' : '#e2e8f0';
      ctx.fillText(labelText, node.x, node.y + radius + 5);
    });

    ctx.restore();
  };

  // Convert screen coordinates to world coordinates
  const screenToWorld = (screenX, screenY) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const mouseX = screenX - rect.left;
    const mouseY = screenY - rect.top;
    const { x, y, k } = transformRef.current;
    return {
      x: (mouseX - x) / k,
      y: (mouseY - y) / k
    };
  };

  // Find node at world coordinate
  const getNodeAtPoint = (worldX, worldY) => {
    const sim = simulationRef.current;
    if (!sim) return null;
    const nodes = sim.nodes();
    for (let i = nodes.length - 1; i >= 0; i--) {
      const node = nodes[i];
      if (node.x == null || node.y == null) continue;
      const radius = node.label === 'Developer' ? 30 : node.label === 'Repository' ? 22 : 18;
      const dist = Math.hypot(node.x - worldX, node.y - worldY);
      if (dist <= radius) {
        return node;
      }
    }
    return null;
  };

  // Mouse event handlers
  const handleMouseDown = (e) => {
    const world = screenToWorld(e.clientX, e.clientY);
    const node = getNodeAtPoint(world.x, world.y);

    if (node) {
      draggedNodeRef.current = node;
      node.fx = node.x;
      node.fy = node.y;
      if (simulationRef.current) {
        simulationRef.current.alphaTarget(0.3).restart();
      }
    } else {
      isPanningRef.current = true;
      panStartRef.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handleMouseMove = (e) => {
    const world = screenToWorld(e.clientX, e.clientY);

    if (draggedNodeRef.current) {
      draggedNodeRef.current.fx = world.x;
      draggedNodeRef.current.fy = world.y;
      drawCanvas();
      return;
    }

    if (isPanningRef.current) {
      const dx = e.clientX - panStartRef.current.x;
      const dy = e.clientY - panStartRef.current.y;
      panStartRef.current = { x: e.clientX, y: e.clientY };
      transformRef.current.x += dx;
      transformRef.current.y += dy;
      setTransformState({ ...transformRef.current });
      drawCanvas();
      return;
    }

    // Check hover
    const hovered = getNodeAtPoint(world.x, world.y);
    if (hovered !== hoveredNodeRef.current) {
      hoveredNodeRef.current = hovered;
      if (canvasRef.current) {
        canvasRef.current.style.cursor = hovered ? 'pointer' : 'grab';
      }
      drawCanvas();
    }
  };

  const handleMouseUp = (e) => {
    if (draggedNodeRef.current) {
      draggedNodeRef.current.fx = null;
      draggedNodeRef.current.fy = null;
      draggedNodeRef.current = null;
      if (simulationRef.current) {
        simulationRef.current.alphaTarget(0);
      }
    }
    if (isPanningRef.current) {
      isPanningRef.current = false;
    }
  };

  const handleClick = (e) => {
    const world = screenToWorld(e.clientX, e.clientY);
    const node = getNodeAtPoint(world.x, world.y);
    if (node) {
      onSelectNode(node);
    }
  };

  // Zoom handlers
  const handleWheel = (e) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.15 : 0.87;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const { x, y, k } = transformRef.current;
    const newK = Math.max(0.2, Math.min(4.0, k * zoomFactor));

    // Zoom centered at mouse pointer
    const newX = mouseX - (mouseX - x) * (newK / k);
    const newY = mouseY - (mouseY - y) * (newK / k);

    transformRef.current = { x: newX, y: newY, k: newK };
    setTransformState({ x: newX, y: newY, k: newK });
    drawCanvas();
  };

  const zoomIn = () => {
    const { x, y, k } = transformRef.current;
    const newK = Math.min(4.0, k * 1.3);
    transformRef.current = { x, y, k: newK };
    setTransformState({ ...transformRef.current });
    drawCanvas();
  };

  const zoomOut = () => {
    const { x, y, k } = transformRef.current;
    const newK = Math.max(0.2, k / 1.3);
    transformRef.current = { x, y, k: newK };
    setTransformState({ ...transformRef.current });
    drawCanvas();
  };

  const resetView = () => {
    transformRef.current = { x: 0, y: 0, k: 1 };
    setTransformState({ x: 0, y: 0, k: 1 });
    if (simulationRef.current) {
      simulationRef.current.alpha(0.5).restart();
    }
    drawCanvas();
  };

  // Auto-resize listener
  useEffect(() => {
    const handleResize = () => {
      drawCanvas();
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const categories = ['All', 'Frontend', 'Backend', 'Database', 'Cloud & DevOps', 'AI & Data', 'Architecture & Core'];

  return (
    <div ref={containerRef} className="relative w-full h-[calc(100vh-4rem)] bg-[#0b0f19] overflow-hidden">
      {/* Top Filter and Search Bar */}
      <div className="absolute top-4 left-6 right-6 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        {/* Search input */}
        <div className="pointer-events-auto flex items-center bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-xl px-3 py-1.5 shadow-lg w-72">
          <Search className="w-4 h-4 text-slate-400 mr-2" />
          <input
            type="text"
            placeholder="Search skill, repo, or category..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setTimeout(drawCanvas, 50);
            }}
            className="bg-transparent text-xs text-slate-200 placeholder-slate-500 focus:outline-none w-full"
          />
          {searchQuery && (
            <button 
              onClick={() => { setSearchQuery(''); setTimeout(drawCanvas, 50); }}
              className="text-xs text-slate-500 hover:text-slate-300 ml-1"
            >
              ✕
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="pointer-events-auto flex items-center space-x-1.5 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-xl p-1 shadow-lg overflow-x-auto max-w-2xl">
          {categories.map(cat => {
            const isSelected = selectedCategory === cat;
            const color = cat === 'All' ? '#6366f1' : CATEGORY_COLORS[cat];
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  isSelected 
                    ? 'bg-slate-800 text-white shadow-sm border border-slate-700' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                {cat !== 'All' && (
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }}></span>
                )}
                <span>{cat}</span>
              </button>
            );
          })}
        </div>

        {/* Graph Stats Badge */}
        <div className="pointer-events-auto hidden md:flex items-center space-x-2 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-xl px-3 py-1.5 shadow-lg text-xs text-slate-300">
          <Layers className="w-3.5 h-3.5 text-indigo-400" />
          <span>Nodes: <strong className="text-white">{filteredNodes.length}</strong></span>
          <span className="text-slate-600">|</span>
          <span>Edges: <strong className="text-white">{filteredEdges.length}</strong></span>
        </div>
      </div>

      {/* Floating Canvas Controls */}
      <div className="absolute bottom-6 right-6 z-20 flex flex-col space-y-2 pointer-events-auto">
        <button
          onClick={zoomIn}
          title="Zoom In"
          className="w-9 h-9 rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 flex items-center justify-center shadow-lg transition-colors"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={zoomOut}
          title="Zoom Out"
          className="w-9 h-9 rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 flex items-center justify-center shadow-lg transition-colors"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={resetView}
          title="Reset View"
          className="w-9 h-9 rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 flex items-center justify-center shadow-lg transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Legend Card */}
      <div className="absolute bottom-6 left-6 z-20 bg-slate-900/85 backdrop-blur-md border border-slate-800 rounded-xl p-3 shadow-xl max-w-xs text-xs pointer-events-auto hidden sm:block">
        <div className="flex items-center space-x-1.5 font-semibold text-slate-200 mb-2">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>Graph Legend</span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400">
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span>Developer</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
            <span>Repository</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span>Skill (Proficiency)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-pink-500"></span>
            <span>Contribution</span>
          </div>
        </div>
        <div className="mt-2 pt-2 border-t border-slate-800/80 text-[10px] text-slate-500">
          Scroll to zoom • Click & drag nodes • Click node for details
        </div>
      </div>

      {/* HTML5 Canvas for Graph Visualization */}
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onClick={handleClick}
        onWheel={handleWheel}
        className="w-full h-full cursor-grab active:cursor-grabbing block"
      />
    </div>
  );
}
