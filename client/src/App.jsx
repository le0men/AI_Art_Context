// App.jsx
import { useState } from 'react';
import ImageUpload from './components/ImageUpload';
import TabsPanel from './components/TabsPanel';
import './index.css';

export default function App() {
  const [uploadedImage, setUploadedImage] = useState(null);

  const handleImageUpload = (image) => {
    setUploadedImage(image);
  };

  return (
    <div className="app-container">
      <div className="app-content">
        <h1 className="app-title">Image Analysis Dashboard</h1>

        <div className="dashboard-grid">
          <div className="upload-section">
            <ImageUpload onImageUpload={handleImageUpload} />
          </div>

          <div className="tabs-section">
            <TabsPanel />
          </div>
        </div>
      </div>
    </div>
  );
}