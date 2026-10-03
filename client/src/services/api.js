import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
});

export const GraphAPI = {
  getGraphData: async (params = {}) => {
    const res = await api.get('/graph/data', { params });
    return res.data;
  },

  getNodeDetails: async (nodeId) => {
    const res = await api.get(`/graph/node/${encodeURIComponent(nodeId)}`);
    return res.data;
  },

  getGraphStatus: async () => {
    const res = await api.get('/graph/status');
    return res.data;
  },

  getDevelopers: async () => {
    const res = await api.get('/developers');
    return res.data;
  },

  getDeveloperDetails: async (id) => {
    const res = await api.get(`/developers/${encodeURIComponent(id)}`);
    return res.data;
  },

  getContributionAnalytics: async (developerId = null) => {
    const res = await api.get('/analytics/contributions', {
      params: developerId ? { developerId } : {}
    });
    return res.data;
  },

  getSkillEvolution: async (developerId = null) => {
    const res = await api.get('/analytics/skill-evolution', {
      params: developerId ? { developerId } : {}
    });
    return res.data;
  },

  getRoleBenchmarks: async () => {
    const res = await api.get('/analytics/benchmarks');
    return res.data;
  },

  scoreTeamCompatibility: async (payload) => {
    const res = await api.post('/analytics/team-compatibility', payload);
    return res.data;
  },

  getRepoComplexity: async (repoId = null) => {
    const res = await api.get('/analytics/repo-complexity', {
      params: repoId ? { repoId } : {}
    });
    return res.data;
  },

  importProfile: async (username, token = null) => {
    const res = await api.post('/github/import', { username, token });
    return res.data;
  },

  getBenchmarks: async () => {
    const res = await api.get('/github/benchmarks');
    return res.data;
  }
};
