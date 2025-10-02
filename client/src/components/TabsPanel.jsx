// TabsPanel.jsx
import { useState } from 'react';
import '../styling/TabsPanel.css';
import BarChartIcon from '@mui/icons-material/BarChart';
import ArticleIcon from '@mui/icons-material/Article';
import MapIcon from '@mui/icons-material/Map';

export default function TabsPanel() {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChartIcon },
    { id: 'details', label: 'Details', icon: ArticleIcon },
    { id: 'heatmap', label: 'Heatmap', icon: MapIcon }
  ];

  return (
    <div className="tabs-container">
      {/* Tab Headers */}
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

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'overview' && (
          <div className="tab-panel">
            <h3 className="panel-title">Analysis Overview</h3>
            <p className="panel-description">
              Upload an image to see a comprehensive overview of the analysis results, including key metrics and summary statistics.
            </p>
            <div className="metrics-grid">
              <div className="metric-card">
                <p className="metric-label">Confidence</p>
                <p className="metric-value">--</p>
              </div>
              <div className="metric-card">
                <p className="metric-label">Processing Time</p>
                <p className="metric-value">--</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'details' && (
          <div className="tab-panel">
            <h3 className="panel-title">Detailed Analysis</h3>
            <p className="panel-description">
              Detailed breakdown of the analysis results, including technical information and granular data points.
            </p>
            <div className="details-card">
              <p className="placeholder-text">No data available yet</p>
            </div>
          </div>
        )}

        {activeTab === 'heatmap' && (
          <div className="tab-panel">
            <h3 className="panel-title">Image Heatmap</h3>
            <p className="panel-description">
              Intelligent insights and recommendations based on the image analysis powered by advanced algorithms.
            </p>
            <div className="insights-card">
              <p className="placeholder-text">Upload and analyze an image to generate insights</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}