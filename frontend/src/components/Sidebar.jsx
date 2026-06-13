import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, User, FileText, Briefcase, MessageSquare, Settings, Sparkles } from 'lucide-react';
import { cn } from './ui/Card';

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Tableau de bord', to: '/candidate' },
  { icon: User, label: 'Mon Profil', to: '/candidate/profile' },
  { icon: FileText, label: 'Gérer mes CVs', to: '/candidate/cvs' },
  { icon: Briefcase, label: 'Mes candidatures', to: '/candidate/applications' },
  { icon: Sparkles, label: 'Générateur de Lettre', to: '/candidate/cover-letter' },
  { icon: MessageSquare, label: 'Chat IA Carrière', to: '/candidate/chat' },
  { icon: Settings, label: 'Paramètres', to: '/candidate/settings' },
];

export function Sidebar() {
  return (
    <aside className="w-72 hidden md:flex flex-col h-screen sticky top-0 border-r border-glass-border bg-dark-900/50 backdrop-blur-xl">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gradient flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-primary-400" />
          NovaWork AI
        </h1>
        <p className="text-xs text-slate-400 mt-1 pl-8">Espace Candidat</p>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/candidate'}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group",
                  isActive
                    ? "bg-primary-600/10 text-primary-400 font-medium"
                    : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                )
              }
            >
              <Icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-6">
        <div className="p-4 rounded-xl bg-gradient-to-br from-primary-600/20 to-purple-600/20 border border-primary-500/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-2 -mr-2 w-16 h-16 bg-primary-500/20 blur-xl rounded-full"></div>
          <h4 className="font-semibold text-sm text-slate-200">Plan Premium</h4>
          <p className="text-xs text-slate-400 mt-1">Générations IA illimitées</p>
        </div>
      </div>
    </aside>
  );
}
