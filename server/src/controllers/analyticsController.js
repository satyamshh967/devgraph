import { GraphService } from '../services/graphService.js';
import { inMemoryGraph } from '../services/inMemoryGraph.js';
import { NlpService } from '../services/nlpService.js';
import { TARGET_ROLE_BENCHMARKS } from '../data/seededDevelopers.js';

export class AnalyticsController {
  static async getContributionAnalytics(req, res) {
    try {
      const { developerId } = req.query;
      let repos = inMemoryGraph.getAllNodes('Repository');
      let developer = null;

      if (developerId) {
        repos = repos.filter(r => r.developerId === developerId);
        developer = inMemoryGraph.getNode(developerId);
      }

      // Aggregate languages
      const languageDistribution = {};
      let totalLOC = 0;
      let totalStars = 0;
      let totalCommits = 0;

      repos.forEach(repo => {
        const lang = repo.language || 'Other';
        const loc = repo.linesOfCode || 10000;
        languageDistribution[lang] = (languageDistribution[lang] || 0) + loc;
        totalLOC += loc;
        totalStars += repo.stars || 0;
        totalCommits += repo.commitsCount || 0;
      });

      // Commit timeline distribution (by year)
      const yearlyCommits = { 2021: 0, 2022: 0, 2023: 0, 2024: 0, 2025: 0, 2026: 0 };
      repos.forEach(repo => {
        const y = repo.createdYear || 2023;
        yearlyCommits[y] = (yearlyCommits[y] || 0) + (repo.commitsCount || 50);
      });

      res.json({
        developer: developer ? { id: developer.id, name: developer.name, username: developer.username } : null,
        metrics: {
          totalRepositories: repos.length,
          totalLinesOfCode: totalLOC,
          totalStars,
          totalCommits
        },
        languageDistribution: Object.entries(languageDistribution).map(([name, bytes]) => ({
          name,
          bytes,
          percentage: totalLOC > 0 ? Math.round((bytes / totalLOC) * 100) : 0
        })),
        yearlyCommits: Object.entries(yearlyCommits).map(([year, count]) => ({
          year: parseInt(year),
          commits: count
        }))
      });
    } catch (err) {
      console.error('Error fetching contribution analytics:', err);
      res.status(500).json({ error: err.message });
    }
  }

  static async getSkillEvolution(req, res) {
    try {
      const { developerId } = req.query;
      const dev = developerId ? inMemoryGraph.getNode(developerId) : inMemoryGraph.getAllNodes('Developer')[0];
      
      if (!dev) {
        return res.status(404).json({ error: 'Developer not found' });
      }

      const timeline = dev.timeline || [
        { year: 2021, unlockedSkills: ["JavaScript", "HTML/CSS"], milestone: "Foundation" },
        { year: 2023, unlockedSkills: ["TypeScript", "React"], milestone: "Modern Frontend" },
        { year: 2026, unlockedSkills: ["Node.js", "Docker"], milestone: "Full Stack Systems" }
      ];

      // Query graph for skills connected to this developer
      const ego = inMemoryGraph.getEgoGraph(dev.id, 2);
      const skills = ego.nodes.filter(n => n.label === 'Skill');

      res.json({
        developer: { id: dev.id, name: dev.name, username: dev.username },
        timeline,
        allSkillsCount: skills.length
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  static async getRoleBenchmarks(req, res) {
    try {
      res.json(TARGET_ROLE_BENCHMARKS);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  static async scoreTeamCompatibility(req, res) {
    try {
      const { developerId, targetRole, customRequirements } = req.body;
      
      let candidateSkills = [];
      if (developerId) {
        const profile = GraphService.getDeveloperById(developerId);
        if (profile && profile.skills) {
          candidateSkills = profile.skills;
        }
      }

      let benchmark = null;
      if (customRequirements) {
        benchmark = customRequirements;
      } else if (targetRole && TARGET_ROLE_BENCHMARKS[targetRole]) {
        benchmark = TARGET_ROLE_BENCHMARKS[targetRole];
      } else {
        benchmark = Object.values(TARGET_ROLE_BENCHMARKS)[0];
      }

      const result = await NlpService.calculateCompatibility(candidateSkills, benchmark);
      res.json({
        candidateId: developerId,
        targetRole: benchmark.role_title,
        benchmarkDescription: benchmark.description,
        ...result
      });
    } catch (err) {
      console.error('Error in scoreTeamCompatibility:', err);
      res.status(500).json({ error: err.message });
    }
  }

  static async getRepoComplexity(req, res) {
    try {
      const { repoId } = req.query;
      let repos = inMemoryGraph.getAllNodes('Repository');
      if (repoId) {
        repos = repos.filter(r => r.id === repoId);
      }

      const complexityBreakdown = repos.map(r => ({
        id: r.id,
        name: r.name,
        fullName: r.fullName,
        language: r.language,
        stars: r.stars,
        linesOfCode: r.linesOfCode,
        complexityScore: r.complexityScore,
        complexityTier: r.complexityTier,
        complexityBadgeColor: r.complexityBadgeColor,
        metrics: r.complexityMetrics
      }));

      res.json(complexityBreakdown);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}
