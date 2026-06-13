import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Bell, Shield, Key } from 'lucide-react';

export function Settings() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-100">Paramètres</h2>
        <p className="text-slate-400 mt-2">Gérez vos préférences de compte et de sécurité.</p>
      </div>

      <div className="grid gap-6">
        <Card className="glass-panel">
          <CardHeader className="flex flex-row items-center gap-2">
            <Bell className="w-5 h-5 text-primary-400" />
            <CardTitle>Notifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-dark-800/30 rounded-xl border border-glass-border">
              <div>
                <p className="font-medium text-slate-200">Alertes Emploi IA</p>
                <p className="text-sm text-slate-400">Recevoir un email quand un job matche à +80% avec mon profil.</p>
              </div>
              <div className="w-11 h-6 bg-primary-600 rounded-full relative cursor-pointer">
                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-dark-800/30 rounded-xl border border-glass-border">
              <div>
                <p className="font-medium text-slate-200">Mises à jour des candidatures</p>
                <p className="text-sm text-slate-400">Soyez notifié dès qu'un recruteur voit votre CV.</p>
              </div>
              <div className="w-11 h-6 bg-primary-600 rounded-full relative cursor-pointer">
                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-panel">
          <CardHeader className="flex flex-row items-center gap-2">
            <Shield className="w-5 h-5 text-primary-400" />
            <CardTitle>Sécurité</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-dark-800/30 rounded-xl border border-glass-border">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-dark-900 flex items-center justify-center">
                  <Key className="w-5 h-5 text-slate-400" />
                </div>
                <div>
                  <p className="font-medium text-slate-200">Mot de passe</p>
                  <p className="text-sm text-slate-400">Dernière modification il y a 3 mois</p>
                </div>
              </div>
              <Button variant="outline" size="sm">Modifier</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-panel border-rose-500/20">
          <CardHeader>
            <CardTitle className="text-rose-400">Zone Dangereuse</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-400 mb-4">
              La suppression de votre compte est définitive. Toutes vos données, CVs et candidatures seront effacés.
            </p>
            <Button variant="danger">Supprimer mon compte</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
