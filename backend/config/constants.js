// ─── Rôles utilisateur ────────────────────────────────────────────────────────
const ROLES = {
  CANDIDATE: 'candidate',
  COMPANY:   'company',
  ADMIN:     'admin',
};

// ─── Statuts candidature ──────────────────────────────────────────────────────
const APPLICATION_STATUS = {
  PENDING:     'pending',
  VIEWED:      'viewed',
  SHORTLISTED: 'shortlisted',
  INTERVIEW:   'interview',
  TECHNICAL:   'technical',
  OFFERED:     'offered',
  HIRED:       'hired',
  REJECTED:    'rejected',
  WITHDRAWN:   'withdrawn',
};

// ─── Statuts offre d'emploi ───────────────────────────────────────────────────
const JOB_STATUS = {
  DRAFT:   'draft',
  ACTIVE:  'active',
  PAUSED:  'paused',
  CLOSED:  'closed',
  EXPIRED: 'expired',
};

// ─── Plans tarifaires ─────────────────────────────────────────────────────────
const PLANS = {
  FREE:       'free',
  STARTER:    'starter',
  PRO:        'pro',
  ENTERPRISE: 'enterprise',
};

// ─── Types de notifications ───────────────────────────────────────────────────
const NOTIFICATION_TYPES = {
  APPLICATION_RECEIVED:   'application_received',
  APPLICATION_VIEWED:     'application_viewed',
  APPLICATION_SHORTLISTED:'application_shortlisted',
  APPLICATION_INTERVIEW:  'application_interview',
  APPLICATION_OFFERED:    'application_offered',
  APPLICATION_HIRED:      'application_hired',
  APPLICATION_REJECTED:   'application_rejected',
  CV_ANALYSIS_DONE:       'cv_analysis_done',
  NEW_JOB_MATCH:          'new_job_match',
  PAYMENT_SUCCESS:        'payment_success',
  PAYMENT_FAILED:         'payment_failed',
  SUBSCRIPTION_RENEWED:   'subscription_renewed',
  SUBSCRIPTION_CANCELED:  'subscription_canceled',
  TRIAL_ENDING:           'trial_ending',
  WELCOME:                'welcome',
  SYSTEM:                 'system',
};

// ─── Limites upload ───────────────────────────────────────────────────────────
const UPLOAD_LIMITS = {
  CV_MAX_SIZE:    5 * 1024 * 1024,  // 5 Mo
  IMAGE_MAX_SIZE: 2 * 1024 * 1024,  // 2 Mo
  ALLOWED_CV_TYPES:    ['application/pdf'],
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
};

// ─── Pagination ───────────────────────────────────────────────────────────────
const PAGINATION = {
  DEFAULT_PAGE:  1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT:     100,
};

module.exports = {
  ROLES,
  APPLICATION_STATUS,
  JOB_STATUS,
  PLANS,
  NOTIFICATION_TYPES,
  UPLOAD_LIMITS,
  PAGINATION,
};
