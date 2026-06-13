import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Building2, Briefcase, CreditCard, Terminal, Sparkles } from 'lucide-react';
import { cn } from './ui/Card';

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Stats Globales', to: '/admin' },
  { icon: Users, label: 'Candidats', to: '/admin/users' },
  { icon: Building2, label: 'Entreprises', to: '/admin/companies' },
  { icon: Briefcase, label: 'Offres & Modération', to: '/admin/jobs' },
  { icon: CreditCard, label: 'Paiements & MRR', to: '/admin/payments' },
  { icon: Terminal, label: 'Logs Système', to: '/admin/logs' },
];

export function AdminSidebar() {
  return (
    <aside className="w-72 hidden md:flex flex-col h-screen sticky top-0 border-r border-glass-border bg-dark-900/50 backdrop-blur-xl">
      <div className="p-6">
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-admin-400 to-orange-400 flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-admin-400" />
          NovaWork AI
        </h1>
        <p className="text-xs font-bold text-admin-500 mt-1 pl-8 uppercase tracking-widest">God Mode</p>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/admin'}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group",
                  isActive
                    ? "bg-admin-600/10 text-admin-400 font-medium border border-admin-500/20"
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
        <div className="p-4 rounded-xl bg-dark-800/80 border border-admin-500/30 flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]"></div>
          <span className="text-xs text-slate-300 font-mono">Système Opérationnel</span>
        </div>
      </div>
    </aside>
  );
}
