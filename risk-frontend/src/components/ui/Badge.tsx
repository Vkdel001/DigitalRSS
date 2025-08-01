
// src/components/ui/Badge.tsx
import React from 'react';
import { clsx } from 'clsx';
import { RiskBand, SubmissionStatus } from '../../types';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'purple';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'default', className }) => {
  const variantClasses = {
    default: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    purple: 'bg-purple-100 text-purple-800',
  };

  return (
    <span className={clsx(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
      variantClasses[variant],
      className
    )}>
      {children}
    </span>
  );
};

export const RiskBadge: React.FC<{ risk: RiskBand }> = ({ risk }) => {
  const variants = {
    Low: 'success',
    Medium: 'warning',
    High: 'danger',
    AutoHigh: 'purple',
    NoGo: 'danger',
  } as const;

  return <Badge variant={variants[risk]}>🎯 {risk}</Badge>;
};

export const StatusBadge: React.FC<{ status: SubmissionStatus }> = ({ status }) => {
  const variants = {
    pending: 'warning',
    approved: 'success',
    rejected: 'danger',
    escalated: 'purple',
  } as const;

  const labels = {
    pending: '⏳ Pending',
    approved: '✅ Approved',
    rejected: '❌ Rejected',
    escalated: '⬆️ Escalated',
  };

  return <Badge variant={variants[status]}>{labels[status]}</Badge>;
};