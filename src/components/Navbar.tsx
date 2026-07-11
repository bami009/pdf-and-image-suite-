import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  FileText, 
  Sparkles, 
  User as UserIcon, 
  LogOut, 
  LayoutDashboard, 
  ShieldAlert, 
  Menu, 
  X,
  Lock,
  ChevronDown,
  Gauge
} from 'lucide-react';

interface NavbarProps {
  currentView: string;
  setView: (view: string) => void;
  setSelectedToolId: (toolId: string | null) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, setView, setSelectedToolId }) => {
  const { user, openAuthModal, openUpgradeModal, logout, quotaUsed, quotaLimit } = useApp();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navigateTo = (viewName: string) => {
    setView(viewName);
    setSelectedToolId(null);
    setMobileMenuOpen(false);
    setDropdownOpen(false);
  };

  const handleLogoClick = () => {
    setView('landing');
    setSelectedToolId(null);
    setMobileMenuOpen(false);
    setDropdownOpen(false);
  };

  const isPremium = user?.role === 'premium' || user?.role === 'admin';
  const remainingQuota = Math.max(0, quotaLimit - quotaUsed);

  return (
    <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100" id="main-navigation">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <button 
              onClick={handleLogoClick}
              className="flex items-center gap-2 cursor-pointer focus:outline-none"
              id="navbar-brand-logo"
            >
              <div className="h-9 w-9 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-md shadow-indigo-500/10">
                <FileText className="h-5 w-5" />
              </div>
              <span className="font-extrabold text-lg text-slate-900 tracking-tight">
                PDF & Image Suite<span className="text-indigo-600 font-black italic">.</span>
              </span>
            </button>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6">
            <button 
              onClick={() => navigateTo('landing')}
              className={`text-sm font-medium transition-colors cursor-pointer ${
                currentView === 'landing' ? 'text-indigo-600 font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
              id="nav-link-home"
            >
              All Tools
            </button>
            
            {/* Quota display */}
            <div className="flex items-center gap-2.5">
              {isPremium ? (
                <button
                  onClick={openUpgradeModal}
                  className="inline-flex items-center gap-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-extrabold px-3 py-1 rounded-full shadow-xs cursor-pointer"
                  id="navbar-badge-pro"
                >
                  <Sparkles className="h-3 w-3 animate-pulse" />
                  {user?.role === 'admin' ? 'ADMIN' : 'PRO ACCESS'}
                </button>
              ) : (
                <div className="flex items-center gap-2" id="navbar-quota-widget">
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Free Daily Quota</p>
                    <p className="text-xs font-bold text-slate-700">{remainingQuota} of {quotaLimit} left</p>
                  </div>
                  <div className="w-12 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${(remainingQuota / quotaLimit) * 100}%` }}
                    />
                  </div>
                  <button
                    onClick={openUpgradeModal}
                    className="ml-1 flex items-center gap-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-xs font-semibold px-3 py-1.5 rounded-full transition-colors border border-indigo-100 cursor-pointer"
                    id="upgrade-nav-btn"
                  >
                    Go Pro ⚡
                  </button>
                </div>
              )}
            </div>

            <div className="h-4 w-px bg-slate-200" />

            {/* Auth section */}
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-slate-950 transition-colors focus:outline-none cursor-pointer py-1.5 px-2 rounded-lg hover:bg-slate-50"
                  id="navbar-profile-dropdown-trigger"
                >
                  <div className="h-8 w-8 bg-slate-100 border border-slate-200 text-slate-600 rounded-full flex items-center justify-center font-bold text-xs overflow-hidden">
                    {user.photoURL ? (
                      <img src={user.photoURL} alt={user.displayName || 'Profile'} referrerPolicy="no-referrer" />
                    ) : (
                      user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'
                    )}
                  </div>
                  <span className="max-w-[120px] truncate">{user.displayName}</span>
                  <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />
                </button>

                {/* Dropdown menu */}
                {dropdownOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-slate-200 py-2.5 text-slate-700 animate-in fade-in slide-in-from-top-2 duration-150 z-50"
                    id="profile-dropdown-menu"
                  >
                    <div className="px-4 py-2 border-b border-slate-100 mb-1.5">
                      <p className="text-xs text-slate-400 font-semibold truncate">Signed in as</p>
                      <p className="text-sm font-bold text-slate-800 truncate">{user.email}</p>
                    </div>

                    <button
                      onClick={() => navigateTo('dashboard')}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 transition-colors flex items-center gap-2 cursor-pointer ${
                        currentView === 'dashboard' ? 'text-indigo-600 bg-indigo-50/20 font-semibold' : ''
                      }`}
                      id="dropdown-link-dashboard"
                    >
                      <LayoutDashboard className="h-4 w-4 text-slate-400 shrink-0" />
                      Dashboard
                    </button>

                    {user.role === 'admin' && (
                      <button
                        onClick={() => navigateTo('admin')}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 transition-colors flex items-center gap-2 cursor-pointer text-amber-700 font-medium ${
                          currentView === 'admin' ? 'bg-amber-50/40 font-semibold' : ''
                        }`}
                        id="dropdown-link-admin"
                      >
                        <ShieldAlert className="h-4 w-4 text-amber-500 shrink-0" />
                        Admin Panel
                      </button>
                    )}

                    <div className="h-px bg-slate-100 my-1.5" />

                    <button
                      onClick={logout}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-red-50 text-red-600 hover:text-red-700 transition-colors flex items-center gap-2 cursor-pointer"
                      id="dropdown-link-logout"
                    >
                      <LogOut className="h-4 w-4 shrink-0" />
                      Log Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => openAuthModal('login')}
                  className="text-sm font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 transition-colors cursor-pointer"
                  id="navbar-signin-btn"
                >
                  Sign In
                </button>
                <button
                  onClick={() => openAuthModal('register')}
                  className="text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-xl transition-colors shadow-xs cursor-pointer"
                  id="navbar-signup-btn"
                >
                  Sign Up Free
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Trigger */}
          <div className="flex items-center md:hidden gap-2">
            {!isPremium && (
              <button
                onClick={openUpgradeModal}
                className="bg-indigo-50 text-indigo-700 border border-indigo-100 text-xs font-semibold px-2.5 py-1 rounded-full cursor-pointer"
              >
                Go Pro ⚡
              </button>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-slate-600 hover:text-slate-950 p-1.5 rounded-lg hover:bg-slate-50 transition-colors focus:outline-none cursor-pointer"
              id="navbar-mobile-menu-trigger"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white py-4 px-4 space-y-4 shadow-xl" id="mobile-menu-drawer">
          <div className="space-y-1">
            <button
              onClick={() => navigateTo('landing')}
              className="w-full text-left py-2.5 px-3 rounded-lg text-sm font-medium hover:bg-slate-50 text-slate-700"
            >
              All Tools
            </button>
            {user && (
              <button
                onClick={() => navigateTo('dashboard')}
                className="w-full text-left py-2.5 px-3 rounded-lg text-sm font-medium hover:bg-slate-50 text-slate-700"
              >
                Dashboard
              </button>
            )}
            <button
              onClick={() => navigateTo('install-app')}
              className="w-full text-left py-2.5 px-3 rounded-lg text-sm font-medium hover:bg-indigo-50/40 text-indigo-600 font-bold"
            >
              Install Mobile App 📱
            </button>
            {user?.role === 'admin' && (
              <button
                onClick={() => navigateTo('admin')}
                className="w-full text-left py-2.5 px-3 rounded-lg text-sm font-medium hover:bg-slate-50 text-amber-700"
              >
                Admin Panel
              </button>
            )}
          </div>

          {!isPremium && (
            <div className="border-t border-slate-100 pt-4" id="mobile-quota-widget">
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="font-semibold text-slate-500">Daily Free Quota</span>
                <span className="font-bold text-slate-700">{remainingQuota} / {quotaLimit} remaining</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-indigo-600 h-full rounded-full"
                  style={{ width: `${(remainingQuota / quotaLimit) * 100}%` }}
                />
              </div>
            </div>
          )}

          <div className="border-t border-slate-100 pt-4 flex flex-col gap-2">
            {user ? (
              <>
                <div className="px-3 pb-2 flex items-center gap-3">
                  <div className="h-9 w-9 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-600 text-sm border border-slate-200 overflow-hidden">
                    {user.photoURL ? (
                      <img src={user.photoURL} alt={user.displayName || 'Profile'} />
                    ) : (
                      user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">{user.displayName}</p>
                    <p className="text-xs text-slate-400 truncate">{user.email}</p>
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="w-full py-2.5 px-3 rounded-lg text-sm font-bold text-red-600 hover:bg-red-50 text-left flex items-center gap-2 cursor-pointer"
                >
                  <LogOut className="h-4 w-4 shrink-0" />
                  Log Out
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => openAuthModal('login')}
                  className="w-full py-2.5 text-center rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 border border-slate-200 transition-all"
                >
                  Sign In
                </button>
                <button
                  onClick={() => openAuthModal('register')}
                  className="w-full py-2.5 text-center rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-all shadow-xs"
                >
                  Sign Up Free
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
