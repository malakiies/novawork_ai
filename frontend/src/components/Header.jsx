import React from 'react';
import { Search, Bell, Menu } from 'lucide-react';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../store/slices/authSlice';
import { selectUnreadCount } from '../store/slices/notificationSlice';

import { NotificationBell } from './NotificationBell';

export function Header() {
  const user = useSelector(selectCurrentUser);

  return (
    <header className="h-20 border-b border-glass-border bg-dark-900/50 backdrop-blur-md sticky top-0 z-50 flex items-center justify-between px-6 lg:px-10">
      
      {/* Mobile Menu Toggle (to be wired up later) */}
      <button className="md:hidden p-2 text-slate-400 hover:text-white transition-colors">
        <Menu className="w-6 h-6" />
      </button>

      {/* Search Bar */}
      <div className="hidden md:flex relative w-96">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="w-5 h-5 text-slate-500" />
        </div>
        <input
          type="text"
          className="glass-input pl-10 bg-dark-800/30"
          placeholder="Rechercher une offre, une compétence..."
        />
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center gap-6">
        
        {/* Notifications */}
        <NotificationBell />

        {/* Profile Dropdown (Simplified) */}
        <div className="flex items-center gap-3 cursor-pointer hover:bg-white/5 p-2 rounded-xl transition-colors">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary-500 to-purple-500 flex items-center justify-center text-white font-semibold shadow-lg shadow-primary-500/20">
            {user?.firstName?.[0] || 'U'}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-slate-200">{user?.firstName || 'Utilisateur'}</p>
            <p className="text-xs text-slate-500 capitalize">{user?.role || 'Candidat'}</p>
          </div>
        </div>

      </div>
    </header>
  );
}
