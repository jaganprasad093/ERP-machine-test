import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { adminService } from '../services/adminService';
import { useToast } from '../context/ToastContext';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { ArrowLeft, UserPlus, AlertCircle } from 'lucide-react';

const createAdminSchema = z
  .object({
    name: z
      .string()
      .min(1, 'Full name is required')
      .min(2, 'Full name must be at least 2 characters')
      .max(100, 'Name cannot exceed 100 characters')
      .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes'),
    email: z
      .string()
      .min(1, 'Email address is required')
      .email('Please enter a valid email address')
      .max(100, 'Email cannot exceed 100 characters'),
    phone: z
      .string()
      .min(1, 'Phone number is required')
      .length(10, 'Phone number must be exactly 10 digits')
      .regex(/^\d{10}$/, 'Phone number must contain only 10 digits'),
    password: z
      .string()
      .min(1, 'Password is required')
      .min(6, 'Password must be at least 6 characters')
      .max(100, 'Password cannot exceed 100 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string().min(1, 'Please confirm the password'),
    status: z.enum(['ACTIVE', 'INACTIVE'])
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword']
  });

export const CreateAdminPage = () => {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(createAdminSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      status: 'ACTIVE'
    }
  });

  const onSubmit = async (data) => {
    setServerError('');
    setIsLoading(true);
    try {
      await adminService.createAdmin(data);
      showToast('Admin account created successfully!', 'success');
      navigate('/super-admin/admins');
    } catch (err) {
      setServerError(err.message || 'Failed to create admin account');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header with back link */}
      <div className="flex items-center gap-3">
        <Link
          to="/super-admin/admins"
          className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Create Admin
          </h2>
          <p className="text-sm text-slate-500">
            Add a new administrator to the ERP system
          </p>
        </div>
      </div>

      {serverError && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="font-medium">{serverError}</div>
        </div>
      )}

      {/* Form Container */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Input
            label="Full Name"
            placeholder="e.g. Johnathan Smith"
            required
            error={errors.name?.message}
            {...register('name')}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Input
              label="Email Address"
              type="email"
              placeholder="admin@company.com"
              required
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              label="Phone Number"
              type="tel"
              placeholder="e.g. 9876543210"
              required
              maxLength={10}
              helperText="10 digits only, no spaces or symbols"
              error={errors.phone?.message}
              onKeyDown={(e) => {
                // Allow: backspace, delete, tab, arrows, home, end
                const allowed = ['Backspace','Delete','Tab','ArrowLeft','ArrowRight','Home','End'];
                if (!allowed.includes(e.key) && !/^\d$/.test(e.key)) {
                  e.preventDefault();
                }
              }}
              {...register('phone')}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              required
              helperText="Min. 6 chars · uppercase · lowercase · number"
              error={errors.password?.message}
              {...register('password')}
            />

            <Input
              label="Confirm Password"
              type="password"
              placeholder="••••••••"
              required
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />
          </div>

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
              isLoading={isLoading}
              icon={UserPlus}
            >
              Create Account
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
