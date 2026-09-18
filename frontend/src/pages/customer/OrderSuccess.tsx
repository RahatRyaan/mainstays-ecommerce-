import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  CheckCircle2, 
  Package, 
  Home, 
  Calendar, 
  MapPin, 
  ShieldCheck, 
  Sparkles 
} from 'lucide-react';
import Button from '../../components/ui/Button';

const OrderSuccess: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const displayId = orderId ? orderId.substring(orderId.length - 8).toUpperCase() : '8X92B19F';

  // Calculate estimated delivery date (+3-4 business days)
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 4);
  const formattedDelivery = deliveryDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 space-y-10 text-center">
      
      {/* Confirmation Badge */}
      <div className="space-y-4">
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-green-50 dark:bg-green-950/40 border-2 border-green-200 dark:border-green-800 text-brand mx-auto flex items-center justify-center shadow-lg shadow-green-100 dark:shadow-none animate-in zoom-in-75 duration-300">
          <CheckCircle2 className="w-12 h-12 sm:w-14 sm:h-14" />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-brand/10 text-brand text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Payment Verified & Order Placed</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-sora font-extrabold text-textPrimary tracking-tight">
          Thank You For Your Order!
        </h1>

        <p className="text-sm sm:text-base text-textMuted max-w-lg mx-auto leading-relaxed">
          We've received your order and sent a confirmation receipt to your email. Our vendors are preparing your items for express dispatch.
        </p>
      </div>

      {/* Order Info Card */}
      <div className="bg-surface rounded-3xl border border-border p-6 sm:p-8 shadow-xs text-left grid grid-cols-1 sm:grid-cols-3 gap-6 divide-y sm:divide-y-0 sm:divide-x divide-border">
        
        <div className="space-y-1">
          <div className="text-xs font-bold uppercase tracking-wider text-textMuted">
            Order Reference
          </div>
          <div className="font-mono font-extrabold text-lg text-textPrimary">
            #{displayId}
          </div>
          <div className="text-[11px] text-brand font-semibold flex items-center gap-1 pt-1">
            <ShieldCheck className="w-3.5 h-3.5" /> Authenticity Guaranteed
          </div>
        </div>

        <div className="space-y-1 sm:pl-6 pt-4 sm:pt-0">
          <div className="text-xs font-bold uppercase tracking-wider text-textMuted flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-brand" /> Estimated Delivery
          </div>
          <div className="font-sora font-bold text-base text-textPrimary">
            {formattedDelivery}
          </div>
          <div className="text-[11px] text-textMuted">
            Express Tracked Courier
          </div>
        </div>

        <div className="space-y-1 sm:pl-6 pt-4 sm:pt-0">
          <div className="text-xs font-bold uppercase tracking-wider text-textMuted flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-brand" /> Shipping Address
          </div>
          <div className="text-xs font-medium text-textPrimary leading-snug">
            742 Evergreen Terrace, San Francisco, CA 94105, USA
          </div>
        </div>

      </div>

      {/* Fulfillment Progress Timeline */}
      <div className="bg-surface rounded-3xl border border-border p-6 sm:p-8 shadow-xs text-left space-y-4">
        <h3 className="font-sora font-bold text-base text-textPrimary">
          What Happens Next?
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 relative">
          <div className="p-4 rounded-2xl bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800 space-y-1">
            <div className="w-7 h-7 rounded-full bg-brand text-white text-xs font-bold flex items-center justify-center mb-2">
              1
            </div>
            <div className="font-semibold text-xs text-textPrimary">Order Confirmed</div>
            <div className="text-[11px] text-textMuted">Payment processed and verified</div>
          </div>

          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-border space-y-1">
            <div className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-700 text-textPrimary text-xs font-bold flex items-center justify-center mb-2">
              2
            </div>
            <div className="font-semibold text-xs text-textPrimary">Vendor Dispatch</div>
            <div className="text-[11px] text-textMuted">Merchant packages and inspects goods</div>
          </div>

          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-border space-y-1">
            <div className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-700 text-textPrimary text-xs font-bold flex items-center justify-center mb-2">
              3
            </div>
            <div className="font-semibold text-xs text-textPrimary">In Transit</div>
            <div className="text-[11px] text-textMuted">Carrier delivers with live tracking</div>
          </div>

          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-border space-y-1">
            <div className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-700 text-textPrimary text-xs font-bold flex items-center justify-center mb-2">
              4
            </div>
            <div className="font-semibold text-xs text-textPrimary">Delivered</div>
            <div className="text-[11px] text-textMuted">Safely delivered to your doorstep</div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
        <Link to="/orders">
          <Button size="lg" variant="primary" className="rounded-xl px-8 shadow-md flex items-center gap-2">
            <Package className="w-4 h-4" />
            <span>Track in My Orders</span>
          </Button>
        </Link>

        <Link to="/products">
          <Button size="lg" variant="outline" className="rounded-xl px-6 flex items-center gap-2">
            <Home className="w-4 h-4" />
            <span>Continue Shopping</span>
          </Button>
        </Link>
      </div>

    </div>
  );
};

export default OrderSuccess;
