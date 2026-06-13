import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Users, Building2, CreditCard, Activity, TrendingUp, AlertTriangle, Briefcase, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell, Legend
} from 'recharts';

const COLORS = ['#10B981', '#F59E0B', '#3B82F6', '#8B5CF6']; // Tailwind Emerald, Amber, Blue, Violet

export function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const token = useSelector(state => state.auth.accessToken);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await axios.get('/api/v1/analytics/dashboard', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setData(res.data.data);
      } catch (err) {
        console.error('Erreur chargement analytics', err);
      } finally {
        setLoading(false);
      }
    };
    
    if (token) fetchAnalytics();
  }, [token]);

  if (loading || !data) {
    return <div className="p-8 text-slate-400">Chargement des analytiques en temps réel...</div>;
  }

  const { kpis, charts, alerts } = data;

  const STATS = [
    { label: 'Utilisateurs totaux', value: kpis.totalUsers, icon: Users, color: 'text-blue-400', trend: 'Live' },
    { label: 'Entreprises actives', value: kpis.totalCompanies, icon: Building2, color: 'text-emerald-400', trend: 'Live' },
    { label: 'Offres publiées', value: kpis.totalJobs, icon: Briefcase, color: 'text-amber-400', trend: 'Live' },
    { label: 'Candidatures (Total)', value: kpis.totalApplications, icon: FileText, color: 'text-violet-400', trend: 'Live' },
    { label: 'MRR (Revenus)', value: `${kpis.currentMRR.toFixed(2)} €`, icon: CreditCard, color: 'text-admin-400', trend: 'Mensuel' },
    { label: 'Santé API', value: `${kpis.apiHealth}%`, icon: Activity, color: 'text-emerald-400', trend: 'Opérationnel' },
  ];

  return (
    <div className="space-y-8 pb-10">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-100">Supervision Globale (God Mode)</h2>
        <p className="text-slate-400 mt-2">Vue d'ensemble des métriques d'acquisition et des revenus de NovaWork AI.</p>
      </div>

      {/* KPIs Grid */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {STATS.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
            >
              <Card className="glass-card hover:bg-white/5 cursor-default transition-colors border-admin-500/20">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-slate-400">
                    {stat.label}
                  </CardTitle>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-slate-100">{stat.value}</div>
                  <p className="text-xs text-admin-400 flex items-center gap-1 mt-2 opacity-80">
                    <TrendingUp className="w-3 h-3" />
                    {stat.trend}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Main Charts Area */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        
        {/* Bar Chart - Acquisition */}
        <Card className="lg:col-span-2 glass-panel border-admin-500/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-admin-500/10 blur-3xl rounded-full pointer-events-none"></div>
          <CardHeader>
            <CardTitle>Évolution de l'Acquisition (6 derniers mois)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.acquisitionData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                  <XAxis dataKey="name" stroke="#94a3b8" tick={{fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                  <YAxis stroke="#94a3b8" tick={{fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc' }}
                    cursor={{fill: '#ffffff05'}}
                  />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  <Bar dataKey="Utilisateurs" fill="#3B82F6" radius={[4, 4, 0, 0]} maxBarSize={50} />
                  <Bar dataKey="Entreprises" fill="#10B981" radius={[4, 4, 0, 0]} maxBarSize={50} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Pie Chart - Plans Distribution */}
        <Card className="lg:col-span-1 glass-panel border-admin-500/10">
          <CardHeader>
            <CardTitle>Répartition des Abonnements</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center">
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts.plansDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {charts.plansDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc' }}
                    itemStyle={{ color: '#fff', textTransform: 'capitalize' }}
                  />
                  <Legend formatter={(value) => <span className="capitalize text-slate-300">{value}</span>} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {charts.plansDistribution.every(p => p.value === 0) && (
              <p className="text-xs text-slate-500 mt-2 text-center">Aucun abonnement actif pour le moment.</p>
            )}
          </CardContent>
        </Card>

        {/* Line Chart - Revenue */}
        <Card className="lg:col-span-2 glass-panel border-admin-500/10">
          <CardHeader>
            <CardTitle>Évolution des Revenus Stripe (MRR)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={charts.revenueData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                  <XAxis dataKey="name" stroke="#94a3b8" tick={{fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                  <YAxis stroke="#94a3b8" tick={{fill: '#94a3b8'}} axisLine={false} tickLine={false} tickFormatter={(value) => `${value}€`} />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc' }}
                    formatter={(value) => [`${value} €`, 'Revenu']}
                  />
                  <Line type="monotone" dataKey="MRR" stroke="#F59E0B" strokeWidth={3} dot={{r: 4, fill: '#F59E0B', strokeWidth: 0}} activeDot={{r: 6}} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* System Alerts */}
        <Card className="lg:col-span-1 glass-panel border-admin-500/10 h-full">
          <CardHeader>
            <CardTitle>Alertes Système</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {alerts.length === 0 ? (
              <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex gap-3 items-center">
                <Activity className="w-5 h-5 text-emerald-400 shrink-0" />
                <p className="text-sm font-medium text-emerald-300">Tous les systèmes sont opérationnels.</p>
              </div>
            ) : (
              alerts.map((alert, idx) => (
                <div key={idx} className={`p-3 rounded-lg flex gap-3 border ${
                  alert.type === 'error' ? 'bg-rose-500/10 border-rose-500/20' : 'bg-amber-500/10 border-amber-500/20'
                }`}>
                  <AlertTriangle className={`w-5 h-5 shrink-0 ${alert.type === 'error' ? 'text-rose-400' : 'text-amber-400'}`} />
                  <div>
                    <p className={`text-sm font-medium ${alert.type === 'error' ? 'text-rose-300' : 'text-amber-300'}`}>{alert.title}</p>
                    <p className={`text-xs mt-1 ${alert.type === 'error' ? 'text-rose-400/80' : 'text-amber-400/80'}`}>{alert.message}</p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
