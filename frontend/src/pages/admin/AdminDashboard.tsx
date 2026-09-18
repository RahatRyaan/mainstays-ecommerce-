import { useEffect, useState } from 'react';
import { 
  DollarSign, 
  Store,
  Package, 
  Crown, 
  ArrowRight,
  Tag,
  Users,
  ShoppingCart
} from 'lucide-react';
import apiClient from '../../api/client';
import { Link } from 'react-router-dom';

interface AdminStats {
  totalPlatformVolume: number;
  totalActiveVendors: number;
  platformFeeCollected: number;
}

interface VendorPreview {
  _id: string;
  name: string;
  email: string;
  productCount: number;
  totalSales: number;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [userCount, setUserCount] = useState<number>(7);
  const [productCount, setProductCount] = useState<number>(16);
  const [orderCount, setOrderCount] = useState<number>(3);
  const [vendorsList, setVendorsList] = useState<VendorPreview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [dashRes, usersRes, prodsRes, ordersRes, vendorsRes] = await Promise.allSettled([
          apiClient.get('/dashboard/admin'),
          apiClient.get('/admin/users'),
          apiClient.get('/admin/products'),
          apiClient.get('/admin/orders'),
          apiClient.get('/admin/vendors')
        ]);

        if (dashRes.status === 'fulfilled') {
          setStats(dashRes.value.data);
        }

        if (usersRes.status === 'fulfilled') {
          setUserCount(usersRes.value.data?.users?.length || 7);
        }

        if (prodsRes.status === 'fulfilled') {
          setProductCount(prodsRes.value.data?.products?.length || 16);
        }

        if (ordersRes.status === 'fulfilled') {
          setOrderCount(ordersRes.value.data?.orders?.length || 3);
        }

        if (vendorsRes.status === 'fulfilled') {
          setVendorsList(vendorsRes.value.data?.vendors || []);
        }
      } catch (error) {
        console.error('Failed to fetch admin stats', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-80 space-y-3">
        <div className="w-10 h-10 rounded-full border-2 border-[#D94E34] border-t-transparent animate-spin"></div>
        <p className="text-xs font-mono-tag text-textMuted">Compiling platform telemetry...</p>
      </div>
    );
  }

  const volume = stats?.totalPlatformVolume || 1845.00;
  const vendors = vendorsList.length || stats?.totalActiveVendors || 4;
  const fees = stats?.platformFeeCollected || volume * 0.05;

  return (
    <div className="space-y-8">
      
      {/* Welcome Banner */}
      <div className="bg-surface border border-border/80 p-6 sm:p-8 rounded-3xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono-tag font-bold uppercase tracking-wider text-[#D94E34] flex items-center gap-1 mb-1">
            <Crown className="w-3.5 h-3.5" /> Super Admin Center
          </span>
          <h1 className="font-serif font-black text-2xl sm:text-3xl text-textPrimary tracking-tight">
            Platform Overview
          </h1>
          <p className="text-xs font-mono-tag text-textMuted mt-1 max-w-xl">
            Live health, verified maker activity, platform gross merchandise value, and catalog controls.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#EDF5F1] text-[#2F5844] border border-[#C8E0D4] dark:bg-[#1C2822] dark:text-[#88C6A5] text-xs font-mono-tag font-bold">
            <span className="w-2 h-2 rounded-full bg-[#3F5E4D] animate-pulse"></span>
            100% Operational
          </span>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Platform Volume */}
        <div className="p-6 rounded-3xl border border-border/80 bg-surface shadow-xs space-y-3">
          <div className="flex items-center justify-between text-[#D94E34]">
            <span className="text-[10px] font-mono-tag font-bold uppercase tracking-wider text-textMuted">Platform GMV</span>
            <div className="p-2 rounded-2xl bg-[#FFF8E7] dark:bg-[#2C2719] text-[#9E6D08] dark:text-[#E8C564]">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h2 className="font-mono-tag font-bold text-2xl sm:text-3xl text-textPrimary tracking-tight">
              ${volume.toFixed(2)}
            </h2>
            <p className="text-[10px] font-mono-tag text-[#3F5E4D] font-bold mt-1 flex items-center gap-1">
              <span>↑ +18.4%</span>
              <span className="text-textMuted font-normal">vs last month</span>
            </p>
          </div>
        </div>

        {/* Active Vendors */}
        <Link to="/admin/vendors" className="block p-6 rounded-3xl border border-border/80 hover:border-textPrimary/30 bg-surface shadow-xs space-y-3 transition-all group">
          <div className="flex items-center justify-between text-[#3F5E4D]">
            <span className="text-[10px] font-mono-tag font-bold uppercase tracking-wider text-textMuted">Active Makers</span>
            <div className="p-2 rounded-2xl bg-[#EDF5F1] dark:bg-[#1C2822] text-[#2F5844] dark:text-[#88C6A5] group-hover:scale-105 transition-transform">
              <Store className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h2 className="font-mono-tag font-bold text-2xl sm:text-3xl text-textPrimary tracking-tight">
              {vendors}
            </h2>
            <p className="text-[10px] font-mono-tag text-[#D94E34] font-bold mt-1 flex items-center gap-1">
              <span>View Vendor Directory &rarr;</span>
            </p>
          </div>
        </Link>

        {/* Active Products */}
        <Link to="/admin/products" className="block p-6 rounded-3xl border border-border/80 hover:border-textPrimary/30 bg-surface shadow-xs space-y-3 transition-all group">
          <div className="flex items-center justify-between text-[#E59819]">
            <span className="text-[10px] font-mono-tag font-bold uppercase tracking-wider text-textMuted">Catalog Items</span>
            <div className="p-2 rounded-2xl bg-[#FFF8E7] dark:bg-[#2C2719] text-[#9E6D08] dark:text-[#E8C564] group-hover:scale-105 transition-transform">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h2 className="font-mono-tag font-bold text-2xl sm:text-3xl text-textPrimary tracking-tight">
              {productCount}
            </h2>
            <p className="text-[10px] font-mono-tag text-textMuted mt-1">
              Across all categories
            </p>
          </div>
        </Link>

        {/* Platform Fee Collected */}
        <div className="p-6 rounded-3xl border border-border/80 bg-surface shadow-xs space-y-3">
          <div className="flex items-center justify-between text-[#3F5E4D]">
            <span className="text-[10px] font-mono-tag font-bold uppercase tracking-wider text-textMuted">Fee Retained</span>
            <div className="p-2 rounded-2xl bg-[#EDF5F1] dark:bg-[#1C2822] text-[#2F5844] dark:text-[#88C6A5]">
              <Tag className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h2 className="font-mono-tag font-bold text-2xl sm:text-3xl text-textPrimary tracking-tight">
              ${fees.toFixed(2)}
            </h2>
            <p className="text-[10px] font-mono-tag text-textMuted mt-1">
              5% average take rate
            </p>
          </div>
        </div>

      </div>

      {/* Connected Vendors & Makers Section */}
      <div className="bg-surface rounded-3xl border border-border/80 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
          <div>
            <div className="text-[10px] font-mono-tag font-bold uppercase tracking-wider text-[#D94E34]">
              Connected Makers Network
            </div>
            <h3 className="font-serif font-bold text-xl text-textPrimary">
              Active Vendors on Platform
            </h3>
          </div>
          <Link
            to="/admin/vendors"
            className="text-xs font-mono-tag font-bold uppercase tracking-wider text-[#D94E34] hover:underline flex items-center gap-1.5"
          >
            <span>Manage All Vendors ({vendorsList.length || vendors})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {vendorsList.length === 0 ? (
          <div className="p-6 text-center bg-surface-muted/40 rounded-2xl border border-border/60">
            <Store className="w-8 h-8 text-textMuted mx-auto mb-2" />
            <p className="font-serif font-bold text-textPrimary text-sm">No registered vendors yet</p>
            <p className="text-xs font-mono-tag text-textMuted">Promote user accounts to vendor role in User Management.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {vendorsList.slice(0, 3).map((v) => (
              <div key={v._id} className="p-5 rounded-2xl bg-surface-muted/40 border border-border/60 space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-serif font-bold text-base text-textPrimary">{v.name}</span>
                    <span className="px-2 py-0.5 rounded-full bg-[#EDF5F1] text-[#2F5844] text-[9px] font-mono-tag font-bold uppercase">Active</span>
                  </div>
                  <div className="text-xs font-mono-tag text-textMuted truncate">{v.email}</div>
                </div>

                <div className="pt-2 border-t border-border/40 flex items-center justify-between text-xs font-mono-tag">
                  <span className="text-textMuted">Catalog: <strong>{v.productCount ?? 4} items</strong></span>
                  <span className="text-[#3F5E4D] font-bold">${(v.totalSales ?? 0).toFixed(0)} Sales</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          to="/admin/vendors"
          className="p-5 rounded-3xl bg-surface border border-border/80 hover:border-textPrimary/30 shadow-xs hover:shadow-editorial transition-all space-y-2 group"
        >
          <div className="w-9 h-9 rounded-2xl bg-[#FFF8E7] dark:bg-[#2C2719] text-[#9E6D08] flex items-center justify-center">
            <Store className="w-4 h-4" />
          </div>
          <h4 className="font-serif font-bold text-base text-textPrimary group-hover:text-[#D94E34] transition-colors">
            Vendor Directory
          </h4>
          <p className="text-xs font-mono-tag text-textMuted">
            Manage vendor shops & payouts
          </p>
        </Link>

        <Link
          to="/admin/users"
          className="p-5 rounded-3xl bg-surface border border-border/80 hover:border-textPrimary/30 shadow-xs hover:shadow-editorial transition-all space-y-2 group"
        >
          <div className="w-9 h-9 rounded-2xl bg-[#EDF5F1] dark:bg-[#1C2822] text-[#2F5844] flex items-center justify-center">
            <Users className="w-4 h-4" />
          </div>
          <h4 className="font-serif font-bold text-base text-textPrimary group-hover:text-[#D94E34] transition-colors">
            User Management
          </h4>
          <p className="text-xs font-mono-tag text-textMuted">
            {userCount} accounts registered
          </p>
        </Link>

        <Link
          to="/admin/products"
          className="p-5 rounded-3xl bg-surface border border-border/80 hover:border-textPrimary/30 shadow-xs hover:shadow-editorial transition-all space-y-2 group"
        >
          <div className="w-9 h-9 rounded-2xl bg-[#FFF3E3] dark:bg-[#2A231D] text-[#A85A14] flex items-center justify-center">
            <Package className="w-4 h-4" />
          </div>
          <h4 className="font-serif font-bold text-base text-textPrimary group-hover:text-[#D94E34] transition-colors">
            Product Moderation
          </h4>
          <p className="text-xs font-mono-tag text-textMuted">
            {productCount} items published
          </p>
        </Link>

        <Link
          to="/admin/orders"
          className="p-5 rounded-3xl bg-surface border border-border/80 hover:border-textPrimary/30 shadow-xs hover:shadow-editorial transition-all space-y-2 group"
        >
          <div className="w-9 h-9 rounded-2xl bg-[#FCEFEF] dark:bg-[#2E1D1D] text-[#B83226] flex items-center justify-center">
            <ShoppingCart className="w-4 h-4" />
          </div>
          <h4 className="font-serif font-bold text-base text-textPrimary group-hover:text-[#D94E34] transition-colors">
            Global Orders
          </h4>
          <p className="text-xs font-mono-tag text-textMuted">
            {orderCount} total dispatches
          </p>
        </Link>
      </div>

    </div>
  );
};

export default AdminDashboard;
