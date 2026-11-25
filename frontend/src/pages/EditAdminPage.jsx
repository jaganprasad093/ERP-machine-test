import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { adminService } from '../services/adminService';
import { useToast } from '../context/ToastContext';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { ArrowLeft, Save, AlertCircle, Loader2 } from 'lucide-react';

const editAdminSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name cannot exceed 100 characters'),
  phone: z
    .string()
    .min(7, 'Phone number must be at least 7 digits')
    .max(20, 'Phone number cannot exceed 20 characters'),
  status: z.enum(['ACTIVE', 'INACTIVE'])
});

export const EditAdminPage = () => {
  const { id } = useParams();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(editAdminSchema)
  });

  useEffect(() => {
    const loadAdmin = async () => {
      try {
        setPageLoading(true);
        const data = await adminService.getAdminById(id);
        setAdmin(data);
        reset({
          name: data.name,
          phone: data.phone,
          status: data.status
        });
      } catch (err) {
        setServerError(err.message || 'Failed to fetch admin details');
      } finally {
        setPageLoading(false);
      }
    };
    loadAdmin();
  }, [id, reset]);

  const onSubmit = async (formData) => {
    setServerError('');
    setIsSubmitting(true);
    try {
      await adminService.updateAdmin(id, formData);
      showToast('Admin account updated successfully', 'success');
      navigate('/super-admin/admins');
    } catch (err) {
      setServerError(err.message || 'Failed to update admin account');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="py-16 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-3" />
        <p className="text-sm text-slate-500">Loading admin information...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link
          to="/super-admin/admins"
          className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Edit Admin
          </h2>
          <p className="text-sm text-slate-500">
            Modify profile details and access status
          </p>
        </div>
      </div>

      {serverError && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="font-medium">{serverError}</div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Input
            label="Email Address"
            type="email"
            value={admin?.email || ''}
            disabled
            helperText="Email cannot be modified once registered"
          />

          <Input
            label="Full Name"
            placeholder="e.g. John Doe"
            required
            error={errors.name?.message}
            {...register('name')}
          />

          <Input
            label="Phone Number"
            type="tel"
            placeholder="+1 555-0199"
            required
            error={errors.phone?.message}
            {...register('phone')}
          />

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Account Status <span className="text-rose-500">*</span>
            </label>
            <select
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
              {...register('status')}
            >
              <option value="ACTIVE">Active (Allowed to sign in)</option>
              <option value="INACTIVE">Inactive (Access blocked)</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Link to="/super-admin/admins">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmitting}
              icon={Save}
            >
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
