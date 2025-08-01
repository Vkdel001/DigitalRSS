// src/components/ui/MultiSelect.tsx
import React, { useState } from 'react';
import { clsx } from 'clsx';

interface Option {
  value: string;
  label: string;
  riskLevel?: string;
}

interface MultiSelectProps {
  label: string;
  options: Option[];
  value: string[];
  onChange: (value: string[]) => void;
  error?: string;
  placeholder?: string;
}

export const MultiSelect: React.FC<MultiSelectProps> = ({
  label,
  options,
  value,
  onChange,
  error,
  placeholder = 'Select options...'
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = (optionValue: string) => {
    if (value.includes(optionValue)) {
      onChange(value.filter(v => v !== optionValue));
    } else {
      onChange([...value, optionValue]);
    }
  };

  const getRiskBadgeColor = (riskLevel?: string) => {
    switch (riskLevel) {
      case 'Low': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'High': return 'bg-red-100 text-red-800';
      case 'AutoHigh': return 'bg-purple-100 text-purple-800';
      case 'NoGo': return 'bg-red-200 text-red-900';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={clsx(
            'w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-left',
            error ? 'border-red-300' : 'border-gray-300'
          )}
        >
          {value.length === 0 ? (
            <span className="text-gray-500">{placeholder}</span>
          ) : (
            <span>{value.length} item(s) selected</span>
          )}
          <span className="absolute inset-y-0 right-0 flex items-center pr-2">
            ▼
          </span>
        </button>

        {isOpen && (
          <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
            {options.map((option) => (
              <div
                key={option.value}
                className="px-3 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100"
                onClick={() => handleToggle(option.value)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={value.includes(option.value)}
                      onChange={() => {}}
                      className="mr-3"
                    />
                    <span className="text-sm">{option.label}</span>
                  </div>
                  {option.riskLevel && (
                    <span className={clsx(
                      'px-2 py-1 rounded-full text-xs font-medium',
                      getRiskBadgeColor(option.riskLevel)
                    )}>
                      {option.riskLevel}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Selected items display */}
      {value.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {value.map((selectedValue) => {
            const option = options.find(o => o.value === selectedValue);
            return (
              <span
                key={selectedValue}
                className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
              >
                {option?.label}
                <button
                  type="button"
                  onClick={() => handleToggle(selectedValue)}
                  className="ml-1 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            );
          })}
        </div>
      )}
      
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};