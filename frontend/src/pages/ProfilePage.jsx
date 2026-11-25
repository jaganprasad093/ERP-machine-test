import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { profileService } from '../services/profileService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { RoleBadge, StatusBadge } from '../components/common/Badge';
import { User, Save, AlertCircle, Loader2 } from 'lucide-react';

const profileSchema = z.object({
  name: z
    .string()
    .min(1, 'Full name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name cannot exceed 100 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes'),
  phone: z
    .string()
    .min(1, 'Phone number is required')
    .length(10, 'Phone number must be exactly 10 digits')
    .regex(/^\d{10}$/, 'Phone number must contain only 10 digits')
});

export const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();
  const [pageLoading, setPageLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(profileSchema)
  });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setPageLoading(true);
        const data = await profileService.getProfile();
        reset({
          name: data.name,
          phone: data.phone
        });
      } catch (err) {
        setServerError(err.message || 'Failed to load profile');
      } finally {
        setPageLoading(false);
      }
    };
    loadProfile();
  }, [reset]);

  const onSubmit = async (data) => {
    setServerError('');
    setIsSubmitting(true);
    try {
      const updated = await profileService.updateProfile(data);
      updateUser(updated);
      showToast('Profile updated successfully!', 'success');
    } catch (err) {
      setServerError(err.message || 'Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="py-16 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-3" />
        <p className="text-sm text-slate-500">Loading your profile...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
          My Profile
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Manage your personal details and contact information.
        </p>
      </div>

      {serverError && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="font-medium">{serverError}</div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
        {/* Profile Avatar & Badges */}
        <div className="flex items-center gap-4 pb-6 mb-6 border-b border-slate-100">
          <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white font-bold text-2xl flex items-center justify-center shadow-md shadow-blue-500/20">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">{user?.name}</h3>
            <p className="text-xs text-slate-500">{user?.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <RoleBadge role={user?.role} />
              <StatusBadge status={user?.status} />
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Input
            label="Email Address"
            type="email"
            value={user?.email || ''}
            disabled
            helperText="Your registered email address is fixed for system security"
          />

          <Input
            label="Full Name"
            placeholder="Your name"
            required
            error={errors.name?.message}
            {...register('name')}
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
              const allowed = ['Backspace','Delete','Tab','ArrowLeft','ArrowRight','Home','End'];
              if (!allowed.includes(e.key) && !/^\d$/.test(e.key)) {
                e.preventDefault();
              }
            }}
            {...register('phone')}
          />

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmitting}
              icon={Save}
            >
              Save Profile
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
