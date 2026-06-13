import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { User, MapPin, Briefcase, Mail, Phone, ExternalLink } from 'lucide-react';

export function Profile() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-100">Mon Profil</h2>
        <p className="text-slate-400 mt-2">Gérez vos informations personnelles et professionnelles.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1 space-y-6">
          <Card className="glass-panel text-center">
            <CardContent className="pt-6">
              <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-tr from-primary-500 to-purple-500 flex items-center justify-center text-white text-3xl font-semibold shadow-xl shadow-primary-500/20 mb-4">
                M
              </div>
              <h3 className="text-xl font-bold text-slate-100">Malak</h3>
              <p className="text-primary-400 font-medium text-sm mt-1">Développeur Frontend React</p>
              
              <div className="mt-6 flex flex-col gap-3 text-sm text-slate-400">
                <div className="flex items-center gap-3 justify-center">
                  <MapPin className="w-4 h-4" /> Paris, France
                </div>
                <div className="flex items-center gap-3 justify-center">
                  <Mail className="w-4 h-4" /> malak@example.com
                </div>
              </div>

              <Button className="w-full mt-6" variant="outline">Éditer la photo</Button>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Card className="glass-panel">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Informations Générales</CardTitle>
              <Button variant="ghost" size="sm">Modifier</Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Prénom</label>
                  <p className="text-slate-200">Malak</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Nom</label>
                  <p className="text-slate-200">Doe</p>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-slate-500 mb-1">Bio</label>
                  <p className="text-slate-200 text-sm leading-relaxed">
                    Développeur Frontend passionné par la création d'interfaces utilisateur intuitives et performantes. 
                    Spécialisé dans l'écosystème React, j'aime résoudre des problèmes complexes et apprendre de nouvelles technologies.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-panel">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Compétences (Issues du CV)</CardTitle>
              <Button variant="ghost" size="sm">Gérer</Button>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {['React', 'JavaScript', 'TypeScript', 'Tailwind CSS', 'Redux', 'Node.js', 'Git'].map(skill => (
                  <span key={skill} className="px-3 py-1 bg-primary-500/10 text-primary-300 border border-primary-500/20 rounded-full text-sm">
                    {skill}
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
