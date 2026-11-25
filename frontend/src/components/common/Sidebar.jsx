import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  LayoutDashboard,
  Users,
  UserPlus,
  UserCircle,
  KeyRound,
  LogOut,
  Building2,
  X
} from 'lucide-react';

export const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  const handleLogout = async () => {
    try {
      await logout();
      showToast('Logged out successfully', 'info');
      navigate('/login');
    } catch {
      showToast('Error logging out', 'error');
    }
  };

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
      isActive
        ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
    }`;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200/80 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-200/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 to-blue-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-slate-900 text-base tracking-tight block">
                Simple ERP
              </span>
              <span className="text-[10px] uppercase font-semibold text-blue-600 tracking-wider">
                Management
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6">
          {/* Main Role Module Links */}
          <div>
            <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
              {isSuperAdmin ? 'Super Admin Portal' : 'Admin Portal'}
            </p>
            <nav className="space-y-1">
              {isSuperAdmin ? (
                <>
                  <NavLink
                    to="/super-admin/dashboard"
                    onClick={onClose}
                    className={navLinkClass}
                  >
                    <LayoutDashboard className="w-4 h-4 shrink-0" />
                    Dashboard
                  </NavLink>
                  <NavLink
                    to="/super-admin/admins"
                    end
                    onClick={onClose}
                    className={navLinkClass}
                  >
                    <Users className="w-4 h-4 shrink-0" />
                    Admin Management
                  </NavLink>
                  <NavLink
                    to="/super-admin/admins/create"
                    onClick={onClose}
                    className={navLinkClass}
                  >
                    <UserPlus className="w-4 h-4 shrink-0" />
                    Create Admin
                  </NavLink>
                </>
              ) : (
                <NavLink
                  to="/admin/dashboard"
                  onClick={onClose}
                  className={navLinkClass}
                >
                  <LayoutDashboard className="w-4 h-4 shrink-0" />
                  Dashboard
                </NavLink>
              )}
            </nav>
          </div>

          {/* Account Settings */}
          <div>
            <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Account
            </p>
            <nav className="space-y-1">
              <NavLink to="/profile" onClick={onClose} className={navLinkClass}>
                <UserCircle className="w-4 h-4 shrink-0" />
                My Profile
              </NavLink>
              <NavLink
                to="/change-password"
                onClick={onClose}
                className={navLinkClass}
              >
                <KeyRound className="w-4 h-4 shrink-0" />
                Change Password
              </NavLink>
            </nav>
          </div>
        </div>

        {/* User Card & Logout Footer */}
        <div className="p-4 border-t border-slate-200/80 bg-slate-50/60">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-900 truncate">
                {user?.name}
              </p>
              <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
};
