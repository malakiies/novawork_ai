import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Terminal, Activity, Server, Database } from 'lucide-react';

const mockLogs = [
  "[10:42:01] INFO: User Malak (ID: 1) logged in successfully.",
  "[10:45:12] WARN: Rate limit approaching for IP 192.168.1.45",
  "[10:50:00] ERROR: OpenAI API Timeout during CV parsing (CV_ID: 402)",
  "[10:51:30] INFO: MongoDB Connection stable. Pool size: 10",
  "[10:55:00] INFO: Stripe Webhook received for Sub_12345",
];

export function SystemLogs() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    setLogs(mockLogs);
    // Simulate incoming logs
    const interval = setInterval(() => {
      setLogs(prev => [`[${new Date().toLocaleTimeString()}] INFO: API /candidates/search accessed by Admin`, ...prev].slice(0, 50));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-100">Logs Système</h2>
        <p className="text-slate-400 mt-2">Monitorez l'activité des serveurs, de la base de données et des APIs tierces.</p>
      </div>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
        <Card className="glass-panel border-admin-500/10">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded bg-emerald-500/10 flex items-center justify-center">
              <Server className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Node.js API</p>
              <p className="font-bold text-emerald-400">En ligne (24ms)</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass-panel border-admin-500/10">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded bg-emerald-500/10 flex items-center justify-center">
              <Database className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm text-slate-400">MongoDB Atlas</p>
              <p className="font-bold text-emerald-400">En ligne (45ms)</p>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-panel border-admin-500/10">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded bg-amber-500/10 flex items-center justify-center">
              <Activity className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-sm text-slate-400">OpenAI API</p>
              <p className="font-bold text-amber-400">Dégradé (850ms)</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-panel border-admin-500/20 bg-dark-900 overflow-hidden h-[500px] flex flex-col">
        <CardHeader className="bg-dark-800/80 border-b border-glass-border flex flex-row items-center gap-2">
          <Terminal className="w-4 h-4 text-admin-400" />
          <CardTitle className="text-sm font-mono text-slate-300">Live Terminal output</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto p-4 font-mono text-xs">
          {logs.map((log, i) => (
            <div key={i} className={`mb-1 ${log.includes('ERROR') ? 'text-rose-400' : log.includes('WARN') ? 'text-amber-400' : 'text-emerald-400/70'}`}>
              {log}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
