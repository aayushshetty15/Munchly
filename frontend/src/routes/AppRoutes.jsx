import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ChooseRegister from '../pages/auth/ChooseRegister';
import UserRegister from '../pages/auth/UserRegister';
import FoodPartnerRegister from '../pages/auth/FoodPartnerRegister';
import UserLogin from '../pages/auth/UserLogin';
import FoodPartnerLogin from '../pages/auth/FoodPartnerLogin';
import HomePage from '../pages/general/Home';
import PartnerHome from '../pages/general/PartnerHome';

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        
        {/* Auth routes */}
        <Route path="/register" element={<ChooseRegister />} />
        <Route path="/choose-register" element={<ChooseRegister />} />
        <Route path="/user/register" element={<UserRegister />} />
        <Route path="/food-partner/register" element={<FoodPartnerRegister />} />
        <Route path="/user/login" element={<UserLogin />} />
        <Route path="/food-partner/login" element={<FoodPartnerLogin />} />

        {/* Respective home & dashboard routes */}
        <Route path="/home" element={<HomePage />} />
        <Route path="/user/home" element={<HomePage />} />
        <Route path="/user/dashboard" element={<HomePage initialTab="dashboard" />} />
        <Route path="/dashboard" element={<HomePage initialTab="dashboard" />} />
        <Route path="/user/saved" element={<HomePage initialTab="saved" />} />
        <Route path="/food-partner/home" element={<PartnerHome />} />

        {/* Catch-all fallback */}
        <Route path="*" element={<Navigate to="/user/login" replace />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;