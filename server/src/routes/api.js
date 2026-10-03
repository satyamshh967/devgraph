import express from 'express';
import { GithubController } from '../controllers/githubController.js';
import { SkillController } from '../controllers/skillController.js';
import { GraphController } from '../controllers/graphController.js';
import { AnalyticsController } from '../controllers/analyticsController.js';

const router = express.Router();

// GitHub & Developer Ingestion APIs
router.post('/github/import', GithubController.importProfile);
router.get('/github/benchmarks', GithubController.getBenchmarks);
router.get('/developers', GithubController.getDevelopers);
router.get('/developers/:id', GithubController.getDeveloperDetails);

// NLP Skill Analysis API
router.post('/skills/analyze', SkillController.analyzeSkills);

// Graph Visualization & Data APIs
router.get('/graph/data', GraphController.getGraphData);
router.get('/graph/node/:id', GraphController.getNodeDetails);
router.get('/graph/status', GraphController.getGraphStatus);

// Analytics & Advanced Features APIs
router.get('/analytics/contributions', AnalyticsController.getContributionAnalytics);
router.get('/analytics/skill-evolution', AnalyticsController.getSkillEvolution);
router.get('/analytics/benchmarks', AnalyticsController.getRoleBenchmarks);
router.post('/analytics/team-compatibility', AnalyticsController.scoreTeamCompatibility);
router.get('/analytics/repo-complexity', AnalyticsController.getRepoComplexity);

export default router;
