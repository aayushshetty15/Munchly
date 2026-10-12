import React, { useEffect, useState } from 'react';
import { foodApi } from '../services/api';

const RestaurantModal = ({ partner, onClose, onSelectDish }) => {
  const [partnerDishes, setPartnerDishes] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (partner?._id) {
      setLoading(true);
      foodApi
        .getPartnerProfile(partner._id)
        .then((data) => {
          if (data?.foodItems) setPartnerDishes(data.foodItems);
        })
        .catch((err) => console.error('Error fetching partner dishes:', err))
        .finally(() => setLoading(false));
    }
  }, [partner]);

  if (!partner) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="restaurant-modal-container"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="restaurant-modal-header">
          <div className="restaurant-modal-identity">
            {partner.profileImage ? (
              <img
                src={partner.profileImage}
                alt={partner.name}
                className="restaurant-modal-avatar"
              />
            ) : (
              <div className="restaurant-modal-avatar">
                {partner.name ? partner.name[0].toUpperCase() : '🍽️'}
              </div>
            )}
            <div className="restaurant-modal-info">
              <div className="restaurant-modal-name-row">
                <h2 className="restaurant-modal-name">{partner.name}</h2>
                <span className="restaurant-modal-badge">
                  Verified Partner
                </span>
              </div>
              <p className="restaurant-modal-meta">
                <span>📍</span> {partner.address || 'Address on file'}
              </p>
              {partner.contactName && (
                <p className="restaurant-modal-meta">
                  Managed by: <strong style={{ color: '#000000', fontWeight: 700 }}>{partner.contactName}</strong>
                </p>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            className="modal-close-btn"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Content & Actions */}
        <div className="restaurant-modal-body">
          {/* Quick Contact & Action Buttons */}
          <div className="restaurant-actions-row">
            <a
              href={partner.phone ? `tel:${partner.phone}` : '#'}
              className="restaurant-call-btn"
            >
              <svg style={{ width: 16, height: 16 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
              <span>Call ({partner.phone || 'Contact'})</span>
            </a>

            <div className="restaurant-cuisine-pill">
              <span>🍽️ {partner.cuisineType || 'Specialty Kitchen'}</span>
            </div>
          </div>

          {/* Details Pill Box */}
          <div className="restaurant-details-card">
            <div className="restaurant-detail-row">
              <span className="restaurant-detail-label">Partner Status</span>
              <span className="restaurant-detail-value">● Open for Food Lovers</span>
            </div>
            <div className="restaurant-detail-row">
              <span className="restaurant-detail-label">Restaurant Phone</span>
              <span className="restaurant-detail-value">{partner.phone || 'N/A'}</span>
            </div>
            <div className="restaurant-detail-row">
              <span className="restaurant-detail-label">Partner Email</span>
              <span className="restaurant-detail-value">{partner.email || 'partner@foodreel.com'}</span>
            </div>
          </div>

          {/* Partner's Menu Reels */}
          <div>
            <div className="restaurant-dishes-header" style={{ marginBottom: 12 }}>
              <span>Dishes & Signature Reels</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#6b7280' }}>{partnerDishes.length} items</span>
            </div>

            {loading ? (
              <div style={{ padding: '32px 0', textAlign: 'center', color: '#6b7280', fontSize: 13 }}>
                Loading kitchen menu...
              </div>
            ) : partnerDishes.length > 0 ? (
              <div className="restaurant-dishes-grid">
                {partnerDishes.map((dish) => (
                  <div
                    key={dish._id}
                    onClick={() => {
                      if (onSelectDish) onSelectDish(dish);
                      onClose();
                    }}
                    className="restaurant-dish-card"
                  >
                    <div className="restaurant-dish-media">
                      {dish.video ? (
                        <video
                          src={dish.video}
                          muted
                          playsInline
                        />
                      ) : (
                        <span style={{ fontSize: 32 }}>🍲</span>
                      )}
                      {dish.price > 0 && (
                        <span className="restaurant-dish-price-badge">
                          ₹{dish.price}
                        </span>
                      )}
                    </div>
                    <div className="restaurant-dish-body">
                      <p className="restaurant-dish-title">{dish.name}</p>
                      <p className="restaurant-dish-cuisine">{dish.cuisine || 'Specialty'}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: '24px 0', textAlign: 'center', color: '#6b7280', fontSize: 12, border: '1.5px dashed #d1d5db', borderRadius: 12 }}>
                No additional dishes uploaded yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantModal;
