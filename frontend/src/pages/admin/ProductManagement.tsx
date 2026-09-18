import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Package, 
  Search, 
  Trash2, 
  Eye, 
  EyeOff, 
  ExternalLink, 
  Store, 
  AlertTriangle
} from 'lucide-react';
import apiClient from '../../api/client';
import { useToastStore } from '../../store/toastStore';
import Button from '../../components/ui/Button';

interface AdminProduct {
  _id: string;
  name: string;
  category: string;
  basePrice: number;
  images: string[];
  isActive: boolean;
  vendor?: { _id: string; name: string; email: string };
  variants: Array<{ sku: string; stock: number }>;
  createdAt: string;
}

const getCategoryBadgeClass = (category: string) => {
  switch (category?.toLowerCase()) {
    case 'electronics':
      return 'bg-blue-50 text-blue-700 border-blue-200/90 dark:bg-blue-950/70 dark:text-blue-300 dark:border-blue-800';
    case 'fashion':
      return 'bg-rose-50 text-rose-700 border-rose-200/90 dark:bg-rose-950/70 dark:text-rose-300 dark:border-rose-800';
    case 'home':
      return 'bg-amber-50 text-amber-800 border-amber-200/90 dark:bg-amber-950/70 dark:text-amber-300 dark:border-amber-800';
    case 'beauty':
      return 'bg-emerald-50 text-emerald-800 border-emerald-200/90 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-800';
    default:
      return 'bg-purple-50 text-purple-700 border-purple-200/90 dark:bg-purple-950/70 dark:text-purple-300 dark:border-purple-800';
  }
};

const ProductManagement = () => {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deleteModalId, setDeleteModalId] = useState<string | null>(null);

  const addToast = useToastStore((state) => state.addToast);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/admin/products', {
        params: {
          search: search || undefined,
          category: categoryFilter !== 'all' ? categoryFilter : undefined,
          status: statusFilter !== 'all' ? statusFilter : undefined
        }
      });
      setProducts(res.data?.products || []);
    } catch (error) {
      console.error('Failed to fetch admin products', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [categoryFilter, statusFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProducts();
  };

  const handleToggleStatus = async (product: AdminProduct) => {
    try {
      const res = await apiClient.patch(`/admin/products/${product._id}/status`);
      const updatedProduct = res.data?.product;

      setProducts((prev) =>
        prev.map((p) => (p._id === product._id ? { ...p, isActive: updatedProduct?.isActive ?? !p.isActive } : p))
      );

      addToast({
        type: 'success',
        title: updatedProduct?.isActive ? 'Product Approved' : 'Product Suspended',
        message: `${product.name} is now ${updatedProduct?.isActive ? 'active in storefront' : 'hidden from public catalog'}.`
      });
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Status Update Failed',
        message: error.response?.data?.message || 'Could not update product status.'
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiClient.delete(`/admin/products/${id}`);
      setProducts((prev) => prev.filter((p) => p._id !== id));
      setDeleteModalId(null);
      addToast({
        type: 'success',
        title: 'Product Removed',
        message: 'Product removed permanently from platform.'
      });
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Delete Failed',
        message: error.response?.data?.message || 'Failed to delete product.'
      });
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-sora font-extrabold text-2xl sm:text-3xl text-textPrimary tracking-tight">
            Product Moderation
          </h1>
          <p className="text-sm text-textMuted mt-1">
            Review vendor catalog submissions, moderate items, and manage platform listings.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="px-3.5 py-1.5 rounded-xl bg-surface border border-border text-xs font-semibold text-textMuted">
            Total Listings: <strong className="text-textPrimary">{products.length}</strong>
          </span>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-surface rounded-2xl border border-border p-4 flex flex-col md:flex-row gap-4 items-center justify-between shadow-xs">
        <form onSubmit={handleSearch} className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-textMuted" />
          <input
            type="text"
            placeholder="Search products or vendors..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-transparent border border-gray-300 dark:border-gray-700 rounded-xl text-sm text-textPrimary placeholder:text-textMuted focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all"
          />
        </form>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-textMuted">Category:</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-bg border border-border rounded-xl px-3 py-2 text-xs font-semibold text-textPrimary focus:outline-hidden focus:border-purple-600"
            >
              <option value="all">All Categories</option>
              <option value="Electronics">Electronics</option>
              <option value="Fashion">Fashion</option>
              <option value="Home">Home & Living</option>
              <option value="Beauty">Beauty</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-textMuted">Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-bg border border-border rounded-xl px-3 py-2 text-xs font-semibold text-textPrimary focus:outline-hidden focus:border-purple-600"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active (Visible)</option>
              <option value="inactive">Suspended (Hidden)</option>
            </select>
          </div>

          <Button variant="secondary" size="sm" onClick={fetchProducts} className="rounded-xl text-xs">
            Refresh
          </Button>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-surface rounded-2xl border border-border shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-16 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600 mx-auto mb-3"></div>
            <p className="text-sm font-semibold text-textMuted">Loading platform products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-purple-100 dark:bg-purple-950/40 text-purple-600 mx-auto flex items-center justify-center">
              <Package className="w-7 h-7" />
            </div>
            <h3 className="font-sora font-bold text-lg text-textPrimary">No Products Found</h3>
            <p className="text-xs text-textMuted">No products match your current filtering criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50/80 dark:bg-gray-800/50 text-textMuted text-xs font-bold uppercase tracking-wider border-b border-border">
                <tr>
                  <th className="py-3.5 px-4">Product Details</th>
                  <th className="py-3.5 px-4">Vendor / Store</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Base Price</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {products.map((p) => {
                  return (
                    <tr key={p._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200'}
                            alt={p.name}
                            className="w-12 h-12 rounded-xl object-cover border border-border shrink-0"
                          />
                          <div className="max-w-xs">
                            <Link
                              to={`/products/${p._id}`}
                              className="font-sora font-bold text-textPrimary hover:text-purple-600 transition-colors line-clamp-1 flex items-center gap-1.5"
                            >
                              <span>{p.name}</span>
                              <ExternalLink className="w-3 h-3 opacity-50 shrink-0" />
                            </Link>
                            <span className="text-[11px] text-textMuted flex items-center gap-1 mt-0.5 font-mono">
                              ID: {p._id.substring(p._id.length - 8)}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1.5 text-textPrimary font-semibold text-xs">
                          <Store className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                          <span>{p.vendor?.name || 'Authorized Merchant'}</span>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <span className={`inline-flex px-2.5 py-1 rounded-lg border text-xs font-semibold uppercase tracking-wider ${getCategoryBadgeClass(p.category)}`}>
                          {p.category}
                        </span>
                      </td>

                      <td className="py-4 px-4">
                        <span className="font-sora font-bold text-textPrimary">
                          ${p.basePrice?.toFixed(2)}
                        </span>
                      </td>

                      <td className="py-4 px-4">
                        <button
                          onClick={() => handleToggleStatus(p)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            p.isActive
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300'
                          }`}
                        >
                          {p.isActive ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                          <span>{p.isActive ? 'Active (Public)' : 'Suspended (Hidden)'}</span>
                        </button>
                      </td>

                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setDeleteModalId(p._id)}
                            className="p-2 text-textMuted hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-colors cursor-pointer"
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
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

      {/* Delete Confirmation Modal */}
      {deleteModalId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1C1917]/30 backdrop-blur-xs">
          <div className="bg-surface border border-border/80 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-editorial animate-fade-in">
            <div className="w-12 h-12 rounded-2xl bg-[#FCEFEF] text-[#D94E34] border border-[#F2C7C4] flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="font-serif font-bold text-lg text-textPrimary">Delete Product?</h3>
              <p className="text-xs font-mono-tag text-textMuted mt-1">
                Are you sure you want to permanently delete this product from the platform catalog?
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                variant="secondary"
                fullWidth
                onClick={() => setDeleteModalId(null)}
                className="rounded-full font-mono-tag text-xs uppercase tracking-wider"
              >
                Cancel
              </Button>
              <Button
                fullWidth
                onClick={() => handleDelete(deleteModalId)}
                className="bg-[#D94E34] hover:bg-[#C03B22] text-[#FFF8E7] rounded-full font-mono-tag text-xs uppercase tracking-wider font-bold shadow-xs"
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ProductManagement;
