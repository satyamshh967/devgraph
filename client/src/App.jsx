import React, { useState, useEffect } from 'react';
import GitHubNavbar from './components/GitHubNavbar';
import GitHubSubNav from './components/GitHubSubNav';
import GitHubProfileSidebar from './components/GitHubProfileSidebar';
import GitHubOverviewTab from './components/GitHubOverviewTab';
import GitHubRepositoriesTab from './components/GitHubRepositoriesTab';
import KnowledgeGraph from './components/KnowledgeGraph';
import NodeDetailDrawer from './components/NodeDetailDrawer';
import SkillEvolutionTimeline from './components/SkillEvolutionTimeline';
import TeamCompatibilityModal from './components/TeamCompatibilityModal';
import RepoComplexityView from './components/RepoComplexityView';
import ContributionAnalyticsView from './components/ContributionAnalyticsView';
import GitHubImportModal from './components/GitHubImportModal';
import { GraphAPI } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'graph', 'repositories', 'timeline', 'compatibility', 'complexity', 'analytics'
  const [developers, setDevelopers] = useState([]);
  const [selectedDevId, setSelectedDevId] = useState('');
  const [graphData, setGraphData] = useState({ nodes: [], edges: [] });
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [graphStatus, setGraphStatus] = useState(null);
  const [benchmarks, setBenchmarks] = useState([]);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Initial data loading
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [devsRes, statusRes, benchRes] = await Promise.all([
        GraphAPI.getDevelopers(),
        GraphAPI.getGraphStatus(),
        GraphAPI.getBenchmarks()
      ]);

      setDevelopers(devsRes);
      setGraphStatus(statusRes);
      setBenchmarks(benchRes);

      // Prefer satyamshh967 if present, else first developer
      const satyam = devsRes.find(d => d.username === 'satyamshh967');
      const defaultId = satyam ? satyam.id : (devsRes[0]?.id || '');
      setSelectedDevId(defaultId);

      await loadGraph(defaultId);
    } catch (err) {
      console.error('Error loading initial app data:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadGraph = async (devId = null) => {
    try {
      const data = await GraphAPI.getGraphData({
        developerId: devId || null
      });
      setGraphData(data);
    } catch (err) {
      console.error('Failed to load graph data:', err);
    }
  };

  const handleSelectDeveloper = async (devId) => {
    setSelectedDevId(devId);
    setSelectedNodeId(null);
    await loadGraph(devId);
  };

  const handleSelectNode = (node) => {
    setSelectedNodeId(node ? node.id : null);
  };

  const handleImportSuccess = async (importedDev) => {
    await loadAllData();
    if (importedDev) {
      setSelectedDevId(importedDev.id);
      await loadGraph(importedDev.id);
    }
  };

  const currentDev = developers.find(d => d.id === selectedDevId) || developers[0];

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#c9d1d9] flex flex-col font-sans select-none antialiased">
      {/* GitHub Top Global Navigation Bar */}
      <GitHubNavbar
        currentDev={currentDev}
        developers={developers}
        onSelectDeveloper={handleSelectDeveloper}
        onOpenImport={() => setIsImportOpen(true)}
        graphStatus={graphStatus}
      />

      {/* GitHub Sub-Navigation Tabs */}
      <GitHubSubNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        reposCount={currentDev?.repositories?.length || currentDev?.reposCount || 0}
        skillsCount={graphData?.stats?.skillsCount || null}
      />

      {/* Main Content Area */}
      <main className="flex-1 relative">
        {/* Profile Tabs: Overview and Repositories use GitHub 2-column profile layout */}
        {(activeTab === 'overview' || activeTab === 'repositories') && (
          <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row gap-8">
            {/* Left Column: Authentic GitHub Profile Sidebar */}
            <GitHubProfileSidebar
              currentDev={currentDev}
              onOpenImport={() => setIsImportOpen(true)}
              onSelectTab={setActiveTab}
            />

            {/* Right Column: Tab View (Overview or Repositories) */}
            <div className="flex-1 min-w-0">
              {activeTab === 'overview' && (
                <GitHubOverviewTab
                  currentDev={currentDev}
                  onSelectTab={setActiveTab}
                  graphData={graphData}
                />
              )}

              {activeTab === 'repositories' && (
                <GitHubRepositoriesTab
                  currentDev={currentDev}
                />
              )}
            </div>
          </div>
        )}

        {/* Full Screen Knowledge Graph */}
        {activeTab === 'graph' && (
          <div className="relative w-full h-[calc(100vh-8rem)]">
            <KnowledgeGraph
              graphData={graphData}
              onSelectNode={handleSelectNode}
              selectedNodeId={selectedNodeId}
              loading={loading}
            />

            {/* Slide-in Node Detail Drawer */}
            <NodeDetailDrawer
              nodeId={selectedNodeId}
              onClose={() => setSelectedNodeId(null)}
              onSelectConnectedNode={(id) => setSelectedNodeId(id)}
            />
          </div>
        )}

        {/* Skill Evolution Timeline */}
        {activeTab === 'timeline' && (
          <SkillEvolutionTimeline
            selectedDevId={selectedDevId}
            developers={developers}
          />
        )}

        {/* Team Compatibility Scoring */}
        {activeTab === 'compatibility' && (
          <TeamCompatibilityModal
            selectedDevId={selectedDevId}
            developers={developers}
          />
        )}

        {/* Repository Complexity */}
        {activeTab === 'complexity' && (
          <RepoComplexityView
            selectedDevId={selectedDevId}
          />
        )}

        {/* Contribution Analytics */}
        {activeTab === 'analytics' && (
          <ContributionAnalyticsView
            selectedDevId={selectedDevId}
            developers={developers}
          />
        )}
      </main>

      {/* GitHub Import / Connect Account Modal */}
      <GitHubImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onImportSuccess={handleImportSuccess}
        benchmarks={benchmarks}
      />
    </div>
  );
}
