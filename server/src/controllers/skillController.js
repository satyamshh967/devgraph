import { NlpService } from '../services/nlpService.js';

export class SkillController {
  static async analyzeSkills(req, res) {
    try {
      const repoData = req.body;
      if (!repoData || !repoData.name) {
        return res.status(400).json({ error: 'Repository name and metadata required' });
      }

      const analysis = await NlpService.analyzeRepository(repoData);
      res.json(analysis);
    } catch (err) {
      console.error('Error analyzing skills:', err);
      res.status(500).json({ error: err.message });
    }
  }
}
