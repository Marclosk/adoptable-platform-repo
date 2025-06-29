// src/components/role_protected_routes/role_protected_routes.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../../redux/store';

// Definimos los roles válidos
type UserRole = 'protectora' | 'adoptante' | 'admin';

interface RoleProtectedRouteProps {
  roles: UserRole[]; // Roles permitidos
  children: React.ReactElement; // Componente a renderizar si tiene permiso
  fallback?: React.ReactElement; // Componente a renderizar si NO tiene permiso
}

/**
 * Renderiza `children` si el rol del usuario está en `roles`,
 * muestra `fallback` si está definido, o bien redirige a "/" por defecto.
 */
const RoleProtectedRoute: React.FC<RoleProtectedRouteProps> = ({
  roles,
  children,
  fallback,
}) => {
  const role = useSelector<RootState, UserRole>(s => s.auth.role as UserRole);

  if (!roles.includes(role)) {
    return fallback ?? <Navigate to="/" replace />;
  }

  return children;
};

export default RoleProtectedRoute;
