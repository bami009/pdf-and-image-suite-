import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Lock, User, AlertCircle, ArrowRight, CheckCircle } from 'lucide-react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail,
  signInWithPopup,
  updateProfile
} from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import { useApp } from '../context/AppContext';

export const AuthModal: React.FC = () => {
  const { authModalOpen, authModalTab, closeAuthModal, setAuthModalTab } = useApp();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!authModalOpen) return null;

  const handleClose = () => {
    setEmail('');
    setPassword('');
    setName('');
    setError(null);
    setSuccess(null);
    closeAuthModal();
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithPopup(auth, googleProvider);
      handleClose();
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Sign-in cancelled (popup was closed).');
      } else {
        setError(err.message || 'Failed to authenticate with Google');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      if (authModalTab === 'login') {
        await signInWithEmailAndPassword(auth, email, password);
        handleClose();
      } else if (authModalTab === 'register') {
        if (!name.trim()) {
          setError('Please enter your full name.');
          setLoading(false);
          return;
        }
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, {
          displayName: name
        });
        handleClose();
      } else if (authModalTab === 'forgot') {
        await sendPasswordResetEmail(auth, email);
        setSuccess('Password reset link sent to your email!');
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError('Invalid email or password.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('This email is already registered.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password must be at least 6 characters.');
      } else {
        setError(err.message || 'An error occurred during authentication.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        />

        {/* Modal Panel */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', duration: 0.4 }}
          className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white p-8 shadow-2xl border border-slate-100"
          id="auth-modal-container"
        >
          {/* Close Button */}
          <button 
            onClick={handleClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors p-1 hover:bg-slate-50 rounded-full"
            id="close-auth-modal"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Heading */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight" id="auth-title">
              {authModalTab === 'login' && 'Welcome Back'}
              {authModalTab === 'register' && 'Create Free Account'}
              {authModalTab === 'forgot' && 'Reset Password'}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              {authModalTab === 'login' && 'Unlock power tools to streamline your documents'}
              {authModalTab === 'register' && 'Get 3 free tool uses every single day'}
              {authModalTab === 'forgot' && "We'll send you instructions to recover access"}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-xs flex items-start gap-2"
              id="auth-error-alert"
            >
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </motion.div>
          )}

          {/* Success Message */}
          {success && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-600 text-xs flex items-start gap-2"
              id="auth-success-alert"
            >
              <CheckCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{success}</span>
            </motion.div>
          )}

          {/* Core Auth Form */}
          <form onSubmit={handleSubmit} className="space-y-4" id="auth-form">
            {authModalTab === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="Jane Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-900"
                    id="auth-name-input"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-900"
                  id="auth-email-input"
                />
              </div>
            </div>

            {authModalTab !== 'forgot' && (
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-semibold text-slate-600">Password</label>
                  {authModalTab === 'login' && (
                    <button
                      type="button"
                      onClick={() => setAuthModalTab('forgot')}
                      className="text-xs text-indigo-600 hover:text-indigo-700 font-medium hover:underline"
                      id="forgot-password-link"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-900"
                    id="auth-password-input"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-medium rounded-xl text-sm transition-colors flex items-center justify-center gap-1.5 shadow-sm mt-2 cursor-pointer"
              id="auth-submit-btn"
            >
              {loading ? (
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {authModalTab === 'login' && 'Sign In'}
                  {authModalTab === 'register' && 'Sign Up'}
                  {authModalTab === 'forgot' && 'Send Reset Link'}
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Social Sign In Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-100" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-3 text-slate-400 font-medium">Or continue with</span>
            </div>
          </div>

          {/* Google Sign In Button */}
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            id="auth-google-btn"
          >
            <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
            </svg>
            Google
          </button>

          {/* Toggle Tab Footer */}
          <div className="text-center mt-6 text-xs text-slate-500 font-medium">
            {authModalTab === 'login' ? (
              <>
                Don't have an account?{' '}
                <button 
                  onClick={() => setAuthModalTab('register')}
                  className="text-indigo-600 hover:text-indigo-700 hover:underline font-bold"
                  id="auth-toggle-register"
                >
                  Create one for free
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button 
                  onClick={() => setAuthModalTab('login')}
                  className="text-indigo-600 hover:text-indigo-700 hover:underline font-bold"
                  id="auth-toggle-login"
                >
                  Sign In here
                </button>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
