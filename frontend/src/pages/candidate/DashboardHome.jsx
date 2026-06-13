import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Eye, Briefcase, FileText, TrendingUp, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const STATS = [
  { label: 'Candidatures envoyées', value: '12', icon: Briefcase, color: 'text-primary-400' },
  { label: 'Vues du profil', value: '48', icon: Eye, color: 'text-purple-400' },
  { label: 'Matchs IA', value: '5', icon: Sparkles, color: 'text-amber-400' },
  { label: 'CV analysés', value: '2', icon: FileText, color: 'text-emerald-400' },
];

export function DashboardHome() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-100">Bonjour, Malak 👋</h2>
        <p className="text-slate-400 mt-2">Voici un résumé de votre activité de recherche d'emploi.</p>
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
              <Card className="glass-card hover:bg-white/5 cursor-default transition-colors">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-slate-400">
                    {stat.label}
                  </CardTitle>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-slate-100">{stat.value}</div>
                  <p className="text-xs text-emerald-400 flex items-center gap-1 mt-2">
                    <TrendingUp className="w-3 h-3" />
                    +12% ce mois
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <Card className="glass-panel">
          <CardHeader>
            <CardTitle>Candidatures Récentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-dark-800/30 border border-glass-border">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                      <Briefcase className="w-5 h-5 text-slate-300" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-200">Ingénieur Fullstack React</p>
                      <p className="text-xs text-slate-400">TechNova SAS • Paris</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 text-xs rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    En revue
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="glass-panel relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-primary-500/20 blur-3xl rounded-full pointer-events-none"></div>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary-400" />
              Recommandations IA
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 relative z-10">
              <div className="p-4 rounded-xl bg-gradient-to-br from-primary-600/10 to-purple-600/10 border border-primary-500/20">
                <p className="text-sm text-slate-300">
                  Votre profil correspond à <strong className="text-primary-400">85%</strong> pour le poste de <strong>Lead Développeur Frontend</strong> chez <strong>InnovCorp</strong>.
                </p>
                <button className="mt-3 text-xs font-medium text-primary-400 hover:text-primary-300 transition-colors">
                  Voir l'offre →
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
