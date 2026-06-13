import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Building2, Briefcase, Users, Sparkles, MessageSquare, CreditCard } from 'lucide-react';
import { cn } from './ui/Card';

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Vue d\'ensemble', to: '/company' },
  { icon: Building2, label: 'Profil Entreprise', to: '/company/profile' },
  { icon: Briefcase, label: 'Gestion des offres', to: '/company/jobs' },
  { icon: Users, label: 'Kanban ATS', to: '/company/ats' },
  { icon: Sparkles, label: 'Sourcing IA', to: '/company/ai-matching' },
  { icon: MessageSquare, label: 'Messagerie', to: '/company/chat' },
  { icon: CreditCard, label: 'Facturation', to: '/company/billing' },
];

export function CompanySidebar() {
  return (
    <aside className="w-72 hidden md:flex flex-col h-screen sticky top-0 border-r border-glass-border bg-dark-900/50 backdrop-blur-xl">
      <div className="p-6">
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-company-400 to-emerald-400 flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-company-400" />
          NovaWork AI
        </h1>
        <p className="text-xs text-slate-400 mt-1 pl-8">Espace Recruteur</p>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/company'}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group",
                  isActive
                    ? "bg-company-600/10 text-company-400 font-medium"
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
        <div className="p-4 rounded-xl bg-gradient-to-br from-company-600/20 to-emerald-600/20 border border-company-500/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-2 -mr-2 w-16 h-16 bg-company-500/20 blur-xl rounded-full"></div>
          <h4 className="font-semibold text-sm text-slate-200">Plan Pro</h4>
          <p className="text-xs text-slate-400 mt-1">Sourcing illimité</p>
        </div>
      </div>
    </aside>
  );
}
