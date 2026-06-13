import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Search, Filter, Shield, MoreHorizontal, UserX, CheckCircle } from 'lucide-react';

const USERS = [
  { id: 1, name: 'Malak Doe', email: 'malak@example.com', role: 'Candidate', status: 'Active', date: '12/06/2026' },
  { id: 2, name: 'Jean Dupont', email: 'jean@example.com', role: 'Candidate', status: 'Pending', date: '11/06/2026' },
  { id: 3, name: 'Spammer Bot', email: 'spam@bot.com', role: 'Candidate', status: 'Banned', date: '10/06/2026' }
];

export function UsersManagement() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-100">Gestion des Utilisateurs</h2>
          <p className="text-slate-400 mt-2">Modérez les comptes candidats et leurs permissions.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input 
              type="text" 
              className="w-full bg-dark-800/50 border border-glass-border rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-admin-500 text-slate-200"
              placeholder="Chercher par email ou nom..."
            />
          </div>
        </div>
      </div>

      <Card className="glass-panel p-0 overflow-hidden border-admin-500/10">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-dark-800/50 text-xs uppercase text-slate-400 border-b border-glass-border">
              <tr>
                <th className="px-6 py-4 font-medium">Utilisateur</th>
                <th className="px-6 py-4 font-medium">Email</th>
                <th className="px-6 py-4 font-medium">Rôle</th>
                <th className="px-6 py-4 font-medium">Statut</th>
                <th className="px-6 py-4 font-medium">Inscription</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-glass-border">
              {USERS.map((user) => (
                <tr key={user.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-100">{user.name}</td>
                  <td className="px-6 py-4 text-slate-400">{user.email}</td>
                  <td className="px-6 py-4"><span className="px-2 py-1 text-xs rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">{user.role}</span></td>
                  <td className="px-6 py-4">
                    {user.status === 'Active' && <span className="text-emerald-400 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Actif</span>}
                    {user.status === 'Pending' && <span className="text-amber-400">En attente</span>}
                    {user.status === 'Banned' && <span className="text-rose-400 flex items-center gap-1"><UserX className="w-3 h-3" /> Banni</span>}
                  </td>
                  <td className="px-6 py-4 text-slate-500">{user.date}</td>
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
