import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Building2, MapPin, Calendar, ExternalLink, Filter } from 'lucide-react';

const APPLICATIONS = [
  {
    id: 1,
    role: 'Senior React Developer',
    company: 'TechNova',
    location: 'Paris (Hybride)',
    date: '12 Juin 2026',
    status: 'interview',
    matchScore: 92,
  },
  {
    id: 2,
    role: 'Frontend Engineer',
    company: 'InnovCorp',
    location: 'Remote',
    date: '10 Juin 2026',
    status: 'pending',
    matchScore: 85,
  },
  {
    id: 3,
    role: 'Lead Developer',
    company: 'StartupX',
    location: 'Lyon',
    date: '5 Juin 2026',
    status: 'rejected',
    matchScore: 64,
  }
];

const getStatusBadge = (status) => {
  switch(status) {
    case 'interview': return <span className="px-3 py-1 text-xs rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">Entretien planifié</span>;
    case 'pending': return <span className="px-3 py-1 text-xs rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">En attente</span>;
    case 'rejected': return <span className="px-3 py-1 text-xs rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">Refusé</span>;
    default: return <span className="px-3 py-1 text-xs rounded-full bg-slate-500/20 text-slate-300 border border-slate-500/30">{status}</span>;
  }
};

export function Applications() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-100">Mes Candidatures</h2>
          <p className="text-slate-400 mt-2">Suivez l'état d'avancement de vos postulations.</p>
        </div>
        <Button variant="outline" className="shrink-0">
          <Filter className="w-4 h-4 mr-2" />
          Filtrer
        </Button>
      </div>

      <Card className="glass-panel p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-dark-800/50 text-xs uppercase text-slate-400 border-b border-glass-border">
              <tr>
                <th scope="col" className="px-6 py-4 font-medium">Poste & Entreprise</th>
                <th scope="col" className="px-6 py-4 font-medium">Date</th>
                <th scope="col" className="px-6 py-4 font-medium">Match IA</th>
                <th scope="col" className="px-6 py-4 font-medium">Statut</th>
                <th scope="col" className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-glass-border">
              {APPLICATIONS.map((app) => (
                <tr key={app.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-medium text-slate-100">{app.role}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                      <span className="flex items-center gap-1"><Building2 className="w-3 h-3" /> {app.company}</span>
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {app.location}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1 text-slate-400">
                      <Calendar className="w-4 h-4" />
                      {app.date}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-full bg-dark-900 rounded-full h-1.5 w-16 overflow-hidden">
                        <div 
                          className={`h-1.5 rounded-full ${app.matchScore >= 80 ? 'bg-emerald-400' : app.matchScore >= 60 ? 'bg-amber-400' : 'bg-rose-400'}`} 
                          style={{ width: `${app.matchScore}%` }}
                        ></div>
                      </div>
                      <span className="text-xs font-medium">{app.matchScore}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(app.status)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button variant="ghost" size="sm">
                      Détails
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
