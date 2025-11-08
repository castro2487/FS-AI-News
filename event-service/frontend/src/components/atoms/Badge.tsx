import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'draft' | 'published' | 'cancelled' | 'upcoming';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'draft', className = '' }) => {
  const variants = {
    draft: 'bg-gray-100 text-gray-800',
    published: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    upcoming: 'bg-blue-100 text-blue-800',
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};