
// src/components/layout/Layout.tsx
import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const Layout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: '📊' },
    { name: 'Submissions', href: '/submissions', icon: '📝' },
    { name: 'Create', href: '/submissions/create', icon: '➕' },
    { name: 'Create Enhanced', href: '/submissions/create-enhanced', icon: '🎯' },
  ];

  const adminNavigation = [
    { name: 'Admin', href: '/admin', icon: '⚙️' },
    { name: 'Risk Parameters', href: '/admin/parameters', icon: '📋' },
    { name: 'Settings', href: '/admin/settings', icon: '🔧' },
    { name: 'Master Data', href: '/admin/master-data', icon: '🗃️' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <h1 className="text-xl font-bold text-gray-900">🔐 Risk Portal</h1>
              
              <nav className="flex space-x-6">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      location.pathname === item.href
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    {item.icon} {item.name}
                  </Link>
                ))}
                
                {user?.role === 'admin' && adminNavigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      location.pathname === item.href
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    {item.icon} {item.name}
                  </Link>
                ))}
              </nav>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {user?.email} ({user?.role})
              </span>
              <button
                onClick={logout}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        <Outlet />
      </main>
    </div>
  );
};