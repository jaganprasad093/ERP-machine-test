import React from 'react';

export const StatusBadge = ({ status }) => {
  const isActive = status === 'ACTIVE';
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide ${
        isActive
          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
          : 'bg-rose-50 text-rose-700 border border-rose-200/60'
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          isActive ? 'bg-emerald-500' : 'bg-rose-500'
        }`}
      />
      {isActive ? 'Active' : 'Inactive'}
    </span>
  );
};

export const RoleBadge = ({ role }) => {
  const isSuper = role === 'SUPER_ADMIN';
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide ${
        isSuper
          ? 'bg-purple-50 text-purple-700 border border-purple-200/60'
          : 'bg-blue-50 text-blue-700 border border-blue-200/60'
      }`}
    >
      {isSuper ? 'Super Admin' : 'Admin'}
    </span>
  );
};
