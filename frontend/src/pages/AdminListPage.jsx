import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../services/adminService';
import { useToast } from '../context/ToastContext';
import { StatusBadge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Modal } from '../components/common/Modal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import {
  Search,
  Filter,
  UserPlus,
  Eye,
  Edit,
  Trash2,
  KeyRound,
  Power,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Users,
  AlertCircle
} from 'lucide-react';

export const AdminListPage = () => {
  const { showToast } = useToast();
  const [admins, setAdmins] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 10
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters & Sorting state
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  // Dialog & Modal states
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [statusTarget, setStatusTarget] = useState(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const [resetTarget, setResetTarget] = useState(null);
  const [resetPassword, setResetPassword] = useState('');
  const [resetConfirmPassword, setResetConfirmPassword] = useState('');
  const [resetError, setResetError] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  const fetchAdmins = useCallback(
    async (page = 1) => {
      try {
        setIsLoading(true);
        setError('');
        const data = await adminService.getAdmins({
          page,
          limit: 10,
          search,
          status: statusFilter,
          sortBy,
          sortOrder
        });
        setAdmins(data.admins);
        setPagination(data.pagination);
      } catch (err) {
        setError(err.message || 'Failed to fetch admins');
      } finally {
        setIsLoading(false);
      }
    },
    [search, statusFilter, sortBy, sortOrder]
  );

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchAdmins(1);
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [fetchAdmins]);

  // Handle Sort Toggle
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  // Status Toggle
  const handleConfirmStatusChange = async () => {
    if (!statusTarget) return;
    setIsUpdatingStatus(true);
    const newStatus = statusTarget.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await adminService.changeStatus(statusTarget._id, newStatus);
      showToast(
        `Admin account marked as ${newStatus.toLowerCase()}`,
        'success'
      );
      setStatusTarget(null);
      fetchAdmins(pagination.currentPage);
    } catch (err) {
      showToast(err.message || 'Failed to update status', 'error');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Delete Admin
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await adminService.deleteAdmin(deleteTarget._id);
      showToast('Admin account permanently deleted', 'success');
      setDeleteTarget(null);
      fetchAdmins(pagination.currentPage);
    } catch (err) {
      showToast(err.message || 'Failed to delete admin', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Reset Password
  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    setResetError('');
    if (resetPassword.length < 6) {
      setResetError('Password must be at least 6 characters long');
      return;
    }
    if (resetPassword !== resetConfirmPassword) {
      setResetError('Passwords do not match');
      return;
    }

    setIsResetting(true);
    try {
      await adminService.resetPassword(
        resetTarget._id,
        resetPassword,
        resetConfirmPassword
      );
      showToast(`Password reset successfully for ${resetTarget.name}`, 'success');
      setResetTarget(null);
      setResetPassword('');
      setResetConfirmPassword('');
    } catch (err) {
      setResetError(err.message || 'Failed to reset password');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Admin Management
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Complete management, status control, and credential administration
            for system admins.
          </p>
        </div>
        <Link to="/super-admin/admins/create">
          <Button variant="primary" icon={UserPlus}>
            Create Admin
          </Button>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search Input */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or phone..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition"
          />
        </div>

        {/* Status Filter & Reset */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
            <Filter className="w-3.5 h-3.5" />
            Status:
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>
      </div>

      {/* Admins Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="inline-block w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-sm font-medium text-slate-500">Loading administrators...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-rose-600">
            <AlertCircle className="w-8 h-8 mx-auto mb-2" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        ) : admins.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-700">No admins found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              No administrator accounts matched your search or filter criteria.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th
                    className="py-3.5 px-4 cursor-pointer hover:text-slate-800 select-none"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center gap-1.5">
                      Name <ArrowUpDown className="w-3.5 h-3.5" />
                    </div>
                  </th>
                  <th
                    className="py-3.5 px-4 cursor-pointer hover:text-slate-800 select-none"
                    onClick={() => handleSort('email')}
                  >
                    <div className="flex items-center gap-1.5">
                      Email <ArrowUpDown className="w-3.5 h-3.5" />
                    </div>
                  </th>
                  <th className="py-3.5 px-4">Phone</th>
                  <th
                    className="py-3.5 px-4 cursor-pointer hover:text-slate-800 select-none"
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center gap-1.5">
                      Status <ArrowUpDown className="w-3.5 h-3.5" />
                    </div>
                  </th>
                  <th
                    className="py-3.5 px-4 cursor-pointer hover:text-slate-800 select-none"
                    onClick={() => handleSort('createdAt')}
                  >
                    <div className="flex items-center gap-1.5">
                      Created Date <ArrowUpDown className="w-3.5 h-3.5" />
                    </div>
                  </th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {admins.map((admin) => (
                  <tr
                    key={admin._id}
                    className="hover:bg-slate-50/70 transition"
                  >
                    <td className="py-4 px-4">
                      <div className="font-semibold text-slate-900">{admin.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        ID: {admin._id.slice(-6)}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-slate-600 text-xs">
                      {admin.email}
                    </td>
                    <td className="py-4 px-4 text-slate-600 text-xs font-mono">
                      {admin.phone}
                    </td>
                    <td className="py-4 px-4">
                      <StatusBadge status={admin.status} />
                    </td>
                    <td className="py-4 px-4 text-slate-500 text-xs">
                      {new Date(admin.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        {/* View Details */}
                        <Link
                          to={`/super-admin/admins/${admin._id}`}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>

                        {/* Edit */}
                        <Link
                          to={`/super-admin/admins/${admin._id}/edit`}
                          className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition"
                          title="Edit Admin"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>

                        {/* Reset Password */}
                        <button
                          onClick={() => {
                            setResetTarget(admin);
                            setResetPassword('');
                            setResetConfirmPassword('');
                            setResetError('');
                          }}
                          className="p-1.5 text-slate-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition"
                          title="Reset Password"
                        >
                          <KeyRound className="w-4 h-4" />
                        </button>

                        {/* Toggle Status */}
                        <button
                          onClick={() => setStatusTarget(admin)}
                          className={`p-1.5 rounded-lg transition ${
                            admin.status === 'ACTIVE'
                              ? 'text-slate-500 hover:text-rose-600 hover:bg-rose-50'
                              : 'text-slate-500 hover:text-emerald-600 hover:bg-emerald-50'
                          }`}
                          title={
                            admin.status === 'ACTIVE'
                              ? 'Deactivate Account'
                              : 'Activate Account'
                          }
                        >
                          <Power className="w-4 h-4" />
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => setDeleteTarget(admin)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Delete Admin"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        <div className="px-6 py-4 bg-slate-50/60 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            Showing{' '}
            <span className="font-semibold text-slate-800">
              {admins.length > 0 ? (pagination.currentPage - 1) * pagination.limit + 1 : 0}
            </span>{' '}
            to{' '}
            <span className="font-semibold text-slate-800">
              {Math.min(
                pagination.currentPage * pagination.limit,
                pagination.totalCount
              )}
            </span>{' '}
            of{' '}
            <span className="font-semibold text-slate-800">
              {pagination.totalCount}
            </span>{' '}
            admins
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.currentPage <= 1 || isLoading}
              onClick={() => fetchAdmins(pagination.currentPage - 1)}
              icon={ChevronLeft}
            >
              Previous
            </Button>
            <span className="px-3 font-semibold text-slate-700">
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={
                pagination.currentPage >= pagination.totalPages || isLoading
              }
              onClick={() => fetchAdmins(pagination.currentPage + 1)}
              icon={ChevronRight}
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog: Delete Admin */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Admin Account"
        message={`Are you sure you want to permanently delete admin account for ${deleteTarget?.name} (${deleteTarget?.email})? This action cannot be undone.`}
        confirmText="Yes, Delete"
        variant="danger"
        isLoading={isDeleting}
      />

      {/* Confirmation Dialog: Status Change */}
      <ConfirmDialog
        isOpen={!!statusTarget}
        onClose={() => setStatusTarget(null)}
        onConfirm={handleConfirmStatusChange}
        title={
          statusTarget?.status === 'ACTIVE'
            ? 'Deactivate Admin Account'
            : 'Activate Admin Account'
        }
        message={`Are you sure you want to ${
          statusTarget?.status === 'ACTIVE' ? 'deactivate' : 'activate'
        } ${statusTarget?.name}'s account? Inactive admins are blocked from logging in.`}
        confirmText={
          statusTarget?.status === 'ACTIVE' ? 'Deactivate' : 'Activate'
        }
        variant={statusTarget?.status === 'ACTIVE' ? 'danger' : 'primary'}
        isLoading={isUpdatingStatus}
      />

      {/* Modal Dialog: Reset Password */}
      <Modal
        isOpen={!!resetTarget}
        onClose={() => setResetTarget(null)}
        title={`Reset Password for ${resetTarget?.name}`}
      >
        <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
          {resetError && (
            <div className="p-3 rounded-lg bg-rose-50 text-rose-700 text-xs font-medium">
              {resetError}
            </div>
          )}

          <p className="text-xs text-slate-500">
            Set a new temporary password for <strong>{resetTarget?.email}</strong>.
          </p>

          <Input
            label="New Password"
            type="password"
            placeholder="Min 6 characters"
            required
            value={resetPassword}
            onChange={(e) => setResetPassword(e.target.value)}
          />

          <Input
            label="Confirm New Password"
            type="password"
            placeholder="Re-type password"
            required
            value={resetConfirmPassword}
            onChange={(e) => setResetConfirmPassword(e.target.value)}
          />

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setResetTarget(null)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isResetting}
            >
              Update Password
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
