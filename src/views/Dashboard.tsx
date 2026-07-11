import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Sparkles, 
  User, 
  Mail, 
  Calendar, 
  Clock, 
  FileText, 
  CheckCircle, 
  XCircle,
  TrendingUp,
  CreditCard,
  PlusCircle,
  AlertTriangle
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export const Dashboard: React.FC = () => {
  const { user, quotaUsed, quotaLimit, recentLogs, openUpgradeModal, refreshUserData } = useApp();
  const [canceling, setCanceling] = useState(false);
  const [cancelSuccess, setCancelSuccess] = useState(false);

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-800">Please sign in to view your Dashboard</h2>
        <p className="text-sm text-slate-500 max-w-sm mx-auto">Track your daily usage quotas, view history logs, and manage subscription settings.</p>
      </div>
    );
  }

  const handleCancelSubscription = async () => {
    setCanceling(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {
        role: 'free',
        subscriptionStatus: 'canceled',
        subscriptionPlan: 'none',
        expiresAt: null
      }, { merge: true });
      
      await refreshUserData();
      setCancelSuccess(true);
      setTimeout(() => setCancelSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setCanceling(false);
    }
  };

  const isPremium = user.role === 'premium' || user.role === 'admin';
  const remainingQuota = Math.max(0, quotaLimit - quotaUsed);

  // Parse recent logs into daily chart data for Recharts (past 7 days)
  const getChartData = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dataMap: { [key: string]: number } = {};
    
    // Initialize past 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayName = days[date.getDay()];
      dataMap[dayName] = 0;
    }

    // Accumulate logs
    recentLogs.forEach((log) => {
      const logDate = new Date(log.timestamp);
      const dayName = days[logDate.getDay()];
      if (dataMap[dayName] !== undefined) {
        dataMap[dayName] += 1;
      }
    });

    return Object.keys(dataMap).map((key) => ({
      name: key,
      files: dataMap[key]
    }));
  };

  const chartData = getChartData();

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getToolName = (toolId: string) => {
    return {
      'merge': 'Merge PDF',
      'split': 'Split PDF',
      'compress': 'Compress PDF',
      'pdf-to-img': 'PDF to Image',
      'img-to-pdf': 'Image to PDF',
      'pdf-to-word': 'PDF to Word',
      'word-to-pdf': 'Word to PDF',
      'img-convert': 'Format Converter',
      'pdf-to-ppt': 'PDF to PPT',
      'ppt-to-pdf': 'PPT to PDF',
      'pdf-to-excel': 'PDF to Excel',
      'excel-to-pdf': 'Excel to PDF'
    }[toolId] || toolId;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10" id="user-dashboard">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-6 sm:p-8 text-white flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-md">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Hello, <span className="text-indigo-400">{user.displayName || 'User'}</span>!
          </h1>
          <p className="text-slate-300 text-sm font-medium">Welcome to your personal workspace portal.</p>
        </div>
        
        {/* Account tier display */}
        <div className="bg-white/10 backdrop-blur-xs rounded-xl py-3 px-5 border border-white/10 shrink-0 self-start md:self-auto flex items-center gap-3">
          <div className={`h-10 w-10 rounded-lg flex items-center justify-center text-white font-bold shadow ${
            isPremium ? 'bg-amber-500' : 'bg-indigo-600'
          }`}>
            {isPremium ? <Sparkles className="h-5.5 w-5.5" /> : <User className="h-5.5 w-5.5" />}
          </div>
          <div>
            <p className="text-[10px] text-slate-300 uppercase font-extrabold tracking-wider">Account Tier</p>
            <p className="text-sm font-extrabold text-white">
              {user.role === 'admin' ? 'SYSTEM ADMIN' : isPremium ? 'PREMIUM PRO' : 'FREE USER'}
            </p>
          </div>
        </div>
      </div>

      {/* Grid: Quota Meter & Plan Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Card 1: Quota tracking */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Clock className="h-4.5 w-4.5 text-slate-400" />
              Daily Quota Tracker
            </h3>
            
            {isPremium ? (
              <div className="space-y-4 py-2">
                <div className="h-12 w-12 bg-amber-50 rounded-full flex items-center justify-center text-amber-500 border border-amber-100/50">
                  <Sparkles className="h-6 w-6 animate-pulse" />
                </div>
                <h4 className="text-base font-extrabold text-slate-800">Unlimited Active Processing</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  As a Pro Subscriber, you enjoy unlimited document & image conversions, maximum 100MB uploads, and access to priority queues.
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="flex justify-between items-baseline">
                  <span className="text-4xl font-extrabold text-slate-800">{remainingQuota}</span>
                  <span className="text-sm text-slate-400 font-bold">/ {quotaLimit} uses left today</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${(remainingQuota / quotaLimit) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Your daily free quota resets every night. Once you run out of uses, you must wait or upgrade to premium.
                </p>
              </div>
            )}
          </div>
          
          {!isPremium && (
            <button
              onClick={openUpgradeModal}
              className="w-full py-2.5 mt-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-indigo-500/10 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              Upgrade to Premium Pro <PlusCircle className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Card 2: Subscription & Billing */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <CreditCard className="h-4.5 w-4.5 text-slate-400" />
              Subscription Management
            </h3>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 pb-2 border-b border-slate-50">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Plan</p>
                  <p className="text-sm font-bold text-slate-800 capitalize mt-0.5">
                    {user.subscriptionPlan || 'Free Tier'}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</p>
                  <p className="text-xs font-bold mt-0.5 inline-flex items-center gap-1 text-emerald-600">
                    <CheckCircle className="h-3 w-3 shrink-0" />
                    {user.subscriptionStatus === 'active' ? 'Active' : 'Unsubscribed'}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Account Creation Date</p>
                <p className="text-sm font-semibold text-slate-700 mt-0.5 flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
                  {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </div>

              {user.expiresAt && (
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Plan Expiration/Renewal</p>
                  <p className="text-sm font-semibold text-slate-700 mt-0.5 flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
                    {new Date(user.expiresAt).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </div>

          {user.role === 'premium' && (
            <div className="mt-6">
              {cancelSuccess && (
                <div className="mb-3 p-2 text-center rounded-lg bg-emerald-50 text-emerald-600 text-xs font-bold">
                  Subscription successfully canceled.
                </div>
              )}
              <button
                onClick={handleCancelSubscription}
                disabled={canceling}
                className="w-full py-2 bg-white border border-red-200 hover:border-red-300 hover:bg-red-50 text-red-600 font-bold rounded-xl text-xs transition-colors text-center cursor-pointer disabled:opacity-50"
              >
                {canceling ? 'Canceling...' : 'Cancel Subscription'}
              </button>
            </div>
          )}
        </div>

        {/* Card 3: Performance Charts */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <TrendingUp className="h-4.5 w-4.5 text-slate-400" />
              Processing Analytics (7 Days)
            </h3>

            {recentLogs.length === 0 ? (
              <div className="h-32 flex items-center justify-center text-xs text-slate-400">
                No files processed yet.
              </div>
            ) : (
              <div className="h-36 w-full" id="user-conversion-chart">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorFiles" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.25}/>
                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                    <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #e2e8f0' }} />
                    <Area type="monotone" dataKey="files" stroke="#4f46e5" strokeWidth={2} fillOpacity={1} fill="url(#colorFiles)" name="Conversions" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
          <div className="text-center pt-2">
            <span className="text-xs font-bold text-slate-500">
              Total Lifetime Processing Volume: {user.totalFilesProcessed || 0} files
            </span>
          </div>
        </div>

      </div>

      {/* Recent Activity Log Table */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs">
        <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider mb-5 flex items-center gap-2 pb-3 border-b border-slate-50">
          <FileText className="h-4.5 w-4.5 text-slate-400" />
          Recent Activity Logs
        </h3>

        {recentLogs.length === 0 ? (
          <div className="py-12 text-center space-y-2">
            <div className="h-10 w-10 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto">
              <FileText className="h-5 w-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-700">No activity logged</h4>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">Process your first PDF or image document from the main tools suite to log conversions.</p>
          </div>
        ) : (
          <div className="overflow-x-auto" id="dashboard-activity-table">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider pb-3">
                  <th className="py-3 px-4">Tool</th>
                  <th className="py-3 px-4">File Name</th>
                  <th className="py-3 px-4">Size</th>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-sm text-slate-700">
                {recentLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{getToolName(log.tool)}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-600 truncate max-w-xs">{log.fileName}</td>
                    <td className="py-3.5 px-4 font-medium text-slate-500">{formatSize(log.fileSize)}</td>
                    <td className="py-3.5 px-4 font-medium text-slate-400">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold leading-normal ${
                        log.status === 'success' 
                          ? 'bg-emerald-50 text-emerald-600' 
                          : 'bg-red-50 text-red-600'
                      }`}>
                        {log.status === 'success' ? 'SUCCESS' : 'FAILED'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
