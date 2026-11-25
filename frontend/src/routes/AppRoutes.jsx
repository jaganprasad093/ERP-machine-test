import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ProtectedRoute } from './ProtectedRoute';
import { DashboardLayout } from '../layouts/DashboardLayout';

// Pages
import { LoginPage } from '../pages/LoginPage';
import { SuperAdminDashboard } from '../pages/SuperAdminDashboard';
import { AdminListPage } from '../pages/AdminListPage';
import { CreateAdminPage } from '../pages/CreateAdminPage';
import { EditAdminPage } from '../pages/EditAdminPage';
import { AdminDetailsPage } from '../pages/AdminDetailsPage';
import { AdminDashboardPage } from '../pages/AdminDashboardPage';
import { ProfilePage } from '../pages/ProfilePage';
import { ChangePasswordPage } from '../pages/ChangePasswordPage';
import { UnauthorizedPage } from '../pages/UnauthorizedPage';
import { NotFoundPage } from '../pages/NotFoundPage';

export const AppRoutes = () => {
  const { isAuthenticated, user, isLoading } = useAuth();

  // Root redirect helper
  const getHomeRedirect = () => {
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    if (user?.role === 'SUPER_ADMIN') {
      return <Navigate to="/super-admin/dashboard" replace />;
    }
    return <Navigate to="/admin/dashboard" replace />;
  };

  return (
    <Routes>
      {/* Root redirect */}
      <Route path="/" element={getHomeRedirect()} />

      {/* Public Login Route */}
      <Route
        path="/login"
        element={
          isAuthenticated ? (
            getHomeRedirect()
          ) : (
            <LoginPage />
          )
        }
      />

      {/* Super Admin Protected Routes */}
      <Route
        path="/super-admin"
        element={
          <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
            <DashboardLayout title="Super Admin Portal" />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/super-admin/dashboard" replace />} />
        <Route path="dashboard" element={<SuperAdminDashboard />} />
        <Route path="admins" element={<AdminListPage />} />
        <Route path="admins/create" element={<CreateAdminPage />} />
        <Route path="admins/:id" element={<AdminDetailsPage />} />
        <Route path="admins/:id/edit" element={<EditAdminPage />} />
      </Route>

      {/* Admin Protected Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <DashboardLayout title="Admin Portal" />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboardPage />} />
      </Route>

      {/* Shared Account Routes */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout title="Account Settings" />
          </ProtectedRoute>
        }
      >
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/change-password" element={<ChangePasswordPage />} />
      </Route>

      {/* Error Pages */}
      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};
