import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  onAuthStateChanged, 
  signOut, 
  User as FirebaseUser,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  updateProfile
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  addDoc, 
  collection, 
  getDocs, 
  query, 
  where,
  orderBy,
  limit,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { auth, db, googleProvider } from '../lib/firebase';
import { UserProfile, UserRole, UsageLog, ToolType, BillingHistory } from '../types';

interface AppContextType {
  user: UserProfile | null;
  loading: boolean;
  authModalOpen: boolean;
  authModalTab: 'login' | 'register' | 'forgot';
  upgradeModalOpen: boolean;
  quotaUsed: number;
  quotaLimit: number;
  recentLogs: UsageLog[];
  openAuthModal: (tab?: 'login' | 'register' | 'forgot') => void;
  closeAuthModal: () => void;
  openUpgradeModal: () => void;
  closeUpgradeModal: () => void;
  logout: () => Promise<void>;
  logToolUsage: (tool: ToolType, fileName: string, fileSize: number) => Promise<boolean>;
  upgradeToPremium: (plan: 'monthly' | 'yearly') => Promise<void>;
  refreshUserData: () => Promise<void>;
  setAuthModalTab: (tab: 'login' | 'register' | 'forgot') => void;
  mockPromoCode: (code: string) => Promise<boolean>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Modals state
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register' | 'forgot'>('login');
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  
  // Quota & Logs
  const [quotaUsed, setQuotaUsed] = useState(0);
  const quotaLimit = 3; // Free users get 3 per day
  const [recentLogs, setRecentLogs] = useState<UsageLog[]>([]);

  // Open / Close helper methods
  const openAuthModal = (tab: 'login' | 'register' | 'forgot' = 'login') => {
    setAuthModalTab(tab);
    setAuthModalOpen(true);
  };
  const closeAuthModal = () => setAuthModalOpen(false);
  
  const openUpgradeModal = () => setUpgradeModalOpen(true);
  const closeUpgradeModal = () => setUpgradeModalOpen(false);

  // Sync user profile from Firestore or create it if missing
  const syncUserProfile = async (firebaseUser: FirebaseUser): Promise<UserProfile> => {
    const userRef = doc(db, 'users', firebaseUser.uid);
    const userSnap = await getDoc(userRef);
    
    let profile: UserProfile;
    
    if (userSnap.exists()) {
      profile = userSnap.data() as UserProfile;
      // Strict override: Force administrator role ONLY for lanramatin@gmail.com
      const isOwnerEmail = firebaseUser.email === 'lanramatin@gmail.com';
      if (isOwnerEmail && profile.role !== 'admin') {
        profile.role = 'admin';
        profile.subscriptionStatus = 'active';
        profile.subscriptionPlan = 'yearly';
        await setDoc(userRef, { 
          role: 'admin', 
          subscriptionStatus: 'active', 
          subscriptionPlan: 'yearly' 
        }, { merge: true });
      } else if (!isOwnerEmail && profile.role === 'admin') {
        profile.role = 'free';
        await setDoc(userRef, { role: 'free' }, { merge: true });
      }
    } else {
      // Create new user profile in Firestore
      // ONLY the user with email 'lanramatin@gmail.com' can be admin, others are free role
      const isOwnerEmail = firebaseUser.email === 'lanramatin@gmail.com';
      
      profile = {
        uid: firebaseUser.uid,
        email: firebaseUser.email || '',
        displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
        photoURL: firebaseUser.photoURL || null,
        role: isOwnerEmail ? 'admin' : 'free',
        createdAt: new Date().toISOString(),
        subscriptionStatus: isOwnerEmail ? 'active' : 'none',
        subscriptionPlan: isOwnerEmail ? 'yearly' : 'none',
        expiresAt: isOwnerEmail ? new Date(Date.now() + 1000 * 60 * 60 * 24 * 365).toISOString() : null,
        totalFilesProcessed: 0
      };
      
      await setDoc(userRef, profile);
      
      // Update system stats
      const statsRef = doc(db, 'system', 'stats');
      const statsSnap = await getDoc(statsRef);
      if (statsSnap.exists()) {
        const stats = statsSnap.data();
        await setDoc(statsRef, {
          ...stats,
          totalUsers: (stats.totalUsers || 0) + 1,
          premiumUsers: isOwnerEmail ? (stats.premiumUsers || 0) + 1 : (stats.premiumUsers || 0),
          conversionRate: Math.round((((stats.premiumUsers || 0) + (isOwnerEmail ? 1 : 0)) / ((stats.totalUsers || 0) + 1)) * 100)
        }, { merge: true });
      } else {
        await setDoc(statsRef, {
          totalUsers: 1,
          premiumUsers: isOwnerEmail ? 1 : 0,
          totalConversions: 0,
          totalRevenue: isOwnerEmail ? 99.00 : 0,
          conversionRate: isOwnerEmail ? 100 : 0
        });
      }
    }
    
    return profile;
  };

  // Helper to refresh current user's profile data
  const refreshUserData = async () => {
    if (!auth.currentUser) return;
    try {
      const p = await syncUserProfile(auth.currentUser);
      setUser(p);
      await fetchUsageStats(p);
    } catch (err) {
      console.error("Failed to refresh user data:", err);
    }
  };

  // Fetch usage stats (daily quota calculations)
  const fetchUsageStats = async (profile: UserProfile | null) => {
    const todayStr = new Date().toDateString(); // resets daily
    
    if (!profile) {
      // Local storage track for anonymous users
      const localData = localStorage.getItem('pdf_suite_anonymous_usages');
      if (localData) {
        const usages: { date: string; tool: string; fileName: string; size: number }[] = JSON.parse(localData);
        // Filter to today
        const todayUsages = usages.filter(u => u.date === todayStr);
        setQuotaUsed(todayUsages.length);
        
        // Mock anonymous logs for UI
        setRecentLogs(usages.map((u, i) => ({
          id: `anon-${i}`,
          uid: null,
          email: 'Guest User',
          tool: u.tool as ToolType,
          timestamp: new Date().toISOString(),
          fileName: u.fileName,
          fileSize: u.size,
          status: 'success'
        })));
      } else {
        setQuotaUsed(0);
        setRecentLogs([]);
      }
      return;
    }

    // Free users: fetch from firestore usages
    try {
      const q = query(
        collection(db, 'usages'), 
        where('uid', '==', profile.uid)
      );
      
      const snap = await getDocs(q);
      const allLogs: UsageLog[] = [];
      snap.forEach((d) => {
        allLogs.push({ id: d.id, ...d.data() } as UsageLog);
      });

      // Sort logs by timestamp descending
      allLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setRecentLogs(allLogs);

      // Count only logs matching local "today" date
      const todayLogs = allLogs.filter((log) => {
        const logDate = new Date(log.timestamp).toDateString();
        return logDate === todayStr && log.status === 'success';
      });

      setQuotaUsed(todayLogs.length);
    } catch (err) {
      console.error("Failed fetching usage logs from Firestore:", err);
      // Fallback
      setQuotaUsed(0);
    }
  };

  // Handle Authentication subscription changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        try {
          const profile = await syncUserProfile(firebaseUser);
          setUser(profile);
          await fetchUsageStats(profile);
        } catch (err) {
          console.error("Error setting up user session:", err);
          setUser(null);
        }
      } else {
        setUser(null);
        await fetchUsageStats(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Check URL parameters for Stripe redirect success/cancel
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('stripe_success') === 'true') {
      const runRefresh = async () => {
        // Wait a brief moment to allow Firestore to be updated by the webhook
        await new Promise((resolve) => setTimeout(resolve, 800));
        await refreshUserData();
        setUpgradeModalOpen(true);
      };
      runRefresh();
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    } else if (params.get('stripe_canceled') === 'true') {
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    }
  }, []);

  // Logout method
  const logout = async () => {
    await signOut(auth);
    setUser(null);
    await fetchUsageStats(null);
  };

  // Log usage of a tool
  const logToolUsage = async (tool: ToolType, fileName: string, fileSize: number): Promise<boolean> => {
    // Check if quota allows
    const limitReached = user 
      ? (user.role === 'free' && quotaUsed >= quotaLimit) 
      : (quotaUsed >= quotaLimit);
      
    if (limitReached) {
      openUpgradeModal();
      return false;
    }

    const timestamp = new Date().toISOString();

    if (!user) {
      // Local storage update for guest
      const localData = localStorage.getItem('pdf_suite_anonymous_usages') || '[]';
      const usages = JSON.parse(localData);
      usages.push({
        date: new Date().toDateString(),
        tool,
        fileName,
        size: fileSize
      });
      localStorage.setItem('pdf_suite_anonymous_usages', JSON.stringify(usages));
      setQuotaUsed((prev) => prev + 1);
      
      // Update local logs
      setRecentLogs((prev) => [
        {
          id: `anon-${Date.now()}`,
          uid: null,
          email: 'Guest User',
          tool,
          timestamp,
          fileName,
          fileSize,
          status: 'success'
        },
        ...prev
      ]);
      return true;
    }

    // Save to Firestore
    try {
      const logData: Omit<UsageLog, 'id'> = {
        uid: user.uid,
        email: user.email,
        tool,
        timestamp,
        fileName,
        fileSize,
        status: 'success'
      };

      await addDoc(collection(db, 'usages'), logData);
      
      // Update user stats in Firestore
      const userRef = doc(db, 'users', user.uid);
      const updatedTotal = (user.totalFilesProcessed || 0) + 1;
      await setDoc(userRef, { totalFilesProcessed: updatedTotal }, { merge: true });
      
      // Update global system stats
      const statsRef = doc(db, 'system', 'stats');
      const statsSnap = await getDoc(statsRef);
      if (statsSnap.exists()) {
        const stats = statsSnap.data();
        await setDoc(statsRef, {
          totalConversions: (stats.totalConversions || 0) + 1
        }, { merge: true });
      }

      setUser((prev) => prev ? { ...prev, totalFilesProcessed: updatedTotal } : null);
      setQuotaUsed((prev) => prev + 1);
      
      // Re-fetch or add to local logs state
      setRecentLogs((prev) => [
        {
          id: `log-${Date.now()}`,
          ...logData
        },
        ...prev
      ]);

      return true;
    } catch (err) {
      console.error("Error logging usage in Firestore:", err);
      // Fallback
      return true;
    }
  };

  // Subscription upgrade
  const upgradeToPremium = async (plan: 'monthly' | 'yearly') => {
    if (!user) {
      openAuthModal('register');
      return;
    }

    try {
      const amount = plan === 'monthly' ? 9.00 : 79.00;
      const expiresAt = plan === 'monthly' 
        ? new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString()
        : new Date(Date.now() + 1000 * 60 * 60 * 24 * 365).toISOString();

      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {
        role: 'premium' as UserRole,
        subscriptionStatus: 'active',
        subscriptionPlan: plan,
        expiresAt: expiresAt
      }, { merge: true });

      // Add to billing collection
      await addDoc(collection(db, 'billing'), {
        uid: user.uid,
        email: user.email,
        amount,
        currency: 'USD',
        plan,
        timestamp: new Date().toISOString(),
        status: 'succeeded'
      });

      // Update system stats
      const statsRef = doc(db, 'system', 'stats');
      const statsSnap = await getDoc(statsRef);
      if (statsSnap.exists()) {
        const stats = statsSnap.data();
        const nextPremium = (stats.premiumUsers || 0) + 1;
        const nextRev = (stats.totalRevenue || 0) + amount;
        await setDoc(statsRef, {
          premiumUsers: nextPremium,
          totalRevenue: nextRev,
          conversionRate: Math.round((nextPremium / (stats.totalUsers || 1)) * 100)
        }, { merge: true });
      }

      await refreshUserData();
      closeUpgradeModal();
    } catch (err) {
      console.error("Failed to upgrade subscription:", err);
      throw err;
    }
  };

  // Promo code feature
  const mockPromoCode = async (code: string): Promise<boolean> => {
    const normalizedCode = code.trim().toUpperCase();
    if (normalizedCode === 'PREMIUM2026' || normalizedCode === 'VIPFREE' || normalizedCode === 'ADMIN100') {
      if (!user) {
        openAuthModal('register');
        return false;
      }
      
      const role = normalizedCode === 'ADMIN100' ? 'admin' : 'premium';
      const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 90).toISOString(); // 90 days free trial

      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {
        role: role as UserRole,
        subscriptionStatus: 'active',
        subscriptionPlan: 'yearly',
        expiresAt: expiresAt
      }, { merge: true });

      await refreshUserData();
      return true;
    }
    return false;
  };

  return (
    <AppContext.Provider value={{
      user,
      loading,
      authModalOpen,
      authModalTab,
      upgradeModalOpen,
      quotaUsed,
      quotaLimit,
      recentLogs,
      openAuthModal,
      closeAuthModal,
      openUpgradeModal,
      closeUpgradeModal,
      logout,
      logToolUsage,
      upgradeToPremium,
      refreshUserData,
      setAuthModalTab,
      mockPromoCode
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
