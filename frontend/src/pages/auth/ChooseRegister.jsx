import React from 'react';
import { Link } from 'react-router-dom';
import '../../styles/auth.css';

const ChooseRegister = () => {
  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-brand-row">
            <Link to="/" className="auth-logo">
              <span className="auth-logo-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="5 3 19 12 5 21 5 3" fill="currentColor" />
                </svg>
              </span>
              <span>FoodReel</span>
            </Link>
          </div>
          <h1 className="auth-title">Join FoodReel</h1>
          <p className="auth-subtitle">Select how you would like to get started</p>
        </div>

        <div className="flex flex-col gap-4 mb-6">
          {/* User Option Card */}
          <Link
            to="/user/register"
            className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 bg-white hover:border-black transition-all group cursor-pointer text-left no-underline text-inherit shadow-xs"
          >
            <div className="w-12 h-12 rounded-xl bg-gray-100 text-black flex items-center justify-center shrink-0 group-hover:bg-black group-hover:text-white transition-all">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <div className="flex-1">
              <div className="font-bold text-black flex items-center justify-between">
                <span>Food Enthusiast / User</span>
                <span className="text-black group-hover:translate-x-1 transition-transform">→</span>
              </div>
              <p className="text-xs text-gray-600 mt-0.5">
                Watch curated food reels, discover hidden gems, and save your favorite dishes.
              </p>
            </div>
          </Link>

          {/* Food Partner Option Card */}
          <Link
            to="/food-partner/register"
            className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 bg-white hover:border-black transition-all group cursor-pointer text-left no-underline text-inherit shadow-xs"
          >
            <div className="w-12 h-12 rounded-xl bg-gray-100 text-black flex items-center justify-center shrink-0 group-hover:bg-black group-hover:text-white transition-all">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
                <path d="M7 2v20" />
                <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
              </svg>
            </div>
            <div className="flex-1">
              <div className="font-bold text-black flex items-center justify-between">
                <span>Food Partner / Kitchen</span>
                <span className="text-black group-hover:translate-x-1 transition-transform">→</span>
              </div>
              <p className="text-xs text-gray-600 mt-0.5">
                Showcase your specials, gain visibility, and attract hungry foodies to your venue.
              </p>
            </div>
          </Link>
        </div>

        <div className="auth-footer">
          <p className="auth-footer-text">
            Already have an account?{' '}
            <Link to="/user/login" className="auth-link">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChooseRegister;
