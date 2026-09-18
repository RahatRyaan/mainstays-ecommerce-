import { useEffect, useState } from 'react';
import { 
  Tag, 
  Plus, 
  Trash2, 
  Check, 
  Copy, 
  Calendar, 
  DollarSign, 
  Percent, 
  Eye, 
  EyeOff 
} from 'lucide-react';
import apiClient from '../../api/client';
import { useToastStore } from '../../store/toastStore';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

interface CouponRecord {
  _id: string;
  code: string;
  type: 'percentage' | 'fixed';
  discountValue: number;
  minOrderValue: number;
  expiresAt: string;
  isActive: boolean;
  createdAt: string;
}

const CouponManagement = () => {
  const [coupons, setCoupons] = useState<CouponRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Form State
  const [code, setCode] = useState('');
  const [type, setType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState('');
  const [minOrderValue, setMinOrderValue] = useState('0');
  const [expiresAt, setExpiresAt] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addToast = useToastStore((state) => state.addToast);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/admin/coupons');
      setCoupons(res.data?.coupons || []);
    } catch (error) {
      console.error('Failed to fetch coupons', error);
      setCoupons([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !discountValue || !expiresAt) {
      addToast({
        type: 'error',
        title: 'Missing Fields',
        message: 'Please fill in all required coupon fields.'
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await apiClient.post('/admin/coupons', {
        code: code.trim().toUpperCase(),
        type,
        discountValue: Number(discountValue),
        minOrderValue: Number(minOrderValue) || 0,
        expiresAt: new Date(expiresAt).toISOString(),
        isActive: true
      });

      addToast({
        type: 'success',
        title: 'Coupon Created',
        message: `Promo code "${code.toUpperCase()}" is now active!`
      });

      setCreateModalOpen(false);
      setCode('');
      setDiscountValue('');
      setMinOrderValue('0');
      setExpiresAt('');
      fetchCoupons();
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Creation Failed',
        message: error.response?.data?.message || 'Could not create coupon.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (coupon: CouponRecord) => {
    try {
      const res = await apiClient.patch(`/admin/coupons/${coupon._id}/status`);
      const updated = res.data?.coupon;

      setCoupons((prev) =>
        prev.map((c) => (c._id === coupon._id ? { ...c, isActive: updated?.isActive ?? !c.isActive } : c))
      );

      addToast({
        type: 'success',
        title: 'Status Updated',
        message: `Coupon "${coupon.code}" is now ${updated?.isActive ? 'Active' : 'Disabled'}.`
      });
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Update Failed',
        message: error.response?.data?.message || 'Failed to update coupon status.'
      });
    }
  };

  const handleDelete = async (id: string, code: string) => {
    try {
      await apiClient.delete(`/admin/coupons/${id}`);
      setCoupons((prev) => prev.filter((c) => c._id !== id));
      addToast({
        type: 'success',
        title: 'Coupon Deleted',
        message: `Promo code "${code}" has been deleted.`
      });
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Delete Failed',
        message: error.response?.data?.message || 'Failed to delete coupon.'
      });
    }
  };

  const handleCopy = (couponCode: string) => {
    navigator.clipboard.writeText(couponCode);
    setCopiedCode(couponCode);
    addToast({
      type: 'info',
      title: 'Code Copied',
      message: `"${couponCode}" copied to clipboard.`
    });
    setTimeout(() => setCopiedCode(null), 2500);
  };

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-sora font-extrabold text-2xl sm:text-3xl text-textPrimary tracking-tight">
            Promotional Coupons
          </h1>
          <p className="text-sm text-textMuted mt-1">
            Create and manage promotional discount vouchers, minimum carts, and expiry rules.
          </p>
        </div>

        <Button
          size="lg"
          onClick={() => {
            // Set default expiry 30 days ahead
            const d = new Date();
            d.setDate(d.getDate() + 30);
            setExpiresAt(d.toISOString().split('T')[0] || '');
            setCreateModalOpen(true);
          }}
          className="rounded-2xl shadow-md font-bold flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white"
        >
          <Plus className="w-5 h-5" />
          <span>Create New Coupon</span>
        </Button>
      </div>

      {/* Coupons Grid */}
      {loading ? (
        <div className="p-16 text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600 mx-auto mb-3"></div>
          <p className="text-sm font-semibold text-textMuted">Loading coupon vouchers...</p>
        </div>
      ) : coupons.length === 0 ? (
        <div className="p-16 text-center space-y-4 bg-surface rounded-3xl border border-border">
          <div className="w-14 h-14 rounded-2xl bg-purple-100 dark:bg-purple-950/40 text-purple-600 mx-auto flex items-center justify-center">
            <Tag className="w-7 h-7" />
          </div>
          <div>
            <h3 className="font-sora font-bold text-lg text-textPrimary">No Active Coupons</h3>
            <p className="text-xs text-textMuted mt-1">Create promotional codes to drive sales.</p>
          </div>
          <Button onClick={() => setCreateModalOpen(true)} className="rounded-xl">
            Create First Coupon
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {coupons.map((c) => {
            const isPercentage = c.type === 'percentage';
            const isExpired = new Date(c.expiresAt) < new Date();

            return (
              <div
                key={c._id}
                className={`relative rounded-3xl border p-6 flex flex-col justify-between transition-all bg-surface shadow-xs ${
                  c.isActive && !isExpired
                    ? 'border-purple-500/30 hover:shadow-md hover:border-purple-500/50'
                    : 'border-border opacity-70'
                }`}
              >
                <div className="space-y-4">
                  
                  {/* Top Bar with Badge */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400">
                        {isPercentage ? <Percent className="w-4 h-4" /> : <DollarSign className="w-4 h-4" />}
                      </div>
                      <span className="font-sora font-extrabold text-2xl text-textPrimary">
                        {isPercentage ? `${c.discountValue}% OFF` : `$${c.discountValue} OFF`}
                      </span>
                    </div>

                    <span
                      className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full ${
                        isExpired
                          ? 'bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300'
                          : c.isActive
                          ? 'bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-300'
                          : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                      }`}
                    >
                      {isExpired ? 'Expired' : c.isActive ? 'Active' : 'Disabled'}
                    </span>
                  </div>

                  {/* Code Card Snippet */}
                  <div className="p-3 bg-gray-50 dark:bg-gray-800/80 rounded-2xl border border-dashed border-border flex items-center justify-between font-mono font-bold text-sm text-purple-600 dark:text-purple-400">
                    <span>{c.code}</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(c.code)}
                      className="p-1 text-textMuted hover:text-purple-600 cursor-pointer"
                      title="Copy Code"
                    >
                      {copiedCode === c.code ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Details */}
                  <div className="space-y-1.5 text-xs text-textMuted">
                    {c.minOrderValue > 0 ? (
                      <p>Min. Purchase: <strong className="text-textPrimary">${c.minOrderValue}</strong></p>
                    ) : (
                      <p>No minimum spend required</p>
                    )}
                    <p className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      Expires: <span className="font-semibold text-textPrimary">{new Date(c.expiresAt).toLocaleDateString()}</span>
                    </p>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="pt-4 mt-4 border-t border-border flex items-center justify-between">
                  <button
                    onClick={() => handleToggleStatus(c)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-textMuted hover:text-purple-600 cursor-pointer"
                  >
                    {c.isActive ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{c.isActive ? 'Disable' : 'Enable'}</span>
                  </button>

                  <button
                    onClick={() => handleDelete(c._id, c.code)}
                    className="p-1.5 text-textMuted hover:text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
                    title="Delete Coupon"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Coupon Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1C1917]/30 backdrop-blur-xs">
          <div className="bg-surface border border-border/80 rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-5 shadow-editorial animate-fade-in">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-2xl bg-[#FFF8E7] text-[#9E6D08] border border-[#EBD69D] flex items-center justify-center mx-auto mb-2">
                <Tag className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-bold text-xl text-textPrimary">Create Promo Coupon</h3>
              <p className="text-xs font-mono-tag text-textMuted">Generate a new voucher code for shopper discounts.</p>
            </div>

            <form onSubmit={handleCreateCoupon} className="space-y-4">
              <Input
                label="Coupon Code (e.g. FLASH30)"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                required
                placeholder="PROMO2026"
                className="font-mono-tag uppercase font-bold"
              />

              <div>
                <label className="block text-xs font-bold font-mono-tag text-textMuted uppercase mb-1.5">
                  Discount Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setType('percentage')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold font-mono-tag flex items-center justify-center gap-1.5 cursor-pointer ${
                      type === 'percentage'
                        ? 'border-[#D94E34] bg-[#FCEFEF] dark:bg-[#2E1D1D] text-[#D94E34]'
                        : 'border-border text-textMuted'
                    }`}
                  >
                    <Percent className="w-3.5 h-3.5" /> Percentage (%)
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('fixed')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold font-mono-tag flex items-center justify-center gap-1.5 cursor-pointer ${
                      type === 'fixed'
                        ? 'border-[#D94E34] bg-[#FCEFEF] dark:bg-[#2E1D1D] text-[#D94E34]'
                        : 'border-border text-textMuted'
                    }`}
                  >
                    <DollarSign className="w-3.5 h-3.5" /> Fixed Dollar ($)
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label={type === 'percentage' ? 'Discount %' : 'Discount $'}
                  type="number"
                  step="0.01"
                  min="1"
                  max={type === 'percentage' ? 100 : 10000}
                  value={discountValue}
                  onChange={(e) => setDiscountValue(e.target.value)}
                  required
                  placeholder={type === 'percentage' ? '20' : '50'}
                />

                <Input
                  label="Min. Spend ($)"
                  type="number"
                  step="0.01"
                  min="0"
                  value={minOrderValue}
                  onChange={(e) => setMinOrderValue(e.target.value)}
                  placeholder="0"
                />
              </div>

              <Input
                label="Expiration Date"
                type="date"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                required
              />

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  fullWidth
                  onClick={() => setCreateModalOpen(false)}
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
                  {isSubmitting ? 'Creating...' : 'Create Coupon'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default CouponManagement;
