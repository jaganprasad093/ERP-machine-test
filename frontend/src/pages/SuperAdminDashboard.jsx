import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../services/adminService';
import { StatsCard } from '../components/common/StatsCard';
import { StatusBadge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import {
  Users,
  UserCheck,
  UserX,
  UserPlus,
  ArrowRight,
  Clock,
  Activity,
  Calendar,
  AlertCircle
} from 'lucide-react';

export const SuperAdminDashboard = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      setError('');
      const statsData = await adminService.getDashboardStats();
      setData(statsData);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard metrics');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-slate-200 rounded-md w-64" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-slate-200 rounded-2xl" />
          ))}
        </div>
        <div className="h-64 bg-slate-200 rounded-2xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-4">
        <AlertCircle className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-semibold text-rose-900">Dashboard Error</h4>
          <p className="text-sm mt-1">{error}</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={fetchStats}
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const { stats, recentlyCreatedAdmins = [], recentActivities = [] } = data || {};

  return (
    <div className="space-y-8">
      {/* Header section with Action Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            System Overview
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Real-time administrative metrics and recent platform audit activity.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/super-admin/admins/create">
            <Button variant="primary" icon={UserPlus}>
              Create Admin
            </Button>
          </Link>
          <Link to="/super-admin/admins">
            <Button variant="outline" icon={Users}>
              Manage Admins
            </Button>
          </Link>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatsCard
          title="Total Admins"
          value={stats?.totalAdmins || 0}
          subtitle="Registered admin accounts"
          icon={Users}
          color="blue"
        />
        <StatsCard
          title="Active Admins"
          value={stats?.activeAdmins || 0}
          subtitle="Enabled & authenticated"
          icon={UserCheck}
          color="emerald"
        />
        <StatsCard
          title="Inactive Admins"
          value={stats?.inactiveAdmins || 0}
          subtitle="Deactivated access"
          icon={UserX}
          color="rose"
        />
        <StatsCard
          title="Recently Created"
          value={stats?.recentlyCreatedCount || 0}
          subtitle="Latest registrations"
          icon={Clock}
          color="purple"
        />
      </div>

      {/* Two-column layout: Recently Created Admins & Audit Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recently Created Admins (2 columns on large screen) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Recently Created Admins
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Latest administrators added to the organization
              </p>
            </div>
            <Link
              to="/super-admin/admins"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 group"
            >
              View All <ArrowRight className="w-3.5 h-3.5 transition group-hover:translate-x-0.5" />
            </Link>
          </div>

          <div className="mt-4 overflow-x-auto">
            {recentlyCreatedAdmins.length === 0 ? (
              <div className="text-center py-10">
                <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-600">No admins created yet</p>
                <p className="text-xs text-slate-400 mt-1">
                  Click 'Create Admin' to add your first administrator.
                </p>
              </div>
            ) : (
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-xs uppercase font-semibold text-slate-400">
                    <th className="py-3 px-2">Admin Name</th>
                    <th className="py-3 px-2">Email</th>
                    <th className="py-3 px-2">Phone</th>
                    <th className="py-3 px-2">Status</th>
                    <th className="py-3 px-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentlyCreatedAdmins.map((admin) => (
                    <tr key={admin._id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-2 font-semibold text-slate-800">
                        {admin.name}
                      </td>
                      <td className="py-3 px-2 text-slate-600 text-xs">
                        {admin.email}
                      </td>
                      <td className="py-3 px-2 text-slate-600 text-xs font-mono">
                        {admin.phone}
                      </td>
                      <td className="py-3 px-2">
                        <StatusBadge status={admin.status} />
                      </td>
                      <td className="py-3 px-2 text-right">
                        <Link
                          to={`/super-admin/admins/${admin._id}`}
                          className="text-xs font-medium text-blue-600 hover:text-blue-800"
                        >
                          Details &rarr;
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Recent Admin Audit Activity Feed */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
          <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
            <Activity className="w-4 h-4 text-blue-600" />
            <h3 className="text-base font-bold text-slate-900">
              Recent System Activity
            </h3>
          </div>

          <div className="mt-4 space-y-4">
            {recentActivities.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">
                No activity recorded yet
              </p>
            ) : (
              recentActivities.map((act) => (
                <div key={act._id} className="flex items-start gap-3 text-xs">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800 truncate">
                      {act.action.replace(/_/g, ' ')}
                    </p>
                    <p className="text-slate-500 text-[11px] mt-0.5 truncate">
                      {act.targetUserEmail || act.performedByName || 'System event'}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1 font-mono">
                      {new Date(act.createdAt).toLocaleString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
