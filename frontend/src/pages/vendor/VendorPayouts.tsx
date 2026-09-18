import { useEffect, useState } from 'react';
import { 
  DollarSign, 
  CreditCard, 
  Clock, 
  CheckCircle2, 
  ArrowUpRight, 
  Building2, 
  ShieldCheck, 
  Sparkles,
  HelpCircle
} from 'lucide-react';
import apiClient from '../../api/client';
import { useToastStore } from '../../store/toastStore';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';

interface PayoutSummary {
  availableBalance: number;
  pendingBalance: number;
  lifetimeEarnings: number;
  totalPaidOut: number;
}

interface PayoutRecord {
  _id: string;
  amount: number;
  status: 'pending' | 'paid';
  createdAt: string;
}

const VendorPayouts = () => {
  const [summary, setSummary] = useState<PayoutSummary>({
    availableBalance: 480.00,
    pendingBalance: 237.50,
    lifetimeEarnings: 1250.00,
    totalPaidOut: 532.50,
  });
  const [payouts, setPayouts] = useState<PayoutRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Request Payout Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [requestAmount, setRequestAmount] = useState('');
  const [payoutMethod, setPayoutMethod] = useState<'bank' | 'stripe' | 'paypal'>('bank');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addToast = useToastStore((state) => state.addToast);

  const fetchPayoutData = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/payouts/vendor');
      if (res.data?.summary) {
        setSummary(res.data.summary);
        setPayouts(res.data.payouts || []);
      }
    } catch (error) {
      console.error('Failed to fetch payout details', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayoutData();
  }, []);

  const handleRequestPayout = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(requestAmount);
    if (!amountNum || amountNum <= 0) {
      addToast({
        type: 'error',
        title: 'Invalid Amount',
        message: 'Please enter a valid payout amount.'
      });
      return;
    }

    if (amountNum > summary.availableBalance) {
      addToast({
        type: 'error',
        title: 'Insufficient Balance',
        message: `Maximum available balance for withdrawal is $${summary.availableBalance.toFixed(2)}.`
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await apiClient.post('/payouts/vendor/request', {
        amount: amountNum,
        paymentMethod: payoutMethod === 'bank' ? 'Direct Bank Wire (ACH)' : payoutMethod === 'stripe' ? 'Stripe Connect' : 'PayPal Business',
        accountDetails: 'Primary Business Payout Account'
      });

      addToast({
        type: 'success',
        title: 'Payout Requested!',
        message: response.data?.message || 'Your payout request has been queued for transfer.'
      });

      setModalOpen(false);
      setRequestAmount('');
      fetchPayoutData();
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Request Failed',
        message: error.response?.data?.message || 'Could not process payout request.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-80 space-y-3">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand"></div>
        <p className="text-sm font-semibold text-textMuted">Loading financial data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-sora font-extrabold text-2xl sm:text-3xl text-textPrimary tracking-tight">
            Earnings & Payouts
          </h1>
          <p className="text-sm text-textMuted mt-1">
            Track your disbursed funds, pending escrow balances, and request transfers.
          </p>
        </div>

        <Button
          size="lg"
          onClick={() => {
            setRequestAmount(summary.availableBalance > 0 ? summary.availableBalance.toFixed(2) : '100.00');
            setModalOpen(true);
          }}
          className="rounded-2xl shadow-md font-bold flex items-center gap-2"
        >
          <ArrowUpRight className="w-5 h-5" />
          <span>Request Payout</span>
        </Button>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Available Balance */}
        <Card className="p-6 rounded-3xl border-brand/30 bg-gradient-to-br from-brand/10 via-surface to-surface shadow-xs space-y-3">
          <div className="flex items-center justify-between text-brand">
            <span className="text-xs font-bold uppercase tracking-wider">Available to Withdraw</span>
            <div className="p-2 rounded-xl bg-brand/20">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h2 className="font-sora font-extrabold text-3xl text-textPrimary tracking-tight">
              ${summary.availableBalance.toFixed(2)}
            </h2>
            <p className="text-[11px] text-green-600 dark:text-green-400 font-semibold mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Ready for instant transfer
            </p>
          </div>
        </Card>

        {/* Pending Escrow */}
        <Card className="p-6 rounded-3xl border-border bg-surface shadow-xs space-y-3">
          <div className="flex items-center justify-between text-amber-500">
            <span className="text-xs font-bold uppercase tracking-wider">Pending (In-Transit)</span>
            <div className="p-2 rounded-xl bg-amber-500/10">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h2 className="font-sora font-extrabold text-3xl text-textPrimary tracking-tight">
              ${summary.pendingBalance.toFixed(2)}
            </h2>
            <p className="text-[11px] text-textMuted mt-1">
              Clears automatically upon delivery
            </p>
          </div>
        </Card>

        {/* Lifetime Earnings */}
        <Card className="p-6 rounded-3xl border-border bg-surface shadow-xs space-y-3">
          <div className="flex items-center justify-between text-purple-500">
            <span className="text-xs font-bold uppercase tracking-wider">Lifetime Gross Sales</span>
            <div className="p-2 rounded-xl bg-purple-500/10">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h2 className="font-sora font-extrabold text-3xl text-textPrimary tracking-tight">
              ${summary.lifetimeEarnings.toFixed(2)}
            </h2>
            <p className="text-[11px] text-textMuted mt-1">
              All-time fulfilled customer orders
            </p>
          </div>
        </Card>

        {/* Total Paid Out */}
        <Card className="p-6 rounded-3xl border-border bg-surface shadow-xs space-y-3">
          <div className="flex items-center justify-between text-blue-500">
            <span className="text-xs font-bold uppercase tracking-wider">Total Paid Out</span>
            <div className="p-2 rounded-xl bg-blue-500/10">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h2 className="font-sora font-extrabold text-3xl text-textPrimary tracking-tight">
              ${summary.totalPaidOut.toFixed(2)}
            </h2>
            <p className="text-[11px] text-textMuted mt-1">
              Successfully wired to bank
            </p>
          </div>
        </Card>

      </div>

      {/* Payout History & Connected Bank */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Payouts Table (2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-sora font-bold text-lg text-textPrimary">
              Disbursement History
            </h2>
            <span className="text-xs text-textMuted">Updated in real-time</span>
          </div>

          <div className="bg-surface rounded-3xl border border-border shadow-xs overflow-hidden">
            {payouts.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-800 text-textMuted mx-auto flex items-center justify-center">
                  <CreditCard className="w-6 h-6" />
                </div>
                <p className="font-sora font-semibold text-sm text-textPrimary">No Past Payout Requests</p>
                <p className="text-xs text-textMuted">When you request a payout, tracking records will appear here.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50/80 dark:bg-gray-800/50 text-textMuted text-xs font-bold uppercase tracking-wider border-b border-border">
                    <tr>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Amount</th>
                      <th className="py-3 px-4">Method</th>
                      <th className="py-3 px-4 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {payouts.map((p) => (
                      <tr key={p._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                        <td className="py-3.5 px-4 font-mono text-xs text-textMuted">
                          {new Date(p.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </td>
                        <td className="py-3.5 px-4 font-sora font-bold text-textPrimary">
                          ${p.amount.toFixed(2)}
                        </td>
                        <td className="py-3.5 px-4 text-xs text-textMuted">
                          Direct Bank Wire (ACH)
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                              p.status === 'paid'
                                ? 'bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-300'
                                : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                            }`}
                          >
                            {p.status === 'paid' ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                            {p.status === 'paid' ? 'Completed' : 'Processing'}
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

        {/* Payout Settings Sidebar (1 Col) */}
        <div className="space-y-6">
          <h2 className="font-sora font-bold text-lg text-textPrimary">
            Payout Settings
          </h2>

          <div className="bg-surface rounded-3xl border border-border p-6 shadow-xs space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand/10 text-brand flex items-center justify-center">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-sora font-bold text-sm text-textPrimary">Primary Bank Account</h3>
                <p className="text-xs text-textMuted">Chase Commercial Checking •••• 4912</p>
              </div>
            </div>

            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-2xl text-xs text-textMuted space-y-1 border border-border/50">
              <div className="flex justify-between">
                <span>Account Name:</span>
                <span className="font-semibold text-textPrimary">Aura Studios LLC</span>
              </div>
              <div className="flex justify-between">
                <span>Routing Number:</span>
                <span className="font-mono text-textPrimary">021000021</span>
              </div>
              <div className="flex justify-between">
                <span>Payout Frequency:</span>
                <span className="font-semibold text-brand">Manual / On-Demand</span>
              </div>
            </div>

            <div className="pt-2">
              <div className="flex items-start gap-2 text-xs text-textMuted">
                <ShieldCheck className="w-4 h-4 text-brand shrink-0 mt-0.5" />
                <span>All disbursements are protected with 256-bit encrypted banking rails and FDIC insurance.</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Payout Request Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1C1917]/30 backdrop-blur-xs">
          <div className="bg-surface border border-border/80 rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-6 shadow-editorial animate-fade-in">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-2xl bg-[#FFF8E7] text-[#9E6D08] border border-[#EBD69D] flex items-center justify-center mx-auto mb-2">
                <ArrowUpRight className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-bold text-xl text-textPrimary">Request Payout</h3>
              <p className="text-xs font-mono-tag text-textMuted">
                Available balance: <span className="font-bold text-textPrimary">${summary.availableBalance.toFixed(2)}</span>
              </p>
            </div>

            <form onSubmit={handleRequestPayout} className="space-y-4">
              <div>
                <label className="block text-xs font-bold font-mono-tag text-textMuted uppercase mb-1.5">
                  Withdrawal Amount ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  max={summary.availableBalance || 10000}
                  value={requestAmount}
                  onChange={(e) => setRequestAmount(e.target.value)}
                  required
                  placeholder="0.00"
                  className="w-full px-4 py-2.5 rounded-2xl border border-border/80 bg-surface-muted/40 text-textPrimary font-mono-tag font-bold text-lg focus:outline-none focus:ring-2 focus:ring-[#D94E34]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold font-mono-tag text-textMuted uppercase mb-1.5">
                  Transfer Destination
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'bank', name: 'Bank ACH' },
                    { id: 'stripe', name: 'Stripe' },
                    { id: 'paypal', name: 'PayPal' },
                  ].map((method) => (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setPayoutMethod(method.id as any)}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold font-mono-tag transition-all cursor-pointer ${
                        payoutMethod === method.id
                          ? 'border-[#D94E34] bg-[#FCEFEF] dark:bg-[#2E1D1D] text-[#D94E34]'
                          : 'border-border text-textMuted hover:text-textPrimary'
                      }`}
                    >
                      {method.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-surface-muted/60 rounded-xl text-[11px] font-mono-tag text-textMuted flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-textMuted shrink-0" />
                <span>Transfers are processed within 1-2 business days.</span>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  fullWidth
                  onClick={() => setModalOpen(false)}
                  className="rounded-full font-mono-tag text-xs uppercase tracking-wider font-semibold"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  fullWidth
                  disabled={isSubmitting}
                  className="bg-[#D94E34] hover:bg-[#C03B22] text-[#FFF8E7] rounded-full font-mono-tag text-xs uppercase tracking-wider font-bold shadow-xs"
                >
                  {isSubmitting ? 'Submitting...' : 'Confirm Transfer'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default VendorPayouts;
