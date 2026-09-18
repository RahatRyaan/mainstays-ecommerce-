import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Package, 
  Clock, 
  CheckCircle2, 
  Truck, 
  Store, 
  ShoppingBag
} from 'lucide-react';
import apiClient from '../../api/client';
import Button from '../../components/ui/Button';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import { useToastStore } from '../../store/toastStore';

interface OrderItem {
  product: { _id?: string; name: string; images?: string[] } | string;
  variantId?: string;
  quantity: number;
  price: number;
}

interface VendorGroup {
  vendor: { _id?: string; name: string } | string;
  status: string;
  subTotal: number;
  items: OrderItem[];
}

interface Order {
  _id: string;
  createdAt: string;
  status: string;
  totalAmount: number;
  shippingAddress: string;
  paymentStatus: string;
  vendorItems?: VendorGroup[];
}

const OrderHistory = () => {
  const { token } = useAuthStore();
  const addToCart = useCartStore((state) => state.addToCart);
  const addToast = useToastStore((state) => state.addToast);

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState<'all' | 'active' | 'delivered'>('all');

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const response = await apiClient.get('/orders/my-orders');
        const list = response.data?.data?.orders || response.data || [];
        setOrders(Array.isArray(list) ? list : []);
      } catch (error) {
        console.error('Failed to fetch order history', error);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchOrders();
    } else {
      setLoading(false);
    }
  }, [token]);

  const handleReorder = (item: OrderItem, vendorName: string) => {
    const prodName = typeof item.product === 'object' && item.product ? item.product.name : 'Product';
    const prodId = typeof item.product === 'object' && item.product ? (item.product._id || 'prod-1') : (item.product || 'prod-1');
    const image = typeof item.product === 'object' && item.product && item.product.images ? item.product.images[0] : '';

    addToCart({
      productId: prodId,
      name: prodName,
      price: item.price,
      quantity: item.quantity,
      imageUrl: image,
      vendorId: vendorName || 'vendor',
    });

    addToast({
      type: 'success',
      title: 'Item Added to Cart',
      message: `${prodName} was added back to your cart.`,
    });
  };

  if (!token) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-brand/10 text-brand mx-auto flex items-center justify-center">
          <Package className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-sora font-bold text-textPrimary">Sign In to View Your Orders</h2>
        <p className="text-sm text-textMuted max-w-md mx-auto">
          Please sign in with your customer account to access your full order tracking history and receipts.
        </p>
        <Link to="/login">
          <Button variant="primary" className="rounded-xl mt-2">Sign In Now</Button>
        </Link>
      </div>
    );
  }

  const filteredOrders = orders.filter((order) => {
    if (filterTab === 'delivered') return order.status?.toLowerCase() === 'delivered';
    if (filterTab === 'active') return order.status?.toLowerCase() !== 'delivered' && order.status?.toLowerCase() !== 'cancelled';
    return true;
  });

  const getStatusBadge = (status: string) => {
    const s = (status || 'processing').toLowerCase();
    if (s === 'delivered') {
      return (
        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300 border border-green-300 dark:border-green-800 flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5" /> Delivered
        </span>
      );
    }
    if (s === 'shipped') {
      return (
        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-800 flex items-center gap-1.5">
          <Truck className="w-3.5 h-3.5" /> In Transit / Shipped
        </span>
      );
    }
    return (
      <span className="px-3 py-1 text-xs font-semibold rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800 flex items-center gap-1.5">
        <Clock className="w-3.5 h-3.5" /> Processing Order
      </span>
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      
      {/* Page Title & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
        <div>
          <h1 className="text-3xl font-sora font-extrabold text-textPrimary tracking-tight">
            My Order History
          </h1>
          <p className="text-sm text-textMuted mt-1">
            Track real-time shipment status, manage returns, and view previous itemized receipts.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 p-1 bg-surface border border-border rounded-xl self-start sm:self-auto">
          <button
            onClick={() => setFilterTab('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              filterTab === 'all' ? 'bg-brand text-white' : 'text-textMuted hover:text-textPrimary'
            }`}
          >
            All ({orders.length})
          </button>
          <button
            onClick={() => setFilterTab('active')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              filterTab === 'active' ? 'bg-brand text-white' : 'text-textMuted hover:text-textPrimary'
            }`}
          >
            In Progress
          </button>
          <button
            onClick={() => setFilterTab('delivered')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              filterTab === 'delivered' ? 'bg-brand text-white' : 'text-textMuted hover:text-textPrimary'
            }`}
          >
            Delivered
          </button>
        </div>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="space-y-6">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="p-6 rounded-3xl bg-surface border border-border animate-pulse space-y-4">
              <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-1/4"></div>
              <div className="h-20 bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
            </div>
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-20 bg-surface rounded-3xl border border-border p-8 space-y-4">
          <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto text-textMuted">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-sora font-bold text-textPrimary">No Orders Found</h3>
          <p className="text-sm text-textMuted max-w-md mx-auto">
            You don't have any orders in this category yet. Explore our curated catalog to make your first purchase!
          </p>
          <Link to="/products">
            <Button variant="primary" className="rounded-xl">Start Shopping</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {filteredOrders.map((order) => {
            const shortId = order._id.substring(order._id.length - 8).toUpperCase();
            const dateStr = new Date(order.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            });

            return (
              <div key={order._id} className="bg-surface rounded-3xl border border-border overflow-hidden shadow-xs">
                
                {/* Order Summary Header Bar */}
                <div className="bg-gray-50/80 dark:bg-gray-800/40 p-5 sm:p-6 border-b border-border flex flex-wrap items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-6 text-xs sm:text-sm">
                    <div>
                      <div className="text-textMuted text-[11px] font-semibold uppercase">Order Placed</div>
                      <div className="font-bold text-textPrimary">{dateStr}</div>
                    </div>

                    <div>
                      <div className="text-textMuted text-[11px] font-semibold uppercase">Total Amount</div>
                      <div className="font-bold font-sora text-textPrimary">${order.totalAmount.toFixed(2)}</div>
                    </div>

                    <div>
                      <div className="text-textMuted text-[11px] font-semibold uppercase">Order Reference</div>
                      <div className="font-mono font-bold text-textPrimary">#{shortId}</div>
                    </div>
                  </div>

                  <div>
                    {getStatusBadge(order.status)}
                  </div>
                </div>

                {/* Progress Stepper Bar */}
                <div className="px-6 py-5 border-b border-border/80 bg-surface/50">
                  <div className="grid grid-cols-4 gap-2 text-center text-[11px] relative">
                    <div className="space-y-1">
                      <div className="w-5 h-5 rounded-full bg-brand text-white mx-auto flex items-center justify-center font-bold text-[10px]">✓</div>
                      <div className="font-semibold text-textPrimary">Placed</div>
                    </div>
                    <div className="space-y-1">
                      <div className="w-5 h-5 rounded-full bg-brand text-white mx-auto flex items-center justify-center font-bold text-[10px]">✓</div>
                      <div className="font-semibold text-textPrimary">Processing</div>
                    </div>
                    <div className="space-y-1">
                      <div className={`w-5 h-5 rounded-full mx-auto flex items-center justify-center font-bold text-[10px] ${
                        order.status === 'shipped' || order.status === 'delivered' ? 'bg-brand text-white' : 'bg-gray-200 text-gray-500'
                      }`}>
                        {order.status === 'shipped' || order.status === 'delivered' ? '✓' : '3'}
                      </div>
                      <div className={`font-semibold ${order.status === 'shipped' || order.status === 'delivered' ? 'text-textPrimary' : 'text-textMuted'}`}>
                        Shipped
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className={`w-5 h-5 rounded-full mx-auto flex items-center justify-center font-bold text-[10px] ${
                        order.status === 'delivered' ? 'bg-brand text-white' : 'bg-gray-200 text-gray-500'
                      }`}>
                        {order.status === 'delivered' ? '✓' : '4'}
                      </div>
                      <div className={`font-semibold ${order.status === 'delivered' ? 'text-textPrimary' : 'text-textMuted'}`}>
                        Delivered
                      </div>
                    </div>
                  </div>
                </div>

                {/* Vendor Sub-Orders & Items List */}
                <div className="p-6 space-y-6">
                  {order.vendorItems && order.vendorItems.length > 0 ? (
                    order.vendorItems.map((vGroup, vIdx) => {
                      const vName = typeof vGroup.vendor === 'object' && vGroup.vendor ? vGroup.vendor.name : 'Merchant Vendor';
                      return (
                        <div key={vIdx} className="space-y-3 pt-3 first:pt-0 border-t first:border-0 border-border/70">
                          <div className="flex items-center gap-2 text-xs font-semibold text-brand">
                            <Store className="w-3.5 h-3.5" />
                            <span>Fulfilled by {vName}</span>
                          </div>

                          <div className="space-y-3">
                            {vGroup.items.map((item, iIdx) => {
                              const pName = typeof item.product === 'object' && item.product ? item.product.name : 'Item';
                              const pId = typeof item.product === 'object' && item.product ? item.product._id : item.product;
                              const pImg = typeof item.product === 'object' && item.product && item.product.images ? item.product.images[0] : 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80';

                              return (
                                <div key={iIdx} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-3 rounded-2xl bg-gray-50/50 dark:bg-gray-800/20 border border-border/50">
                                  <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 border border-border flex-shrink-0">
                                      <img src={pImg} alt={pName} className="w-full h-full object-cover" />
                                    </div>
                                    <div>
                                      <h4 className="font-sora font-semibold text-sm text-textPrimary hover:text-brand transition-colors">
                                        {pId ? <Link to={`/products/${pId}`}>{pName}</Link> : pName}
                                      </h4>
                                      <div className="text-xs text-textMuted mt-0.5">
                                        Qty: {item.quantity} • Unit: ${item.price.toFixed(2)}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                                    <div className="font-sora font-bold text-sm text-textPrimary">
                                      ${(item.price * item.quantity).toFixed(2)}
                                    </div>
                                    <button
                                      onClick={() => handleReorder(item, vName)}
                                      className="px-3 py-1.5 rounded-xl border border-border text-xs font-semibold hover:bg-surface transition-colors cursor-pointer"
                                    >
                                      Buy Again
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-xs text-textMuted">
                      Shipping to: {order.shippingAddress}
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};

export default OrderHistory;
