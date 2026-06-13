import React from 'react';
import { Outlet } from 'react-router-dom';
import { CompanySidebar } from './CompanySidebar';
import { Header } from './Header'; // We can reuse the Header, maybe pass a role prop if needed

export function CompanyLayout() {
  return (
    <div className="flex min-h-screen bg-dark-900 selection:bg-company-500">
      <CompanySidebar />
      
      <div className="flex-1 flex flex-col relative z-10 overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-y-auto p-6 lg:p-10 scroll-smooth">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
