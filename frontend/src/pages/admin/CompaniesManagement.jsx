import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Search, Building2, CheckCircle, AlertCircle, ShieldAlert } from 'lucide-react';

const COMPANIES = [
  { id: 1, name: 'TechNova SAS', plan: 'Pro', status: 'Verified', jobs: 8, email: 'contact@technova.fr' },
  { id: 2, name: 'InnovCorp', plan: 'Free', status: 'Pending', jobs: 0, email: 'rh@innovcorp.com' },
  { id: 3, name: 'ScamCompany', plan: 'Free', status: 'Suspended', jobs: 0, email: 'fake@scam.com' }
];

export function CompaniesManagement() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-100">Gestion des Entreprises</h2>
          <p className="text-slate-400 mt-2">Vérifiez la légitimité des recruteurs et gérez leurs limites.</p>
        </div>
      </div>

      <div className="grid gap-6">
        {COMPANIES.map((company) => (
          <Card key={company.id} className="glass-panel border-admin-500/10">
            <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-dark-800 border border-glass-border flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-slate-500" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-slate-100">{company.name}</h3>
                    {company.status === 'Verified' && <CheckCircle className="w-4 h-4 text-emerald-400" />}
                    {company.status === 'Suspended' && <ShieldAlert className="w-4 h-4 text-rose-400" />}
                  </div>
                  <p className="text-sm text-slate-400">{company.email}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-8 w-full md:w-auto justify-between md:justify-end">
                <div className="text-center">
                  <p className="text-xs text-slate-500 uppercase">Plan</p>
                  <p className={`font-semibold ${company.plan === 'Pro' ? 'text-admin-400' : 'text-slate-300'}`}>{company.plan}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-slate-500 uppercase">Offres</p>
                  <p className="font-semibold text-slate-300">{company.jobs}</p>
                </div>
                <div className="flex gap-2">
                  {company.status === 'Pending' && (
                    <Button size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-white">Approuver</Button>
                  )}
                  {company.status !== 'Suspended' && (
                    <Button size="sm" variant="danger">Suspendre</Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
