import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/common/Button';
import { FileQuestion, ArrowLeft } from 'lucide-react';

export const NotFoundPage = () => {
  const { isAuthenticated, user } = useAuth();
  const target = !isAuthenticated
    ? '/login'
    : user?.role === 'SUPER_ADMIN'
    ? '/super-admin/dashboard'
    : '/admin/dashboard';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-center p-6">
      <div className="w-16 h-16 rounded-3xl bg-blue-100 text-blue-600 flex items-center justify-center mb-6 shadow-sm">
        <FileQuestion className="w-9 h-9" />
      </div>
      <h1 className="text-4xl font-black text-slate-900 tracking-tight">404</h1>
      <h2 className="text-xl font-bold text-slate-800 mt-2">Page Not Found</h2>
      <p className="mt-2 text-sm text-slate-500 max-w-sm">
        The requested resource or page could not be located on the ERP platform.
      </p>
      <div className="mt-6">
        <Link to={target}>
          <Button variant="primary" icon={ArrowLeft}>
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  );
};
