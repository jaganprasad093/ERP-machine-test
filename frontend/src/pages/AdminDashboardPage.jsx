import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { RoleBadge, StatusBadge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import {
  User,
  KeyRound,
  ShieldAlert,
  LogOut,
  Mail,
  Phone,
  Calendar,
  Lock,
  CheckCircle2,
  Building2
} from 'lucide-react';

export const AdminDashboardPage = () => {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      showToast('Logged out successfully', 'info');
      navigate('/login');
    } catch {
      showToast('Error logging out', 'error');
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 rounded-3xl p-6 sm:p-8 text-white shadow-lg shadow-blue-500/10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-white text-xs font-semibold mb-3">
            <RoleBadge role={user?.role} />
            <span>&bull;</span>
            <StatusBadge status={user?.status} />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.name}!
          </h2>
          <p className="text-blue-100 text-sm mt-1 max-w-xl">
            You are logged into the ERP Admin Portal. View your profile, maintain your security credentials, and navigate your assigned modules.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link to="/profile">
            <Button
              variant="secondary"
              icon={User}
              className="bg-white text-blue-700 hover:bg-blue-50 border-0"
            >
              My Profile
            </Button>
          </Link>
          <Link to="/change-password">
            <Button
              variant="outline"
              icon={KeyRound}
              className="text-white border-white/40 hover:bg-white/10"
            >
              Security
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                My Profile Information
              </h3>
              <p className="text-xs text-slate-500">
                Your registered credentials and account status
              </p>
            </div>
            <Link to="/profile">
              <Button variant="outline" size="sm" icon={User}>
                Edit Profile
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-xs font-medium text-slate-400 block mb-1">
                Full Name
              </span>
              <span className="font-bold text-slate-900 text-base">
                {user?.name}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-xs font-medium text-slate-400 block mb-1">
                Email Address
              </span>
              <span className="font-semibold text-slate-900 flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-600" />
                {user?.email}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-xs font-medium text-slate-400 block mb-1">
                Phone Number
              </span>
              <span className="font-semibold text-slate-900 flex items-center gap-2 font-mono">
                <Phone className="w-4 h-4 text-blue-600" />
                {user?.phone}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-xs font-medium text-slate-400 block mb-1">
                Role & Privileges
              </span>
              <div className="mt-1">
                <RoleBadge role={user?.role} />
              </div>
            </div>
          </div>

          {/* Quick Security Status */}
          <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200/60 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-xs text-emerald-900">
              <p className="font-bold">Active & Secure Account</p>
              <p className="mt-0.5 text-emerald-700">
                Your account is currently active and authenticated via secure HttpOnly JWT. Remember to regularly change your password.
              </p>
            </div>
          </div>
        </div>

        {/* Security & Access Notice Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
              <Lock className="w-4 h-4 text-blue-600" />
              Quick Actions
            </h3>

            <div className="space-y-2.5">
              <Link
                to="/profile"
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-800 transition"
              >
                <span className="flex items-center gap-2.5">
                  <User className="w-4 h-4 text-blue-600" />
                  Update Profile Details
                </span>
                <span>&rarr;</span>
              </Link>

              <Link
                to="/change-password"
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-800 transition"
              >
                <span className="flex items-center gap-2.5">
                  <KeyRound className="w-4 h-4 text-purple-600" />
                  Change Password
                </span>
                <span>&rarr;</span>
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-xs font-semibold text-rose-700 transition"
              >
                <span className="flex items-center gap-2.5">
                  <LogOut className="w-4 h-4 text-rose-600" />
                  Sign Out
                </span>
                <span>&rarr;</span>
              </button>
            </div>
          </div>

          {/* Access Policy Notice */}
          <div className="bg-slate-100/80 rounded-2xl p-5 border border-slate-200/80 text-xs text-slate-600 space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-800">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              Role Policy Note
            </div>
            <p className="leading-relaxed">
              As an <strong>Admin</strong>, you have access to your personal dashboard and assigned operational modules. Access to Super Admin management functions is strictly restricted.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
