import React from 'react';
import { 
  LayoutGrid, 
  LayoutDashboard, 
  Sparkles, 
  Smartphone,
  ShieldAlert
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface BottomNavigationProps {
  currentView: string;
  setView: (view: string) => void;
  setSelectedToolId: (toolId: string | null) => void;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({ 
  currentView, 
  setView, 
  setSelectedToolId 
}) => {
  const { user, openUpgradeModal } = useApp();

  const handleTabClick = (viewName: string) => {
    setView(viewName);
    setSelectedToolId(null);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const isPremium = user?.role === 'premium' || user?.role === 'admin';

  return (
    <div 
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-lg border-t border-slate-100 flex items-center justify-around py-2 px-2 shadow-[0_-8px_30px_rgb(0,0,0,0.04)] md:hidden safe-bottom"
      id="mobile-bottom-tab-navigation"
    >
      {/* Tab 1: Explore / Tools */}
      <button
        onClick={() => handleTabClick('landing')}
        className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all cursor-pointer ${
          currentView === 'landing' || currentView === 'tool'
            ? 'text-indigo-600 font-bold' 
            : 'text-slate-500 hover:text-slate-800'
        }`}
        id="tab-btn-explore"
      >
        <LayoutGrid className={`h-5 w-5 transition-transform ${currentView === 'landing' || currentView === 'tool' ? 'scale-110' : ''}`} />
        <span className="text-[10px] tracking-tight">Tools</span>
      </button>

      {/* Tab 2: Dashboard */}
      {user && (
        <button
          onClick={() => handleTabClick('dashboard')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all cursor-pointer ${
            currentView === 'dashboard' 
              ? 'text-indigo-600 font-bold' 
              : 'text-slate-500 hover:text-slate-800'
          }`}
          id="tab-btn-dashboard"
        >
          <LayoutDashboard className={`h-5 w-5 transition-transform ${currentView === 'dashboard' ? 'scale-110' : ''}`} />
          <span className="text-[10px] tracking-tight">Dashboard</span>
        </button>
      )}

      {/* Tab 3: Admin (If admin, substitute for PWA/Upgrade if space is tight, or just display side by side) */}
      {user?.role === 'admin' && (
        <button
          onClick={() => handleTabClick('admin')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all cursor-pointer ${
            currentView === 'admin' 
              ? 'text-amber-700 font-bold' 
              : 'text-slate-500 hover:text-amber-600'
          }`}
          id="tab-btn-admin"
        >
          <ShieldAlert className={`h-5 w-5 transition-transform ${currentView === 'admin' ? 'scale-110' : ''}`} />
          <span className="text-[10px] tracking-tight">Admin</span>
        </button>
      )}

      {/* Tab 4: Upgrade / Premium */}
      <button
        onClick={openUpgradeModal}
        className="flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-slate-500 hover:text-amber-600 transition-all cursor-pointer"
        id="tab-btn-upgrade"
      >
        <Sparkles className="h-5 w-5 text-amber-500 animate-pulse" />
        <span className="text-[10px] tracking-tight font-medium text-amber-700">Get Pro</span>
      </button>

      {/* Tab 5: Install App */}
      <button
        onClick={() => handleTabClick('install-app')}
        className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all cursor-pointer ${
          currentView === 'install-app' 
            ? 'text-indigo-600 font-bold' 
            : 'text-slate-500 hover:text-slate-800'
        }`}
        id="tab-btn-install"
      >
        <Smartphone className={`h-5 w-5 transition-transform ${currentView === 'install-app' ? 'scale-110' : ''}`} />
        <span className="text-[10px] tracking-tight">Install</span>
      </button>
    </div>
  );
};
