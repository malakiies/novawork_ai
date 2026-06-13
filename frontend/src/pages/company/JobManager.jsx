import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Briefcase, Plus, Users, Eye, MoreHorizontal } from 'lucide-react';

const JOBS = [
  {
    id: 1,
    title: 'Senior React Developer',
    status: 'Active',
    candidates: 45,
    views: 1250,
    postedAt: '12 Juin 2026',
  },
  {
    id: 2,
    title: 'Lead UI/UX Designer',
    status: 'Active',
    candidates: 12,
    views: 890,
    postedAt: '10 Juin 2026',
  },
  {
    id: 3,
    title: 'Data Engineer',
    status: 'Paused',
    candidates: 85,
    views: 2100,
    postedAt: '1 Juin 2026',
  }
];

export function JobManager() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-100">Gestion des offres</h2>
          <p className="text-slate-400 mt-2">Créez et suivez vos annonces d'emploi.</p>
        </div>
        <Button className="shrink-0 bg-company-600 hover:bg-company-500 shadow-company-500/20 border-company-500/50">
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle offre
        </Button>
      </div>

      <Card className="glass-panel p-0 overflow-hidden border-company-500/10">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-dark-800/50 text-xs uppercase text-slate-400 border-b border-glass-border">
              <tr>
                <th scope="col" className="px-6 py-4 font-medium">Poste</th>
                <th scope="col" className="px-6 py-4 font-medium">Statut</th>
                <th scope="col" className="px-6 py-4 font-medium">Candidats</th>
                <th scope="col" className="px-6 py-4 font-medium">Vues</th>
                <th scope="col" className="px-6 py-4 font-medium">Date</th>
                <th scope="col" className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-glass-border">
              {JOBS.map((job) => (
                <tr key={job.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-medium text-slate-100 flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-slate-500" />
                      {job.title}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    {job.status === 'Active' ? (
                      <span className="px-2 py-1 text-xs rounded border bg-company-500/20 border-company-500/30 text-company-300">Actif</span>
                    ) : (
                      <span className="px-2 py-1 text-xs rounded border bg-amber-500/20 border-amber-500/30 text-amber-300">En pause</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-slate-500" />
                      <span className="font-medium text-slate-200">{job.candidates}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-slate-400">
                      <Eye className="w-4 h-4" />
                      {job.views}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-400">
                    {job.postedAt}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-white">
                      <MoreHorizontal className="w-4 h-4" />
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
