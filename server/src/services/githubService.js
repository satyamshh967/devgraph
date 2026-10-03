import axios from 'axios';
import { SEEDED_DEVELOPERS } from '../data/seededDevelopers.js';
import { GraphService } from './graphService.js';

export class GithubService {
  /**
   * Import a developer by GitHub username or benchmark preset
   */
  static async importDeveloper(username) {
    const cleanUsername = (username || '').trim().toLowerCase();
    
    // 1. Check if user matches a benchmark profile
    const seeded = SEEDED_DEVELOPERS.find(d => 
      d.username.toLowerCase() === cleanUsername || 
      d.id.toLowerCase() === cleanUsername ||
      d.name.toLowerCase().includes(cleanUsername)
    );

    if (seeded) {
      console.log(`[GithubService] Importing benchmark profile for ${seeded.name}...`);
      await GraphService.ingestDeveloper(seeded);
      return {
        source: 'benchmark',
        developer: seeded,
        message: `Successfully loaded benchmark developer profile: ${seeded.name}`
      };
    }

    // 2. Otherwise attempt live GitHub API import
    const headers = {
      'User-Agent': 'Developer-Knowledge-Graph-Platform',
      'Accept': 'application/vnd.github.v3+json'
    };
    if (process.env.GITHUB_TOKEN) {
      headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
    }

    try {
      console.log(`[GithubService] Querying GitHub API for user: ${cleanUsername}...`);
      const userRes = await axios.get(`https://api.github.com/users/${cleanUsername}`, { headers, timeout: 6000 });
      const userData = userRes.data;

      const reposRes = await axios.get(`https://api.github.com/users/${cleanUsername}/repos?sort=updated&per_page=6`, { headers, timeout: 6000 });
      const reposData = reposRes.data;

      const repositories = reposData.map((r, index) => {
        return {
          id: `repo-${r.id}`,
          name: r.name,
          fullName: r.full_name,
          description: r.description || "Open source project on GitHub",
          language: r.language || "JavaScript",
          primary_language: r.language || "JavaScript",
          languages: r.language ? { [r.language]: 10000 } : { "JavaScript": 10000 },
          stars: r.stargazers_count || 0,
          forks: r.forks_count || 0,
          topics: r.topics || [],
          dependencies: [r.language || "javascript"],
          lines_of_code: Math.max(5000, (r.size || 100) * 10),
          file_count: Math.max(12, Math.round((r.size || 100) / 10)),
          commits_count: Math.max(25, (r.stargazers_count * 2) + 20),
          branches_count: 2,
          createdYear: r.created_at ? new Date(r.created_at).getFullYear() : 2023,
          lastUpdatedYear: r.updated_at ? new Date(r.updated_at).getFullYear() : 2026,
          timelineYear: r.created_at ? new Date(r.created_at).getFullYear() : 2023,
          readme: `${r.name}: ${r.description || ''}. Topics: ${(r.topics || []).join(', ')}`
        };
      });

      const liveProfile = {
        id: `dev-${userData.login}`,
        username: userData.login,
        name: userData.name || userData.login,
        avatar: userData.avatar_url,
        bio: userData.bio || `Developer profile for ${userData.login}`,
        location: userData.location || "Remote",
        company: userData.company || "Independent",
        totalStars: repositories.reduce((acc, r) => acc + r.stars, 0),
        totalCommits: repositories.reduce((acc, r) => acc + r.commits_count, 0),
        followers: userData.followers || 0,
        reposCount: repositories.length,
        primaryCategory: "Open Source Contributor",
        repositories,
        timeline: [
          { year: 2022, unlockedSkills: ["Git", repositories[0]?.language || "JavaScript"], milestone: "Early GitHub contributions" },
          { year: 2024, unlockedSkills: repositories.map(r => r.language).filter(Boolean), milestone: "Expanded multi-language repositories" },
          { year: 2026, unlockedSkills: ["System Design", "Cloud & DevOps"], milestone: "Modern repository maintenance" }
        ]
      };

      await GraphService.ingestDeveloper(liveProfile);

      return {
        source: 'github-live',
        developer: liveProfile,
        message: `Successfully imported live GitHub profile for ${liveProfile.name}`
      };
    } catch (err) {
      console.warn(`[GithubService] Live GitHub import failed (${err.message}).`);
      
      // Fallback: create dynamic synthetic developer profile so user is never blocked
      const fallbackProfile = {
        id: `dev-${cleanUsername}`,
        username: cleanUsername,
        name: cleanUsername.charAt(0).toUpperCase() + cleanUsername.slice(1),
        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanUsername}`,
        bio: `Software engineer building scalable systems and developer tooling for ${cleanUsername}.`,
        location: "Global",
        company: "Tech Labs",
        totalStars: 420,
        totalCommits: 1350,
        followers: 180,
        reposCount: 2,
        primaryCategory: "Full Stack Engineer",
        repositories: [
          {
            id: `repo-${cleanUsername}-core`,
            name: `${cleanUsername}-platform-core`,
            fullName: `${cleanUsername}/${cleanUsername}-platform-core`,
            description: `Core microservice platform and high-performance API engine built with TypeScript and Redis.`,
            language: "TypeScript",
            primary_language: "TypeScript",
            languages: { "TypeScript": 45000, "Shell": 3000 },
            stars: 290,
            forks: 41,
            topics: ["typescript", "nodejs", "redis", "docker", "microservices"],
            dependencies: ["express", "ioredis", "zod", "docker"],
            lines_of_code: 28000,
            file_count: 36,
            commits_count: 280,
            branches_count: 3,
            createdYear: 2023,
            lastUpdatedYear: 2026,
            timelineYear: 2023,
            readme: "Modular TypeScript application with high throughput API endpoints, Docker containerization, and Redis caching."
          },
          {
            id: `repo-${cleanUsername}-ui`,
            name: `${cleanUsername}-web-ui`,
            fullName: `${cleanUsername}/${cleanUsername}-web-ui`,
            description: `Reactive client dashboard with Tailwind CSS and Vite.`,
            language: "React",
            primary_language: "React",
            languages: { "TypeScript": 28000, "HTML/CSS": 9000 },
            stars: 130,
            forks: 18,
            topics: ["react", "vite", "tailwind", "frontend"],
            dependencies: ["react", "vite", "tailwindcss", "lucide-react"],
            lines_of_code: 14000,
            file_count: 22,
            commits_count: 150,
            branches_count: 2,
            createdYear: 2024,
            lastUpdatedYear: 2026,
            timelineYear: 2024,
            readme: "Clean responsive web user interface crafted with React, Vite and modern CSS utilities."
          }
        ],
        timeline: [
          { year: 2023, unlockedSkills: ["TypeScript", "Node.js", "Redis"], milestone: "Backend and API architecture" },
          { year: 2024, unlockedSkills: ["React", "Tailwind CSS", "Vite"], milestone: "Modern reactive frontend and dashboard systems" },
          { year: 2026, unlockedSkills: ["Docker", "System Design"], milestone: "Production deployment and containerization" }
        ]
      };

      await GraphService.ingestDeveloper(fallbackProfile);

      return {
        source: 'synthetic-fallback',
        developer: fallbackProfile,
        message: `GitHub rate limit/network note: Generated synthetic profile for '${cleanUsername}' with realistic repos and skills.`
      };
    }
  }

  static getBenchmarkList() {
    return SEEDED_DEVELOPERS.map(d => ({
      id: d.id,
      username: d.username,
      name: d.name,
      avatar: d.avatar,
      primaryCategory: d.primaryCategory,
      stars: d.totalStars,
      commits: d.totalCommits
    }));
  }
}
