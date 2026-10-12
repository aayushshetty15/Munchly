import React, { useRef, useState, useEffect } from 'react';
import { foodApi } from '../services/api';

const ReelCard = ({
  reel,
  isActive,
  isMuted,
  onToggleMute,
  onOpenRestaurant,
  onOpenComments,
  onSaveToggle,
  isSaved,
}) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showPlayIcon, setShowPlayIcon] = useState(false);
  const [showDoubleTapHeart, setShowDoubleTapHeart] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(reel.likes?.length || 0);
  const [progress, setProgress] = useState(0);
  const [expandedDesc, setExpandedDesc] = useState(false);
  const [copyToast, setCopyToast] = useState(false);

  const lastTapRef = useRef(0);

  // Auto-play when active, pause when inactive
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isActive) {
      video.currentTime = 0;
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsPlaying(true))
          .catch((err) => {
            console.log('Autoplay interaction pending:', err);
            setIsPlaying(false);
          });
      }
    } else {
      video.pause();
      setIsPlaying(false);
    }
  }, [isActive]);

  // Handle mute state
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  // Scrubber progress update
  const handleTimeUpdate = () => {
    if (videoRef.current && videoRef.current.duration) {
      const current = videoRef.current.currentTime;
      const total = videoRef.current.duration;
      setProgress((current / total) * 100);
    }
  };

  // Tap handling: single tap toggles play/pause, double tap triggers heart like
  const handleVideoTap = () => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;

    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      triggerLikeEffect();
      lastTapRef.current = 0;
    } else {
      lastTapRef.current = now;
      setTimeout(() => {
        if (lastTapRef.current === now) {
          togglePlayPause();
        }
      }, DOUBLE_TAP_DELAY);
    }
  };

  const togglePlayPause = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
      setShowPlayIcon('play');
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
      setShowPlayIcon('pause');
    }
    setTimeout(() => setShowPlayIcon(false), 700);
  };

  const triggerLikeEffect = async () => {
    setShowDoubleTapHeart(true);
    setTimeout(() => setShowDoubleTapHeart(false), 900);

    if (!liked) {
      setLiked(true);
      setLikesCount((prev) => prev + 1);
      try {
        if (reel._id) {
          await foodApi.toggleLike(reel._id);
        }
      } catch (err) {
        console.error('Like error:', err);
      }
    }
  };

  const handleLikeClick = async (e) => {
    e.stopPropagation();
    const newLiked = !liked;
    setLiked(newLiked);
    setLikesCount((prev) => (newLiked ? prev + 1 : Math.max(0, prev - 1)));

    try {
      if (reel._id) {
        await foodApi.toggleLike(reel._id);
      }
    } catch (err) {
      console.error('Toggle like error:', err);
    }
  };

  const handleShare = (e) => {
    e.stopPropagation();
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: reel.name,
        text: `Check out ${reel.name} on FoodReel!`,
        url: url,
      }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(url);
      setCopyToast(true);
      setTimeout(() => setCopyToast(false), 2000);
    }
  };

  const partner = reel.foodPartner || {
    name: 'Featured Restaurant',
    address: 'FoodReel Hub',
    phone: '',
  };

  return (
    <div className="relative w-full h-full bg-black flex items-center justify-center overflow-hidden select-none">
      {/* Background Reel Video */}
      <video
        ref={videoRef}
        src={reel.video}
        className="w-full h-full object-cover cursor-pointer"
        loop
        playsInline
        muted={isMuted}
        preload="metadata"
        onClick={handleVideoTap}
        onTimeUpdate={handleTimeUpdate}
      />

      {/* Aesthetic readability gradients */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-black/40 via-transparent to-black/80" />

      {/* Floating Center Double-tap Heart */}
      {showDoubleTapHeart && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
          <svg className="w-24 h-24 text-red-500 fill-red-500 drop-shadow-2xl animate-ping" viewBox="0 0 24 24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </div>
      )}

      {/* Play/Pause Center Indicator */}
      {showPlayIcon && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
          <div className="w-16 h-16 rounded-full bg-black/60 backdrop-blur-md text-white flex items-center justify-center text-2xl transition-opacity">
            {showPlayIcon === 'play' ? '▶' : '❚❚'}
          </div>
        </div>
      )}

      {/* Copy Toast */}
      {copyToast && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-40 bg-black text-white font-semibold text-xs px-4 py-2 rounded-full shadow-lg border border-gray-700">
          ✓ Link copied to clipboard!
        </div>
      )}

      {/* Mute / Unmute Floating Badge */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleMute();
        }}
        className="absolute top-4 left-4 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-md text-white text-xs border border-white/10 transition-all cursor-pointer"
        aria-label="Toggle Sound"
      >
        <span>{isMuted ? '🔇 Muted' : '🔊 Sound On'}</span>
      </button>

      {/* Right Action Column */}
      <div className="absolute right-3 sm:right-5 bottom-24 z-20 flex flex-col items-center gap-4 text-white">
        {/* Restaurant Avatar Shortcut */}
        <button 
          className="reel-side-btn" 
          onClick={(e) => { e.stopPropagation(); onOpenRestaurant(partner); }}
          title="View Restaurant Profile"
        >
          <div className="relative">
            {partner.profileImage ? (
              <img
                src={partner.profileImage}
                alt={partner.name}
                className="w-11 h-11 rounded-full object-cover border-2 border-white shadow-lg"
              />
            ) : (
              <div className="w-11 h-11 rounded-full bg-white text-black flex items-center justify-center font-bold text-sm border-2 border-white shadow-lg">
                {partner.name ? partner.name[0].toUpperCase() : '🍽️'}
              </div>
            )}
            <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-black text-white text-[10px] font-black flex items-center justify-center border border-white">
              +
            </span>
          </div>
          <span className="reel-side-label">Profile</span>
        </button>

        {/* Like Button */}
        <button
          onClick={handleLikeClick}
          className="reel-side-btn"
          aria-label="Like"
        >
          <div className={`reel-side-icon-circle ${
            liked ? 'bg-red-500/20 text-red-500 border-red-500 scale-110' : ''
          }`}>
            <svg
              className={`w-5 h-5 transition-all ${liked ? 'fill-red-500 stroke-red-500' : 'stroke-white fill-none'}`}
              viewBox="0 0 24 24"
              strokeWidth="2"
            >
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </div>
          <span className="reel-side-label">{likesCount}</span>
        </button>

        {/* Comments Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpenComments(reel);
          }}
          className="reel-side-btn"
          aria-label="Reviews"
        >
          <div className="reel-side-icon-circle">
            <svg className="w-5 h-5 stroke-white fill-none" viewBox="0 0 24 24" strokeWidth="2">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
            </svg>
          </div>
          <span className="reel-side-label">Chat</span>
        </button>

        {/* Bookmark / Save Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSaveToggle(reel);
          }}
          className="reel-side-btn"
          aria-label="Save"
        >
          <div className={`reel-side-icon-circle ${
            isSaved ? 'bg-white text-black border-white scale-110' : ''
          }`}>
            <svg
              className={`w-5 h-5 transition-all ${isSaved ? 'fill-black stroke-black' : 'stroke-white fill-none'}`}
              viewBox="0 0 24 24"
              strokeWidth="2"
            >
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <span className="reel-side-label">{isSaved ? 'Saved' : 'Save'}</span>
        </button>

        {/* Share Button */}
        <button
          onClick={handleShare}
          className="reel-side-btn"
          aria-label="Share"
        >
          <div className="reel-side-icon-circle">
            <svg className="w-5 h-5 stroke-white fill-none" viewBox="0 0 24 24" strokeWidth="2">
              <circle cx="18" cy="5" r="3" />
              <circle cx="6" cy="12" r="3" />
              <circle cx="18" cy="19" r="3" />
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
            </svg>
          </div>
          <span className="reel-side-label">Share</span>
        </button>
      </div>

      {/* Bottom Info Overlay */}
      <div className="absolute left-4 right-18 bottom-6 z-20 text-white">
        {/* Partner Name Pill */}
        <div
          onClick={(e) => {
            e.stopPropagation();
            onOpenRestaurant(partner);
          }}
          className="inline-flex items-center gap-2 cursor-pointer bg-black/40 hover:bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 transition-colors mb-2.5"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-bold text-xs tracking-tight text-white">{partner.name}</span>
          <span className="text-[10px] text-amber-400 font-semibold">★ Restaurant</span>
        </div>

        {/* Dish Title & Price */}
        <div className="flex items-center gap-2 flex-wrap mb-1.5">
          <h2 className="text-base sm:text-lg font-black tracking-tight drop-shadow-md text-white">
            {reel.name}
          </h2>
          {reel.price > 0 && (
            <span className="bg-white text-black font-black text-xs px-2.5 py-0.5 rounded-lg shadow-sm border border-white">
              ₹{reel.price}
            </span>
          )}
          {reel.cuisine && (
            <span className="text-[11px] font-bold text-white bg-black/60 border border-white/20 px-2 py-0.5 rounded-md">
              #{reel.cuisine.replace(/\s+/g, '')}
            </span>
          )}
        </div>

        {/* Description */}
        {reel.description && (
          <p className="text-xs text-slate-200 leading-relaxed drop-shadow max-w-sm mb-3">
            {expandedDesc ? reel.description : `${reel.description.slice(0, 90)}`}
            {reel.description.length > 90 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setExpandedDesc(!expandedDesc);
                }}
                className="ml-1 text-white font-bold hover:underline cursor-pointer"
              >
                {expandedDesc ? ' less' : '... more'}
              </button>
            )}
          </p>
        )}

        {/* View Restaurant Action Button */}
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenRestaurant(partner);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-gray-100 text-black font-extrabold text-xs shadow-lg transition-all cursor-pointer"
          >
            <span>🍽️ View Restaurant Profile</span>
            <span>→</span>
          </button>
        </div>
      </div>

      {/* Bottom Scrubber Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 z-30">
        <div
          className="h-full bg-white transition-all duration-100"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export default ReelCard;
