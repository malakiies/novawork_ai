import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Sparkles, Search, UserPlus } from 'lucide-react';
import { motion } from 'framer-motion';

export function AIMatching() {
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = () => {
    setIsSearching(true);
    setTimeout(() => setIsSearching(false), 2000);
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
          <Sparkles className="w-8 h-8 text-company-400" />
          Sourcing IA
        </h2>
        <p className="text-slate-400 mt-2">Laissez notre IA parcourir la base de talents pour trouver vos perles rares.</p>
      </div>

      <Card className="glass-panel border-company-500/20">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-300 mb-1">Prompt de recherche</label>
              <textarea 
                className="glass-input resize-none h-24"
                placeholder="Ex: Je cherche un développeur React Senior avec 5 ans d'expérience, maîtrisant Redux Toolkit et ayant déjà travaillé dans la FinTech..."
              ></textarea>
            </div>
            <div className="md:w-64 flex flex-col justify-end">
              <Button 
                className="w-full h-12 bg-company-600 hover:bg-company-500 text-white shadow-lg shadow-company-500/20 border-company-500/50"
                onClick={handleSearch}
                isLoading={isSearching}
              >
                {!isSearching && <Search className="w-4 h-4 mr-2" />}
                Lancer le radar IA
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {isSearching ? (
        <div className="flex flex-col items-center justify-center py-20 text-company-400">
          <Sparkles className="w-12 h-12 animate-pulse mb-4" />
          <p className="animate-pulse text-lg">Analyse sémantique des milliers de CVs en cours...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Result Card */}
          {[1, 2, 3].map((i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="glass-card hover:border-company-500/30 transition-all duration-300 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-company-500/10 blur-2xl rounded-full group-hover:bg-company-500/20 transition-colors"></div>
                <CardContent className="p-6 relative z-10">
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-company-600 to-emerald-400 flex items-center justify-center text-lg font-bold text-white shadow-lg mb-4">
                      {['M', 'A', 'S'][i-1]}
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-company-400 font-bold text-xl">{[95, 88, 82][i-1]}%</span>
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider">Match</span>
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-slate-200">Développeur Frontend</h3>
                  <p className="text-sm text-slate-400 mb-4">Paris • 4 ans exp.</p>

                  <div className="flex flex-wrap gap-1 mb-6">
                    {['React', 'Redux', 'TypeScript'].map(skill => (
                      <span key={skill} className="px-2 py-1 text-[10px] bg-dark-800 border border-glass-border rounded-md text-slate-300">
                        {skill}
                      </span>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <Button className="flex-1 bg-white/10 hover:bg-white/20 text-white" size="sm">
                      Voir CV
                    </Button>
                    <Button className="flex-1 bg-company-600 hover:bg-company-500 text-white shadow-lg shadow-company-500/20 border-company-500/50" size="sm">
                      <UserPlus className="w-4 h-4 mr-2" />
                      Contacter
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
