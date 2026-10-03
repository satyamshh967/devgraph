import { GithubService } from '../services/githubService.js';
import { GraphService } from '../services/graphService.js';

export class GithubController {
  static async importProfile(req, res) {
    try {
      const { username, token } = req.body;
      if (!username) {
        return res.status(400).json({ error: 'GitHub username is required.' });
      }

      const result = await GithubService.importDeveloper(username, token);
      res.json(result);
    } catch (err) {
      console.error('Error in importProfile:', err);
      res.status(500).json({ error: err.message });
    }
  }

  static async getBenchmarks(req, res) {
    try {
      const benchmarks = GithubService.getBenchmarkList();
      res.json(benchmarks);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  static async getDevelopers(req, res) {
    try {
      const devs = GraphService.getDevelopersList();
      res.json(devs);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  static async getDeveloperDetails(req, res) {
    try {
      const { id } = req.params;
      const details = GraphService.getDeveloperById(id);
      if (!details) {
        return res.status(404).json({ error: 'Developer not found' });
      }
      res.json(details);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}
