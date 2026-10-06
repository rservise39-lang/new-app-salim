import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { DashboardView } from './components/DashboardView';
import { ProjectsView } from './components/ProjectsView';
import { WorkersView } from './components/WorkersView';
import { CostCalculatorView } from './components/CostCalculatorView';
import { ClientsView } from './components/ClientsView';
import { NewProjectModal } from './components/NewProjectModal';
import { NewWorkerModal } from './components/NewWorkerModal';
import { NewAdvanceModal } from './components/NewAdvanceModal';
import { InvoiceModal } from './components/InvoiceModal';
import { AuthModal } from './components/AuthModal';
import { PWAInstallModal } from './components/PWAInstallModal';
import { OfflineIndicator } from './components/OfflineIndicator';

const MainLayout: React.FC = () => {
  const { activeTab, showPWAInstallModal, setShowPWAInstallModal } = useApp();

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-800 flex flex-col relative overflow-x-hidden">
      {/* Decorative Paint Flourishes in corners matching the Sabbaghi branding */}
      <div 
        className="fixed top-0 left-0 w-44 h-44 pointer-events-none opacity-40 z-0 bg-no-repeat bg-contain"
        style={{
          background: 'radial-gradient(circle at 0% 0%, #38BDF8 0%, #FBBF24 45%, transparent 70%)'
        }}
      />
      <div 
        className="fixed bottom-0 right-0 w-48 h-48 pointer-events-none opacity-30 z-0 bg-no-repeat bg-contain"
        style={{
          background: 'radial-gradient(circle at 100% 100%, #FBBF24 0%, #60A5FA 50%, transparent 75%)'
        }}
      />

      {/* Top Header */}
      <Navbar />

      {/* Main Content Viewport */}
      <main className="flex-1 relative z-10 pb-16 md:pb-6">
        {activeTab === 'dashboard' && <DashboardView />}
        {activeTab === 'projects' && <ProjectsView />}
        {activeTab === 'workers' && <WorkersView />}
        {activeTab === 'calculator' && <CostCalculatorView />}
        {activeTab === 'clients' && <ClientsView />}
      </main>

      {/* Offline Status Alert */}
      <OfflineIndicator />

      {/* Mobile Bottom Navigation */}
      <BottomNav />

      {/* Modals & Dialogs */}
      <NewProjectModal />
      <NewWorkerModal />
      <NewAdvanceModal />
      <InvoiceModal />
      <AuthModal />
      <PWAInstallModal 
        isOpen={showPWAInstallModal} 
        onClose={() => setShowPWAInstallModal(false)} 
      />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
