import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/common/Button';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export const UnauthorizedPage = () => {
  const { user } = useAuth();
  const targetDashboard =
    user?.role === 'SUPER_ADMIN'
      ? '/super-admin/dashboard'
      : '/admin/dashboard';

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6">
      <div className="w-16 h-16 rounded-3xl bg-rose-100 text-rose-600 flex items-center justify-center mb-6 shadow-sm">
        <ShieldAlert className="w-9 h-9" />
      </div>
      <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
        403 - Access Forbidden
      </h1>
      <p className="mt-2 text-sm text-slate-600 max-w-md">
        You do not have the required administrative role privileges to access this area.
      </p>
      <div className="mt-6">
        <Link to={targetDashboard}>
          <Button variant="primary" icon={ArrowLeft}>
            Return to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
};
