import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

/* Candidate Imports */
import { DashboardLayout } from './components/DashboardLayout';
import { DashboardHome } from './pages/candidate/DashboardHome';
import { Profile } from './pages/candidate/Profile';
import { CVManager } from './pages/candidate/CVManager';
import { Applications } from './pages/candidate/Applications';
import { CoverLetterGenerator } from './pages/candidate/CoverLetterGenerator';
import { CareerChat } from './pages/candidate/CareerChat';
import { Settings } from './pages/candidate/Settings';

/* Company Imports */
import { CompanyLayout } from './components/CompanyLayout';
import { CompanyDashboard } from './pages/company/CompanyDashboard';
import { CompanyProfile } from './pages/company/CompanyProfile';
import { JobManager } from './pages/company/JobManager';
import { ATSBoard } from './pages/company/ATSBoard';
import { AIMatching } from './pages/company/AIMatching';
import { CompanyChat } from './pages/company/CompanyChat';
import { Billing } from './pages/company/Billing';

/* Admin Imports */
import { AdminLayout } from './components/AdminLayout';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { UsersManagement } from './pages/admin/UsersManagement';
import { CompaniesManagement } from './pages/admin/CompaniesManagement';
import { JobsModeration } from './pages/admin/JobsModeration';
import { PaymentsManagement } from './pages/admin/PaymentsManagement';
import { SystemLogs } from './pages/admin/SystemLogs';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/candidate" replace />} />
        
        {/* CANDIDATE DASHBOARD */}
        <Route path="/candidate" element={<DashboardLayout />}>
          <Route index element={<DashboardHome />} />
          <Route path="profile" element={<Profile />} />
          <Route path="cvs" element={<CVManager />} />
          <Route path="applications" element={<Applications />} />
          <Route path="cover-letter" element={<CoverLetterGenerator />} />
          <Route path="chat" element={<CareerChat />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* COMPANY DASHBOARD */}
        <Route path="/company" element={<CompanyLayout />}>
          <Route index element={<CompanyDashboard />} />
          <Route path="profile" element={<CompanyProfile />} />
          <Route path="jobs" element={<JobManager />} />
          <Route path="ats" element={<ATSBoard />} />
          <Route path="ai-matching" element={<AIMatching />} />
          <Route path="chat" element={<CompanyChat />} />
          <Route path="billing" element={<Billing />} />
        </Route>

        {/* ADMIN DASHBOARD */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<UsersManagement />} />
          <Route path="companies" element={<CompaniesManagement />} />
          <Route path="jobs" element={<JobsModeration />} />
          <Route path="payments" element={<PaymentsManagement />} />
          <Route path="logs" element={<SystemLogs />} />
        </Route>

        {/* Fallback 404 */}
        <Route path="*" element={
          <div className="min-h-screen bg-dark-900 text-slate-100 flex items-center justify-center flex-col">
            <h1 className="text-6xl font-bold text-primary-500 mb-4">404</h1>
            <p className="text-xl text-slate-400">Page introuvable</p>
          </div>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
