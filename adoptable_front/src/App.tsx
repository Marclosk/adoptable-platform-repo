// src/App.tsx
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loginSuccess } from './features/auth/authSlice';

import RoleProtectedRoute from './components/role_protected_routes/role_protected_routes';

import Forbidden from './pages/error_pages/forbidden';
import NotFound from './pages/error_pages/not_found';

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

declare global {
  interface Window {
    __WS_TOKEN__: string;
  }
}

if (typeof window.__WS_TOKEN__ === 'undefined') {
  window.__WS_TOKEN__ = '';
}

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
      } catch {
        console.warn('Error parsing authState from localStorage');
      }
    }
  }, [dispatch]);

  return (
    <Router>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/card_detail/:id" element={<CardDetail />} />
        <Route path="/perfil" element={<Profile />} />
        <Route path="/donaciones" element={<Donations />} />
        <Route path="/contacto" element={<ContactPage />} />
        <Route path="/users/:userId/profile" element={<Profile />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* `/admin/*` sólo ADMIN */}
        <Route
          path="/admin/dashboard"
          element={
            <RoleProtectedRoute roles={['admin']} fallback={<Forbidden />}>
              <AdminDashboard />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/admin/contact/:id"
          element={
            <RoleProtectedRoute roles={['admin']} fallback={<Forbidden />}>
              <ContactDetail />
            </RoleProtectedRoute>
          }
        />

        {/* `/protectora/*` y `/animals/:id/requests` sólo PROTECTORA */}
        <Route
          path="/protectora/dashboard"
          element={
            <RoleProtectedRoute roles={['protectora']} fallback={<Forbidden />}>
              <ProtectoraDashboard />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/animals/:id/requests"
          element={
            <RoleProtectedRoute roles={['protectora']} fallback={<Forbidden />}>
              <AnimalRequests />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/add-animal"
          element={
            <RoleProtectedRoute roles={['protectora']} fallback={<Forbidden />}>
              <AddAnimal />
            </RoleProtectedRoute>
          }
        />

        {/* Dashboard general (adoptantes y cualquiera autenticado) */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Catch-all */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
};

export default App;
