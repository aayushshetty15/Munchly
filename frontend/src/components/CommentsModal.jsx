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
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="comments-modal-container"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="comments-modal-header">
          <div>
            <h3 className="comments-modal-title">Food Reviews & Chat</h3>
            <p className="comments-modal-subtitle">For: {dishName}</p>
          </div>
          <button
            onClick={onClose}
            className="modal-close-btn"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Comments Feed */}
        <div className="comments-list">
          {comments.map((c) => (
            <div key={c.id} className="comment-item">
              <div className="comment-avatar">
                {c.author ? c.author[0].toUpperCase() : 'U'}
              </div>
              <div className="comment-bubble">
                <div className="comment-header-row">
                  <span className="comment-author-name">{c.author}</span>
                  <span className="comment-time">{c.time}</span>
                </div>
                <p className="comment-text">{c.text}</p>
              </div>
            </div>
          ))}

          {comments.length === 0 && (
            <div className="comments-empty-state">
              <span style={{ fontSize: 24 }}>💬</span>
              <span>No comments yet. Be the first to share your review!</span>
            </div>
          )}
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="comments-footer-form">
          <input
            type="text"
            placeholder="Share your foodie feedback..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="comments-input"
          />
          <button
            type="submit"
            disabled={!newComment.trim()}
            className="comments-post-btn"
          >
            Post
          </button>
        </form>
      </div>
    </div>
  );
};

export default CommentsModal;
