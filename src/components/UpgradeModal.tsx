import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check, Shield, Sparkles, Gift, Flame } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const UpgradeModal: React.FC = () => {
  const { upgradeModalOpen, closeUpgradeModal, upgradeToPremium, mockPromoCode, user } = useApp();
  
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');
  const [promoCode, setPromoCode] = useState('');
  const [promoError, setPromoError] = useState<string | null>(null);
  const [promoSuccess, setPromoSuccess] = useState<string | null>(null);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('stripe_success') === 'true';
  });
  const [paymentError, setPaymentError] = useState<string | null>(null);

  if (!upgradeModalOpen) return null;

  const handleApplyPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError(null);
    setPromoSuccess(null);
    
    if (!promoCode.trim()) return;

    if (!user) {
      setPromoError('Please sign in or create an account to use a promotional code.');
      return;
    }

    try {
      const success = await mockPromoCode(promoCode);
      if (success) {
        setPromoSuccess('Promotional code applied! Welcome to Premium!');
        setPromoCode('');
        setTimeout(() => {
          closeUpgradeModal();
          setPromoSuccess(null);
        }, 2000);
      } else {
        setPromoError('Invalid promo code. Try PREMIUM2026 or VIPFREE.');
      }
    } catch (err) {
      setPromoError('Error applying promo code.');
    }
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentError(null);
    
    if (!user) {
      setPaymentError('Please sign in or create an account to subscribe.');
      return;
    }

    setIsProcessing(true);

    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan: billingCycle,
          uid: user.uid,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session.');
      }

      if (data.url) {
        // Redirection to the Stripe checkout gateway
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned from the backend service.');
      }
    } catch (err: any) {
      setPaymentError(err.message || 'Payment initiation failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const features = [
    'Unlimited processing of PDFs & Images',
    'Up to 100 MB max file size (vs 10 MB on free)',
    'Full access to all 8 specialized workflow tools',
    'Lightning fast conversions with priority queueing',
    'No file queues & no advertisements',
    'Bank-grade SSL-encrypted secure document transfers',
    'Dedicated 24/7 customer support access'
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeUpgradeModal}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        />

        {/* Modal Panel */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', duration: 0.4 }}
          className="relative w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl border border-slate-100 flex flex-col md:flex-row"
          id="upgrade-modal-container"
        >
          {/* Close Button */}
          <button 
            onClick={closeUpgradeModal}
            className="absolute top-4 right-4 z-10 text-slate-400 hover:text-slate-600 transition-colors p-1 hover:bg-slate-50 rounded-full"
            id="close-upgrade-modal"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Left Column: Benefits */}
          <div className="flex-1 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-8 md:p-10 flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs px-3 py-1 rounded-full font-semibold uppercase tracking-wider mb-4">
                <Sparkles className="h-3 w-3" />
                Go Unlimited
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight text-white mb-2">
                PDF & Image Suite <span className="text-indigo-400">Pro</span>
              </h2>
              <p className="text-slate-300 text-sm mb-6 leading-relaxed">
                Break free from daily quotas. Power up your professional document and image editing toolbox with high-capacity limits, private bank-grade encryption, and premium assets.
              </p>

              {/* Feature list */}
              <div className="space-y-3.5">
                {features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-sm">
                    <div className="h-5 w-5 rounded-full bg-indigo-500/15 flex items-center justify-center text-indigo-400 shrink-0 mt-0.5 border border-indigo-500/10">
                      <Check className="h-3 w-3" />
                    </div>
                    <span className="text-slate-200">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Note */}
            <div className="mt-8 pt-6 border-t border-white/10 flex items-center gap-3">
              <Shield className="h-5 w-5 text-indigo-400 shrink-0" />
              <p className="text-xs text-slate-400">
                Processed files are fully deleted from system memory after conversion. Your private document security is 100% guaranteed.
              </p>
            </div>
          </div>

          {/* Right Column: Checkout or Success */}
          <div className="flex-1 bg-white p-8 md:p-10 flex flex-col justify-between">
            {paymentSuccess ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="h-full flex flex-col items-center justify-center text-center py-10"
                id="payment-success-card"
              >
                <div className="h-16 w-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4 border-4 border-emerald-50">
                  <Check className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-1">Upgrade Complete!</h3>
                <p className="text-slate-500 text-sm max-w-xs">
                  Your account was successfully upgraded to PDF & Image Suite Pro. Enjoy unlimited file processing!
                </p>
                <div className="mt-4 text-xs font-mono bg-slate-50 text-slate-500 px-3 py-1 rounded">
                  Transaction status: APPROVED
                </div>
              </motion.div>
            ) : (
              <div className="flex flex-col h-full justify-between gap-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-3">Choose Billing Plan</h3>
                  
                  {/* Plan buttons */}
                  <div className="grid grid-cols-2 gap-3 mb-6" id="plan-billing-selector">
                    <button
                      type="button"
                      onClick={() => setBillingCycle('monthly')}
                      className={`relative p-3.5 border rounded-xl text-left transition-all flex flex-col justify-between cursor-pointer ${
                        billingCycle === 'monthly'
                          ? 'border-indigo-600 bg-indigo-50/20 text-slate-900 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 text-slate-500 bg-white'
                      }`}
                      id="monthly-plan-option"
                    >
                      <span className="text-xs font-bold uppercase tracking-wider block">Monthly</span>
                      <div className="flex items-baseline gap-0.5 mt-1">
                        <span className="text-xl font-extrabold text-slate-900">$9</span>
                        <span className="text-xs">/mo</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setBillingCycle('yearly')}
                      className={`relative p-3.5 border rounded-xl text-left transition-all flex flex-col justify-between cursor-pointer ${
                        billingCycle === 'yearly'
                          ? 'border-indigo-600 bg-indigo-50/20 text-slate-900 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 text-slate-500 bg-white'
                      }`}
                      id="yearly-plan-option"
                    >
                      <div className="absolute -top-2 right-2 bg-rose-500 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-full uppercase flex items-center gap-0.5">
                        <Flame className="h-2 w-2" /> Save 27%
                      </div>
                      <span className="text-xs font-bold uppercase tracking-wider block">Yearly</span>
                      <div className="flex items-baseline gap-0.5 mt-1">
                        <span className="text-xl font-extrabold text-slate-900">$79</span>
                        <span className="text-xs">/yr</span>
                      </div>
                    </button>
                  </div>

                  {paymentError && (
                    <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-xs">
                      {paymentError}
                    </div>
                  )}

                  {/* Payment Form */}
                  <form onSubmit={handlePaymentSubmit} className="space-y-4" id="billing-form">
                    <div className="p-4 bg-slate-50 border border-slate-150 rounded-xl">
                      <div className="flex items-center gap-2 mb-2 text-slate-800">
                        <Shield className="h-4 w-4 text-indigo-600 shrink-0" />
                        <span className="text-xs font-bold uppercase tracking-wider">Secure Payment via Stripe</span>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        You will be redirected to Stripe's secure payment gateway. Your billing information is fully encrypted and never handled on our servers.
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={isProcessing}
                      className="w-full mt-2 py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold rounded-xl text-sm transition-colors flex items-center justify-center gap-1.5 shadow-sm shadow-indigo-500/10 cursor-pointer"
                      id="upgrade-submit-btn"
                    >
                      {isProcessing ? (
                        <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        `Pay $${billingCycle === 'monthly' ? '9.00' : '79.00'} & Go Pro`
                      )}
                    </button>
                  </form>
                </div>

                {/* Promo code area */}
                <div className="pt-4 border-t border-slate-100">
                  <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-1.5">
                    <Gift className="h-3.5 w-3.5 text-indigo-500" />
                    Have a promo code?
                  </h4>
                  <form onSubmit={handleApplyPromo} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Try PREMIUM2026 or VIPFREE"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-slate-300 font-mono"
                      id="promo-code-input"
                    />
                    <button
                      type="submit"
                      className="px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs transition-colors shrink-0 cursor-pointer"
                      id="apply-promo-btn"
                    >
                      Apply
                    </button>
                  </form>
                  {promoError && <p className="text-red-500 text-[10px] font-medium mt-1">{promoError}</p>}
                  {promoSuccess && <p className="text-emerald-600 text-[10px] font-bold mt-1">{promoSuccess}</p>}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
