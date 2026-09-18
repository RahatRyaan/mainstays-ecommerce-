import { useEffect, useState } from 'react';
import { 
  ShoppingCart, 
  Search, 
  Package, 
  Truck, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Store
} from 'lucide-react';
import apiClient from '../../api/client';
import { useToastStore } from '../../store/toastStore';
import Button from '../../components/ui/Button';

interface AdminOrder {
  _id: string;
  totalAmount: number;
  paymentStatus: string;
  status: string;
  shippingAddress: string;
  createdAt: string;
  user?: { _id: string; name: string; email: string };
  subOrders?: Array<{
    _id: string;
    vendor?: { name: string; email: string };
    subTotal: number;
    status: string;
    items: Array<{
      product: { name: string; images?: string[] };
      quantity: number;
      price: number;
    }>;
  }>;
}

const OrderManagement = () => {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);

  const addToast = useToastStore((state) => state.addToast);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/admin/orders', {
        params: {
          status: statusFilter !== 'all' ? statusFilter : undefined
        }
      });
      setOrders(res.data?.orders || []);
    } catch (error) {
      console.error('Failed to fetch admin orders', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await apiClient.patch(`/admin/orders/${orderId}/status`, { status: newStatus });
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o))
      );
      if (selectedOrder?._id === orderId) {
        setSelectedOrder((prev) => (prev ? { ...prev, status: newStatus } : null));
      }
      addToast({
        type: 'success',
        title: 'Order Status Updated',
        message: `Order #${orderId.substring(orderId.length - 8).toUpperCase()} updated to "${newStatus}".`
      });
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Update Failed',
        message: error.response?.data?.message || 'Could not update order status.'
      });
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (!search) return true;
    const query = search.toLowerCase();
    const orderIdMatch = o._id.toLowerCase().includes(query);
    const userNameMatch = o.user?.name?.toLowerCase().includes(query);
    const userEmailMatch = o.user?.email?.toLowerCase().includes(query);
    return orderIdMatch || userNameMatch || userEmailMatch;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-100 dark:bg-green-950/60 text-green-700 dark:text-green-300 text-xs font-bold">
            <CheckCircle2 className="w-3 h-3" /> Delivered
          </span>
        );
      case 'shipped':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-xs font-bold">
            <Truck className="w-3 h-3" /> In Transit
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 text-xs font-bold">
            <Clock className="w-3 h-3" /> Processing
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-textMuted text-xs font-bold capitalize">
            <Package className="w-3 h-3" /> {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-sora font-extrabold text-2xl sm:text-3xl text-textPrimary tracking-tight">
            Global Orders
          </h1>
          <p className="text-sm text-textMuted mt-1">
            Track all customer transactions, multi-vendor fulfillments, and delivery stages.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="px-3.5 py-1.5 rounded-xl bg-surface border border-border text-xs font-semibold text-textMuted">
            Total Orders: <strong className="text-textPrimary">{orders.length}</strong>
          </span>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-surface rounded-2xl border border-border p-4 flex flex-col md:flex-row gap-4 items-center justify-between shadow-xs">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-textMuted" />
          <input
            type="text"
            placeholder="Search by customer, email or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-transparent border border-gray-300 dark:border-gray-700 rounded-xl text-sm text-textPrimary placeholder:text-textMuted focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <label className="text-xs font-semibold text-textMuted whitespace-nowrap">Filter Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-bg border border-border rounded-xl px-3 py-2 text-xs font-semibold text-textPrimary focus:outline-hidden focus:border-purple-600"
          >
            <option value="all">All Statuses</option>
            <option value="processing">Processing</option>
            <option value="shipped">In Transit (Shipped)</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <Button variant="secondary" size="sm" onClick={fetchOrders} className="rounded-xl text-xs">
            Refresh
          </Button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-surface rounded-2xl border border-border shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-16 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600 mx-auto mb-3"></div>
            <p className="text-sm font-semibold text-textMuted">Fetching platform orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-purple-100 dark:bg-purple-950/40 text-purple-600 mx-auto flex items-center justify-center">
              <ShoppingCart className="w-7 h-7" />
            </div>
            <h3 className="font-sora font-bold text-lg text-textPrimary">No Orders Found</h3>
            <p className="text-xs text-textMuted">No orders match your filter criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50/80 dark:bg-gray-800/50 text-textMuted text-xs font-bold uppercase tracking-wider border-b border-border">
                <tr>
                  <th className="py-3.5 px-4">Order ID & Date</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Vendors Involved</th>
                  <th className="py-3.5 px-4">Amount</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredOrders.map((o) => {
                  const displayId = o._id.substring(o._id.length - 8).toUpperCase();
                  const vendorNames = Array.from(
                    new Set(o.subOrders?.map((s) => s.vendor?.name).filter(Boolean))
                  );

                  return (
                    <tr key={o._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-sora font-bold text-textPrimary text-sm font-mono">
                            #{displayId}
                          </p>
                          <span className="text-[11px] text-textMuted">
                            {new Date(o.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <div>
                          <p className="font-bold text-textPrimary text-xs">{o.user?.name || 'Customer'}</p>
                          <p className="text-[11px] text-textMuted font-mono">{o.user?.email || 'guest@shopper.com'}</p>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <div className="flex flex-wrap gap-1">
                          {vendorNames.length > 0 ? (
                            vendorNames.map((name, i) => (
                              <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-[11px] font-semibold text-textPrimary">
                                <Store className="w-3 h-3 text-purple-600" /> {name}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-textMuted">Direct Store</span>
                          )}
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <span className="font-sora font-extrabold text-textPrimary">
                          ${o.totalAmount?.toFixed(2)}
                        </span>
                      </td>

                      <td className="py-4 px-4">
                        {getStatusBadge(o.status || 'processing')}
                      </td>

                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <select
                            value={o.status || 'processing'}
                            onChange={(e) => handleStatusChange(o._id, e.target.value)}
                            className="bg-bg border border-border rounded-xl px-2.5 py-1 text-xs font-semibold text-textPrimary focus:outline-hidden focus:border-purple-600 cursor-pointer"
                          >
                            <option value="processing">Processing</option>
                            <option value="shipped">In Transit</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>

                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setSelectedOrder(o)}
                            className="rounded-xl text-xs"
                          >
                            View
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1C1917]/30 backdrop-blur-xs">
          <div className="bg-surface border border-border/80 rounded-3xl p-6 sm:p-8 max-w-2xl w-full space-y-6 shadow-editorial animate-fade-in max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div>
                <h3 className="font-serif font-bold text-xl text-textPrimary">
                  Order Details #{selectedOrder._id.substring(selectedOrder._id.length - 8).toUpperCase()}
                </h3>
                <p className="text-xs text-textMuted mt-0.5">
                  Placed on {new Date(selectedOrder.createdAt).toLocaleDateString()}
                </p>
              </div>
              <Button variant="secondary" size="sm" onClick={() => setSelectedOrder(null)} className="rounded-xl">
                Close
              </Button>
            </div>

            {/* Customer & Address Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-border space-y-1.5">
                <p className="font-bold text-textPrimary uppercase tracking-wider text-[10px]">Customer Details</p>
                <p className="font-semibold text-textPrimary text-sm">{selectedOrder.user?.name || 'Customer'}</p>
                <p className="text-textMuted">{selectedOrder.user?.email || 'N/A'}</p>
                <p className="text-textMuted">Payment: <strong className="text-green-600 uppercase">Paid</strong></p>
              </div>

              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-border space-y-1.5">
                <p className="font-bold text-textPrimary uppercase tracking-wider text-[10px]">Shipping Address</p>
                <div className="flex items-start gap-1.5 text-textPrimary">
                  <MapPin className="w-3.5 h-3.5 text-purple-600 shrink-0 mt-0.5" />
                  <span>{selectedOrder.shippingAddress}</span>
                </div>
              </div>
            </div>

            {/* Sub-orders & Items */}
            <div className="space-y-4">
              <p className="font-sora font-bold text-sm text-textPrimary">Package Items & Vendors</p>

              {selectedOrder.subOrders?.map((subOrder, i) => (
                <div key={i} className="p-4 rounded-2xl border border-border bg-surface space-y-3">
                  <div className="flex items-center justify-between border-b border-border/50 pb-2">
                    <span className="text-xs font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1.5">
                      <Store className="w-3.5 h-3.5" />
                      {subOrder.vendor?.name || 'Vendor Merchant'}
                    </span>
                    <span className="text-xs font-mono font-bold text-textPrimary">
                      Subtotal: ${subOrder.subTotal?.toFixed(2)}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {subOrder.items?.map((item, itemIdx) => (
                      <div key={itemIdx} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={item.product?.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100'}
                            alt=""
                            className="w-8 h-8 rounded-lg object-cover border border-border"
                          />
                          <span className="font-semibold text-textPrimary">{item.product?.name || 'Item'}</span>
                          <span className="text-textMuted">× {item.quantity}</span>
                        </div>
                        <span className="font-bold text-textPrimary">${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-border flex justify-between items-center">
              <span className="font-sora font-bold text-base text-textPrimary">Grand Total</span>
              <span className="font-sora font-extrabold text-2xl text-purple-600 dark:text-purple-400">
                ${selectedOrder.totalAmount?.toFixed(2)}
              </span>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default OrderManagement;
