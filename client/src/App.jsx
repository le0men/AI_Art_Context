import { useState } from 'react';
import ImageUpload from './components/ImageUpload';
import { TabsPanel } from './components/TabsPanel';
import './index.css';

export default function App() {
  const [uploadedImage, setUploadedImage] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);

  const handleImageUpload = (image) => {
    setUploadedImage(image);
    // Clear previous results when new image is uploaded
    setAnalysisResult(null);
  };

  const handleAnalysisComplete = (result) => {
    setAnalysisResult(result);
    console.log('Analysis completed:', result);
  };

  return (
    <div className="app-container">
      <div className="app-content">
        <h1 className="app-title">Image Analysis Dashboard</h1>

        <div className="dashboard-grid">
          <div className="upload-section">
            <ImageUpload
              onImageUpload={handleImageUpload}
              onAnalysisComplete={handleAnalysisComplete}
            />
          </div>

          <div className="tabs-section">
            <TabsPanel analysisResult={analysisResult} />
          </div>
        </div>
      </div>
    </div>
  );
}