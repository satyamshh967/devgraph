import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import apiRoutes from './routes/api.js';
import { initializeNeo4j } from './config/neo4j.js';
import { GraphService } from './services/graphService.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));

// Mount API routes
app.use('/api', apiRoutes);

// Root health check
app.get('/', (req, res) => {
  res.json({
    service: 'Developer Knowledge Graph Platform - API Gateway',
    version: '1.0.0',
    status: 'online',
    endpoints: {
      githubImport: 'POST /api/github/import',
      skillsAnalyze: 'POST /api/skills/analyze',
      graphData: 'GET /api/graph/data',
      graphNode: 'GET /api/graph/node/:id',
      analytics: 'GET /api/analytics/contributions',
      skillEvolution: 'GET /api/analytics/skill-evolution',
      teamCompatibility: 'POST /api/analytics/team-compatibility',
      repoComplexity: 'GET /api/analytics/repo-complexity'
    }
  });
});

async function startServer() {
  console.log('--- Initializing Developer Knowledge Graph Platform ---');
  
  // Try connecting to Neo4j Aura; falls back gracefully if not configured
  await initializeNeo4j();

  // Populate graph with seeded benchmarks
  await GraphService.seedInitialGraph();

  app.listen(PORT, () => {
    console.log(`[API Server] Running on http://localhost:${PORT}`);
    console.log(`[API Server] Graph API ready at http://localhost:${PORT}/api/graph/data`);
  });
}

startServer().catch(err => {
  console.error('Fatal error during server startup:', err);
});
