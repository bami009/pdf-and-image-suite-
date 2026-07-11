import React, { useState, useEffect } from 'react';
import { 
  Smartphone, 
  Apple, 
  Chrome, 
  Share2, 
  PlusSquare, 
  Wifi, 
  WifiOff, 
  CheckCircle2, 
  Info,
  Download,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

export const InstallPWA: React.FC = () => {
  const [platform, setPlatform] = useState<'ios' | 'android' | 'desktop'>('desktop');
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);

  useEffect(() => {
    // Detect Platform
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIos = /iphone|ipad|ipod/.test(userAgent);
    const isAndroid = /android/.test(userAgent);

    if (isIos) {
      setPlatform('ios');
    } else if (isAndroid) {
      setPlatform('android');
    } else {
      setPlatform('desktop');
    }

    // Check if already running in standalone display mode (installed)
    if (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true
    ) {
      setIsInstalled(true);
    }

    // Network status listeners
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Capture standard PWA install prompt
    const handleInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleInstallPrompt);

    // Track successful install
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleInstallPrompt);
    };
  }, []);

  const handleNativeInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
      setDeferredPrompt(null);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-6 space-y-6" id="pwa-install-container">
      
      {/* Dynamic Connectivity Badge */}
      <div 
        className={`flex items-center justify-between p-3.5 rounded-2xl border transition-colors ${
          isOnline 
            ? 'bg-emerald-50/50 border-emerald-100 text-emerald-800' 
            : 'bg-rose-50/50 border-rose-100 text-rose-800'
        }`}
        id="network-status-badge"
      >
        <div className="flex items-center gap-2.5">
          {isOnline ? (
            <div className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </div>
          ) : (
            <WifiOff className="h-4 w-4 text-rose-500" />
          )}
          <span className="text-xs font-bold uppercase tracking-wider">
            {isOnline ? 'Online Engine Live' : 'Offline Mode Active'}
          </span>
        </div>
        <span className="text-[10px] font-medium text-slate-500">
          {isOnline ? 'Cloud database sync active' : 'All tools run 100% locally'}
        </span>
      </div>

      {/* Hero Header */}
      <div className="text-center space-y-2 py-4" id="pwa-hero-header">
        <div className="mx-auto h-16 w-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-500/20">
          <Smartphone className="h-8 w-8" />
        </div>
        <h1 className="text-xl font-black text-slate-900 tracking-tight">PDF & Image Suite</h1>
        <p className="text-slate-500 text-xs px-6">
          Install our app on your device for dynamic tools, fast startup, and native-feeling gesture control.
        </p>
      </div>

      {/* Installed Status */}
      {isInstalled ? (
        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5 text-center space-y-3" id="pwa-installed-success">
          <div className="inline-flex items-center justify-center h-10 w-10 bg-emerald-100 text-emerald-600 rounded-full">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-emerald-900 text-sm">App Successfully Installed!</h3>
            <p className="text-xs text-emerald-700 leading-relaxed">
              Launch PDF & Image Suite directly from your app drawer or home screen anytime.
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Native Install Button Trigger (Android & Chrome Desktop) */}
          {deferredPrompt && (
            <button
              onClick={handleNativeInstall}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-2xl text-sm transition-all shadow-md shadow-indigo-500/15 flex items-center justify-center gap-2 cursor-pointer animate-bounce"
              id="pwa-install-native-btn"
            >
              <Download className="h-4.5 w-4.5" />
              Install Native App Now
            </button>
          )}

          {/* Dynamic OS Guidance */}
          <div className="space-y-4" id="pwa-guidance-tabs">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Installation Instructions</span>
              <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold uppercase">
                {platform === 'ios' ? 'iOS Safari' : platform === 'android' ? 'Android / Chrome' : 'Desktop Browser'}
              </span>
            </div>

            {platform === 'ios' && (
              <div className="space-y-4" id="ios-guide-steps">
                <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex gap-3 text-amber-900">
                  <Info className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-xs leading-relaxed">
                    Apple iOS requires Safari to install progressive mobile apps. Third-party iOS browsers (like Chrome or Firefox) do not support home screen installations.
                  </p>
                </div>

                <div className="space-y-3">
                  {/* Step 1 */}
                  <div className="flex items-start gap-3.5 p-3 bg-white border border-slate-100 rounded-xl shadow-xs">
                    <span className="flex items-center justify-center h-6 w-6 bg-indigo-50 text-indigo-600 rounded-full text-xs font-extrabold">1</span>
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-800">Tap the Share Menu</p>
                      <p className="text-xs text-slate-500 flex items-center gap-1.5 flex-wrap">
                        Tap the share icon <Share2 className="h-3.5 w-3.5 text-blue-500 inline" /> at the bottom of Safari's viewport.
                      </p>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="flex items-start gap-3.5 p-3 bg-white border border-slate-100 rounded-xl shadow-xs">
                    <span className="flex items-center justify-center h-6 w-6 bg-indigo-50 text-indigo-600 rounded-full text-xs font-extrabold">2</span>
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-800">Select "Add to Home Screen"</p>
                      <p className="text-xs text-slate-500 flex items-center gap-1.5 flex-wrap">
                        Scroll down and tap <PlusSquare className="h-3.5 w-3.5 text-slate-700 inline" /> <span className="font-semibold text-slate-700">Add to Home Screen</span>.
                      </p>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="flex items-start gap-3.5 p-3 bg-white border border-slate-100 rounded-xl shadow-xs">
                    <span className="flex items-center justify-center h-6 w-6 bg-indigo-50 text-indigo-600 rounded-full text-xs font-extrabold">3</span>
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-800">Launch from your Screen</p>
                      <p className="text-xs text-slate-500">
                        Launch the app icon from your iOS device screen to load without browser frame borders!
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {platform === 'android' && (
              <div className="space-y-3" id="android-guide-steps">
                {!deferredPrompt && (
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex gap-3 text-slate-600">
                    <Info className="h-5 w-5 text-indigo-500 shrink-0 mt-0.5" />
                    <p className="text-xs leading-relaxed">
                      If the native installation trigger did not appear automatically, you can always install by opening the Chrome menu (three dots icon <span className="font-bold">⋮</span>) and selecting <span className="font-bold text-slate-800">Install App</span>.
                    </p>
                  </div>
                )}

                <div className="flex items-start gap-3.5 p-3 bg-white border border-slate-100 rounded-xl shadow-xs">
                  <span className="flex items-center justify-center h-6 w-6 bg-indigo-50 text-indigo-600 rounded-full text-xs font-extrabold">1</span>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-800">Tap the Install Prompt</p>
                    <p className="text-xs text-slate-500">
                      Tap the "Install Native App Now" button at the top of this page.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-3 bg-white border border-slate-100 rounded-xl shadow-xs">
                  <span className="flex items-center justify-center h-6 w-6 bg-indigo-50 text-indigo-600 rounded-full text-xs font-extrabold">2</span>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-800">Confirm Installation</p>
                    <p className="text-xs text-slate-500">
                      Confirm the native OS browser prompt and let your phone compile the icon on your screen.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {platform === 'desktop' && (
              <div className="space-y-3" id="desktop-guide-steps">
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex gap-3 text-slate-600">
                  <Chrome className="h-5 w-5 text-indigo-500 shrink-0 mt-0.5" />
                  <p className="text-xs leading-relaxed">
                    You can install PDF & Image Suite on your laptop/desktop for standalone window usage, offline execution, and desktop taskbar pin.
                  </p>
                </div>

                <div className="flex items-start gap-3.5 p-3 bg-white border border-slate-100 rounded-xl shadow-xs">
                  <span className="flex items-center justify-center h-6 w-6 bg-indigo-50 text-indigo-600 rounded-full text-xs font-extrabold">1</span>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-800">Look at the Address Bar</p>
                    <p className="text-xs text-slate-500">
                      In Chrome, Edge, or Brave, look for the monitor-with-arrow download icon in the URL bar.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-3 bg-white border border-slate-100 rounded-xl shadow-xs">
                  <span className="flex items-center justify-center h-6 w-6 bg-indigo-50 text-indigo-600 rounded-full text-xs font-extrabold">2</span>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-800">Click Install</p>
                    <p className="text-xs text-slate-500">
                      Click the installation indicator inside the address bar to open this application in a separate native slate window.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Safety & Offline Info Card */}
      <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-3xl p-5 space-y-4 shadow-lg" id="pwa-benefits-card">
        <div className="flex items-center gap-2 text-indigo-300">
          <ShieldCheck className="h-5 w-5 shrink-0" />
          <h3 className="text-xs font-bold uppercase tracking-wider">PWA Native Benefits</h3>
        </div>
        <div className="space-y-3 text-xs text-indigo-100">
          <div className="flex gap-2.5">
            <CheckCircle2 className="h-4 w-4 text-indigo-300 shrink-0" />
            <p><strong className="text-white">Secure Sandbox</strong>: Runs completely inside your safe browser sandbox. No device storage leaks.</p>
          </div>
          <div className="flex gap-2.5">
            <CheckCircle2 className="h-4 w-4 text-indigo-300 shrink-0" />
            <p><strong className="text-white">Offline Capability</strong>: Process and convert documents local-only even without an internet connection.</p>
          </div>
          <div className="flex gap-2.5">
            <CheckCircle2 className="h-4 w-4 text-indigo-300 shrink-0" />
            <p><strong className="text-white">Instant Updates</strong>: Zero manual app store updates needed. Updates instantly on reload.</p>
          </div>
        </div>
      </div>

    </div>
  );
};
