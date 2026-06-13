# 🚀 NovaWork AI — Architecture Technique Complète

> **Plateforme SaaS de recrutement intelligente propulsée par l'IA**
> Stack : React 19 · Vite · Node.js · Express · MongoDB Atlas · OpenAI · Stripe · Socket.io

---

## 1. 🏗️ Architecture Globale du Projet

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          NOVAWORK AI — SYSTÈME                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   ┌──────────────────────────────────────────────────────────────────┐  │
│   │                      CLIENTS (Navigateurs)                       │  │
│   │         Candidat · Entreprise · Admin (React 19 + Vite)         │  │
│   └──────────────────────────────────────────────────────────────────┘  │
│                               │  HTTPS / WSS                            │
│   ┌───────────────────────────▼──────────────────────────────────────┐  │
│   │                    REVERSE PROXY / CDN                           │  │
│   │                  Nginx / Cloudflare / Vercel                     │  │
│   └───────────────────────────┬──────────────────────────────────────┘  │
│                 ┌─────────────┴────────────┐                            │
│                 ▼                          ▼                            │
│   ┌─────────────────────┐    ┌─────────────────────────┐               │
│   │   REST API          │    │   WebSocket Server      │               │
│   │   Express.js        │    │   Socket.io             │               │
│   │   Port 5000         │    │   Notifications / Chat  │               │
│   └────────┬────────────┘    └────────────┬────────────┘               │
│            │                              │                             │
│   ┌────────▼──────────────────────────────▼────────────┐               │
│   │                   COUCHE SERVICES                   │               │
│   │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐  │               │
│   │  │  Auth   │ │   AI    │ │ Stripe  │ │Cloudinar│  │               │
│   │  │  JWT    │ │ OpenAI  │ │Payment  │ │  CDN    │  │               │
│   │  └─────────┘ └─────────┘ └─────────┘ └─────────┘  │               │
│   └────────────────────────┬────────────────────────────┘               │
│                            │                                            │
│   ┌────────────────────────▼────────────────────────────┐               │
│   │               COUCHE DONNÉES                        │               │
│   │          MongoDB Atlas (Cluster M10+)               │               │
│   │  ┌──────────┐ ┌──────────┐ ┌──────────┐            │               │
│   │  │  Users   │ │  Jobs    │ │  Chats   │   ...       │               │
│   │  └──────────┘ └──────────┘ └──────────┘            │               │
│   └─────────────────────────────────────────────────────┘               │
└─────────────────────────────────────────────────────────────────────────┘
```

### Principes Architecturaux

| Principe | Décision |
|----------|----------|
| **Pattern** | MVC + Service Layer + Repository Pattern |
| **Auth** | Stateless JWT (Access Token 15min + Refresh Token 7j) |
| **API** | RESTful avec versioning `/api/v1/` |
| **Temps réel** | Socket.io avec rooms par userId |
| **Upload fichiers** | Cloudinary via Multer (stream direct) |
| **Paiement** | Stripe Checkout + Webhooks |
| **IA** | OpenAI GPT-4o + embeddings pour matching |
| **Sécurité** | Helmet, CORS, Rate Limiting, Sanitize |

---

## 2. 🖥️ Arborescence Frontend

```
novawork-client/
├── public/
│   ├── favicon.ico
│   ├── robots.txt
│   └── og-image.png
│
├── src/
│   ├── main.jsx                          # Entrée app + Provider Redux
│   ├── App.jsx                           # Router principal + routes guards
│   ├── index.css                         # Tailwind directives + variables CSS
│   │
│   ├── assets/
│   │   ├── images/
│   │   ├── icons/
│   │   └── animations/                  # Lottie JSON files
│   │
│   ├── components/                       # Composants réutilisables (Atomic Design)
│   │   ├── ui/                           # Atoms
│   │   │   ├── Button/
│   │   │   │   ├── Button.jsx
│   │   │   │   └── Button.test.jsx
│   │   │   ├── Input/
│   │   │   ├── Badge/
│   │   │   ├── Avatar/
│   │   │   ├── Modal/
│   │   │   ├── Skeleton/
│   │   │   ├── Tooltip/
│   │   │   └── Spinner/
│   │   │
│   │   ├── common/                       # Molecules
│   │   │   ├── Navbar/
│   │   │   │   ├── Navbar.jsx
│   │   │   │   └── NavbarMobile.jsx
│   │   │   ├── Sidebar/
│   │   │   ├── Footer/
│   │   │   ├── PageHeader/
│   │   │   ├── SearchBar/
│   │   │   ├── Pagination/
│   │   │   ├── FileUpload/
│   │   │   ├── NotificationBell/
│   │   │   └── ProtectedRoute/
│   │   │
│   │   └── charts/                       # Organisms - Analytics
│   │       ├── LineChart.jsx
│   │       ├── BarChart.jsx
│   │       ├── DonutChart.jsx
│   │       └── HeatmapCalendar.jsx
│   │
│   ├── features/                         # Feature-based modules (Redux Toolkit)
│   │   │
│   │   ├── auth/
│   │   │   ├── authSlice.js             # Reducer + actions
│   │   │   ├── authApi.js               # RTK Query endpoints
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── ForgotPasswordPage.jsx
│   │   │   └── ResetPasswordPage.jsx
│   │   │
│   │   ├── candidate/
│   │   │   ├── candidateSlice.js
│   │   │   ├── CandidateDashboard.jsx
│   │   │   ├── ProfilePage.jsx
│   │   │   ├── CVUploadPage.jsx
│   │   │   ├── CVAnalysisResult.jsx     # Résultat IA du CV
│   │   │   ├── JobSearchPage.jsx
│   │   │   ├── JobDetailPage.jsx
│   │   │   ├── ApplicationsPage.jsx
│   │   │   ├── AIMatchingPage.jsx       # Offres matchées par IA
│   │   │   └── CoverLetterPage.jsx      # Génération lettre de motivation
│   │   │
│   │   ├── company/
│   │   │   ├── companySlice.js
│   │   │   ├── CompanyDashboard.jsx
│   │   │   ├── CompanyProfilePage.jsx
│   │   │   ├── JobPostingPage.jsx       # Créer/éditer offre
│   │   │   ├── JobListPage.jsx
│   │   │   ├── ApplicantsPage.jsx       # Candidats par offre
│   │   │   ├── CandidateProfileView.jsx
│   │   │   ├── InterviewScheduler.jsx
│   │   │   └── SubscriptionPage.jsx     # Plans Stripe
│   │   │
│   │   ├── admin/
│   │   │   ├── adminSlice.js
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── UsersManagement.jsx
│   │   │   ├── CompaniesManagement.jsx
│   │   │   ├── JobsModeration.jsx
│   │   │   ├── AnalyticsPage.jsx
│   │   │   └── SettingsPage.jsx
│   │   │
│   │   ├── chat/
│   │   │   ├── chatSlice.js
│   │   │   ├── AIChatPage.jsx           # Chat IA carrière
│   │   │   ├── ChatWindow.jsx
│   │   │   ├── ChatMessage.jsx
│   │   │   └── TypingIndicator.jsx
│   │   │
│   │   ├── notifications/
│   │   │   ├── notificationSlice.js
│   │   │   ├── NotificationList.jsx
│   │   │   └── NotificationItem.jsx
│   │   │
│   │   └── payments/
│   │       ├── CheckoutPage.jsx
│   │       ├── PaymentSuccess.jsx
│   │       └── PaymentCancel.jsx
│   │
│   ├── hooks/                            # Custom Hooks
│   │   ├── useAuth.js
│   │   ├── useSocket.js
│   │   ├── useDebounce.js
│   │   ├── useLocalStorage.js
│   │   ├── usePagination.js
│   │   └── useNotifications.js
│   │
│   ├── services/                         # Clients HTTP
│   │   ├── api.js                        # Instance Axios centralisée + interceptors
│   │   ├── authService.js
│   │   ├── jobService.js
│   │   ├── cvService.js
│   │   ├── chatService.js
│   │   ├── paymentService.js
│   │   └── socketService.js
│   │
│   ├── store/                            # Redux Store
│   │   ├── index.js                      # configureStore
│   │   └── rootReducer.js
│   │
│   ├── utils/
│   │   ├── constants.js                  # ROLES, STATUS, PLANS
│   │   ├── validators.js
│   │   ├── formatters.js
│   │   └── helpers.js
│   │
│   └── layouts/
│       ├── PublicLayout.jsx
│       ├── CandidateLayout.jsx
│       ├── CompanyLayout.jsx
│       └── AdminLayout.jsx
│
├── .env
├── .env.example
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── package.json
```

---

## 3. ⚙️ Arborescence Backend

```
novawork-server/
├── src/
│   ├── server.js                         # Entrée Express + Socket.io
│   ├── app.js                            # Config Express, middlewares globaux
│   │
│   ├── config/
│   │   ├── db.js                         # Connexion MongoDB Atlas (Mongoose)
│   │   ├── cloudinary.js                 # Config Cloudinary SDK
│   │   ├── stripe.js                     # Instance Stripe
│   │   ├── openai.js                     # Instance OpenAI client
│   │   └── constants.js                  # Configs globales (roles, plans)
│   │
│   ├── models/                           # Schémas Mongoose
│   │   ├── User.model.js
│   │   ├── CandidateProfile.model.js
│   │   ├── CompanyProfile.model.js
│   │   ├── Job.model.js
│   │   ├── Application.model.js
│   │   ├── CV.model.js
│   │   ├── CVAnalysis.model.js
│   │   ├── ChatSession.model.js
│   │   ├── ChatMessage.model.js
│   │   ├── CoverLetter.model.js
│   │   ├── Notification.model.js
│   │   ├── Subscription.model.js
│   │   ├── Payment.model.js
│   │   └── AuditLog.model.js
│   │
│   ├── controllers/                      # Logique de présentation (req/res)
│   │   ├── auth.controller.js
│   │   ├── user.controller.js
│   │   ├── candidate.controller.js
│   │   ├── company.controller.js
│   │   ├── job.controller.js
│   │   ├── application.controller.js
│   │   ├── cv.controller.js
│   │   ├── ai.controller.js
│   │   ├── chat.controller.js
│   │   ├── payment.controller.js
│   │   ├── notification.controller.js
│   │   └── admin.controller.js
│   │
│   ├── services/                         # Logique métier (Business Logic)
│   │   ├── auth.service.js              # JWT, tokens, bcrypt
│   │   ├── cv.service.js               # Parse + extraction texte CV
│   │   ├── ai.service.js               # Orchestration OpenAI (analyse, matching, lettre)
│   │   ├── matching.service.js         # Algorithme scoring CV/Offre
│   │   ├── email.service.js            # Nodemailer / SendGrid
│   │   ├── stripe.service.js           # Checkout, webhooks, abonnements
│   │   ├── cloudinary.service.js       # Upload, delete fichiers
│   │   ├── notification.service.js     # Création + push Socket
│   │   └── analytics.service.js        # Agrégations MongoDB
│   │
│   ├── routes/                           # Routage Express
│   │   ├── index.js                      # Agrégateur de routes v1
│   │   ├── auth.routes.js
│   │   ├── user.routes.js
│   │   ├── candidate.routes.js
│   │   ├── company.routes.js
│   │   ├── job.routes.js
│   │   ├── application.routes.js
│   │   ├── cv.routes.js
│   │   ├── ai.routes.js
│   │   ├── chat.routes.js
│   │   ├── payment.routes.js
│   │   ├── notification.routes.js
│   │   └── admin.routes.js
│   │
│   ├── middlewares/
│   │   ├── auth.middleware.js            # Vérification JWT
│   │   ├── role.middleware.js            # RBAC (requireRole)
│   │   ├── validate.middleware.js        # Joi / Zod validation
│   │   ├── upload.middleware.js          # Multer config (CV, logo)
│   │   ├── rateLimit.middleware.js       # express-rate-limit
│   │   ├── errorHandler.middleware.js    # Global error handler
│   │   └── asyncHandler.js              # Wrapper async/await
│   │
│   ├── validators/                       # Schémas de validation
│   │   ├── auth.validator.js
│   │   ├── job.validator.js
│   │   ├── profile.validator.js
│   │   └── application.validator.js
│   │
│   ├── sockets/                          # Socket.io handlers
│   │   ├── socket.manager.js            # Init + rooms management
│   │   ├── notification.socket.js
│   │   └── chat.socket.js
│   │
│   └── utils/
│       ├── jwt.utils.js                  # Sign, verify, refresh
│       ├── response.utils.js             # Helpers ApiResponse, ApiError
│       ├── pagination.utils.js
│       ├── embeddings.utils.js           # Génération embeddings OpenAI
│       └── logger.js                     # Winston logger
│
├── .env
├── .env.example
├── .gitignore
└── package.json
```

---

## 4. 🗄️ Collections MongoDB

### 4.1 `users`
```json
{
  "_id": "ObjectId",
  "email": "String (unique, indexed)",
  "password": "String (bcrypt hash)",
  "role": "Enum ['candidate', 'company', 'admin']",
  "isVerified": "Boolean (default: false)",
  "isActive": "Boolean (default: true)",
  "refreshToken": "String",
  "verificationToken": "String",
  "resetPasswordToken": "String",
  "resetPasswordExpires": "Date",
  "lastLogin": "Date",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### 4.2 `candidate_profiles`
```json
{
  "_id": "ObjectId",
  "userId": "ObjectId (ref: users) — unique",
  "firstName": "String",
  "lastName": "String",
  "headline": "String",
  "bio": "String",
  "avatar": "String (Cloudinary URL)",
  "phone": "String",
  "location": {
    "city": "String",
    "country": "String",
    "remote": "Boolean"
  },
  "skills": ["String (indexed)"],
  "experience": [{
    "title": "String",
    "company": "String",
    "startDate": "Date",
    "endDate": "Date",
    "current": "Boolean",
    "description": "String"
  }],
  "education": [{
    "degree": "String",
    "institution": "String",
    "field": "String",
    "graduationYear": "Number"
  }],
  "languages": [{ "name": "String", "level": "String" }],
  "salaryExpectation": { "min": "Number", "max": "Number", "currency": "String" },
  "availability": "Enum ['immediate', '1month', '3months', 'not_looking']",
  "linkedinUrl": "String",
  "portfolioUrl": "String",
  "profileCompletion": "Number (0-100)",
  "embedding": "[Number] (OpenAI embedding vector — indexed)",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### 4.3 `company_profiles`
```json
{
  "_id": "ObjectId",
  "userId": "ObjectId (ref: users) — unique",
  "companyName": "String (indexed)",
  "logo": "String (Cloudinary URL)",
  "website": "String",
  "industry": "String (indexed)",
  "size": "Enum ['1-10', '11-50', '51-200', '201-500', '500+']",
  "description": "String",
  "culture": "String",
  "benefits": ["String"],
  "location": {
    "address": "String",
    "city": "String",
    "country": "String"
  },
  "socialLinks": {
    "linkedin": "String",
    "twitter": "String"
  },
  "isVerified": "Boolean",
  "subscriptionId": "ObjectId (ref: subscriptions)",
  "plan": "Enum ['free', 'starter', 'pro', 'enterprise']",
  "jobPostsLimit": "Number",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### 4.4 `jobs`
```json
{
  "_id": "ObjectId",
  "companyId": "ObjectId (ref: company_profiles, indexed)",
  "title": "String (text indexed)",
  "description": "String (text indexed)",
  "requirements": ["String"],
  "responsibilities": ["String"],
  "skills": ["String (indexed)"],
  "category": "String (indexed)",
  "type": "Enum ['full_time', 'part_time', 'contract', 'internship', 'remote']",
  "experienceLevel": "Enum ['junior', 'mid', 'senior', 'lead', 'executive']",
  "location": {
    "city": "String",
    "country": "String",
    "remote": "Boolean"
  },
  "salary": {
    "min": "Number",
    "max": "Number",
    "currency": "String",
    "disclosed": "Boolean"
  },
  "status": "Enum ['draft', 'active', 'paused', 'closed', 'expired']",
  "expiresAt": "Date",
  "applicationCount": "Number (default: 0)",
  "viewCount": "Number (default: 0)",
  "embedding": "[Number] (OpenAI embedding vector — indexed)",
  "aiEnhanced": "Boolean",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```
> **Index** : `{ title: 'text', description: 'text', skills: 'text' }` + Index géospatial optionnel

### 4.5 `cvs`
```json
{
  "_id": "ObjectId",
  "candidateId": "ObjectId (ref: candidate_profiles)",
  "userId": "ObjectId (ref: users)",
  "fileName": "String",
  "fileUrl": "String (Cloudinary URL)",
  "fileType": "Enum ['pdf', 'docx']",
  "fileSize": "Number",
  "isPrimary": "Boolean",
  "rawText": "String (texte extrait)",
  "analysisId": "ObjectId (ref: cv_analyses)",
  "uploadedAt": "Date"
}
```

### 4.6 `cv_analyses`
```json
{
  "_id": "ObjectId",
  "cvId": "ObjectId (ref: cvs)",
  "candidateId": "ObjectId (ref: candidate_profiles)",
  "extractedData": {
    "skills": ["String"],
    "experience": ["Object"],
    "education": ["Object"],
    "languages": ["Object"],
    "summary": "String"
  },
  "strengths": ["String"],
  "weaknesses": ["String"],
  "suggestions": ["String"],
  "atsScore": "Number (0-100)",
  "overallScore": "Number (0-100)",
  "embedding": "[Number]",
  "analysisVersion": "String (OpenAI model used)",
  "createdAt": "Date"
}
```

### 4.7 `applications`
```json
{
  "_id": "ObjectId",
  "jobId": "ObjectId (ref: jobs, indexed)",
  "candidateId": "ObjectId (ref: candidate_profiles, indexed)",
  "companyId": "ObjectId (ref: company_profiles)",
  "cvId": "ObjectId (ref: cvs)",
  "coverLetterId": "ObjectId (ref: cover_letters, nullable)",
  "status": "Enum ['pending', 'viewed', 'shortlisted', 'interview', 'offered', 'rejected', 'withdrawn']",
  "matchScore": "Number (0-100, calculé par IA)",
  "candidateNote": "String",
  "companyNote": "String (interne)",
  "interviewDate": "Date",
  "appliedAt": "Date",
  "updatedAt": "Date"
}
```
> **Index composé** : `{ jobId: 1, candidateId: 1 }` (unique)

### 4.8 `chat_sessions`
```json
{
  "_id": "ObjectId",
  "userId": "ObjectId (ref: users)",
  "title": "String (généré automatiquement)",
  "context": "Enum ['career_advice', 'cv_review', 'interview_prep', 'general']",
  "messageCount": "Number",
  "totalTokensUsed": "Number",
  "isArchived": "Boolean",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### 4.9 `chat_messages`
```json
{
  "_id": "ObjectId",
  "sessionId": "ObjectId (ref: chat_sessions, indexed)",
  "role": "Enum ['user', 'assistant']",
  "content": "String",
  "tokensUsed": "Number",
  "createdAt": "Date"
}
```

### 4.10 `cover_letters`
```json
{
  "_id": "ObjectId",
  "candidateId": "ObjectId (ref: candidate_profiles)",
  "jobId": "ObjectId (ref: jobs, nullable)",
  "content": "String",
  "language": "String (default: 'fr')",
  "tone": "Enum ['formal', 'creative', 'enthusiastic']",
  "isAIGenerated": "Boolean",
  "generatedFrom": {
    "cvId": "ObjectId",
    "jobTitle": "String",
    "companyName": "String"
  },
  "createdAt": "Date"
}
```

### 4.11 `notifications`
```json
{
  "_id": "ObjectId",
  "userId": "ObjectId (ref: users, indexed)",
  "type": "Enum ['application_update', 'new_match', 'message', 'payment', 'system', 'interview']",
  "title": "String",
  "body": "String",
  "link": "String (frontend route)",
  "isRead": "Boolean (default: false)",
  "metadata": "Mixed",
  "createdAt": "Date"
}
```

### 4.12 `subscriptions`
```json
{
  "_id": "ObjectId",
  "companyId": "ObjectId (ref: company_profiles)",
  "stripeCustomerId": "String",
  "stripeSubscriptionId": "String",
  "plan": "Enum ['free', 'starter', 'pro', 'enterprise']",
  "status": "Enum ['active', 'canceled', 'past_due', 'trialing']",
  "currentPeriodStart": "Date",
  "currentPeriodEnd": "Date",
  "cancelAtPeriodEnd": "Boolean",
  "features": {
    "jobPostsLimit": "Number",
    "aiMatchingEnabled": "Boolean",
    "analyticsEnabled": "Boolean",
    "supportLevel": "String"
  },
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### 4.13 `payments`
```json
{
  "_id": "ObjectId",
  "companyId": "ObjectId (ref: company_profiles)",
  "subscriptionId": "ObjectId (ref: subscriptions)",
  "stripePaymentIntentId": "String",
  "amount": "Number (en centimes)",
  "currency": "String",
  "status": "Enum ['pending', 'succeeded', 'failed', 'refunded']",
  "invoiceUrl": "String",
  "createdAt": "Date"
}
```

### 4.14 `audit_logs`
```json
{
  "_id": "ObjectId",
  "userId": "ObjectId (ref: users)",
  "action": "String",
  "resource": "String",
  "resourceId": "ObjectId",
  "ipAddress": "String",
  "userAgent": "String",
  "metadata": "Mixed",
  "createdAt": "Date"
}
```

---

## 5. 🔌 APIs REST — Endpoints Complets

> Base URL : `/api/v1` · 🔒 = JWT requis · 👑 = Admin seulement · 🏢 = Entreprise · 👤 = Candidat

### AUTH `/auth`
| Méthode | Endpoint | Description | Accès |
|---------|----------|-------------|-------|
| `POST` | `/auth/register` | Inscription (candidat ou entreprise) | Public |
| `POST` | `/auth/login` | Connexion → Access + Refresh Token | Public |
| `POST` | `/auth/logout` | Révocation refresh token | 🔒 |
| `POST` | `/auth/refresh-token` | Renouveler access token | Public |
| `POST` | `/auth/forgot-password` | Envoi email reset | Public |
| `POST` | `/auth/reset-password` | Reset mot de passe via token | Public |
| `GET` | `/auth/verify-email/:token` | Vérification email | Public |
| `GET` | `/auth/me` | Profil utilisateur courant | 🔒 |

### CANDIDAT `/candidates`
| Méthode | Endpoint | Description | Accès |
|---------|----------|-------------|-------|
| `GET` | `/candidates/profile` | Mon profil | 👤 |
| `PUT` | `/candidates/profile` | Mettre à jour profil | 👤 |
| `GET` | `/candidates/dashboard` | Stats & métriques | 👤 |
| `GET` | `/candidates/matches` | Offres matchées par IA | 👤 |
| `GET` | `/candidates/applications` | Mes candidatures | 👤 |

### CV `/cv`
| Méthode | Endpoint | Description | Accès |
|---------|----------|-------------|-------|
| `POST` | `/cv/upload` | Upload CV (PDF/DOCX) → Cloudinary | 👤 |
| `GET` | `/cv/my-cvs` | Lister mes CVs | 👤 |
| `DELETE` | `/cv/:id` | Supprimer un CV | 👤 |
| `PUT` | `/cv/:id/primary` | Définir CV principal | 👤 |
| `POST` | `/cv/:id/analyze` | Déclencher analyse IA | 👤 |
| `GET` | `/cv/:id/analysis` | Résultat analyse IA | 👤 |

### ENTREPRISE `/companies`
| Méthode | Endpoint | Description | Accès |
|---------|----------|-------------|-------|
| `GET` | `/companies/profile` | Mon profil entreprise | 🏢 |
| `PUT` | `/companies/profile` | Mettre à jour profil | 🏢 |
| `POST` | `/companies/logo` | Upload logo → Cloudinary | 🏢 |
| `GET` | `/companies/dashboard` | Stats offres & candidatures | 🏢 |
| `GET` | `/companies/analytics` | Analytics avancés | 🏢 |
| `GET` | `/companies/:id` | Profil public entreprise | Public |

### OFFRES D'EMPLOI `/jobs`
| Méthode | Endpoint | Description | Accès |
|---------|----------|-------------|-------|
| `GET` | `/jobs` | Liste offres (filtres, search, pagination) | Public |
| `GET` | `/jobs/:id` | Détail offre | Public |
| `POST` | `/jobs` | Créer offre | 🏢 |
| `PUT` | `/jobs/:id` | Modifier offre | 🏢 |
| `DELETE` | `/jobs/:id` | Supprimer offre | 🏢 |
| `PATCH` | `/jobs/:id/status` | Changer statut (active/pause/close) | 🏢 |
| `GET` | `/jobs/company/mine` | Mes offres (company) | 🏢 |
| `GET` | `/jobs/:id/applicants` | Candidats pour une offre | 🏢 |
| `POST` | `/jobs/:id/enhance` | Améliorer offre via IA (GPT) | 🏢 |

### CANDIDATURES `/applications`
| Méthode | Endpoint | Description | Accès |
|---------|----------|-------------|-------|
| `POST` | `/applications` | Postuler à une offre | 👤 |
| `GET` | `/applications/:id` | Détail candidature | 🔒 |
| `DELETE` | `/applications/:id` | Retirer candidature | 👤 |
| `PATCH` | `/applications/:id/status` | Changer statut (company) | 🏢 |
| `PATCH` | `/applications/:id/note` | Ajouter note interne | 🏢 |
| `GET` | `/applications/:id/match-score` | Score IA candidat/offre | 🔒 |

### IA & CHAT `/ai`
| Méthode | Endpoint | Description | Accès |
|---------|----------|-------------|-------|
| `POST` | `/ai/chat` | Message au chatbot carrière | 👤 |
| `GET` | `/ai/chat/sessions` | Historique sessions | 👤 |
| `GET` | `/ai/chat/sessions/:id` | Messages d'une session | 👤 |
| `DELETE` | `/ai/chat/sessions/:id` | Supprimer session | 👤 |
| `POST` | `/ai/cover-letter` | Générer lettre de motivation | 👤 |
| `GET` | `/ai/cover-letters` | Mes lettres générées | 👤 |
| `POST` | `/ai/match` | Calculer matching CV/Job | 👤 |
| `POST` | `/ai/interview-prep` | Questions d'entretien simulées | 👤 |

### PAIEMENT `/payments`
| Méthode | Endpoint | Description | Accès |
|---------|----------|-------------|-------|
| `GET` | `/payments/plans` | Liste des plans Stripe | Public |
| `POST` | `/payments/checkout` | Créer session Stripe Checkout | 🏢 |
| `POST` | `/payments/webhook` | Webhook Stripe (raw body) | Stripe |
| `GET` | `/payments/subscription` | Abonnement actuel | 🏢 |
| `POST` | `/payments/cancel` | Annuler abonnement | 🏢 |
| `GET` | `/payments/invoices` | Historique factures | 🏢 |

### NOTIFICATIONS `/notifications`
| Méthode | Endpoint | Description | Accès |
|---------|----------|-------------|-------|
| `GET` | `/notifications` | Mes notifications (paginées) | 🔒 |
| `PATCH` | `/notifications/:id/read` | Marquer comme lue | 🔒 |
| `PATCH` | `/notifications/read-all` | Tout marquer comme lu | 🔒 |
| `DELETE` | `/notifications/:id` | Supprimer notification | 🔒 |

### ADMIN `/admin`
| Méthode | Endpoint | Description | Accès |
|---------|----------|-------------|-------|
| `GET` | `/admin/dashboard` | KPIs globaux | 👑 |
| `GET` | `/admin/users` | Liste utilisateurs | 👑 |
| `PATCH` | `/admin/users/:id/status` | Activer/désactiver user | 👑 |
| `GET` | `/admin/companies` | Liste entreprises | 👑 |
| `PATCH` | `/admin/companies/:id/verify` | Vérifier entreprise | 👑 |
| `GET` | `/admin/jobs` | Toutes les offres | 👑 |
| `DELETE` | `/admin/jobs/:id` | Supprimer offre (modération) | 👑 |
| `GET` | `/admin/analytics` | Analytics plateforme | 👑 |
| `GET` | `/admin/logs` | Audit logs | 👑 |

---

## 6. 🔗 Relations entre les Entités

```
┌─────────────────────────────────────────────────────────────────────┐
│                       DIAGRAMME ENTITÉ-RELATION                     │
└─────────────────────────────────────────────────────────────────────┘

users (1) ──────────────────── (1) candidate_profiles
  │                                      │
  │                                      ├──── (N) cvs ──── (1) cv_analyses
  │                                      │
  │                                      ├──── (N) applications
  │                                      │
  │                                      └──── (N) cover_letters
  │
  ├────── (1) ──────────────── (1) company_profiles
  │                                      │
  │                                      ├──── (N) jobs
  │                                      │         │
  │                                      │         └──── (N) applications
  │                                      │
  │                                      └──── (1) subscriptions ──── (N) payments
  │
  ├────── (N) ──────────────── chat_sessions ──── (N) chat_messages
  │
  └────── (N) ──────────────── notifications
```

### Cardinalités détaillées

| Entité A | Relation | Entité B | Type |
|----------|----------|----------|------|
| `User` | has one | `CandidateProfile` | 1-1 |
| `User` | has one | `CompanyProfile` | 1-1 |
| `CandidateProfile` | has many | `CV` | 1-N |
| `CV` | has one | `CVAnalysis` | 1-1 |
| `CompanyProfile` | has many | `Job` | 1-N |
| `Job` | has many | `Application` | 1-N |
| `CandidateProfile` | has many | `Application` | 1-N |
| `Application` | belongs to one | `CV` | N-1 |
| `Application` | belongs to one | `CoverLetter` (opt.) | N-1 |
| `CompanyProfile` | has one | `Subscription` | 1-1 |
| `Subscription` | has many | `Payment` | 1-N |
| `User` | has many | `ChatSession` | 1-N |
| `ChatSession` | has many | `ChatMessage` | 1-N |
| `User` | has many | `Notification` | 1-N |

---

## 7. 🔄 Workflow Complet du Système

### 7.1 Workflow Candidat — De l'inscription au matching

```
┌─────────────────────────────────────────────────────────────────┐
│                    PARCOURS CANDIDAT                            │
└─────────────────────────────────────────────────────────────────┘

1. INSCRIPTION & ONBOARDING
   ┌──────────┐    POST /auth/register     ┌───────────────┐
   │Candidat  │ ─────────────────────────► │ Création User │
   │(Browser) │                            │ + envoi email │
   └──────────┘                            │ vérification  │
                                           └───────┬───────┘
                                                   │ GET /auth/verify-email
                                                   ▼
                                           ┌───────────────┐
                                           │ isVerified=true│
                                           │ JWT généré    │
                                           └───────────────┘

2. UPLOAD & ANALYSE CV
   Candidat → POST /cv/upload
       │
       ├─► Multer parse le fichier
       ├─► Upload vers Cloudinary (PDF/DOCX)
       ├─► Extraction texte (pdf-parse / mammoth)
       ├─► Sauvegarde CV en DB
       └─► POST /cv/:id/analyze
               │
               ├─► Envoi texte CV à OpenAI GPT-4o
               │   Prompt: "Analyse ce CV, extrais les skills, expériences,
               │            note l'ATS score, donne des suggestions"
               ├─► Génération embedding OpenAI (text-embedding-3-small)
               ├─► Sauvegarde CVAnalysis en DB
               ├─► Mise à jour CandidateProfile (skills auto-remplis)
               └─► Notification Socket.io "Analyse terminée ✓"

3. MATCHING AUTOMATIQUE
   Candidat → GET /candidates/matches
       │
       ├─► Récupération embedding candidat (depuis cv_analyses)
       ├─► Calcul cosine similarity vs embeddings des offres actives
       ├─► Score composite :
       │     - Similarité sémantique (60%)
       │     - Match compétences exactes (25%)
       │     - Match localisation/remote (10%)
       │     - Match salaire (5%)
       └─► Retour liste offres triées par score (top 20)

4. CANDIDATURE
   Candidat → POST /applications
       │
       ├─► Vérification : pas déjà postulé (index unique)
       ├─► Calcul matchScore définitif
       ├─► Sauvegarde Application (status: 'pending')
       ├─► Incrémentation job.applicationCount
       ├─► Notification Entreprise via Socket.io
       └─► Confirmation email candidat
```

### 7.2 Workflow Entreprise — De la création d'offre au recrutement

```
┌─────────────────────────────────────────────────────────────────┐
│                    PARCOURS ENTREPRISE                          │
└─────────────────────────────────────────────────────────────────┘

1. SOUSCRIPTION (Stripe)
   Entreprise → POST /payments/checkout
       │
       ├─► Création Stripe Customer si inexistant
       ├─► Création Stripe Checkout Session
       ├─► Redirection vers page Stripe hébergée
       ├─► Paiement réussi → Webhook POST /payments/webhook
       │       │
       │       ├─► Vérification signature Stripe
       │       ├─► Événement: checkout.session.completed
       │       ├─► Création/MAJ Subscription en DB
       │       ├─► MAJ CompanyProfile.plan
       │       └─► Notification Socket.io "Abonnement activé ✓"
       └─► Redirection /payment/success

2. CRÉATION D'OFFRE
   Entreprise → POST /jobs
       │
       ├─► Vérification plan (jobPostsLimit)
       ├─► Validation données (Joi)
       ├─► Sauvegarde Job (status: 'draft')
       ├─► (Optionnel) POST /jobs/:id/enhance
       │       └─► GPT-4o améliore titre, description, requirements
       ├─► Génération embedding de l'offre
       ├─► PATCH /jobs/:id/status → 'active'
       └─► Indexation MongoDB text search

3. GESTION DES CANDIDATURES
   Entreprise → GET /jobs/:id/applicants
       │
       ├─► Liste candidats avec matchScore, status
       ├─► Vue profil candidat + CV téléchargeable
       ├─► PATCH /applications/:id/status
       │     → 'shortlisted' | 'interview' | 'offered' | 'rejected'
       ├─► Notification automatique candidat (Socket.io + email)
       └─► Note interne (PATCH /applications/:id/note)
```

### 7.3 Workflow IA Chat Carrière

```
┌─────────────────────────────────────────────────────────────────┐
│                    CHAT IA CARRIÈRE                             │
└─────────────────────────────────────────────────────────────────┘

Candidat → POST /ai/chat { sessionId?, message }
    │
    ├─► Création/récupération ChatSession
    ├─► Chargement historique (N derniers messages)
    ├─► Construction prompt système :
    │     "Tu es un coach carrière expert en recrutement.
    │      Contexte candidat: [skills, experience extraits du CV]
    │      Historique: [N messages précédents]"
    ├─► Appel OpenAI GPT-4o (stream activé)
    ├─► Réponse streamée via SSE / Socket.io
    ├─► Sauvegarde ChatMessage (user + assistant)
    └─► MAJ tokensUsed + sessionId retourné

Génération Lettre de Motivation:
    POST /ai/cover-letter { jobId, tone, language }
    │
    ├─► Récupération CV principal + CVAnalysis
    ├─► Récupération détails offre
    ├─► Prompt structuré GPT-4o :
    │     "Génère une lettre de motivation [tone] en [language]
    │      pour le poste [job.title] chez [company]
    │      en valorisant: [skills matchés]"
    ├─► Sauvegarde CoverLetter
    └─► Retour contenu + option téléchargement PDF
```

### 7.4 Workflow Notifications Temps Réel (Socket.io)

```
┌─────────────────────────────────────────────────────────────────┐
│               SYSTÈME DE NOTIFICATIONS                          │
└─────────────────────────────────────────────────────────────────┘

Connexion WebSocket:
    Client → socket.connect() avec JWT dans auth header
        │
        ├─► Vérification JWT middleware Socket.io
        ├─► socket.join(`user_${userId}`)  ← room privée
        └─► Envoi notifications non lues au chargement

Émission d'une notification:
    Service Backend → notificationService.send(userId, payload)
        │
        ├─► Création document Notification en DB
        ├─► io.to(`user_${userId}`).emit('notification', payload)
        └─► Client React reçoit → Redux store mis à jour
                                → Toast affiché + badge incrémenté

Événements Socket.io définis:
    • notification:new       → Nouvelle notification
    • application:updated    → Statut candidature changé  
    • cv:analysis:done       → Analyse CV terminée
    • match:new              → Nouveau match trouvé
    • chat:message           → Message IA streamé
```

### 7.5 Sécurité & Flow JWT

```
┌─────────────────────────────────────────────────────────────────┐
│                     FLUX JWT                                    │
└─────────────────────────────────────────────────────────────────┘

Login:
    POST /auth/login
    → accessToken  (15min, stocké en mémoire React/Redux)
    → refreshToken (7 jours, httpOnly Cookie)

Requête API:
    Authorization: Bearer <accessToken>
    → authMiddleware vérifie signature + expiration
    → Injection req.user dans la route

Token expiré (401):
    Axios Interceptor côté client:
    → POST /auth/refresh-token (cookie envoyé automatiquement)
    → Nouveau accessToken en réponse
    → Retry requête originale transparente

Logout:
    → Refresh token révoqué en DB (refreshToken: null)
    → Cookie httpOnly effacé
    → Redux store vidé
```

---

## 📦 Variables d'Environnement

### Backend `.env`
```env
# App
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:5173

# MongoDB Atlas
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/novawork

# JWT
JWT_ACCESS_SECRET=your_super_secret_access_key
JWT_REFRESH_SECRET=your_super_secret_refresh_key
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# OpenAI
OPENAI_API_KEY=sk-...

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_STARTER=price_...
STRIPE_PRICE_PRO=price_...
STRIPE_PRICE_ENTERPRISE=price_...

# Email
SMTP_HOST=smtp.sendgrid.net
SMTP_USER=apikey
SMTP_PASS=SG....
EMAIL_FROM=noreply@novawork.ai
```

### Frontend `.env`
```env
VITE_API_URL=http://localhost:5000/api/v1
VITE_SOCKET_URL=http://localhost:5000
VITE_STRIPE_PUBLIC_KEY=pk_test_...
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
```

---

## 📋 Plans Tarifaires Stripe

| Feature | 🆓 Free | 🚀 Starter | 💼 Pro | 🏢 Enterprise |
|---------|---------|-----------|-------|--------------|
| Offres actives | 2 | 10 | 50 | Illimité |
| AI Matching | ❌ | ✅ | ✅ | ✅ |
| Analytics | Basic | Standard | Avancé | Custom |
| CV Export | ❌ | ✅ | ✅ | ✅ |
| Support | Email | Email | Prioritaire | Dédié |
| **Prix/mois** | **0€** | **49€** | **149€** | **Sur devis** |

---

> 💡 **Recommandation de déploiement** :
> - **Frontend** → Vercel (CI/CD GitHub natif, Edge Network)
> - **Backend** → Railway ou Render (Node.js managed, auto-deploy)
> - **Base de données** → MongoDB Atlas M10 (replica set, auto-backup)
> - **Fichiers** → Cloudinary (CDN intégré, transformations images)
> - **Monitoring** → Sentry (errors) + LogRocket (sessions) + Uptime Robot
