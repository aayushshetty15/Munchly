import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { foodApi, authStorage } from '../../services/api';
import UploadReelModal from '../../components/UploadReelModal';
import EditProfileModal from '../../components/EditProfileModal';
import '../../styles/dashboard.css';

const PartnerHome = () => {
  const navigate = useNavigate();
  const [partner, setPartner] = useState(authStorage.getPartner());
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [actionMessage, setActionMessage] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  // Fetch partner profile & their uploaded reels
  const loadPartnerData = async () => {
    setLoading(true);
    try {
      // 1. Fetch current partner profile
      try {
        const meRes = await foodApi.getMePartner();
        if (meRes?.foodPartner) {
          setPartner(meRes.foodPartner);
          authStorage.setAuth({
            role: 'partner',
            foodPartner: meRes.foodPartner,
          });
        }
      } catch (err) {
        console.warn('Could not fetch fresh partner profile, using stored session:', err.message);
      }

      // 2. Fetch partner's uploaded reels
      const reelsRes = await foodApi.getPartnerReels();
      if (reelsRes?.foodItems) {
        setReels(reelsRes.foodItems);
      }
    } catch (err) {
      console.error('Error loading partner dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPartnerData();
  }, []);

  const handleLogout = async () => {
    try {
      await axios.get('http://localhost:3000/api/auth/food-partner/logout', {
        withCredentials: true,
      });
    } catch (e) {
      console.error('Logout error:', e);
    } finally {
      authStorage.clearAuth();
      navigate('/food-partner/login');
    }
  };

  const handleDeleteReel = async (id, dishName) => {
    if (!window.confirm(`Are you sure you want to delete "${dishName}"? This action cannot be undone.`)) {
      return;
    }

    setDeletingId(id);
    try {
      await foodApi.deleteReel(id);
      setReels((prev) => prev.filter((r) => r._id !== id));
      setActionMessage(`Reel "${dishName}" was deleted successfully.`);
      setTimeout(() => setActionMessage(''), 4000);
    } catch (err) {
      console.error('Delete reel error:', err);
      alert(err.response?.data?.message || 'Failed to delete reel');
    } finally {
      setDeletingId(null);
    }
  };

  const handleReelUploaded = (newReel) => {
    if (newReel) {
      setReels((prev) => [newReel, ...prev]);
      setActionMessage(`🎉 "${newReel.name}" uploaded and published to FoodReel feed!`);
      setTimeout(() => setActionMessage(''), 5000);
    }
  };

  const handleProfileUpdated = (updatedPartner) => {
    setPartner(updatedPartner);
    setActionMessage('✓ Restaurant profile details updated.');
    setTimeout(() => setActionMessage(''), 4000);
  };

  // Engagement stats
  const totalLikes = reels.reduce((acc, r) => acc + (r.likes?.length || 0), 0);
  const totalReels = reels.length;
  const estimatedDiscovery = totalReels * 180 + totalLikes * 12;
  const avgPrice = totalReels > 0 
    ? Math.round(reels.reduce((acc, r) => acc + (r.price || 0), 0) / totalReels)
    : 0;

  return (
    <div className="dashboard-wrapper">
      {/* Top Navbar */}
      <header className="dash-navbar">
        <div className="dash-navbar-inner">
          <Link to="/food-partner/home" className="dash-brand">
            <span className="dash-brand-icon">▶</span>
            <span className="dash-brand-text">FoodReel</span>
          </Link>

          <div className="dash-nav-actions">
            <span className="dash-portal-pill">
              <span className="dash-portal-dot" />
              Partner Studio
            </span>

            <Link to="/home" className="dash-nav-btn">
              <span>📱 View Feed</span>
            </Link>

            <button onClick={handleLogout} className="dash-signout-btn">
              Sign out
            </button>
          </div>
        </div>
      </header>

      {/* Main Dashboard Container */}
      <main className="dash-content">
        {/* Action Alert Banner */}
        {actionMessage && (
          <div className="dash-alert">
            <span>🔔 {actionMessage}</span>
            <button onClick={() => setActionMessage('')} style={{ background: 'none', border: 'none', color: '#fdba74', cursor: 'pointer', fontWeight: 'bold' }}>
              ✕
            </button>
          </div>
        )}

        {/* Restaurant Profile Card */}
        <section className="profile-card">
          <div className="profile-card-top">
            {/* Identity: Avatar + Title */}
            <div className="profile-identity">
              {partner?.profileImage ? (
                <img
                  src={partner.profileImage}
                  alt={partner?.name}
                  className="profile-avatar"
                />
              ) : (
                <div className="profile-avatar">
                  {partner?.name ? partner.name[0].toUpperCase() : '🍽️'}
                </div>
              )}

              <div className="profile-title-area">
                <div className="profile-name-row">
                  <h1 className="profile-name">{partner?.name || 'Your Kitchen'}</h1>
                  <span className="profile-verified-badge">
                    ● Verified Partner
                  </span>
                </div>
                <p className="profile-subtitle">Official Food Partner Dashboard & Menu Management</p>
              </div>
            </div>

            {/* Action Buttons on Right - NEVER CLIPPED */}
            <div className="profile-actions">
              <button
                onClick={() => setShowEditProfileModal(true)}
                className="btn-secondary"
              >
                <span>✏️ Edit Profile</span>
              </button>

              <button
                onClick={() => setShowUploadModal(true)}
                className="btn-primary-gradient"
              >
                <span>🎬 Upload New Reel</span>
              </button>
            </div>
          </div>

          {/* Bottom Row Metadata Badges */}
          <div className="profile-metadata-pills">
            <span className="meta-pill">
              📍 {partner?.address || 'Address not specified'}
            </span>
            <span className="meta-pill">
              📞 {partner?.phone || 'No phone set'}
            </span>
            <span className="meta-pill meta-pill-accent">
              🍽️ {partner?.cuisineType || 'Multi-Cuisine'}
            </span>
            {partner?.contactName && (
              <span className="meta-pill">
                👤 Manager: <strong style={{ color: '#000000', marginLeft: '4px' }}>{partner.contactName}</strong>
              </span>
            )}
          </div>
        </section>

        {/* Engagement Statistics Banner */}
        <section className="stats-grid">
          <div className="stat-card">
            <span className="stat-label">Published Reels</span>
            <div className="stat-value-row">
              <span className="stat-value">{totalReels}</span>
              <span className="stat-unit">videos</span>
            </div>
            <span className="stat-hint">Active in user discovery</span>
          </div>

          <div className="stat-card">
            <span className="stat-label">Total Foodie Likes</span>
            <div className="stat-value-row">
              <span className="stat-value">{totalLikes}</span>
              <span className="stat-unit">hearts</span>
            </div>
            <span className="stat-hint">Customer appreciation</span>
          </div>

          <div className="stat-card">
            <span className="stat-label">Est. Discovery Views</span>
            <div className="stat-value-row">
              <span className="stat-value">{estimatedDiscovery}</span>
              <span className="stat-unit">views</span>
            </div>
            <span className="stat-hint">Reels feed exposure</span>
          </div>

          <div className="stat-card">
            <span className="stat-label">Avg Menu Item Price</span>
            <div className="stat-value-row">
              <span className="stat-value">₹{avgPrice}</span>
              <span className="stat-unit">INR</span>
            </div>
            <span className="stat-hint">Calculated from menu reels</span>
          </div>
        </section>

        {/* Published Reels Catalog Section */}
        <section className="reels-section">
          <div className="reels-header">
            <div>
              <h2 className="reels-title">
                Your Published Food Reels ({reels.length})
              </h2>
              <p className="reels-subtitle">
                Short video reels showcase your culinary creations to diners across the city
              </p>
            </div>

            <button
              onClick={() => setShowUploadModal(true)}
              className="reels-add-link"
            >
              <span>+ Add another dish reel</span>
            </button>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '64px 0', color: '#6b7280' }}>
              <p>Loading kitchen catalog...</p>
            </div>
          ) : reels.length === 0 ? (
            /* Centered & Generously Padded Empty State */
            <div className="empty-reels-box">
              <div className="empty-icon-circle">🎬</div>
              <h3 className="empty-title">No food reels published yet</h3>
              <p className="empty-desc">
                Upload 15-60s video reels of your signature dishes. Food lovers browse FoodReel to discover authentic kitchens, secret recipes, and restaurants in your area.
              </p>
              <button
                onClick={() => setShowUploadModal(true)}
                className="btn-primary-gradient"
                style={{ fontSize: '14px', padding: '14px 28px' }}
              >
                🎬 Upload Your First Food Reel
              </button>
            </div>
          ) : (
            /* Responsive 3-Column Grid */
            <div className="reels-grid">
              {reels.map((reel) => (
                <div key={reel._id} className="reel-card-item">
                  {/* Video Container */}
                  <div className="reel-video-container">
                    <video
                      src={reel.video}
                      className="reel-video-el"
                      controls
                      playsInline
                      preload="metadata"
                    />

                    {reel.price > 0 && (
                      <span className="reel-price-badge">
                        ₹{reel.price}
                      </span>
                    )}

                    <span className="reel-likes-badge">
                      ♥ {reel.likes?.length || 0}
                    </span>
                  </div>

                  {/* Card Body */}
                  <div className="reel-card-body">
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                        <h4 className="reel-item-name">{reel.name}</h4>
                        {reel.cuisine && (
                          <span style={{ fontSize: '11px', color: '#000000', backgroundColor: '#f3f4f6', border: '1px solid #e5e7eb', padding: '2px 8px', borderRadius: '4px', fontWeight: '700' }}>
                            {reel.cuisine}
                          </span>
                        )}
                      </div>

                      {reel.description && (
                        <p className="reel-item-desc">{reel.description}</p>
                      )}
                    </div>

                    <div className="reel-card-footer">
                      <Link
                        to="/home"
                        style={{ fontSize: '12px', fontWeight: '700', color: '#000000', textDecoration: 'underline' }}
                      >
                        Preview in Feed →
                      </Link>

                      <button
                        onClick={() => handleDeleteReel(reel._id, reel.name)}
                        disabled={deletingId === reel._id}
                        className="reel-delete-btn"
                      >
                        {deletingId === reel._id ? 'Deleting...' : '🗑️ Delete'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Modals */}
      {showUploadModal && (
        <UploadReelModal
          onClose={() => setShowUploadModal(false)}
          onSuccess={handleReelUploaded}
        />
      )}

      {showEditProfileModal && (
        <EditProfileModal
          partner={partner}
          onClose={() => setShowEditProfileModal(false)}
          onUpdateSuccess={handleProfileUpdated}
        />
      )}
    </div>
  );
};

export default PartnerHome;
