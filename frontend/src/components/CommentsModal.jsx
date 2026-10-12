import React, { useState, useEffect } from 'react';
import { authStorage } from '../services/api';

const CommentsModal = ({ reelId, dishName, onClose }) => {
  const user = authStorage.getUser() || authStorage.getPartner();
  const userName = user?.fullName || user?.name || 'Food Explorer';

  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  // Load comments from localStorage keyed by reelId
  useEffect(() => {
    const key = `comments_${reelId}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        setComments(JSON.parse(saved));
      } catch {
        setComments([]);
      }
    } else {
      setComments([
        {
          id: 'c1',
          author: 'Priya Sharma',
          text: 'This looks so rich and authentic! Definitely trying this place out. 🤤🔥',
          time: '2h ago',
        },
        {
          id: 'c2',
          author: 'Rohit Verma',
          text: 'Tried their specialty yesterday, the quality and taste are unmatched!',
          time: '5h ago',
        },
      ]);
    }
  }, [reelId]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const commentObj = {
      id: Date.now().toString(),
      author: userName,
      text: newComment.trim(),
      time: 'Just now',
    };

    const updated = [commentObj, ...comments];
    setComments(updated);
    localStorage.setItem(`comments_${reelId}`, JSON.stringify(updated));
    setNewComment('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-md bg-white border border-gray-200 rounded-t-3xl sm:rounded-3xl max-h-[85vh] h-[520px] flex flex-col shadow-2xl text-black overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-white">
          <div>
            <h3 className="font-extrabold text-sm text-black">Food Reviews & Chat</h3>
            <p className="text-[11px] text-gray-500 truncate max-w-[280px]">For: {dishName}</p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 text-black border border-gray-300 flex items-center justify-center text-xs transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Comments Feed */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-white">
          {comments.map((c) => (
            <div key={c.id} className="flex gap-3 text-xs">
              <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center text-white font-bold shrink-0 text-xs">
                {c.author ? c.author[0].toUpperCase() : 'U'}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-black">{c.author}</span>
                  <span className="text-[10px] text-gray-400">{c.time}</span>
                </div>
                <p className="text-gray-800 mt-1 leading-relaxed">{c.text}</p>
              </div>
            </div>
          ))}

          {comments.length === 0 && (
            <div className="py-12 text-center text-gray-500 text-xs">
              No comments yet. Be the first to share your review!
            </div>
          )}
        </div>

        {/* Input Field */}
        <form onSubmit={handleSubmit} className="p-3 border-t border-gray-200 bg-white flex gap-2">
          <input
            type="text"
            placeholder="Share your foodie feedback..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="flex-1 bg-white border border-gray-300 rounded-xl px-3.5 py-2 text-xs text-black placeholder-gray-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
          />
          <button
            type="submit"
            disabled={!newComment.trim()}
            className="px-4 py-2 bg-black hover:bg-gray-800 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
          >
            Post
          </button>
        </form>
      </div>
    </div>
  );
};

export default CommentsModal;
