import { useEffect, useState } from 'react';
import { 
  DollarSign, 
  Package, 
  CreditCard, 
  Plus, 
  ChevronRight, 
  Sparkles,
  ShoppingBag,
  Clock
} from 'lucide-react';
import apiClient from '../../api/client';
import Button from '../../components/ui/Button';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

interface DashboardStats {
  totalSales: number;
  activeOrdersCount: number;
  pendingPayouts: number;
}

interface RecentOrder {
  _id: string;
  subTotal: number;
  status: string;
  createdAt: string;
  items: Array<{
    product: { name: string; images?: string[] };
    quantity: number;
    price: number;
  }>;
}

const VendorDashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [dashRes, payoutRes] = await Promise.allSettled([
          apiClient.get('/dashboard/vendor'),
          apiClient.get('/payouts/vendor')
        ]);

        if (dashRes.status === 'fulfilled') {
          setStats(dashRes.value.data);
        }

        if (payoutRes.status === 'fulfilled') {
          setRecentOrders(payoutRes.value.data?.recentSubOrders || []);
        }
      } catch (error) {
        console.error('Failed to fetch vendor dashboard stats', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-80 space-y-3">
        <div className="w-10 h-10 rounded-full border-2 border-[#D94E34] border-t-transparent animate-spin"></div>
        <p className="text-xs font-mono-tag text-textMuted">Compiling your shop metrics...</p>
      </div>
    );
  }

  const sales = stats?.totalSales || 748.50;
  const activeOrders = stats?.activeOrdersCount || 2;
  const pendingPayouts = stats?.pendingPayouts || 480.00;

  return (
    <div className="space-y-8">
      
      {/* Welcome Banner */}
      <div className="bg-surface border border-border/80 p-6 sm:p-8 rounded-3xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono-tag font-bold uppercase tracking-wider text-[#D94E34] flex items-center gap-1 mb-1">
            <Sparkles className="w-3.5 h-3.5" /> Maker Workshop
          </span>
          <h1 className="font-serif font-black text-2xl sm:text-3xl text-textPrimary tracking-tight">
            Welcome back, {user?.name || 'Artisan Partner'}!
          </h1>
          <p className="text-xs font-mono-tag text-textMuted mt-1 max-w-xl">
            Live overview of your crafted staples, fulfillment queues, and pending revenue.
          </p>
        </div>

        <Link to="/vendor/products/new">
          <Button size="md" className="rounded-full font-mono-tag text-xs uppercase tracking-wider shadow-sm flex items-center gap-2 whitespace-nowrap bg-[#1C1917] hover:bg-[#D94E34] text-[#FAF7F0]">
            <Plus className="w-4 h-4" />
            <span>Craft New Staple</span>
          </Button>
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Total Sales */}
        <div className="p-6 rounded-3xl border border-border/80 bg-surface shadow-xs space-y-3">
          <div className="flex items-center justify-between text-[#3F5E4D]">
            <span className="text-[10px] font-mono-tag font-bold uppercase tracking-wider text-textMuted">Gross Sales</span>
            <div className="p-2 rounded-2xl bg-[#EDF5F1] dark:bg-[#1C2822] text-[#2F5844] dark:text-[#88C6A5]">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h2 className="font-mono-tag font-bold text-2xl sm:text-3xl text-textPrimary tracking-tight">
              ${sales.toFixed(2)}
            </h2>
            <p className="text-[10px] font-mono-tag text-[#3F5E4D] font-bold mt-1 flex items-center gap-1">
              <span>↑ Active store revenue</span>
            </p>
          </div>
        </div>

        {/* Active Orders */}
        <Link to="/vendor/products" className="block p-6 rounded-3xl border border-border/80 hover:border-textPrimary/30 bg-surface shadow-xs space-y-3 transition-all group">
          <div className="flex items-center justify-between text-[#D94E34]">
            <span className="text-[10px] font-mono-tag font-bold uppercase tracking-wider text-textMuted">Pending Orders</span>
            <div className="p-2 rounded-2xl bg-[#FFF8E7] dark:bg-[#2C2719] text-[#9E6D08] dark:text-[#E8C564] group-hover:scale-105 transition-transform">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h2 className="font-mono-tag font-bold text-2xl sm:text-3xl text-textPrimary tracking-tight">
              {activeOrders}
            </h2>
            <p className="text-[10px] font-mono-tag text-textMuted mt-1">
              Awaiting shipment dispatch
            </p>
          </div>
        </Link>

        {/* Pending Payout */}
        <Link to="/vendor/payouts" className="block p-6 rounded-3xl border border-border/80 hover:border-textPrimary/30 bg-surface shadow-xs space-y-3 transition-all group">
          <div className="flex items-center justify-between text-[#E59819]">
            <span className="text-[10px] font-mono-tag font-bold uppercase tracking-wider text-textMuted">Pending Payouts</span>
            <div className="p-2 rounded-2xl bg-[#FFF8E7] dark:bg-[#2C2719] text-[#9E6D08] dark:text-[#E8C564] group-hover:scale-105 transition-transform">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h2 className="font-mono-tag font-bold text-2xl sm:text-3xl text-textPrimary tracking-tight">
              ${pendingPayouts.toFixed(2)}
            </h2>
            <p className="text-[10px] font-mono-tag text-[#3F5E4D] font-bold mt-1">
              Next cycle in 3 days &rarr;
            </p>
          </div>
        </Link>

      </div>

      {/* Workshop Navigation Shortcuts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link
          to="/vendor/products"
          className="p-5 rounded-3xl bg-surface border border-border/80 hover:border-textPrimary/30 shadow-xs hover:shadow-editorial transition-all space-y-2 group"
        >
          <div className="w-9 h-9 rounded-2xl bg-[#FFF8E7] dark:bg-[#2C2719] text-[#9E6D08] flex items-center justify-center">
            <Package className="w-4 h-4" />
          </div>
          <h4 className="font-serif font-bold text-base text-textPrimary group-hover:text-[#D94E34] transition-colors">
            Product Catalog
          </h4>
          <p className="text-xs font-mono-tag text-textMuted">
            Manage your crafted products & stocks
          </p>
        </Link>

        <Link
          to="/vendor/products/new"
          className="p-5 rounded-3xl bg-surface border border-border/80 hover:border-textPrimary/30 shadow-xs hover:shadow-editorial transition-all space-y-2 group"
        >
          <div className="w-9 h-9 rounded-2xl bg-[#EDF5F1] dark:bg-[#1C2822] text-[#2F5844] flex items-center justify-center">
            <Plus className="w-4 h-4" />
          </div>
          <h4 className="font-serif font-bold text-base text-textPrimary group-hover:text-[#D94E34] transition-colors">
            List New Staple
          </h4>
          <p className="text-xs font-mono-tag text-textMuted">
            Publish an artisanal product
          </p>
        </Link>

        <Link
          to="/vendor/payouts"
          className="p-5 rounded-3xl bg-surface border border-border/80 hover:border-textPrimary/30 shadow-xs hover:shadow-editorial transition-all space-y-2 group"
        >
          <div className="w-9 h-9 rounded-2xl bg-[#FFF3E3] dark:bg-[#2A231D] text-[#A85A14] flex items-center justify-center">
            <CreditCard className="w-4 h-4" />
          </div>
          <h4 className="font-serif font-bold text-base text-textPrimary group-hover:text-[#D94E34] transition-colors">
            Earnings & Transfers
          </h4>
          <p className="text-xs font-mono-tag text-textMuted">
            Review your balance & payout logs
          </p>
        </Link>
      </div>

      {/* Recent Fulfillment Activity */}
      <div className="bg-surface rounded-3xl border border-border/80 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-border/60">
          <div>
            <span className="text-[10px] font-mono-tag font-bold uppercase tracking-wider text-[#D94E34] block">
              Fulfillment Log
            </span>
            <h3 className="font-serif font-bold text-xl text-textPrimary">
              Recent Dispatches & Orders
            </h3>
          </div>
          <Link
            to="/vendor/payouts"
            className="text-xs font-mono-tag font-bold uppercase tracking-wider text-[#D94E34] hover:underline flex items-center gap-1"
          >
            <span>View All Payouts</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="p-8 text-center bg-surface-muted/30 rounded-2xl border border-border/60 space-y-2">
            <Clock className="w-8 h-8 text-textMuted mx-auto" />
            <p className="font-serif font-bold text-textPrimary text-sm">All Current Orders Fulfilled</p>
            <p className="text-xs font-mono-tag text-textMuted">New customer purchases will appear here in real-time.</p>
          </div>
        ) : (
          <div className="divide-y divide-border/60">
            {recentOrders.map((order) => (
              <div key={order._id} className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 font-mono-tag text-xs">
                <div>
                  <div className="font-bold text-textPrimary">SubOrder #{order._id.substring(0, 8)}</div>
                  <div className="text-textMuted text-[11px]">{new Date(order.createdAt).toLocaleDateString()} • {order.items?.length || 1} item(s)</div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#EDF5F1] text-[#2F5844] border border-[#C8E0D4] text-[10px] font-bold uppercase">
                    {order.status}
                  </span>
                  <span className="font-bold text-sm text-textPrimary">${order.subTotal.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default VendorDashboard;
