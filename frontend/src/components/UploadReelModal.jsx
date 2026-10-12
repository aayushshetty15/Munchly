import React, { useState, useRef } from 'react';
import { foodApi } from '../services/api';
import '../styles/dashboard.css';

const CUISINE_OPTIONS = [
  'Chef Special',
  'Biryani & Pulao',
  'Street Food & Chaat',
  'Pizza & Italian',
  'Burgers & Sandwiches',
  'North Indian Curries',
  'South Indian Tiffin',
  'Desserts & Bakeries',
  'Beverages & Shakes',
  'Chinese & Asian',
  'BBQ & Grills',
];

const UploadReelModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    cuisine: 'Chef Special',
  });
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');

  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      setError('Please select a valid video file (.mp4, .mov, .webm, etc.)');
      return;
    }

    if (file.size > 100 * 1024 * 1024) {
      setError('Video file size exceeds 100MB limit. Please upload a shorter reel.');
      return;
    }

    setError('');
    setVideoFile(file);
    const url = URL.createObjectURL(file);
    setVideoPreviewUrl(url);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Please enter a dish name.');
      return;
    }
    if (!videoFile) {
      setError('Please choose a food reel video file.');
      return;
    }

    setUploading(true);
    setError('');
    setUploadProgress(0);

    const payload = new FormData();
    payload.append('name', formData.name.trim());
    payload.append('description', formData.description.trim());
    payload.append('price', formData.price ? formData.price.toString() : '0');
    payload.append('cuisine', formData.cuisine);
    payload.append('video', videoFile);

    try {
      const response = await foodApi.uploadReel(payload, (percent) => {
        setUploadProgress(percent);
      });

      if (onSuccess) {
        onSuccess(response.food);
      }
      onClose();
    } catch (err) {
      console.error('Reel upload error:', err);
      const msg = err.response?.data?.message || err.message || 'Failed to upload video reel';
      setError(msg);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-container"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header">
          <div className="modal-header-left">
            <span className="modal-header-icon">🎬</span>
            <div>
              <h2 className="modal-header-title">Upload Food Reel</h2>
              <p className="modal-header-subtitle">Publish high-converting reels for food discovery</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={uploading}
            className="modal-close-btn"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
          <div className="modal-body">
            {error && (
              <div style={{ padding: '12px 16px', fontSize: '13px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', borderRadius: '10px' }}>
                {error}
              </div>
            )}

            {/* Video Dropzone / Preview */}
            <div className="modal-field-group">
              <label className="modal-label">
                Reel Video File (MP4, MOV, WebM - Max 100MB) *
              </label>
              {videoPreviewUrl ? (
                <div className="modal-preview-box">
                  <video
                    src={videoPreviewUrl}
                    controls
                    playsInline
                    className="modal-preview-video"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setVideoFile(null);
                      setVideoPreviewUrl('');
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    className="modal-change-btn"
                  >
                    Change Video
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="modal-dropzone"
                >
                  <div className="modal-dropzone-icon">
                    📹
                  </div>
                  <p className="modal-dropzone-title">
                    Click to select food video reel
                  </p>
                  <p className="modal-dropzone-hint">
                    Vertical 9:16 aspect ratio works best (15 to 60 seconds)
                  </p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
            </div>

            {/* Dish Title */}
            <div className="modal-field-group">
              <label className="modal-label" htmlFor="reel-dish-title">
                Dish / Food Item Name *
              </label>
              <input
                id="reel-dish-title"
                type="text"
                required
                placeholder="e.g. Special Hyderabadi Mutton Biryani"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="modal-input"
              />
            </div>

            {/* Price & Cuisine Grid */}
            <div className="modal-grid-2">
              <div className="modal-field-group">
                <label className="modal-label" htmlFor="reel-price">
                  Price (₹)
                </label>
                <input
                  id="reel-price"
                  type="number"
                  placeholder="e.g. 350"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="modal-input"
                />
              </div>

              <div className="modal-field-group">
                <label className="modal-label" htmlFor="reel-cuisine">
                  Cuisine / Category
                </label>
                <select
                  id="reel-cuisine"
                  value={formData.cuisine}
                  onChange={(e) => setFormData({ ...formData, cuisine: e.target.value })}
                  className="modal-input"
                >
                  {CUISINE_OPTIONS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Description */}
            <div className="modal-field-group">
              <label className="modal-label" htmlFor="reel-description">
                Description & Secret Ingredients
              </label>
              <textarea
                id="reel-description"
                placeholder="Share what makes this dish irresistible to food lovers in your city..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="modal-textarea"
              />
            </div>

            {/* Progress Bar */}
            {uploading && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#4b5563', fontWeight: 600 }}>
                  <span>Uploading reel to ImageKit...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div style={{ width: '100%', height: '8px', borderRadius: '9999px', backgroundColor: '#e5e7eb', overflow: 'hidden' }}>
                  <div
                    style={{ height: '100%', backgroundColor: '#000000', width: `${uploadProgress}%`, transition: 'width 0.2s ease' }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions - ALWAYS VISIBLE, NEVER CLIPPED */}
          <div className="modal-footer">
            <button
              type="button"
              disabled={uploading}
              onClick={onClose}
              className="modal-btn-cancel"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading || !videoFile}
              className="modal-btn-submit"
            >
              {uploading ? (
                <span>Publishing Reel...</span>
              ) : (
                <span>🎬 Publish Reel</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadReelModal;
