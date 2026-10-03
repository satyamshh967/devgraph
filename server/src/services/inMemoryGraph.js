/**
 * In-Memory Graph Engine with Cypher-like traversal, neighborhood filtering,
 * degree centrality calculation, and timeline projection.
 */
export class InMemoryGraphEngine {
  constructor() {
    this.nodes = new Map(); // id -> { id, label, properties }
    this.edges = new Map(); // id -> { id, source, target, type, properties }
    this.adjacency = new Map(); // id -> Set of edgeIds
  }

  clear() {
    this.nodes.clear();
    this.edges.clear();
    this.adjacency.clear();
  }

  addNode(label, id, properties = {}) {
    if (!this.adjacency.has(id)) {
      this.adjacency.set(id, new Set());
    }
    const node = {
      id,
      label,
      ...properties
    };
    this.nodes.set(id, node);
    return node;
  }

  addEdge(sourceId, targetId, type, properties = {}) {
    const id = `${sourceId}-[${type}]->${targetId}`;
    const edge = {
      id,
      source: sourceId,
      target: targetId,
      type,
      ...properties
    };
    this.edges.set(id, edge);

    if (!this.adjacency.has(sourceId)) this.adjacency.set(sourceId, new Set());
    if (!this.adjacency.has(targetId)) this.adjacency.set(targetId, new Set());

    this.adjacency.get(sourceId).add(id);
    this.adjacency.get(targetId).add(id);
    return edge;
  }

  getNode(id) {
    return this.nodes.get(id);
  }

  getAllNodes(label = null) {
    const all = Array.from(this.nodes.values());
    if (label) {
      return all.filter(n => n.label === label);
    }
    return all;
  }

  getAllEdges(type = null) {
    const all = Array.from(this.edges.values());
    if (type) {
      return all.filter(e => e.type === type);
    }
    return all;
  }

  getEgoGraph(nodeId, depth = 1) {
    const visitedNodes = new Set([nodeId]);
    const visitedEdges = new Set();
    let frontier = [nodeId];

    for (let d = 0; d < depth; d++) {
      const nextFrontier = [];
      for (const currId of frontier) {
        const edgeIds = this.adjacency.get(currId) || new Set();
        for (const edgeId of edgeIds) {
          const edge = this.edges.get(edgeId);
          if (edge) {
            visitedEdges.add(edge);
            const neighborId = edge.source === currId ? edge.target : edge.source;
            if (!visitedNodes.has(neighborId)) {
              visitedNodes.add(neighborId);
              nextFrontier.push(neighborId);
            }
          }
        }
      }
      frontier = nextFrontier;
    }

    return {
      nodes: Array.from(visitedNodes).map(id => this.nodes.get(id)).filter(Boolean),
      edges: Array.from(visitedEdges)
    };
  }

  /**
   * Filter graph by developer, category, or min proficiency score
   */
  queryGraph({ developerId = null, category = null, minScore = 0, yearLimit = null } = {}) {
    let activeNodes = new Set();
    let activeEdges = new Set();

    if (developerId) {
      const ego = this.getEgoGraph(developerId, 2);
      ego.nodes.forEach(n => activeNodes.add(n.id));
      ego.edges.forEach(e => activeEdges.add(e.id));
    } else {
      this.nodes.forEach((_, id) => activeNodes.add(id));
      this.edges.forEach((_, id) => activeEdges.add(id));
    }

    // Apply category filter if specified
    if (category && category !== 'All') {
      const filteredNodes = new Set();
      for (const id of activeNodes) {
        const node = this.nodes.get(id);
        if (node.label === 'Skill') {
          if (node.category === category) filteredNodes.add(id);
        } else {
          filteredNodes.add(id);
        }
      }
      activeNodes = filteredNodes;
    }

    // Filter edges to only those connecting active nodes
    const finalEdges = [];
    for (const edgeId of activeEdges) {
      const edge = this.edges.get(edgeId);
      if (edge && activeNodes.has(edge.source) && activeNodes.has(edge.target)) {
        if (yearLimit && edge.year && edge.year > yearLimit) {
          continue;
        }
        finalEdges.push(edge);
      }
    }

    // Node objects with degree centrality attached
    const finalNodes = [];
    for (const id of activeNodes) {
      const node = this.nodes.get(id);
      if (node) {
        if (yearLimit && node.firstUsedYear && node.firstUsedYear > yearLimit) {
          continue;
        }
        if (node.label === 'Skill' && minScore && (node.score || 0) < minScore) {
          continue;
        }
        const degree = (this.adjacency.get(id) || new Set()).size;
        finalNodes.push({
          ...node,
          degree
        });
      }
    }

    return {
      nodes: finalNodes,
      edges: finalEdges,
      stats: {
        totalNodes: finalNodes.length,
        totalEdges: finalEdges.length,
        skillsCount: finalNodes.filter(n => n.label === 'Skill').length,
        reposCount: finalNodes.filter(n => n.label === 'Repository').length,
        developersCount: finalNodes.filter(n => n.label === 'Developer').length
      }
    };
  }

  getGraphSummary() {
    return {
      nodesCount: this.nodes.size,
      edgesCount: this.edges.size,
      labels: Array.from(new Set(Array.from(this.nodes.values()).map(n => n.label))),
      edgeTypes: Array.from(new Set(Array.from(this.edges.values()).map(e => e.type)))
    };
  }
}

export const inMemoryGraph = new InMemoryGraphEngine();
