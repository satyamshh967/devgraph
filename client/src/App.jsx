import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import KnowledgeGraph from './components/KnowledgeGraph';
import NodeDetailDrawer from './components/NodeDetailDrawer';
import SkillEvolutionTimeline from './components/SkillEvolutionTimeline';
import TeamCompatibilityModal from './components/TeamCompatibilityModal';
import RepoComplexityView from './components/RepoComplexityView';
import ContributionAnalyticsView from './components/ContributionAnalyticsView';
import GitHubImportModal from './components/GitHubImportModal';
import { GraphAPI } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('graph');
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

      if (devsRes.length > 0 && !selectedDevId) {
        setSelectedDevId(devsRes[0].id);
      }

      await loadGraph(selectedDevId || (devsRes[0]?.id));
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

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col font-sans select-none overflow-hidden">
      {/* Top Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        developers={developers}
        selectedDevId={selectedDevId}
        onSelectDeveloper={handleSelectDeveloper}
        onOpenImport={() => setIsImportOpen(true)}
        graphStatus={graphStatus}
      />

      {/* Main Content Area */}
      <main className="flex-1 relative overflow-hidden">
        {activeTab === 'graph' && (
          <>
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
          </>
        )}

        {activeTab === 'timeline' && (
          <SkillEvolutionTimeline
            selectedDevId={selectedDevId}
            developers={developers}
          />
        )}

        {activeTab === 'compatibility' && (
          <TeamCompatibilityModal
            selectedDevId={selectedDevId}
            developers={developers}
          />
        )}

        {activeTab === 'complexity' && (
          <RepoComplexityView
            selectedDevId={selectedDevId}
          />
        )}

        {activeTab === 'analytics' && (
          <ContributionAnalyticsView
            selectedDevId={selectedDevId}
            developers={developers}
          />
        )}
      </main>

      {/* GitHub Importer & Benchmark Switcher Modal */}
      <GitHubImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onImportSuccess={handleImportSuccess}
        benchmarks={benchmarks}
      />
    </div>
  );
}
