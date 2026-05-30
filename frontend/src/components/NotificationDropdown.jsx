import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef(null);

  const fetchNotifications = async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const response = await api.get('/notifikasi/');
      setNotifications(response.data);
      setUnreadCount(response.data.filter(n => !n.is_read).length);
    } catch (err) {
      console.error('Gagal memuat notifikasi:', err);
      // Jika 401, biarkan interceptor api.js yang menangani
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Refresh notifications every 60 seconds (silent polling)
    const interval = setInterval(() => fetchNotifications(true), 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAsRead = async (id) => {
    try {
      await api.patch(`/notifikasi/${id}/read`);
      setNotifications(notifications.map(n => 
        n.notifikasi_id === id ? { ...n, is_read: true } : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Gagal menandai notifikasi dibaca:', err);
    }
  };

  const markAllAsRead = async () => {
    if (unreadCount === 0) return;
    
    const loadingToast = toast.loading('Menandai semua dibaca...');
    try {
      await api.patch('/notifikasi/read-all');
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
      toast.success('Semua notifikasi ditandai dibaca', { id: loadingToast });
    } catch (err) {
      toast.error('Gagal memperbarui notifikasi', { id: loadingToast });
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-white/90 hover:bg-white/10 rounded-full transition-colors focus:outline-none"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-[10px] items-center justify-center font-bold text-white">
              {unreadCount}
            </span>
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
          <div className="p-4 border-b border-gray-50 flex justify-between items-center">
            <h3 className="font-bold text-gray-800 text-sm">Notifikasi</h3>
            {unreadCount > 0 && (
              <button 
                onClick={markAllAsRead}
                className="text-[10px] text-indigo-600 font-bold hover:underline"
              >
                Tandai semua dibaca
              </button>
            )}
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="animate-spin h-5 w-5 border-2 border-indigo-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                <p className="text-[10px] text-gray-400">Memuat...</p>
              </div>
            ) : notifications.length > 0 ? (
              notifications.map((n) => (
                <div 
                  key={n.notifikasi_id}
                  onClick={() => !n.is_read && markAsRead(n.notifikasi_id)}
                  className={`p-4 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors cursor-pointer flex gap-3 ${!n.is_read ? 'bg-indigo-50/30' : ''}`}
                >
                  <div className={`w-2 h-2 mt-1.5 rounded-full shrink-0 ${!n.is_read ? 'bg-indigo-500' : 'bg-transparent'}`}></div>
                  <div className="space-y-1">
                    <p className={`text-xs leading-relaxed ${!n.is_read ? 'text-gray-900 font-semibold' : 'text-gray-600'}`}>
                      {n.isi_notifikasi}
                    </p>
                    {n.created_at && (
                      <p className="text-[10px] text-gray-400 font-medium">
                        {new Date(n.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false })} • {new Date(n.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-400">
                <p className="text-xs italic">Belum ada notifikasi.</p>
              </div>
            )}
          </div>
          
          <div className="p-3 bg-gray-50 text-center border-t border-gray-50">
            <button 
              onClick={() => setIsOpen(false)}
              className="text-[10px] text-gray-500 font-bold hover:text-indigo-600 transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
