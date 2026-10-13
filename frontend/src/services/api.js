import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('munchly_token') || localStorage.getItem('foodreel_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authStorage = {
  getToken: () => localStorage.getItem('munchly_token') || localStorage.getItem('foodreel_token'),
  getUser: () => {
    try {
      const data = localStorage.getItem('munchly_user') || localStorage.getItem('foodreel_user');
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },
  getPartner: () => {
    try {
      const data = localStorage.getItem('munchly_partner') || localStorage.getItem('foodreel_partner');
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },
  getRole: () => localStorage.getItem('munchly_role') || localStorage.getItem('foodreel_role'),
  setAuth: ({ token, role, user, foodPartner }) => {
    if (token) {
      localStorage.setItem('munchly_token', token);
      localStorage.setItem('foodreel_token', token);
    }
    if (role) {
      localStorage.setItem('munchly_role', role);
      localStorage.setItem('foodreel_role', role);
    }
    if (user) {
      localStorage.setItem('munchly_user', JSON.stringify(user));
      localStorage.setItem('foodreel_user', JSON.stringify(user));
    }
    if (foodPartner) {
      localStorage.setItem('munchly_partner', JSON.stringify(foodPartner));
      localStorage.setItem('foodreel_partner', JSON.stringify(foodPartner));
    }
  },
  clearAuth: () => {
    localStorage.removeItem('munchly_token');
    localStorage.removeItem('munchly_role');
    localStorage.removeItem('munchly_user');
    localStorage.removeItem('munchly_partner');
    localStorage.removeItem('foodreel_token');
    localStorage.removeItem('foodreel_role');
    localStorage.removeItem('foodreel_user');
    localStorage.removeItem('foodreel_partner');
  },
};

export const foodApi = {
  // Discover feed
  getFeed: async () => {
    const res = await api.get('/api/food');
    return res.data;
  },

  // Upload reel (food partner)
  uploadReel: async (formData, onProgress) => {
    const res = await api.post('/api/food', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percent = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percent);
        }
      },
    });
    return res.data;
  },

  // Partner's own reels
  getPartnerReels: async () => {
    const res = await api.get('/api/food/partner/me');
    return res.data;
  },

  // Delete partner's reel
  deleteReel: async (id) => {
    const res = await api.delete(`/api/food/${id}`);
    return res.data;
  },

  // Public partner profile & their dishes
  getPartnerProfile: async (partnerId) => {
    const res = await api.get(`/api/food/partner/${partnerId}`);
    return res.data;
  },

  // Update restaurant partner profile info
  updatePartnerProfile: async (data) => {
    const res = await api.put('/api/auth/food-partner/profile', data);
    return res.data;
  },

  // Get current partner details
  getMePartner: async () => {
    const res = await api.get('/api/auth/food-partner/me');
    return res.data;
  },

  // Get current user details
  getMeUser: async () => {
    const res = await api.get('/api/auth/user/me');
    return res.data;
  },

  // Like / unlike reel
  toggleLike: async (id) => {
    const res = await api.post(`/api/food/${id}/like`);
    return res.data;
  },
};

export default api;
