import React, { useState } from 'react';
import { foodApi, authStorage } from '../services/api';
import '../styles/dashboard.css';

const EditProfileModal = ({ partner, onClose, onUpdateSuccess }) => {
  const [formData, setFormData] = useState({
    name: partner?.name || '',
    contactName: partner?.contactName || '',
    phone: partner?.phone || '',
    address: partner?.address || '',
    cuisineType: partner?.cuisineType || '',
    profileImage: partner?.profileImage || '',
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Restaurant name is required');
      return;
    }
    if (!formData.contactName.trim()) {
      setError('Contact person name is required');
      return;
    }
    if (!formData.phone.trim()) {
      setError('Contact phone is required');
      return;
    }
    if (!formData.address.trim()) {
      setError('Restaurant address is required');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const response = await foodApi.updateProfile({
        name: formData.name.trim(),
        contactName: formData.contactName.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        cuisineType: formData.cuisineType.trim(),
        profileImage: formData.profileImage.trim(),
      });

      const updatedPartner = response.partner || {
        ...partner,
        ...formData,
      };

      authStorage.setAuth({
        partner: updatedPartner,
        role: 'partner',
      });

      if (onUpdateSuccess) {
        onUpdateSuccess(updatedPartner);
      }
      onClose();
    } catch (err) {
      console.error('Update profile error:', err);
      const msg = err.response?.data?.message || err.message || 'Failed to update profile';
      setError(msg);
    } finally {
      setSaving(false);
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
            <span className="modal-header-icon">🏪</span>
            <div>
              <h2 className="modal-header-title">Edit Restaurant Profile</h2>
              <p className="modal-header-subtitle">Update your culinary kitchen and contact details</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={saving}
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

            {/* Restaurant Name */}
            <div className="modal-field-group">
              <label className="modal-label" htmlFor="edit-partner-name">
                Restaurant / Brand Name *
              </label>
              <input
                id="edit-partner-name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                className="modal-input"
              />
            </div>

            {/* Owner & Phone */}
            <div className="modal-grid-2">
              <div className="modal-field-group">
                <label className="modal-label" htmlFor="edit-partner-contact">
                  Owner / Manager Name *
                </label>
                <input
                  id="edit-partner-contact"
                  name="contactName"
                  type="text"
                  required
                  value={formData.contactName}
                  onChange={handleChange}
                  className="modal-input"
                />
              </div>

              <div className="modal-field-group">
                <label className="modal-label" htmlFor="edit-partner-phone">
                  Contact Phone *
                </label>
                <input
                  id="edit-partner-phone"
                  name="phone"
                  type="text"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className="modal-input"
                />
              </div>
            </div>

            {/* Cuisine Type */}
            <div className="modal-field-group">
              <label className="modal-label" htmlFor="edit-partner-cuisine">
                Cuisine Specialty
              </label>
              <input
                id="edit-partner-cuisine"
                name="cuisineType"
                type="text"
                placeholder="e.g. North Indian & Mughlai, Pizzeria, Cafe"
                value={formData.cuisineType}
                onChange={handleChange}
                className="modal-input"
              />
            </div>

            {/* Address */}
            <div className="modal-field-group">
              <label className="modal-label" htmlFor="edit-partner-address">
                Complete Restaurant Address *
              </label>
              <textarea
                id="edit-partner-address"
                name="address"
                required
                value={formData.address}
                onChange={handleChange}
                className="modal-textarea"
              />
            </div>

            {/* Profile / Logo Image URL */}
            <div className="modal-field-group">
              <label className="modal-label" htmlFor="edit-partner-image">
                Profile Logo / Image URL (Optional)
              </label>
              <input
                id="edit-partner-image"
                name="profileImage"
                type="url"
                placeholder="https://example.com/logo.jpg"
                value={formData.profileImage}
                onChange={handleChange}
                className="modal-input"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="modal-footer">
            <button
              type="button"
              disabled={saving}
              onClick={onClose}
              className="modal-btn-cancel"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="modal-btn-submit"
            >
              {saving ? 'Saving Changes...' : '💾 Save Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;
