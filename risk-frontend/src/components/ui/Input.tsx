// src/components/ui/Input.tsx
import React, { forwardRef } from 'react';
import { clsx } from 'clsx';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string; // Make sure this is string only
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  className,
  id,
  ...props
}, ref) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      
      <input
        ref={ref}
        id={inputId}
        className={clsx(
          'w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
          error ? 'border-red-300' : 'border-gray-300',
          className
        )}
        {...props}
      />
      
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';