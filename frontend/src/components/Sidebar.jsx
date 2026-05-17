import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Sidebar({ links = [] }) {
  const location = useLocation();

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen p-4 flex flex-col justify-between">
      <div>
        <div className="mb-8 px-2">
          <h2 className="text-lg font-bold text-gray-800">Menu Navigasi</h2>
        </div>
        <nav className="space-y-1">
          {links.map((link, idx) => (
            <Link
              key={idx}
              to={link.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                location.pathname === link.path
                  ? 'bg-indigo-50 text-indigo-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span>{link.icon}</span>
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="border-t border-gray-100 pt-4">
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors">
          🚪 Keluar
        </button>
      </div>
    </aside>
  );
}