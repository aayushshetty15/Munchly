import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import RoleToggle from '../../components/RoleToggle';
import '../../styles/auth.css';

const UserRegister = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await axios.post(
        'http://localhost:3000/api/auth/user/register',
        {
          fullName: formData.fullName,
          email: formData.email,
          password: formData.password,
        },
        { withCredentials: true }
      );

      setSuccess(response.data.message || 'User registered successfully!');
      setTimeout(() => {
        navigate('/user/login');
      }, 1500);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Registration failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

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
          <h1 className="auth-title">Create your account</h1>
          <p className="auth-subtitle">Join the foodie community to watch, savor, and share</p>
        </div>

        <RoleToggle activeRole="user" type="register" />

        {error && (
          <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-200">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 text-sm text-green-700 bg-green-50 rounded-lg border border-green-200">
            {success}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="user-fullname">
              Full Name
            </label>
            <div className="form-input-container">
              <input
                id="user-fullname"
                name="fullName"
                type="text"
                required
                value={formData.fullName}
                onChange={handleChange}
                className="form-input"
                placeholder="Jane Doe"
                autoComplete="name"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="user-email">
              Email Address
            </label>
            <div className="form-input-container">
              <input
                id="user-email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="form-input"
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="user-password">
              Password
            </label>
            <div className="form-input-container">
              <input
                id="user-password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="form-input"
                placeholder="At least 6 characters"
                autoComplete="new-password"
              />
            </div>
          </div>

          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? 'Registering...' : 'Create Account'}
          </button>
        </form>

        <div className="auth-footer">
          <p className="auth-footer-text">
            Already have an account?{' '}
            <Link to="/user/login" className="auth-link">
              Sign in
            </Link>
          </p>

          <div className="portal-switch-box">
            <span>Own a kitchen or restaurant?</span>
            <Link to="/food-partner/register" className="portal-switch-link">
              Partner Sign up →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserRegister;
