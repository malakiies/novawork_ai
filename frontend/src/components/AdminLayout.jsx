import React from 'react';
import { Outlet } from 'react-router-dom';
import { AdminSidebar } from './AdminSidebar';
import { Header } from './Header'; // Reusing Header for profile dropdown/notifications

export function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-dark-900 selection:bg-admin-500">
      <AdminSidebar />
      
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
