import { useState } from 'react';
import '../styling/ImageUpload.css';
import ImageIcon from '@mui/icons-material/Image';
import UploadIcon from '@mui/icons-material/FileUpload';
import { apiService } from '../api.jsx';


export default function ImageUpload({ onImageUpload, onAnalysisComplete }) {
  const [uploadedImage, setUploadedImage] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      processFile(file);
    }
  };

  const handleFileInput = (e) => {
    const file = e.target.files[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file) => {
    setUploadedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadedImage(e.target.result);
      if (onImageUpload) onImageUpload(e.target.result);
    };
    reader.readAsDataURL(file);
    setError(null);
  };

  const handleRemove = () => {
    setUploadedImage(null);
    setUploadedFile(null);
    setError(null);
    if (onImageUpload) onImageUpload(null);
  };

  const handleAnalyze = async () => {
    if (!uploadedFile) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      const result = await apiService.analyzeImage(uploadedFile);
      console.log('Analysis result:', result);

      if (onAnalysisComplete) {
        onAnalysisComplete(result);
      }

    } catch (err) {
      console.error('Analysis failed:', err);
      setError(err.response?.data?.error || 'Failed to analyze image');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="image-upload-container">
      <h2 className="upload-title">
        <ImageIcon />
        Upload Image
      </h2>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`upload-zone ${isDragging ? 'dragging' : ''}`}
      >
        {uploadedImage ? (
          <div className="image-preview-container">
            <img
              src={uploadedImage}
              alt="Uploaded"
              className="uploaded-image"
            />
            <button
              onClick={handleRemove}
              className="remove-button"
              disabled={isAnalyzing}
            >
              Remove Image
            </button>
          </div>
        ) : (
          <div className="upload-prompt">
            <div className="upload-icon-wrapper">
              <UploadIcon />
            </div>
            <p className="upload-text">Drag and drop your image here</p>
            <p className="upload-subtext">or</p>
            <label className="browse-button">
              Browse Files
              <input
                type="file"
                accept="image/*"
                onChange={handleFileInput}
                className="file-input"
              />
            </label>
          </div>
        )}
      </div>

      {uploadedImage && (
        <div className="analyze-button-container">
          <button
            className="analyze-button"
            onClick={handleAnalyze}
            disabled={isAnalyzing}
          >
            {isAnalyzing ? 'Analyzing...' : 'Analyze Image'}
          </button>
        </div>
      )}
    </div>
  );
}