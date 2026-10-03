import { GraphService } from '../services/graphService.js';
import { getNeo4jStatus } from '../config/neo4j.js';
import { inMemoryGraph } from '../services/inMemoryGraph.js';

export class GraphController {
  static async getGraphData(req, res) {
    try {
      const { developerId, category, minScore, yearLimit } = req.query;
      const data = GraphService.getGraphData({
        developerId: developerId || null,
        category: category || null,
        minScore: minScore ? parseInt(minScore, 10) : 0,
        yearLimit: yearLimit ? parseInt(yearLimit, 10) : null
      });
      res.json(data);
    } catch (err) {
      console.error('Error fetching graph data:', err);
      res.status(500).json({ error: err.message });
    }
  }

  static async getNodeDetails(req, res) {
    try {
      const { id } = req.params;
      const details = GraphService.getNodeDetails(id);
      if (!details) {
        return res.status(404).json({ error: 'Node not found' });
      }
      res.json(details);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  static async getGraphStatus(req, res) {
    try {
      const neo4jStatus = getNeo4jStatus();
      const summary = inMemoryGraph.getGraphSummary();
      res.json({
        database: neo4jStatus,
        graphEngine: summary
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}
