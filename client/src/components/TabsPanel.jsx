// TabsPanel.jsx
import { useState } from 'react';
import '../styling/TabsPanel.css';
import BarChartIcon from '@mui/icons-material/BarChart';
import ArticleIcon from '@mui/icons-material/Article';
import MapIcon from '@mui/icons-material/Map';

export function TabsPanel({ analysisResult }) {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChartIcon },
    { id: 'details', label: 'Details', icon: ArticleIcon },
    { id: 'heatmap', label: 'Heatmap', icon: MapIcon }
  ];

  return (
    <div className="tabs-container">
      <div className="tabs-header">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            >
              <Icon />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="tab-content">
        {activeTab === 'overview' && (
          <div className="tab-panel">
            <h3 className="panel-title">Analysis Overview</h3>
            <p className="panel-description">
              {analysisResult
                ? 'Analysis complete! View the results below.'
                : 'Upload an image to see a comprehensive overview of the analysis results.'}
            </p>
            <div className="metrics-grid">
              <div className="metric-card">
                <p className="metric-label">Confidence</p>
                <p className="metric-value">
                  {analysisResult?.report.ai_generated[analysisResult.report.ai_generated.verdict].confidence
                    ? `${(analysisResult.report.ai_generated[analysisResult.report.ai_generated.verdict].confidence * 100).toFixed(1)}%`
                    : '--'}
                </p>
              </div>
              <div className="metric-card">
                <p className="metric-label">Verdict</p>
                <p className="metric-value">
                  {analysisResult?.report.ai_generated.verdict
                    ? `${analysisResult.report.ai_generated.verdict.toUpperCase()}`
                    : '--'}
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'details' && (
          <div className="tab-panel">
            <h3 className="panel-title">Detailed Analysis</h3>
            <p className="panel-description">
              Detailed breakdown of the analysis results.
            </p>
            <div className="details-card">
              {analysisResult ? (
                <pre className="results-json">
                  {JSON.stringify(analysisResult.results, null, 2)}
                </pre>
              ) : (
                <p className="placeholder-text">No data available yet</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'heatmap' && (
          <div className="tab-panel">
            <h3 className="panel-title">Heatmap</h3>
            <p className="panel-description">
              Intelligent insights based on the analysis.
            </p>
            <div className="insights-card">
              {analysisResult ? (
                <div>
                  <p><strong>Status:</strong> {analysisResult.status}</p>
                  <p><strong>ID:</strong> {analysisResult.id}</p>
                </div>
              ) : (
                <p className="placeholder-text">Upload and analyze an image to generate insights</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}