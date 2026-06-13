import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { CreditCard, CheckCircle2, ShieldCheck, Download, ExternalLink, Zap } from 'lucide-react';

const PLANS = [
  {
    key: 'starter',
    name: 'Starter',
    price: '49€',
    features: ['10 offres d\'emploi', 'Matching IA basique', 'Support Email', 'Statistiques de base']
  },
  {
    key: 'pro',
    name: 'Pro',
    price: '129€',
    features: ['50 offres d\'emploi', 'Matching IA Avancé', 'Analytics Complètes', 'Support Prioritaire', 'Jusqu\'à 5 recruteurs']
  },
  {
    key: 'enterprise',
    name: 'Enterprise',
    price: '399€',
    features: ['Offres illimitées', 'Sourcing IA Proactif', 'Marque Employeur', 'Support Dédié 24/7', 'Recruteurs illimités']
  }
];

export function Billing() {
  const [billingInfo, setBillingInfo] = useState(null);
  const [loadingAction, setLoadingAction] = useState(null); // 'portal' | 'starter' | 'pro' | 'enterprise'
  
  const token = useSelector(state => state.auth.accessToken);

  useEffect(() => {
    fetchBillingInfo();
  }, [token]);

  const fetchBillingInfo = async () => {
    try {
      const res = await axios.get('/api/v1/payments/my-billing', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBillingInfo(res.data.data.billing);
    } catch (err) {
      console.error('Erreur chargement facturation', err);
    }
  };

  const handleCheckout = async (planKey) => {
    setLoadingAction(planKey);
    try {
      const res = await axios.post('/api/v1/payments/create-checkout-session', { plan: planKey }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      window.location.href = res.data.data.url;
    } catch (err) {
      console.error('Erreur Checkout', err);
      alert(err.response?.data?.message || 'Erreur lors de la redirection vers Stripe.');
      setLoadingAction(null);
    }
  };

  const handleCustomerPortal = async () => {
    setLoadingAction('portal');
    try {
      const res = await axios.post('/api/v1/payments/customer-portal', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      window.location.href = res.data.data.url;
    } catch (err) {
      console.error('Erreur Portail', err);
      alert(err.response?.data?.message || 'Erreur lors de la redirection vers le portail Stripe.');
      setLoadingAction(null);
    }
  };

  if (!billingInfo) return <div className="text-slate-400 p-8">Chargement de vos informations de facturation...</div>;

  const currentPlan = billingInfo.plan || 'free';
  const isSubscribed = billingInfo.subscriptionStatus === 'active';

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-100">Facturation & Plans</h2>
        <p className="text-slate-400 mt-2">Gérez votre abonnement Stripe et débloquez la puissance de l'IA pour vos recrutements.</p>
      </div>

      {isSubscribed && (
        <Card className="glass-panel border-company-500/30 bg-company-500/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4">
            <span className="px-3 py-1 text-xs uppercase font-bold tracking-wider rounded-full bg-company-500/20 text-company-300 border border-company-500/30 flex items-center gap-2">
              <Zap className="w-3 h-3" />
              Abonnement Actif
            </span>
          </div>
          <CardHeader>
            <CardTitle className="text-company-100">Votre Plan Actuel : {currentPlan.toUpperCase()}</CardTitle>
            <p className="text-slate-400 mt-1">Votre abonnement est géré de manière sécurisée par Stripe.</p>
          </CardHeader>
          <CardContent>
            <Button 
              className="bg-company-600 hover:bg-company-500 text-white"
              onClick={handleCustomerPortal}
              disabled={loadingAction === 'portal'}
            >
              {loadingAction === 'portal' ? 'Redirection...' : (
                <>Gérer ma CB et mes factures sur Stripe <ExternalLink className="w-4 h-4 ml-2" /></>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Pricing Grid */}
      <div className="grid gap-6 lg:grid-cols-3 pt-4">
        {PLANS.map(plan => {
          const isCurrentPlan = currentPlan === plan.key && isSubscribed;
          return (
            <Card key={plan.key} className={`glass-panel flex flex-col relative transition-all ${
              isCurrentPlan ? 'border-company-500/50 shadow-[0_0_20px_rgba(16,185,129,0.15)] bg-dark-800' : 'border-glass-border hover:border-company-500/30'
            }`}>
              {isCurrentPlan && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-company-500 text-dark-900 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                  Plan Actuel
                </div>
              )}
              <CardHeader className="text-center pb-4 border-b border-glass-border/50">
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-slate-100">{plan.price}</span>
                  <span className="text-sm text-slate-400"> /mois</span>
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col pt-6">
                <ul className="space-y-4 mb-8 flex-1">
                  {plan.features.map(feature => (
                    <li key={feature} className="flex items-start gap-3 text-slate-300 text-sm">
                      <CheckCircle2 className="w-5 h-5 text-company-400 shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button 
                  className={`w-full ${isCurrentPlan ? 'bg-dark-700 hover:bg-dark-600 text-slate-300' : 'bg-company-600 hover:bg-company-500 text-white'}`}
                  variant={isCurrentPlan ? 'outline' : 'default'}
                  disabled={isCurrentPlan || loadingAction !== null}
                  onClick={() => handleCheckout(plan.key)}
                >
                  {loadingAction === plan.key ? 'Redirection...' : isCurrentPlan ? 'Plan Actuel' : 'S\'abonner'}
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Invoices History (Only if transactions exist) */}
      {billingInfo.transactions && billingInfo.transactions.length > 0 && (
        <Card className="glass-panel border-company-500/10 mt-8">
          <CardHeader>
            <CardTitle>Historique des factures</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {billingInfo.transactions.map((invoice, i) => (
              <div key={i} className="flex items-center justify-between p-4 border border-glass-border hover:bg-white/5 rounded-xl transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-company-500/10 flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5 text-company-400" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-200">{new Date(invoice.paidAt).toLocaleDateString()}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm text-slate-400">{(invoice.amount / 100).toFixed(2)} {invoice.currency.toUpperCase()}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 uppercase tracking-wider">{invoice.status === 'succeeded' ? 'Payé' : invoice.status}</span>
                    </div>
                  </div>
                </div>
                {invoice.invoiceUrl && (
                  <Button variant="ghost" size="sm" onClick={() => window.open(invoice.invoiceUrl, '_blank')}>
                    <Download className="w-4 h-4 mr-2" />
                    Reçu Stripe
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
