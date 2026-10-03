import { inMemoryGraph } from './inMemoryGraph.js';
import { getNeo4jDriver, getNeo4jStatus } from '../config/neo4j.js';
import { NlpService } from './nlpService.js';
import { SEEDED_DEVELOPERS } from '../data/seededDevelopers.js';

export class GraphService {
  /**
   * Initialize knowledge graph with seeded profiles
   */
  static async seedInitialGraph() {
    console.log('[GraphService] Seeding knowledge graph with benchmark developer profiles...');
    for (const dev of SEEDED_DEVELOPERS) {
      await this.ingestDeveloper(dev);
    }
    console.log(`[GraphService] Graph initialized. Summary:`, inMemoryGraph.getGraphSummary());
  }

  /**
   * Ingest developer and repositories into the knowledge graph
   */
  static async ingestDeveloper(devData) {
    const devId = devData.id || `dev-${devData.username}`;
    
    // 1. Add Developer Node
    inMemoryGraph.addNode('Developer', devId, {
      id: devId,
      username: devData.username,
      name: devData.name || devData.username,
      avatar: devData.avatar || `https://avatars.githubusercontent.com/${devData.username}`,
      bio: devData.bio || "Open source software engineer",
      location: devData.location || "Remote",
      company: devData.company || "Independent",
      totalStars: devData.totalStars || 0,
      totalCommits: devData.totalCommits || 0,
      followers: devData.followers || 0,
      reposCount: (devData.repositories || []).length,
      primaryCategory: devData.primaryCategory || "General",
      timeline: devData.timeline || []
    });

    const developerSkillsMap = new Map(); // skillName -> aggregated stats

    // 2. Process Repositories
    const repos = devData.repositories || [];
    for (const repo of repos) {
      const repoId = repo.id || `repo-${repo.name}`;
      
      // Analyze with NLP to extract skills and complexity
      const nlpResult = await NlpService.analyzeRepository(repo);
      const extractedSkills = nlpResult.extracted_skills || [];
      const complexity = nlpResult.complexity || {};

      // Add Repository Node
      inMemoryGraph.addNode('Repository', repoId, {
        id: repoId,
        developerId: devId,
        name: repo.name,
        fullName: repo.fullName || `${devData.username}/${repo.name}`,
        description: repo.description,
        language: repo.primary_language || repo.language,
        stars: repo.stars || 0,
        forks: repo.forks || 0,
        topics: repo.topics || [],
        complexityScore: complexity.overall_score || 40,
        complexityTier: complexity.tier || "Modular Production Service",
        complexityBadgeColor: complexity.badge_color || "#3b82f6",
        complexityMetrics: complexity.metrics || {},
        linesOfCode: repo.lines_of_code || 10000,
        commitsCount: repo.commits_count || 50,
        createdYear: repo.createdYear || 2023,
        timelineYear: repo.timelineYear || 2023
      });

      // Add Contribution Node & Edges
      const contribId = `contrib-${devId}-${repoId}`;
      inMemoryGraph.addNode('Contribution', contribId, {
        id: contribId,
        developerId: devId,
        repoId: repoId,
        commitCount: repo.commits_count || 50,
        role: "Author / Lead Maintainer",
        year: repo.createdYear || 2023
      });

      inMemoryGraph.addEdge(devId, contribId, 'AUTHORED', {
        commits: repo.commits_count || 50,
        year: repo.createdYear || 2023
      });

      inMemoryGraph.addEdge(contribId, repoId, 'IN_REPO', {
        year: repo.createdYear || 2023
      });

      // 3. Connect Skills to Repo and aggregate for Developer
      for (const skill of extractedSkills) {
        const skillId = `skill-${skill.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
        
        inMemoryGraph.addNode('Skill', skillId, {
          id: skillId,
          name: skill.name,
          category: skill.category,
          color: skill.color,
          weight: skill.weight,
          level: skill.level,
          firstUsedYear: repo.createdYear || 2023
        });

        // Edge: Repository REQUIRES_SKILL Skill
        inMemoryGraph.addEdge(repoId, skillId, 'REQUIRES_SKILL', {
          confidence: skill.confidence,
          proficiencyScore: skill.proficiency_score,
          year: repo.createdYear || 2023
        });

        // Aggregate for developer
        if (!developerSkillsMap.has(skill.name)) {
          developerSkillsMap.set(skill.name, {
            skillId,
            skillName: skill.name,
            category: skill.category,
            color: skill.color,
            totalProficiency: skill.proficiency_score,
            count: 1,
            maxConfidence: skill.confidence,
            firstUsed: repo.createdYear || 2023,
            lastUsed: repo.createdYear || 2023,
            evidenceSources: new Set(skill.sources || [])
          });
        } else {
          const existing = developerSkillsMap.get(skill.name);
          existing.totalProficiency += skill.proficiency_score;
          existing.count += 1;
          existing.firstUsed = Math.min(existing.firstUsed, repo.createdYear || 2023);
          existing.lastUsed = Math.max(existing.lastUsed, repo.createdYear || 2023);
          (skill.sources || []).forEach(s => existing.evidenceSources.add(s));
        }
      }

      // Add intra-skill co-occurrence edges (RELATED_TO)
      for (let i = 0; i < extractedSkills.length; i++) {
        for (let j = i + 1; j < extractedSkills.length; j++) {
          const s1 = `skill-${extractedSkills[i].name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
          const s2 = `skill-${extractedSkills[j].name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
          inMemoryGraph.addEdge(s1, s2, 'RELATED_TO', {
            coOccurrences: 1,
            repoName: repo.name
          });
        }
      }
    }

    // 4. Create (Developer)-[:HAS_SKILL]->(Skill) edges with cumulative scores
    for (const [skillName, meta] of developerSkillsMap.entries()) {
      const avgScore = Math.min(100, Math.round(meta.totalProficiency / meta.count));
      let level = "Beginner";
      if (avgScore >= 80) level = "Expert";
      else if (avgScore >= 55) level = "Advanced";
      else if (avgScore >= 30) level = "Intermediate";

      inMemoryGraph.addEdge(devId, meta.skillId, 'HAS_SKILL', {
        score: avgScore,
        level,
        occurrences: meta.count,
        firstUsedYear: meta.firstUsed,
        lastUsedYear: meta.lastUsed,
        evidenceCount: meta.evidenceSources.size
      });
    }

    // Also sync to Neo4j if active
    await this._syncToNeo4j(devData, repos, developerSkillsMap);

    return {
      developerId: devId,
      reposIngested: repos.length,
      skillsIdentified: developerSkillsMap.size
    };
  }

  static async _syncToNeo4j(dev, repos, skillsMap) {
    const driver = getNeo4jDriver();
    if (!driver) return;

    const session = driver.session();
    try {
      // Cypher query to create or update Developer node in Neo4j Aura
      await session.executeWrite(async tx => {
        await tx.run(
          `MERGE (d:Developer {id: $devId})
           SET d.username = $username, d.name = $name, d.bio = $bio,
               d.totalStars = $totalStars, d.totalCommits = $totalCommits`,
          {
            devId: dev.id,
            username: dev.username,
            name: dev.name,
            bio: dev.bio,
            totalStars: dev.totalStars || 0,
            totalCommits: dev.totalCommits || 0
          }
        );

        for (const repo of repos) {
          await tx.run(
            `MERGE (r:Repository {id: $repoId})
             SET r.name = $name, r.language = $language, r.stars = $stars
             WITH r
             MATCH (d:Developer {id: $devId})
             MERGE (d)-[:CONTRIBUTED_TO]->(r)`,
            {
              repoId: repo.id,
              name: repo.name,
              language: repo.primary_language || repo.language,
              stars: repo.stars || 0,
              devId: dev.id
            }
          );
        }
      });
      console.log(`[Neo4j] Synced developer ${dev.username} to Neo4j Aura database.`);
    } catch (err) {
      console.warn(`[Neo4j] Failed to write to Neo4j Aura:`, err.message);
    } finally {
      await session.close();
    }
  }

  static getGraphData(filters = {}) {
    return inMemoryGraph.queryGraph(filters);
  }

  static getNodeDetails(nodeId) {
    const node = inMemoryGraph.getNode(nodeId);
    if (!node) return null;
    const ego = inMemoryGraph.getEgoGraph(nodeId, 1);
    return {
      node,
      neighborsCount: ego.nodes.length - 1,
      connections: ego.edges.map(edge => {
        const otherId = edge.source === nodeId ? edge.target : edge.source;
        const otherNode = inMemoryGraph.getNode(otherId);
        return {
          edgeType: edge.type,
          direction: edge.source === nodeId ? 'outgoing' : 'incoming',
          properties: edge,
          targetNode: otherNode
        };
      })
    };
  }

  static getDevelopersList() {
    return inMemoryGraph.getAllNodes('Developer');
  }

  static getDeveloperById(devId) {
    const dev = inMemoryGraph.getNode(devId);
    if (!dev) return null;
    
    // Find all skills connected to this developer
    const ego = inMemoryGraph.getEgoGraph(devId, 2);
    const skills = ego.nodes.filter(n => n.label === 'Skill');
    const repos = ego.nodes.filter(n => n.label === 'Repository');
    const hasSkillEdges = ego.edges.filter(e => e.source === devId && e.type === 'HAS_SKILL');

    const mappedSkills = skills.map(s => {
      const edge = hasSkillEdges.find(e => e.target === s.id);
      return {
        ...s,
        proficiency_score: edge ? edge.score : 65,
        level: edge ? edge.level : 'Intermediate',
        firstUsedYear: edge ? edge.firstUsedYear : 2022
      };
    }).sort((a, b) => (b.proficiency_score || 0) - (a.proficiency_score || 0));

    return {
      developer: dev,
      skills: mappedSkills,
      repositories: repos,
      totalSkills: mappedSkills.length,
      topSkills: mappedSkills.slice(0, 8),
      timeline: dev.timeline || []
    };
  }
}
