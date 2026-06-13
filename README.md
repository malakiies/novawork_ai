<div align="center">
  <img src="./frontend/public/favicon.svg" alt="NovaWork AI Logo" width="120" />
  <h1>NovaWork AI</h1>
  <p><strong>La plateforme de recrutement dopée à l'Intelligence Artificielle</strong></p>
</div>

<br />

NovaWork AI est un SaaS (Software as a Service) full-stack B2B/B2C révolutionnant le monde du recrutement. Il connecte les candidats et les entreprises grâce à un moteur de Matching IA avancé, un générateur de lettres de motivation, et un système de messagerie en temps réel.

## 🚀 Fonctionnalités Clés

### Pour les Candidats (B2C)
- **Générateur IA de Lettre de Motivation** : Analyse du CV et de l'offre d'emploi ciblée pour rédiger des lettres sur-mesure (OpenAI GPT-4).
- **Coach Carrière IA (Temps Réel)** : Un assistant virtuel "ChatGPT-like" streamant ses réponses mot-à-mot via WebSockets pour conseiller le candidat (Socket.io).
- **Parseur de CV Intelligent** : Extraction sémantique des PDF pour auto-remplir les profils.

### Pour les Entreprises (B2B)
- **Moteur de Matching IA** : Calcule le pourcentage de compatibilité (Hard Skills, Soft Skills, Expérience) entre une offre et une base de CVs.
- **ATS Kanban (Drag & Drop)** : Un tableau de bord ultra-fluide pour glisser-déposer les candidats dans le tunnel d'embauche (`pending` -> `interview` -> `hired`).
- **Système de Facturation SaaS** : Intégration complète **Stripe** (Checkout, Customer Portal, Webhook) avec auto-génération des plans au lancement.
- **Dashboard Analytics (God Mode)** : Supervision globale des KPIs (Revenus MRR, Taux de Matching, Acquisition) via des pipelines d'agrégation MongoDB et des graphiques interactifs (Recharts).

---

## 🛠️ Stack Technique

### Frontend (React 19 / Vite)
- **Framework UI** : React.js (Hooks, Strict Mode)
- **Styling** : TailwindCSS (Design System "Glassmorphism" Premium)
- **State Management** : Redux Toolkit
- **Drag & Drop** : `@hello-pangea/dnd`
- **Data Visualisation** : Recharts
- **Temps Réel** : Socket.io-client

### Backend (Node.js / Express)
- **Serveur** : Express.js RESTful API
- **Base de Données** : MongoDB Atlas (Mongoose) avec Aggregation Pipelines
- **Temps Réel** : Socket.io (Hébergé sur serveur persistant type Render)
- **Intelligence Artificielle** : API OpenAI (GPT-4o, Text Embeddings)
- **Stockage de Fichiers** : Cloudinary (Images & PDFs)
- **Monétisation** : Stripe API & Webhooks

---

## 💻 Installation & Lancement Local

### Prérequis
- Node.js (v18+)
- Compte MongoDB Atlas
- Clés API : OpenAI, Stripe, Cloudinary

### 1. Cloner le projet
```bash
git clone https://github.com/malakiies/novawork_ai.git
cd novawork_ai
```

### 2. Configuration Backend
```bash
cd backend
npm install
```
Créer un fichier `.env` basé sur `.env.example` et remplir toutes les variables secrètes.
```bash
npm run dev
```

### 3. Configuration Frontend
```bash
cd ../frontend
npm install
npm run dev
```

---

## 🌍 Déploiement Production

Le projet est conçu pour une intégration CI/CD moderne (Zero-Downtime Deployment).

- **Frontend** : Déploiement optimisé pour [Vercel](https://vercel.com) (cf. `vercel.json`).
- **Backend** : Déploiement recommandé sur [Render](https://render.com) ou Railway pour garantir la persistance des WebSockets (Socket.io).
- **Sécurité** : `express-mongo-sanitize`, `helmet`, `xss-clean` et `express-rate-limit` implémentés.

---

<div align="center">
  <i>Conçu avec ❤️ pour réinventer les Ressources Humaines.</i>
</div>
