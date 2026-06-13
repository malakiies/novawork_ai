import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Send, User, Sparkles, Building2 } from 'lucide-react';
import { motion } from 'framer-motion';

export function CompanyChat() {
  const [messages, setMessages] = useState([
    { role: 'candidate', content: 'Bonjour, je suis très intéressé par le poste de Développeur React. Pourriez-vous m\'en dire plus sur la stack technique ?' }
  ]);
  const [input, setInput] = useState('');

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    setMessages(prev => [...prev, { role: 'company', content: input }]);
    setInput('');
  };

  const insertSuggestion = (text) => {
    setInput(text);
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex gap-6">
      {/* Conversations List Sidebar */}
      <Card className="w-80 glass-panel flex flex-col p-0 hidden lg:flex border-company-500/10">
        <div className="p-4 border-b border-glass-border font-semibold text-slate-200">
          Messages
        </div>
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 border-b border-glass-border bg-white/5 cursor-pointer border-l-2 border-l-company-500">
            <div className="flex justify-between items-start mb-1">
              <span className="font-medium text-slate-200 text-sm">Malak D.</span>
              <span className="text-[10px] text-slate-500">10:42</span>
            </div>
            <p className="text-xs text-slate-400 truncate">Bonjour, je suis très intéressé par...</p>
          </div>
          <div className="p-4 border-b border-glass-border hover:bg-white/5 cursor-pointer transition-colors">
            <div className="flex justify-between items-start mb-1">
              <span className="font-medium text-slate-300 text-sm">Alexandre B.</span>
              <span className="text-[10px] text-slate-500">Hier</span>
            </div>
            <p className="text-xs text-slate-500 truncate">Merci pour l'entretien d'hier.</p>
          </div>
        </div>
      </Card>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col space-y-4">
        {/* Header */}
        <Card className="glass-panel py-3 px-6 flex items-center justify-between border-company-500/10">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-company-600/20 text-company-300 font-bold flex items-center justify-center">M</div>
            <div>
              <h3 className="font-bold text-slate-200">Malak D.</h3>
              <p className="text-xs text-company-400">Match 92% • Candidat React</p>
            </div>
          </div>
          <Button variant="outline" size="sm">Voir Profil Complet</Button>
        </Card>

        {/* Chat Messages */}
        <Card className="glass-panel flex-1 flex flex-col p-0 overflow-hidden border-company-500/10">
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.map((msg, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-4 max-w-[80%] ${msg.role === 'company' ? 'ml-auto flex-row-reverse' : ''}`}
              >
                <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-lg ${msg.role === 'company' ? 'bg-company-600' : 'bg-dark-800 border border-glass-border'}`}>
                  {msg.role === 'company' ? <Building2 className="w-5 h-5 text-white" /> : <User className="w-5 h-5 text-slate-400" />}
                </div>
                <div className={`p-4 rounded-2xl ${msg.role === 'company' ? 'bg-company-600/20 border border-company-500/30 text-slate-100' : 'bg-dark-800/50 border border-glass-border text-slate-300'}`}>
                  {msg.content}
                </div>
              </motion.div>
            ))}
          </div>

          {/* AI Suggestions Toolbar */}
          <div className="px-4 py-2 border-t border-glass-border bg-company-500/5 flex gap-2 overflow-x-auto scrollbar-hide items-center">
            <Sparkles className="w-4 h-4 text-company-400 shrink-0 mr-1" />
            <span className="text-xs text-company-400 font-medium shrink-0 mr-2">Suggestions IA:</span>
            <button onClick={() => insertSuggestion('Notre stack est React 19, Redux Toolkit et TailwindCSS. Vous avez de l\'expérience avec ces outils ?')} className="shrink-0 px-3 py-1.5 rounded-full text-xs border border-company-500/30 text-company-300 hover:bg-company-500/10 transition-colors whitespace-nowrap">
              Détailler la tech stack
            </button>
            <button onClick={() => insertSuggestion('Êtes-vous disponible pour un court appel demain à 14h ?')} className="shrink-0 px-3 py-1.5 rounded-full text-xs border border-company-500/30 text-company-300 hover:bg-company-500/10 transition-colors whitespace-nowrap">
              Proposer un appel
            </button>
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-glass-border bg-dark-900/50">
            <form onSubmit={handleSend} className="relative flex items-center">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Écrivez un message..."
                className="w-full bg-dark-800/50 border border-glass-border rounded-xl pl-4 pr-16 py-4 text-sm focus:outline-none focus:ring-1 focus:ring-company-500 text-slate-100 shadow-inner"
              />
              <Button 
                type="submit" 
                size="icon" 
                className="absolute right-2 h-10 w-10 rounded-lg bg-company-600 hover:bg-company-500 text-white"
                disabled={!input.trim()}
              >
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </Card>
      </div>
    </div>
  );
}
