import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { CreditCard, TrendingUp, ArrowDownRight, ArrowUpRight } from 'lucide-react';

export function PaymentsManagement() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-100">Paiements & MRR</h2>
        <p className="text-slate-400 mt-2">Suivez la santé financière de la plateforme (Stripe Integration).</p>
      </div>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
        <Card className="glass-panel border-admin-500/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">MRR Actuel</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-100">45,200 €</div>
            <p className="text-xs text-emerald-400 flex items-center gap-1 mt-2">
              <ArrowUpRight className="w-3 h-3" /> +12% vs mois dernier
            </p>
          </CardContent>
        </Card>
        
        <Card className="glass-panel border-admin-500/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Nouveaux Abonnements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-100">124</div>
            <p className="text-xs text-emerald-400 flex items-center gap-1 mt-2">
              <ArrowUpRight className="w-3 h-3" /> +5% vs mois dernier
            </p>
          </CardContent>
        </Card>

        <Card className="glass-panel border-admin-500/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Taux de Churn</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-100">2.1%</div>
            <p className="text-xs text-rose-400 flex items-center gap-1 mt-2">
              <ArrowDownRight className="w-3 h-3" /> +0.4% vs mois dernier
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-panel border-admin-500/10">
        <CardHeader>
          <CardTitle>Transactions Récentes (Stripe)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-dark-800/50 text-xs uppercase text-slate-400 border-b border-glass-border">
                <tr>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium">Client</th>
                  <th className="px-6 py-4 font-medium">Montant</th>
                  <th className="px-6 py-4 font-medium">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-glass-border">
                <tr className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 text-slate-400">Aujourd'hui, 14:20</td>
                  <td className="px-6 py-4 font-medium text-slate-200">TechNova SAS</td>
                  <td className="px-6 py-4 text-slate-100">299,00 €</td>
                  <td className="px-6 py-4"><span className="px-2 py-1 text-xs rounded bg-emerald-500/10 text-emerald-400">Réussi</span></td>
                </tr>
                <tr className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 text-slate-400">Aujourd'hui, 09:15</td>
                  <td className="px-6 py-4 font-medium text-slate-200">InnovCorp</td>
                  <td className="px-6 py-4 text-slate-100">299,00 €</td>
                  <td className="px-6 py-4"><span className="px-2 py-1 text-xs rounded bg-rose-500/10 text-rose-400">Échoué</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
