import React from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useAuth } from '../context/AuthContext';

export default function AppLayout() {
  const location = useLocation();
  const { user } = useAuth();
  
  // Deteksi Role untuk Tema Header
  const role = user?.role?.toUpperCase() || 'MAHASISWA';
  const roleColors = {
    MAHASISWA: 'bg-blue-600',
    DOSEN: 'bg-emerald-600',
    STAFF: 'bg-indigo-600',
  };

  // Generate Breadcrumbs sederhana dari Pathname
  const pathnames = location.pathname.split('/').filter((x) => x);
  
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar - Fixed on the left */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <Header 
          title={pathnames[pathnames.length - 1]?.replace('-', ' ').toUpperCase() || 'Dashboard'} 
          userName={user?.nama || 'User'} 
          userDetail={`${role} • ${user?.nim || user?.nip || ''}`}
          bgColor={roleColors[role]}
        />

        {/* Breadcrumbs & Dynamic Content */}
        <main className="flex-1 overflow-y-auto p-8">
          <nav className="flex mb-6 text-sm text-gray-400 font-medium" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              <li className="inline-flex items-center">
                <Link to={`/${role.toLowerCase()}/dashboard`} className="hover:text-gray-600 transition-colors">
                  {role.charAt(0) + role.slice(1).toLowerCase()}
                </Link>
              </li>
              {pathnames.slice(1).map((name, index) => (
                <li key={index} className="flex items-center">
                  <svg className="w-4 h-4 mx-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="ml-1 md:ml-2 text-gray-500 capitalize">
                    {name.replace('-', ' ')}
                  </span>
                </li>
              ))}
            </ol>
          </nav>

          {/* Render Halaman Konten */}
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
