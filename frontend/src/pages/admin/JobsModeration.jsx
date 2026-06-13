import React from 'react';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Briefcase, AlertTriangle, Check, Trash2 } from 'lucide-react';

const JOBS = [
  { id: 1, title: 'Dev React', company: 'TechNova', status: 'Flagged', reason: 'Mots clés abusifs (Keyword Stuffing)' },
  { id: 2, title: 'Lead Data', company: 'InnovCorp', status: 'Active', reason: null },
];

export function JobsModeration() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-100">Modération des offres</h2>
        <p className="text-slate-400 mt-2">Analysez les annonces signalées par les candidats ou l'IA de filtrage.</p>
      </div>

      <div className="space-y-4">
        {JOBS.map((job) => (
          <Card key={job.id} className={`glass-panel ${job.status === 'Flagged' ? 'border-amber-500/30' : 'border-admin-500/10'}`}>
            <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-dark-800 flex items-center justify-center border border-glass-border">
                  <Briefcase className="w-5 h-5 text-slate-400" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-200">{job.title}</h3>
                  <p className="text-sm text-slate-400">{job.company}</p>
                </div>
              </div>
              
              {job.status === 'Flagged' && (
                <div className="px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-center gap-2 flex-1 md:mx-8">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="text-sm text-amber-300">Signalé : {job.reason}</span>
                </div>
              )}

              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="text-emerald-400 border-emerald-400/30 hover:bg-emerald-400/10">
                  <Check className="w-4 h-4 mr-1" /> Valider
                </Button>
                <Button size="sm" variant="outline" className="text-rose-400 border-rose-400/30 hover:bg-rose-400/10">
                  <Trash2 className="w-4 h-4 mr-1" /> Supprimer
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
