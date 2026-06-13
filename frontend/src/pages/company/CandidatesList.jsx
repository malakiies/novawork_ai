import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Search, Filter, Sparkles, UserCheck, MessageSquare } from 'lucide-react';

export function CandidatesList() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-100">Candidats</h2>
          <p className="text-slate-400 mt-2">Gérez le pipeline de vos postulants.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input 
              type="text" 
              className="w-full bg-dark-800/50 border border-glass-border rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-company-500 text-slate-200"
              placeholder="Rechercher un nom..."
            />
          </div>
          <Button variant="outline" className="shrink-0 border-company-500/30 text-company-100 hover:bg-company-500/10">
            <Filter className="w-4 h-4 mr-2" />
            Filtrer
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Kanban Board columns placeholder */}
        {[
          { title: 'Nouveau', count: 12, border: 'border-slate-500/30' },
          { title: 'En revue', count: 5, border: 'border-blue-500/30' },
          { title: 'Entretien', count: 3, border: 'border-company-500/30' },
          { title: 'Offre', count: 1, border: 'border-amber-500/30' }
        ].map((col) => (
          <div key={col.title} className="flex flex-col h-[600px] bg-dark-800/20 rounded-2xl border border-glass-border p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-300">{col.title}</h3>
              <span className={`px-2 py-0.5 text-xs rounded bg-dark-900 border ${col.border} text-slate-400`}>
                {col.count}
              </span>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto pr-2">
              {/* Kanban Card Sample */}
              {col.count > 0 && (
                <Card className="glass-card p-4 cursor-grab active:cursor-grabbing border-company-500/10 hover:border-company-500/30 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-company-600 to-emerald-400 flex items-center justify-center text-xs font-bold text-white shadow-lg">
                        JD
                      </div>
                      <div>
                        <p className="font-medium text-slate-200 text-sm">Jean Dupont</p>
                        <p className="text-[10px] text-slate-500">React Dev</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-3 flex items-center gap-2">
                    <div className="flex-1 bg-dark-900 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-company-400 h-1.5 w-[92%] rounded-full"></div>
                    </div>
                    <span className="text-xs font-bold text-company-400">92%</span>
                  </div>

                  <div className="mt-4 flex items-center justify-between pt-3 border-t border-glass-border">
                    <button className="text-slate-400 hover:text-company-400 transition-colors">
                      <MessageSquare className="w-4 h-4" />
                    </button>
                    <button className="text-slate-400 hover:text-company-400 transition-colors">
                      <UserCheck className="w-4 h-4" />
                    </button>
                  </div>
                </Card>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
