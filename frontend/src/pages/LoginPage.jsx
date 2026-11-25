import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { AuthLayout } from '../layouts/AuthLayout';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { AlertCircle, Lock, Mail, ShieldAlert } from 'lucide-react';

const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email address is required')
    .email('Please enter a valid email address')
    .max(100, 'Email cannot exceed 100 characters'),
  password: z
    .string()
    .min(1, 'Password is required')
    .max(100, 'Password cannot exceed 100 characters')
});

export const LoginPage = () => {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [serverError, setServerError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const onSubmit = async (data) => {
    setServerError('');
    setIsLoading(true);
    try {
      const user = await login(data);
      showToast(`Welcome back, ${user.name}!`, 'success');

      // Role based redirection
      const destination =
        location.state?.from?.pathname ||
        (user.role === 'SUPER_ADMIN'
          ? '/super-admin/dashboard'
          : '/admin/dashboard');

      navigate(destination, { replace: true });
    } catch (err) {
      setServerError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFillDemo = (email, password) => {
    setValue('email', email, { shouldValidate: true });
    setValue('password', password, { shouldValidate: true });
  };

  return (
    <AuthLayout
      title="Sign in to your account"
      subtitle="Enter your ERP credentials to access your dashboard"
    >
      {serverError && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-800 text-sm">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="font-medium">{serverError}</div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <Input
          label="Email Address"
          type="email"
          placeholder="name@company.com"
          required
          autoComplete="email"
          error={errors.email?.message}
          {...register('email')}
        />

        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          required
          autoComplete="current-password"
          error={errors.password?.message}
          {...register('password')}
        />

        <div className="pt-2">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            isLoading={isLoading}
            icon={Lock}
          >
            Sign In
          </Button>
        </div>
      </form>

      {/* Quick Demo Credentials helper */}
      <div className="mt-8 pt-6 border-t border-slate-100">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2.5">
          Quick Test Credentials
        </p>
        <button
          type="button"
          onClick={() => handleFillDemo('superadmin@erp.com', 'SuperAdmin@123456')}
          className="w-full text-left p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 transition group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800">
              Super Admin
            </span>
            <span className="text-[11px] font-semibold text-blue-600 group-hover:underline">
              Auto-fill &rarr;
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1 font-mono">
            superadmin@erp.com / SuperAdmin@123456
          </p>
        </button>
      </div>
    </AuthLayout>
  );
};
