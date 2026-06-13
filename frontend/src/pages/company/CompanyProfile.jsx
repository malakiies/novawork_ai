import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Building2, MapPin, Globe, Users } from 'lucide-react';

export function CompanyProfile() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-100">Profil Entreprise</h2>
        <p className="text-slate-400 mt-2">Gérez les informations publiques de votre entreprise.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1 space-y-6">
          <Card className="glass-panel text-center border-company-500/10">
            <CardContent className="pt-6">
              <div className="w-24 h-24 mx-auto rounded-xl bg-dark-800 border border-glass-border flex items-center justify-center mb-4 overflow-hidden">
                <Building2 className="w-12 h-12 text-slate-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-100">TechNova SAS</h3>
              <p className="text-company-400 font-medium text-sm mt-1">Éditeur de Logiciels</p>
              
              <div className="mt-6 flex flex-col gap-3 text-sm text-slate-400">
                <div className="flex items-center gap-3 justify-center">
                  <MapPin className="w-4 h-4" /> Paris, France
                </div>
                <div className="flex items-center gap-3 justify-center">
                  <Globe className="w-4 h-4" /> www.technova.fr
                </div>
                <div className="flex items-center gap-3 justify-center">
                  <Users className="w-4 h-4" /> 50-200 employés
                </div>
              </div>

              <Button className="w-full mt-6" variant="outline">Mettre à jour le logo</Button>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Card className="glass-panel border-company-500/10">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Description & Culture</CardTitle>
              <Button variant="ghost" size="sm">Modifier</Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Présentation</label>
                <p className="text-slate-200 text-sm leading-relaxed">
                  TechNova est une startup innovante spécialisée dans la création d'outils d'intelligence artificielle pour le secteur RH. 
                  Nous recherchons des talents passionnés par les nouvelles technologies pour rejoindre notre équipe dynamique et construire le futur du recrutement.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-panel border-company-500/10">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Avantages & Perks</CardTitle>
              <Button variant="ghost" size="sm">Gérer</Button>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {['Télétravail Flexible', 'Mutuelle 100%', 'Tickets Restaurant', 'Événements Team Building', 'MacBook Pro fourni'].map(perk => (
                  <span key={perk} className="px-3 py-1 bg-company-500/10 text-company-300 border border-company-500/20 rounded-full text-sm">
                    {perk}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
