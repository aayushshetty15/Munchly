import React from 'react';
import { useNavigate } from 'react-router-dom';

const RoleToggle = ({ activeRole = 'user', type = 'register', onToggle }) => {
  const navigate = useNavigate();
  const isRegister = type === 'register';
  const isUser = activeRole === 'user';

  const handleSelect = (role) => {
    if (role === activeRole) return;
    const targetPath = isRegister
      ? (role === 'user' ? '/user/register' : '/food-partner/register')
      : (role === 'user' ? '/user/login' : '/food-partner/login');

    if (onToggle) {
      onToggle(role);
    } else {
      navigate(targetPath);
    }
  };

  return (
    <div
      className="relative mb-6 w-full h-12 p-1 bg-gray-100 rounded-full border border-gray-300 flex items-center select-none"
      role="tablist"
      aria-label="Select account type"
    >
      {/* Sliding pill indicator */}
      <div
        className={`absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] rounded-full bg-white shadow-sm border border-gray-300 transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] pointer-events-none ${
          isUser ? 'translate-x-0' : 'translate-x-full'
        }`}
      />

      {/* User Option */}
      <button
        type="button"
        onClick={() => handleSelect('user')}
        className={`relative z-10 flex-1 h-full flex items-center justify-center gap-2 text-sm rounded-full transition-colors duration-200 cursor-pointer outline-none border-none bg-transparent ${
          isUser
            ? 'text-black font-extrabold'
            : 'text-gray-500 hover:text-black font-semibold'
        }`}
        role="tab"
        aria-selected={isUser}
      >
        <svg
          className="w-4 h-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
        <span>User</span>
      </button>

      {/* Food Partner Option */}
      <button
        type="button"
        onClick={() => handleSelect('partner')}
        className={`relative z-10 flex-1 h-full flex items-center justify-center gap-2 text-sm rounded-full transition-colors duration-200 cursor-pointer outline-none border-none bg-transparent ${
          !isUser
            ? 'text-black font-extrabold'
            : 'text-gray-500 hover:text-black font-semibold'
        }`}
        role="tab"
        aria-selected={!isUser}
      >
        <svg
          className="w-4 h-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
          <path d="M7 2v20" />
          <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
        </svg>
        <span>Food Partner</span>
      </button>
    </div>
  );
};

export default RoleToggle;
