
// src/components/ui/Card.tsx
import React from 'react';
import { clsx } from 'clsx';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className }) => {
  return (
    <div className={clsx('bg-white rounded-lg shadow border border-gray-200 p-6', className)}>
      {children}
    </div>
  );
};
