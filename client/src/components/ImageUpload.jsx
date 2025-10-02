import { useState } from 'react';
import '../styling/ImageUpload.css';
import ImageIcon from '@mui/icons-material/Image';
import UploadIcon from '@mui/icons-material/FileUpload';

export default function ImageUpload({ onImageUpload }) {
  const [uploadedImage, setUploadedImage] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

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
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target.result);
        if (onImageUpload) onImageUpload(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileInput = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target.result);
        if (onImageUpload) onImageUpload(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemove = () => {
    setUploadedImage(null);
    if (onImageUpload) onImageUpload(null);
  };

  return (
    <div className="image-upload-container">
      <h2 className="upload-title">
        <ImageIcon />
        Upload Image
      </h2>

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
          <button className="analyze-button">
            Analyze Image
          </button>
        </div>
      )}
    </div>
  );
}