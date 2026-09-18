import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Trash2, 
  ShoppingBag, 
  ArrowRight, 
  Tag, 
  Check, 
  X, 
  Truck, 
  ShieldCheck, 
  ArrowLeft,
  Sparkles
} from 'lucide-react';
import { useCartStore } from '../../store/cartStore';
import { useToastStore } from '../../store/toastStore';
import Button from '../../components/ui/Button';

const FREE_SHIPPING_THRESHOLD = 50;

const Cart = () => {
  const { 
    items, 
    removeFromCart, 
    updateQuantity, 
    clearCart,
    getCartSubtotal,
    getDiscountAmount,
    appliedCoupon,
    applyCoupon,
    removeCoupon
  } = useCartStore();

  const addToast = useToastStore((state) => state.addToast);
  const navigate = useNavigate();
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');

  const subtotal = getCartSubtotal();
  const discount = getDiscountAmount();
  const shippingCost = subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : 9.99;
  const estimatedTax = subtotal > 0 ? (subtotal - discount) * 0.08 : 0;
  const finalTotal = Math.max(0, subtotal - discount + shippingCost + estimatedTax);

  const freeShippingProgress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);
  const amountNeededForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    const code = couponInput.trim().toUpperCase();

    if (!code) return;

    if (code === 'WELCOME10') {
      applyCoupon({ code: 'WELCOME10', discountPercent: 10 });
      addToast({
        type: 'success',
        title: 'Voucher Applied!',
        message: '10% discount has been deducted from your total.',
      });
      setCouponInput('');
    } else if (code === 'SUMMER20') {
      applyCoupon({ code: 'SUMMER20', discountPercent: 20 });
      addToast({
        type: 'success',
        title: 'Voucher Applied!',
        message: '20% summer discount has been applied.',
      });
      setCouponInput('');
    } else if (code === 'FREESHIP') {
      applyCoupon({ code: 'FREESHIP', discountFixed: 15 });
      addToast({
        type: 'success',
        title: 'Voucher Applied!',
        message: '$15 off applied to your haul.',
      });
      setCouponInput('');
    } else if (code === 'VIP50') {
      applyCoupon({ code: 'VIP50', discountFixed: 50 });
      addToast({
        type: 'success',
        title: 'VIP Voucher Applied!',
        message: '$50 VIP discount applied to your order.',
      });
      setCouponInput('');
    } else {
      setCouponError('Invalid voucher code. Try WELCOME10 or SUMMER20.');
      addToast({
        type: 'error',
        title: 'Invalid Voucher',
        message: 'The code entered is not recognized or expired.',
      });
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#FFF8E7] dark:bg-[#2C2719] border border-[#EBD69D] text-[#9E6D08] mb-2">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-serif font-black text-textPrimary">Your Shopping Bag is Empty</h1>
          <p className="text-xs font-mono-tag text-textMuted max-w-md mx-auto leading-relaxed">
            Looks like you haven't selected any staples yet. Explore our curated collections to discover everyday goods crafted for longevity.
          </p>
        </div>
        <div className="pt-2">
          <Link to="/products">
            <Button size="lg" variant="primary" className="rounded-full px-8 font-mono-tag text-xs uppercase tracking-wider">
              Explore The Catalog &rarr;
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border/80">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF8E7] text-[#9E6D08] border border-[#EBD69D] text-[10px] font-mono-tag font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3 h-3 text-[#E59819]" />
            <span>Bag Checkout</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-black text-textPrimary tracking-tight">
            Review Your Bag
          </h1>
          <p className="text-xs font-mono-tag text-textMuted mt-1">
            Review your chosen items before proceeding to dispatch.
          </p>
        </div>

        <button
          onClick={clearCart}
          className="text-xs font-mono-tag text-textMuted hover:text-red-500 font-bold transition-colors flex items-center gap-1 self-start sm:self-auto cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Empty Bag
        </button>
      </div>

      {/* Free Shipping Progress Indicator */}
      <div className="p-4 sm:p-5 rounded-3xl bg-surface border border-border/80 shadow-xs space-y-2.5">
        <div className="flex items-center justify-between text-xs font-mono-tag">
          <div className="flex items-center gap-2 font-bold text-textPrimary">
            <Truck className="w-4 h-4 text-[#D94E34]" />
            {amountNeededForFreeShipping === 0 ? (
              <span className="text-[#3F5E4D] font-bold">🎉 You unlocked Complimentary Express Shipping!</span>
            ) : (
              <span>Add <strong className="text-[#D94E34]">${amountNeededForFreeShipping.toFixed(2)}</strong> more for Free Shipping</span>
            )}
          </div>
          <span className="text-textMuted font-bold">{Math.round(freeShippingProgress)}%</span>
        </div>

        {/* Progress Bar Track */}
        <div className="w-full bg-surface-muted rounded-full h-2 overflow-hidden">
          <div 
            className="bg-[#D94E34] h-full rounded-full transition-all duration-500 ease-out"
            style={{ width: `${freeShippingProgress}%` }}
          />
        </div>
      </div>

      {/* Main Grid: Items on Left, Summary on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Cart Items List */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-surface rounded-3xl border border-border/80 overflow-hidden shadow-xs divide-y divide-border/60">
            {items.map((item, index) => {
              const itemTotal = item.price * item.quantity;
              return (
                <div key={`${item.productId}-${item.variantId || index}`} className="p-5 sm:p-6 flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between">
                  
                  {/* Thumbnail & Meta */}
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 rounded-2xl overflow-hidden bg-[#F5EFEB] dark:bg-[#1A1816] border border-border/60 p-1">
                      <img
                        src={item.imageUrl || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80'}
                        alt={item.name}
                        className="w-full h-full object-cover object-center rounded-xl"
                      />
                    </div>

                    <div className="space-y-1">
                      <h3 className="font-serif font-bold text-base text-textPrimary hover:text-[#D94E34] transition-colors">
                        <Link to={`/products/${item.productId}`}>{item.name}</Link>
                      </h3>

                      {item.variantAttributes && (
                        <div className="text-[11px] font-mono-tag text-textMuted">
                          {Object.entries(item.variantAttributes).map(([k, v]) => `${k}: ${v}`).join(' • ')}
                        </div>
                      )}

                      <div className="text-xs font-mono-tag text-textMuted">
                        Price: <span className="font-bold text-textPrimary">${item.price.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Quantity & Subtotal Controls */}
                  <div className="flex items-center justify-between w-full sm:w-auto sm:gap-8 pt-2 sm:pt-0 border-t sm:border-0 border-border/60">
                    
                    {/* Stepper */}
                    <div className="flex items-center border border-border/80 rounded-full bg-surface overflow-hidden shadow-2xs">
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1, item.variantId)}
                        className="px-3 py-1.5 text-textMuted hover:text-textPrimary hover:bg-surface-muted transition-colors font-bold cursor-pointer"
                      >
                        -
                      </button>
                      <span className="px-3 py-1.5 text-xs font-mono-tag font-bold text-textPrimary min-w-[32px] text-center border-x border-border/60">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1, item.variantId)}
                        className="px-3 py-1.5 text-textMuted hover:text-textPrimary hover:bg-surface-muted transition-colors font-bold cursor-pointer"
                      >
                        +
                      </button>
                    </div>

                    {/* Total Price */}
                    <div className="text-right">
                      <div className="font-mono-tag font-bold text-lg text-textPrimary">
                        ${itemTotal.toFixed(2)}
                      </div>
                      <button
                        onClick={() => removeFromCart(item.productId, item.variantId)}
                        className="text-[11px] font-mono-tag text-red-500 hover:text-red-700 font-bold transition-colors flex items-center gap-1 mt-0.5 cursor-pointer ml-auto"
                      >
                        <Trash2 className="w-3 h-3" />
                        Remove
                      </button>
                    </div>

                  </div>

                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-2">
            <Link to="/products" className="inline-flex items-center gap-2 text-xs font-mono-tag font-bold uppercase tracking-wider text-textPrimary hover:text-[#D94E34]">
              <ArrowLeft className="w-3.5 h-3.5" />
              Continue Browsing
            </Link>
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-surface rounded-3xl border border-border/80 p-6 shadow-xs space-y-5 sticky top-28">
            <h2 className="font-serif font-bold text-xl text-textPrimary pb-3 border-b border-border/60">
              Order Summary
            </h2>

            {/* Price Line Breakdown */}
            <div className="space-y-3 text-xs font-mono-tag">
              <div className="flex justify-between text-textMuted">
                <span>Subtotal ({items.reduce((acc, i) => acc + i.quantity, 0)} items)</span>
                <span className="font-bold text-textPrimary">${subtotal.toFixed(2)}</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-[#3F5E4D] font-bold">
                  <span className="flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5" /> Promo Discount
                  </span>
                  <span>-${discount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between text-textMuted">
                <span>Shipping</span>
                <span className="font-bold text-textPrimary">
                  {shippingCost === 0 ? <span className="text-[#3F5E4D]">COMPLIMENTARY</span> : `$${shippingCost.toFixed(2)}`}
                </span>
              </div>

              <div className="flex justify-between text-textMuted">
                <span>Estimated Tax (8%)</span>
                <span className="font-bold text-textPrimary">${estimatedTax.toFixed(2)}</span>
              </div>

              <div className="pt-3 border-t border-border/60 flex justify-between items-baseline">
                <span className="font-serif font-bold text-base text-textPrimary">Estimated Total</span>
                <span className="font-mono-tag font-bold text-2xl text-textPrimary tracking-tight">
                  ${finalTotal.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Coupon Code Box */}
            <div className="pt-4 border-t border-border/60 space-y-2">
              <label className="block text-[11px] font-mono-tag font-bold uppercase tracking-wider text-textMuted">
                Promotional Voucher
              </label>

              {appliedCoupon ? (
                <div className="p-3 rounded-2xl bg-[#FFF8E7] dark:bg-[#2C2719] border border-[#EBD69D] flex items-center justify-between text-xs font-mono-tag">
                  <div className="flex items-center gap-2 text-[#9E6D08] dark:text-[#E8C564] font-bold">
                    <Check className="w-4 h-4" />
                    <span>{appliedCoupon.code}</span>
                    <span className="font-normal text-[10px]">
                      ({appliedCoupon.discountPercent ? `${appliedCoupon.discountPercent}% Off` : `$${appliedCoupon.discountFixed} Off`})
                    </span>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-textMuted hover:text-red-500 transition-colors p-1"
                    title="Remove coupon"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. WELCOME10"
                    value={couponInput}
                    onChange={(e) => {
                      setCouponInput(e.target.value);
                      setCouponError('');
                    }}
                    className="flex-1 uppercase font-mono-tag px-3.5 py-2 text-xs rounded-full border border-border/80 bg-surface text-textPrimary focus:outline-none focus:ring-2 focus:ring-[#D94E34]"
                  />
                  <Button type="submit" variant="outline" size="sm" className="rounded-full px-4 font-mono-tag text-xs uppercase tracking-wider">
                    Apply
                  </Button>
                </form>
              )}

              {couponError && (
                <p className="text-[10px] font-mono-tag text-red-500 mt-1">{couponError}</p>
              )}
            </div>

            {/* Checkout CTA */}
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={() => navigate('/checkout')}
              className="rounded-full font-mono-tag text-xs uppercase tracking-wider shadow-sm flex items-center justify-center gap-2 font-bold py-3.5"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </Button>

            {/* Trust Assurance */}
            <div className="pt-2 text-center text-[11px] font-mono-tag text-textMuted flex items-center justify-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#D94E34]" />
              <span>Guaranteed 256-Bit SSL Checkout</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default Cart;
