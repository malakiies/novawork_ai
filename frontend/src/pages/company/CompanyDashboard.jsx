import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Users, Briefcase, Eye, TrendingUp, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';

const STATS = [
  { label: 'Offres actives', value: '8', icon: Briefcase, color: 'text-company-400', trend: '+2' },
  { label: 'Candidatures (30j)', value: '142', icon: Users, color: 'text-blue-400', trend: '+24%' },
  { label: 'Vues des offres', value: '3.2k', icon: Eye, color: 'text-purple-400', trend: '+12%' },
  { label: 'Matchs > 80%', value: '15', icon: TrendingUp, color: 'text-emerald-400', trend: '+5' },
];

export function CompanyDashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-100">Vue d'ensemble</h2>
        <p className="text-slate-400 mt-2">Analysez les performances de vos recrutements et vos candidats.</p>
      </div>

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
            >
              <Card className="glass-card hover:bg-white/5 cursor-default transition-colors border-company-500/10">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-slate-400">
                    {stat.label}
                  </CardTitle>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-slate-100">{stat.value}</div>
                  <p className="text-xs text-company-400 flex items-center gap-1 mt-2">
                    <ArrowUpRight className="w-3 h-3" />
                    {stat.trend} ce mois
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <Card className="glass-panel border-company-500/10">
          <CardHeader>
            <CardTitle>Candidatures Récentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: 'Jean Dupont', role: 'Dev React', match: 92 },
                { name: 'Marie Curie', role: 'Data Scientist', match: 88 },
                { name: 'Paul Martin', role: 'Dev Backend', match: 75 },
              ].map((candidat, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-dark-800/30 border border-glass-border">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-company-600/20 text-company-300 font-bold flex items-center justify-center">
                      {candidat.name[0]}
                    </div>
                    <div>
                      <p className="font-medium text-slate-200">{candidat.name}</p>
                      <p className="text-xs text-slate-400">Postule pour : {candidat.role}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-company-400 font-bold text-sm">{candidat.match}% IA Match</span>
                    <button className="text-xs text-slate-500 hover:text-slate-300 mt-1">Examiner →</button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="glass-panel border-company-500/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-company-500/10 blur-3xl rounded-full pointer-events-none"></div>
          <CardHeader>
            <CardTitle>Performance des offres</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center border border-glass-border rounded-xl bg-dark-800/30 text-slate-500">
              [Graphique des vues/candidatures (Recharts)]
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
