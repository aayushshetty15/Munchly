import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import RoleToggle from '../../components/RoleToggle';
import '../../styles/auth.css';

const FoodPartnerRegister = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    contactName: '',
    phone: '',
    address: '',
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
        'http://localhost:3000/api/auth/food-partner/register',
        {
          name: formData.name,
          contactName: formData.contactName,
          phone: formData.phone,
          address: formData.address,
          email: formData.email,
          password: formData.password,
        },
        { withCredentials: true } //save cookies
      );

      setSuccess(response.data.message || 'Food Partner registered successfully!');
      setTimeout(() => {
        navigate('/food-partner/login');
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
              <span>Munchly</span>
            </Link>
            <span className="portal-badge">
              <span className="portal-badge-dot">●</span> Partner Portal
            </span>
          </div>

          <h1 className="auth-title">Partner with Munchly</h1>
          <p className="auth-subtitle">Showcase your culinary specials and grow your customer base</p>
        </div>

        <RoleToggle activeRole="partner" type="register" />

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
            <label className="form-label" htmlFor="partner-name">
              Business Name
            </label>
            <div className="form-input-container">
              <input
                id="partner-name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                className="form-input"
                placeholder="e.g. Spice Route Bistro"
                autoComplete="organization"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="partner-contact-name">
              Contact Name
            </label>
            <div className="form-input-container">
              <input
                id="partner-contact-name"
                name="contactName"
                type="text"
                required
                value={formData.contactName}
                onChange={handleChange}
                className="form-input"
                placeholder="e.g. Alex Johnson"
                autoComplete="name"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="partner-phone">
              Phone
            </label>
            <div className="form-input-container">
              <input
                id="partner-phone"
                name="phone"
                type="tel"
                required
                value={formData.phone}
                onChange={handleChange}
                className="form-input"
                placeholder="e.g. +1 (555) 234-5678"
                autoComplete="tel"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="partner-address">
              Address
            </label>
            <div className="form-input-container">
              <input
                id="partner-address"
                name="address"
                type="text"
                required
                value={formData.address}
                onChange={handleChange}
                className="form-input"
                placeholder="e.g. 124 Market Street, Suite 4"
                autoComplete="street-address"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="partner-email">
              Business Email
            </label>
            <div className="form-input-container">
              <input
                id="partner-email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="form-input"
                placeholder="partner@restaurant.com"
                autoComplete="email"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="partner-password">
              Password
            </label>
            <div className="form-input-container">
              <input
                id="partner-password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="form-input"
                placeholder="Create a strong business password"
                autoComplete="new-password"
              />
            </div>
          </div>

          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? 'Registering Business...' : 'Register Business'}
          </button>
        </form>

        <div className="auth-footer">
          <p className="auth-footer-text">
            Already registered as partner?{' '}
            <Link to="/food-partner/login" className="auth-link">
              Sign in
            </Link>
          </p>

          <div className="portal-switch-box">
            <span>Looking to explore food reels?</span>
            <Link to="/user/register" className="portal-switch-link">
              User Sign up →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FoodPartnerRegister;
