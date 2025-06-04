declare global {
  interface Window {
    __WS_TOKEN__: string;
  }
}

if (typeof window.__WS_TOKEN__ === 'undefined') {
  window.__WS_TOKEN__ = '';
}

import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loginSuccess } from './features/auth/authSlice';

import Login from './features/auth/login/login';
import Register from './features/auth/register/register';
import Dashboard from './pages/dashboard';
import CardDetail from './pages/card_detail/card_detail';
import Profile from './pages/profile/profile';
import Donations from './pages/donations/donations';
import ContactPage from './pages/contact/contact';
import AddAnimal from './pages/animal/add_animal';
import AnimalRequests from './pages/protectora/animal_requests';
import ProtectoraDashboard from './pages/boards/protectora_dashboard';
import AdminDashboard from './pages/boards/admin_dashboard';
import ContactDetail from './pages/contact/contact_detail';
import ResetPassword from './pages/reset_password/reset_password';

const App: React.FC = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const saved = localStorage.getItem('authState');
    if (saved) {
      try {
        const { user, role } = JSON.parse(saved);
        if (user && role) {
          dispatch(loginSuccess({ user, role }));
        }
      } catch (err) {
        console.warn('Error parsing authState from localStorage:', err);
      }
    }
  }, [dispatch]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/card_detail/:id" element={<CardDetail />} />
        <Route path="/perfil" element={<Profile />} />
        <Route path="/donaciones" element={<Donations />} />
        <Route path="/contacto" element={<ContactPage />} />
        <Route path="/add-animal" element={<AddAnimal />} />
        <Route path="/animals/:id/requests" element={<AnimalRequests />} />
        <Route path="/protectora/dashboard" element={<ProtectoraDashboard />} />
        <Route path="/users/:userId/profile" element={<Profile />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/contact/:id" element={<ContactDetail />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Routes>
    </Router>
  );
};

export default App;
