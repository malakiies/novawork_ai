import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { LogOut, LayoutDashboard, Briefcase, Calendar, Users, Settings } from 'lucide-react';
import { logout } from '../store/slices/authSlice';
import { NotificationBell } from './NotificationBell';

const navigation = [
  { name: 'Tableau de bord', href: '/candidate', icon: LayoutDashboard },
  { name: 'Mon Profil', href: '/candidate/profile', icon: Users },
  { name: 'Mes CVs', href: '/candidate/cvs', icon: Briefcase },
  { name: 'Mes Candidatures', href: '/candidate/applications', icon: Briefcase },
  { name: 'Lettre de Motivation', href: '/candidate/cover-letter', icon: Briefcase },
  { name: 'Coach IA', href: '/candidate/chat', icon: Briefcase },
  { name: 'Paramètres', href: '/candidate/settings', icon: Settings },
];

export function DashboardLayout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const location = useLocation();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-dark-900 text-slate-100 overflow-hidden font-sans">
      
      {/* Sidebar (Left) */}
      <aside className="w-64 border-r border-glass-border bg-dark-800/30 backdrop-blur-md flex flex-col relative z-10">
        <div className="p-6 border-b border-glass-border">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-primary-500/20">
              <span className="text-white font-bold font-serif">N</span>
            </div>
            <span className="text-xl font-bold font-serif tracking-tight text-white">NovaWork</span>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  isActive 
                    ? 'bg-primary-500/10 text-primary-400 font-medium' 
                    : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                }`}
              >
                <item.icon className={`w-5 h-5 transition-colors ${isActive ? 'text-primary-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-glass-border bg-dark-900/50">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="w-10 h-10 rounded-full bg-primary-900 border border-primary-500/30 flex items-center justify-center text-primary-400 font-bold uppercase shadow-inner">
              {user?.firstName?.[0] || 'C'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-200 truncate">{user?.firstName} {user?.lastName}</p>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            </div>
            <button onClick={handleLogout} className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content (Right) */}
      <main className="flex-1 flex flex-col relative z-0">
        
        {/* Top Header */}
        <header className="h-16 border-b border-glass-border bg-dark-800/10 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-medium text-slate-200">
              {navigation.find(n => n.href === location.pathname)?.name || 'Dashboard'}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <NotificationBell />
          </div>
        </header>
        
        <div className="flex-1 overflow-y-auto p-6 lg:p-10 scroll-smooth">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
