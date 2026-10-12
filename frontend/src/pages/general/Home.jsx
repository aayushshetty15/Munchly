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

const Home = () => {
  const navigate = useNavigate();
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [activeTab, setActiveTab] = useState('feed'); // 'feed' | 'saved'
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
  }, [activeIndex, reels, activeTab, savedReelIds]);

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

  const displayReels = activeTab === 'saved'
    ? savedReels
    : reels;

  return (
    <div className="min-h-screen bg-white text-black flex flex-col overflow-hidden select-none">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 backdrop-blur-md bg-white/95 border-b border-gray-200">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-8 py-2.5 flex items-center justify-between">
          {/* Brand */}
          <Link
            to="/home"
            onClick={() => {
              setActiveTab('feed');
              setActiveIndex(0);
            }}
            className="flex items-center gap-2.5 font-black text-xl tracking-tight text-black no-underline"
          >
            <span className="w-9 h-9 rounded-xl bg-black text-white flex items-center justify-center shadow-sm">
              <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            </span>
            <span className="text-black font-extrabold tracking-tight">
              FoodReel
            </span>
          </Link>

          {/* Center Tabs: For You vs Saved */}
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
              🔥 For You
            </button>
            <button
              onClick={() => {
                setActiveTab('saved');
                setActiveIndex(0);
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
          </div>

          {/* Right Menu */}
          <div className="flex items-center gap-3">
            {/* Sound Toggle */}
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

            {/* User Profile / Logout */}
            <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
              <div
                className="w-8 h-8 rounded-full bg-black text-white text-xs font-bold flex items-center justify-center shadow-xs"
                title={currentUser?.fullName || 'Food Explorer'}
              >
                {currentUser?.fullName ? currentUser.fullName[0].toUpperCase() : (partner?.name ? partner.name[0].toUpperCase() : 'U')}
              </div>
              <button
                onClick={handleLogout}
                className="text-xs text-black hover:bg-gray-100 px-2.5 py-1.5 rounded-lg border border-gray-300 transition-colors cursor-pointer font-medium"
                title="Sign Out"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Reels Viewport */}
      <main className="flex-1 relative flex items-center justify-center overflow-hidden bg-white">
        {loading ? (
          <div className="flex flex-col items-center justify-center gap-4 text-gray-500 py-32">
            <div className="w-12 h-12 rounded-full border-4 border-gray-300 border-t-black animate-spin" />
            <p className="text-sm font-bold tracking-wide text-black">Cooking up tasty food reels...</p>
          </div>
        ) : displayReels.length === 0 ? (
          <div className="text-center p-8 max-w-sm">
            <div className="w-16 h-16 rounded-3xl bg-gray-100 border border-gray-300 text-3xl flex items-center justify-center mx-auto mb-4">
              ⭐
            </div>
            <h3 className="font-extrabold text-base text-black mb-2">No Saved Reels Yet</h3>
            <p className="text-xs text-gray-600 mb-6 leading-relaxed">
              Bookmark mouthwatering food reels you love by tapping the bookmark icon while watching!
            </p>
            <button
              onClick={() => {
                setActiveTab('feed');
                setActiveIndex(0);
              }}
              className="px-5 py-2.5 rounded-xl bg-black hover:bg-gray-800 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              Browse For You Feed
            </button>
          </div>
        ) : (
          <div className="relative w-full h-[calc(100vh-62px)] flex items-center justify-center overflow-hidden">
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
          </div>
        )}
      </main>

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