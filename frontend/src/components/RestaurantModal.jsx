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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-lg bg-white border border-gray-200 rounded-t-3xl sm:rounded-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl text-black"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative p-6 border-b border-gray-200 bg-white">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-black border border-gray-300 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close"
          >
            ✕
          </button>

          <div className="flex items-center gap-4">
            {partner.profileImage ? (
              <img
                src={partner.profileImage}
                alt={partner.name}
                className="w-16 h-16 rounded-2xl object-cover border border-gray-200 shadow-sm"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-black text-white font-extrabold text-2xl flex items-center justify-center shadow-sm">
                {partner.name ? partner.name[0].toUpperCase() : '🍽️'}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold text-black tracking-tight">{partner.name}</h2>
                <span className="bg-gray-100 text-black text-xs px-2.5 py-0.5 rounded-full font-bold border border-gray-300">
                  Verified Partner
                </span>
              </div>
              <p className="text-xs text-gray-600 mt-1 flex items-center gap-1">
                <span>📍</span> {partner.address || 'Address on file'}
              </p>
              {partner.contactName && (
                <p className="text-xs text-gray-600 mt-0.5">
                  Managed by: <span className="text-black font-semibold">{partner.contactName}</span>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Content & Actions */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-white">
          {/* Quick Contact & Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <a
              href={partner.phone ? `tel:${partner.phone}` : '#'}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-black hover:bg-gray-800 font-bold text-white text-sm shadow-md transition-all no-underline"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
              <span>Call ({partner.phone || 'Contact'})</span>
            </a>

            <div className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gray-100 font-bold text-black text-sm border border-gray-300">
              <span>🍽️ {partner.cuisineType || 'Specialty Kitchen'}</span>
            </div>
          </div>

          {/* Details Pill Box */}
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 text-xs space-y-2 text-black">
            <div className="flex justify-between py-1 border-b border-gray-200">
              <span className="text-gray-600">Partner Status</span>
              <span className="font-bold text-black">● Open for Food Lovers</span>
            </div>
            <div className="flex justify-between py-1 border-b border-gray-200">
              <span className="text-gray-600">Restaurant Phone</span>
              <span className="text-black font-semibold">{partner.phone || 'N/A'}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-gray-600">Partner Email</span>
              <span className="text-black font-semibold">{partner.email || 'partner@foodreel.com'}</span>
            </div>
          </div>

          {/* Partner's Menu Reels */}
          <div>
            <h3 className="text-sm font-bold text-black tracking-wide uppercase mb-3 flex items-center justify-between">
              <span>Dishes & Signature Reels</span>
              <span className="text-xs font-semibold text-gray-500">{partnerDishes.length} items</span>
            </h3>

            {loading ? (
              <div className="py-8 text-center text-gray-500 text-xs">Loading kitchen menu...</div>
            ) : partnerDishes.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {partnerDishes.map((dish) => (
                  <div
                    key={dish._id}
                    onClick={() => {
                      if (onSelectDish) onSelectDish(dish);
                      onClose();
                    }}
                    className="group bg-white hover:bg-gray-50 border border-gray-200 rounded-xl overflow-hidden cursor-pointer transition-all hover:border-black flex flex-col shadow-xs"
                  >
                    <div className="h-28 bg-black relative overflow-hidden flex items-center justify-center">
                      {dish.video ? (
                        <video
                          src={dish.video}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          muted
                          playsInline
                        />
                      ) : (
                        <span className="text-3xl">🍲</span>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                      {dish.price > 0 && (
                        <span className="absolute bottom-2 left-2 bg-black text-white font-bold text-xs px-2 py-0.5 rounded-md border border-gray-800">
                          ₹{dish.price}
                        </span>
                      )}
                    </div>
                    <div className="p-2.5">
                      <p className="font-bold text-xs text-black truncate">{dish.name}</p>
                      <p className="text-[11px] text-gray-500 truncate mt-0.5">{dish.cuisine || 'Specialty'}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center text-gray-500 text-xs border border-dashed border-gray-300 rounded-xl">
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
