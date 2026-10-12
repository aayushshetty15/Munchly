import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ReelCard from '../../components/ReelCard';
import RestaurantModal from '../../components/RestaurantModal';
import CommentsModal from '../../components/CommentsModal';
import { foodApi, authStorage } from '../../services/api';
import '../../styles/auth.css';
import '../../styles/dashboard.css';

// High-definition initial demo reels showcasing various cuisines
const DEMO_REELS = [
  {
    _id: 'demo-1',
    name: 'Sizzling Truffle Butter Steak & Fries',
    description: 'Prime cut ribeye seared with fresh rosemary, garlic herb butter, and crispy golden fries. Melt-in-the-mouth tenderness!',
    price: 649,
    cuisine: 'Continental & Grill',
    video: 'https://assets.mixkit.co/videos/1529/1529-720.mp4',
    likes: ['u1', 'u2', 'u3', 'u4', 'u5'],
    foodPartner: {
      name: 'The Smokehouse Kitchen',
      contactName: 'Chef Julian Roy',
      phone: '+91 98765 43210',
      address: 'Plot 42, Bandra West, Mumbai',
      email: 'smokehouse@foodreel.com',
      cuisineType: 'BBQ & Steaks',
    },
  },
  {
    _id: 'demo-2',
    name: 'Artisan Cheesy Woodfired Pizza',
    description: 'Freshly stretched sourdough crust with San Marzano tomatoes, buffalo mozzarella, and aromatic basil leaves.',
    price: 499,
    cuisine: 'Italian Pizzeria',
    video: 'https://assets.mixkit.co/videos/24434/24434-720.mp4',
    likes: ['u1', 'u2', 'u6'],
    foodPartner: {
      name: 'Bella Napoli Woodfired',
      contactName: 'Marco Rossi',
      phone: '+91 98200 11223',
      address: 'Indiranagar 100ft Road, Bengaluru',
      email: 'bellanapoli@foodreel.com',
      cuisineType: 'Italian Pizza & Pasta',
    },
  },
  {
    _id: 'demo-3',
    name: 'Golden Crispy Burger with Truffle Dip',
    description: 'Double smashed crispy beef patties, aged cheddar melt, caramelized onions, and secret gourmet brioche sauce.',
    price: 379,
    cuisine: 'Gourmet Burgers',
    video: 'https://assets.mixkit.co/videos/42220/42220-720.mp4',
    likes: ['u1', 'u3', 'u7', 'u8'],
    foodPartner: {
      name: 'Bite & Bun Joint',
      contactName: 'Vikram Mehta',
      phone: '+91 99112 33445',
      address: 'Cyber Hub, DLF Phase 2, Gurugram',
      email: 'bitebun@foodreel.com',
      cuisineType: 'Burgers & Fries',
    },
  },
  {
    _id: 'demo-4',
    name: 'Signature Berry Glazed Pancake Tower',
    description: 'Fluffy buttermilk pancakes stacked high with wild forest berries, warm maple syrup, and whipped vanilla mascarpone.',
    price: 329,
    cuisine: 'Desserts & Bakeries',
    video: 'https://assets.mixkit.co/videos/32971/32971-720.mp4',
    likes: ['u2', 'u4', 'u9'],
    foodPartner: {
      name: 'The Sugar Bloom Bakery',
      contactName: 'Ananya Deshmukh',
      phone: '+91 97654 32190',
      address: 'Koregaon Park, Pune',
      email: 'sugarbloom@foodreel.com',
      cuisineType: 'Artisan Bakery',
    },
  },
];

const Home = ({ initialTab = 'feed' }) => {
  const navigate = useNavigate();
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [activeTab, setActiveTab] = useState(initialTab); // 'feed' | 'saved' | 'dashboard'
  const [savedViewMode, setSavedViewMode] = useState('grid'); // 'grid' | 'reels'
  const [savedReelIds, setSavedReelIds] = useState([]);
  const [currentUser, setCurrentUser] = useState(authStorage.getUser());

  // Modals
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [commentReel, setCommentReel] = useState(null);

  const containerRef = useRef(null);
  const partner = authStorage.getPartner();
  const role = authStorage.getRole();

  // Load user data & saved reels from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('foodreel_saved');
      if (saved) setSavedReelIds(JSON.parse(saved));
    } catch {
      setSavedReelIds([]);
    }

    // Refresh user profile if token exists
    foodApi
      .getMeUser()
      .then((res) => {
        if (res?.user) {
          setCurrentUser(res.user);
          authStorage.setAuth({ user: res.user });
        }
      })
      .catch(() => {});
  }, []);

  // Fetch reels from backend
  const fetchFeed = async () => {
    setLoading(true);
    try {
      const res = await foodApi.getFeed();
      if (res && res.foodItems && res.foodItems.length > 0) {
        setReels(res.foodItems);
      } else {
        setReels(DEMO_REELS);
      }
    } catch (err) {
      console.warn('Backend reels fetch error, using initial demo reels:', err.message);
      setReels(DEMO_REELS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed();
  }, []);

  // Detect scroll to update activeIndex
  const handleScroll = () => {
    const container = containerRef.current;
    if (!container) return;

    const reelHeight = container.clientHeight;
    const scrollTop = container.scrollTop;
    const newIndex = Math.round(scrollTop / reelHeight);

    if (newIndex !== activeIndex && newIndex >= 0 && newIndex < displayReels.length) {
      setActiveIndex(newIndex);
    }
  };

  // Keyboard navigation Up & Down
  useEffect(() => {
    if (activeTab !== 'feed' && !(activeTab === 'saved' && savedViewMode === 'reels')) return;

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        scrollToIndex(activeIndex + 1);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        scrollToIndex(activeIndex - 1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex, reels, activeTab, savedViewMode]);

  const scrollToIndex = (index) => {
    if (index < 0 || index >= displayReels.length) return;
    const container = containerRef.current;
    if (container) {
      container.scrollTo({
        top: index * container.clientHeight,
        behavior: 'smooth',
      });
      setActiveIndex(index);
    }
  };

  const handleSaveToggle = (reel) => {
    const id = reel._id;
    let updated;
    if (savedReelIds.includes(id)) {
      updated = savedReelIds.filter((item) => item !== id);
    } else {
      updated = [...savedReelIds, id];
    }
    setSavedReelIds(updated);
    localStorage.setItem('foodreel_saved', JSON.stringify(updated));
  };

  const handleLogout = async () => {
    try {
      await axios.get('http://localhost:3000/api/auth/user/logout', {
        withCredentials: true,
      });
    } catch (e) {
      console.error('Logout error:', e);
    } finally {
      authStorage.clearAuth();
      navigate('/user/login');
    }
  };

  const savedReels = reels.filter((r) => savedReelIds.includes(r._id));

  const displayReels = activeTab === 'saved' && savedViewMode === 'reels'
    ? savedReels
    : reels;

  const currentReel = displayReels[activeIndex] || reels[0];

  const uniquePartners = Array.from(
    new Map(
      reels
        .filter((r) => r.foodPartner && r.foodPartner.name)
        .map((r) => [r.foodPartner.name, r.foodPartner])
    ).values()
  );

  return (
    <div className="min-h-screen bg-white text-black flex flex-col select-none">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 backdrop-blur-md bg-white/95 border-b border-gray-200">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-8 py-2.5 flex items-center justify-between">
          {/* Brand */}
          <button
            onClick={() => {
              setActiveTab('feed');
              setActiveIndex(0);
            }}
            className="flex items-center gap-2.5 font-black text-xl tracking-tight text-black no-underline bg-transparent border-0 cursor-pointer p-0"
          >
            <span className="w-9 h-9 rounded-xl bg-black text-white flex items-center justify-center shadow-sm">
              <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            </span>
            <span className="text-black font-extrabold tracking-tight">
              FoodReel
            </span>
          </button>

          {/* Center Tabs: Watch Feed vs Saved vs Dashboard */}
          <div className="flex items-center gap-1 bg-gray-100 border border-gray-300 p-1 rounded-xl">
            <button
              onClick={() => {
                setActiveTab('feed');
                setActiveIndex(0);
              }}
              className={`px-3 sm:px-4 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === 'feed'
                  ? 'bg-black text-white shadow-xs'
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              🔥 Watch Feed
            </button>
            <button
              onClick={() => {
                setActiveTab('saved');
              }}
              className={`px-3 sm:px-4 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'saved'
                  ? 'bg-black text-white shadow-xs'
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              <span>⭐ Saved</span>
              {savedReelIds.length > 0 && (
                <span className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold ${
                  activeTab === 'saved' ? 'bg-white text-black' : 'bg-gray-200 text-black'
                }`}>
                  {savedReelIds.length}
                </span>
              )}
            </button>
            <button
              onClick={() => {
                setActiveTab('dashboard');
              }}
              className={`px-3 sm:px-4 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'dashboard'
                  ? 'bg-black text-white shadow-xs'
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              <span>👤 Dashboard</span>
            </button>
          </div>

          {/* Right Menu */}
          <div className="flex items-center gap-3">
            {/* Sound Toggle (Feed Mode) */}
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 border border-gray-300 text-black flex items-center justify-center text-sm transition-colors cursor-pointer"
              title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            >
              {isMuted ? '🔇' : '🔊'}
            </button>

            {/* Partner Portal Shortcut */}
            {role === 'partner' ? (
              <Link
                to="/food-partner/home"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black text-white border border-black text-xs font-bold no-underline hover:bg-gray-800 transition-all shadow-xs"
              >
                <span>Partner Studio →</span>
              </Link>
            ) : (
              <Link
                to="/food-partner/login"
                className="hidden sm:inline text-xs text-gray-600 hover:text-black font-bold no-underline transition-colors"
              >
                Are you a restaurant?
              </Link>
            )}

            {/* User Profile / Dashboard Link */}
            <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
              <button
                onClick={() => setActiveTab('dashboard')}
                className="flex items-center gap-2 bg-transparent hover:bg-gray-100 p-1 pr-2 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-gray-200"
                title="View User Dashboard"
              >
                <div className="w-8 h-8 rounded-full bg-black text-white text-xs font-bold flex items-center justify-center shadow-xs">
                  {currentUser?.fullName ? currentUser.fullName[0].toUpperCase() : (partner?.name ? partner.name[0].toUpperCase() : 'U')}
                </div>
                <div className="hidden md:flex flex-col text-left">
                  <span className="text-xs font-bold text-black leading-tight max-w-[90px] truncate">
                    {currentUser?.fullName || 'Foodie'}
                  </span>
                  <span className="text-[10px] text-gray-500 font-semibold leading-tight">
                    Dashboard →
                  </span>
                </div>
              </button>
              <button
                onClick={handleLogout}
                className="text-xs text-black hover:bg-gray-100 px-2 py-1 rounded-lg border border-gray-300 transition-colors cursor-pointer font-medium"
                title="Sign Out"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* VIEW 1: USER DASHBOARD */}
      {activeTab === 'dashboard' && (
        <main className="dash-content" style={{ maxWidth: 1200, margin: '0 auto', width: '100%', padding: '32px 24px 64px' }}>
          {/* User Profile Card */}
          <section className="profile-card">
            <div className="profile-card-top">
              <div className="profile-identity">
                <div className="profile-avatar">
                  {currentUser?.fullName ? currentUser.fullName[0].toUpperCase() : '🍽️'}
                </div>
                <div className="profile-title-area">
                  <div className="profile-name-row">
                    <h1 className="profile-name">{currentUser?.fullName || 'Food Explorer'}</h1>
                    <span className="profile-verified-badge">
                      ● Verified Foodie
                    </span>
                  </div>
                  <p className="profile-subtitle">Personal Foodie Dashboard, Saved Delicacies & Taste Journey</p>
                </div>
              </div>

              <div className="profile-actions">
                <button
                  onClick={() => {
                    setActiveTab('feed');
                    setActiveIndex(0);
                  }}
                  className="btn-primary-gradient"
                >
                  <span>🔥 Watch Reels Feed</span>
                </button>
              </div>
            </div>

            {/* Metadata Pills */}
            <div className="profile-metadata-pills">
              <span className="meta-pill">
                ✉️ {currentUser?.email || 'user@foodreel.com'}
              </span>
              <span className="meta-pill">
                ⭐ {savedReelIds.length} Saved Delicacies
              </span>
              <span className="meta-pill meta-pill-accent">
                🍴 FoodReel Explorer Community
              </span>
            </div>
          </section>

          {/* Stats Grid */}
          <section className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{savedReelIds.length}</div>
              <div className="stat-label">Saved Dishes</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{reels.reduce((acc, r) => acc + (r.likes?.length || 0), 0)}</div>
              <div className="stat-label">Feed Engagement</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{uniquePartners.length}</div>
              <div className="stat-label">Partner Kitchens</div>
            </div>
            <div className="stat-card">
              <div className="stat-value" style={{ fontSize: '1.25rem' }}>Gourmet Connoisseur</div>
              <div className="stat-label">Taste Profile</div>
            </div>
          </section>

          {/* Saved Bookmarks Section */}
          <section className="reels-section">
            <div className="reels-header">
              <div>
                <h2 className="reels-title">⭐ Saved Delicacies ({savedReels.length})</h2>
                <p className="reels-subtitle">Dishes and restaurant signature specials bookmarked for your next meal</p>
              </div>

              {savedReels.length > 0 && (
                <button
                  onClick={() => {
                    setActiveTab('saved');
                    setSavedViewMode('reels');
                    setActiveIndex(0);
                  }}
                  className="reels-add-link"
                >
                  <span>📱 Play in Reel View →</span>
                </button>
              )}
            </div>

            {savedReels.length > 0 ? (
              <div className="reels-grid">
                {savedReels.map((dish) => (
                  <div key={dish._id} className="reel-card-item">
                    <div className="reel-video-container">
                      {dish.video ? (
                        <video src={dish.video} className="reel-video-el" muted playsInline />
                      ) : (
                        <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>🍲</div>
                      )}
                      {dish.price > 0 && (
                        <span className="reel-price-badge">₹{dish.price}</span>
                      )}
                      <span className="reel-likes-badge">♥ {dish.likes?.length || 0}</span>
                    </div>

                    <div className="reel-card-body">
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                          <h4 className="reel-item-name">{dish.name}</h4>
                          {dish.cuisine && (
                            <span style={{ fontSize: '11px', color: '#000000', backgroundColor: '#f3f4f6', border: '1px solid #e5e7eb', padding: '2px 8px', borderRadius: '4px', fontWeight: '700' }}>
                              {dish.cuisine}
                            </span>
                          )}
                        </div>

                        {dish.description && (
                          <p className="reel-item-desc">{dish.description}</p>
                        )}

                        {dish.foodPartner && (
                          <div style={{ marginTop: 8 }}>
                            <button
                              onClick={() => setSelectedPartner(dish.foodPartner)}
                              style={{ background: 'none', border: 'none', padding: 0, fontSize: 12, fontWeight: 700, color: '#000000', cursor: 'pointer', textDecoration: 'underline' }}
                            >
                              📍 {dish.foodPartner.name}
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="reel-card-footer">
                        <button
                          onClick={() => {
                            const idx = reels.findIndex((r) => r._id === dish._id);
                            if (idx !== -1) {
                              setActiveTab('feed');
                              setTimeout(() => scrollToIndex(idx), 50);
                            }
                          }}
                          className="btn-primary-gradient"
                          style={{ padding: '6px 14px', fontSize: 12, height: 'auto' }}
                        >
                          ▶ Watch Reel
                        </button>

                        <button
                          onClick={() => handleSaveToggle(dish)}
                          className="reel-delete-btn"
                          title="Remove from saved"
                        >
                          ✕ Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-reels-box">
                <div className="empty-icon-circle">⭐</div>
                <h3 className="empty-title">No Saved Dishes Yet</h3>
                <p className="empty-desc">
                  Browse through reels and tap the bookmark button on any dish to save it here in your personal foodie collection.
                </p>
                <button
                  onClick={() => {
                    setActiveTab('feed');
                    setActiveIndex(0);
                  }}
                  className="btn-primary-gradient"
                >
                  🔥 Browse Food Reels
                </button>
              </div>
            )}
          </section>

          {/* Verified Partner Kitchens Directory */}
          <section className="reels-section" style={{ marginTop: 20 }}>
            <div className="reels-header">
              <div>
                <h2 className="reels-title">🍽️ Verified Partner Kitchens</h2>
                <p className="reels-subtitle">Discover curated local restaurants and artisan kitchens with video menus</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
              {uniquePartners.map((p, idx) => (
                <div key={p.name || idx} style={{ border: '1.5px solid #e5e7eb', borderRadius: 16, padding: 18, backgroundColor: '#ffffff', display: 'flex', flexDirection: 'column', gap: 12, boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: '#000000', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 18 }}>
                      {p.name ? p.name[0].toUpperCase() : '🍽️'}
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: '#000000' }}>{p.name}</h4>
                      <span style={{ fontSize: 11, color: '#6b7280' }}>📍 {p.address || 'FoodReel Partner'}</span>
                    </div>
                  </div>

                  <div style={{ fontSize: 12, color: '#4b5563' }}>
                    <span>Specialty: <strong style={{ color: '#000000' }}>{p.cuisineType || 'Specialty Kitchen'}</strong></span>
                  </div>

                  <button
                    onClick={() => setSelectedPartner(p)}
                    className="btn-secondary"
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    <span>View Kitchen Profile & Reels →</span>
                  </button>
                </div>
              ))}
            </div>
          </section>
        </main>
      )}

      {/* VIEW 2: SAVED DISHES COLLECTION (GRID & REELS TOGGLE) */}
      {activeTab === 'saved' && (
        <main className="dash-content" style={{ maxWidth: 1200, margin: '0 auto', width: '100%', padding: '32px 24px 64px' }}>
          <section className="reels-section">
            <div className="reels-header">
              <div>
                <h2 className="reels-title">⭐ Your Saved Collection ({savedReels.length})</h2>
                <p className="reels-subtitle">Revisit your favorite bookmarked delicacies at any time</p>
              </div>

              {savedReels.length > 0 && (
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => setSavedViewMode('grid')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer border ${
                      savedViewMode === 'grid' ? 'bg-black text-white border-black' : 'bg-white text-black border-gray-300'
                    }`}
                  >
                    🖼️ Grid Gallery
                  </button>
                  <button
                    onClick={() => setSavedViewMode('reels')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer border ${
                      savedViewMode === 'reels' ? 'bg-black text-white border-black' : 'bg-white text-black border-gray-300'
                    }`}
                  >
                    📱 Reel Player
                  </button>
                </div>
              )}
            </div>

            {savedReels.length === 0 ? (
              <div className="empty-reels-box">
                <div className="empty-icon-circle">⭐</div>
                <h3 className="empty-title">No Saved Dishes Yet</h3>
                <p className="empty-desc">
                  Tap the bookmark icon on any dish while watching food reels to add it to your saved collection.
                </p>
                <button
                  onClick={() => {
                    setActiveTab('feed');
                    setActiveIndex(0);
                  }}
                  className="btn-primary-gradient"
                >
                  🔥 Browse Reels Feed
                </button>
              </div>
            ) : savedViewMode === 'grid' ? (
              <div className="reels-grid">
                {savedReels.map((dish) => (
                  <div key={dish._id} className="reel-card-item">
                    <div className="reel-video-container">
                      {dish.video ? (
                        <video src={dish.video} className="reel-video-el" muted playsInline />
                      ) : (
                        <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>🍲</div>
                      )}
                      {dish.price > 0 && (
                        <span className="reel-price-badge">₹{dish.price}</span>
                      )}
                      <span className="reel-likes-badge">♥ {dish.likes?.length || 0}</span>
                    </div>

                    <div className="reel-card-body">
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                          <h4 className="reel-item-name">{dish.name}</h4>
                          {dish.cuisine && (
                            <span style={{ fontSize: '11px', color: '#000000', backgroundColor: '#f3f4f6', border: '1px solid #e5e7eb', padding: '2px 8px', borderRadius: '4px', fontWeight: '700' }}>
                              {dish.cuisine}
                            </span>
                          )}
                        </div>

                        {dish.description && (
                          <p className="reel-item-desc">{dish.description}</p>
                        )}

                        {dish.foodPartner && (
                          <div style={{ marginTop: 8 }}>
                            <button
                              onClick={() => setSelectedPartner(dish.foodPartner)}
                              style={{ background: 'none', border: 'none', padding: 0, fontSize: 12, fontWeight: 700, color: '#000000', cursor: 'pointer', textDecoration: 'underline' }}
                            >
                              📍 {dish.foodPartner.name}
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="reel-card-footer">
                        <button
                          onClick={() => {
                            const idx = reels.findIndex((r) => r._id === dish._id);
                            if (idx !== -1) {
                              setActiveTab('feed');
                              setTimeout(() => scrollToIndex(idx), 50);
                            }
                          }}
                          className="btn-primary-gradient"
                          style={{ padding: '6px 14px', fontSize: 12, height: 'auto' }}
                        >
                          ▶ Watch Reel
                        </button>

                        <button
                          onClick={() => handleSaveToggle(dish)}
                          className="reel-delete-btn"
                          title="Remove from saved"
                        >
                          ✕ Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Saved Reel Player Mode */
              <div className="relative w-full h-[calc(100vh-180px)] flex items-center justify-center">
                <div
                  ref={containerRef}
                  onScroll={handleScroll}
                  className="w-full sm:max-w-[420px] md:max-w-[440px] h-full sm:h-[94%] sm:my-auto sm:rounded-3xl overflow-y-scroll snap-y snap-mandatory border-0 sm:border sm:border-gray-300 shadow-2xl relative bg-black no-scrollbar"
                  style={{ scrollBehavior: 'smooth' }}
                >
                  {savedReels.map((reel, index) => (
                    <div
                      key={reel._id || index}
                      className="w-full h-full snap-start snap-always shrink-0 relative"
                    >
                      <ReelCard
                        reel={reel}
                        isActive={index === activeIndex}
                        isMuted={isMuted}
                        onToggleMute={() => setIsMuted(!isMuted)}
                        onOpenRestaurant={(p) => setSelectedPartner(p)}
                        onOpenComments={(r) => setCommentReel(r)}
                        onSaveToggle={handleSaveToggle}
                        isSaved={true}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        </main>
      )}

      {/* VIEW 3: IMMERSIVE REELS FEED */}
      {activeTab === 'feed' && (
        <main className="flex-1 relative flex items-center justify-center overflow-hidden bg-white">
          {loading ? (
            <div className="flex flex-col items-center justify-center gap-4 text-gray-500 py-32">
              <div className="w-12 h-12 rounded-full border-4 border-gray-300 border-t-black animate-spin" />
              <p className="text-sm font-bold tracking-wide text-black">Cooking up tasty food reels...</p>
            </div>
          ) : (
            <div className="relative w-full h-[calc(100vh-62px)] flex items-center justify-center">
              {/* Desktop Left Info Companion */}
              {currentReel && (
                <div className="hidden xl:flex flex-col gap-4 absolute left-12 top-1/2 -translate-y-1/2 z-20 w-72 bg-white border border-gray-200 rounded-2xl p-5 shadow-lg">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Currently Tasting</span>
                    <h3 className="text-base font-extrabold text-black mt-1 leading-snug">{currentReel.name}</h3>
                    <div className="flex items-center gap-2 mt-2">
                      {currentReel.price > 0 && (
                        <span className="bg-black text-white text-xs font-bold px-2 py-0.5 rounded-md">
                          ₹{currentReel.price}
                        </span>
                      )}
                      <span className="text-xs text-gray-600 font-semibold">
                        {currentReel.cuisine || 'Specialty'}
                      </span>
                    </div>
                  </div>

                  {currentReel.foodPartner && (
                    <div className="pt-3 border-t border-gray-100">
                      <p className="text-xs text-gray-500">By Kitchen:</p>
                      <p className="text-xs font-bold text-black">{currentReel.foodPartner.name}</p>
                      <button
                        onClick={() => setSelectedPartner(currentReel.foodPartner)}
                        className="mt-2 text-xs font-bold text-black hover:underline cursor-pointer flex items-center gap-1"
                      >
                        <span>🍽️ View Full Menu</span>
                        <span>→</span>
                      </button>
                    </div>
                  )}

                  <div className="pt-2 text-[11px] text-gray-400">
                    💡 Tip: Use keyboard ▲ / ▼ arrow keys or swipe to explore
                  </div>
                </div>
              )}

              {/* Reels Phone Frame Container */}
              <div
                ref={containerRef}
                onScroll={handleScroll}
                className="w-full sm:max-w-[420px] md:max-w-[440px] h-full sm:h-[94%] sm:my-auto sm:rounded-3xl overflow-y-scroll snap-y snap-mandatory border-0 sm:border sm:border-gray-300 shadow-2xl relative bg-black no-scrollbar"
                style={{ scrollBehavior: 'smooth' }}
              >
                {displayReels.map((reel, index) => (
                  <div
                    key={reel._id || index}
                    className="w-full h-full snap-start snap-always shrink-0 relative"
                  >
                    <ReelCard
                      reel={reel}
                      isActive={index === activeIndex}
                      isMuted={isMuted}
                      onToggleMute={() => setIsMuted(!isMuted)}
                      onOpenRestaurant={(p) => setSelectedPartner(p)}
                      onOpenComments={(r) => setCommentReel(r)}
                      onSaveToggle={handleSaveToggle}
                      isSaved={savedReelIds.includes(reel._id)}
                    />
                  </div>
                ))}
              </div>

              {/* Desktop Quick Nav Controls (Up & Down Buttons) */}
              <div className="hidden lg:flex flex-col gap-3 absolute right-10 xl:right-16 top-1/2 -translate-y-1/2 z-20">
                <button
                  onClick={() => scrollToIndex(activeIndex - 1)}
                  disabled={activeIndex === 0}
                  className="w-11 h-11 rounded-2xl bg-white hover:bg-gray-100 border border-gray-300 text-black flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed shadow-md transition-all cursor-pointer font-bold"
                  title="Previous Reel (Up Arrow)"
                >
                  ▲
                </button>
                <div className="text-center font-extrabold text-xs text-black py-1">
                  {activeIndex + 1} / {displayReels.length}
                </div>
                <button
                  onClick={() => scrollToIndex(activeIndex + 1)}
                  disabled={activeIndex === displayReels.length - 1}
                  className="w-11 h-11 rounded-2xl bg-white hover:bg-gray-100 border border-gray-300 text-black flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed shadow-md transition-all cursor-pointer font-bold"
                  title="Next Reel (Down Arrow)"
                >
                  ▼
                </button>
              </div>
            </div>
          )}
        </main>
      )}

      {/* Restaurant Details Modal */}
      {selectedPartner && (
        <RestaurantModal
          partner={selectedPartner}
          onClose={() => setSelectedPartner(null)}
          onSelectDish={(dish) => {
            const idx = reels.findIndex((r) => r._id === dish._id);
            if (idx !== -1) {
              setActiveTab('feed');
              setTimeout(() => scrollToIndex(idx), 50);
            }
          }}
        />
      )}

      {/* Comments Drawer Modal */}
      {commentReel && (
        <CommentsModal
          reelId={commentReel._id}
          dishName={commentReel.name}
          onClose={() => setCommentReel(null)}
        />
      )}
    </div>
  );
};

export default Home;