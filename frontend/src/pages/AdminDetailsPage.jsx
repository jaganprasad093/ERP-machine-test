import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { adminService } from '../services/adminService';
import { useToast } from '../context/ToastContext';
import { StatusBadge, RoleBadge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { Modal } from '../components/common/Modal';
import { Input } from '../components/common/Input';
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  User,
  Shield,
  Edit,
  Power,
  KeyRound,
  Trash2,
  Clock,
  Loader2,
  AlertCircle
} from 'lucide-react';

export const AdminDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [admin, setAdmin] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Dialog states
  const [showDelete, setShowDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [showStatusConfirm, setShowStatusConfirm] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const [showResetModal, setShowResetModal] = useState(false);
  const [resetPassword, setResetPassword] = useState('');
  const [resetConfirmPassword, setResetConfirmPassword] = useState('');
  const [resetError, setResetError] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  const fetchDetails = async () => {
    try {
      setIsLoading(true);
      setError('');
      const data = await adminService.getAdminById(id);
      setAdmin(data);
    } catch (err) {
      setError(err.message || 'Failed to load admin profile');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const handleToggleStatus = async () => {
    if (!admin) return;
    setIsUpdatingStatus(true);
    const newStatus = admin.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      const updated = await adminService.changeStatus(admin._id, newStatus);
      setAdmin(updated);
      showToast(`Status changed to ${newStatus.toLowerCase()}`, 'success');
      setShowStatusConfirm(false);
    } catch (err) {
      showToast(err.message || 'Failed to toggle status', 'error');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleDelete = async () => {
    if (!admin) return;
    setIsDeleting(true);
    try {
      await adminService.deleteAdmin(admin._id);
      showToast('Admin deleted successfully', 'success');
      navigate('/super-admin/admins');
    } catch (err) {
      showToast(err.message || 'Failed to delete admin', 'error');
      setIsDeleting(false);
    }
  };

  const handleResetPassword = async (e) => {
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
        admin._id,
        resetPassword,
        resetConfirmPassword
      );
      showToast('Password reset successfully', 'success');
      setShowResetModal(false);
      setResetPassword('');
      setResetConfirmPassword('');
    } catch (err) {
      setResetError(err.message || 'Failed to reset password');
    } finally {
      setIsResetting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-16 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-3" />
        <p className="text-sm text-slate-500">Loading admin details...</p>
      </div>
    );
  }

  if (error || !admin) {
    return (
      <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800">
        <AlertCircle className="w-6 h-6 text-rose-600 mb-2" />
        <h4 className="font-semibold">{error || 'Admin not found'}</h4>
        <Link to="/super-admin/admins">
          <Button variant="outline" size="sm" className="mt-3">
            Back to Admins
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/super-admin/admins"
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              {admin.name}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <RoleBadge role={admin.role} />
              <StatusBadge status={admin.status} />
            </div>
          </div>
        </div>

        {/* Action Buttons Toolbar */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Link to={`/super-admin/admins/${admin._id}/edit`}>
            <Button variant="outline" size="sm" icon={Edit}>
              Edit Details
            </Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            icon={KeyRound}
            onClick={() => {
              setResetPassword('');
              setResetConfirmPassword('');
              setResetError('');
              setShowResetModal(true);
            }}
          >
            Reset Password
          </Button>
          <Button
            variant={admin.status === 'ACTIVE' ? 'outline' : 'primary'}
            size="sm"
            icon={Power}
            onClick={() => setShowStatusConfirm(true)}
          >
            {admin.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
          </Button>
          <Button
            variant="danger"
            size="sm"
            icon={Trash2}
            onClick={() => setShowDelete(true)}
          >
            Delete
          </Button>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Contact & Profile Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
            <User className="w-4 h-4 text-blue-600" />
            Contact & Account Details
          </h3>

          <div className="space-y-3.5 text-sm">
            <div>
              <p className="text-xs text-slate-400 font-medium">User ID</p>
              <p className="font-mono text-xs text-slate-700 mt-0.5">{admin._id}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Full Name</p>
              <p className="font-semibold text-slate-900 mt-0.5">{admin.name}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Email Address</p>
              <p className="text-slate-800 flex items-center gap-2 mt-0.5">
                <Mail className="w-4 h-4 text-slate-400" />
                {admin.email}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Phone Number</p>
              <p className="text-slate-800 flex items-center gap-2 mt-0.5">
                <Phone className="w-4 h-4 text-slate-400" />
                {admin.phone}
              </p>
            </div>
          </div>
        </div>

        {/* Audit & System Metadata Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
            <Shield className="w-4 h-4 text-blue-600" />
            System & Audit Metadata
          </h3>

          <div className="space-y-3.5 text-sm">
            <div>
              <p className="text-xs text-slate-400 font-medium">System Role</p>
              <div className="mt-1">
                <RoleBadge role={admin.role} />
              </div>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Account Status</p>
              <div className="mt-1">
                <StatusBadge status={admin.status} />
              </div>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Registration Date</p>
              <p className="text-slate-700 flex items-center gap-2 mt-0.5 text-xs">
                <Calendar className="w-4 h-4 text-slate-400" />
                {new Date(admin.createdAt).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Created By</p>
              <p className="text-slate-700 text-xs mt-0.5">
                {admin.createdBy ? `${admin.createdBy.name} (${admin.createdBy.email})` : 'System Seed / Initial Setup'}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Last Profile Update</p>
              <p className="text-slate-700 flex items-center gap-2 mt-0.5 text-xs">
                <Clock className="w-4 h-4 text-slate-400" />
                {new Date(admin.updatedAt).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Dialogs */}
      <ConfirmDialog
        isOpen={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={handleDelete}
        title="Delete Admin Account"
        message={`Are you sure you want to permanently delete ${admin.name}? This action cannot be reverted.`}
        confirmText="Delete Admin"
        variant="danger"
        isLoading={isDeleting}
      />

      <ConfirmDialog
        isOpen={showStatusConfirm}
        onClose={() => setShowStatusConfirm(false)}
        onConfirm={handleToggleStatus}
        title={
          admin.status === 'ACTIVE'
            ? 'Deactivate Account'
            : 'Activate Account'
        }
        message={`Are you sure you want to ${
          admin.status === 'ACTIVE' ? 'deactivate' : 'activate'
        } ${admin.name}'s account?`}
        confirmText={
          admin.status === 'ACTIVE' ? 'Deactivate' : 'Activate'
        }
        variant={admin.status === 'ACTIVE' ? 'danger' : 'primary'}
        isLoading={isUpdatingStatus}
      />

      {/* Modal Dialog for Reset Password */}
      <Modal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        title={`Reset Password for ${admin.name}`}
      >
        <form onSubmit={handleResetPassword} className="space-y-4">
          {resetError && (
            <div className="p-3 rounded-lg bg-rose-50 text-rose-700 text-xs font-medium">
              {resetError}
            </div>
          )}

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
            placeholder="Re-type new password"
            required
            value={resetConfirmPassword}
            onChange={(e) => setResetConfirmPassword(e.target.value)}
          />

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowResetModal(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isResetting}
            >
              Save Password
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
